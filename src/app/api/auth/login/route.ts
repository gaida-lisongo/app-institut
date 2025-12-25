import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils } from '@/lib/auth/jwt';
import AgentControllers from '@/lib/controllers/AgentControllers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'ID agent requis' },
        { status: 400 }
      );
    }

    // Vérifier si c'est un format matricule:password
    if (agentId.includes(':')) {
      const [matricule, secure] = agentId.split(':');
      
      // Faire l'appel vers l'endpoint externe
      const externalResponse = await fetch('http://localhost:3001/api/v1/agents/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matricule, secure }),
      });

      const externalData = await externalResponse.json();

      if (externalResponse.ok && externalData.success) {
        // Utiliser les données de l'endpoint externe
        const response = NextResponse.json(
          { 
            success: true, 
            data: {
              agent: externalData.data.agent,
              autorisations: externalData.data.autorisations,
              token: externalData.data.token
            }
          },
          { status: 200 }
        );

        // Définir le cookie d'authentification avec le token externe
        const cookieOptions = {
          httpOnly: true,
          secure: false,
          sameSite: 'lax' as const,
          maxAge: 7 * 24 * 60 * 60, // 7 jours
          path: '/'
        };
        
        response.cookies.set('auth-token', externalData.data.token, cookieOptions);
        return response;
      } else {
        return NextResponse.json(
          { success: false, error: externalData.message || 'Authentification échouée' },
          { status: 401 }
        );
      }
    }

    // Sinon, utiliser l'ancienne méthode avec l'ID simple
    const result = await AgentControllers.loginAgentById(agentId);
    
    if (!result.agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      );
    }

    // Générer le token JWT
    const tokenPayload = {
      userId: result.agent._id.toString(),
      email: result.agent.email,
      role: 'agent'
    };
    console.log('POST /api/auth/login - Génération token pour:', tokenPayload);
    const token = await JWTUtils.generateToken(tokenPayload);
    console.log('- Token généré:', token ? 'succès' : 'échec');

    // Créer la réponse avec le token dans un cookie
    const response = NextResponse.json(
      { 
        success: true, 
        data: {
          agent: result.agent,
          autorisations: result.autorisations,
          token
        }
      },
      { status: 200 }
    );

    // Définir le cookie d'authentification
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Désactivé en développement
      sameSite: 'lax' as const, // Plus permissif pour le développement
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/' // Assurer que le cookie est disponible sur tout le site
    };
    
    console.log('- Configuration cookie:', cookieOptions);
    response.cookies.set('auth-token', token, cookieOptions);
    console.log('- Cookie défini avec succès');

    return response;

  } catch (error: any) {
    console.error('Erreur lors de l\'authentification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Route pour vérifier le token
export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    console.log('GET /api/auth/login - Debug:');
    console.log('- Cookie token:', cookieToken ? 'présent' : 'absent');
    console.log('- Header token:', headerToken ? 'présent' : 'absent');
    console.log('- Token utilisé:', token ? 'présent' : 'absent');

    if (!token) {
      console.log('- Erreur: Aucun token trouvé');
      return NextResponse.json(
        { success: false, error: 'Aucun token trouvé' },
        { status: 401 }
      );
    }

    console.log('- Tentative de vérification du token...');
    const payload = await JWTUtils.verifyToken(token);
    console.log('- Token vérifié avec succès:', payload.userId);
    
    return NextResponse.json(
      { success: true, data: payload },
      { status: 200 }
    );

  } catch (error: any) {
    console.log('- Erreur lors de la vérification:', error.message);
    return NextResponse.json(
      { success: false, error: `Token invalide: ${error.message}` },
      { status: 401 }
    );
  }
}

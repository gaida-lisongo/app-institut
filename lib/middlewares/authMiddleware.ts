import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils, TokenPayload } from '@/lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export class AuthMiddleware {
  /**
   * Middleware pour vérifier l'authentification sur les routes API
   * Protège les méthodes POST, PUT, DELETE
   */
  static async verifyApiAuth(request: NextRequest): Promise<NextResponse | null> {
    const method = request.method;
    
    // Seules les méthodes POST, PUT, DELETE nécessitent une authentification
    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return null; // Laisser passer les GET
    }

    try {
      const token = this.extractToken(request);
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Token d\'authentification requis' },
          { status: 401 }
        );
      }

      const payload = JWTUtils.verifyToken(token);
      
      // Ajouter les informations utilisateur à la requête
      // Note: NextRequest n'est pas extensible, on utilisera les headers
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-email', payload.email || '');
      response.headers.set('x-user-role', payload.role || '');
      
      return null; // Laisser passer la requête
      
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  }

  /**
   * Middleware pour vérifier l'authentification sur les pages admin
   */
  static async verifyPageAuth(request: NextRequest): Promise<NextResponse | null> {
    // Cette fonction est appelée seulement pour les routes qui nécessitent une auth
    // Pas besoin de re-vérifier si c'est une page admin

    try {
      const token = this.extractToken(request);
      
      if (!token) {
        // Rediriger vers la page de connexion
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      const payload = JWTUtils.verifyToken(token);
      
      // Vérifier les permissions si nécessaire
      // if (payload.role !== 'admin') {
      //   return NextResponse.redirect(new URL('/unauthorized', request.url));
      // }
      
      return null; // Laisser passer
      
    } catch (error) {
      // Token invalide, rediriger vers la page de connexion
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  /**
   * Extraire le token de la requête
   */
  private static extractToken(request: NextRequest): string | null {
    // Vérifier dans les headers Authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Vérifier dans les cookies
    const tokenCookie = request.cookies.get('auth-token');
    if (tokenCookie) {
      return tokenCookie.value;
    }

    return null;
  }

  /**
   * Utilitaire pour extraire les informations utilisateur des headers
   */
  static getUserFromHeaders(request: NextRequest): TokenPayload | null {
    const userId = request.headers.get('x-user-id');
    const email = request.headers.get('x-user-email');
    const role = request.headers.get('x-user-role');

    if (!userId) return null;

    return {
      userId,
      email: email || undefined,
      role: role || undefined
    };
  }
}

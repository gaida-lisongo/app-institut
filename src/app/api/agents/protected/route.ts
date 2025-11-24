import AgentControllers from '@/lib/controllers/AgentControllers';
import { NextRequest, NextResponse } from 'next/server';
import { IAgent, AgentData, CreateAgentData } from '@/models/Agent';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/withAuth';

// GET /api/agents/protected - Récupérer les agents (pas d'auth requise pour GET)
export async function GET(request: NextRequest) {
    try {
        const code = request.nextUrl.searchParams.get('grade');

        if (!code) {
            const agents = await AgentControllers.getAllAgents();
            return NextResponse.json(
                { success: true, data: agents },
                { status: 200 }
            );
        } else {
            const agents = await AgentControllers.getAgentsByGradeCode(code as string);
            
            return NextResponse.json(
                { success: true, data: agents },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// POST /api/agents/protected - Créer un nouveau agent (AUTH REQUISE)
export const POST = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        
        // Vous pouvez accéder aux informations de l'utilisateur authentifié
        console.log('Agent créé par:', request.user.userId);
        
        const agent = await AgentControllers.createAgent(body as CreateAgentData);
        
        return NextResponse.json(
            { success: true, data: agent },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
});

// PUT /api/agents/protected - Modifier un agent (AUTH REQUISE)
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        console.log("Agent modifié par:", request.user.userId);
        
        const { _id: id, ...updateData } = body;
        const agent = await AgentControllers.updateAgent(id, updateData as Partial<CreateAgentData>);
        
        return NextResponse.json(
            { success: true, data: agent },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Erreur lors de la modification de l\'agent:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
});

// DELETE /api/agents/protected - Supprimer un agent (AUTH REQUISE)
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
    try {
        const body = await request.json();
        console.log("Agent supprimé par:", request.user.userId);
        
        const agent = await AgentControllers.deleteAgent(body.id);
        
        return NextResponse.json(
            { success: true, data: agent },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
});

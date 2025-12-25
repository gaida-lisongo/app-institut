import AgentController from '@/lib/controllers/AgentControllers';
import { NextRequest, NextResponse } from 'next/server';
import { IAgent, AgentData, CreateAgentData } from '@/models/Agent';
import { initializeModels } from '@/lib/initModels';

// GET /api/agents?grade=<code> - Récupérer les agents d'un type spécifique
export async function GET(request: NextRequest) {
    try {
        await initializeModels();
        const code = request.nextUrl.searchParams.get('grade');

        if (!code) {
            const agents = await AgentController.getAllAgents();
            return NextResponse.json(
                { success: true, data: agents },
                { status: 200 }
            );
        } else {
            const agents = await AgentController.getAgentsByGradeCode(code as string);
            
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

// POST /api/agents - Créer un nouveau agent
export async function POST(request: NextRequest) {
    try {
        await initializeModels();
        const body = await request.json();
        const agent = await AgentController.createAgent(body as CreateAgentData);
        
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
}

// UPDATE /api/agents - Modifier un agent dont les infos sont portés dans le body
export async function PUT(request: NextRequest) {
    try {
        await initializeModels();
        const body = await request.json();
        console.log("body to update :", body);
        const { _id: id, ...updateData } = body;
        const agent = await AgentController.updateAgent(id, updateData as Partial<CreateAgentData>);
        
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
}

// DELETE /api/agents - Supprimer un agent dont l'id est porté dans le body
export async function DELETE(request: NextRequest) {
    try {
        await initializeModels();
        const body = await request.json();
        const agent = await AgentController.deleteAgent(body.id);
        
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
}

//FETCH /api/agents/- Récupérer un agent spécifique, body : {id}
export async function FETCH(request: NextRequest) {
    try {
        await initializeModels();
        const body = await request.json();
        const agent = await AgentController.loginAgentById(body.id);
        
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
}
import AutorisationControllers from "@/lib/controllers/AutorisationControllers";
import { NextRequest, NextResponse } from "next/server";
import { IAutorisation, AutorisationData, CreateAutorisationData } from "@/models/Autorisation";

//GET /api/autorisations
/*
    query param : 
        agentID : string = to fetch autorisation of agent
        '' = to fetch all autorisation

*/
export async function GET(request: NextRequest) {
    try {
        const agentID = request.nextUrl.searchParams.get('agentID');
        if (agentID) {
            const autorisation = await AutorisationControllers.getAutorisationsByAgentID(agentID);
            return NextResponse.json(
                { success: true, data: autorisation },
                { status: 200 }
            );
        } else {
            const autorisations = await AutorisationControllers.getAllAutorisations();
            return NextResponse.json(
                { success: true, data: autorisations },
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

//POST /api/autorisations
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const autorisation = await AutorisationControllers.createAutorisation(body as CreateAutorisationData);
        return NextResponse.json(
            { success: true, data: autorisation },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

//PUT /api/autorisations
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { _id: id, ...updateData } = body;
        const autorisation = await AutorisationControllers.updateAutorisation(id, updateData as Partial<CreateAutorisationData>);
        return NextResponse.json(
            { success: true, data: autorisation },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Erreur lors de la modification de l\'autorisation:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

//DELETE /api/autorisations
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const autorisation = await AutorisationControllers.deleteAutorisation(body.id);
        return NextResponse.json(
            { success: true, data: autorisation },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
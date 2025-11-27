import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Filiere } from '@/models/Mention';
import { Types } from 'mongoose';

// POST - Ajouter un membre au bureau
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { agentId, role } = await request.json();

        if (!agentId || !role) {
            return NextResponse.json({
                success: false,
                error: 'Agent ID et rôle sont requis'
            }, { status: 400 });
        }

        const filiere = await Filiere.findById(params.id);

        if (!filiere) {
            return NextResponse.json({
                success: false,
                error: 'Filière non trouvée'
            }, { status: 404 });
        }

        // Vérifier si l'agent n'est pas déjà membre
        const isAlreadyMember = filiere.bureau.some(
            (member: any) => member.agent.toString() === agentId
        );

        if (isAlreadyMember) {
            return NextResponse.json({
                success: false,
                error: 'Cet agent est déjà membre du bureau'
            }, { status: 400 });
        }

        // Ajouter le membre
        filiere.bureau.push({
            agent: new Types.ObjectId(agentId),
            role: role
        });

        await filiere.save();

        return NextResponse.json({
            success: true,
            data: filiere,
            message: 'Membre ajouté avec succès au bureau'
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne du serveur'
        }, { status: 500 });
    }
}

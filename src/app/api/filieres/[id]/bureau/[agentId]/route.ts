import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Filiere } from '@/models/Mention';

// DELETE - Retirer un membre du bureau
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; agentId: string } }
) {
    try {
        await dbConnect();

        const filiere = await Filiere.findById(params.id);

        if (!filiere) {
            return NextResponse.json({
                success: false,
                error: 'Filière non trouvée'
            }, { status: 404 });
        }

        // Trouver l'index du membre à supprimer
        const memberIndex = filiere.bureau.findIndex(
            (member: any) => member.agent.toString() === params.agentId
        );

        if (memberIndex === -1) {
            return NextResponse.json({
                success: false,
                error: 'Membre non trouvé dans le bureau'
            }, { status: 404 });
        }

        // Retirer le membre
        filiere.bureau.splice(memberIndex, 1);
        await filiere.save();

        return NextResponse.json({
            success: true,
            data: filiere,
            message: 'Membre retiré avec succès du bureau'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne du serveur'
        }, { status: 500 });
    }
}

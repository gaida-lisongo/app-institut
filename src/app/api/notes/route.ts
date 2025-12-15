import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET(req: NextRequest) {
    try {
        await connectMongo();

        const { searchParams } = new URL(req.url);
        const etudiantId = searchParams.get('etudiantId');
        const promotionId = searchParams.get('promotionId');

        if (!etudiantId || !promotionId) {
            return NextResponse.json(
                { success: false, error: 'Paramètres manquants' },
                { status: 400 }
            );
        }

        // Récupérer les notes de l'étudiant pour cette promotion
        const notes = await Note.find({
            etudiantId: etudiantId,
            promotionId: promotionId
        }).populate('matiereId');

        return NextResponse.json({
            success: true,
            data: notes
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

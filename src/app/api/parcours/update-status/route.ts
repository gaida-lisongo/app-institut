import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Etudiant from '@/models/Etudiant';
import Parcours from '@/models/Parcours';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { matricule, status, promotionId } = await req.json();

        if (!matricule || !status || !promotionId) {
            return NextResponse.json({ message: 'Matricule, status, and promotionId are required' }, { status: 400 });
        }

        const student = await Etudiant.findOne({ matricule });

        if (!student) {
            return NextResponse.json({ message: `Student with matricule ${matricule} not found` }, { status: 404 });
        }

        const newStatus = status.trim().toUpperCase() === 'OK' ? 'Terminé' : 'Annulé';

        const result = await Parcours.updateOne(
            { etudiantId: student._id, promotionId: promotionId },
            { $set: { statut: newStatus } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: `Parcours not found for student ${matricule} in promotion ${promotionId}` }, { status: 404 });
        }

        return NextResponse.json({succes: true, message: 'Parcours status updated successfully', data: result }, { status: 200 });

    } catch (error) {
        console.error('Error updating parcours status:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

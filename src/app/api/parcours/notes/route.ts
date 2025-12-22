import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Parcours from '@/models/Parcours';
import mongoose from 'mongoose';

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { parcoursId, matiereId, cmi, examen, rattrapage } = body;

        if (!parcoursId || !matiereId) {
            return NextResponse.json(
                { success: false, error: 'ParcoursId et MatiereId requis' },
                { status: 400 }
            );
        }

        // Trouver le parcours
        const parcours = await Parcours.findById(parcoursId);
        if (!parcours) {
            return NextResponse.json(
                { success: false, error: 'Parcours non trouvé' },
                { status: 404 }
            );
        }

        // Initialiser le tableau de notes s'il n'existe pas
        if (!parcours.notes) {
            parcours.notes = [];
        }

        // Chercher si une note existe déjà pour cette matière
        const noteIndex = parcours.notes.findIndex((n) => n.matiereId.toString() === matiereId);

        if (noteIndex > -1) {
            // Mise à jour de la note existante
            if (cmi !== undefined) parcours.notes[noteIndex].cmi = cmi;
            if (examen !== undefined) parcours.notes[noteIndex].examen = examen;
            if (rattrapage !== undefined) parcours.notes[noteIndex].rattrapage = rattrapage;
        } else {
            // Création d'une nouvelle note
            parcours.notes.push({
                matiereId: new mongoose.Types.ObjectId(matiereId),
                cmi: cmi || 0,
                examen: examen || 0,
                rattrapage: rattrapage || 0
            });
        }

        await parcours.save();

        return NextResponse.json({
            success: true,
            data: parcours,
            message: 'Note mise à jour avec succès'
        });

    } catch (error: any) {
        console.error('Erreur update note:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

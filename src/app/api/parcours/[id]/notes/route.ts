import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import initializeModels from "@/lib/initModels";
import Parcours from "@/models/Parcours";

export async function PUT(req: NextRequest,
  { params }: { params: Promise<{ id: string }>}){
    try {
        await dbConnect();
        initializeModels();

        const {id} = await params;

        const reqBody = await req.json();
        const currentParcour = await Parcours.findById(id);

        if(!currentParcour){
            return NextResponse.json({
                success: false,
                error: 'Parcours not found'
            }, { status: 404 });
        }

        const lastNotes : any[] = currentParcour.notes || [];

        //Check if the notes already exist for this matiere
        const existingNoteIndex = lastNotes.findIndex(note => note.matiereId === reqBody.matiereId);

        const newNote = {
            matiereId: reqBody.matiereId,
            cmi: reqBody.cmi || 0,
            examen: reqBody.examen || 0,
            rattrapage: reqBody.rattrapage || 0
        };

        if(existingNoteIndex >= 0){
            // Mettre à jour la note existante
            lastNotes[existingNoteIndex] = newNote;
        } else {
            // Ajouter une nouvelle note
            lastNotes.push(newNote);
        }

        currentParcour.notes = lastNotes;

        await currentParcour.save();

        return NextResponse.json({
            success: true,
            message: 'Note created successfully',
            data: currentParcour
        }, { status: 201 });
    } catch (error) {
        console.error('Error when creating note : ', error);
        return NextResponse.json({
            success: false,
            error: 'Error when creating note'
        }, { status: 500 });
        
    }
}
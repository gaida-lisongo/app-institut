import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import Questionnaire from '@/models/Questionnaire';

// GET - Récupérer un questionnaire par ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        await initializeModels();
        
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'ID invalide' },
                { status: 400 }
            );
        }

        const questionnaire = await Questionnaire.findById(id)
            .populate('activityId', 'title description type maximumScore');

        if (!questionnaire) {
            return NextResponse.json(
                { success: false, error: 'Questionnaire non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: questionnaire
        });

    } catch (error) {
        console.error('Erreur API questionnaire GET par ID:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite' 
            },
            { status: 500 }
        );
    }
}

// PUT - Mettre à jour un questionnaire
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        await initializeModels();
        
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'ID invalide' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { 
            dateRemise, 
            maximumScore, 
            devoir, 
            tp, 
            projet, 
            qcm,
            status
        } = body;

        // Vérifier si le questionnaire existe
        const existingQuestionnaire = await Questionnaire.findById(id);
        if (!existingQuestionnaire) {
            return NextResponse.json(
                { success: false, error: 'Questionnaire non trouvé' },
                { status: 404 }
            );
        }

        // Préparer les données de mise à jour
        const updateData: any = {};
        if (dateRemise !== undefined) updateData.dateRemise = new Date(dateRemise);
        if (maximumScore !== undefined) updateData.maximumScore = maximumScore;
        if (status !== undefined) updateData.status = status;
        if (devoir !== undefined) updateData.devoir = devoir;
        if (tp !== undefined) updateData.tp = tp;
        if (projet !== undefined) updateData.projet = projet;
        if (qcm !== undefined) updateData.qcm = qcm;

        // Mettre à jour le questionnaire
        const updatedQuestionnaire = await Questionnaire.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('activityId', 'title description type maximumScore');

        return NextResponse.json({
            success: true,
            data: updatedQuestionnaire
        });

    } catch (error) {
        console.error('Erreur API questionnaire PUT:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite' 
            },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer un questionnaire
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        await initializeModels();
        
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'ID invalide' },
                { status: 400 }
            );
        }

        const questionnaire = await Questionnaire.findById(id);
        if (!questionnaire) {
            return NextResponse.json(
                { success: false, error: 'Questionnaire non trouvé' },
                { status: 404 }
            );
        }

        await Questionnaire.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Questionnaire supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur API questionnaire DELETE:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite' 
            },
            { status: 500 }
        );
    }
}
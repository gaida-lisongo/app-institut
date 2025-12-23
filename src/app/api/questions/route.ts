import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import Questionnaire from '@/models/Questionnaire';
import { Activity } from '@/models/Charge';

// GET - Récupérer les questionnaires
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const activityId = searchParams.get('activityId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Si un ID est fourni, retourner ce questionnaire spécifique
        if (id) {
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
        }

        // Si un activityId est fourni, retourner le questionnaire de cette activité
        if (activityId) {
            if (!mongoose.Types.ObjectId.isValid(activityId)) {
                return NextResponse.json(
                    { success: false, error: 'ID d\'activité invalide' },
                    { status: 400 }
                );
            }

            const questionnaire = await Questionnaire.findOne({ activityId })
                .populate('activityId', 'title description type maximumScore');

            if (!questionnaire) {
                return NextResponse.json(
                    { success: false, error: 'Aucun questionnaire trouvé pour cette activité' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: questionnaire
            });
        }

        // Construction du filtre
        const filter: any = {};
        if (status) filter.status = status;

        // Calcul de la pagination
        const skip = (page - 1) * limit;

        // Construction du tri
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Exécution de la requête avec pagination
        const [questionnaires, total] = await Promise.all([
            Questionnaire.find(filter)
                .populate('activityId', 'title description type maximumScore')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Questionnaire.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: questionnaires,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Erreur API questions GET:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite' 
            },
            { status: 500 }
        );
    }
}

// POST - Créer un nouveau questionnaire
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const body = await request.json();
        const { 
            activityId, 
            dateRemise, 
            maximumScore, 
            devoir, 
            travailPratique, 
            projet, 
            qcm,
            status = 'pending'
        } = body;

        // Validation des champs obligatoires
        if (!activityId || !dateRemise || !maximumScore) {
            return NextResponse.json(
                { success: false, error: 'Les champs activityId, dateRemise et maximumScore sont obligatoires' },
                { status: 400 }
            );
        }

        // Vérifier que l'activité existe
        if (!mongoose.Types.ObjectId.isValid(activityId)) {
            return NextResponse.json(
                { success: false, error: 'ID d\'activité invalide' },
                { status: 400 }
            );
        }

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return NextResponse.json(
                { success: false, error: 'Activité non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier qu'il n'existe pas déjà un questionnaire pour cette activité
        const existingQuestionnaire = await Questionnaire.findOne({ activityId });
        if (existingQuestionnaire) {
            return NextResponse.json(
                { success: false, error: 'Un questionnaire existe déjà pour cette activité' },
                { status: 409 }
            );
        }

        // Validation du contenu (au moins un type de questionnaire doit être fourni)
        if (!devoir && !travailPratique && !projet && !qcm) {
            return NextResponse.json(
                { success: false, error: 'Au moins un type de questionnaire doit être fourni (devoir, travailPratique, projet, ou qcm)' },
                { status: 400 }
            );
        }

        // Créer le questionnaire
        const questionnaireData: any = {
            activityId,
            dateRemise: new Date(dateRemise),
            maximumScore,
            status
        };

        // Ajouter seulement les champs définis pour éviter les erreurs de validation
        if (devoir) questionnaireData.devoir = devoir;
        if (travailPratique) questionnaireData.travailPratique = travailPratique;
        if (projet) questionnaireData.projet = projet;
        if (qcm) questionnaireData.qcm = qcm;

        const newQuestionnaire = new Questionnaire(questionnaireData);

        await newQuestionnaire.save();

        // Populate pour la réponse
        const populatedQuestionnaire = await Questionnaire.findById(newQuestionnaire._id)
            .populate('activityId', 'title description type maximumScore');

        return NextResponse.json({
            success: true,
            data: populatedQuestionnaire,
            message: 'Questionnaire créé avec succès'
        }, { status: 201 });

    } catch (error) {
        console.error('Erreur API questions POST:', error);
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
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID du questionnaire requis' },
                { status: 400 }
            );
        }

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
            travailPratique, 
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
        if (travailPratique !== undefined) updateData.travailPratique = travailPratique;
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
            data: updatedQuestionnaire,
            message: 'Questionnaire mis à jour avec succès'
        });

    } catch (error) {
        console.error('Erreur API questions PUT:', error);
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
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID du questionnaire requis' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'ID invalide' },
                { status: 400 }
            );
        }

        // Vérifier si le questionnaire existe
        const questionnaire = await Questionnaire.findById(id);
        if (!questionnaire) {
            return NextResponse.json(
                { success: false, error: 'Questionnaire non trouvé' },
                { status: 404 }
            );
        }

        // Empêcher la suppression des questionnaires avec statut 'ok' (optionnel)
        if (questionnaire.status === 'ok') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Impossible de supprimer un questionnaire validé. Changez d\'abord le statut.' 
                },
                { status: 400 }
            );
        }

        // Supprimer le questionnaire
        await Questionnaire.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Questionnaire supprimé avec succès',
            deletedId: id
        });

    } catch (error) {
        console.error('Erreur API questions DELETE:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite' 
            },
            { status: 500 }
        );
    }
}
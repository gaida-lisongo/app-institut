import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Charge, Activity} from '@/models/Charge';
import mongoose from 'mongoose';

// GET - Récupérer les charges horaires
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();
    
    const activities = await Activity.find()
    .populate({
        path: 'resolutions.student',
    })
    .sort({ createdAt: -1 });

    return NextResponse.json({
    success: true,
    data: activities,
    total: activities.length
    });

  } catch (error) {
    console.error('Erreur API charges GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle charge horaire
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const {
      title,
      description,
      type,
      maximumScore,
      resolutions = [],
      chargeId
    } = body;

    // Validation des champs obligatoires
    if (!title || !chargeId || !description || !type || !maximumScore) {
      return NextResponse.json(
        { success: false, error: 'Titre, description, type et score maximum sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation des IDs
    if (!mongoose.Types.ObjectId.isValid(chargeId)) {
      return NextResponse.json(
        { success: false, error: 'ID charge invalide' },
        { status: 400 }
      );
    }

    // Créer la nouvelle charge
    const newActivity = new Activity({
        title: title.trim(),
        description: description.trim(),
        type: type.trim(),
        maximumScore,
        resolutions
    });

    const savedActivity = await newActivity.save();

    // Ajouter l'activité à la charge horaire
    const charge = await Charge.findById(chargeId);
    if (!charge) {
      return NextResponse.json(
        { success: false, error: 'Charge horaire non trouvée' },
        { status: 404 }
      );
    }

    charge.activities.push(savedActivity._id);
    
    await charge.save();

    return NextResponse.json({
      success: true,
      data: savedActivity,
      message: 'Activité créée avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API charges POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une charge horaire
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const {
        id,
        title,
        description,
        type,
        maximumScore,
        status,
        resolutions = [],
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la charge requis' },
        { status: 400 }
      );
    }

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'activité existe
    const existingActivity = await Activity.findById(id);
    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Activité non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (type) updateData.type = type.trim();
    if (maximumScore !== undefined) updateData.maximumScore = maximumScore;
    if (status) updateData.status = status;
    if (resolutions) updateData.resolutions = resolutions;
    // Mettre à jour l'activité
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('resolutions.student');

    return NextResponse.json({
      success: true,
      data: updatedActivity,
      message: 'Activité mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API charges PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Ajouter une résolution à une activité
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const {
      activityId,
      studentId,
      score
    } = body;

    if (!activityId || !studentId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'activityId, studentId et score sont requis' },
        { status: 400 }
      );
    }

    // Validation des IDs
    if (!mongoose.Types.ObjectId.isValid(activityId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { success: false, error: 'IDs invalides' },
        { status: 400 }
      );
    }

    // Trouver l'activité
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activité non trouvée' },
        { status: 404 }
      );
    }

    // Validation du score
    if (typeof score !== 'number' || score < 0 || score > Number(activity.maximumScore)) {
      return NextResponse.json(
        { success: false, error: `Le score doit être un nombre entre 0 et ${activity.maximumScore}` },
        { status: 400 }
      );
    }

    // Vérifier si l'étudiant a déjà une résolution pour cette activité
    const existingResolutionIndex = activity.resolutions.findIndex(
      resolution => resolution.student.toString() === studentId
    );

    if (existingResolutionIndex !== -1) {
      // Mettre à jour la résolution existante
      activity.resolutions[existingResolutionIndex].score = score;
      activity.resolutions[existingResolutionIndex].dateSubmitted = new Date();
    } else {
      // Ajouter une nouvelle résolution
      activity.resolutions.push({
        student: new mongoose.Types.ObjectId(studentId),
        score,
        dateSubmitted: new Date()
      });
    }

    // Sauvegarder l'activité
    const savedActivity = await activity.save();

    // Peupler les données pour la réponse
    const populatedActivity = await Activity.findById(activityId)
      .populate('resolutions.student');

    return NextResponse.json({
      success: true,
      data: populatedActivity,
      message: existingResolutionIndex !== -1 ? 'Résolution mise à jour avec succès' : 'Résolution ajoutée avec succès'
    });
  } catch (error) {
    console.error('Erreur API charges PATCH:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une charge horaire
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la charge requis' },
        { status: 400 }
      );
    }

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Supprimer la charge
    await Activity.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Activité supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur API charges DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
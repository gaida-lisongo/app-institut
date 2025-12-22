import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Activity, Charge } from '@/models/Charge';
import mongoose from 'mongoose';

// GET - Récupérer les activités
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const chargeId = searchParams.get('chargeId');

    // Récupérer une activité spécifique
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'ID invalide' },
          { status: 400 }
        );
      }

      const activity = await Activity.findById(id)
        .populate('resolutions.student', 'nom prenom matricule');

      if (!activity) {
        return NextResponse.json(
          { success: false, error: 'Activité non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: activity
      });
    }

    // Récupérer les activités d'une charge spécifique
    if (chargeId) {
      if (!mongoose.Types.ObjectId.isValid(chargeId)) {
        return NextResponse.json(
          { success: false, error: 'ID de charge invalide' },
          { status: 400 }
        );
      }

      const charge = await Charge.findById(chargeId)
        .populate({
          path: 'activities',
          populate: {
            path: 'resolutions.student',
            select: 'nom prenom matricule'
          }
        });

      if (!charge) {
        return NextResponse.json(
          { success: false, error: 'Charge non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: charge.activities || [],
        total: charge.activities?.length || 0
      });
    }

    // Récupérer toutes les activités
    const activities = await Activity.find()
      .populate('resolutions.student', 'nom prenom matricule')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: activities,
      total: activities.length
    });

  } catch (error) {
    console.error('Erreur API activities GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle activité
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const chargeId = searchParams.get('chargeId');

    if (!chargeId) {
      return NextResponse.json(
        { success: false, error: 'chargeId requis en query string' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(chargeId)) {
      return NextResponse.json(
        { success: false, error: 'ID de charge invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, type, maximumScore, resolutions } = body;

    // Validation des champs obligatoires
    if (!title || !type || maximumScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'Title, type et maximumScore sont obligatoires' },
        { status: 400 }
      );
    }

    // Vérifier que la charge existe
    const charge = await Charge.findById(chargeId);
    if (!charge) {
      return NextResponse.json(
        { success: false, error: 'Charge non trouvée' },
        { status: 404 }
      );
    }

    // Créer la nouvelle activité
    const newActivity = new Activity({
      title: title.trim(),
      description: description?.trim(),
      type,
      maximumScore,
      resolutions: resolutions || []
    });

    const savedActivity = await newActivity.save();

    // Associer l'activité à la charge
    await Charge.findByIdAndUpdate(
      chargeId,
      { $push: { activities: savedActivity._id } }
    );

    // Récupérer l'activité avec populate pour la réponse
    const activityWithDetails = await Activity.findById(savedActivity._id)
      .populate('resolutions.student', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: activityWithDetails,
      message: 'Activité créée et associée à la charge avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API activities POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une activité
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const { id, title, description, type, maximumScore, resolutions } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'activité requis' },
        { status: 400 }
      );
    }

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
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (type !== undefined) updateData.type = type;
    if (maximumScore !== undefined) updateData.maximumScore = maximumScore;
    if (resolutions !== undefined) updateData.resolutions = resolutions;

    // Mettre à jour l'activité
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('resolutions.student', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: updatedActivity,
      message: 'Activité mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API activities PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une activité
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'activité requis' },
        { status: 400 }
      );
    }

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

    // Dissocier l'activité de toutes les charges
    await Charge.updateMany(
      { activities: id },
      { $pull: { activities: id } }
    );

    // Supprimer l'activité
    await Activity.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Activité supprimée et dissociée des charges avec succès'
    });

  } catch (error) {
    console.error('Erreur API activities DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
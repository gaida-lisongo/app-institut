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
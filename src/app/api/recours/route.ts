import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Recours, Charge } from '@/models/Charge';
import mongoose from 'mongoose';

// GET - Récupérer les recours
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const chargeId = searchParams.get('chargeId');

    // Récupérer un recours spécifique
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'ID invalide' },
          { status: 400 }
        );
      }

      const recours = await Recours.findById(id)
        .populate('student', 'nom prenom matricule');

      if (!recours) {
        return NextResponse.json(
          { success: false, error: 'Recours non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: recours
      });
    }

    // Récupérer les recours d'une charge spécifique
    if (chargeId) {
      if (!mongoose.Types.ObjectId.isValid(chargeId)) {
        return NextResponse.json(
          { success: false, error: 'ID de charge invalide' },
          { status: 400 }
        );
      }

      const charge = await Charge.findById(chargeId)
        .populate({
          path: 'recours',
          populate: {
            path: 'student',
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
        data: charge.recours || [],
        total: charge.recours?.length || 0
      });
    }

    // Récupérer tous les recours
    const recoursList = await Recours.find()
      .populate('student', 'nom prenom matricule')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: recoursList,
      total: recoursList.length
    });

  } catch (error) {
    console.error('Erreur API recours GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau recours
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
    const { student, object, description, status, preuves } = body;

    // Validation des champs obligatoires
    if (!student || !object) {
      return NextResponse.json(
        { success: false, error: 'Student et object sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation de l'ID étudiant
    if (!mongoose.Types.ObjectId.isValid(student)) {
      return NextResponse.json(
        { success: false, error: 'ID étudiant invalide' },
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

    // Créer le nouveau recours
    const newRecours = new Recours({
      student,
      object: object.trim(),
      description: description?.trim(),
      status: status || 'pending',
      preuves: preuves || []
    });

    const savedRecours = await newRecours.save();

    // Associer le recours à la charge
    await Charge.findByIdAndUpdate(
      chargeId,
      { $push: { recours: savedRecours._id } }
    );

    // Récupérer le recours avec populate pour la réponse
    const recoursWithDetails = await Recours.findById(savedRecours._id)
      .populate('student', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: recoursWithDetails,
      message: 'Recours créé et associé à la charge avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API recours POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un recours
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const { id, student, object, description, status, preuves } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du recours requis' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le recours existe
    const existingRecours = await Recours.findById(id);
    if (!existingRecours) {
      return NextResponse.json(
        { success: false, error: 'Recours non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (student !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(student)) {
        return NextResponse.json(
          { success: false, error: 'ID étudiant invalide' },
          { status: 400 }
        );
      }
      updateData.student = student;
    }
    if (object !== undefined) updateData.object = object.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (status !== undefined) updateData.status = status;
    if (preuves !== undefined) updateData.preuves = preuves;

    // Mettre à jour le recours
    const updatedRecours = await Recours.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: updatedRecours,
      message: 'Recours mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API recours PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un recours
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du recours requis' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le recours existe
    const existingRecours = await Recours.findById(id);
    if (!existingRecours) {
      return NextResponse.json(
        { success: false, error: 'Recours non trouvé' },
        { status: 404 }
      );
    }

    // Dissocier le recours de toutes les charges
    await Charge.updateMany(
      { recours: id },
      { $pull: { recours: id } }
    );

    // Supprimer le recours
    await Recours.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Recours supprimé et dissocié des charges avec succès'
    });

  } catch (error) {
    console.error('Erreur API recours DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
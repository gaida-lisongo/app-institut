import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Seance, Charge } from '@/models/Charge';
import mongoose from 'mongoose';

// GET - Récupérer les séances
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const chargeId = searchParams.get('chargeId');

    // Récupérer une séance spécifique
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'ID invalide' },
          { status: 400 }
        );
      }

      const seance = await Seance.findById(id)
        .populate('presences.student', 'nom prenom matricule');

      if (!seance) {
        return NextResponse.json(
          { success: false, error: 'Séance non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: seance
      });
    }

    // Récupérer les séances d'une charge spécifique
    if (chargeId) {
      if (!mongoose.Types.ObjectId.isValid(chargeId)) {
        return NextResponse.json(
          { success: false, error: 'ID de charge invalide' },
          { status: 400 }
        );
      }

      const charge = await Charge.findById(chargeId)
        .populate({
          path: 'seances',
          populate: {
            path: 'presences.student',
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
        data: charge.seances || [],
        total: charge.seances?.length || 0
      });
    }

    // Récupérer toutes les séances
    const seances = await Seance.find()
      .populate('presences.student', 'nom prenom matricule')
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: seances,
      total: seances.length
    });

  } catch (error) {
    console.error('Erreur API seances GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle séance
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
    const { date, startTime, endTime, topic, description, location, presences } = body;

    // Validation des champs obligatoires
    if (!date || !startTime || !endTime || !topic) {
      return NextResponse.json(
        { success: false, error: 'Date, startTime, endTime et topic sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation de la date
    if (!Date.parse(date)) {
      return NextResponse.json(
        { success: false, error: 'Format de date invalide' },
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

    // Créer la nouvelle séance
    const newSeance = new Seance({
      date: new Date(date),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      topic: topic.trim(),
      description: description?.trim(),
      location: location?.trim(),
      presences: presences || []
    });

    const savedSeance = await newSeance.save();

    // Associer la séance à la charge
    await Charge.findByIdAndUpdate(
      chargeId,
      { $push: { seances: savedSeance._id } }
    );

    // Récupérer la séance avec populate pour la réponse
    const seanceWithDetails = await Seance.findById(savedSeance._id)
      .populate('presences.student', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: seanceWithDetails,
      message: 'Séance créée et associée à la charge avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API seances POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une séance
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const { id, date, startTime, endTime, topic, description, location, presences } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la séance requis' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la séance existe
    const existingSeance = await Seance.findById(id);
    if (!existingSeance) {
      return NextResponse.json(
        { success: false, error: 'Séance non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (date !== undefined) {
      if (!Date.parse(date)) {
        return NextResponse.json(
          { success: false, error: 'Format de date invalide' },
          { status: 400 }
        );
      }
      updateData.date = new Date(date);
    }
    if (startTime !== undefined) updateData.startTime = startTime.trim();
    if (endTime !== undefined) updateData.endTime = endTime.trim();
    if (topic !== undefined) updateData.topic = topic.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (location !== undefined) updateData.location = location?.trim();
    if (presences !== undefined) updateData.presences = presences;

    // Mettre à jour la séance
    const updatedSeance = await Seance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('presences.student', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: updatedSeance,
      message: 'Séance mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API seances PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une séance
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la séance requis' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la séance existe
    const existingSeance = await Seance.findById(id);
    if (!existingSeance) {
      return NextResponse.json(
        { success: false, error: 'Séance non trouvée' },
        { status: 404 }
      );
    }

    // Dissocier la séance de toutes les charges
    await Charge.updateMany(
      { seances: id },
      { $pull: { seances: id } }
    );

    // Supprimer la séance
    await Seance.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Séance supprimée et dissociée des charges avec succès'
    });

  } catch (error) {
    console.error('Erreur API seances DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
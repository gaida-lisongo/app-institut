import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Charge, Activity, Resource, Recours, Seance } from '@/models/Charge';
import mongoose from 'mongoose';

// GET - Récupérer les charges horaires
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const anneeId = searchParams.get('anneeId');
    const enseignantId = searchParams.get('enseignantId');

    // Si coursId et anneeId sont fournis, récupérer une charge spécifique avec populate
    if (coursId && anneeId) {
      // Validation des IDs
      if (!mongoose.Types.ObjectId.isValid(coursId) || !mongoose.Types.ObjectId.isValid(anneeId)) {
        return NextResponse.json(
          { success: false, error: 'IDs invalides' },
          { status: 400 }
        );
      }

      const charge = await Charge.findOne({ 
        cours: coursId, 
        anneeId: anneeId 
      })
      .populate('cours')
      .populate('enseignant')
      .populate('anneeId')
      .populate({
        path: 'activities',
        populate: {
          path: 'resolutions.student',
          model: 'Etudiant'
        }
      })
      .populate({
        path: 'ressources',
        populate: {
          path: 'commandes',
          model: 'Etudiant'
        }
      })
      .populate({
        path: 'recours',
        populate: {
          path: 'student',
          model: 'Etudiant'
        }
      })
      .populate({
        path: 'seances',
        populate: {
          path: 'presences.student',
          model: 'Etudiant'
        }
      });

      if (!charge) {
        return NextResponse.json(
          { success: false, error: 'Charge horaire non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: charge
      });
    } else if( enseignantId ) {
        // Récupérer les charges pour un enseignant spécifique
        if (!mongoose.Types.ObjectId.isValid(enseignantId)) {
          return NextResponse.json(
            { success: false, error: 'ID enseignant invalide' },
            { status: 400 }
          );
        }

        const charges = await Charge.find({ enseignant: enseignantId })
          .populate('cours')
          .populate('enseignant')
          .populate('anneeId')
          .populate({
            path: 'activities',
            populate: {
              path: 'resolutions.student',
              model: 'Etudiant'
            }
          })
          .populate({
            path: 'ressources',
            populate: {
              path: 'commandes',
              model: 'Etudiant'
            }
          })
          .populate({
            path: 'recours',
            populate: {
              path: 'student',
              model: 'Etudiant'
            }
          })
          .populate({
            path: 'seances',
            populate: {
              path: 'presences.student',
              model: 'Etudiant'
            }
          })
          .sort({ createdAt: -1 });
        
        if (charges.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucune charge horaire trouvée pour cet enseignant' },
                { status: 404 }
            );
        }

        return NextResponse.json({
          success: true,
          message: `Charges horaires pour l'enseignant ${enseignantId} récupérées avec succès`,
          data: charges
        });
    } else {
      const charges = await Charge.find()
        .populate('cours')
        .populate('enseignant')
        .populate('anneeId')
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        data: charges,
        total: charges.length
      });
    }

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
      cours,
      enseignant,
      anneeId,
      status = 'pending',
      objectif = '',
      contenu = '',
      methodologie = '',
      evaluation = '',
      references = '',
      plannings = []
    } = body;

    // Validation des champs obligatoires
    if (!cours || !enseignant || !anneeId) {
      return NextResponse.json(
        { success: false, error: 'Cours, enseignant et année sont obligatoires' },
        { status: 400 }
      );
    }

    // Validation des IDs
    if (!mongoose.Types.ObjectId.isValid(cours) || 
        !mongoose.Types.ObjectId.isValid(enseignant) || 
        !mongoose.Types.ObjectId.isValid(anneeId)) {
      return NextResponse.json(
        { success: false, error: 'IDs invalides' },
        { status: 400 }
      );
    }

    // Vérifier si une charge existe déjà pour ce cours et cette année
    const existingCharge = await Charge.findOne({ 
      cours, 
      anneeId 
    });

    if (existingCharge) {
      return NextResponse.json(
        { success: false, error: 'Une charge horaire existe déjà pour ce cours et cette année' },
        { status: 409 }
      );
    }

    // Créer la nouvelle charge
    const newCharge = new Charge({
      cours,
      enseignant,
      anneeId,
      status: status || 'pending',
      objectif: objectif?.trim(),
      contenu: contenu?.trim(),
      methodologie: methodologie?.trim(),
      evaluation: evaluation?.trim(),
      references: references?.trim(),
      plannings: plannings || [],
      activities: [],
      ressources: [],
      recours: [],
      seances: []
    });

    const savedCharge = await newCharge.save();

    // Récupérer la charge avec populate pour la réponse
    const chargeWithDetails = await Charge.findById(savedCharge._id)
      .populate('cours')
      .populate('enseignant')
      .populate('anneeId');

    return NextResponse.json({
      success: true,
      data: chargeWithDetails,
      message: 'Charge horaire créée avec succès'
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
      status,
      objectif,
      contenu,
      methodologie,
      evaluation,
      references,
      plannings,
      activities,
      ressources,
      recours,
      seances
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

    // Vérifier que la charge existe
    const existingCharge = await Charge.findById(id);
    if (!existingCharge) {
      return NextResponse.json(
        { success: false, error: 'Charge horaire non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (objectif !== undefined) updateData.objectif = objectif?.trim();
    if (contenu !== undefined) updateData.contenu = contenu?.trim();
    if (methodologie !== undefined) updateData.methodologie = methodologie?.trim();
    if (evaluation !== undefined) updateData.evaluation = evaluation?.trim();
    if (references !== undefined) updateData.references = references?.trim();
    if (plannings !== undefined) updateData.plannings = plannings;
    if (activities !== undefined) updateData.activities = activities;
    if (ressources !== undefined) updateData.ressources = ressources;
    if (recours !== undefined) updateData.recours = recours;
    if (seances !== undefined) updateData.seances = seances;

    // Mettre à jour la charge
    const updatedCharge = await Charge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('cours', 'designation code')
    .populate('enseignant', 'nom prenom')
    .populate('anneeId', 'debut fin');

    return NextResponse.json({
      success: true,
      data: updatedCharge,
      message: 'Charge horaire mise à jour avec succès'
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

    // Vérifier que la charge existe
    const existingCharge = await Charge.findById(id);
    if (!existingCharge) {
      return NextResponse.json(
        { success: false, error: 'Charge horaire non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer les éléments associés
    if (existingCharge.activities.length > 0) {
      await Activity.deleteMany({ _id: { $in: existingCharge.activities } });
    }
    
    if (existingCharge.ressources.length > 0) {
      await Resource.deleteMany({ _id: { $in: existingCharge.ressources } });
    }
    
    if (existingCharge.recours.length > 0) {
      await Recours.deleteMany({ _id: { $in: existingCharge.recours } });
    }
    
    if (existingCharge.seances.length > 0) {
      await Seance.deleteMany({ _id: { $in: existingCharge.seances } });
    }

    // Supprimer la charge
    await Charge.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Charge horaire et éléments associés supprimés avec succès'
    });

  } catch (error) {
    console.error('Erreur API charges DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
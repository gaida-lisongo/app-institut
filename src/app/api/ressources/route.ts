import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Resource, Charge } from '@/models/Charge';
import mongoose from 'mongoose';

// GET - Récupérer les ressources
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const chargeId = searchParams.get('chargeId');

    // Récupérer une ressource spécifique
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: 'ID invalide' },
          { status: 400 }
        );
      }

      const resource = await Resource.findById(id)
        .populate('commandes', 'nom prenom matricule');

      if (!resource) {
        return NextResponse.json(
          { success: false, error: 'Ressource non trouvée' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: resource
      });
    }

    // Récupérer les ressources d'une charge spécifique
    if (chargeId) {
      if (!mongoose.Types.ObjectId.isValid(chargeId)) {
        return NextResponse.json(
          { success: false, error: 'ID de charge invalide' },
          { status: 400 }
        );
      }

      const charge = await Charge.findById(chargeId)
        .populate({
          path: 'ressources',
          populate: {
            path: 'commandes',
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
        data: charge.ressources || [],
        total: charge.ressources?.length || 0
      });
    }

    // Récupérer toutes les ressources
    const resources = await Resource.find()
      .populate('commandes', 'nom prenom matricule')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: resources,
      total: resources.length
    });

  } catch (error) {
    console.error('Erreur API resources GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle ressource
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
    const { title, url, montant, description, commandes } = body;

    // Validation des champs obligatoires
    if (!title || !url || montant === undefined) {
      return NextResponse.json(
        { success: false, error: 'Title, url et montant sont obligatoires' },
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

    // Créer la nouvelle ressource
    const newResource = new Resource({
      title: title.trim(),
      url: url.trim(),
      montant,
      description: description?.trim(),
      commandes: commandes || []
    });

    const savedResource = await newResource.save();

    // Associer la ressource à la charge
    await Charge.findByIdAndUpdate(
      chargeId,
      { $push: { ressources: savedResource._id } }
    );

    // Récupérer la ressource avec populate pour la réponse
    const resourceWithDetails = await Resource.findById(savedResource._id)
      .populate('commandes', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: resourceWithDetails,
      message: 'Ressource créée et associée à la charge avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur API resources POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une ressource
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const body = await request.json();
    const { id, title, url, montant, description, commandes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la ressource requis' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la ressource existe
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Ressource non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (url !== undefined) updateData.url = url.trim();
    if (montant !== undefined) updateData.montant = montant;
    if (description !== undefined) updateData.description = description?.trim();
    if (commandes !== undefined) updateData.commandes = commandes;

    // Mettre à jour la ressource
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('commandes', 'nom prenom matricule');

    return NextResponse.json({
      success: true,
      data: updatedResource,
      message: 'Ressource mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API resources PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une ressource
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await initializeModels();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de la ressource requis' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la ressource existe
    const existingResource = await Resource.findById(id);
    if (!existingResource) {
      return NextResponse.json(
        { success: false, error: 'Ressource non trouvée' },
        { status: 404 }
      );
    }

    // Dissocier la ressource de toutes les charges
    await Charge.updateMany(
      { ressources: id },
      { $pull: { ressources: id } }
    );

    // Supprimer la ressource
    await Resource.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Ressource supprimée et dissociée des charges avec succès'
    });

  } catch (error) {
    console.error('Erreur API resources DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Parcours from '@/models/Parcours';
import mongoose from 'mongoose';

// GET - Récupérer un parcours par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID parcours invalide' 
        },
        { status: 400 }
      );
    }
    
    const parcours = await Parcours.findById(id)
      .populate('faculteId', 'designation description')
      .populate('departementId', 'designation description')
      .lean();
    
    if (!parcours) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parcours non trouvé' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: parcours
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération du parcours:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du parcours',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier un parcours
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID parcours invalide' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      etudiantId,
      promotionId,
      anneeId,
      statut
    } = body;
    
    // Vérifier si le parcours existe
    const parcoursExistant = await Parcours.findById(id);
    if (!parcoursExistant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parcours non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Validation du statut si fourni
    if (statut && !['En cours', 'Terminé', 'Annulé'].includes(statut)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le statut doit être: En cours, Terminé ou Annulé' 
        },
        { status: 400 }
      );
    }
    
    // Mettre à jour le parcours
    const parcoursMisAJour = await Parcours.findByIdAndUpdate(
      id,
      { etudiantId, promotionId, anneeId, statut },
      { new: true }
    ).populate('etudiantId')
    .populate('promotionId')
    .populate('anneeId');
    
    return NextResponse.json({
      success: true,
      data: parcoursMisAJour,
      message: 'Parcours mis à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du parcours:', error);
    
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de validation',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          error: `Un parcours avec ce ${field} existe déjà` 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour du parcours',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un parcours
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID parcours invalide' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si le parcours existe
    const parcours = await Parcours.findById(id);
    if (!parcours) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parcours non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Option pour désactiver au lieu de supprimer
    const { searchParams } = new URL(request.url);
    const deactivate = searchParams.get('deactivate') === 'true';
    
    if (deactivate) {
      // Désactiver le parcours au lieu de le supprimer
      const parcoursDesactive = await Parcours.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      
      return NextResponse.json({
        success: true,
        data: parcoursDesactive,
        message: 'Parcours désactivé avec succès'
      });
    } else {
      // Supprimer définitivement le parcours
      await Parcours.findByIdAndDelete(id);
      
      return NextResponse.json({
        success: true,
        message: 'Parcours supprimé avec succès'
      });
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression du parcours:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression du parcours',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

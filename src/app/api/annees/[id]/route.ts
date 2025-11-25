import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Annee from '@/models/Annee';
import mongoose from 'mongoose';

// GET - Récupérer une année par ID
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
          error: 'ID année invalide' 
        },
        { status: 400 }
      );
    }
    
    const annee = await Annee.findById(id);
    
    if (!annee) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Année non trouvée' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: annee
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'année:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de l\'année',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier une année
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
          error: 'ID année invalide' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { debut, fin, isActive } = body;
    
    // Vérifier si l'année existe
    const anneeExistante = await Annee.findById(id);
    if (!anneeExistante) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Année non trouvée' 
        },
        { status: 404 }
      );
    }
    
    // Validation des années si fournies
    if (debut !== undefined && fin !== undefined) {
      if (isNaN(debut) || isNaN(fin)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Les années doivent être des nombres valides' 
          },
          { status: 400 }
        );
      }
      
      if (fin <= debut) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'L\'année de fin doit être supérieure à l\'année de début' 
          },
          { status: 400 }
        );
      }
      
      // Vérifier l'unicité si on change les années
      if (debut !== anneeExistante.debut || fin !== anneeExistante.fin) {
        const existingAnnee = await Annee.findOne({ 
          debut, 
          fin, 
          _id: { $ne: id } 
        });
        if (existingAnnee) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Cette année académique existe déjà' 
            },
            { status: 409 }
          );
        }
      }
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    if (debut !== undefined) updateData.debut = parseInt(debut);
    if (fin !== undefined) updateData.fin = parseInt(fin);
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Mettre à jour l'année
    const anneeMiseAJour = await Annee.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    return NextResponse.json({
      success: true,
      data: anneeMiseAJour,
      message: 'Année mise à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'année:', error);
    
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cette année académique existe déjà' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de l\'année',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une année
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
          error: 'ID année invalide' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si l'année existe
    const annee = await Annee.findById(id);
    if (!annee) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Année non trouvée' 
        },
        { status: 404 }
      );
    }
    
    // Vérifier si l'année est active
    if (annee.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de supprimer l\'année académique active' 
        },
        { status: 409 }
      );
    }
    
    // TODO: Vérifier s'il y a des inscriptions liées à cette année
    // const inscriptions = await Inscription.countDocuments({ anneeId: id });
    // if (inscriptions > 0) {
    //   return NextResponse.json(
    //     { 
    //       success: false, 
    //       error: 'Impossible de supprimer une année avec des inscriptions' 
    //     },
    //     { status: 409 }
    //   );
    // }
    
    // Supprimer l'année
    await Annee.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Année supprimée avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'année:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de l\'année',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

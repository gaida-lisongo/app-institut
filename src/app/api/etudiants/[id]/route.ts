import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Etudiant from '@/models/Etudiant';
import mongoose from 'mongoose';

// GET - Récupérer un étudiant par ID
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
          error: 'ID étudiant invalide' 
        },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const includeRecharges = searchParams.get('includeRecharges') === 'true';
    
    let query = Etudiant.findById(id);
    
    // Inclure ou exclure les recharges selon le paramètre
    if (!includeRecharges) {
      query = query.select('-recharges');
    }
    
    const etudiant = await query.lean();
    
    if (!etudiant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Étudiant non trouvé' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: etudiant
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de l\'étudiant',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier un étudiant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    console.log("id : ", id)
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID étudiant invalide' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { nom, post_nom, prenom, sexe, matricule, secure } = body;
    
    // Vérifier si l'étudiant existe
    const etudiantExistant = await Etudiant.findById(id);
    console.log('Etudiant : ', etudiantExistant);

    
    if (!etudiantExistant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Étudiant non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Validation du sexe si fourni
    if (sexe && !['M', 'F'].includes(sexe)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le sexe doit être M ou F' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier l'unicité du matricule si modifié
    if (matricule && matricule !== etudiantExistant.matricule) {
      const existingEtudiant = await Etudiant.findOne({ 
        matricule, 
        _id: { $ne: id } 
      });
      if (existingEtudiant) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Un étudiant avec ce matricule existe déjà' 
          },
          { status: 409 }
        );
      }
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    if (nom) updateData.nom = nom.trim();
    if (post_nom) updateData.post_nom = post_nom.trim();
    if (prenom !== undefined) updateData.prenom = prenom?.trim();
    if (sexe) updateData.sexe = sexe;
    if (matricule) updateData.matricule = matricule;
    if (secure) updateData.secure = secure;
    
    // Mettre à jour l'étudiant
    const etudiantMisAJour = await Etudiant.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-recharges' // Exclure les recharges dans la réponse
      }
    );
    
    return NextResponse.json({
      success: true,
      data: etudiantMisAJour,
      message: 'Étudiant mis à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    
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
          error: `Un étudiant avec ce ${field} existe déjà` 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de l\'étudiant',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un étudiant
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
          error: 'ID étudiant invalide' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si l'étudiant existe
    const etudiant = await Etudiant.findById(id);
    if (!etudiant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Étudiant non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Vérifier s'il y a des recharges associées
    if (etudiant.recharges && etudiant.recharges.length > 0) {
      const { searchParams } = new URL(request.url);
      const force = searchParams.get('force') === 'true';
      
      if (!force) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer un étudiant avec des recharges. Utilisez force=true pour forcer la suppression.',
            rechargesCount: etudiant.recharges.length
          },
          { status: 409 }
        );
      }
    }
    
    // Supprimer l'étudiant
    await Etudiant.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Étudiant supprimé avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de l\'étudiant',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

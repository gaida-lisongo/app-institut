import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Etudiant } from '@/models/Etudiant';
import mongoose from 'mongoose';

// PUT - Mettre à jour le profil d'un étudiant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await initializeModels();
    
    const { id } = await params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID étudiant invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Body : ", body);
    
    // Champs autorisés pour la mise à jour du profil
    const allowedFields = [
      'nom',
      'post_nom', 
      'prenom',
      'sexe',
      'nationalite',
      'date_naissance',
      'lieu_naissance',
      'photo'
    ];

    // Filtrer les champs autorisés (inclure les champs vides pour permettre la suppression)
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body.hasOwnProperty(field)) {
        // Permettre les valeurs vides pour certains champs optionnels
        if (field === 'photo') {
          // La photo sera gérée séparément, ne pas l'inclure ici
          continue;
        }
        updateData[field] = body[field] || (field === 'post_nom' || field === 'nationalite' || field === 'lieu_naissance' ? '' : body[field]);
      }
    }

    // Validation des champs requis
    if (updateData.sexe && !['M', 'F'].includes(updateData.sexe)) {
      return NextResponse.json(
        { error: 'Le sexe doit être M ou F' },
        { status: 400 }
      );
    }

    // Validation de la date de naissance
    if (updateData.date_naissance) {
      const dateNaissance = new Date(updateData.date_naissance);
      if (isNaN(dateNaissance.getTime())) {
        return NextResponse.json(
          { error: 'Date de naissance invalide' },
          { status: 400 }
        );
      }
      updateData.date_naissance = dateNaissance;
    }

    // Vérifier que l'étudiant existe
    const etudiant = await Etudiant.findById(id);
    console.log("Etudiant : ", etudiant);
    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les opérations de mise à jour
    const updateOperations: any = { $set: {} };
    
    // Champs à mettre à jour
    Object.keys(updateData).forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        if (updateData[field] === '' && ['post_nom', 'nationalite', 'lieu_naissance'].includes(field)) {
          // Pour les champs optionnels, vider si chaîne vide
          updateOperations.$set[field] = '';
        } else if (updateData[field] !== '') {
          updateOperations.$set[field] = updateData[field];
        }
      }
    });

    console.log("Updated Data : ", updateData);
    console.log("Update Operations : ", updateOperations);

    // Mettre à jour le profil
    const updatedEtudiant = await Etudiant.findByIdAndUpdate(
      id,
      updateOperations,
      { 
        new: true,
        runValidators: true
      }
    );
    
    console.log("Updated Etudiant : ", updatedEtudiant);

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      etudiant: updatedEtudiant
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer le profil d'un étudiant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    await initializeModels();
    
    const { id } = await params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID étudiant invalide' },
        { status: 400 }
      );
    }

    const etudiant = await Etudiant.findById(id);
    
    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      etudiant
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

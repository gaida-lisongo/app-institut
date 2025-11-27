import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Etudiant } from '@/models/Etudiant';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST - Upload de photo de profil
export async function POST(
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

    // Vérifier que l'étudiant existe
    const etudiant = await Etudiant.findById(id);
    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le fichier depuis FormData
    const formData = await request.formData();
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP' },
        { status: 400 }
      );
    }

    // Validation de la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 5MB' },
        { status: 400 }
      );
    }

    // Créer le nom du fichier
    const fileExtension = path.extname(file.name);
    const fileName = `${etudiant.matricule}_${Date.now()}${fileExtension}`;
    
    // Créer le dossier de destination s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà
    }

    // Chemin complet du fichier
    const filePath = path.join(uploadDir, fileName);
    
    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // URL relative pour la base de données
    const photoUrl = `/uploads/photos/${fileName}`;

    // Mettre à jour la photo dans la base de données
    const updatedEtudiant = await Etudiant.findByIdAndUpdate(
      id,
      { photo: photoUrl },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Photo uploadée avec succès',
      photoUrl: photoUrl,
      etudiant: updatedEtudiant
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer la photo de profil
export async function DELETE(
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

    // Vérifier que l'étudiant existe
    const etudiant = await Etudiant.findById(id);
    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer la référence de la photo dans la base de données
    const updatedEtudiant = await Etudiant.findByIdAndUpdate(
      id,
      { $unset: { photo: 1 } },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Photo supprimée avec succès',
      etudiant: updatedEtudiant
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

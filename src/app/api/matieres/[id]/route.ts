import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Matiere } from '@/models/Semestre';
import mongoose from 'mongoose';

// GET - Récupérer une matière par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const matiere = await Matiere.findById(params.id);
    
    if (!matiere) {
      return NextResponse.json(
        { success: false, error: 'Matière non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: matiere
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de la matière:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une matière
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { designation, code, descriptions, credits } = body;
    
    // Validation des champs requis
    if (!designation || !code || !credits) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }
    
    // Vérifier si le code existe déjà (sauf pour cette matière)
    const existingMatiere = await Matiere.findOne({ 
      code: code.toUpperCase(),
      _id: { $ne: params.id }
    });
    
    if (existingMatiere) {
      return NextResponse.json(
        { success: false, error: 'Une autre matière avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    const updatedMatiere = await Matiere.findByIdAndUpdate(
      params.id,
      {
        designation: designation.trim(),
        code: code.toUpperCase().trim(),
        descriptions: descriptions?.trim(),
        credits: parseInt(credits)
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedMatiere) {
      return NextResponse.json(
        { success: false, error: 'Matière non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedMatiere,
      message: 'Matière mise à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la matière:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Une matière avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la matière' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une matière
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      );
    }
    
    const deletedMatiere = await Matiere.findByIdAndDelete(params.id);
    
    if (!deletedMatiere) {
      return NextResponse.json(
        { success: false, error: 'Matière non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Matière supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de la matière:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la matière' },
      { status: 500 }
    );
  }
}

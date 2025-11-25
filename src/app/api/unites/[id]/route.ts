import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Unite } from '@/models/Semestre';
import mongoose from 'mongoose';

// GET - Récupérer une unité par ID
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
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate') === 'true';
    
    let query = Unite.findById(params.id);
    
    if (populate) {
      query = query.populate('matieres', 'designation code credits');
    }
    
    const unite = await query;
    
    if (!unite) {
      return NextResponse.json(
        { success: false, error: 'Unité non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: unite
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'unité:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une unité
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
    const { designation, code, descriptions, matieres, credits } = body;
    
    // Validation des champs requis
    if (!designation || !code) {
      return NextResponse.json(
        { success: false, error: 'La désignation et le code sont requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si le code existe déjà (sauf pour cette unité)
    const existingUnite = await Unite.findOne({ 
      code: code.toUpperCase(),
      _id: { $ne: params.id }
    });
    
    if (existingUnite) {
      return NextResponse.json(
        { success: false, error: 'Une autre unité avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    const updatedUnite = await Unite.findByIdAndUpdate(
      params.id,
      {
        designation: designation.trim(),
        code: code.toUpperCase().trim(),
        descriptions: descriptions?.trim(),
        matieres: matieres || [],
        credits: credits || 0
      },
      { new: true, runValidators: true }
    ).populate('matieres', 'designation code credits');
    
    if (!updatedUnite) {
      return NextResponse.json(
        { success: false, error: 'Unité non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedUnite,
      message: 'Unité mise à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'unité:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Une unité avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'unité' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une unité
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
    
    const deletedUnite = await Unite.findByIdAndDelete(params.id);
    
    if (!deletedUnite) {
      return NextResponse.json(
        { success: false, error: 'Unité non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Unité supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'unité:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'unité' },
      { status: 500 }
    );
  }
}

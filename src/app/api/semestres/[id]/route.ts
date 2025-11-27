import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Semestre } from '@/models/Semestre';
import mongoose from 'mongoose';

// GET - Récupérer un semestre par ID
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
    
    let query = Semestre.findById(params.id);
    
    if (populate) {
      query = query.populate({
        path: 'unites',
        select: 'designation code credits matieres',
        populate: {
          path: 'matieres',
          select: 'designation code credits'
        }
      });
    }
    
    const semestre = await query;
    
    if (!semestre) {
      return NextResponse.json(
        { success: false, error: 'Semestre non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: semestre
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du semestre:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un semestre
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
    const { designation, credits, unites } = body;

    const currentSemetre = await Semestre.findById(params.id);

    if (!currentSemetre) {
      return NextResponse.json(
        { success: false, error: 'Semestre non trouvé' },
        { status: 404 }
      );
    }
    
    currentSemetre.designation = designation || currentSemetre.designation;
    currentSemetre.credits = credits || currentSemetre.credits;
    currentSemetre.unites = unites || currentSemetre.unites;
    
    const updatedSemestre = await currentSemetre.save();
    
    if (!updatedSemestre) {
      return NextResponse.json(
        { success: false, error: 'Semestre non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedSemestre,
      message: 'Semestre mis à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du semestre:', error);
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du semestre' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un semestre
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
    
    const deletedSemestre = await Semestre.findByIdAndDelete(params.id);
    
    if (!deletedSemestre) {
      return NextResponse.json(
        { success: false, error: 'Semestre non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Semestre supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du semestre:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du semestre' },
      { status: 500 }
    );
  }
}

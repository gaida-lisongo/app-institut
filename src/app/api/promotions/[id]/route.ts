import { NextRequest, NextResponse } from 'next/server';
import { PromotionControllers } from '@/lib/controllers/MentionControllers';
import dbConnect from '@/lib/dbConnect';

// GET - Récupérer une promotion par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    
    // Convertir le paramètre populate en tableau
    const populateFields = populate ? populate.split(',') : ['semestres'];
    
    const result = await PromotionControllers.getById(params.id, populateFields);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API promotion GET by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, systeme, niveau, cycle, semestres } = body;
    
    // Validation des données
    if (!designation || !systeme || !niveau || !cycle) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }
    
    // Validation des valeurs enum
    const systemesValides = ['LMD', 'Classique'];
    const niveauxValides = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3'];
    const cyclesValides = ['Licence', 'Master', 'Doctorat'];
    
    if (!systemesValides.includes(systeme)) {
      return NextResponse.json(
        { success: false, error: 'Système invalide' },
        { status: 400 }
      );
    }
    
    if (!niveauxValides.includes(niveau)) {
      return NextResponse.json(
        { success: false, error: 'Niveau invalide' },
        { status: 400 }
      );
    }
    
    if (!cyclesValides.includes(cycle)) {
      return NextResponse.json(
        { success: false, error: 'Cycle invalide' },
        { status: 400 }
      );
    }
    
    const updateData = {
      designation: designation.trim(),
      systeme,
      niveau,
      cycle,
      semestres: semestres || []
    };
    
    const result = await PromotionControllers.update(params.id, updateData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Promotion mise à jour avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API promotion PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const result = await PromotionControllers.delete(params.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Promotion supprimée avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API promotion DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PromotionControllers } from '@/lib/controllers/MentionControllers';
import dbConnect from '@/lib/dbConnect';

// GET - Récupérer toutes les promotions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const cycle = searchParams.get('cycle')
    const populate = searchParams.get('populate');

    
    // Convertir le paramètre populate en tableau
    const populateFields = populate ? populate.split(',') : ['semestres'];
    let result : any;
    if(cycle){
      result = await PromotionControllers.getAll(populateFields, { cycle });
    } else {
      result = await PromotionControllers.getAll(populateFields);
    }
    
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.data?.length || 0
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API promotions GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle promotion
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, systeme, niveau, cycle, semestres } = body;
    
    // Validation des données requises
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
    
    const promotionData = {
      designation: designation.trim(),
      systeme,
      niveau,
      cycle,
      semestres: semestres || []
    };
    
    const result = await PromotionControllers.create(promotionData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Promotion créée avec succès'
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API promotions POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

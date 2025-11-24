import { NextRequest, NextResponse } from 'next/server';
import { MentionControllers } from '@/lib/controllers/MentionControllers';
import dbConnect from '@/lib/dbConnect';

// GET - Récupérer toutes les mentions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    
    // Convertir le paramètre populate en tableau
    const populateFields = populate ? populate.split(',') : ['filieres'];
    
    const result = await MentionControllers.getAll(populateFields);
    
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
    console.error('Erreur API mentions GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle mention
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, description, filieres } = body;
    
    // Validation des données requises
    if (!designation) {
      return NextResponse.json(
        { success: false, error: 'La désignation est requise' },
        { status: 400 }
      );
    }
    
    const mentionData = {
      designation: designation.trim(),
      description: description?.trim(),
      filieres: filieres || []
    };
    
    const result = await MentionControllers.create(mentionData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Mention créée avec succès'
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API mentions POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

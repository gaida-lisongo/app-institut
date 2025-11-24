import { NextRequest, NextResponse } from 'next/server';
import { FiliereControllers } from '@/lib/controllers/MentionControllers';
import dbConnect from '@/lib/dbConnect';

// GET - Récupérer une filière par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    
    // Convertir le paramètre populate en tableau
    const populateFields = populate ? populate.split(',') : ['promotions', 'bureau.agent'];
    
    const result = await FiliereControllers.getById(params.id, populateFields);
    
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
    console.error('Erreur API filière GET by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une filière
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, description, bureau, promotions } = body;
    
    // Validation des données
    if (!designation) {
      return NextResponse.json(
        { success: false, error: 'La désignation est requise' },
        { status: 400 }
      );
    }
    
    const updateData = {
      designation: designation.trim(),
      description: description?.trim(),
      bureau: bureau || [],
      promotions: promotions || []
    };
    
    const result = await FiliereControllers.update(params.id, updateData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Filière mise à jour avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API filière PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une filière
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const result = await FiliereControllers.delete(params.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Filière supprimée avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API filière DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

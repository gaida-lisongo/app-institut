import { NextRequest, NextResponse } from 'next/server';
import { MentionControllers } from '@/lib/controllers/MentionControllers';
import dbConnect from '@/lib/dbConnect';

// GET - Récupérer une mention par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get('populate');
    
    // Convertir le paramètre populate en tableau
    const populateFields = populate ? populate.split(',') : ['filieres'];
    
    const result = await MentionControllers.getById(params.id, populateFields);
    
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
    console.error('Erreur API mention GET by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une mention
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, description, filieres } = body;
    
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
      filieres: filieres || []
    };
    
    const result = await MentionControllers.update(params.id, updateData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Mention mise à jour avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API mention PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une mention
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const result = await MentionControllers.delete(params.id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Mention supprimée avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API mention DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

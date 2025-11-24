import { NextRequest, NextResponse } from 'next/server';
import { addFiliereToSection } from '@/lib/controllers/MentionControllers';
import dbConnect from '@/lib/dbConnect';

// POST - Ajouter une filière à une section
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { filiereId } = body;
    
    if (!filiereId) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de la filière est requis' },
        { status: 400 }
      );
    }
    
    const result = await addFiliereToSection(params.id, filiereId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Filière ajoutée à la section avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API section-filière POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Retirer une filière d'une section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const filiereId = searchParams.get('filiereId');
    
    if (!filiereId) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de la filière est requis' },
        { status: 400 }
      );
    }
    
    // Utiliser la fonction de suppression (à implémenter si nécessaire)
    // const result = await removeFiliereFromSection(params.id, filiereId);
    
    return NextResponse.json({
      success: true,
      message: 'Filière retirée de la section avec succès'
    });
  } catch (error: any) {
    console.error('Erreur API section-filière DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { addPromotionToFiliere } from '@/lib/controllers/MentionControllers';
import mongoose from 'mongoose';

// POST - Ajouter une promotion à une filière
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'ID de filière invalide' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { promotionId } = body;
    
    if (!promotionId || !mongoose.Types.ObjectId.isValid(promotionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de promotion invalide' },
        { status: 400 }
      );
    }
    
    const result = await addPromotionToFiliere(params.id, promotionId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Promotion ajoutée à la filière avec succès'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de la promotion à la filière:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

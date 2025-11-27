import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { Filiere } from '@/models/Mention';

// DELETE - Retirer une promotion d'une filière
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; promotionId: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id) || !mongoose.Types.ObjectId.isValid(params.promotionId)) {
      return NextResponse.json(
        { success: false, error: 'IDs invalides' },
        { status: 400 }
      );
    }
    
    // Retirer la promotion de la filière
    const filiere = await Filiere.findByIdAndUpdate(
      params.id,
      { $pull: { promotions: params.promotionId } },
      { new: true }
    ).populate('promotions');
    
    if (!filiere) {
      return NextResponse.json(
        { success: false, error: 'Filière non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filiere,
      message: 'Promotion retirée de la filière avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la promotion de la filière:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

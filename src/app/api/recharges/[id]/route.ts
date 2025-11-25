import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Recharge from '@/models/Recharge';
import mongoose from 'mongoose';

// GET - Récupérer une recharge par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID recharge invalide' 
        },
        { status: 400 }
      );
    }
    
    const recharge = await Recharge.findById(id)
      .populate('etudiantId', 'nom post_nom prenom matricule')
      .lean();
    
    if (!recharge) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recharge non trouvée' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: recharge
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la recharge:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de la recharge',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier une recharge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID recharge invalide' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { 
      currency, 
      phone, 
      amount, 
      description, 
      status, 
      etudiantId, 
      transactionId,
      paymentMethod 
    } = body;
    
    // Vérifier si la recharge existe
    const rechargeExistante = await Recharge.findById(id);
    if (!rechargeExistante) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recharge non trouvée' 
        },
        { status: 404 }
      );
    }
    
    // Validation du montant si fourni
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le montant doit être un nombre positif' 
        },
        { status: 400 }
      );
    }
    
    // Validation de la devise si fournie
    if (currency && !['USD', 'CDF', 'EUR'].includes(currency)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La devise doit être USD, CDF ou EUR' 
        },
        { status: 400 }
      );
    }
    
    // Validation du statut si fourni
    if (status && !['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Statut invalide' 
        },
        { status: 400 }
      );
    }
    
    // Validation de la méthode de paiement si fournie
    if (paymentMethod && !['mobile_money', 'bank_transfer', 'cash', 'card'].includes(paymentMethod)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Méthode de paiement invalide' 
        },
        { status: 400 }
      );
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {};
    if (currency) updateData.currency = currency;
    if (phone) updateData.phone = phone;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description) updateData.description = description.trim();
    if (status) updateData.status = status;
    if (etudiantId) updateData.etudiantId = etudiantId;
    if (transactionId) updateData.transactionId = transactionId;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    
    // Mettre à jour la recharge
    const rechargeMiseAJour = await Recharge.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('etudiantId', 'nom post_nom prenom matricule');
    
    return NextResponse.json({
      success: true,
      data: rechargeMiseAJour,
      message: 'Recharge mise à jour avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la recharge:', error);
    
    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de validation',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la mise à jour de la recharge',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une recharge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID recharge invalide' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si la recharge existe
    const recharge = await Recharge.findById(id);
    if (!recharge) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recharge non trouvée' 
        },
        { status: 404 }
      );
    }
    
    // Vérifier si la recharge peut être supprimée
    if (recharge.status === 'completed') {
      const { searchParams } = new URL(request.url);
      const force = searchParams.get('force') === 'true';
      
      if (!force) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Impossible de supprimer une recharge complétée. Utilisez force=true pour forcer la suppression.'
          },
          { status: 409 }
        );
      }
    }
    
    // Supprimer la recharge
    await Recharge.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Recharge supprimée avec succès'
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la recharge:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la suppression de la recharge',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

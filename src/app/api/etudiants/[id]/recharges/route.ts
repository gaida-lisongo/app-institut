import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Etudiant from '@/models/Etudiant';
import Recharge from '@/models/Recharge';
import mongoose from 'mongoose';

// GET - Récupérer les recharges d'un étudiant
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
          error: 'ID étudiant invalide' 
        },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    // Vérifier si l'étudiant existe
    const etudiant = await Etudiant.findById(id);
    
    if (!etudiant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Étudiant non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Construire la requête pour les recharges
    let query: any = { etudiantId: id };
    
    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }
    
    // Calculer la pagination
    const skip = (page - 1) * limit;
    
    // Récupérer les recharges avec pagination
    const [recharges, total] = await Promise.all([
      Recharge.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recharge.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: recharges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des recharges:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des recharges',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Ajouter une recharge à un étudiant
export async function POST(
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
          error: 'ID étudiant invalide' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { currency, phone, amount, description, paymentMethod } = body;
    
    // Validation des champs requis
    if (!phone || !amount || !description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Les champs phone, amount et description sont requis' 
        },
        { status: 400 }
      );
    }
    
    // Validation du montant
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le montant doit être un nombre positif' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si l'étudiant existe
    const etudiant = await Etudiant.findById(id);
    if (!etudiant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Étudiant non trouvé' 
        },
        { status: 404 }
      );
    }
    
    // Créer la nouvelle recharge
    const nouvelleRecharge = await Recharge.create({
      currency: currency || 'USD',
      phone,
      amount: parseFloat(amount),
      description,
      paymentMethod: paymentMethod || 'mobile_money',
      status: 'pending',
      etudiantId: id
    });
    
    return NextResponse.json({
      success: true,
      data: nouvelleRecharge,
      message: 'Recharge ajoutée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de la recharge:', error);
    
    // Gestion des erreurs de validation
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
        error: 'Erreur lors de l\'ajout de la recharge',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

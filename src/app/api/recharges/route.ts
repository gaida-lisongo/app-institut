import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Recharge from '@/models/Recharge';
import '@/models/Etudiant';

// GET - Récupérer toutes les recharges ou rechercher
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');
    const etudiantId = searchParams.get('etudiantId');
    const phone = searchParams.get('phone');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    let query: any = {};
    
    // Filtrage par recherche
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { orderNumber: regex },
        { phone: regex },
        { description: regex },
        { transactionId: regex }
      ];
    }
    
    // Filtrage par statut
    if (status && ['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    // Filtrage par devise
    if (currency && ['USD', 'CDF', 'EUR'].includes(currency)) {
      query.currency = currency;
    }
    
    // Filtrage par étudiant
    if (etudiantId) {
      query.etudiantId = etudiantId;
    }
    
    // Filtrage par téléphone
    if (phone) {
      query.phone = phone;
    }
    
    // Filtrage par date
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Calcul de la pagination
    const skip = (page - 1) * limit;
    
    // Construction du tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Exécution de la requête avec pagination
    const [recharges, total] = await Promise.all([
      Recharge.find(query)
        .populate('etudiantId')
        .sort(sortOptions)
        .skip(skip)
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

// POST - Créer une nouvelle recharge
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      currency, 
      phone, 
      amount, 
      description, 
      etudiantId, 
      paymentMethod,
      orderNumber 
    } = body;
    
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
    
    // Validation de la devise
    if (currency && !['USD', 'CDF', 'EUR'].includes(currency)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La devise doit être USD, CDF ou EUR' 
        },
        { status: 400 }
      );
    }
    
    // Validation de la méthode de paiement
    if (paymentMethod && !['mobile_money', 'bank_transfer', 'cash', 'card'].includes(paymentMethod)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Méthode de paiement invalide' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier l'unicité du numéro de commande si fourni
    if (orderNumber) {
      const existingRecharge = await Recharge.findOne({ orderNumber });
      if (existingRecharge) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Une recharge avec ce numéro de commande existe déjà' 
          },
          { status: 409 }
        );
      }
    }
    
    // Créer la nouvelle recharge
    const nouvelleRecharge = new Recharge({
      currency: currency || 'USD',
      phone,
      amount: parseFloat(amount),
      description: description.trim(),
      etudiantId: etudiantId || undefined,
      paymentMethod: paymentMethod || 'mobile_money',
      orderNumber
    });
    
    await nouvelleRecharge.save();
    
    // Récupérer la recharge avec les données de l'étudiant
    const rechargeComplete = await Recharge.findById(nouvelleRecharge._id)
      .populate('etudiantId', 'nom post_nom prenom matricule');
    
    return NextResponse.json({
      success: true,
      data: rechargeComplete,
      message: 'Recharge créée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de la recharge:', error);
    
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
    
    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          error: `Une recharge avec ce ${field} existe déjà` 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de la recharge',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
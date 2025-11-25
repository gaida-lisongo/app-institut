import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Annee from '@/models/Annee';

// GET - Récupérer toutes les années académiques
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'debut';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const isActive = searchParams.get('isActive');
    
    let query: any = {};
    
    // Filtrage par statut actif
    if (isActive !== null && isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    // Calcul de la pagination
    const skip = (page - 1) * limit;
    
    // Construction du tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Exécution de la requête avec pagination
    const [annees, total] = await Promise.all([
      Annee.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Annee.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: annees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des années:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des années',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle année académique
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { debut, fin, isActive } = body;
    
    // Validation des champs requis
    if (!debut || !fin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Les champs debut et fin sont requis' 
        },
        { status: 400 }
      );
    }
    
    // Validation des années
    if (isNaN(debut) || isNaN(fin)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Les années doivent être des nombres valides' 
        },
        { status: 400 }
      );
    }
    
    if (fin <= debut) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'L\'année de fin doit être supérieure à l\'année de début' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier l'unicité de la combinaison debut-fin
    const existingAnnee = await Annee.findOne({ debut, fin });
    if (existingAnnee) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cette année académique existe déjà' 
        },
        { status: 409 }
      );
    }
    
    // Créer la nouvelle année
    const nouvelleAnnee = await Annee.create({
      debut: parseInt(debut),
      fin: parseInt(fin),
      isActive: isActive || false
    });
    
    return NextResponse.json({
      success: true,
      data: nouvelleAnnee,
      message: 'Année académique créée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'année:', error);
    
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cette année académique existe déjà' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de l\'année',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

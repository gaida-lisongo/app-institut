import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Unite } from '@/models/Semestre';

// GET - Récupérer toutes les unités avec pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const populate = searchParams.get('populate') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Construire le filtre de recherche
    const filter: any = {};
    if (search) {
      filter.$or = [
        { designation: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Récupérer les unités avec pagination
    let query = Unite.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    if (populate) {
      query = query.populate('matieres', 'designation code credits');
    }
    
    const unites = await query;
    const total = await Unite.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: unites,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle unité
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, code, descriptions, matieres } = body;
    
    // Validation des champs requis
    if (!designation || !code) {
      return NextResponse.json(
        { success: false, error: 'La désignation et le code sont requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si le code existe déjà
    const existingUnite = await Unite.findOne({ code: code.toUpperCase() });
    if (existingUnite) {
      return NextResponse.json(
        { success: false, error: 'Une unité avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    // Créer la nouvelle unité
    const newUnite = new Unite({
      designation: designation.trim(),
      code: code.toUpperCase().trim(),
      descriptions: descriptions?.trim(),
      credits: 0, // Sera calculé automatiquement par le middleware
      matieres: matieres || []
    });
    
    await newUnite.save();
    
    // Populer les matières pour la réponse
    await newUnite.populate('matieres', 'designation code credits');
    
    return NextResponse.json({
      success: true,
      data: newUnite,
      message: 'Unité créée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'unité:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Une unité avec ce code existe déjà' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'unité' },
      { status: 500 }
    );
  }
}

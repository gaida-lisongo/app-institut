import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Matiere } from '@/models/Semestre';
import { Types } from 'mongoose';

// GET - Récupérer toutes les matières avec pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const uniteId = searchParams.get('uniteId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Si uniteId est fourni, récupérer les matières de cette unité
    if (uniteId) {
      if (!Types.ObjectId.isValid(uniteId)) {
        return NextResponse.json(
          { success: false, error: 'ID d\'unité invalide' },
          { status: 400 }
        );
      }
      
      // Récupérer l'unité avec ses matières
      const { Unite } = await import('@/models/Semestre');
      const unite = await Unite.findById(uniteId).populate('matieres');
      
      if (!unite) {
        return NextResponse.json(
          { success: false, error: 'Unité non trouvée' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: unite.matieres || []
      });
    }
    
    const skip = (page - 1) * limit;
    
    // Construire le filtre de recherche
    const filter: any = {};
    if (search) {
      filter.$or = [
        { designation: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Récupérer les matières avec pagination
    const matieres = await Matiere.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Matiere.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: matieres,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle matière
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, code, descriptions, credits, uniteId } = body;
    
    // Validation des champs requis
    if (!designation || !code || !credits || !uniteId) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }
    
    // Validation de l'ObjectId
    if (!Types.ObjectId.isValid(uniteId)) {
      return NextResponse.json(
        { success: false, error: 'ID d\'unité invalide' },
        { status: 400 }
      );
    }
    
    // Créer la nouvelle matière
    const newMatiere = await Matiere.createMatiereWithUniteId({
      designation: designation.trim(),
      code: code.toUpperCase().trim(),
      descriptions: descriptions?.trim(),
      credits: parseInt(credits),
      uniteId: uniteId
    });
    
    
    return NextResponse.json({
      success: true,
      data: newMatiere,
      message: 'Matière créée avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de la matière:', error);
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la matière' },
      { status: 500 }
    );
  }
}

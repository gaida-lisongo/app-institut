import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Unite } from '@/models/Semestre';
import { Types } from 'mongoose';

// GET - Récupérer toutes les unités avec pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const filiereId = searchParams.get('filiereId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const populate = searchParams.get('populate') === 'true';
    console.log("Filiere Id: ", filiereId);

    if(filiereId){
      const unites = await Unite.find().populate(
        {
          path: 'matieres',
          select: 'designation code credits'
        }
      ).where({ filiereId });

      console.log("Unites: ", unites);

      if(unites.length === 0){
        return NextResponse.json({
          success: true,
          data: []
        });
      }
      
      return NextResponse.json({
        success: true,
        data: unites
      });
    } else {
    
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

    }
    
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
    const { designation, code, descriptions, credits, filiereId } = body;
    console.log("FiliereId: ", filiereId);
    // Validation des champs requis
    if (!designation || !code || !filiereId) {
      return NextResponse.json(
        { success: false, error: 'La désignation, le code et la filière sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'ObjectId
    if (!Types.ObjectId.isValid(filiereId)) {
      return NextResponse.json(
        { success: false, error: 'ID de filière invalide' },
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
      credits: credits, // Sera calculé automatiquement par le middleware
      matieres: [],
      filiereId: new Types.ObjectId(filiereId)
    });
    
    console.log("Unité avant sauvegarde:", newUnite);
    await newUnite.save();
    console.log("Unité après sauvegarde:", newUnite);
    
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

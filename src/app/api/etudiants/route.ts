import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Etudiant from '@/models/Etudiant';

// GET - Récupérer tous les étudiants ou rechercher
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sexe = searchParams.get('sexe');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    let query: any = {};
    
    // Filtrage par recherche
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { nom: regex },
        { post_nom: regex },
        { prenom: regex },
        { matricule: regex }
      ];
    }
    
    // Filtrage par sexe
    if (sexe && ['M', 'F'].includes(sexe)) {
      query.sexe = sexe;
    }
    
    // Calcul de la pagination
    const skip = (page - 1) * limit;
    
    // Construction du tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Exécution de la requête avec pagination
    const [etudiants, total] = await Promise.all([
      Etudiant.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Etudiant.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: etudiants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des étudiants',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel étudiant
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { nom, post_nom, prenom, sexe, matricule, secure } = body;
    
    // Validation des champs requis
    if (!nom || !post_nom || !sexe) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Les champs nom, post_nom et sexe sont requis' 
        },
        { status: 400 }
      );
    }
    
    // Validation du sexe
    if (!['M', 'F'].includes(sexe)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le sexe doit être M ou F' 
        },
        { status: 400 }
      );
    }
    
    // Vérifier l'unicité du matricule si fourni
    if (matricule) {
      const existingEtudiant = await Etudiant.findOne({ matricule });
      if (existingEtudiant) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Un étudiant avec ce matricule existe déjà' 
          },
          { status: 409 }
        );
      }
    }
    
    // Créer le nouvel étudiant
    const nouvelEtudiant = await Etudiant.create({
      nom: nom.trim(),
      post_nom: post_nom.trim(),
      prenom: prenom?.trim(),
      sexe,
      matricule,
      secure
    });

    console.log("New etudiant : ", nouvelEtudiant)
    
    return NextResponse.json({
      success: true,
      data: nouvelEtudiant,
      message: 'Étudiant créé avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    
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
          error: `Un étudiant avec ce ${field} existe déjà` 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de l\'étudiant',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

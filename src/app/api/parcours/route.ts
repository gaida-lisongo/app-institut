import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Parcours from '@/models/Parcours';

// GET - Récupérer tous les parcours ou rechercher
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const niveau = searchParams.get('niveau');
    const faculteId = searchParams.get('faculteId');
    const departementId = searchParams.get('departementId');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'designation';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    let query: any = {};
    
    // Filtrage par recherche
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { designation: regex },
        { description: regex },
        { code: regex }
      ];
    }
    
    // Filtrage par niveau
    if (niveau && ['Licence', 'Master', 'Doctorat', 'Graduat'].includes(niveau)) {
      query.niveau = niveau;
    }
    
    // Filtrage par faculté
    if (faculteId) {
      query.faculteId = faculteId;
    }
    
    // Filtrage par département
    if (departementId) {
      query.departementId = departementId;
    }
    
    // Filtrage par statut actif
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Calcul de la pagination
    const skip = (page - 1) * limit;
    
    // Construction du tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Exécution de la requête avec pagination
    const [parcours, total] = await Promise.all([
      Parcours.find(query)
        .populate('faculteId', 'designation')
        .populate('departementId', 'designation')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Parcours.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: parcours,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des parcours:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des parcours',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau parcours ou plusieurs parcours (insertMany)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Vérifier si c'est un tableau (insertMany) ou un objet unique
    const isArray = Array.isArray(body);
    const parcoursData = isArray ? body : [body];
    
    // Validation des données
    for (const parcours of parcoursData) {
      const { designation, code, duree, credits, niveau } = parcours;
      
      // Validation des champs requis
      if (!designation || !duree || !credits || !niveau) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Les champs designation, duree, credits et niveau sont requis pour chaque parcours' 
          },
          { status: 400 }
        );
      }
      
      // Validation du niveau
      if (!['Licence', 'Master', 'Doctorat', 'Graduat'].includes(niveau)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Le niveau doit être: Licence, Master, Doctorat ou Graduat' 
          },
          { status: 400 }
        );
      }
      
      // Validation de la durée
      if (isNaN(duree) || duree < 1 || duree > 10) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La durée doit être entre 1 et 10 ans' 
          },
          { status: 400 }
        );
      }
      
      // Validation des crédits
      if (isNaN(credits) || credits < 30 || credits > 500) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Le nombre de crédits doit être entre 30 et 500' 
          },
          { status: 400 }
        );
      }
      
      // Vérifier l'unicité du code si fourni
      if (code) {
        const existingParcours = await Parcours.findOne({ code: code.toUpperCase() });
        if (existingParcours) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Un parcours avec le code ${code} existe déjà` 
            },
            { status: 409 }
          );
        }
      }
    }
    
    let result;
    
    if (isArray) {
      // Insertion multiple (insertMany)
      result = await Parcours.insertMany(parcoursData);
      
      return NextResponse.json({
        success: true,
        data: result,
        message: `${result.length} parcours créés avec succès`,
        count: result.length
      }, { status: 201 });
      
    } else {
      // Insertion unique
      const nouveauParcours = new Parcours(parcoursData[0]);
      await nouveauParcours.save();
      
      // Récupérer le parcours avec les données des relations
      const parcoursComplet = await Parcours.findById(nouveauParcours._id)
        .populate('faculteId', 'designation')
        .populate('departementId', 'designation');
      
      return NextResponse.json({
        success: true,
        data: parcoursComplet,
        message: 'Parcours créé avec succès'
      }, { status: 201 });
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la création du/des parcours:', error);
    
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
          error: `Un parcours avec ce ${field} existe déjà` 
        },
        { status: 409 }
      );
    }
    
    // Gestion des erreurs d'insertion multiple
    if (error.name === 'BulkWriteError') {
      const duplicateErrors = error.writeErrors?.filter((err: any) => err.code === 11000) || [];
      if (duplicateErrors.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Certains parcours ont des codes en double',
            details: duplicateErrors.map((err: any) => err.errmsg)
          },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création du/des parcours',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

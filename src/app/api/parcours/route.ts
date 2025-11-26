import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Parcours from '@/models/Parcours';
import Etudiant from '@/models/Etudiant';

// GET - Récupérer tous les parcours ou rechercher
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const etudiantId = searchParams.get('etudiantId');
    const promotionId = searchParams.get('promotionId');
    const anneeId = searchParams.get('anneeId');
    const statut = searchParams.get('statut');
    const sortBy = searchParams.get('sortBy') || 'designation';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    
    
    let query: any = {};
    
    // Calcul de la pagination
    const skip = (page - 1) * limit;
    
    // Construction du tri
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    if(etudiantId){
      query.etudiantId = etudiantId;
    }
    
    if(promotionId){
      query.promotionId = promotionId;
    }
    
    if(anneeId){
      query.anneeId = anneeId;
    }
    
    if(statut){
      query.statut = statut;
    }
    
    // Exécution de la requête avec pagination
    const [parcours, total] = await Promise.all([
      Parcours.find(query)
        .populate('etudiantId')
        .populate('promotionId')
        .populate('anneeId')
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

    const parcoursPayload = [];
    
    // Validation des données
    for (const parcours of parcoursData) {
      const { matricule, promotionId, anneeId, statut } = parcours;
      
      // Validation des champs requis
      if (!matricule || !promotionId || !anneeId) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Les champs designation, duree, credits et niveau sont requis pour chaque parcours' 
          },
          { status: 400 }
        );
      }

      const etudiant = await Etudiant.findOne({ matricule });
      
      // Validation du niveau
      if (!etudiant) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'L\'etudiant n\'existe pas, ayant le matricule ' + matricule 
          },
          { status: 400 }
        );
      }

      parcoursPayload.push({
        etudiantId: etudiant._id,
        promotionId,
        anneeId,
        statut
      });
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

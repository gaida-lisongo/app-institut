import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Semestre } from '@/models/Semestre';
import { Promotion } from '@/models/Mention';

// GET - Récupérer tous les semestres avec pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const promotionId = searchParams.get('promotionId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const populate = searchParams.get('populate') === 'true';

    if(promotionId){
      const promotion = await Promotion.findById(promotionId).populate({
        path: 'semestres',
        select: 'designation credits',
        populate: {
          path: 'unites',
          select: 'designation credits',
          populate: {
            path: 'matieres',
            select: 'designation credits'
          }
        }
      });
      if(!promotion){
        return NextResponse.json(
          { success: false, error: 'Promotion non trouvée' },
          { status: 404 }
        );
      }
      const semestres = promotion.semestres;
      
      return NextResponse.json({
        success: true,
        data: semestres
      });


    } else {
    
      const skip = (page - 1) * limit;
      
      // Construire le filtre de recherche
      const filter: any = {};
      if (search) {
        filter.designation = { $regex: search, $options: 'i' };
      }
      
      // Récupérer les semestres avec pagination
      let query = Semestre.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      if (populate) {
        query = query.populate({
          path: 'unites',
          select: 'designation code credits matieres',
          populate: {
            path: 'matieres',
            select: 'designation code credits'
          }
        });
      }
      
      const semestres = await query;
      const total = await Semestre.countDocuments(filter);
      const pages = Math.ceil(total / limit);
      
      return NextResponse.json({
        success: true,
        data: semestres,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      });

    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération des semestres:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau semestre
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { designation, credits, promotionId } = body;
    
    if (!promotionId) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de la promotion est requis' },
        { status: 400 }
      );
    }
    
    // Créer le nouveau semestre (déjà sauvegardé par la méthode)
    const newSemestre = await Semestre.createSemestreWithPromotionId({
      designation: designation.trim(),
      credits: credits || 0
    }, promotionId);
    
    return NextResponse.json({
      success: true,
      data: newSemestre,
      message: 'Semestre créé avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du semestre:', error);
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du semestre' },
      { status: 500 }
    );
  }
}

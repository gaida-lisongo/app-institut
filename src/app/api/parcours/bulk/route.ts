import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Parcours from '@/models/Parcours';

// POST - Insertion en lot de parcours (insertMany optimisé)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un tableau de parcours non vide est requis' 
        },
        { status: 400 }
      );
    }
    
    // Validation préliminaire des données
    const errors: string[] = [];
    const validatedData = [];
    
    for (let i = 0; i < body.length; i++) {
      const parcours = body[i];
      const { designation, code, duree, credits, niveau } = parcours;
      
      // Validation des champs requis
      if (!designation) {
        errors.push(`Parcours ${i + 1}: designation est requis`);
      }
      if (!duree || isNaN(duree) || duree < 1 || duree > 10) {
        errors.push(`Parcours ${i + 1}: durée doit être entre 1 et 10 ans`);
      }
      if (!credits || isNaN(credits) || credits < 30 || credits > 500) {
        errors.push(`Parcours ${i + 1}: crédits doivent être entre 30 et 500`);
      }
      if (!niveau || !['Licence', 'Master', 'Doctorat', 'Graduat'].includes(niveau)) {
        errors.push(`Parcours ${i + 1}: niveau doit être Licence, Master, Doctorat ou Graduat`);
      }
      
      // Validation du format du code si fourni
      if (code && !/^[A-Z]{2,6}\d{2,4}$/.test(code.toUpperCase())) {
        errors.push(`Parcours ${i + 1}: code doit suivre le format: 2-6 lettres suivies de 2-4 chiffres`);
      }
      
      if (errors.length === 0) {
        validatedData.push({
          ...parcours,
          designation: designation.trim(),
          description: parcours.description?.trim(),
          code: code ? code.toUpperCase().trim() : undefined,
          duree: parseInt(duree),
          credits: parseInt(credits),
          isActive: parcours.isActive !== undefined ? Boolean(parcours.isActive) : true
        });
      }
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreurs de validation',
          details: errors
        },
        { status: 400 }
      );
    }
    
    // Vérifier les codes en double dans le lot
    const codes = validatedData
      .filter(p => p.code)
      .map(p => p.code);
    
    const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
    if (duplicateCodes.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Codes en double dans le lot',
          details: [...new Set(duplicateCodes)]
        },
        { status: 400 }
      );
    }
    
    // Vérifier les codes existants dans la base de données
    if (codes.length > 0) {
      const existingParcours = await Parcours.find({ 
        code: { $in: codes } 
      }).select('code');
      
      if (existingParcours.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Certains codes existent déjà',
            details: existingParcours.map(p => p.code)
          },
          { status: 409 }
        );
      }
    }
    
    // Insertion en lot avec gestion des erreurs
    try {
      const result = await Parcours.insertMany(validatedData, { 
        ordered: false, // Continue même si certains échouent
        rawResult: true 
      });
      
      return NextResponse.json({
        success: true,
        data: result.insertedIds,
        message: `${result.insertedCount} parcours créés avec succès`,
        count: result.insertedCount,
        insertedIds: Object.values(result.insertedIds)
      }, { status: 201 });
      
    } catch (bulkError: any) {
      // Gestion des erreurs d'insertion en lot
      if (bulkError.name === 'BulkWriteError') {
        const successCount = bulkError.result.insertedCount;
        const errorCount = bulkError.writeErrors?.length || 0;
        
        return NextResponse.json({
          success: successCount > 0,
          message: `${successCount} parcours créés, ${errorCount} erreurs`,
          data: {
            insertedCount: successCount,
            errors: bulkError.writeErrors?.map((err: any) => ({
              index: err.index,
              message: err.errmsg
            }))
          }
        }, { status: successCount > 0 ? 201 : 400 });
      }
      
      throw bulkError;
    }
    
  } catch (error: any) {
    console.error('Erreur lors de l\'insertion en lot des parcours:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'insertion en lot des parcours',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Obtenir des statistiques sur les parcours
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      // Statistiques générales
      const stats = await Parcours.getStatistics();
      const totalCount = await Parcours.countDocuments();
      const activeCount = await Parcours.countDocuments({ isActive: true });
      const inactiveCount = await Parcours.countDocuments({ isActive: false });
      
      return NextResponse.json({
        success: true,
        data: {
          total: totalCount,
          active: activeCount,
          inactive: inactiveCount,
          byNiveau: stats
        }
      });
    }
    
    if (action === 'validate') {
      // Validation des données existantes
      const parcours = await Parcours.find({}).select('code designation niveau duree credits');
      const issues = [];
      
      for (const p of parcours) {
        if (p.niveau === 'Graduat' && p.duree > 3) {
          issues.push(`${p.designation}: Un graduat ne devrait pas dépasser 3 ans`);
        }
        if (p.niveau === 'Licence' && (p.duree < 3 || p.duree > 4)) {
          issues.push(`${p.designation}: Une licence devrait durer entre 3 et 4 ans`);
        }
        if (p.niveau === 'Master' && (p.duree < 1 || p.duree > 3)) {
          issues.push(`${p.designation}: Un master devrait durer entre 1 et 3 ans`);
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          totalChecked: parcours.length,
          issuesFound: issues.length,
          issues
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Action non supportée. Utilisez ?action=stats ou ?action=validate' 
      },
      { status: 400 }
    );
    
  } catch (error: any) {
    console.error('Erreur lors de l\'opération en lot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de l\'opération en lot',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

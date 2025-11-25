import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const db = mongoose.connection.db;
    const collection = db?.collection('etudiants');

    if (!collection) {
      throw new Error('Impossible d\'accéder à la collection etudiants');
    }

    let results = {
      indexDropped: false,
      documentsUpdated: 0,
      errors: [] as string[]
    };

    // Supprimer l'index problématique sur recharges.orderNumber
    try {
      await collection.dropIndex('recharges.orderNumber_1');
      results.indexDropped = true;
      console.log('Index recharges.orderNumber_1 supprimé avec succès');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('Index recharges.orderNumber_1 n\'existe pas, aucune action nécessaire');
      } else {
        results.errors.push(`Erreur lors de la suppression de l'index: ${error.message}`);
      }
    }

    // Supprimer le champ recharges de tous les documents existants
    try {
      const result = await collection.updateMany(
        { recharges: { $exists: true } },
        { $unset: { recharges: "" } }
      );
      
      results.documentsUpdated = result.modifiedCount;
      console.log(`Champ recharges supprimé de ${result.modifiedCount} documents`);
    } catch (error: any) {
      results.errors.push(`Erreur lors de la mise à jour des documents: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration terminée avec succès',
      results
    });

  } catch (error: any) {
    console.error('Erreur lors de la migration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la migration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

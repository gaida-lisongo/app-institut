// Script de migration pour supprimer l'index des recharges dans la collection etudiants
const { MongoClient } = require('mongodb');

async function migrateDatabase() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdd-btp';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connexion à MongoDB établie');

        const db = client.db();
        const collection = db.collection('etudiants');

        // Supprimer l'index problématique sur recharges.orderNumber
        try {
            await collection.dropIndex('recharges.orderNumber_1');
            console.log('Index recharges.orderNumber_1 supprimé avec succès');
        } catch (error) {
            if (error.code === 27) {
                console.log('Index recharges.orderNumber_1 n\'existe pas, aucune action nécessaire');
            } else {
                console.error('Erreur lors de la suppression de l\'index:', error.message);
            }
        }

        // Supprimer le champ recharges de tous les documents existants
        const result = await collection.updateMany(
            { recharges: { $exists: true } },
            { $unset: { recharges: "" } }
        );
        
        console.log(`Champ recharges supprimé de ${result.modifiedCount} documents`);

        console.log('Migration terminée avec succès');
    } catch (error) {
        console.error('Erreur lors de la migration:', error);
    } finally {
        await client.close();
    }
}

migrateDatabase();

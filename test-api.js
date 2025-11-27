// Script de test pour l'API parcours
const testParcoursAPI = async () => {
  const parcoursId = '6926d3c89c74cc9b88569d0e'; // Remplacez par un ID valide
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🧪 Test de l\'API /api/parcours/[id]');
    console.log(`📍 URL: ${baseUrl}/api/parcours/${parcoursId}`);
    
    const response = await fetch(`${baseUrl}/api/parcours/${parcoursId}`);
    const data = await response.json();
    
    console.log('📊 Statut:', response.status);
    console.log('📋 Réponse:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Test réussi !');
      console.log('👤 Étudiant:', data.data.etudiantId?.nom, data.data.etudiantId?.prenom);
      console.log('🎓 Promotion:', data.data.promotionId?.designation);
      console.log('📅 Année:', data.data.anneeId?.debut, '-', data.data.anneeId?.fin);
    } else {
      console.log('❌ Test échoué:', data.error);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
};

// Exécuter le test si le serveur est démarré
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testParcoursAPI();
} else {
  // Browser environment
  console.log('Utilisez ce script dans la console du navigateur après avoir démarré le serveur');
}

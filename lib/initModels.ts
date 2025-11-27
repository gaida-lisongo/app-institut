// Fichier d'initialisation des modèles Mongoose
// Ce fichier s'assure que tous les modèles sont enregistrés avant utilisation

import Etudiant from '@/models/Etudiant';
import { Promotion, Filiere, Mention, Section } from '@/models/Mention';
import Annee from '@/models/Annee';
import Parcours from '@/models/Parcours';
import Agent from '@/models/Agent';
import Grade from '@/models/Grade';
import Autorisation from '@/models/Autorisation';
import Recharge from '@/models/Recharge';
import { Semestre, Matiere, Unite } from '@/models/Semestre';

// Fonction pour initialiser tous les modèles
export const initializeModels = () => {
  // Forcer l'enregistrement de tous les modèles en les référençant
  const models = [
    Etudiant,
    Promotion,
    Filiere,
    Mention,
    Section,
    Annee,
    Parcours,
    Agent,
    Grade,
    Autorisation,
    Recharge,
    Semestre,
    Matiere,
    Unite
  ];

  models.forEach(model => {
    if (model && model.modelName) {
      console.log(`✅ Modèle ${model.modelName} initialisé`);
    }
  });

  console.log(`🚀 ${models.length} modèles Mongoose initialisés`);
};

// Export par défaut
export default initializeModels;

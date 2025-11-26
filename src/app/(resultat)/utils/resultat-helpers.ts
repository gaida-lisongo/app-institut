import { Parcours, Etudiant, Promotion, Annee } from '../layout';

// Utilitaires pour formater les données
export const formatters = {
  // Formater le nom complet
  formatFullName: (etudiant: Etudiant): string => {
    return `${etudiant.nom} ${etudiant.prenom}`.toUpperCase();
  },

  // Formater la date
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  },

  // Formater l'année académique
  formatAnneeAcademique: (annee: Annee): string => {
    return `${annee.debut} - ${annee.fin}`;
  },

  // Formater le statut avec couleur
  getStatutStyle: (statut: string) => {
    switch (statut) {
      case 'En cours':
        return {
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          icon: '✓'
        };
      case 'Terminé':
        return {
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
          icon: '🎓'
        };
      case 'Annulé':
        return {
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          icon: '✗'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          icon: '?'
        };
    }
  }
};

// Validateurs
export const validators = {
  // Vérifier si un parcours est valide
  isValidParcours: (parcours: Parcours | null): boolean => {
    return parcours !== null && 
           parcours.statut === 'En cours' &&
           parcours.etudiantId &&
           parcours.promotionId &&
           parcours.anneeId;
  },

  // Vérifier si un étudiant peut accéder aux résultats
  canAccessResults: (parcours: Parcours | null): boolean => {
    if (!parcours) return false;
    return parcours.statut === 'En cours' || parcours.statut === 'Terminé';
  },

  // Vérifier si l'inscription est active
  isActiveInscription: (parcours: Parcours | null): boolean => {
    return parcours?.statut === 'En cours';
  }
};

// Messages d'erreur standardisés
export const errorMessages = {
  INSCRIPTION_NOT_FOUND: 'Inscription non trouvée. Veuillez vérifier le QR code.',
  INSCRIPTION_CANCELLED: 'Cette inscription a été annulée. Contactez l\'administration.',
  INSCRIPTION_COMPLETED: 'Cette inscription est terminée.',
  SERVER_ERROR: 'Erreur de connexion au serveur. Veuillez réessayer.',
  INVALID_QR_CODE: 'QR code invalide ou expiré.',
  ACCESS_DENIED: 'Accès refusé. Vous n\'êtes pas autorisé à consulter ces informations.'
};

// Messages de succès
export const successMessages = {
  WELCOME: 'Bienvenue dans votre espace étudiant !',
  DATA_LOADED: 'Vos informations ont été chargées avec succès.',
  RESULTS_AVAILABLE: 'Vos résultats sont disponibles.'
};

// Utilitaires pour les URLs et navigation
export const navigation = {
  // Générer l'URL de retour
  getBackUrl: (): string => {
    return '/';
  },

  // Générer l'URL des résultats
  getResultsUrl: (inscriptionId: string): string => {
    return `/resultat/etudiant/${inscriptionId}/results`;
  },

  // Générer l'URL du profil
  getProfileUrl: (inscriptionId: string): string => {
    return `/resultat/etudiant/${inscriptionId}/profile`;
  }
};

// Utilitaires pour le stockage local
export const storage = {
  // Clés de stockage
  keys: {
    LAST_VISITED: 'resultat_last_visited',
    USER_PREFERENCES: 'resultat_preferences',
    THEME: 'resultat_theme'
  },

  // Sauvegarder la dernière visite
  saveLastVisit: (inscriptionId: string): void => {
    try {
      localStorage.setItem(storage.keys.LAST_VISITED, JSON.stringify({
        inscriptionId,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Impossible de sauvegarder la dernière visite:', error);
    }
  },

  // Récupérer la dernière visite
  getLastVisit: (): { inscriptionId: string; timestamp: string } | null => {
    try {
      const data = localStorage.getItem(storage.keys.LAST_VISITED);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Impossible de récupérer la dernière visite:', error);
      return null;
    }
  }
};

// Utilitaires pour les notifications
export const notifications = {
  // Types de notifications
  types: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  } as const,

  // Créer une notification
  create: (type: string, message: string, duration: number = 5000) => {
    // Cette fonction peut être étendue pour intégrer un système de notifications
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Pour l'instant, utiliser les alertes natives
    if (type === 'error') {
      alert(`Erreur: ${message}`);
    }
  }
};

// Export par défaut avec toutes les utilitaires
export default {
  formatters,
  validators,
  errorMessages,
  successMessages,
  navigation,
  storage,
  notifications
};

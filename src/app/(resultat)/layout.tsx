'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import './animations.css';

// Types pour le contexte des résultats
interface Etudiant {
  _id: string;
  nom: string;
  post_nom?: string;
  prenom: string;
  matricule: string;
  sexe: string;
  photo?: string;
  solde?: number;
  nationalite?: string;
  lieu_naissance?: string;
  date_naissance?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  email?: string;
  telephone?: string;
}

interface Semestre {
  _id: string;
  designation: string;
  credits: number;
  unites: Unite[];
}

interface Unite {
  _id: string;
  designation: string;
  credits: number;
  code: string;
  matieres: Matiere[];
}

interface Matiere {
  _id: string;
  designation: string;
  credits: number;
}

interface Promotion {
  _id: string;
  designation: string;
  systeme: string;
  niveau: string;
  cycle: string;
  semestres: Semestre[];
}

interface Annee {
  _id: string;
  debut: string;
  fin: string;
  statut: string;
}

interface Parcours {
  _id: string;
  etudiantId: Etudiant;
  promotionId: Promotion;
  anneeId: Annee;
  statut: 'En cours' | 'Terminé' | 'Annulé';
  dateInscription: string;
  createdAt: string;
  updatedAt: string;
}

interface ResultatContextType {
  // État du parcours étudiant
  parcours: Parcours | null;
  setParcours: (parcours: Parcours | null) => void;
  
  // État de chargement
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // État d'erreur
  error: string | null;
  setError: (error: string | null) => void;
  
  // Fonctions utilitaires
  fetchParcours: (inscriptionId: string) => Promise<void>;
  updateProfile: (profileData: Partial<Etudiant>) => Promise<boolean>;
  resetContext: () => void;
  updateSolde: (solde: number) => void;
  
  // Informations dérivées
  isValidParcours: boolean;
  etudiantInfo: Etudiant | null;
  promotionInfo: Promotion | null;
  anneeInfo: Annee | null;
}

// Création du contexte
const ResultatContext = createContext<ResultatContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useResultat = (): ResultatContextType => {
  const context = useContext(ResultatContext);
  if (!context) {
    throw new Error('useResultat doit être utilisé dans un ResultatProvider');
  }
  return context;
};

// Provider du contexte
interface ResultatProviderProps {
  children: ReactNode;
}

export const ResultatProvider: React.FC<ResultatProviderProps> = ({ children }) => {
  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données du parcours
  const fetchParcours = async (inscriptionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/parcours/${inscriptionId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setParcours(result.data);
      } else {
        setError(result.error || 'Inscription non trouvée');
        setParcours(null);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du parcours:', err);
      setError('Erreur de connexion au serveur');
      setParcours(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le profil étudiant
  const updateProfile = async (profileData: Partial<Etudiant>): Promise<boolean> => {
    if (!etudiantInfo?._id) {
      setError('Aucun étudiant connecté');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/etudiant/${etudiantInfo._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (result.success && result.etudiant) {
        // Mettre à jour les informations de l'étudiant dans le parcours
        setParcours(prev => prev ? {
          ...prev,
          etudiantId: result.etudiant
        } : null);
        return true;
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du profil');
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError('Erreur de connexion au serveur');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSolde = (solde: number) => {
    setParcours(prev => prev ? {
      ...prev,
      etudiantId: {
        ...prev.etudiantId,
        solde: solde
      }
    } : null);
  }

  // Fonction pour réinitialiser le contexte
  const resetContext = (): void => {
    setParcours(null);
    setLoading(false);
    setError(null);
  };

  // Informations dérivées
  const isValidParcours = parcours !== null && parcours.statut === 'En cours';
  const etudiantInfo = parcours?.etudiantId || null;
  const promotionInfo = parcours?.promotionId || null;
  const anneeInfo = parcours?.anneeId || null;

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      resetContext();
    };
  }, []);

  const contextValue: ResultatContextType = {
    parcours,
    setParcours,
    loading,
    setLoading,
    error,
    setError,
    fetchParcours,
    updateProfile,
    resetContext,
    isValidParcours,
    etudiantInfo,
    promotionInfo,
    anneeInfo,
    updateSolde
  };

  return (
    <ResultatContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-900">
        {/* Header global pour les pages de résultats */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Espace Étudiant
                  </h1>
                  <p className="text-sm text-gray-400">
                    Consultation des résultats et informations académiques
                  </p>
                </div>
              </div>
              
              {/* Informations de l'étudiant connecté */}
              {etudiantInfo && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {etudiantInfo.nom} {etudiantInfo.prenom}
                    </div>
                    <div className="text-xs text-gray-400">
                      {etudiantInfo.matricule}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                © 2024 Système de Gestion Académique. Tous droits réservés.
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">
                  {anneeInfo && `Année Académique: ${anneeInfo.debut} - ${anneeInfo.fin}`}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ResultatContext.Provider>
  );
};

// Layout principal
interface LayoutProps {
  children: ReactNode;
}

export default function ResultatLayout({ children }: LayoutProps) {
  return (
    <ResultatProvider>
      {children}
    </ResultatProvider>
  );
}

// Export des types pour utilisation dans d'autres composants
export type { Etudiant, Promotion, Annee, Parcours, ResultatContextType };

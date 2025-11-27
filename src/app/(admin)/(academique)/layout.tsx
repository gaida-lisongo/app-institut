'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Types
export interface Filiere {
  _id: string;
  designation: string;
  description: string;
  bureau: any[];
  promotions: any[];
  createdAt: string;
  updatedAt: string;
}

interface AcademiqueContextType {
  filieres: Filiere[];
  selectedFiliere: Filiere | null;
  setSelectedFiliere: (filiere: Filiere | null) => void;
  loading: boolean;
  error: string | null;
  refreshFilieres: () => void;
}

// Context
const AcademiqueContext = createContext<AcademiqueContextType | undefined>(undefined);

export const useAcademique = () => {
  const context = useContext(AcademiqueContext);
  if (!context) {
    throw new Error('useAcademique must be used within AcademiqueProvider');
  }
  return context;
};

// Composant de sélection de filière
const FiliereSelector = () => {
  const { filieres, selectedFiliere, setSelectedFiliere, loading } = useAcademique();
  
  // Aplatir les filières (car elles viennent dans un tableau de tableaux)
  const flatFilieres = filieres.flat();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sélection de Filière
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choisissez une filière pour gérer ses promotions
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedFiliere?._id || ''}
            onChange={(e) => {
              const filiere = flatFilieres.find(f => f._id === e.target.value);
              setSelectedFiliere(filiere || null);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[300px]"
          >
            <option value="">Sélectionnez une filière...</option>
            {flatFilieres.map((filiere) => (
              <option key={filiere._id} value={filiere._id}>
                {filiere.designation} - {filiere.description}
              </option>
            ))}
          </select>
          
          {selectedFiliere && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedFiliere.designation}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {flatFilieres.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Aucune filière trouvée pour votre compte. Contactez l'administrateur.
          </p>
        </div>
      )}
    </div>
  );
};

// Layout principal
export default function AcademiqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<Filiere | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les filières
  const fetchFilieres = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/mentions?agentId=${user.userId}`);
      const result = await response.json();
      
      if (result.success) {
        setFilieres(result.data);
        setError(null);
        
        // Auto-sélectionner la première filière s'il n'y en a qu'une
        const flatFilieres = result.data.flat();
        if (flatFilieres.length === 1 && !selectedFiliere) {
          setSelectedFiliere(flatFilieres[0]);
        }
      } else {
        setError(result.error || 'Erreur lors du chargement des filières');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchFilieres();
    }
  }, [user?.userId]);

  const contextValue: AcademiqueContextType = {
    filieres,
    selectedFiliere,
    setSelectedFiliere,
    loading,
    error,
    refreshFilieres: fetchFilieres
  };

  return (
    <AcademiqueContext.Provider value={contextValue}>
      <div className="space-y-6">
        {/* Header avec sélecteur de filière */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Gestion Académique</h1>
          <p className="text-blue-100">
            Gérez les promotions et classes de vos filières
          </p>
        </div>

        {/* Sélecteur de filière */}
        <FiliereSelector />

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 dark:text-red-200 font-medium">Erreur</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenu des pages enfants */}
        {children}
      </div>
    </AcademiqueContext.Provider>
  );
}
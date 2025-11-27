'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Types
interface Annee {
  _id: string;
  debut: string;
  fin: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Icônes
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.197m3 2.197V9a3 3 0 00-6 0v12z" />
  </svg>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

export default function InscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les années académiques
  useEffect(() => {
    fetchAnnees();
  }, []);

  const fetchAnnees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/annees');
      const result = await response.json();

      if (result.success) {
        setAnnees(result.data || []);
        
        // Sélectionner l'année active par défaut
        const activeAnnee = result.data?.find((annee: Annee) => annee.isActive);
        if (activeAnnee) {
          setSelectedAnnee(activeAnnee);
          // Stocker l'année sélectionnée dans localStorage pour les composants enfants
          localStorage.setItem('selectedAnnee', JSON.stringify(activeAnnee));
        }
        
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des années');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des années:', error);
      setError('Erreur de connexion au serveur');
      setAnnees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnneeChange = (annee: Annee) => {
    setSelectedAnnee(annee);
    // Stocker l'année sélectionnée dans localStorage
    localStorage.setItem('selectedAnnee', JSON.stringify(annee));
    
    // Déclencher un événement personnalisé pour notifier les composants enfants
    window.dispatchEvent(new CustomEvent('anneeChanged', { detail: annee }));
  };

  // Onglets de navigation pour les cycles
  const cycles = [
    { id: 'Preparatoire', label: 'Préparatoire', icon: AcademicCapIcon },
    { id: 'Licence', label: 'Licence', icon: UsersIcon },
    { id: 'Master', label: 'Master', icon: CalendarIcon }
  ];

  const getCurrentCycle = () => {
    const pathSegments = pathname.split('/');
    const cycleIndex = pathSegments.findIndex(segment => segment === 'inscriptions') + 1;
    return pathSegments[cycleIndex] || 'graduat';
  };

  const currentCycle = getCurrentCycle();

  return (
    <div className="space-y-6">
      {/* En-tête avec sélection d'année */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Inscriptions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Inscrivez les étudiants dans les promotions par cycle d'études
            </p>
          </div>
          
          {/* Sélecteur d'année académique */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Année académique:
              </span>
            </div>
            
            {loading ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : (
              <select
                value={selectedAnnee?._id || ''}
                onChange={(e) => {
                  const annee = annees.find(a => a._id === e.target.value);
                  if (annee) handleAnneeChange(annee);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[200px]"
              >
                <option value="">Sélectionner une année</option>
                {annees.map((annee) => (
                  <option key={annee._id} value={annee._id}>
                    {annee.debut} - {annee.fin} {annee.isActive && '(Active)'}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {/* Informations sur l'année sélectionnée */}
        {selectedAnnee && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Année Académique {selectedAnnee.debut} - {selectedAnnee.fin}
                </h3>
              </div>
              {selectedAnnee.isActive && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Année Active
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation par cycles */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {cycles.map((cycle) => {
              const isActive = currentCycle === cycle.id;
              const IconComponent = cycle.icon;
              
              return (
                <button
                  key={cycle.id}
                  onClick={() => router.push(`/inscriptions/${cycle.id}`)}
                  className={`
                    flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{cycle.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu des pages enfants */}
      {selectedAnnee ? (
        <div>
          {children}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune année sélectionnée
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Veuillez sélectionner une année académique pour continuer.
          </p>
        </div>
      )}
    </div>
  );
}
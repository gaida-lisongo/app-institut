'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Types
interface Promotion {
  _id: string;
  designation: string;
  systeme: string;
  niveau: string;
  cycle: string;
  semestres?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Annee {
  _id: string;
  debut: string;
  fin: string;
  isActive: boolean;
}

interface Parcours {
  _id: string;
  etudiantId: {
    _id: string;
    matricule: string;
    nom: string;
    prenom: string;
    sexe: string;
  };
  promotionId: string;
  anneeId: string;
  statut: 'En cours' | 'Terminé' | 'Annulé';
}

// Icônes
const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.197m3 2.197V9a3 3 0 00-6 0v12z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

export default function InscriptionsCyclePage() {
  const params = useParams();
  const cycle = params.cycle as string;
  
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInscriptions, setShowInscriptions] = useState<{
    visible: boolean;
    promotionId?: string;
  }>({ visible: false });
  const [inscriptions, setInscriptions] = useState<Parcours[]>([]);
  const [inscriptionsLoading, setInscriptionsLoading] = useState(false);

  // Écouter les changements d'année depuis le layout
  useEffect(() => {
    // Récupérer l'année depuis localStorage au chargement
    const storedAnnee = localStorage.getItem('selectedAnnee');
    if (storedAnnee) {
      setSelectedAnnee(JSON.parse(storedAnnee));
    }

    // Écouter les changements d'année
    const handleAnneeChange = (event: CustomEvent) => {
      setSelectedAnnee(event.detail);
    };

    window.addEventListener('anneeChanged', handleAnneeChange as EventListener);
    
    return () => {
      window.removeEventListener('anneeChanged', handleAnneeChange as EventListener);
    };
  }, []);

  // Récupérer les promotions quand l'année ou le cycle change
  useEffect(() => {
    if (selectedAnnee && cycle) {
      fetchPromotions();
    }
  }, [selectedAnnee, cycle]);

  const fetchPromotions = async () => {
    if (!cycle) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/promotions?cycle=${encodeURIComponent(cycle)}`);
      const result = await response.json();

      if (result.success) {
        setPromotions(result.data || []);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des promotions');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des promotions:', error);
      setError('Erreur de connexion au serveur');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInscriptions = async (promotionId: string) => {
    if (!selectedAnnee) return;
    
    try {
      setInscriptionsLoading(true);
      const response = await fetch(
        `/api/parcours?promotionId=${promotionId}&anneeId=${selectedAnnee._id}`
      );
      const result = await response.json();

      if (result.success) {
        setInscriptions(result.data || []);
      } else {
        console.error('Erreur lors du chargement des inscriptions:', result.error);
        setInscriptions([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions:', error);
      setInscriptions([]);
    } finally {
      setInscriptionsLoading(false);
    }
  };

  const handleViewInscriptions = (promotionId: string) => {
    setShowInscriptions({ visible: true, promotionId });
    fetchInscriptions(promotionId);
  };

  const handleCloseInscriptions = () => {
    setShowInscriptions({ visible: false });
    setInscriptions([]);
  };

  const getCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      'graduat': 'Graduat',
      'licence': 'Licence', 
      'master': 'Master'
    };
    return labels[cycle] || cycle;
  };

  const getCycleIcon = (cycle: string) => {
    switch (cycle) {
      case 'graduat': return AcademicCapIcon;
      case 'licence': return UsersIcon;
      case 'master': return AcademicCapIcon;
      default: return AcademicCapIcon;
    }
  };

  const CycleIcon = getCycleIcon(cycle);

  // Rendu conditionnel pour les inscriptions
  if (showInscriptions.visible) {
    const currentPromotion = promotions.find(p => p._id === showInscriptions.promotionId);
    
    return (
      <div className="space-y-6">
        {/* En-tête des inscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCloseInscriptions}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Retour aux promotions"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inscriptions - {currentPromotion?.designation}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {getCycleLabel(cycle)} • {selectedAnnee?.debut} - {selectedAnnee?.fin}
                </p>
              </div>
            </div>
            
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle Inscription
            </button>
          </div>

          {/* Statistiques des inscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {inscriptions.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Inscriptions
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {inscriptions.filter(i => i.statut === 'En cours').length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                En Cours
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {inscriptions.filter(i => i.statut === 'Terminé').length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Terminées
              </div>
            </div>
          </div>
        </div>

        {/* Liste des inscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Liste des Étudiants Inscrits
            </h3>
            
            {inscriptionsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400">Chargement des inscriptions...</div>
              </div>
            ) : inscriptions.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune inscription
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun étudiant n'est encore inscrit dans cette promotion.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sexe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {inscriptions.map((inscription) => (
                      <tr key={inscription._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {inscription.etudiantId.nom} {inscription.etudiantId.prenom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {inscription.etudiantId.matricule}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {inscription.etudiantId.sexe}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${inscription.statut === 'En cours' 
                              ? 'bg-green-100 text-green-800' 
                              : inscription.statut === 'Terminé'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                            }
                          `}>
                            {inscription.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rendu principal - Liste des promotions
  return (
    <div className="space-y-6">
      {/* En-tête du cycle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <CycleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inscriptions {getCycleLabel(cycle)}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {selectedAnnee?.debut} - {selectedAnnee?.fin} • Gérez les inscriptions des étudiants
            </p>
          </div>
        </div>
      </div>
 
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Liste des promotions */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400">Chargement des promotions...</div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune promotion {getCycleLabel(cycle)}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Aucune promotion trouvée pour le cycle {getCycleLabel(cycle)}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <div
              key={promotion._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {promotion.designation}
                </h3>
                <CycleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Système:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{promotion.systeme}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Niveau:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{promotion.niveau}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Cycle:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{promotion.cycle}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={() => handleViewInscriptions(promotion._id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Voir les Inscriptions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
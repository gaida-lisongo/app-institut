'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BulkInscriptionModal from '@/components/inscriptions/BulkInscriptionModal';
import AccessCard from '@/utils/AccessCard';
import UpdateParcoursStatusCsv from '@/components/csv/UpdateParcoursStatusCsv';

// Types
export interface Promotion {
  _id: string;
  designation: string;
  systeme: string;
  niveau: string;
  cycle: string;
  semestres?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Annee {
  _id: string;
  debut: string;
  fin: string;
  isActive: boolean;
}

export interface Parcours {
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

const InscriptionsManager = ({inscriptions, onUpdate, onDelete} : {
  inscriptions: Parcours[];
  onUpdate?: (parcoursId: string, newStatut: 'En cours' | 'Terminé' | 'Annulé') => void;
  onDelete?: (parcoursId: string) => void;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInscriptions, setFilteredInscriptions] = useState<Parcours[]>(inscriptions);

    // Filtrer les inscriptions localement
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredInscriptions(inscriptions);
        } else {
            const filtered = inscriptions.filter(inscription => 
                inscription.etudiantId.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inscription.etudiantId.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inscription.etudiantId.matricule.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredInscriptions(filtered);
        }
    }, [searchTerm, inscriptions]);

    const handleDeleteParcours = async (parcoursId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) return;
        
        try {
            const response = await fetch(`/api/parcours/${parcoursId}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                onDelete?.(parcoursId);
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleUpdateStatut = async (parcoursId: string, newStatut: 'En cours' | 'Terminé' | 'Annulé') => {
        try {
            const response = await fetch(`/api/parcours/${parcoursId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ statut: newStatut }),
            });
            
            if (response.ok) {
                onUpdate?.(parcoursId, newStatut);
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour');
        }
    };

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case 'En cours': return 'bg-green-100 text-green-800 border-green-200';
            case 'Terminé': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Annulé': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Résultats de recherche */}
            {searchTerm && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredInscriptions.length} résultat(s) trouvé(s) pour "{searchTerm}"
                </div>
            )}

            {/* Grille de cartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInscriptions.map((inscription) => (
                    <div
                        key={inscription._id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                        {/* En-tête de la carte */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {inscription.etudiantId.nom} {inscription.etudiantId.prenom}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {inscription.etudiantId.matricule}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatutColor(inscription.statut)}`}>
                                    {inscription.statut}
                                </span>
                            </div>
                        </div>

                        {/* Informations de l'étudiant */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Sexe:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{inscription.etudiantId.sexe}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                            {/* Dropdown pour changer le statut */}
                            <select
                                value={inscription.statut}
                                onChange={(e) => handleUpdateStatut(inscription._id, e.target.value as 'En cours' | 'Terminé' | 'Annulé')}
                                className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="En cours">En cours</option>
                                <option value="Terminé">Terminé</option>
                                <option value="Annulé">Annulé</option>
                            </select>

                            {/* Bouton de suppression */}
                            <button
                                onClick={() => handleDeleteParcours(inscription._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer l'inscription"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message si aucun résultat */}
            {filteredInscriptions.length === 0 && (
                <div className="text-center py-12">
                    <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'Aucun étudiant trouvé' : 'Aucune inscription'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm 
                            ? `Aucun étudiant ne correspond à "${searchTerm}"`
                            : 'Aucun étudiant n\'est encore inscrit dans cette promotion.'
                        }
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Effacer la recherche
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkModalPromotionId, setBulkModalPromotionId] = useState<string | null>(null);

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

  const handleBulkInscriptionSuccess = () => {
    // Rafraîchir les inscriptions après un ajout en lot
    if (showInscriptions.promotionId) {
      fetchInscriptions(showInscriptions.promotionId);
    }
  };

  const handleOpenBulkModal = (promotionId: string) => {
    setBulkModalPromotionId(promotionId);
    setShowBulkModal(true);
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    setBulkModalPromotionId(null);
  };

  const handleUpdateInscription = (parcoursId: string, newStatut: 'En cours' | 'Terminé' | 'Annulé') => {
    setInscriptions(prev => 
      prev.map(inscription => 
        inscription._id === parcoursId 
          ? { ...inscription, statut: newStatut }
          : inscription
      )
    );
  };

  const handleDeleteInscription = (parcoursId: string) => {
    setInscriptions(prev => prev.filter(inscription => inscription._id !== parcoursId));
  };

  const printCardAccess = async (currentPromotion: Promotion) => {
    if (!selectedAnnee) {
      alert('Aucune année académique sélectionnée.');
      return;
    }

    if (inscriptions.length === 0) {
      alert('Aucune inscription trouvée pour cette promotion.');
      return;
    }

    try {
      const accessCard = new AccessCard(currentPromotion, selectedAnnee, inscriptions);
      await accessCard.generatePDF();
    } catch (error) {
      console.error('Erreur lors de la génération des cartes d\'accès:', error);
      alert('Erreur lors de la génération des cartes d\'accès.');
    }
  };

  const getCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      'Preparatoire': 'Préparatoire',
      'Licence': 'Licence', 
      'Master': 'Master'
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

            <div className="flex space-x-4">            
              <UpdateParcoursStatusCsv promotionId={currentPromotion?._id as string} />
              
              <button
                onClick={() => printCardAccess(currentPromotion as Promotion)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <UsersIcon className="h-5 w-5 mr-2" />
                Cartes d'accès
              </button>
              
            </div>
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
              <InscriptionsManager 
                inscriptions={inscriptions} 
                onUpdate={handleUpdateInscription}
                onDelete={handleDeleteInscription}
              />
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

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2">
                <button 
                  onClick={() => handleViewInscriptions(promotion._id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Voir les Inscriptions
                </button>
                
                <button 
                  onClick={() => handleOpenBulkModal(promotion._id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Inscription en lot (CSV)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal d'inscription en lot */}
      {showBulkModal && bulkModalPromotionId && selectedAnnee && (
        <BulkInscriptionModal
          isOpen={showBulkModal}
          onClose={handleCloseBulkModal}
          promotionId={bulkModalPromotionId}
          anneeId={selectedAnnee._id}
          onSuccess={handleBulkInscriptionSuccess}
        />
      )}
    </div>
  );
}
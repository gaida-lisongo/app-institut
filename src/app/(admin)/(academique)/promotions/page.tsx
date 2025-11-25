'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademique } from '../layout';

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

// Composants d'icônes
export const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export default function ClassesPage() {
  const router = useRouter();
  const { selectedFiliere, refreshFilieres } = useAcademique();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // États pour les formulaires
  const [newPromotion, setNewPromotion] = useState({
    designation: '',
    systeme: 'LMD',
    niveau: 'L1',
    cycle: 'Licence'
  });

  const [editPromotion, setEditPromotion] = useState({
    designation: '',
    systeme: 'LMD',
    niveau: 'L1',
    cycle: 'Licence'
  });

  // Récupérer les promotions de la filière sélectionnée
  useEffect(() => {
    if (selectedFiliere) {
      // Les promotions sont déjà populées grâce à la correction du backend
      setPromotions(selectedFiliere.promotions || []);
    } else {
      setPromotions([]);
    }
  }, [selectedFiliere]);

  // Créer une nouvelle promotion
  const handleCreatePromotion = async () => {
    if (!selectedFiliere || !newPromotion.designation.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPromotion,
          filiereId: selectedFiliere._id
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour la filière avec la nouvelle promotion
        await updateFiliereWithPromotion(result.data._id);
        
        // Ajouter la nouvelle promotion à la liste locale
        setPromotions(prev => [...prev, result.data]);
        
        setShowCreateModal(false);
        setNewPromotion({ designation: '', systeme: 'LMD', niveau: 'L1', cycle: 'Licence' });
        setError(null);
      } else {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une promotion
  const handleUpdatePromotion = async () => {
    if (!selectedPromotion || !editPromotion.designation.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/promotions/${selectedPromotion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPromotion),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour la liste locale
        setPromotions(prev => 
          prev.map(p => p._id === selectedPromotion._id ? result.data : p)
        );
        
        setShowEditModal(false);
        setSelectedPromotion(null);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une promotion
  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/promotions/${promotionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Retirer la promotion de la filière
        await removeFilierePromotion(promotionId);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter la promotion à la filière
  const updateFiliereWithPromotion = async (promotionId: string) => {
    if (!selectedFiliere) return;

    try {
      const response = await fetch(`/api/filieres/${selectedFiliere._id}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promotionId }),
      });

      if (response.ok) {
        // Rafraîchir les données
        refreshFilieres();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la filière:', error);
    }
  };

  // Retirer la promotion de la filière
  const removeFilierePromotion = async (promotionId: string) => {
    if (!selectedFiliere) return;

    try {
      const response = await fetch(`/api/filieres/${selectedFiliere._id}/promotions/${promotionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mettre à jour la liste locale
        setPromotions(prev => prev.filter(p => p._id !== promotionId));
        refreshFilieres();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la filière:', error);
    }
  };

  if (!selectedFiliere) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucune filière sélectionnée
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une filière pour gérer ses promotions et classes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Promotions - {selectedFiliere.designation}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {selectedFiliere.description}
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle Promotion
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {promotions.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Promotions
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {promotions.filter(p => p.systeme === 'LMD').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Système LMD
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {promotions.filter(p => p.systeme === 'Classique').length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Système Classique
            </div>
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
      {promotions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune promotion
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Commencez par créer une promotion pour cette filière.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer une promotion
          </button>
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPromotion(promotion);
                      setEditPromotion({
                        designation: promotion.designation,
                        systeme: promotion.systeme,
                        niveau: promotion.niveau,
                        cycle: promotion.cycle
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeletePromotion(promotion._id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Créée le:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(promotion.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button 
                  onClick={() => {
                    console.log(promotion);
                    //save current promotion to localhost in promotions array
                    const lastPromotions = (localStorage.getItem('promotions'));
                    if (lastPromotions) {
                      const oldPromotions = JSON.parse(lastPromotions);
                      //Is exists
                      const isExists = oldPromotions.some((p: any) => p._id === promotion._id);
                      if (!isExists) {
                        oldPromotions.push(promotion);
                        localStorage.setItem('promotions', JSON.stringify(oldPromotions));
                      }
                      
                    } else {
                      localStorage.setItem('promotions', JSON.stringify([promotion]));
                    }

                    //redirect to promotions page
                    router.push(`/promotions/${promotion?._id}`);
                  }}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Gérer les semestres
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Créer une nouvelle promotion
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={newPromotion.designation}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Promotion 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Système *
                  </label>
                  <select
                    value={newPromotion.systeme}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, systeme: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LMD">LMD</option>
                    <option value="Classique">Classique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau *
                  </label>
                  <select
                    value={newPromotion.niveau}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, niveau: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cycle *
                  </label>
                  <select
                    value={newPromotion.cycle}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, cycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Licence">Licence</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPromotion({ designation: '', systeme: 'LMD', niveau: 'L1', cycle: 'Licence' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreatePromotion}
                  disabled={loading || !newPromotion.designation.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Modifier la promotion
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={editPromotion.designation}
                    onChange={(e) => setEditPromotion(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Système *
                  </label>
                  <select
                    value={editPromotion.systeme}
                    onChange={(e) => setEditPromotion(prev => ({ ...prev, systeme: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LMD">LMD</option>
                    <option value="Classique">Classique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau *
                  </label>
                  <select
                    value={editPromotion.niveau}
                    onChange={(e) => setEditPromotion(prev => ({ ...prev, niveau: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cycle *
                  </label>
                  <select
                    value={editPromotion.cycle}
                    onChange={(e) => setEditPromotion(prev => ({ ...prev, cycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Licence">Licence</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPromotion(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdatePromotion}
                  disabled={loading || !editPromotion.designation.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
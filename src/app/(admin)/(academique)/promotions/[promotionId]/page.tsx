'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon } from '../page';

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

interface Semestre {
  _id: string;
  designation: string;
  credits: number;
  unites: string[];
  createdAt: string;
  updatedAt: string;
}

// Icône pour les semestres
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function PromotionSemestresPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.promotionId as string;

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(null);

  // États pour les formulaires
  const [newSemestre, setNewSemestre] = useState({
    designation: '',
    credits: 1
  });

  const [editSemestre, setEditSemestre] = useState({
    designation: '',
    credits: 1
  });

  // Récupérer la promotion depuis localStorage
  useEffect(() => {
    const promotionsData = localStorage.getItem('promotions');
    if (promotionsData) {
      const promotions: Promotion[] = JSON.parse(promotionsData);
      const currentPromotion = promotions.find(p => p._id === promotionId);
      if (currentPromotion) {
        setPromotion(currentPromotion);
        fetchSemestres(promotionId);
      } else {
        setError('Promotion non trouvée dans le localStorage');
      }
    } else {
      setError('Aucune promotion trouvée dans le localStorage');
    }
  }, [promotionId]);

  // Récupérer les semestres de la promotion
  const fetchSemestres = async (promotionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/semestres?promotionId=${promotionId}`);
      const result = await response.json();

      if (result.success) {
        setSemestres(result.data || []);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des semestres');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des semestres:', error);
      setError('Erreur de connexion au serveur');
      setSemestres([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau semestre
  const handleCreateSemestre = async () => {
    if (!promotion || !newSemestre.designation.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/semestres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designation: newSemestre.designation,
          credits: newSemestre.credits,
          promotionId: promotion._id
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Ajouter le nouveau semestre à la liste locale
        setSemestres(prev => [...prev, result.data]);
        
        setShowCreateModal(false);
        setNewSemestre({ designation: '', credits: 1 });
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

  // Mettre à jour un semestre
  const handleUpdateSemestre = async () => {
    if (!selectedSemestre || !editSemestre.designation.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/semestres/${selectedSemestre._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editSemestre),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour la liste locale
        setSemestres(prev => 
          prev.map(s => s._id === selectedSemestre._id ? result.data : s)
        );
        
        setShowEditModal(false);
        setSelectedSemestre(null);
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

  // Supprimer un semestre
  const handleDeleteSemestre = async (semestreId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce semestre ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/semestres/${semestreId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Retirer le semestre de la liste locale
        setSemestres(prev => prev.filter(s => s._id !== semestreId));
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

  if (!promotion) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Promotion non trouvée
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error || 'Impossible de charger les informations de la promotion.'}
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Retour"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Semestres - {promotion.designation}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {promotion.systeme} • {promotion.niveau} • {promotion.cycle}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau Semestre
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {semestres.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Semestres
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {semestres.reduce((total, s) => total + s.credits, 0)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Total Crédits
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

      {/* Liste des semestres */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
        </div>
      ) : semestres.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun semestre
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Commencez par créer un semestre pour cette promotion.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Créer un semestre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semestres
            .sort((a, b) => a.credits - b.credits)
            .map((semestre) => (
            <div
              key={semestre._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {semestre.designation}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSemestre(semestre);
                      setEditSemestre({
                        designation: semestre.designation,
                        credits: semestre.credits
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteSemestre(semestre._id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Crédits:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{semestre.credits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Unites:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {semestre.unites.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                  Gérer les matières
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
                Créer un nouveau semestre
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={newSemestre.designation}
                    onChange={(e) => setNewSemestre(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Semestre 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crédits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newSemestre.credits}
                    onChange={(e) => setNewSemestre(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSemestre({ designation: '', credits: 1 });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateSemestre}
                  disabled={loading || !newSemestre.designation.trim()}
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
      {showEditModal && selectedSemestre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Modifier le semestre
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation *
                  </label>
                  <input
                    type="text"
                    value={editSemestre.designation}
                    onChange={(e) => setEditSemestre(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crédits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editSemestre.credits}
                    onChange={(e) => setEditSemestre(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSemestre(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateSemestre}
                  disabled={loading || !editSemestre.designation.trim()}
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
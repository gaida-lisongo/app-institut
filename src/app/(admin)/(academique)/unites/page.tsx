'use client';

import React, { useState, useEffect } from 'react';
import { useAcademique } from '../layout';
import { CSVImportModal } from '@/components/csv/CSVImportModal';
import { csvValidators, csvTransformers } from '@/utils/csvParser';

// Types
interface Unite {
  _id: string;
  designation: string;
  code: string;
  descriptions?: string;
  credits: number;
  filiereId: string;
  matieres: string[];
  createdAt: string;
  updatedAt: string;
}

interface Matiere {
  _id: string;
  designation: string;
  code: string;
  descriptions?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

// Icônes
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ArrowUpTrayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export default function UnitesPage() {
  const { selectedFiliere } = useAcademique();
  const [unites, setUnites] = useState<Unite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnite, setSelectedUnite] = useState<Unite | null>(null);
  const [showMatieres, setShowMatieres] = useState<{
        visible: boolean;
        data?: Unite
    }>({
        visible: false
    })

  // États pour les matières
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [showCreateMatiereModal, setShowCreateMatiereModal] = useState(false);
  const [showEditMatiereModal, setShowEditMatiereModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);

  // État pour l'importation CSV
  const [showImportModal, setShowImportModal] = useState(false);

  // États pour les formulaires
  const [newUnite, setNewUnite] = useState({
    designation: '',
    code: '',
    descriptions: '',
    credits: 1
  });

  const [editUnite, setEditUnite] = useState({
    designation: '',
    code: '',
    descriptions: '',
    credits: 1
  });

  // États pour les formulaires des matières
  const [newMatiere, setNewMatiere] = useState({
    designation: '',
    code: '',
    descriptions: '',
    credits: 1
  });

  const [editMatiere, setEditMatiere] = useState({
    designation: '',
    code: '',
    descriptions: '',
    credits: 1
  });

  // Récupérer les unités de la filière sélectionnée
  const fetchUnites = async (filiereId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/unites?filiereId=${filiereId}`);
      const result = await response.json();

      if (result.success) {
        setUnites(result.data || []);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des unités');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des unités:', error);
      setError('Erreur de connexion au serveur');
      setUnites([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect pour charger les unités quand la filière change
  useEffect(() => {
    if (selectedFiliere?._id) {
      fetchUnites(selectedFiliere._id);
    } else {
      setUnites([]);
    }
  }, [selectedFiliere]);

  // Créer une nouvelle unité
  const handleCreateUnite = async () => {
    if (!selectedFiliere || !newUnite.designation.trim() || !newUnite.code.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/unites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designation: newUnite.designation,
          code: newUnite.code,
          descriptions: newUnite.descriptions,
          credits: newUnite.credits,
          filiereId: selectedFiliere._id
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Ajouter la nouvelle unité à la liste locale
        setUnites(prev => [...prev, result.data]);
        
        setShowCreateModal(false);
        setNewUnite({ designation: '', code: '', descriptions: '', credits: 1 });
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

  // Mettre à jour une unité
  const handleUpdateUnite = async () => {
    if (!selectedUnite || !editUnite.designation.trim() || !editUnite.code.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/unites/${selectedUnite._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...editUnite,
            matieres: selectedUnite?.matieres
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour la liste locale
        setUnites(prev => 
          prev.map(u => u._id === selectedUnite._id ? result.data : u)
        );
        
        setShowEditModal(false);
        setSelectedUnite(null);
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

  // Supprimer une unité
  const handleDeleteUnite = async (uniteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette unité ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/unites/${uniteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Retirer l'unité de la liste locale
        setUnites(prev => prev.filter(u => u._id !== uniteId));
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

  // === FONCTIONS CRUD POUR LES MATIÈRES ===

  // Récupérer les matières d'une unité
  const fetchMatieres = async (uniteId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matieres?uniteId=${uniteId}`);
      const result = await response.json();

      if (result.success) {
        setMatieres(result.data || []);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des matières');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des matières:', error);
      setError('Erreur de connexion au serveur');
      setMatieres([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle matière
  const handleCreateMatiere = async () => {
    if (!showMatieres.data || !newMatiere.designation.trim() || !newMatiere.code.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/matieres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designation: newMatiere.designation,
          code: newMatiere.code,
          descriptions: newMatiere.descriptions,
          credits: newMatiere.credits,
          uniteId: showMatieres.data._id
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Ajouter la nouvelle matière à la liste locale
        setMatieres(prev => [...prev, result.data]);
        
        setShowCreateMatiereModal(false);
        setNewMatiere({ designation: '', code: '', descriptions: '', credits: 1 });
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

  // Mettre à jour une matière
  const handleUpdateMatiere = async () => {
    if (!selectedMatiere || !editMatiere.designation.trim() || !editMatiere.code.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/matieres/${selectedMatiere._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editMatiere),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour la liste locale
        setMatieres(prev => 
          prev.map(m => m._id === selectedMatiere._id ? result.data : m)
        );
        
        setShowEditMatiereModal(false);
        setSelectedMatiere(null);
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

  // Supprimer une matière
  const handleDeleteMatiere = async (matiereId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/matieres/${matiereId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Retirer la matière de la liste locale
        setMatieres(prev => prev.filter(m => m._id !== matiereId));
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

  // Effect pour charger les matières quand une unité est sélectionnée
  useEffect(() => {
    if (showMatieres.visible && showMatieres.data?._id) {
      fetchMatieres(showMatieres.data._id);
    }
  }, [showMatieres.visible, showMatieres.data?._id]);

  // === FONCTIONS D'IMPORTATION CSV ===

  // Champs pour l'import CSV des unités
  const csvTargetFields = [
    {
      key: 'designation',
      label: 'Désignation',
      required: true,
      description: 'Nom de l\'unité d\'enseignement',
    },
    {
      key: 'code',
      label: 'Code',
      required: true,
      description: 'Code unique de l\'unité (ex: UE001)',
    },
    {
      key: 'descriptions',
      label: 'Description',
      required: false,
      description: 'Description optionnelle de l\'unité',
    },
    {
      key: 'credits',
      label: 'Crédits',
      required: false,
      description: 'Nombre de crédits (sera calculé automatiquement si vide)',
    },
  ];

  // Importer une unité depuis CSV
  const handleImportUnite = async (data: Record<string, any>) => {
    if (!selectedFiliere) {
      return { success: false, error: 'Aucune filière sélectionnée' };
    }

    try {
      const response = await fetch('/api/unites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          filiereId: selectedFiliere._id,
          credits: data.credits || 1, // Valeur par défaut
        }),
      });

      const result = await response.json();
      
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // Gérer la fin de l'import
  const handleImportComplete = (results: {
    successful: number;
    failed: number;
    errors: any[];
  }) => {
    setShowImportModal(false);
    
    // Recharger les unités pour afficher les nouvelles données
    if (selectedFiliere?._id) {
      fetchUnites(selectedFiliere._id);
    }

    if (results.successful > 0) {
      alert(
        `Import terminé: ${results.successful} unités importées avec succès${
          results.failed > 0 ? `, ${results.failed} erreurs` : ''
        }`
      );
    }
  };

  // Si aucune filière n'est sélectionnée
  if (!selectedFiliere) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucune filière sélectionnée
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez sélectionner une filière pour gérer ses unités d'enseignement.
        </p>
      </div>
    );
  }

  const renderUnites = () => {

    return (
        <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Unités d'Enseignement - {selectedFiliere.designation}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gérez les unités d'enseignement de cette filière
                </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Importer CSV
              </button>

              <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nouvelle Unité
              </button>
            </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {unites.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                Unités
                </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {unites.reduce((total, u) => total + u.credits, 0)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                Total Crédits
                </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {unites.reduce((total, u) => total + u.matieres.length, 0)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                Total Matières
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

        {/* Liste des unités */}
        {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
            </div>
        ) : unites.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune unité
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                Commencez par créer une unité d'enseignement pour cette filière.
            </p>
            <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Créer une unité
            </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unites
                .sort((a, b) => a.designation.localeCompare(b.designation))
                .map((unite) => (
                <div
                key={unite._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {unite.designation}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                        {unite.code}
                    </p>
                    </div>
                    <div className="flex items-center space-x-2">
                    <button
                        onClick={() => {
                        setSelectedUnite(unite);
                        setEditUnite({
                            designation: unite.designation,
                            code: unite.code,
                            descriptions: unite.descriptions || '',
                            credits: unite.credits
                        });
                        setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                        title="Modifier"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                        onClick={() => handleDeleteUnite(unite._id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        title="Supprimer"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                    </div>
                </div>

                {unite.descriptions && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {unite.descriptions}
                    </p>
                )}

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Crédits:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{unite.credits}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Matières:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {unite.matieres.length}
                    </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(unite.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button 
                    onClick={() => setShowMatieres({ visible: true, data: unite })}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
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
                    Créer une nouvelle unité
                </h2>
                
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Désignation *
                    </label>
                    <input
                        type="text"
                        value={newUnite.designation}
                        onChange={(e) => setNewUnite(prev => ({ ...prev, designation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Ex: Mathématiques Générales"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code *
                    </label>
                    <input
                        type="text"
                        value={newUnite.code}
                        onChange={(e) => setNewUnite(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                        placeholder="Ex: MATH101"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={newUnite.descriptions}
                        onChange={(e) => setNewUnite(prev => ({ ...prev, descriptions: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={3}
                        placeholder="Description de l'unité d'enseignement..."
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Crédits *
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={newUnite.credits}
                        onChange={(e) => setNewUnite(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                    onClick={() => {
                        setShowCreateModal(false);
                        setNewUnite({ designation: '', code: '', descriptions: '', credits: 1 });
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                    Annuler
                    </button>
                    <button
                    onClick={handleCreateUnite}
                    disabled={loading || !newUnite.designation.trim() || !newUnite.code.trim()}
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
        {showEditModal && selectedUnite && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Modifier l'unité
                </h2>
                
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Désignation *
                    </label>
                    <input
                        type="text"
                        value={editUnite.designation}
                        onChange={(e) => setEditUnite(prev => ({ ...prev, designation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code *
                    </label>
                    <input
                        type="text"
                        value={editUnite.code}
                        onChange={(e) => setEditUnite(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={editUnite.descriptions}
                        onChange={(e) => setEditUnite(prev => ({ ...prev, descriptions: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={3}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Crédits *
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={editUnite.credits}
                        onChange={(e) => setEditUnite(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                    onClick={() => {
                        setShowEditModal(false);
                        setSelectedUnite(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                    Annuler
                    </button>
                    <button
                    onClick={handleUpdateUnite}
                    disabled={loading || !editUnite.designation.trim() || !editUnite.code.trim()}
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

  const renderUnite = () => {
    if (!showMatieres.data) return null;

    return (
      <div className="space-y-6">
        {/* En-tête avec navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMatieres({ visible: false })}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Retour aux unités"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Matières - {showMatieres.data.designation}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Code: {showMatieres.data.code} • Gérez les matières de cette unité
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateMatiereModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle Matière
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {matieres.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Matières
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {matieres.reduce((total, m) => total + m.credits, 0)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Crédits
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {showMatieres.data.credits}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Crédits Unité
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

        {/* Liste des matières */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
          </div>
        ) : matieres.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune matière
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Commencez par créer une matière pour cette unité d'enseignement.
            </p>
            <button
              onClick={() => setShowCreateMatiereModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer une matière
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matieres
              .sort((a, b) => a.designation.localeCompare(b.designation))
              .map((matiere) => (
                <div
                  key={matiere._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {matiere.designation}
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                        {matiere.code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMatiere(matiere);
                          setEditMatiere({
                            designation: matiere.designation,
                            code: matiere.code,
                            descriptions: matiere.descriptions || '',
                            credits: matiere.credits
                          });
                          setShowEditMatiereModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteMatiere(matiere._id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {matiere.descriptions && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {matiere.descriptions}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Crédits:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{matiere.credits}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(matiere.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Modal de création de matière */}
        {showCreateMatiereModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Créer une nouvelle matière
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Désignation *
                    </label>
                    <input
                      type="text"
                      value={newMatiere.designation}
                      onChange={(e) => setNewMatiere(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Algèbre Linéaire"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={newMatiere.code}
                      onChange={(e) => setNewMatiere(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                      placeholder="Ex: ALG101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newMatiere.descriptions}
                      onChange={(e) => setNewMatiere(prev => ({ ...prev, descriptions: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Description de la matière..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Crédits *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newMatiere.credits}
                      onChange={(e) => setNewMatiere(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateMatiereModal(false);
                      setNewMatiere({ designation: '', code: '', descriptions: '', credits: 1 });
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateMatiere}
                    disabled={loading || !newMatiere.designation.trim() || !newMatiere.code.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors"
                  >
                    {loading ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de modification de matière */}
        {showEditMatiereModal && selectedMatiere && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Modifier la matière
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Désignation *
                    </label>
                    <input
                      type="text"
                      value={editMatiere.designation}
                      onChange={(e) => setEditMatiere(prev => ({ ...prev, designation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={editMatiere.code}
                      onChange={(e) => setEditMatiere(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editMatiere.descriptions}
                      onChange={(e) => setEditMatiere(prev => ({ ...prev, descriptions: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Crédits *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editMatiere.credits}
                      onChange={(e) => setEditMatiere(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditMatiereModal(false);
                      setSelectedMatiere(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateMatiere}
                    disabled={loading || !editMatiere.designation.trim() || !editMatiere.code.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors"
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

  return (
    <div>
      {/* Contenu principal */}
      {showMatieres.visible ? renderUnite() : renderUnites()}
      
      {/* Modal d'import CSV */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importer des unités d'enseignement depuis un fichier CSV"
        targetFields={csvTargetFields}
        onImport={handleImportUnite}
        onComplete={handleImportComplete}
      />
    </div>
  );
}
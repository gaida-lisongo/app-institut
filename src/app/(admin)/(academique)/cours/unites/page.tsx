'use client';

import React, { useState, useEffect } from 'react';
import { useAcademique } from '../../layout';
import { CSVImportModal } from '@/components/csv/CSVImportModal';
import { csvValidators, csvTransformers } from '@/utils/csvParser';
import { Matiere, Unite } from '@/types/cours';
import UniteTable from '@/components/ui/cours/UniteTable';
import { ArrowUpTrayIcon, BookOpenIcon, PencilIcon, PlusIcon, TrashIcon } from '@/icons';



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
  // État pour l'importation CSV
  const [showImportModal, setShowImportModal] = useState(false);
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrer les unités selon le terme de recherche
  const filteredUnites = unites.filter(unite => 
    unite.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unite.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

            {/* Barre de recherche */}
            <div className="mt-6">
              <div className="max-w-md">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher une unité
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par désignation ou code..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {unites.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                Total Unités
                </div>
            </div>

            {searchTerm && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredUnites.length}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  Résultats
                </div>
              </div>
            )}
            
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
        ) : filteredUnites.length === 0 ? (
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
            {filteredUnites
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

  return (
    <div>
      {/* Contenu principal */}
      {showMatieres.visible ? 
        <UniteTable 
          matieres={matieres} 
          onCreate={
            (matiere: Matiere) => {
              setMatieres(prev => [...prev, matiere]);
              // Mettre à jour l'unité dans la liste des unités
              setUnites(prev => prev.map(unite => 
                unite._id === showMatieres.data?._id 
                  ? { ...unite, matieres: [...unite.matieres, matiere._id] }
                  : unite
              ));
              // Mettre à jour l'unité dans showMatieres
              setShowMatieres(prev => ({
                ...prev,
                data: prev.data ? {
                  ...prev.data,
                  matieres: [...prev.data.matieres, matiere._id]
                } : undefined
              }));
            }
          }
          onUpdate={
            (matiere: Matiere, matiereId: string) => {
              setMatieres(prev => prev.map(m => m._id === matiereId ? matiere : m));
            }
          } 
          onDelete={
            (matiereId: string) => {
              setMatieres(prev => prev.filter(m => m._id !== matiereId));
              // Mettre à jour l'unité dans la liste des unités
              setUnites(prev => prev.map(unite => 
                unite._id === showMatieres.data?._id 
                  ? { ...unite, matieres: unite.matieres.filter(id => id !== matiereId) }
                  : unite
              ));
              // Mettre à jour l'unité dans showMatieres
              setShowMatieres(prev => ({
                ...prev,
                data: prev.data ? {
                  ...prev.data,
                  matieres: prev.data.matieres.filter(id => id !== matiereId)
                } : undefined
              }));
            }
          }
          showMatieres={showMatieres} 
          setShowMatieres={setShowMatieres}
        /> : renderUnites()}
      
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
'use client'

import { BookOpenIcon, PencilIcon, PlusIcon, TrashIcon } from "@/icons";
import { Matiere, Unite } from "@/types/cours";
import { useState } from "react";

interface UniteTableProps {
    matieres: Matiere[];
    onCreate : (matiere: Matiere) => void;
    onUpdate : (matiere: Matiere, matiereId: string) => void;
    onDelete : (matiereId: string) => void;
    showMatieres: {
        visible: boolean;
        data?: Unite
    };
    setShowMatieres: (data: {
        visible: boolean;
        data?: Unite
    }) => void
}

 
const UniteTable = ({
    matieres,
    onCreate,
    onUpdate,
    onDelete,
    showMatieres,
    setShowMatieres
}: UniteTableProps) => {
  const [showCreateMatiereModal, setShowCreateMatiereModal] = useState(false);
  const [showEditMatiereModal, setShowEditMatiereModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
                onCreate(result.data);
                
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
                onUpdate(result.data, selectedMatiere._id);
                
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
                onDelete(matiereId);
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

  export default UniteTable;
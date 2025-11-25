'use client';

import React, { useState, useEffect } from 'react';

// Composants d'icônes SVG
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

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Interfaces
interface Annee {
  _id: string;
  debut: number;
  fin: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AnneesPage() {
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [filteredAnnees, setFilteredAnnees] = useState<Annee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAnneeDebut, setNewAnneeDebut] = useState<number>(new Date().getFullYear());
  const [editAnneeDebut, setEditAnneeDebut] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fonction pour récupérer les années
  const fetchAnnees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annees?page=${pagination.page}&limit=${pagination.limit}`);
      const result = await response.json();
      
      if (result.success) {
        setAnnees(result.data);
        setPagination(result.pagination);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des années');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAnnees(annees);
    } else {
      const filtered = annees.filter(annee => 
        `${annee.debut}-${annee.fin}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        annee.debut.toString().includes(searchTerm) ||
        annee.fin.toString().includes(searchTerm)
      );
      setFilteredAnnees(filtered);
    }
  }, [annees, searchTerm]);

  // Fonction pour créer une nouvelle année
  const handleCreateAnnee = async () => {
    try {
      const response = await fetch('/api/annees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            debut: newAnneeDebut,
            fin: newAnneeDebut + 1,
            isActive: false 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowCreateModal(false);
        setNewAnneeDebut(new Date().getFullYear());
        fetchAnnees();
      } else {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Fonction pour modifier une année
  const handleEditAnnee = async () => {
    if (!selectedAnnee) return;
    
    try {
      const response = await fetch(`/api/annees/${selectedAnnee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ debut: editAnneeDebut }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedAnnee(null);
        fetchAnnees();
      } else {
        setError(result.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Fonction pour supprimer une année
  const handleDeleteAnnee = async (anneeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette année ?')) return;
    
    try {
      const response = await fetch(`/api/annees/${anneeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        fetchAnnees();
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Fonction pour activer/désactiver une année
  const handleToggleActive = async (annee: Annee) => {
    try {
      const response = await fetch(`/api/annees/${annee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !annee.isActive }),
      });

      const result = await response.json();
      
      if (result.success) {
        fetchAnnees();
      } else {
        setError(result.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  useEffect(() => {
    fetchAnnees();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Années Académiques
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gérez les années académiques de votre établissement
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle Année
          </button>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {annees.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total des années
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {annees.filter(a => a.isActive).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Année active
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {annees.filter(a => !a.isActive).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Années inactives
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une année (ex: 2024, 2024-2025)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAnnees.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-red-500 mb-4">❌ {error}</div>
          <button
            onClick={fetchAnnees}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : filteredAnnees.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Aucune année trouvée pour cette recherche' : 'Aucune année académique trouvée'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnees.map((annee) => (
            <div
              key={annee._id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                annee.isActive 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6">
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {annee.debut}-{annee.fin}
                    </h3>
                    {annee.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Début:</span> {annee.debut}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Fin:</span> {annee.fin}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Créée le:</span> {new Date(annee.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => handleToggleActive(annee)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      annee.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {annee.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAnnee(annee);
                        setEditAnneeDebut(annee.debut);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAnnee(annee._id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
                Créer une nouvelle année académique
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Année de début
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2050"
                    value={newAnneeDebut}
                    onChange={(e) => setNewAnneeDebut(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 2024"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    L'année de fin sera automatiquement {newAnneeDebut + 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAnneeDebut(new Date().getFullYear());
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateAnnee}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedAnnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Modifier l'année académique
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Année de début
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2050"
                    value={editAnneeDebut}
                    onChange={(e) => setEditAnneeDebut(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 2024"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    L'année de fin sera automatiquement {editAnneeDebut + 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAnnee(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditAnnee}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
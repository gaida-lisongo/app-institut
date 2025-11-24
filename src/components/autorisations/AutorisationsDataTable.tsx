'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashBinIcon, UserIcon, GroupIcon } from '@/icons';
import { AutorisationData } from '@/models/Autorisation';
import { AgentData } from '@/models/Agent';
import AutorisationFormModal from './AutorisationFormModal';
import AgentsSelectionModal from './AgentsSelectionModal';

export default function AutorisationsDataTable() {
  const [autorisations, setAutorisations] = useState<AutorisationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États des modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState(false);
  const [selectedAutorisation, setSelectedAutorisation] = useState<AutorisationData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch des autorisations
  const fetchAutorisations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/autorisations');
      const result = await response.json();
      
      if (result.success) {
        setAutorisations(result.data);
      } else {
        console.error('Erreur lors du fetch des autorisations:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors du fetch des autorisations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutorisations();
  }, []);

  // Filtrage des autorisations
  const filteredAutorisations = autorisations.filter(autorisation =>
    autorisation.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreate = () => {
    setSelectedAutorisation(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (autorisation: AutorisationData) => {
    setSelectedAutorisation(autorisation);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (autorisation: AutorisationData) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'autorisation "${autorisation.designation}" ?`)) {
      return;
    }

    try {
      const response = await fetch('/api/autorisations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: autorisation._id }),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchAutorisations();
      } else {
        alert('Erreur lors de la suppression: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleManageAgents = (autorisation: AutorisationData) => {
    setSelectedAutorisation(autorisation);
    setIsAgentsModalOpen(true);
  };

  const handleFormSubmit = async () => {
    await fetchAutorisations();
    setIsFormModalOpen(false);
  };

  const handleAgentsUpdate = async () => {
    await fetchAutorisations();
    setIsAgentsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* En-tête avec recherche et bouton d'ajout */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une autorisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvelle Autorisation
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Désignation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Agents Assignés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date de Création
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAutorisations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Aucune autorisation trouvée' : 'Aucune autorisation créée'}
                </td>
              </tr>
            ) : (
              filteredAutorisations.map((autorisation) => (
                <tr key={autorisation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {autorisation.designation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GroupIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {(autorisation.agents as any)?.length || 0} agent(s)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {autorisation.createdAt ? new Date(autorisation.createdAt).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleManageAgents(autorisation)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded"
                        title="Gérer les agents"
                      >
                        <UserIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(autorisation)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(autorisation)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                        title="Supprimer"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Statistiques */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Affichage de {filteredAutorisations.length} sur {autorisations.length} autorisation(s)
        </div>
      </div>

      {/* Modals */}
      <AutorisationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        autorisation={selectedAutorisation}
        isEditing={isEditing}
      />

      <AgentsSelectionModal
        isOpen={isAgentsModalOpen}
        onClose={() => setIsAgentsModalOpen(false)}
        onUpdate={handleAgentsUpdate}
        autorisation={selectedAutorisation}
      />
    </div>
  );
}

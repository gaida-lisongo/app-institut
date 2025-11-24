'use client';

import { useState, useEffect } from 'react';
import { CloseIcon, CheckCircleIcon, UserIcon } from '@/icons';
import { AutorisationData } from '@/models/Autorisation';
import { AgentData } from '@/models/Agent';

interface AgentsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  autorisation: AutorisationData | null;
}

interface AgentWithGrade extends Omit<AgentData, 'grade'> {
  grade: {
    _id: string;
    code: string;
    description: string;
  };
}

export default function AgentsSelectionModal({
  isOpen,
  onClose,
  onUpdate,
  autorisation
}: AgentsSelectionModalProps) {
  const [agents, setAgents] = useState<AgentWithGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch des agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const result = await response.json();
      
      if (result.success) {
        setAgents(result.data);
      } else {
        console.error('Erreur lors du fetch des agents:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors du fetch des agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialiser les agents sélectionnés
  useEffect(() => {
    if (isOpen && autorisation) {
      fetchAgents();
      // Initialiser avec les agents déjà assignés
      const assignedAgentIds = (autorisation.agents as any)?.map((agent: any) => 
        typeof agent === 'string' ? agent : agent._id
      ) || [];
      setSelectedAgents(assignedAgentIds);
    }
  }, [isOpen, autorisation]);

  // Filtrage des agents
  const filteredAgents = agents.filter(agent => {
    const searchLower = searchTerm.toLowerCase();
    return (
      agent.nom.toLowerCase().includes(searchLower) ||
      agent.post_nom.toLowerCase().includes(searchLower) ||
      (agent.prenom && agent.prenom.toLowerCase().includes(searchLower)) ||
      agent.matricule.toLowerCase().includes(searchLower) ||
      agent.grade?.code.toLowerCase().includes(searchLower) ||
      agent.grade?.description.toLowerCase().includes(searchLower)
    );
  });

  // Handlers
  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(agent => agent._id!));
    }
  };

  const handleSave = async () => {
    if (!autorisation) return;

    try {
      setSaving(true);
      const response = await fetch('/api/autorisations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: autorisation._id,
          agents: selectedAgents
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        onUpdate();
      } else {
        alert('Erreur lors de la mise à jour: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedAgents([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gérer les Agents
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Autorisation: {autorisation?.designation}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de recherche et actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un agent (nom, matricule, grade...)"
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
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {selectedAgents.length === filteredAgents.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {selectedAgents.length} agent(s) sélectionné(s) sur {filteredAgents.length}
          </div>
        </div>

        {/* Liste des agents */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Aucun agent trouvé' : 'Aucun agent disponible'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAgents.map((agent) => (
                <div
                  key={agent._id}
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAgents.includes(agent._id!)
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleAgentToggle(agent._id!)}
                >
                  <div className="flex-shrink-0">
                    {selectedAgents.includes(agent._id!) ? (
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {agent.nom} {agent.post_nom} {agent.prenom}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-mono">{agent.matricule}</span>
                      <span className="mx-2">•</span>
                      <span>{agent.sexe}</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {agent.grade?.code} - {agent.grade?.description}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

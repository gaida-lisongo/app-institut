'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { baseUrl } from '@/app/(admin)/page';

// Icônes SVG
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const BuildingLibraryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

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

interface Agent {
  _id: string;
  nom: string;
  post_nom: string;
  prenom?: string;
  matricule: string;
}

interface BureauMember {
  _id?: string;
  agent: Agent;
  role: string;
}

interface Section {
  _id: string;
  designation: string;
  description?: string;
  bureau?: BureauMember[];
  filieres?: Filiere[];
  createdAt: string;
  updatedAt: string;
}

interface Filiere {
  _id: string;
  designation: string;
  description?: string;
}

export default function BureauDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const bureauId = params.bureau as string;

  const [section, setSection] = useState<Section | null>(null);
  const [allFilieres, setAllFilieres] = useState<Filiere[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Bureau management states
  const [showBureauModal, setShowBureauModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  // Available roles from schema
  const availableRoles = [
    'Chef de Section',
    'Chargé de l\'enseignement',
    'Chargé de la recherche',
    'Secretaire Académique',
    'Secrétaire Administartif',
    'Appariteur'
  ];

  // Fetch section details
  const fetchSection = async () => {
    try {
      const response = await fetch(`${baseUrl}/services/sections?sectionId=${bureauId}&populate=filieres,bureau.agent`);
      const result = await response.json();
      
      if (result.success) {
        setSection(result.data);
      } else {
        setError(result.error || 'Section non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la section:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Fetch all filieres
  const fetchAllFilieres = async () => {
    try {
      const response = await fetch('/api/filieres');
      const result = await response.json();
      
      if (result.success) {
        setAllFilieres(result.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des filières:', error);
    }
  };

  // Fetch all agents
  const fetchAllAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const result = await response.json();
      
      if (result.success) {
        setAllAgents(result.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
    }
  };

  useEffect(() => {
    if (bureauId) {
      Promise.all([fetchSection(), fetchAllFilieres(), fetchAllAgents()]).finally(() => {
        setLoading(false);
      });
    }
  }, [bureauId]);

  // Get filières not assigned to this section
  const getAvailableFilieres = () => {
    if (!section || !allFilieres) return [];
    
    const assignedIds = section.filieres?.map(f => f._id) || [];
    return allFilieres.filter(f => !assignedIds.includes(f._id));
  };

  // Get filières assigned to this section
  const getAssignedFilieres = () => {
    return section?.filieres || [];
  };

  // Add filiere to section
  const handleAddFiliere = async (filiereId: string) => {
    try {
      const response = await fetch(`/api/sections/${bureauId}/filieres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filiereId }),
      });

      const result = await response.json();
      if (result.success) {
        fetchSection(); // Refresh section data
      } else {
        alert(result.error || 'Erreur lors de l\'affectation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  // Remove filiere from section
  const handleRemoveFiliere = async (filiereId: string) => {
    try {
      const response = await fetch(`/api/sections/${bureauId}/filieres`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filiereId }),
      });

      const result = await response.json();
      if (result.success) {
        fetchSection(); // Refresh section data
      } else {
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  // Add member to bureau
  const handleAddBureauMember = async () => {
    if (!selectedAgent || !selectedRole) {
      alert('Veuillez sélectionner un agent et un rôle');
      return;
    }

    try {
      // Récupérer les membres actuels du bureau (avec seulement les IDs des agents)
      const currentBureau = section?.bureau?.map(member => ({
        agent: member.agent._id,
        role: member.role
      })) || [];
      
      // Créer le nouveau membre
      const newMember = {
        agent: selectedAgent,
        role: selectedRole
      };
      
      // Combiner les membres existants avec le nouveau
      const updatedBureau = [...currentBureau, newMember];

      const response = await fetch(`/api/sections/${bureauId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...section,
            bureau: updatedBureau
          }
        ),
      });

      const result = await response.json();
      if (result.success) {
        setShowBureauModal(false);
        setSelectedAgent('');
        setSelectedRole('');
        setSearchAgent('');
        fetchSection(); // Refresh section data
      } else {
        alert(result.error || 'Erreur lors de l\'ajout du membre');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  // Remove member from bureau
  const handleRemoveBureauMember = async (membre: BureauMember) => {
    console.log('Membre à supprimer:', membre);
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre du bureau ?')) {
      return;
    }

    try {
      // Récupérer les membres actuels et filtrer celui à supprimer
      // const currentBureau = section?.bureau?.filter(member => member.agent?._id !== agentId).map(member => ({
      //   agent: member.agent?._id,
      //   role: member.role
      // })) || [];

      const response = await fetch(`${baseUrl}/services/sections/remove/${bureauId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bureauId: membre._id
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchSection(); // Refresh section data
      } else {
        alert(result.error || 'Erreur lors de la suppression du membre');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  // Get available agents (not already in bureau) with search filter
  const getAvailableAgents = () => {
    if (!section || !allAgents) return [];
    
    const assignedAgentIds = section.bureau?.filter(m => m.agent?._id).map(m => m.agent._id) || [];
    let availableAgents = allAgents.filter(agent => !assignedAgentIds.includes(agent._id));
    
    // Apply search filter
    if (searchAgent.trim()) {
      const searchTerm = searchAgent.toLowerCase();
      availableAgents = availableAgents.filter(agent => 
        agent.nom.toLowerCase().includes(searchTerm) ||
        agent.post_nom.toLowerCase().includes(searchTerm) ||
        agent.prenom?.toLowerCase().includes(searchTerm) ||
        agent.matricule.toLowerCase().includes(searchTerm)
      );
    }
    
    return availableAgents;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || 'Section non trouvée'}
        </h3>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  console.log('Section data:', section);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Section - {section.designation}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestion des filières de la section
            </p>
          </div>
        </div>
      </div>

      {/* Section Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <BuildingLibraryIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {section.designation}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Section
              </span>
            </div>
            
            {section.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {section.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bureau Members Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Membres du bureau ({section.bureau?.length || 0})
          </h3>
          <button
            onClick={() => setShowBureauModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Modifier le bureau
          </button>
        </div>
        
        {section.bureau && section.bureau.length > 0 ? (
          <div className="space-y-3">
            {section.bureau.map((membre, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {membre.agent?.nom?.charAt(0) || '?'}{membre.agent?.post_nom?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {membre.agent ? `${membre.agent.nom || ''} ${membre.agent.post_nom || ''} ${membre.agent.prenom || ''}` : 'Agent non défini'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Matricule: {membre.agent?.matricule || 'Non défini'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {membre.role}
                  </span>
                  <button
                    onClick={() => handleRemoveBureauMember(membre)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Retirer du bureau"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun membre assigné au bureau de cette section
            </p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Filieres (Left) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filières disponibles ({getAvailableFilieres().length})
          </h3>
          
          {getAvailableFilieres().length > 0 ? (
            <div className="space-y-3">
              {getAvailableFilieres().map((filiere) => (
                <div key={filiere._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {filiere.designation}
                    </h4>
                    {filiere.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {filiere.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddFiliere(filiere._id)}
                    className="ml-3 p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-md transition-colors"
                    title="Ajouter à la section"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Toutes les filières sont déjà affectées à cette section
              </p>
            </div>
          )}
        </div>

        {/* Assigned Filieres (Right) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filières de la section ({getAssignedFilieres().length})
          </h3>
          
          {getAssignedFilieres().length > 0 ? (
            <div className="space-y-3">
              {getAssignedFilieres().map((filiere) => (
                <div key={filiere._id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {filiere.designation}
                    </h4>
                    {filiere.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {filiere.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFiliere(filiere._id)}
                    className="ml-3 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Retirer de la section"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Aucune filière affectée à cette section
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bureau Management Modal */}
      {showBureauModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ajouter un membre au bureau
                </h3>
                <button
                  onClick={() => {
                    setShowBureauModal(false);
                    setSearchAgent('');
                    setSelectedAgent('');
                    setSelectedRole('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Search Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rechercher un agent
                  </label>
                  <input
                    type="text"
                    value={searchAgent}
                    onChange={(e) => setSearchAgent(e.target.value)}
                    placeholder="Nom, post-nom, prénom ou matricule..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Select Agent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sélectionner un agent ({getAvailableAgents().length} disponible{getAvailableAgents().length > 1 ? 's' : ''})
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choisir un agent...</option>
                    {getAvailableAgents().map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.nom} {agent.post_nom} {agent.prenom} - {agent.matricule}
                      </option>
                    ))}
                  </select>
                  {getAvailableAgents().length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {searchAgent.trim() ? 'Aucun agent trouvé avec ces critères' : 'Tous les agents sont déjà assignés au bureau'}
                    </p>
                  )}
                </div>

                {/* Select Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sélectionner un rôle
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choisir un rôle...</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBureauModal(false);
                      setSearchAgent('');
                      setSelectedAgent('');
                      setSelectedRole('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddBureauMember}
                    disabled={!selectedAgent || !selectedRole}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
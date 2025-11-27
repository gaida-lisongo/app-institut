'use client';

import { useState } from "react";
import { PlusIcon, TrashIcon, UserIcon, CloseIcon } from "@/icons";

interface Agent {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    grade: string | { designation?: string; code?: string; [key: string]: any };
}

interface BureauMember {
    agent: string | Agent;
    role: string;
}

interface MembersCardProps {
    filiere: any;
    availableAgents: Agent[];
}

const MembersCard = ({ filiere, availableAgents }: MembersCardProps) => {
    const [members, setMembers] = useState<BureauMember[]>(filiere.bureau || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [selectedRole, setSelectedRole] = useState('Membre');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtrer les agents disponibles (non encore membres)
    const filteredAgents = availableAgents.filter(agent => {
        const isAlreadyMember = members.some(member => 
            typeof member.agent === 'string' ? member.agent === agent._id : member.agent._id === agent._id
        );
        const matchesSearch = searchTerm === '' || 
            `${agent.nom} ${agent.prenom} ${agent.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        
        return !isAlreadyMember && matchesSearch;
    });

    // Ajouter un membre au bureau
    const handleAddMember = async () => {
        if (!selectedAgent) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/filieres/${filiere._id}/bureau`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agentId: selectedAgent._id,
                    role: selectedRole
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Mettre à jour l'état local
                setMembers(prev => [...prev, {
                    agent: selectedAgent,
                    role: selectedRole
                }]);
                
                setShowAddModal(false);
                setSelectedAgent(null);
                setSelectedRole('Membre');
                setError(null);
            } else {
                setError(result.error || 'Erreur lors de l\'ajout du membre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    // Supprimer un membre du bureau
    const handleRemoveMember = async (agentId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir retirer ce membre du bureau ?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/filieres/${filiere._id}/bureau/${agentId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                // Mettre à jour l'état local
                setMembers(prev => prev.filter(member => 
                    typeof member.agent === 'string' ? member.agent !== agentId : member.agent._id !== agentId
                ));
                setError(null);
            } else {
                setError(result.error || 'Erreur lors de la suppression du membre');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const roles = ['Président', 'Vice-Président', 'Secrétaire', 'Membre', 'Rapporteur'];

    // Fonction helper pour afficher le grade
    const getGradeDisplay = (grade: string | { designation?: string; code?: string; [key: string]: any }) => {
        if (typeof grade === 'string') return grade;
        if (typeof grade === 'object' && grade) {
            return grade.designation || grade.code || 'N/A';
        }
        return 'N/A';
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec bouton d'ajout */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Membres du Bureau de Jury
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Gérez les membres du bureau de jury de cette filière
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Ajouter un membre
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="text-red-700 dark:text-red-300">{error}</div>
                    </div>
                )}

                {/* Table des membres */}
                {members.length === 0 ? (
                    <div className="text-center py-12">
                        <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun membre dans le bureau
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Commencez par ajouter des membres au bureau de jury.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Ajouter le premier membre
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Agent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {members.map((member, index) => {
                                    const agent = typeof member.agent === 'string' 
                                        ? availableAgents.find(a => a._id === member.agent)
                                        : member.agent;
                                    
                                    if (!agent) return null;

                                    return (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                        <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {agent.nom} {agent.prenom}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    member.role === 'Président' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                    member.role === 'Vice-Président' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    member.role === 'Secrétaire' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {getGradeDisplay(agent.grade)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {agent.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleRemoveMember(agent._id)}
                                                    disabled={loading}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                    title="Retirer du bureau"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal d'ajout de membre */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Ajouter un membre au bureau
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedAgent(null);
                                        setSearchTerm('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <CloseIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Recherche d'agent */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rechercher un agent
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Nom, prénom ou email..."
                                    />
                                </div>
                            </div>

                            {/* Sélection du rôle */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rôle dans le bureau
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Liste des agents */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sélectionner un agent ({filteredAgents.length} disponible(s))
                                </label>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                                    {filteredAgents.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            {searchTerm ? 'Aucun agent trouvé pour cette recherche' : 'Tous les agents sont déjà membres du bureau'}
                                        </div>
                                    ) : (
                                        filteredAgents.map((agent) => (
                                            <div
                                                key={agent._id}
                                                onClick={() => setSelectedAgent(agent)}
                                                className={`p-4 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                    selectedAgent?._id === agent._id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                        <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {agent.nom} {agent.prenom}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {getGradeDisplay(agent.grade)} • {agent.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                    {selectedAgent?._id === agent._id && (
                                                        <div className="ml-auto">
                                                            <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                                <div className="h-2 w-2 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedAgent(null);
                                        setSearchTerm('');
                                    }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddMember}
                                    disabled={loading || !selectedAgent}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                                >
                                    {loading ? 'Ajout...' : 'Ajouter au bureau'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersCard;

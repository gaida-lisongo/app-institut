'use client'
import { baseUrl } from "@/app/(admin)/page";
import AgentCard from "@/components/agents/AgentCard";
import CSVImportModal from "@/components/csv/CSVImportModal";
import { AgentData, CreateAgentData } from "@/models/Agent";
import { GradeData } from "@/models/Grade";
import { csvValidators, csvTransformers } from "@/utils/csvParser";
import { useState, useEffect } from "react";

export const AgentManager = ({ gradeCode }: { gradeCode: string }) => {
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
    const [grades, setGrades] = useState<GradeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        post_nom: '',
        prenom: '',
        grade: '',
        matricule: '',
        secure: '',
        sexe: 'M' as 'M' | 'F',
        email: '',
        telephone: ''
    });

    // Fetch agents by grade code
    const fetchAgents = async () => {
        try {
            const response = await fetch(`/api/agents?grade=${gradeCode}`);
            const data = await response.json();
            if (data.success) {
                setAgents(data.data);
                setFilteredAgents(data.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des agents:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch current grade by code
    const fetchCurrentGrade = async () => {
        try {
            const response = await fetch(`/api/grades?code=${gradeCode}`);
            const data = await response.json();
            if (data.success && data.data) {
                return data.data;
            }
        } catch (error) {
            console.error('Erreur lors du chargement du grade courant:', error);
        }
        return null;
    };

    // Fetch all grades by type for the dropdown
    const fetchGradesByType = async () => {
        try {
            const response = await fetch(`/api/grades?type=enseignant`);
            const data = await response.json();
            if (data.success) {
                setGrades(data.data);
                return data.data;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des grades par type:', error);
        }
        return [];
    };

    // Initialize grades and set current grade as default
    const initializeGrades = async () => {
        const [currentGrade, allGrades] = await Promise.all([
            fetchCurrentGrade(),
            fetchGradesByType()
        ]);
        
        if (currentGrade) {
            setFormData(prev => ({ ...prev, grade: currentGrade._id || '' }));
        }
    };

    // Filter agents based on search term
    useEffect(() => {
        const filtered = agents.filter(agent =>
            agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.post_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.secure.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agent.email && agent.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (agent.telephone && agent.telephone.includes(searchTerm))
        );
        setFilteredAgents(filtered);
    }, [searchTerm, agents]);

    const createAgent = async (agent: CreateAgentData) => {
        try {
            const response = await fetch(`${baseUrl}/agents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agent),
            });
            const data = await response.json();
            if (data.success) {
                setAgents([...agents, data.data]);
                setShowModal(false);
                await resetForm();
            }
            return data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'agent:', error);
        }
    };

    const updateAgent = async (agent: AgentData) => {
        try {
            const response = await fetch(`/api/agents`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agent),
            });
            const data = await response.json();
            if (data.success) {
                // Check if the agent's grade has changed
                const updatedAgent = data.data;
                const currentGrade = await fetchCurrentGrade();
                
                if (currentGrade && updatedAgent.grade.toString() === currentGrade._id) {
                    // Agent still belongs to current grade, update in list
                    setAgents(agents.map(a => a._id && agent._id && a._id === agent._id ? updatedAgent : a));
                } else {
                    // Agent moved to different grade, remove from current list
                    setAgents(agents.filter(a => a._id !== agent._id));
                }
                
                setEditingAgent(null);
                setShowModal(false);
                await resetForm();
            }
            return data;
        } catch (error) {
            console.error('Erreur lors de la modification de l\'agent:', error);
        }
    };

    const deleteAgent = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
            try {
                const response = await fetch(`/api/agents`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                });
                const data = await response.json();
                if (data.success) {
                    setAgents(agents.filter(a => a._id !== id));
                }
                return data;
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'agent:', error);
            }
        }
    };

    const resetForm = async () => {
        const currentGrade = await fetchCurrentGrade();
        setFormData({
            nom: '',
            post_nom: '',
            prenom: '',
            grade: currentGrade?._id || '',
            matricule: '',
            secure: '',
            sexe: 'M',
            email: '',
            telephone: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAgent) {
            await updateAgent({ ...editingAgent, ...formData });
        } else {
            await createAgent(formData);
        }
    };

    const handleEdit = (agent: AgentData) => {
        setEditingAgent(agent);
        
        // Extract grade ID - handle both populated and non-populated cases
        let gradeId = '';
        if (typeof agent.grade === 'string') {
            gradeId = agent.grade;
        } else if (agent.grade && typeof agent.grade === 'object' && '_id' in agent.grade) {
            gradeId = (agent.grade as any)._id;
        }
        
        setFormData({
            nom: agent.nom,
            post_nom: agent.post_nom,
            prenom: agent.prenom ?? '',
            grade: gradeId,
            matricule: agent.matricule,
            secure: agent.secure,
            sexe: agent.sexe,
            email: agent.email || '',
            telephone: agent.telephone || ''
        });
        setShowModal(true);
    };

    // CSV Import functions
    const handleImportCSV = () => {
        setShowCSVModal(true);
    };

    const handleCSVImport = async (agentData: Record<string, any>) => {
        try {
            // Ensure the agent has the current grade
            const currentGrade = await fetchCurrentGrade();
            if (currentGrade) {
                agentData.grade = currentGrade._id;
            }

            const result = await createAgent(agentData as CreateAgentData);
            return { success: !!result?.success, error: result?.error };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    };

    const handleCSVImportComplete = (results: { successful: number; failed: number; errors: any[] }) => {
        // Refresh the agents list to show newly imported agents
        fetchAgents();
        
        // Show completion message
        const message = `Importation terminée!\n${results.successful} agents importés avec succès.${
            results.failed > 0 ? `\n${results.failed} agents ont échoué.` : ''
        }`;
        
        alert(message);
    };

    // Define target fields for CSV import
    const csvTargetFields = [
        {
            key: 'nom',
            label: 'Nom',
            required: true,
            description: 'Nom de famille de l\'agent'
        },
        {
            key: 'post_nom',
            label: 'Post-nom',
            required: true,
            description: 'Post-nom de l\'agent'
        },
        {
            key: 'prenom',
            label: 'Prénom',
            required: true,
            description: 'Prénom de l\'agent'
        },
        {
            key: 'matricule',
            label: 'Matricule',
            required: true,
            description: 'Numéro de matricule unique'
        },
        {
            key: 'secure',
            label: 'Sécure',
            required: true,
            description: 'Numéro de sécure'
        },
        {
            key: 'sexe',
            label: 'Sexe',
            required: true,
            description: 'Sexe (M/F, Masculin/Féminin, Homme/Femme)'
        },
        {
            key: 'email',
            label: 'Email',
            required: false,
            description: 'Adresse email (optionnel)'
        },
        {
            key: 'telephone',
            label: 'Téléphone',
            required: false,
            description: 'Numéro de téléphone (optionnel)'
        }
    ];

    useEffect(() => {
        fetchAgents();
        initializeGrades();
    }, [gradeCode]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header avec boutons d'action */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                    Agents Enseignants - Grade: {gradeCode}
                </h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleImportCSV}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Importer CSV
                    </button>
                    <button
                        onClick={async () => {
                            setEditingAgent(null);
                            await resetForm();
                            setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouvel Agent
                    </button>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un agent (nom, prénom, matricule, sécure, email, téléphone...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Statistiques */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        {filteredAgents.length} agent(s) trouvé(s) sur {agents.length} total
                    </span>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Effacer la recherche
                        </button>
                    )}
                </div>
            </div>

            {/* Grille des cartes d'agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent, index) => (
                    <AgentCard
                        key={agent._id || index}
                        agent={agent}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={deleteAgent}
                    />
                ))}
            </div>

            {/* Message si aucun agent */}
            {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                        {searchTerm 
                            ? `Aucun agent trouvé pour "${searchTerm}"` 
                            : `Aucun agent trouvé pour le grade "${gradeCode}"`
                        }
                    </div>
                    <p className="text-gray-400 mt-2">
                        {searchTerm 
                            ? 'Essayez avec d\'autres termes de recherche.'
                            : 'Cliquez sur "Nouvel Agent" pour en créer un.'
                        }
                    </p>
                </div>
            )}

            {/* Modal pour créer/modifier un agent */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 transform animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingAgent ? 'Modifier l\'agent' : 'Nouvel agent'}
                            </h3>
                            <button
                                onClick={async () => {
                                    setShowModal(false);
                                    setEditingAgent(null);
                                    await resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Post-nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.post_nom}
                                        onChange={(e) => setFormData({...formData, post_nom: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sexe *
                                    </label>
                                    <select
                                        value={formData.sexe}
                                        onChange={(e) => setFormData({...formData, sexe: e.target.value as 'M' | 'F'})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Grade *
                                    </label>
                                    <select
                                        value={formData.grade}
                                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Sélectionner un grade</option>
                                        {grades.map((grade) => (
                                            <option key={grade._id} value={grade._id}>
                                                {grade.code} - {grade.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Matricule *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.matricule}
                                        onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sécure *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.secure}
                                        onChange={(e) => setFormData({...formData, secure: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setShowModal(false);
                                        setEditingAgent(null);
                                        await resetForm();
                                    }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                                >
                                    {editingAgent ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={showCSVModal}
                onClose={() => setShowCSVModal(false)}
                title={`Importer des agents - Grade: ${gradeCode}`}
                targetFields={csvTargetFields}
                onImport={handleCSVImport}
                onComplete={handleCSVImportComplete}
            />
        </div>
    );
};

export default AgentManager;
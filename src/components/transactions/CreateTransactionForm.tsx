'use client';

import { useState, useEffect } from 'react';

interface Agent {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
}

interface CreateTransactionFormProps {
    productId: string;
    productType: string;
    productTitle: string;
    productDescription?: string;
    onCreateTransaction: (data: {
        amount: number;
        agentId?: string;
        productId: string;
        productType: string;
    }) => Promise<any>;
    onCancel?: () => void;
}

const CreateTransactionForm = ({
    productId,
    productType,
    productTitle,
    productDescription,
    onCreateTransaction,
    onCancel
}: CreateTransactionFormProps) => {
    const [formData, setFormData] = useState({
        amount: '',
        agentId: ''
    });
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
    const [agentSearch, setAgentSearch] = useState('');
    const [showAgentDropdown, setShowAgentDropdown] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(true);

    // Fetch agents
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await fetch('/api/agents');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setAgents(result.data);
                        setFilteredAgents(result.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching agents:', error);
            } finally {
                setLoadingAgents(false);
            }
        };

        fetchAgents();
    }, []);

    // Filter agents based on search
    useEffect(() => {
        if (agentSearch.trim()) {
            const filtered = agents.filter(agent =>
                agent.nom.toLowerCase().includes(agentSearch.toLowerCase()) ||
                agent.prenom.toLowerCase().includes(agentSearch.toLowerCase()) ||
                agent.email.toLowerCase().includes(agentSearch.toLowerCase())
            );
            setFilteredAgents(filtered);
        } else {
            setFilteredAgents(agents);
        }
    }, [agentSearch, agents]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAgentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgentSearch(e.target.value);
        setShowAgentDropdown(true);
        setSelectedAgent(null);
        setFormData(prev => ({ ...prev, agentId: '' }));
    };

    const handleAgentSelect = (agent: Agent) => {
        setSelectedAgent(agent);
        setAgentSearch(`${agent.prenom} ${agent.nom}`);
        setFormData(prev => ({ ...prev, agentId: agent._id }));
        setShowAgentDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Veuillez saisir un montant valide');
            return;
        }

        setLoading(true);
        try {
            const result = await onCreateTransaction({
                amount: parseFloat(formData.amount),
                agentId: formData.agentId || undefined,
                productId,
                productType
            });

            if (result) {
                // Reset form
                setFormData({ amount: '', agentId: '' });
                setSelectedAgent(null);
                setAgentSearch('');
                alert('Transaction créée avec succès!');
            } else {
                alert('Erreur lors de la création de la transaction');
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Erreur lors de la création de la transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer une Transaction
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                    Créer une transaction pour permettre aux étudiants de s'inscrire à cette activité.
                </p>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                Montant (FCFA) *
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                min="0"
                                step="100"
                                placeholder="Ex: 5000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        
                        <div className="relative">
                            <label htmlFor="agentSearch" className="block text-sm font-medium text-gray-700 mb-2">
                                Agent responsable
                            </label>
                            <input
                                type="text"
                                id="agentSearch"
                                value={agentSearch}
                                onChange={handleAgentSearch}
                                onFocus={() => setShowAgentDropdown(true)}
                                placeholder={loadingAgents ? "Chargement des agents..." : "Rechercher un agent..."}
                                disabled={loadingAgents}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            
                            {/* Dropdown des agents */}
                            {showAgentDropdown && !loadingAgents && filteredAgents.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredAgents.map((agent) => (
                                        <div
                                            key={agent._id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleAgentSelect(agent)}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {agent.prenom} {agent.nom}
                                            </div>
                                            <div className="text-sm text-gray-600">{agent.email}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de produit
                            </label>
                            <input
                                type="text"
                                value={productType}
                                disabled
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID du produit
                            </label>
                            <input
                                type="text"
                                value={productId}
                                disabled
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-mono text-xs"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Résumé de la transaction</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Produit :</span> {productTitle}</p>
                            {productDescription && (
                                <p><span className="font-medium">Description :</span> {productDescription}</p>
                            )}
                            <p><span className="font-medium">Type :</span> {productType}</p>
                            {selectedAgent && (
                                <p><span className="font-medium">Agent :</span> {selectedAgent.prenom} {selectedAgent.nom}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Créer la transaction
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Click outside to close dropdown */}
            {showAgentDropdown && (
                <div 
                    className="fixed inset-0 z-0" 
                    onClick={() => setShowAgentDropdown(false)}
                />
            )}
        </div>
    );
};

export default CreateTransactionForm;
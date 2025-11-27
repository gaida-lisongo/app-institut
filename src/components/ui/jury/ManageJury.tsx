'use client';

import { ArrowLeftIcon, UserIcon } from "@/icons";
import MembersCard from "./MembersCard";
import { useState, useEffect } from "react";

interface Agent {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    grade: string;
}

interface ManageJuryProps {
    filiere: any;
    onBack: () => void;
}

const ManageJury = ({
    filiere,
    onBack,
}: ManageJuryProps) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    // Récupérer les agents via API
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/agents');
                const result = await response.json();
                
                if (result.success) {
                    setAgents(result.data);
                } else {
                    // Données de fallback si l'API n'existe pas encore
                    setAgents([
                        { _id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', grade: 'Professeur' },
                        { _id: '2', nom: 'Martin', prenom: 'Marie', email: 'marie.martin@example.com', grade: 'Maître de conférences' },
                        { _id: '3', nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com', grade: 'Assistant' },
                    ]);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des agents:', error);
                // Données de fallback en cas d'erreur
                setAgents([
                    { _id: '1', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', grade: 'Professeur' },
                    { _id: '2', nom: 'Martin', prenom: 'Marie', email: 'marie.martin@example.com', grade: 'Maître de conférences' },
                    { _id: '3', nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com', grade: 'Assistant' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 text-white">
                    <div className="animate-pulse">
                        <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg">
                            <ArrowLeftIcon className="h-5 w-5" />
                            <span>Bureau de Jury</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center space-x-3">
                                <UserIcon className="h-8 w-8" />
                                <span>Gestion du Bureau de Jury</span>
                            </h1>
                            <p className="text-blue-100 mt-1">
                                {filiere.designation} - {filiere.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-2xl font-bold">{filiere.bureau?.length || 0}</div>
                        <div className="text-sm text-blue-100">Membres actuels</div>
                    </div>
                </div>
            </div>

            {/* Informations sur la filière */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Informations de la filière
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Désignation:</span>
                        <p className="text-gray-900 dark:text-white">{filiere.designation}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                        <p className="text-gray-900 dark:text-white">{filiere.description}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Promotions:</span>
                        <p className="text-gray-900 dark:text-white">{filiere.promotions?.length || 0} promotion(s)</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Créée le:</span>
                        <p className="text-gray-900 dark:text-white">
                            {new Date(filiere.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Composant de gestion des membres */}
            <MembersCard
                filiere={filiere}
                availableAgents={agents}
            />
        </div>
    );
};

export default ManageJury;
'use client'

import { Etudiant } from "@/types/etudiant";
import { useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon, CurrencyDollarIcon } from "@/icons";

interface SoldeRechargeProps {
    etudiant: Etudiant;
    onSoldeUpdate?: (newSolde: number) => void;
}

const SoldeRecharge = ({
    etudiant,
    onSoldeUpdate
}: SoldeRechargeProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newSolde, setNewSolde] = useState(etudiant.solde || 0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSolde = async (solde: number) => {
        setLoading(true);
        setError(null);
        try {
            const req = await fetch(`/api/etudiants/${etudiant._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ solde: solde }),
            });

            const res = await req.json();
            
            if (res.success) {
                setIsEditing(false);
                if (onSoldeUpdate) {
                    onSoldeUpdate(solde);
                }
            } else {
                setError(res.error || 'Erreur lors de la mise à jour du solde');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (newSolde < 0) {
            setError('Le solde ne peut pas être négatif');
            return;
        }
        updateSolde(newSolde);
    };

    const handleCancel = () => {
        setNewSolde(etudiant.solde || 0);
        setIsEditing(false);
        setError(null);
    };

    return (
        <div className="space-y-4">
            {/* Section informations étudiant */}
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-medium text-blue-600 dark:text-blue-400">
                            {etudiant.nom.charAt(0)}{etudiant.post_nom.charAt(0)}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                        </h1>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            etudiant.sexe === 'M' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                        }`}>
                            {etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                            <span className="font-medium">Matricule:</span> {etudiant.matricule}
                        </div>
                        <div>
                            <span className="font-medium">Code sécurisé:</span> {etudiant.secure}
                        </div>
                        <div>
                            <span className="font-medium">Inscrit le:</span> {new Date(etudiant.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section gestion du solde */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                                Solde actuel
                            </h3>
                            {!isEditing ? (
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {(etudiant.solde || 0).toFixed(2)} CDF
                                </p>
                            ) : (
                                <div className="flex items-center space-x-2 mt-2">
                                    <input
                                        type="number"
                                        value={newSolde}
                                        onChange={(e) => setNewSolde(parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                        className="px-3 py-1 border border-green-300 dark:border-green-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-green-700 dark:text-green-300">CDF</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-3 py-2 border border-green-300 dark:border-green-600 rounded-md shadow-sm text-sm font-medium text-green-700 dark:text-green-300 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Modifier
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {error && (
                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SoldeRecharge;

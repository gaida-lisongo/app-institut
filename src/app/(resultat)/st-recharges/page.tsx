'use client'

import { useState, useEffect } from "react";
import { Etudiant, useResultat } from "../layout";
import { useRecharge } from "@/hooks/useRecharge";
import RechargeCard from "./RechargeCard";

export interface Recharge {
    _id: string;
    etudiantId: string;
    amount: number;
    currency: string;
    phone: string;
    description: string;
    paymentMethod: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

// Composant RechargeSetting - Recharge de compte avec paiement mobile
const RechargeSetting = ({ onBack }: { onBack: () => void }) => {
    const { etudiantInfo, updateSolde } = useResultat();
    const { createRecharge, checkRechargeStatus, pollRechargeStatus, validateRechargeData, formatPhone, loading, error } = useRecharge();
    
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        phone: '',
        description: ''
    });
    const [currentStep, setCurrentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
    const [rechargeResult, setRechargeResult] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [recharges, setRecharges] = useState<Recharge[]>([]);
    const [showFormRecharge, setShowFormRecharge] = useState<boolean>(false);
    const [selectedRecharge, setSelectedRecharge] = useState<Recharge | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loadingRecharges, setLoadingRecharges] = useState<boolean>(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!etudiantInfo?._id) {
            setMessage({ type: 'error', text: 'Informations étudiant manquantes' });
            return;
        }

        const rechargeData = {
            etudiantId: etudiantInfo._id,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            phone: formatPhone(formData.phone),
            description: formData.description || `Recharge de compte - ${etudiantInfo.nom} ${etudiantInfo.prenom}`
        };

        
        // Validation
        const validation = validateRechargeData(rechargeData);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.errors.join(', ') });
            return;
        }

        setCurrentStep('processing');
        setMessage({ type: 'info', text: 'Initialisation du paiement...' });

        // Créer la recharge
        const result = await createRecharge(rechargeData);
        console.log("Data to make recharge : ", result);
        
        if (result.success && result.data) {
            setRechargeResult(result.data);
            setMessage({ type: 'info', text: 'Paiement en cours... Veuillez confirmer sur votre téléphone.' });
            
            // Démarrer le polling pour vérifier le statut
            if (result?.data?.status === 'pending') {
                setCurrentStep('success');
                setMessage({ type: 'success', text: `Transaction initiée`});
                fetchRecharges();

            } else if (result?.data?.status === 'failed') {
                setCurrentStep('error');
                setMessage({ type: 'error', text: `Paiement échoué: Erreur inconnue'}` });
            }
        } else {
            setCurrentStep('error');
            setMessage({ type: 'error', text: result.message || 'Erreur lors de la création de la recharge' });
        }
    };

    const createTransaction = async () => {
        try {
            if(rechargeResult){
                const req = await fetch(`/api/recharge?rechargeId=${rechargeResult._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rechargeResult)
                });
                const result = await req.json();
                console.log("Data to make recharge : ", result);
                
            }
        } catch (error) {
            console.error("Error creating transaction : ", error);
            return error;
        }
    }

    const resetForm = () => {
        createTransaction()
            .then(() => {
                setCurrentStep('form');
                setFormData({ amount: '', currency: 'USD', phone: '', description: '' });
                setRechargeResult(null);
                setMessage(null);
                setShowFormRecharge(false);
            })
            .catch((error) => {
                console.error("Error creating transaction : ", error);
                setMessage({ type: 'error', text: 'Erreur lors de la création de la transaction' });
            });
    };

    // Récupérer toutes les recharges de l'utilisateur
    const fetchRecharges = async () => {
        if (!etudiantInfo?._id) return;
        
        setLoadingRecharges(true);
        try {
            const response = await fetch(`/api/recharge?etudiantId=${etudiantInfo._id}&limit=50`);
            const result = await response.json();
            
            if (result.success && result.data) {
                // Trier par ordre décroissant (plus récent en premier)
                const sortedRecharges = result.data.sort((a: Recharge, b: Recharge) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecharges(sortedRecharges);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des recharges:', error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des recharges' });
        } finally {
            setLoadingRecharges(false);
        }
    };

    // Supprimer une recharge
    const deleteRecharge = async (rechargeId: string) => {
        try {
            const response = await fetch(`/api/recharges/${rechargeId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setRecharges(prev => prev.filter(r => r._id !== rechargeId));
                setMessage({ type: 'success', text: 'Recharge supprimée avec succès' });
                setShowModal(false);
                setSelectedRecharge(null);
            } else {
                setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        }
    };

    // Créditer le solde (pour les recharges pending)
    const creditBalance = async (recharge: Recharge) => {
        try {
            const response = await fetch(`/api/recharge/${recharge.orderNumber}/status`);
            
            if (response.ok) {
                const result = await response.json();
                console.log("Result : ", result);

                if(result.success){

                    const newBalance = result?.data?.newBalance;
                    
                    // Mettre à jour le solde dans le contexte
                    if (result?.data && newBalance !== undefined) {
                        updateSolde(newBalance);
                    }

                    // Mettre à jour la recharge dans la liste
                    setRecharges(prev => prev.map(r => 
                        r._id === recharge._id ? { ...r, status: 'completed' } : r
                    ));
                    setMessage({ type: 'success', text: 'Solde crédité avec succès' });
                    setShowModal(false);
                    setSelectedRecharge(null);

                } else {
                    setMessage({ type: 'error', text: result.message || 'Erreur lors du crédit' });

                }
            } else {
                setMessage({ type: 'error', text: 'Erreur lors du crédit' });
            }
        } catch (error) {
            console.error('Erreur crédit:', error);
            setMessage({ type: 'error', text: 'Erreur lors du crédit' });
        }
    };

    // Charger les recharges au montage du composant
    useEffect(() => {
        if (etudiantInfo?._id && !showFormRecharge) {
            fetchRecharges();
        }
    }, [etudiantInfo?._id, showFormRecharge]);

    const renderRecharges = () => {
        // Calculer les métriques
        const totalRecharges = recharges.length;
        const completedRecharges = recharges.filter(r => r.status === 'completed').length;
        const pendingRecharges = recharges.filter(r => r.status === 'pending').length;
        const failedRecharges = recharges.filter(r => r.status === 'failed').length;

        const handleCredite = (recharge : Recharge) => creditBalance(recharge);
        const handleDetails = (recharge : Recharge) => {
            setSelectedRecharge(recharge);
            setShowModal(true);
        }
        const handleDelete = (rechargeId : string) => deleteRecharge(rechargeId)
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 animate-slideInRight">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Retour</span>
                    </button>
                    <h1 className="text-xl font-bold text-white">Mes Recharges</h1>
                    <div className="w-16"></div>
                </div>

                {/* Message de feedback */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 
                        message.type === 'error' ? 'bg-red-900/20 text-red-400 border border-red-800' :
                        'bg-blue-900/20 text-blue-400 border border-blue-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Métriques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-white">{totalRecharges}</div>
                        <div className="text-sm text-gray-400">Total</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{completedRecharges}</div>
                        <div className="text-sm text-gray-400">Réussies</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{pendingRecharges}</div>
                        <div className="text-sm text-gray-400">En attente</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-400">{failedRecharges}</div>
                        <div className="text-sm text-gray-400">Échouées</div>
                    </div>
                </div>

                {/* Solde et bouton nouvelle recharge */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{etudiantInfo?.solde || 0} FC</p>
                                <p className="text-gray-400 text-sm">Solde disponible</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFormRecharge(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Nouvelle recharge</span>
                        </button>
                    </div>
                </div>

                {/* Liste des recharges */}
                {loadingRecharges ? (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-gray-400">Chargement des recharges...</p>
                    </div>
                ) : recharges.length === 0 ? (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Aucune recharge</h2>
                        <p className="text-gray-400 mb-6">Vous n'avez pas encore effectué de recharge.</p>
                        <button
                            onClick={() => setShowFormRecharge(true)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Première recharge
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recharges.map((recharge) => <RechargeCard key={recharge._id} recharge={recharge} onCrediter={handleCredite} onDetails={handleDetails} onDelete={handleDelete} />)}
                    </div>
                )}

                {/* Modal de détails */}
                {showModal && selectedRecharge && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Détails de la recharge</h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedRecharge(null);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Montant:</span>
                                    <span className="text-white font-medium">{selectedRecharge.amount} {selectedRecharge.currency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Statut:</span>
                                    <span className={`font-medium ${
                                        selectedRecharge.status === 'completed' ? 'text-green-400' :
                                        selectedRecharge.status === 'pending' ? 'text-yellow-400' :
                                        selectedRecharge.status === 'failed' ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                        {selectedRecharge.status === 'completed' ? 'Réussie' :
                                         selectedRecharge.status === 'pending' ? 'En attente' :
                                         selectedRecharge.status === 'failed' ? 'Échouée' : selectedRecharge.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Commande:</span>
                                    <span className="text-white font-mono text-sm">{selectedRecharge.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Téléphone:</span>
                                    <span className="text-white">{selectedRecharge.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Méthode:</span>
                                    <span className="text-white">{selectedRecharge.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Date création:</span>
                                    <span className="text-white">{new Date(selectedRecharge.createdAt).toLocaleString('fr-FR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Dernière MAJ:</span>
                                    <span className="text-white">{new Date(selectedRecharge.updatedAt).toLocaleString('fr-FR')}</span>
                                </div>
                                {selectedRecharge.description && (
                                    <div>
                                        <span className="text-gray-400">Description:</span>
                                        <p className="text-white mt-1">{selectedRecharge.description}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3 mt-6">
                                {selectedRecharge.status === 'pending' && (
                                    <button
                                        onClick={() => creditBalance(selectedRecharge)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Créditer le solde
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteRecharge(selectedRecharge._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCreateRecharge = () => {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 animate-slideInRight">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setShowFormRecharge(false)}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Retour</span>
                    </button>
                    <h1 className="text-xl font-bold text-white">Nouvelle Recharge</h1>
                    <div className="w-16"></div>
                </div>

                {/* Message de feedback */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 
                        message.type === 'error' ? 'bg-red-900/20 text-red-400 border border-red-800' :
                        'bg-blue-900/20 text-blue-400 border border-blue-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Solde actuel */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Solde actuel</h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{etudiantInfo?.solde || 0} FC</p>
                            <p className="text-gray-400 text-sm">Solde disponible</p>
                        </div>
                    </div>
                </div>

                {/* Formulaire de recharge */}
                {currentStep === 'form' && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Nouvelle recharge</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Montant */}
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-white mb-2">
                                        Montant *
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        step="0.01"
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Ex: 50"
                                    />
                                </div>

                                {/* Devise */}
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-white mb-2">
                                        Devise *
                                    </label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="CDF">CDF (FC)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                                    Numéro de téléphone *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: +243123456789, 0123456789, ou 243123456789"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Numéro mobile money (Airtel Money, M-Pesa, Orange Money)
                                </p>
                                {formData.phone && (
                                    <p className="text-xs text-blue-400 mt-1">
                                        Format final: {formatPhone(formData.phone)}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                                    Description (optionnel)
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: Frais de scolarité"
                                />
                            </div>

                            {/* Bouton de soumission */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Procéder au paiement
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* État de traitement */}
                {currentStep === 'processing' && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Paiement en cours</h2>
                        <p className="text-gray-400 mb-4">
                            Veuillez confirmer le paiement sur votre téléphone
                        </p>
                        {rechargeResult && (
                            <div className="bg-gray-700 rounded-lg p-4 text-left">
                                <p className="text-sm text-gray-300">
                                    <strong>Numéro de commande:</strong> {rechargeResult.orderNumber}
                                </p>
                                <p className="text-sm text-gray-300">
                                    <strong>Montant:</strong> {rechargeResult.amount} {rechargeResult.currency}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* État de succès */}
                {currentStep === 'success' && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Recharge créée !</h2>
                        <p className="text-gray-400 mb-6">
                            Votre recharge a été créée avec succès
                        </p>
                        <button
                            onClick={resetForm}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Effectuer la transaction
                        </button>
                    </div>
                )}

                {/* État d'erreur */}
                {currentStep === 'error' && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Paiement échoué</h2>
                        <p className="text-gray-400 mb-6">
                            Une erreur s'est produite lors du paiement
                        </p>
                        <button
                            onClick={resetForm}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                )}
            </div>
        );

    }

    return showFormRecharge ? renderCreateRecharge() : renderRecharges()
};

export default RechargeSetting;
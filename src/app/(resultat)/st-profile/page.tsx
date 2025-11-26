'use client'
import ProfileSetting from "@/components/profile/ProfileSetting";
import RechargeSetting from "../st-recharges/page";
import { useState } from "react";
import { useResultat } from "../layout";
import { DashboardView } from "../etudiant/[inscription]/page";
import Avatar from "@/components/ui/Avatar";

// Composant Dashboard - Focus sur les infos étudiant avec rendu conditionnel
const DashboardPage = ({ onBack }: { onBack: () => void }) => {
    const { etudiantInfo, parcours } = useResultat();
    const [currentView, setCurrentView] = useState<DashboardView>('main');

    // Rendu conditionnel des vues du dashboard
    switch (currentView) {
        case 'profile':
            return <ProfileSetting onBack={() => setCurrentView('main')} />;
        case 'recharge':
            return <RechargeSetting onBack={() => setCurrentView('main')} />;
        default:
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
                        <h1 className="text-xl font-bold text-white">Mon Profil</h1>
                        <div className="w-16"></div>
                    </div>

                    {/* Carte principale étudiant */}
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center space-x-4 mb-4">
                            <Avatar 
                                photo={etudiantInfo?.photo} 
                                nom={etudiantInfo?.nom} 
                                prenom={etudiantInfo?.prenom} 
                                size="lg"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {etudiantInfo?.nom} {etudiantInfo?.prenom}
                                </h2>
                                <p className="text-gray-400">{etudiantInfo?.matricule}</p>
                            </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h3 className="font-semibold text-white mb-2">Informations personnelles</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Nom complet:</span>
                                        <span className="font-medium text-white">
                                            {etudiantInfo?.nom} {etudiantInfo?.post_nom} {etudiantInfo?.prenom}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Sexe:</span>
                                        <span className="font-medium text-white">{etudiantInfo?.sexe}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Matricule:</span>
                                        <span className="font-medium text-white">{etudiantInfo?.matricule}</span>
                                    </div>
                                    {etudiantInfo?.nationalite && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Nationalité:</span>
                                            <span className="font-medium text-white">{etudiantInfo.nationalite}</span>
                                        </div>
                                    )}
                                    {etudiantInfo?.lieu_naissance && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Lieu de naissance:</span>
                                            <span className="font-medium text-white">{etudiantInfo.lieu_naissance}</span>
                                        </div>
                                    )}
                                    {etudiantInfo?.date_naissance && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Date de naissance:</span>
                                            <span className="font-medium text-white">
                                                {new Date(etudiantInfo.date_naissance).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-900/20 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-400 mb-2">Statut d'inscription</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-300 font-medium">{parcours?.statut}</span>
                                    </div>
                                </div>

                                <div className="bg-blue-900/20 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-400 mb-2">Solde du compte</h3>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <span className="text-blue-300 font-medium">{etudiantInfo?.solde || 0} FC</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setCurrentView('profile')}
                            className="bg-gray-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white text-sm">Modifier mes informations</h3>
                        </button>
                        <button
                            onClick={() => setCurrentView('recharge')}
                            className="bg-gray-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                            <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-white text-sm">Recharger mon compte</h3>
                        </button>
                    </div>
                </div>
            );
    }
};

export default DashboardPage

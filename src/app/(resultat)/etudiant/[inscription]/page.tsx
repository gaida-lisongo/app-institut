'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useResultat } from "../../layout";
import Avatar from "../../../../components/ui/Avatar";
import ProfileSetting from "../../../../components/profile/ProfileSetting";

// Types pour les animations
type PageType = 'welcome' | 'dashboard' | 'resultats';
type DashboardView = 'main' | 'profile' | 'recharge';

// Composant RechargeSetting - Placeholder pour la recharge
const RechargeSetting = ({ onBack }: { onBack: () => void }) => {
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
                <h1 className="text-xl font-bold text-white">Recharger mon compte</h1>
                <div className="w-16"></div>
            </div>

            {/* Contenu placeholder */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Fonctionnalité à venir</h2>
                <p className="text-gray-400 mb-6">
                    La fonctionnalité de recharge sera bientôt disponible.
                </p>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                        🚧 En développement - Cette fonctionnalité sera implémentée prochainement
                    </p>
                </div>
            </div>
        </div>
    );
};

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

// Composant Résultats - Focus sur promotion et année
const ResultatsPage = ({ onBack }: { onBack: () => void }) => {
    const { anneeInfo, promotionInfo } = useResultat();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 animate-slideInLeft">
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
                <h1 className="text-xl font-bold text-white">Mes Résultats</h1>
                <div className="w-16"></div>
            </div>

            {/* Contenu des résultats */}
            <div className="space-y-6">
                {/* Carte Année Académique */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Année Académique</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-400 mb-2">Année en cours</h3>
                            <p className="text-white text-lg font-medium">{anneeInfo?.debut} - {anneeInfo?.fin}</p>
                            <p className="text-gray-400 text-sm">Statut: {anneeInfo?.statut}</p>
                        </div>
                        <div className="bg-purple-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-purple-400 mb-2">Promotion</h3>
                            <p className="text-white text-lg font-medium">{promotionInfo?.designation}</p>
                            <p className="text-gray-400 text-sm">Niveau: {promotionInfo?.niveau}</p>
                        </div>
                    </div>
                </div>

                {/* Placeholder pour les résultats */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Résultats à venir</h2>
                    <p className="text-gray-400 mb-6">
                        Les résultats seront disponibles une fois les évaluations terminées.
                    </p>
                    <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm">
                            📊 En attente - Les résultats seront publiés prochainement
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Composant principal de la page
export default function InscriptionPage() {
    const params = useParams();
    const inscriptionId = params.inscription;
    const { etudiantInfo, parcours, loading, error, fetchParcours } = useResultat();
    const [currentPage, setCurrentPage] = useState<PageType>('welcome');

    // Fetch des données du parcours quand l'inscriptionId est disponible
    useEffect(() => {
        if (inscriptionId) {
            fetchParcours(inscriptionId as string);
        }
    }, []);

    // Auto-navigation vers dashboard si les données sont chargées
    useEffect(() => {
        if (etudiantInfo && parcours && currentPage === 'welcome') {
            const timer = setTimeout(() => {
                setCurrentPage('dashboard');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [etudiantInfo, parcours, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Chargement de votre profil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Page d'accueil avec animation
    if (currentPage === 'welcome') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center animate-fadeIn">
                <div className="text-center">
                    <div className="mb-8">
                        <Avatar 
                            photo={etudiantInfo?.photo} 
                            nom={etudiantInfo?.nom} 
                            prenom={etudiantInfo?.prenom} 
                            size="xl"
                            className="mx-auto mb-4"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 animate-slideInUp">
                        Bienvenue, {etudiantInfo?.prenom} !
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 animate-slideInUp">
                        Matricule: {etudiantInfo?.matricule}
                    </p>
                    <div className="flex space-x-4 justify-center animate-slideInUp">
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Accéder à mon profil
                        </button>
                        <button
                            onClick={() => setCurrentPage('resultats')}
                            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Voir mes résultats
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Rendu conditionnel des pages
    switch (currentPage) {
        case 'dashboard':
            return <DashboardPage onBack={() => setCurrentPage('welcome')} />;
        case 'resultats':
            return <ResultatsPage onBack={() => setCurrentPage('welcome')} />;
        default:
            return null;
    }
}

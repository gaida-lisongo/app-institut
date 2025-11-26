'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useResultat } from "../../layout";

// Types pour les animations
type PageType = 'welcome' | 'dashboard' | 'resultats';

// Composant Dashboard - Focus sur les infos étudiant
const DashboardPage = ({ onBack }: { onBack: () => void }) => {
    const { etudiantInfo, parcours } = useResultat();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 animate-slideInRight">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Retour</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
                <div className="w-16"></div>
            </div>

            {/* Carte principale étudiant */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                            {etudiantInfo?.nom?.charAt(0)}{etudiantInfo?.prenom?.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {etudiantInfo?.nom} {etudiantInfo?.prenom}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">{etudiantInfo?.matricule}</p>
                    </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Informations personnelles</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Nom complet:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {etudiantInfo?.nom} {etudiantInfo?.post_nom} {etudiantInfo?.prenom}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Sexe:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{etudiantInfo?.sexe}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Matricule:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{etudiantInfo?.matricule}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Statut d'inscription</h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-700 dark:text-green-300 font-medium">{parcours?.statut}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Mes Notes</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Emploi du temps</h3>
                </div>
            </div>
        </div>
    );
};

// Composant Résultats - Focus sur promotion et année
const ResultatsPage = ({ onBack }: { onBack: () => void }) => {
    const { anneeInfo, promotionInfo } = useResultat();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 animate-slideInLeft">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Retour</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mes Résultats</h1>
                <div className="w-16"></div>
            </div>

            {/* Informations académiques */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations Académiques</h2>
                
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Promotion</h3>
                        <p className="text-purple-700 dark:text-purple-200 font-medium">{promotionInfo?.designation}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                                {promotionInfo?.systeme}
                            </span>
                            <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                                {promotionInfo?.niveau}
                            </span>
                            <span className="px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                                {promotionInfo?.cycle}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Année Académique</h3>
                        <p className="text-blue-700 dark:text-blue-200 font-medium text-lg">
                            {anneeInfo?.debut} - {anneeInfo?.fin}
                        </p>
                    </div>
                </div>
            </div>

            {/* Semestres */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Semestres</h2>
                {promotionInfo?.semestres?.map((semestre, index) => (
                    <div key={semestre._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                            <h3 className="text-white font-semibold">{semestre.designation}</h3>
                            <p className="text-indigo-100 text-sm">{semestre.credits} crédits</p>
                        </div>
                        
                        <div className="p-4">
                            <div className="grid gap-3">
                                {semestre.unites?.map((unite) => (
                                    <div key={unite._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{unite.designation}</h4>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{unite.credits} cr</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{unite.code}</p>
                                        
                                        {unite.matieres && unite.matieres.length > 0 && (
                                            <div className="space-y-1">
                                                {unite.matieres.map((matiere) => (
                                                    <div key={matiere._id} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                        <span className="text-gray-700 dark:text-gray-300">{matiere.designation}</span>
                                                        <span className="text-gray-500 dark:text-gray-400">{matiere.credits} cr</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Page d'accueil principale
const WelcomePage = () => {
    const { etudiantInfo, loading, error } = useResultat();
    const [selectedPage, setSelectedPage] = useState<PageType>('welcome');

    const menuItems = [
        {
            id: 'dashboard' as PageType,
            label: 'Mon Profil',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-purple-600',
            description: 'Mes informations personnelles'
        },
        {
            id: 'resultats' as PageType,
            label: 'Mes Résultats',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            gradient: 'from-purple-500 to-pink-600',
            description: 'Notes et progression académique'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Chargement de vos informations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Erreur de chargement</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Rendu conditionnel des pages
    switch (selectedPage) {
        case 'dashboard':
            return <DashboardPage onBack={() => setSelectedPage('welcome')} />;
        case 'resultats':
            return <ResultatsPage onBack={() => setSelectedPage('welcome')} />;
        default:
            return (
                <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 animate-fadeIn">
                    {/* Header avec animation */}
                    <div className="text-center mb-8 animate-slideInDown">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-white text-2xl font-bold">
                                {etudiantInfo?.nom?.charAt(0)}{etudiantInfo?.prenom?.charAt(0)}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Bienvenue, {etudiantInfo?.prenom} !
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Accédez à vos informations académiques
                        </p>
                    </div>

                    {/* Menu principal */}
                    <div className="space-y-4 max-w-sm mx-auto">
                        {menuItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedPage(item.id)}
                                className={`w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInUp`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-white shadow-md`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-12 animate-slideInUp" style={{ animationDelay: '400ms' }}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Année académique {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                        </p>
                    </div>
                </div>
            );
    }
};

// Composant principal avec récupération des données
export default function InscriptionPage() {
    const params = useParams();
    const { fetchParcours, loading, error } = useResultat();
    const inscriptionId = params.inscription as string;

    useEffect(() => {
        if (inscriptionId) {
            fetchParcours(inscriptionId);
        }
    }, []);

    return <WelcomePage />;
}
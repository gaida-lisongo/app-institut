'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useResultat } from "../../layout";
import Avatar from "../../../../components/ui/Avatar";
import ProfileSetting from "../../../../components/profile/ProfileSetting";
import { useRecharge } from "../../../../hooks/useRecharge";
import DashboardPage from "../../st-profile/page";
import ResultatsPage from "../../st-resultat/page";

// Types pour les animations
type PageType = 'welcome' | 'dashboard' | 'resultats';
export type DashboardView = 'main' | 'profile' | 'recharge';


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

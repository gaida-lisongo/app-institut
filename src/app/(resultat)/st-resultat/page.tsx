'use client'

import { useResultat } from "../layout";

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

export default ResultatsPage;
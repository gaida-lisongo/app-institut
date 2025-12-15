'use client';
import React from 'react';

interface ClasseStats {
    total: number;
    admis: number;
    echecs: number;
    moyenneClasse: string;
}

interface ClasseInfoCardProps {
    stats: ClasseStats;
    promotionActive: any;
    anneeActive: any;
}

const ClasseInfoCard = ({ stats, promotionActive, anneeActive }: ClasseInfoCardProps) => {
    // Calcul sécurisé du taux pour éviter NaN
    const tauxReussite = stats.total > 0 
        ? ((stats.admis / stats.total) * 100).toFixed(1) 
        : '0.0';
    
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">📊</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Statistiques de la Classe
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {promotionActive?.designation || 'Promotion'} • {anneeActive?.debut ? `${anneeActive.debut}-${anneeActive.fin}` : 'Année'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {tauxReussite}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Taux de réussite
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.total}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total étudiants
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.admis}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Admis (≥50%)
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.echecs}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Échecs (&lt;50%)
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.moyenneClasse}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Moyenne classe
                    </div>
                </div>
            </div>

            {/* Barre de progression visuelle */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Répartition des résultats</span>
                    <span>{stats.admis}/{stats.total} admis</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${tauxReussite}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default ClasseInfoCard;
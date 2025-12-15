'use client'
import React from 'react';
import { EtudiantPalmares } from '@/app/(admin)/(jury)/deliberations/palmaresse/page';

interface EtudiantPalmaresCardProps {
    etudiant: EtudiantPalmares;
    semestres: any[];
    index: number;
    onGenerateBulletin?: (etudiant: EtudiantPalmares) => void;
    isGeneratingBulletin?: boolean;
}

const EtudiantPalmaresCard = ({ etudiant, index, onGenerateBulletin, semestres, isGeneratingBulletin = false }: EtudiantPalmaresCardProps) => {
    const { parcours, pourcentage, mention, rang } = etudiant;
    const { etudiantId } = parcours;

    // Couleur selon la mention
    const getMentionColor = (mention: string) => {
        switch (mention) {
            case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'E': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'F': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    // Couleur du rang
    const getRangStyle = (rang: number) => {
        if (rang === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rang === 2) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
        if (rang === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
        return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    // Avatar avec initiales
    const getInitials = (nom: string, prenom: string) => {
        return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
    };

    const getAvatarColor = (index: number) => {
        const colors = [
            'from-blue-500 to-purple-600',
            'from-green-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-pink-500 to-rose-600',
            'from-indigo-500 to-blue-600',
            'from-yellow-500 to-orange-600'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
                {/* Informations étudiant */}
                <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {getInitials(etudiantId.nom, etudiantId.prenom)}
                    </div>
                    
                    {/* Détails */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {etudiantId.nom} {etudiantId.prenom}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Matricule: {etudiantId.matricule}
                        </p>
                    </div>
                </div>

                {/* Résultats */}
                <div className="flex items-center space-x-6">
                    {/* Rang */}
                    <div className="text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRangStyle(rang)}`}>
                            {rang === 1 && '🥇'}
                            {rang === 2 && '🥈'}
                            {rang === 3 && '🥉'}
                            {rang > 3 && `#${rang}`}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rang</p>
                    </div>

                    {/* Pourcentage */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {pourcentage.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                    </div>

                    {/* Mention */}
                    <div className="text-center">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMentionColor(mention)}`}>
                            {mention}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mention</p>
                    </div>

                    {/* Statut */}
                    <div className="text-center">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            pourcentage >= 50 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                            {pourcentage >= 50 ? 'Admis' : 'Échec'}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Statut</p>
                    </div>

                    {/* Bouton Bulletin */}
                    {
                        semestres ? semestres.map((semestre) => (
                            <div key={semestre.label} className="text-center">
                                <button
                                    onClick={() => onGenerateBulletin ? onGenerateBulletin(etudiant, pourcentage >= 50 ? 'Admis' : 'Non Admis', semestre?.designation) : console.log('No generate bulletin function provided')}
                                    disabled={isGeneratingBulletin}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                                    title="Générer le bulletin de cet étudiant"
                                >
                                    <span>📄</span>
                                    <span>{isGeneratingBulletin ? 'Génération...' : 'Bulletin ' + semestre?.designation}</span>
                                </button>
                            </div>
                        )) : null
                    }
                </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progression</span>
                    <span>{pourcentage.toFixed(1)}% / 100%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                            pourcentage >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            pourcentage >= 80 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            pourcentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                            pourcentage >= 60 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                            pourcentage >= 50 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, pourcentage)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default EtudiantPalmaresCard;

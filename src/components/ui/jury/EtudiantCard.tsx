'use client'
import React from 'react';

interface EtudiantCardProps {
    etudiant: {
        _id: string;
        etudiantId: {
            matricule: string;
            nom: string;
            prenom: string;
        };
    };
    notes: {
        cmi: number;
        examen: number;
        rattrapage: number;
    };
    onNoteChange: (etudiantId: string, field: 'cmi' | 'examen' | 'rattrapage', value: string) => void;
    index: number;
}

const EtudiantCard = ({ etudiant, notes, onNoteChange, index }: EtudiantCardProps) => {
    // Calcul de la moyenne selon les nouvelles spécifications
    const calculerMoyenne = () => {
        const hasCMI = notes.cmi > 0;
        const hasExamen = notes.examen > 0;
        const hasRattrapage = notes.rattrapage > 0;

        // Si CMI ou Examen manquant, afficher une croix
        if (!hasCMI || !hasExamen) {
            return { display: '✕', isValid: false };
        }

        // Total Session sur 20 (CMI + Examen)
        const totalSession = notes.cmi + notes.examen;
        
        // Si pas de rattrapage, retourner le total session
        if (!hasRattrapage) {
            return { display: totalSession.toFixed(2), isValid: totalSession >= 10 };
        }

        // Prendre la meilleure note entre Total Session et Rattrapage
        const meilleurNote = Math.max(totalSession, notes.rattrapage);
        return { display: meilleurNote.toFixed(2), isValid: meilleurNote >= 10 };
    };

    const moyenne = calculerMoyenne();

    return (
        <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow`}>
            {/* En-tête étudiant */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {etudiant.etudiantId.nom.charAt(0)}{etudiant.etudiantId.prenom.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {etudiant.etudiantId.nom} {etudiant.etudiantId.prenom}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {etudiant.etudiantId.matricule}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Moyenne</div>
                    <div className={`text-xl font-bold ${
                        moyenne.isValid 
                            ? 'text-green-600 dark:text-green-400' 
                            : moyenne.display === '✕'
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-red-600 dark:text-red-400'
                    }`}>
                        {moyenne.display}
                        {moyenne.display !== '✕' && <span className="text-sm text-gray-500">/20</span>}
                    </div>
                </div>
            </div>

            {/* Grille des notes */}
            <div className="grid grid-cols-3 gap-4">
                {/* CMI */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                        CMI /10
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.25"
                        value={notes.cmi || ''}
                        onChange={(e) => onNoteChange(etudiant._id, 'cmi', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                    />
                </div>

                {/* Examen */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-2">
                        Examen /10
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.25"
                        value={notes.examen || ''}
                        onChange={(e) => onNoteChange(etudiant._id, 'examen', e.target.value)}
                        className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                    />
                </div>

                {/* Rattrapage */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <label className="block text-xs font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Rattrapage /20
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={notes.rattrapage || ''}
                        onChange={(e) => onNoteChange(etudiant._id, 'rattrapage', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 dark:border-orange-700 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Détail du calcul */}
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded p-2">
                {notes.cmi > 0 && notes.examen > 0 ? (
                    <>
                        <span>Total Session: {(notes.cmi + notes.examen).toFixed(2)}/20</span>
                        {notes.rattrapage > 0 && (
                            <span className="ml-3">• Rattrapage: {notes.rattrapage.toFixed(2)}/20</span>
                        )}
                        {notes.rattrapage > 0 && (
                            <span className="ml-3 font-medium">• Retenu: {Math.max(notes.cmi + notes.examen, notes.rattrapage).toFixed(2)}/20</span>
                        )}
                    </>
                ) : (
                    <span>Notes incomplètes (CMI et Examen requis)</span>
                )}
            </div>
        </div>
    );
};

export default EtudiantCard;

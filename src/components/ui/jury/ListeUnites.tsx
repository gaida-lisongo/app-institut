'use client'
import { usePromotion } from "@/contexts/PromotionContext";
import { useState } from "react";
import FicheCotation from "./FicheCotation";

interface Matiere {
    _id: string;
    designation: string;
    code: string;
    credits: number;
}

const ListeUnites = () => {
    const {
        selectedPromotion,
        annees
    } = usePromotion();
    
    const [selectedSemestreFilter, setSelectedSemestreFilter] = useState<string>('');
    const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null);
    const [showFicheCotation, setShowFicheCotation] = useState(false);
    
    // Obtenir l'année active
    const anneeActive = annees.find(annee => annee.isActive);

    // Filtrer les unités selon le semestre sélectionné
    const getFilteredUnites = () => {
        if (!selectedPromotion) return [];
        
        if (selectedSemestreFilter) {
            const semestre = selectedPromotion.semestres?.find(s => s._id === selectedSemestreFilter);
            return semestre?.unites || [];
        }
        
        // Si aucun filtre, retourner toutes les unités de tous les semestres
        const allUnites = selectedPromotion.semestres?.flatMap(s => s.unites || []) || [];
        return allUnites;
    };

    const handleMatiereClick = (matiere: any) => {
        const matiereData: Matiere = {
            _id: matiere._id,
            designation: matiere.designation,
            code: matiere.code || 'N/A',
            credits: matiere.credits
        };
        
        setSelectedMatiere(matiereData);
        setShowFicheCotation(true);
    };

    const closeFicheCotation = () => {
        setShowFicheCotation(false);
        setSelectedMatiere(null);
    };

    // Si FicheCotation est affichée, on l'affiche à la place de la liste des unités
    if (showFicheCotation && selectedMatiere) {
        return (
            <FicheCotation
                selectedMatiere={selectedMatiere}
                anneeActive={anneeActive}
                closeFicheCotation={closeFicheCotation}
            />
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-300 text-lg font-bold">📚</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Unités d'Enseignement
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Filtrage par semestre
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Filtre par semestre */}
                    {selectedPromotion && selectedPromotion.semestres && selectedPromotion.semestres.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Filtrer par semestre
                            </label>
                            <select
                                value={selectedSemestreFilter}
                                onChange={(e) => setSelectedSemestreFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tous les semestres</option>
                                {selectedPromotion.semestres.map((semestre) => (
                                    <option key={semestre._id} value={semestre._id}>
                                        {semestre.designation} ({semestre.unites?.length || 0} unités)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Statistiques */}
                    {selectedPromotion && !showFicheCotation && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Total unités affichées:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {getFilteredUnites().length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Total crédits:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {getFilteredUnites().reduce((total, unite) => total + (unite.credits || 0), 0)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Liste des unités */}
                    <div className="max-h-96 overflow-y-auto">
                        {selectedPromotion ? (
                            <div className="space-y-2">
                                {getFilteredUnites().length > 0 ? (
                                    getFilteredUnites().map((unite) => (
                                        <div 
                                            key={unite._id}
                                            className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {unite.designation}
                                                </h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                                        {unite.code}
                                                    </span>
                                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                                                        {unite.credits} crédits
                                                    </span>
                                                </div>
                                            </div>
                                            {unite.matieres && unite.matieres.length > 0 && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Matières:</span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {unite.matieres.map((matiere) => (
                                                            <button
                                                                key={matiere._id}
                                                                onClick={() => handleMatiereClick(matiere)}
                                                                className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs cursor-pointer transition-colors"
                                                            >
                                                                {matiere.designation} ({matiere.credits}cr)
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {selectedSemestreFilter 
                                                ? "Aucune unité trouvée pour ce semestre" 
                                                : "Aucune unité disponible"
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Sélectionnez une promotion pour voir les unités
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeUnites;
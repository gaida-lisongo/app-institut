'use client'

import { usePromotion } from "@/contexts/PromotionContext";
// Utilisation d'icônes simples
const BookOpen = () => <span>📚</span>;
const FileText = () => <span>📄</span>;
const Award = () => <span>🏆</span>;

const SemestreUnites = () => {
    const { selectedSemestre, selectedPromotion } = usePromotion();

    if (!selectedSemestre) {
        return (
            <div className="p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun semestre sélectionné
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Sélectionnez un semestre dans la navigation pour voir ses unités d'enseignement
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header du semestre */}
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedSemestre.designation}
                    </h2>
                </div>
                {selectedPromotion && (
                    <p className="text-gray-600 dark:text-gray-400">
                        Promotion: <span className="font-medium">{selectedPromotion.designation}</span>
                    </p>
                )}
            </div>

            {/* Liste des unités */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Unités d'enseignement ({selectedSemestre.unites?.length || 0})</span>
                </h3>

                {selectedSemestre.unites && selectedSemestre.unites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedSemestre.unites.map((unite) => (
                            <div 
                                key={unite._id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {unite.designation}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Code: {unite.code}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                        <Award className="h-4 w-4" />
                                        <span>{unite.credit} crédits</span>
                                    </div>
                                </div>

                                {/* Matières de l'unité */}
                                {unite.matieres && unite.matieres.length > 0 && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Matières ({unite.matieres.length})
                                        </h5>
                                        <div className="space-y-2">
                                            {unite.matieres.map((matiere) => (
                                                <div 
                                                    key={matiere._id}
                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                                                >
                                                    <div className="flex-1">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {matiere.designation}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                            ({matiere.code})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs">
                                                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                                            {matiere.credit} cr
                                                        </span>
                                                        <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                                                            Coef. {matiere.coefficient}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(!unite.matieres || unite.matieres.length === 0) && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            Aucune matière définie pour cette unité
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Aucune unité d'enseignement définie pour ce semestre
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemestreUnites;

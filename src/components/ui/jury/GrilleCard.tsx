
interface GrilleCardProps {
    anneeActive: any;
    selectedPromotion: any;
    handleGenerateGrille: () => void;
}

const GrilleCard = ({
    anneeActive,
    selectedPromotion,
    handleGenerateGrille
}: GrilleCardProps) => {
    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-300 text-lg font-bold">📊</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Générer Grille
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Année courante
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-row justify-between">
                        {/* Informations sur l'année active */}
                        <div className="w-1/2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                Année académique active
                            </h3>
                            {anneeActive ? (
                                <div className="flex items-center space-x-2">
                                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                                        {anneeActive.debut} - {anneeActive.fin}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        (Active)
                                    </span>
                                </div>
                            ) : (
                                <p className="text-red-600 dark:text-red-400 text-sm">
                                    Aucune année active définie
                                </p>
                            )}
                        </div>

                        {/* Informations sur la promotion sélectionnée */}
                        <div className="w-1/2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                Promotion sélectionnée
                            </h3>
                            {selectedPromotion ? (
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedPromotion.designation}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                            {selectedPromotion.systeme}
                                        </span>
                                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                                            {selectedPromotion.niveau}
                                        </span>
                                        <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs">
                                            {selectedPromotion.cycle}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                                    Veuillez sélectionner une promotion dans la navigation
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Bouton de génération */}
                    <button
                        onClick={handleGenerateGrille}
                        disabled={!anneeActive || !selectedPromotion}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            anneeActive && selectedPromotion
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {anneeActive && selectedPromotion 
                            ? 'Générer la grille' 
                            : 'Sélectionner une promotion'
                        }
                    </button>
                </div>
            </div>
        </div>

    );
};

export default GrilleCard;
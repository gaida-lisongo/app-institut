'use client'

interface NavigationJuryProps {
    annees: any[];
    autorisations: any[];
}

const NavigationJury = ({ annees, autorisations }: NavigationJuryProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Navigation Jury
                </h1>
                
                <div className="flex items-center space-x-4">
                    {/* Sélecteur d'année */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Année:
                        </label>
                        <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            {annees.map((annee) => (
                                <option key={annee._id} value={annee._id}>
                                    {annee.designation}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Indicateur d'autorisations */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Autorisations: {autorisations.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavigationJury;
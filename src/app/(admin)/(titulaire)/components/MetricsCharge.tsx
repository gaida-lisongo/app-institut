import { JSX} from "react";
import { ChatIcon, EyeIcon, ListIcon, PageIcon } from "@/icons";


type MetricData = {
    icon: JSX.Element;
    title: string;
    total: number;
    proportion: string;
}

interface MetricsChargeProps {
    totalActivities: number;
    totalSeances: number;
    totalRessources: number;
    totalRecours: number;
    totalStudents: number;
}

const MetricsCharge = ({
    totalActivities,
    totalSeances,
    totalRessources,
    totalRecours,
    totalStudents
}: MetricsChargeProps) => {

    const metricsData : MetricData[] = [
        {
            title: "Activiés",
            total: totalActivities,
            icon: <ListIcon />,
            proportion: totalStudents > 0 ? ((totalActivities) / totalStudents * 100).toFixed(2) + "%" : "0%"
        },
        {
            title: "Seances",
            total: totalSeances,
            icon: <EyeIcon />,
            proportion: totalStudents > 0 ? ((totalSeances) / totalStudents * 100).toFixed(2) + "%" : "0%"
        },
        {
            title: "Ressources",
            total: totalRessources,
            icon: <PageIcon />,
            proportion: totalStudents > 0 ? ((totalRessources) / totalStudents * 100).toFixed(2) + "%" : "0%"
        },
        {
            title: "Recours",
            total: totalRecours,
            icon: <ChatIcon />,
            proportion: totalStudents > 0 ? ((totalRecours) / totalStudents * 100).toFixed(2) + "%" : "0%"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsData.map((metric, index) => (
                <div 
                    key={index}
                    className={`relative overflow-hidden rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                        index === 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200' :
                        index === 1 ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200' :
                        index === 2 ? 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200' :
                        'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
                    }`}
                >
                    {/* Icône de fond décorative */}
                    <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-6 -translate-y-6 ${
                        index === 0 ? 'text-blue-600' :
                        index === 1 ? 'text-green-600' :
                        index === 2 ? 'text-purple-600' :
                        'text-orange-600'
                    }`}>
                        <div className="w-full h-full scale-150">
                            {metric.icon}
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="relative z-10">
                        {/* Header avec icône */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${
                                index === 0 ? 'bg-blue-600' :
                                index === 1 ? 'bg-green-600' :
                                index === 2 ? 'bg-purple-600' :
                                'bg-orange-600'
                            }`}>
                                <div className="w-6 h-6 text-white">
                                    {metric.icon}
                                </div>
                            </div>
                            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                index === 0 ? 'bg-blue-200 text-blue-800' :
                                index === 1 ? 'bg-green-200 text-green-800' :
                                index === 2 ? 'bg-purple-200 text-purple-800' :
                                'bg-orange-200 text-orange-800'
                            }`}>
                                {metric.proportion}
                            </div>
                        </div>

                        {/* Titre */}
                        <h3 className={`text-sm font-semibold mb-2 ${
                            index === 0 ? 'text-blue-700' :
                            index === 1 ? 'text-green-700' :
                            index === 2 ? 'text-purple-700' :
                            'text-orange-700'
                        }`}>
                            {metric.title}
                        </h3>

                        {/* Nombre principal */}
                        <div className="flex items-end space-x-2">
                            <p className={`text-3xl font-bold ${
                                index === 0 ? 'text-blue-900' :
                                index === 1 ? 'text-green-900' :
                                index === 2 ? 'text-purple-900' :
                                'text-orange-900'
                            }`}>
                                {metric.total}
                            </p>
                            <p className="text-sm text-gray-600 pb-1">éléments</p>
                        </div>

                        {/* Barre de progression */}
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ease-out ${
                                        index === 0 ? 'bg-blue-600' :
                                        index === 1 ? 'bg-green-600' :
                                        index === 2 ? 'bg-purple-600' :
                                        'bg-orange-600'
                                    }`}
                                    style={{
                                        width: Math.min(parseFloat(metric.proportion), 100) + '%'
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Ratio par étudiant: {metric.proportion}
                            </p>
                        </div>

                        {/* Indicateur de tendance */}
                        <div className="flex items-center mt-3 space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                                metric.total > 0 ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-xs text-gray-600">
                                {metric.total > 0 ? 'Actif' : 'Aucune donnée'}
                            </span>
                        </div>
                    </div>

                    {/* Effet de brillance au hover */}
                    <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
                </div>
            ))}
        </div>
    );
}

export default MetricsCharge;
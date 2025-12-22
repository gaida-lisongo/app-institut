'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import dynamique d'ApexCharts pour éviter les erreurs SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Resolution {
    _id: string;
    student: any;
    score: number;
    dateSubmitted: string;
}

interface Activity {
    _id: string;
    title: string;
    description: string;
    type: string;
    maximumScore: number;
    resolutions: Resolution[];
    createdAt: string;
    updatedAt: string;
}

interface ActivitiesChartProps {
    activities: Activity[];
}

const ActivitiesChart = ({ activities }: ActivitiesChartProps) => {
    const [chartData, setChartData] = useState<any>({
        series: [],
        options: {}
    });
    const [chartType, setChartType] = useState<'bar' | 'donut' | 'line'>('bar');

    useEffect(() => {
        if (!activities || activities.length === 0) {
            return;
        }

        // Préparer les données pour le graphique
        const activityNames = activities.map(activity => 
            activity.title.length > 20 ? 
            `${activity.title.substring(0, 20)}...` : 
            activity.title
        );
        
        const resolutionsCount = activities.map(activity => 
            activity.resolutions?.length || 0
        );

        // Configuration selon le type de graphique
        if (chartType === 'bar') {
            setChartData({
                series: [{
                    name: 'Nombre de résolutions',
                    data: resolutionsCount,
                    color: '#3B82F6'
                }],
                options: {
                    chart: {
                        type: 'bar',
                        height: 350,
                        toolbar: {
                            show: true,
                            tools: {
                                download: true,
                                selection: false,
                                zoom: false,
                                zoomin: false,
                                zoomout: false,
                                pan: false,
                            }
                        },
                        animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                        }
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 8,
                            horizontal: false,
                            columnWidth: '60%',
                            dataLabels: {
                                position: 'top',
                            },
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        offsetY: -20,
                        style: {
                            fontSize: '12px',
                            colors: ['#304758'],
                            fontWeight: 'bold'
                        }
                    },
                    xaxis: {
                        categories: activityNames,
                        labels: {
                            rotate: -45,
                            style: {
                                fontSize: '11px',
                                colors: '#64748B'
                            }
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Nombre de résolutions',
                            style: {
                                color: '#64748B',
                                fontSize: '12px',
                                fontWeight: 500
                            }
                        },
                        labels: {
                            style: {
                                colors: '#64748B'
                            }
                        }
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            shade: 'light',
                            type: 'vertical',
                            shadeIntensity: 0.25,
                            gradientToColors: ['#60A5FA'],
                            inverseColors: false,
                            opacityFrom: 0.9,
                            opacityTo: 0.7,
                        }
                    },
                    grid: {
                        borderColor: '#E2E8F0',
                        strokeDashArray: 3
                    },
                    tooltip: {
                        theme: 'light',
                        style: {
                            fontSize: '12px'
                        },
                        custom: function({series, seriesIndex, dataPointIndex, w}) {
                            const activity = activities[dataPointIndex];
                            return `
                                <div class="p-3 bg-white shadow-lg rounded-lg border">
                                    <div class="font-semibold text-gray-900 mb-1">${activity.title}</div>
                                    <div class="text-sm text-gray-600 mb-2">Type: ${activity.type}</div>
                                    <div class="text-sm">
                                        <span class="font-medium text-blue-600">${series[seriesIndex][dataPointIndex]}</span>
                                        <span class="text-gray-500"> résolution(s)</span>
                                    </div>
                                    <div class="text-xs text-gray-400 mt-1">
                                        Score max: ${activity.maximumScore} pts
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
            });
        } else if (chartType === 'donut') {
            setChartData({
                series: resolutionsCount,
                options: {
                    chart: {
                        type: 'donut',
                        height: 350,
                    },
                    labels: activityNames,
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'center',
                        fontSize: '12px',
                        labels: {
                            colors: '#64748B'
                        }
                    },
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '65%',
                                labels: {
                                    show: true,
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#64748B',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        formatter: function (w) {
                                            return w.globals.seriesTotals.reduce((a: number, b: number) => {
                                                return a + b;
                                            }, 0);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '11px',
                            fontWeight: 'bold',
                            colors: ['#ffffff']
                        },
                        formatter: function (val: number) {
                            return Math.round(val) + '%';
                        }
                    },
                    tooltip: {
                        theme: 'light',
                        y: {
                            formatter: function (value: number, { seriesIndex }) {
                                const activity = activities[seriesIndex];
                                return `${value} résolution(s) - ${activity.type}`;
                            }
                        }
                    }
                }
            });
        } else if (chartType === 'line') {
            // Graphique en ligne pour voir l'évolution
            const sortedActivities = [...activities].sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            
            setChartData({
                series: [{
                    name: 'Résolutions cumulées',
                    data: sortedActivities.map(activity => activity.resolutions?.length || 0),
                    color: '#10B981'
                }],
                options: {
                    chart: {
                        type: 'line',
                        height: 350,
                        zoom: {
                            enabled: false
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 3
                    },
                    grid: {
                        borderColor: '#E2E8F0'
                    },
                    xaxis: {
                        categories: sortedActivities.map(activity => 
                            new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                            })
                        ),
                        labels: {
                            style: {
                                colors: '#64748B'
                            }
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Nombre de résolutions',
                            style: {
                                color: '#64748B'
                            }
                        }
                    },
                    markers: {
                        size: 6,
                        colors: ['#10B981'],
                        strokeColors: '#ffffff',
                        strokeWidth: 2,
                        hover: {
                            size: 8
                        }
                    },
                    tooltip: {
                        theme: 'light'
                    }
                }
            });
        }
    }, [activities, chartType]);

    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité</h3>
                    <p className="text-gray-500">Créez des activités pour voir les statistiques des résolutions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analyse des Résolutions par Activité
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Visualisation des soumissions d'étudiants par activité
                        </p>
                    </div>
                    
                    {/* Sélecteur de type de graphique */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Type:</label>
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as 'bar' | 'donut' | 'line')}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="bar">Barres</option>
                            <option value="donut">Donut</option>
                            <option value="line">Ligne</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-gray-900">
                            {activities.length}
                        </div>
                        <div className="text-xs text-gray-500">Activités</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-blue-600">
                            {activities.reduce((total, activity) => total + (activity.resolutions?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-500">Total résolutions</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-green-600">
                            {activities.length > 0 ? 
                                Math.round(activities.reduce((total, activity) => total + (activity.resolutions?.length || 0), 0) / activities.length * 10) / 10
                                : 0
                            }
                        </div>
                        <div className="text-xs text-gray-500">Moy. par activité</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-purple-600">
                            {activities.filter(activity => (activity.resolutions?.length || 0) > 0).length}
                        </div>
                        <div className="text-xs text-gray-500">Avec résolutions</div>
                    </div>
                </div>
            </div>

            {/* Graphique */}
            <div className="p-6">
                {typeof window !== 'undefined' && chartData.series && (
                    <Chart
                        options={chartData.options}
                        series={chartData.series}
                        type={chartType}
                        height={350}
                    />
                )}
            </div>
        </div>
    );
};

export default ActivitiesChart;

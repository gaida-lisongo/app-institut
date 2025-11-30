'use client'

import { usePromotion } from "@/contexts/PromotionContext";
import { useState } from "react";

const NavigationJury = () => {
    const { 
        annees, 
        promotions, 
        selectedAnnee, 
        selectedPromotion, 
        selectedSemestre,
        setSelectedAnnee, 
        setSelectedPromotion, 
        setSelectedSemestre 
    } = usePromotion();

    const [expandedPromotions, setExpandedPromotions] = useState<Set<string>>(new Set());

    const togglePromotion = (promotionId: string) => {
        const newExpanded = new Set(expandedPromotions);
        if (newExpanded.has(promotionId)) {
            newExpanded.delete(promotionId);
        } else {
            newExpanded.add(promotionId);
        }
        setExpandedPromotions(newExpanded);
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {/* Header avec sélection d'année */}
            <div className="px-6 py-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Jury de Délibération</h1>
                        <p className="text-blue-100">Gestion des promotions et semestres</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium">Année académique:</span>
                        <select 
                            className="bg-white/20 border border-white/30 rounded-md px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
                            value={selectedAnnee?._id || ''}
                            onChange={(e) => {
                                const annee = annees.find(a => a._id === e.target.value);
                                setSelectedAnnee(annee || null);
                            }}
                        >
                            <option value="">Sélectionner une année</option>
                            {annees.map((annee) => (
                                <option key={annee._id} value={annee._id} className="text-gray-900">
                                    {annee.debut} - {annee.fin}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Navigation des promotions */}
            <div className="px-6 py-4">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Promotions disponibles ({promotions.length})</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {promotions.map((promotion) => (
                        <div 
                            key={promotion._id} 
                            className={`bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-200 hover:bg-white/20 ${
                                selectedPromotion?._id === promotion._id ? 'ring-2 ring-white/50 bg-white/20' : ''
                            }`}
                        >
                            <div 
                                className="p-4 cursor-pointer"
                                onClick={() => {
                                    setSelectedPromotion(promotion);
                                    togglePromotion(promotion._id);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{promotion.designation}</h3>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-blue-100">
                                            <span className="bg-white/20 px-2 py-1 rounded">{promotion.systeme}</span>
                                            <span className="bg-white/20 px-2 py-1 rounded">{promotion.niveau}</span>
                                            <span className="bg-white/20 px-2 py-1 rounded">{promotion.cycle}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        {expandedPromotions.has(promotion._id) ? 
                                            <span>▼</span> : 
                                            <span>▶</span>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Semestres */}
                            {expandedPromotions.has(promotion._id) && (
                                <div className="border-t border-white/20 p-4">
                                    <h4 className="font-medium mb-3">Semestres ({promotion.semestres?.length || 0})</h4>
                                    <div className="space-y-2">
                                        {promotion.semestres?.map((semestre) => (
                                            <div 
                                                key={semestre._id}
                                                className={`p-3 rounded-md cursor-pointer transition-colors ${
                                                    selectedSemestre?._id === semestre._id 
                                                        ? 'bg-white/30 ring-1 ring-white/50' 
                                                        : 'bg-white/10 hover:bg-white/20'
                                                }`}
                                                onClick={() => setSelectedSemestre(semestre)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{semestre.designation}</span>
                                                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                                                        {semestre.unites?.length || 0} unités
                                                    </span>
                                                </div>
                                            </div>
                                        )) || (
                                            <p className="text-blue-100 text-sm italic">Aucun semestre disponible</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {promotions.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-blue-100">Aucune promotion disponible pour cette année</p>
                    </div>
                )}
            </div>

            {/* Barre d'état */}
            {(selectedPromotion || selectedSemestre) && (
                <div className="px-6 py-3 bg-white/10 border-t border-white/20">
                    <div className="flex items-center space-x-4 text-sm">
                        {selectedPromotion && (
                            <span className="bg-white/20 px-3 py-1 rounded-full">
                                📚 {selectedPromotion.designation}
                            </span>
                        )}
                        {selectedSemestre && (
                            <span className="bg-white/20 px-3 py-1 rounded-full">
                                📖 {selectedSemestre.designation}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavigationJury;
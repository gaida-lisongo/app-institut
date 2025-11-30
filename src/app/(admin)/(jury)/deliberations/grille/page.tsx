'use client'

import GrilleCard from "@/components/ui/jury/GrilleCard";
import ListeUnites from "@/components/ui/jury/ListeUnites";
import { usePromotion } from "@/contexts/PromotionContext";

const GrillePage = () => {
    const { 
        annees, 
        selectedPromotion, 
    } = usePromotion();

    // Obtenir l'année active
    const anneeActive = annees.find(annee => annee.isActive);


    const handleGenerateGrille = () => {
        if (!anneeActive || !selectedPromotion) {
            alert("Veuillez sélectionner une promotion pour générer la grille");
            return;
        }
        
        // Logique pour générer la grille
        console.log("Génération de la grille pour:", {
            annee: anneeActive,
            promotion: selectedPromotion
        });
        
        alert(`Grille générée pour ${selectedPromotion.designation} - Année ${anneeActive.debut}-${anneeActive.fin}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Grille de Délibération
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Gestion des grilles et consultation des unités d'enseignement
                </p>
            </div>

            <div className="space-y-6">
                <GrilleCard
                anneeActive={anneeActive}
                selectedPromotion={selectedPromotion}
                handleGenerateGrille={handleGenerateGrille}
                 />
                
                <ListeUnites />
            </div>
        </div>
    );
};

export default GrillePage;
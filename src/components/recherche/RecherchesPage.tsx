'use client';
import { Annee, Promotion } from "@/app/(resultat)/layout";
import { useAcademique } from "@/hooks/useAcademique";
import { useEffect, useState } from "react";
import LoadingSpinner from "../ui/jury/LoadingSpinner";
import RecherchesManager from "./RecherchesManager";
import { PromotionsCard } from "@/app/(admin)/(academique)/enrollements/page";


const RecherchesPage = ({categorie= 'Stage'} : {categorie: 'Stage' | 'Sujet'}) => {
    const { selectedFiliere } = useAcademique();
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [annees, setAnnees] = useState<Annee[]>([]);
    const [loadingAnnees, setLoadingAnnees] = useState(true);

    const fetchAnnees = async () => {
        try {
            setLoadingAnnees(true);
            const response = await fetch('/api/annees');
            const result = await response.json();
            if (result.success && result.data) {
                setAnnees(result.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des années:', error);
        } finally {
            setLoadingAnnees(false);
        }
    };

    useEffect(() => {
        fetchAnnees();
    }, []);

    if(!selectedFiliere) {
        return <LoadingSpinner />;
    }

    if (loadingAnnees) {
        return <LoadingSpinner />;
    }

    if (selectedPromotion) {
        return (
            <RecherchesManager 
                promotion={selectedPromotion} 
                annees={annees}
                onBack={() => setSelectedPromotion(null)}
                categorie={categorie}
            />
        );
    }

    return (
        <PromotionsCard
            filiere={selectedFiliere}
            promotions={selectedFiliere.promotions}
            onClick={(promotion) => {
                console.log("Selected promotion for stages:", promotion);
                promotion ?? setSelectedPromotion(promotion);
            }}
            title={`Gérer les ${categorie}s`}
        />
    );
}

export default RecherchesPage;
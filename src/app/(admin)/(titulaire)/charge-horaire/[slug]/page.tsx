'use client';

import { Etudiant } from "@/app/(resultat)/layout";
import LoadingSpinner from "@/components/ui/jury/LoadingSpinner";
import { ChatIcon, EyeIcon, ListIcon, PageIcon } from "@/icons";
import { useUserStore } from "@/store/useUserStore";
import { useParams } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import ActivitiesTable from "../../components/ActivitiesTable";
import MetricsCharge from "../../components/MetricsCharge";
import ActivitiesChart from "../../components/ActivitiesChart";

const DashboardCharge = () => {
    const params = useParams();
    const { chargesHoraire } = useUserStore();
    const { slug } = params;
    const charge : any= chargesHoraire ? chargesHoraire.find(c => c._id === slug) : null;
    const [ etudiants, setEtudiants ] =  useState<any[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    

    useEffect(() => {
        // Simuler une récupération de données asynchrone
        const fetchEtudiants = async (promotionId : string, anneeId : string) => {
            setLoading(true);
            try {
                const req = await fetch(`/api/parcours?promotionId=${promotionId}&anneeId=${anneeId}`);
                const res = await req.json();

                if(res.success) {
                    setEtudiants(res.data);
                }

            } catch (error) {
                console.error("Erreur lors de la récupération des étudiants :", error);
            } finally {
                setLoading(false);      
            }
        }
        
        if(charge) {
            fetchEtudiants(charge?.promotionId, charge?.anneeId?._id);
            // Initialiser les activités depuis la charge
        }
    }, [charge]);

    if(loading) {
        return <LoadingSpinner />;
    }

    // Afficher un spinner de chargement si les données ne sont pas encore disponibles
    if (!charge) {
        return <LoadingSpinner />;
    }

    return <div className="space-y-8">
        <MetricsCharge
            totalActivities={charge?.activities?.length || 0}
            totalSeances={charge?.seances?.length || 0}
            totalRessources={charge?.ressources?.length || 0}
            totalRecours={charge?.recours?.length || 0}
            totalStudents={etudiants.length}
        />
        <ActivitiesChart activities={charge.activities || []} />
        <ActivitiesTable data={charge.activities || []} chargeId={charge._id} />
    </div>;
}

export default DashboardCharge;
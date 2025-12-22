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
import SeancesLists from "../../components/SeancesLists";
import Descripteur from "../../components/Descripteur";
import RessourceManager from "../../components/RessourceManager";

import FicheCotation from '@/components/ui/jury/FicheCotation';

const DashboardCharge = () => {
    const params = useParams();
    const { chargesHoraire, fetchChargesHoraire, agent } = useUserStore();
    const { slug } = params;
    const charge : any= chargesHoraire ? chargesHoraire.find(c => c._id === slug) : null;
    const [ etudiants, setEtudiants ] =  useState<any[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [showFicheCotation, setShowFicheCotation] = useState(false);
       
    const handleUpdate = () => {
        if (agent?._id) {
            fetchChargesHoraire(agent._id);
        }
    };

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

    if(showFicheCotation) {
        return (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                <div className="p-4">
                    <button 
                        onClick={() => setShowFicheCotation(false)}
                        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour au tableau de bord
                    </button>
                    <FicheCotation
                        selectedMatiere={charge?.cours?._id}
                        anneeActive={charge?.anneeId}
                        closeFicheCotation={() => setShowFicheCotation(false)}
                        promotionId={charge?.promotionId}
                    />
                </div>
            </div>
        );
    }

    return <div className="space-y-8">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
                <MetricsCharge
                    totalActivities={charge?.activities?.length || 0}
                    totalSeances={charge?.seances?.length || 0}
                    totalRessources={charge?.ressources?.length || 0}
                    totalRecours={charge?.recours?.length || 0}
                    totalStudents={etudiants.length}
                />
            </div>
            <div className="col-span-12 xl:col-span-9 gap-4 md:gap-6 space-y-6 gap-y-6">
            
                <ActivitiesChart activities={charge.activities || []} />
                <SeancesLists chargeId={charge._id} seances={charge.seances || []} />
            </div>

            <div className="col-span-12 xl:col-span-3 gap-4 md:gap-6 space-y-6 gap-y-6">
            
                <RessourceManager chargeId={charge._id} resources={charge.ressources || []} onUpdate={handleUpdate} />
                <Descripteur charge={charge} onUpdate={handleUpdate} showCotation={() => setShowFicheCotation(true)} />
            </div>

            <div className="col-span-12">
                <ActivitiesTable data={charge.activities || []} chargeId={charge._id} />
            </div>
        </div>

    </div>;
}

export default DashboardCharge;
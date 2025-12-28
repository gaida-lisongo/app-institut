'use client';

import LoadingSpinner from "@/components/ui/jury/LoadingSpinner";
import { useAcademique } from "../layout";
import { Annee, Promotion } from "../../(appariteur)/inscriptions/[cycle]/page";
import { Matiere } from "@/types/cours";
import { Etudiant } from "@/app/(resultat)/layout";
import { useState } from "react";
import { baseUrl } from "../../page";
import EnrollementManager from "@/components/enrollements/EnrollementManager";
import Button from "@/components/ui/button/Button";
import EnrollmentDetailsPage from "./[enrollementId]/page";
import { set } from "mongoose";

export interface Enrollement {
    _id: string;
    promotionId: Promotion;
    anneeId: Annee;
    amount: number;
    title: string;
    description: string;
    matieres: Matiere[];
    status: string;
    planing: {
        date_examen: Date;
        matieres: Matiere[];
    };
    subscribers?: {
        student: Etudiant;
        code: string;
        date_inscription: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface EnrolementData {
    promotionId: string;
    anneeId: string;
    amount: number;
    title: string;
    description: string;
    matieres: string[];
    status: string;
    planing: {
        date_examen: Date;
        matieres: string[];
    };
}


const EnrolementsPage = () => {
    const { selectedFiliere } = useAcademique();
    const [enrolements, setEnrolements] = useState<Enrollement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    //useAnnee
    const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
    const [showEnrolementManager, setShowEnrolementManager] = useState<boolean>(false);
    const [selectedEnrollement, setSelectedEnrollement] = useState<Enrollement | null>(null);
    console.log("Filière sélectionnée dans EnrolementsPage:", selectedFiliere);
    if(!selectedFiliere) {
        return <LoadingSpinner />;
    }

    if (!selectedFiliere?.promotions) {
        return <div>Aucune promotion disponible pour cette filière.</div>;
    }

    const createEnrolement : (data: EnrolementData) => Promise<void> = async (data: EnrolementData) => {
        try {
            const request = await fetch(`${baseUrl}/finance/enrollements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const response = await request.json();

            if (response.success) {
                console.log("Enrolement créé avec succès:", response.data);
                const newEnrolement: Enrollement = {
                    _id: response.data._id,
                    ...data,
                    promotionId: selectedPromotion!,
                    anneeId: selectedAnnee!,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                setEnrolements((prevEnrolements) => [...prevEnrolements, newEnrolement]);
            } else {
                console.error("Erreur lors de la création de l'enrolement:", response.error);
            }
        } catch (error) {
            console.error("Erreur lors de la création de l'enrolement:", error);
            
        }
    };

    const readEnrolements : (promotionId: string) => Promise<Enrollement[]> = async (promotionId: string) => {
        try {
            const request = await fetch(`${baseUrl}/finance/enrollements/promotion/${promotionId}`);
            const response = await request.json();

            if (response.success) {
                console.log("Enrolements récupérés avec succès:", response.data);
                return response.data as Enrollement[];
            } else {
                console.error("Erreur lors de la récupération des enrolements:", response.error);
                return [];
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des enrolements:", error);
            return [];
        }
    };

    const updateEnrolement : (id: string, data: Partial<EnrolementData>) => Promise<void> = async (id: string, data: Partial<EnrolementData>) => {
        try {
            const request = await fetch(`${baseUrl}/finance/enrollements/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const response = await request.json();
            if (response.success) {
                console.log("Enrolement mis à jour avec succès:", response.data);
                // Mettre à jour la liste des enrolements après mise à jour
                setEnrolements((prevEnrolements) => prevEnrolements.map((enrolement) => enrolement._id === id ? response.data : enrolement));
            } else {
                console.error("Erreur lors de la mise à jour de l'enrolement:", response.error);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'enrolement:", error);
        }
    };

    const deleteEnrolement : (id: string) => Promise<void> = async (id: string) => {
        try {
            const request = await fetch(`${baseUrl}/finance/enrollements/${id}`, {
                method: 'DELETE',
            });
            const response = await request.json();
            if (response.success) {
                console.log("Enrolement supprimé avec succès");
                // Mettre à jour la liste des enrolements après suppression
                setEnrolements((prevEnrolements) => prevEnrolements.filter((enrolement) => enrolement._id !== id));
            } else {
                console.error("Erreur lors de la suppression de l'enrolement:", response.error);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'enrolement:", error);
        }
    };

    if(selectedEnrollement) return <EnrollmentDetailsPage enrollement={selectedEnrollement} />;

    return (
        <div>
            {showEnrolementManager && selectedPromotion ? (
                <EnrollementManager
                    promotion={selectedPromotion}
                    onBack={() => {
                        setShowEnrolementManager(false);
                        setSelectedPromotion(null);
                    }}
                    onCreateEnrolement={createEnrolement}
                    onUpdateEnrolement={updateEnrolement}
                    onDeleteEnrolement={deleteEnrolement}
                    onReadEnrolements={readEnrolements}
                    onClick={setSelectedEnrollement}
                />
            ) : (
                <div>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Gestion des Enrôlements
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gérez les enrôlements pour chaque promotion de la filière {selectedFiliere?.designation}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedFiliere.promotions.map((promotion) => (
                            <div 
                                key={promotion._id} 
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {promotion.designation}
                                            </h3>
                                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                            Gérez les enrôlements, les frais, et les inscriptions pour la promotion {promotion.designation}.
                                        </p>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {promotion.cycle} • {promotion.niveau}ème année
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Filière: {selectedFiliere?.designation}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto">
                                        <Button
                                            onClick={() => {
                                                setSelectedPromotion(promotion);
                                                setShowEnrolementManager(true);
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Gérer les Enrôlements
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {selectedFiliere.promotions.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">
                                Aucune promotion disponible pour cette filière.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default EnrolementsPage;
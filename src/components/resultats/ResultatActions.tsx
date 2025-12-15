'use client';

import { useState } from 'react';
import { Promotion } from "@/app/(resultat)/layout";
import { useResultat } from "@/app/(resultat)/layout";
import { generateSingleBulletin, generateSemestreBulletin, downloadPDF } from "@/utils/BulletinGenerator";
import { EtudiantPalmares, calculMoyenne, calculPourcentage, mentionJury } from "@/app/(admin)/(jury)/deliberations/palmaresse/page";
import { Unite } from "@/types/jury";
import { NoteMatiere } from "@/components/ui/jury/FicheCotation";

interface MoyenneUnite {
    unite: {
        _id: string;
        designation: string;
        credits: number;
    };
    moyenneUnite: number;
    semestre?: {
        id: string;
        libelle: string;
    };
}

const ResultatActions = ({ promotionInfo }: { promotionInfo: Promotion }) => {
    const { etudiantInfo, updateSolde, parcours } = useResultat();
    const [loading, setLoading] = useState(false);

    // Fonction pour calculer les moyennes de l'étudiant en utilisant les notes du parcours
    const calculateStudentAverages = async (): Promise<EtudiantPalmares> => {
        if (!etudiantInfo || !promotionInfo || !parcours) {
            throw new Error('Informations étudiant, promotion ou parcours non disponibles');
        }

        // Utiliser les notes déjà attachées au parcours
        const notes = parcours.notes || [];
        
        const moyennesUnites: any[] = [];
        
        // Calculer la moyenne pour chaque unité
        promotionInfo.semestres?.forEach(semestre => {
            semestre.unites?.forEach(unite => {
                const moyenneUnite = calculMoyenne(unite, notes);
                moyennesUnites.push({
                    ...moyenneUnite,
                    semestre: {
                        id: semestre._id,
                        libelle: semestre.designation
                    }
                });
            });
        });

        // Calculer le pourcentage global et la décision
        const allUnites = promotionInfo.semestres?.flatMap(s => s.unites || []) || [];
        const pourcentage = parseFloat(calculPourcentage(allUnites, moyennesUnites));
        const mention = mentionJury(pourcentage);
        
        // Calculer la décision basée sur le pourcentage (comme dans le palmarès)
        const decision = pourcentage >= 50 ? 'Admis' : 'Non Admis';

        return {
            parcours: {
                _id: parcours._id,
                etudiantId: etudiantInfo
            },
            moyennesUnites,
            pourcentage,
            mention,
            rang: 1
        };
    };

    const checkBalanceAndDeduct = async (cost: number): Promise<boolean> => {
        if (!etudiantInfo) {
            alert('Informations étudiant non disponibles');
            return false;
        }

        const currentBalance = etudiantInfo.solde || 0;
        if (currentBalance < cost) {
            alert(`Solde insuffisant. Votre solde actuel est de ${currentBalance} FC. Coût requis: ${cost} FC`);
            return false;
        }

        try {
            const response = await fetch('/api/etudiants/' + etudiantInfo._id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    solde: currentBalance - cost
                })
            });

            const result = await response.json();
            
            if (result.success) {
                updateSolde(currentBalance - cost);
                return true;
            } else {
                alert('Erreur lors de la déduction du solde: ' + result.error);
                return false;
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du traitement du paiement');
            return false;
        }
    };

    const handleGetResultatAnnuel = async () => {
        const cost = 3000;
        
        setLoading(true);
        try {
            const canProceed = await checkBalanceAndDeduct(cost);
            if (!canProceed) {
                setLoading(false);
                return;
            }

            // Générer le bulletin annuel avec les données réelles de l'étudiant
            const etudiantData = await calculateStudentAverages();

            const pdfDoc = await generateSingleBulletin(etudiantData, promotionInfo, 'Bulletin Annuel');
            downloadPDF(pdfDoc, `bulletin_annuel_${etudiantInfo?.matricule}.pdf`);
            
            alert('Bulletin annuel généré avec succès!');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la génération du bulletin');
        } finally {
            setLoading(false);
        }
    };

    const handleGetResultatSemestriel = async (semestre: string) => {
        const cost = 1500;
        
        setLoading(true);
        try {
            const canProceed = await checkBalanceAndDeduct(cost);
            if (!canProceed) {
                setLoading(false);
                return;
            }

            // Générer le bulletin semestriel avec les données réelles de l'étudiant
            const etudiantData = await calculateStudentAverages();
            
            // Utiliser la décision calculée à partir des notes
            const decision = etudiantData.pourcentage >= 50 ? 'Admis' : 'Non Admis';

            const pdfDoc = await generateSemestreBulletin(etudiantData, promotionInfo, decision, semestre);
            downloadPDF(pdfDoc, `bulletin_${semestre.replace(' ', '_')}_${etudiantInfo?.matricule}.pdf`);
            
            alert(`Bulletin du ${semestre} généré avec succès!`);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la génération du bulletin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Actions sur les résultats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-900/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    <h3 className="font-semibold text-green-400 mb-2">Résultat Annuel</h3>
                    <p className="text-white text-lg font-medium mb-2">3000 FC</p>
                    <button
                        onClick={handleGetResultatAnnuel}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Traitement...' : 'Obtenir'}
                    </button>
                </div>

                {promotionInfo?.semestres?.map((semestre) => (
                    <div key={semestre._id} className="bg-indigo-900/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="font-semibold text-indigo-400 mb-2">Résultat {semestre.designation}</h3>
                    <p className="text-white text-lg font-medium mb-2">1500 FC</p>
                        <button
                            onClick={() => handleGetResultatSemestriel(semestre.designation)}
                            disabled={loading}
                            className="w-full mt-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Traitement...' : 'Obtenir'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultatActions;

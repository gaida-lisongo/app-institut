'use client';

import { useState, useEffect } from 'react';
import { NoteMatiere, ParcoursEtudiant } from "@/components/ui/jury/FicheCotation";
import { Unite } from "@/types/jury";
import LoadingSpinner from '@/components/ui/jury/LoadingSpinner';
import SearchBar from '@/components/ui/jury/SearchBar';
import ClasseInfoCard from '@/components/ui/jury/ClasseInfoCard';
import EtudiantPalmaresCard from '@/components/ui/jury/EtudiantPalmaresCard';
import { usePromotion } from "@/contexts/PromotionContext";
import { generateSingleBulletin, generateGroupBulletins, downloadPDF, openPDF, generateSemestreBulletin } from '@/utils/BulletinGenerator';

export interface NoteUnite {
    matiere: any;
    notes: NoteMatiere;
    finalNote: number;
    totalPond: number;
}

export interface MoyenneUnite {
    unite: Unite;
    notesUnites: NoteUnite[];
    moyenneUnite: number;
    semestre?: {
        id: string;
        libelle: string;
    }
}

export const calculMoyenne = (unite: Unite, notes: NoteMatiere[]) : MoyenneUnite => {
    const notesUnites : any = [];

    unite?.matieres.forEach(matiere => {
        const noteMatiere = notes.find(note => note.matiereId === matiere?._id);

        if(noteMatiere == undefined){
            notesUnites.push({
                matiere,
                notes: {
                    cmi: 0,
                    examen: 0,
                    rattrapage: 0
                },
                finalNote: 0,
                totalPond: 0
            })

            return;
        }

        const totalSession = parseFloat(noteMatiere?.cmi?.toString() ?? '0') + parseFloat(noteMatiere?.examen?.toString() ?? '0');
        const finalNote = parseFloat(noteMatiere?.rattrapage?.toString() ?? '0') > 0 ? Math.max(totalSession, parseFloat(noteMatiere?.rattrapage?.toString() ?? '0')) : totalSession;

        notesUnites.push({
            matiere,
            notes: noteMatiere,
            finalNote,
            totalPond: finalNote * matiere?.credits
        });
    });

    const moyenneUnite = notesUnites.reduce((acc : number, note : any) => acc + note.totalPond, 0) / unite?.credits;
    
    return {
        unite,
        notesUnites,
        moyenneUnite
    }
}

export const calculPourcentage = ( unites: Unite[], moyennes : MoyenneUnite[]) => {
    const maxCredit = unites.reduce((acc : number, unite : Unite) => acc + 20 * unite?.credits, 0);
    const maxNote = moyennes.reduce((acc : number, moy : MoyenneUnite) => acc + moy?.moyenneUnite * moy?.unite?.credits, 0);
    const pourcentage = maxCredit ? (maxNote / maxCredit) * 100 : 0;
    
    return pourcentage.toFixed(2);
}

export const mentionJury = (pourcentage : number) => {
    if(pourcentage >= 90) return 'A';
    if(pourcentage >= 80) return 'B';
    if(pourcentage >= 70) return 'C';
    if(pourcentage >= 60) return 'D';
    if(pourcentage >= 50) return 'E';
    return 'F';
}

export interface EtudiantPalmares {
    parcours: ParcoursEtudiant;
    moyennesUnites: MoyenneUnite[];
    pourcentage: number;
    mention: string;
    rang: number;
}

const PalmaressePage = () => {
    const { 
        annees, 
        selectedPromotion, 
    } = usePromotion();

    // Obtenir l'année active
    const anneeActive = annees.find(annee => annee.isActive);
    const promotionActive = selectedPromotion;
    
    const [etudiants, setEtudiants] = useState<ParcoursEtudiant[]>([]);
    const [etudiantsPalmares, setEtudiantsPalmares] = useState<EtudiantPalmares[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGeneratingBulletins, setIsGeneratingBulletins] = useState<boolean>(false);

    // Récupérer les étudiants (parcours)
    const fetchEtudiants = async () => {
        if (!promotionActive || !anneeActive) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/parcours?promotionId=${promotionActive._id}&anneeId=${anneeActive._id}`);
            const data = await response.json();
            
            if (data.success) {
                setEtudiants(data.data);
                calculerPalmares(data.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des étudiants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculer le palmarès pour tous les étudiants
    const calculerPalmares = (parcours: ParcoursEtudiant[]) => {
        if (!promotionActive?.semestres) return;

        const palmares: EtudiantPalmares[] = parcours.map(p => {
            const moyennesUnites: MoyenneUnite[] = [];
            
            // Calculer la moyenne pour chaque unité
            promotionActive.semestres.forEach(semestre => {
                semestre.unites.forEach(unite => {
                    const moyenneUnite = calculMoyenne(unite, p.notes || []);
                    moyennesUnites.push({
                        ...moyenneUnite,
                        semestre: {
                            id: semestre._id,
                            libelle: semestre.designation
                        }
                    });
                });
            });

            // Calculer le pourcentage global
            const allUnites = promotionActive.semestres.flatMap(s => s.unites);
            const pourcentage = parseFloat(calculPourcentage(allUnites, moyennesUnites));
            const mention = mentionJury(pourcentage);

            return {
                parcours: p,
                moyennesUnites,
                pourcentage,
                mention,
                rang: 0 // Sera calculé après tri
            };
        });

        // Trier par pourcentage décroissant et attribuer les rangs
        const palmaresTrié = palmares
            .sort((a, b) => b.pourcentage - a.pourcentage)
            .map((etudiant, index) => ({
                ...etudiant,
                rang: index + 1
            }));

        setEtudiantsPalmares(palmaresTrié);
    };

    // Filtrer les étudiants selon la recherche
    const getFilteredEtudiants = () => {
        if (!searchTerm.trim()) {
            return etudiantsPalmares;
        }
        
        const term = searchTerm.toLowerCase();
        return etudiantsPalmares.filter(etudiant => 
            etudiant.parcours.etudiantId.nom.toLowerCase().includes(term) ||
            etudiant.parcours.etudiantId.prenom.toLowerCase().includes(term) ||
            etudiant.parcours.etudiantId.matricule.toLowerCase().includes(term)
        );
    };

    // Calculer les statistiques de la classe
    const getClasseStats = () => {
        const total = etudiantsPalmares.length;
        const admis = etudiantsPalmares.filter(e => e.pourcentage >= 50).length;
        const echecs = total - admis;
        const moyenneClasse = total > 0 
            ? (etudiantsPalmares.reduce((acc, e) => acc + e.pourcentage, 0) / total).toFixed(2)
            : '0.00';

        return { total, admis, echecs, moyenneClasse };
    };

    // Générer le bulletin d'un étudiant
    const handleGenerateSingleBulletin = async (etudiant: EtudiantPalmares, decision: string, semestreLabel: string) => {
        if (!promotionActive || !anneeActive) return;

        try {
            setIsGeneratingBulletins(true);
            const promotionInfo = {
                ...promotionActive,
                anneeAcademique: `${anneeActive.debut}-${anneeActive.fin}`
            };

            const pdfDoc = await generateSemestreBulletin(etudiant, promotionInfo, decision, semestreLabel);
            const filename = `Bulletin_${semestreLabel}_${etudiant.parcours.etudiantId.nom}_${etudiant.parcours.etudiantId.prenom}.pdf`;
            downloadPDF(pdfDoc, filename);
        } catch (error) {
            console.error('Erreur lors de la génération du bulletin:', error);
            alert('Erreur lors de la génération du bulletin');
        } finally {
            setIsGeneratingBulletins(false);
        }
    };

    // Générer les bulletins de tous les étudiants
    const handleGenerateAllBulletins = async () => {
        if (!promotionActive || !anneeActive || etudiantsPalmares.length === 0) return;

        try {
            setIsGeneratingBulletins(true);
            const promotionInfo = {
                ...promotionActive,
                anneeAcademique: `${anneeActive.debut}-${anneeActive.fin}`
            };

            const pdfDoc = await generateGroupBulletins(etudiantsPalmares, promotionInfo);
            const filename = `Bulletins_${promotionActive.designation}_${anneeActive.debut}-${anneeActive.fin}.pdf`;
            downloadPDF(pdfDoc, filename);
        } catch (error) {
            console.error('Erreur lors de la génération des bulletins:', error);
            alert('Erreur lors de la génération des bulletins');
        } finally {
            setIsGeneratingBulletins(false);
        }
    };

    // Générer les bulletins des étudiants filtrés
    const handleGenerateFilteredBulletins = async () => {
        const filtered = getFilteredEtudiants();
        if (!promotionActive || !anneeActive || filtered.length === 0) return;

        try {
            setIsGeneratingBulletins(true);
            const promotionInfo = {
                ...promotionActive,
                anneeAcademique: `${anneeActive.debut}-${anneeActive.fin}`,

            };

            const pdfDoc = await generateGroupBulletins(filtered, promotionInfo);
            const filename = `Bulletins_Filtres_${promotionActive.designation}_${anneeActive.debut}-${anneeActive.fin}.pdf`;
            downloadPDF(pdfDoc, filename);
        } catch (error) {
            console.error('Erreur lors de la génération des bulletins:', error);
            alert('Erreur lors de la génération des bulletins');
        } finally {
            setIsGeneratingBulletins(false);
        }
    };

    useEffect(() => {
        fetchEtudiants();
    }, [promotionActive, anneeActive]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner message="Chargement du palmarès..." size="lg" />
            </div>
        );
    }

    if (!promotionActive || !anneeActive) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Aucune promotion sélectionnée
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Veuillez sélectionner une promotion et une année pour voir le palmarès.
                    </p>
                </div>
            </div>
        );
    }

    const stats = getClasseStats();
    const filteredEtudiants = getFilteredEtudiants();

    return (
        <div className="p-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Palmarès de la Classe
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {promotionActive.designation} • Année {anneeActive.debut}-{anneeActive.fin}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleGenerateAllBulletins}
                        disabled={isGeneratingBulletins || etudiantsPalmares.length === 0}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                        <span>📋</span>
                        <span>{isGeneratingBulletins ? 'Génération...' : 'Tous les Bulletins'}</span>
                    </button>
                    
                    {searchTerm && filteredEtudiants.length > 0 && filteredEtudiants.length < etudiantsPalmares.length && (
                        <button 
                            onClick={handleGenerateFilteredBulletins}
                            disabled={isGeneratingBulletins}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                        >
                            <span>🎯</span>
                            <span>Bulletins Filtrés ({filteredEtudiants.length})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Carte d'informations de la classe */}
            <ClasseInfoCard 
                stats={stats}
                promotionActive={promotionActive}
                anneeActive={anneeActive}
            />

            {/* Barre de recherche */}
            <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                totalCount={etudiantsPalmares.length}
                filteredCount={filteredEtudiants.length}
            />

            {/* Liste des étudiants */}
            <div className="space-y-4">
                {filteredEtudiants.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🎓</div>
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'Aucun étudiant trouvé pour cette recherche' : 'Aucun étudiant dans cette promotion'}
                        </p>
                    </div>
                ) : (
                    filteredEtudiants.map((etudiant, index) => (
                        <EtudiantPalmaresCard
                            key={etudiant.parcours._id}
                            etudiant={etudiant}
                            index={index}
                            semestres = {promotionActive?.semestres}
                            onGenerateBulletin={handleGenerateSingleBulletin}
                            isGeneratingBulletin={isGeneratingBulletins}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PalmaressePage;
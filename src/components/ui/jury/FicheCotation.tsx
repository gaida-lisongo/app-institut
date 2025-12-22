'use client'
import { Annee, Etudiant, Promotion } from "@/app/(resultat)/layout";
import React, { useState, useEffect } from "react";
import LoadingSpinner from './LoadingSpinner';
import StatistiquesCard from './StatistiquesCard';
import SearchBar from './SearchBar';
import ImportExportActions from './ImportExportActions';
import EtudiantCard from './EtudiantCard';
import ProgressBar from './ProgressBar';
import { parseCSV, generateCSV, findColumnIndex, findRowByValue, validateNotesCSVFormat } from '@/utils/csvUtils';

export interface NoteMatiere {
    _id?: string;
    matiereId: string;
    cmi?: number;
    examen?: number;
    rattrapage?: number;
}

export interface ParcoursEtudiant {
    _id: string;
    etudiantId: Etudiant;
    anneeId: Annee;
    promotionId: Promotion;
    statut: string;
    notes?: NoteMatiere[]
}

interface FicheCotationProps {
    selectedMatiere: any;
    anneeActive: any;
    closeFicheCotation: () => void;
    promotionId: string;
    initialEtudiants?: ParcoursEtudiant[];
}

const FicheCotation = ({
    selectedMatiere,
    anneeActive,
    closeFicheCotation,
    promotionId,
    initialEtudiants
}: FicheCotationProps) => {
    const [etudiants, setEtudiants] = useState<ParcoursEtudiant[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveProgress, setSaveProgress] = useState<number>(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchEtudiant = async () => {
        try {
            setIsLoading(true);
            const req = await fetch(`/api/parcours?promotionId=${promotionId}&anneeId=${anneeActive._id}`);
            const resp = await req.json();
            console.log("Etudiants req : ", resp)
            if(resp.success) {
                // Trier les étudiants par ordre alphabétique (nom en priorité)
                const etudiantsTries = resp.data.sort((a: ParcoursEtudiant, b: ParcoursEtudiant) => {
                    const nomA = a.etudiantId.nom.toLowerCase();
                    const nomB = b.etudiantId.nom.toLowerCase();
                    if (nomA === nomB) {
                        return a.etudiantId.prenom.toLowerCase().localeCompare(b.etudiantId.prenom.toLowerCase());
                    }
                    return nomA.localeCompare(nomB);
                });
                setEtudiants(etudiantsTries);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des étudiants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Charger les étudiants au montage du composant
    useEffect(() => {
        if (initialEtudiants && initialEtudiants.length > 0) {
            // Si les étudiants sont fournis en props, on les utilise directement
            const etudiantsTries = [...initialEtudiants].sort((a: ParcoursEtudiant, b: ParcoursEtudiant) => {
                const nomA = a.etudiantId.nom.toLowerCase();
                const nomB = b.etudiantId.nom.toLowerCase();
                if (nomA === nomB) {
                    return a.etudiantId.prenom.toLowerCase().localeCompare(b.etudiantId.prenom.toLowerCase());
                }
                return nomA.localeCompare(nomB);
            });
            setEtudiants(etudiantsTries);
            setIsLoading(false);
        } else {
            // Sinon on les fetch
            fetchEtudiant();
        }
    }, [selectedMatiere, initialEtudiants]);

    // Fonction pour obtenir les notes d'un étudiant pour la matière courante
    const getNotesForMatiere = (etudiant: ParcoursEtudiant) => {
        const noteMatiere = etudiant.notes?.find(note => note.matiereId === selectedMatiere._id);
        return {
            cmi: noteMatiere?.cmi || 0,
            examen: noteMatiere?.examen || 0,
            rattrapage: noteMatiere?.rattrapage || 0
        };
    };

    // Fonction pour filtrer les étudiants selon le terme de recherche
    const getFilteredEtudiants = () => {
        if (!searchTerm.trim()) {
            return etudiants;
        }
        
        const term = searchTerm.toLowerCase();
        return etudiants.filter(etudiant => 
            etudiant.etudiantId.nom.toLowerCase().includes(term) ||
            etudiant.etudiantId.prenom.toLowerCase().includes(term) ||
            etudiant.etudiantId.matricule.toLowerCase().includes(term)
        );
    };

    // Calcul des statistiques avec la nouvelle logique de moyenne
    const calculateStatistics = () => {
        const filtered = getFilteredEtudiants();
        let admis = 0;
        let rattrapage = 0;
        let totalNotes = 0;
        let countNotes = 0;

        filtered.forEach(etudiant => {
            const notes = getNotesForMatiere(etudiant);
            const hasCMI = notes.cmi > 0;
            const hasExamen = notes.examen > 0;
            
            if (hasCMI && hasExamen) {
                const totalSession = notes.cmi + notes.examen;
                const finalNote = notes.rattrapage > 0 ? Math.max(totalSession, notes.rattrapage) : totalSession;
                
                if (finalNote >= 10) {
                    admis++;
                } else {
                    rattrapage++;
                }
                
                totalNotes += finalNote;
                countNotes++;
            }
        });

        return {
            total: etudiants.length,
            filtered: filtered.length,
            admis,
            rattrapage,
            moyenne: countNotes > 0 ? (totalNotes / countNotes).toFixed(2) : '0.00'
        };
    };

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvContent = e.target?.result as string;
            
            // Utiliser l'utilitaire CSV
            const parseResult = parseCSV(csvContent);
            const validation = validateNotesCSVFormat(parseResult);
            
            if (!validation.valid) {
                alert(`Erreur dans le fichier CSV: ${validation.error}`);
                return;
            }

            const { headers, rows } = parseResult;
            const cmiIndex = findColumnIndex(headers, 'cmi');
            const examenIndex = findColumnIndex(headers, 'examen');
            const rattrapageIndex = findColumnIndex(headers, 'rattrapage');
            const matriculeIndex = findColumnIndex(headers, 'matricule');
            const nomIndex = findColumnIndex(headers, 'nom');

            const updatedEtudiants = etudiants.map(etudiant => {
                // Chercher l'étudiant dans le CSV par matricule UNIQUEMENT (plus sûr)
                let studentRow = null;
                
                if (matriculeIndex >= 0) {
                    // Priorité au matricule (correspondance exacte)
                    studentRow = rows.find(row => 
                        row[matriculeIndex]?.trim().toLowerCase() === etudiant.etudiantId.matricule.trim().toLowerCase()
                    );
                }
                
                // Si pas trouvé par matricule, essayer par nom (correspondance exacte aussi)
                if (!studentRow && nomIndex >= 0) {
                    studentRow = rows.find(row => 
                        row[nomIndex]?.trim().toLowerCase() === etudiant.etudiantId.nom.trim().toLowerCase()
                    );
                }

                if (studentRow) {
                    // Mettre à jour les notes dans le parcours
                    const updatedNotes = etudiant.notes || [];
                    const existingNoteIndex = updatedNotes.findIndex(note => note.matiereId === selectedMatiere._id);
                    
                    const newNote = {
                        matiereId: selectedMatiere._id,
                        cmi: cmiIndex >= 0 ? parseFloat(studentRow[cmiIndex]) || 0 : getNotesForMatiere(etudiant).cmi,
                        examen: examenIndex >= 0 ? parseFloat(studentRow[examenIndex]) || 0 : getNotesForMatiere(etudiant).examen,
                        rattrapage: rattrapageIndex >= 0 ? parseFloat(studentRow[rattrapageIndex]) || 0 : getNotesForMatiere(etudiant).rattrapage,
                    };

                    if (existingNoteIndex >= 0) {
                        updatedNotes[existingNoteIndex] = newNote;
                    } else {
                        updatedNotes.push(newNote);
                    }

                    return {
                        ...etudiant,
                        notes: updatedNotes
                    };
                }
                return etudiant;
            });

            // Compter les étudiants mis à jour
            const etudiantsModifies = updatedEtudiants.filter((etudiant, index) => {
                const originalEtudiant = etudiants[index];
                const originalNotes = getNotesForMatiere(originalEtudiant);
                const newNotes = getNotesForMatiere(etudiant);
                
                return originalNotes.cmi !== newNotes.cmi || 
                       originalNotes.examen !== newNotes.examen || 
                       originalNotes.rattrapage !== newNotes.rattrapage;
            });

            setEtudiants(updatedEtudiants);
            alert(`Notes importées avec succès !\n${etudiantsModifies.length} étudiant(s) mis à jour sur ${etudiants.length} total.`);
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    const handleCSVExport = () => {
        const headers = ['Matricule', 'Nom', 'Prenom', 'CMI(/10)', 'Examen(/10)', 'Rattrapage(/20)', 'TotalSession(/20)', 'NoteFinal(/20)'];
        
        const rows = getFilteredEtudiants().map(e => {
            const notes = getNotesForMatiere(e);
            const totalSession = notes.cmi + notes.examen;
            const finalNote = notes.rattrapage > 0 ? Math.max(totalSession, notes.rattrapage) : totalSession;
            
            return [
                e.etudiantId.matricule,
                e.etudiantId.nom,
                e.etudiantId.prenom,
                notes.cmi || '0',
                notes.examen || '0',
                notes.rattrapage || '0',
                totalSession.toFixed(2),
                finalNote.toFixed(2)
            ];
        });
        
        const csvContent = generateCSV({ headers, rows });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes_${selectedMatiere.code}_${anneeActive?.debut}-${anneeActive?.fin}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleNoteChange = async (etudiantId: string, field: 'cmi' | 'examen' | 'rattrapage', value: string) => {
        const numValue = parseFloat(value);
        const maxValue = field === 'rattrapage' ? 20 : 10;

        if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
            return;
        }

        // 1. Mise à jour optimiste de l'UI
        setEtudiants(prev => prev.map(etudiant => {
            if (etudiant._id === etudiantId) {
                const updatedNotes = etudiant.notes ? [...etudiant.notes] : [];
                const existingNoteIndex = updatedNotes.findIndex(note => note.matiereId === selectedMatiere._id);
                
                const currentNotes = getNotesForMatiere(etudiant);
                const newNote = {
                    matiereId: selectedMatiere._id,
                    cmi: field === 'cmi' ? numValue : currentNotes.cmi,
                    examen: field === 'examen' ? numValue : currentNotes.examen,
                    rattrapage: field === 'rattrapage' ? numValue : currentNotes.rattrapage,
                };

                if (existingNoteIndex >= 0) {
                    updatedNotes[existingNoteIndex] = newNote;
                } else {
                    updatedNotes.push(newNote);
                }

                return {
                    ...etudiant,
                    notes: updatedNotes
                };
            }
            return etudiant;
        }));

        // 2. Persistance via API
        try {
            const response = await fetch('/api/parcours/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parcoursId: etudiantId, // etudiantId ici correspond à l'ID du parcours (ParcoursEtudiant._id)
                    matiereId: selectedMatiere._id,
                    [field]: numValue
                })
            });

            const result = await response.json();
            if (!result.success) {
                console.error('Erreur sauvegarde note:', result.error);
                // Optionnel : Revert UI change here if needed
            }
        } catch (error) {
            console.error('Erreur réseau sauvegarde note:', error);
        }
    };

    // Fonction pour sauvegarder toutes les notes via l'API
    const handleSaveNotes = async () => {
        setIsSaving(true);
        setSaveProgress(0);

        const etudiantsAvecNotes = etudiants.filter(etudiant => {
            const notes = getNotesForMatiere(etudiant);
            return notes.cmi > 0 || notes.examen > 0 || notes.rattrapage > 0;
        });

        if (etudiantsAvecNotes.length === 0) {
            alert('Aucune note à sauvegarder');
            setIsSaving(false);
            return;
        }

        let savedCount = 0;
        let errors = [];

        for (const etudiant of etudiantsAvecNotes) {
            try {
                const notes = getNotesForMatiere(etudiant);
                
                const response = await fetch(`/api/parcours/${etudiant._id}/notes`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        matiereId: selectedMatiere._id,
                        cmi: notes.cmi,
                        examen: notes.examen,
                        rattrapage: notes.rattrapage
                    })
                });

                if (response.ok) {
                    savedCount++;
                } else {
                    const errorData = await response.json();
                    errors.push(`${etudiant.etudiantId.nom}: ${errorData.error}`);
                }
            } catch (error) {
                errors.push(`${etudiant.etudiantId.nom}: Erreur de connexion`);
            }

            // Mettre à jour la progression
            const progress = ((savedCount + errors.length) / etudiantsAvecNotes.length) * 100;
            setSaveProgress(progress);

            // Petite pause pour voir la progression
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setIsSaving(false);
        setSaveProgress(0);

        if (errors.length === 0) {
            alert(`Toutes les notes ont été sauvegardées avec succès ! (${savedCount} étudiants)`);
        } else {
            alert(`Sauvegarde terminée avec ${errors.length} erreur(s):\n${errors.join('\n')}\n\nNotes sauvegardées: ${savedCount}/${etudiantsAvecNotes.length}`);
        }
    };

    const height = `space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto` 

    const stats = calculateStatistics();

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <LoadingSpinner message="Chargement des étudiants..." size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                {/* En-tête */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">📝</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Fiche de Cotation
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{selectedMatiere.designation}</span> • 
                                <span className="mx-1">{selectedMatiere.code}</span> • 
                                <span className="mx-1">{selectedMatiere.credits} crédits</span> • 
                                <span className="mx-1">Année {anneeActive?.debut}-{anneeActive?.fin}</span>
                            </p>
                        </div>
                    </div>

                    {/* Actions de sauvegarde */}
                    <div className="mt-6 mb-6 flex justify-end space-x-3 pt-4">
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSaving}
                            className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2 ${
                                isSaving ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <span>💾</span>
                            <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder les notes'}</span>
                        </button>
                        <button
                            onClick={closeFicheCotation}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <StatistiquesCard title="Total inscrits" value={stats.total} color="blue" />
                    <StatistiquesCard title="Affichés" value={stats.filtered} color="purple" />
                    <StatistiquesCard title="Admis (≥10)" value={stats.admis} color="green" />
                    <StatistiquesCard title="En rattrapage" value={stats.rattrapage} color="orange" />
                    <StatistiquesCard title="Moyenne générale" value={`${stats.moyenne}/20`} color="gray" />
                </div>

                {/* Barre de recherche */}
                <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    totalCount={etudiants.length}
                    filteredCount={getFilteredEtudiants().length}
                />

                {/* Actions Import/Export */}
                <ImportExportActions 
                    onImport={handleCSVImport}
                    onExport={handleCSVExport}
                    fileInputRef={fileInputRef}
                />

                {/* Liste des étudiants */}
                <div className={height}>
                    {getFilteredEtudiants().length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">👥</div>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Aucun étudiant trouvé pour cette recherche' : 'Aucun étudiant inscrit'}
                            </p>
                        </div>
                    ) : (
                        getFilteredEtudiants().map((etudiant, index) => (
                            <EtudiantCard
                                key={etudiant._id}
                                etudiant={etudiant}
                                notes={getNotesForMatiere(etudiant)}
                                onNoteChange={handleNoteChange}
                                index={index}
                            />
                        ))
                    )}
                </div>
            </div>
            
            {/* Barre de progression pour la sauvegarde */}
            <ProgressBar 
                progress={saveProgress}
                message={`Sauvegarde des notes... ${Math.round(saveProgress)}%`}
                isVisible={isSaving}
            />
        </div>
    );
};

export default FicheCotation;

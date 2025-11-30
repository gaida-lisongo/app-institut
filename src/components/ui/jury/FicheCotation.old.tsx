'use client'
import { Annee, Etudiant, Promotion } from "@/app/(resultat)/layout";
import React, { useState, useEffect } from "react";
import LoadingSpinner from './LoadingSpinner';
import StatistiquesCard from './StatistiquesCard';
import SearchBar from './SearchBar';
import ImportExportActions from './ImportExportActions';
import EtudiantCard from './EtudiantCard';

interface ParcoursEtudiant {
    _id: string;
    etudiantId: Etudiant;
    anneeId: Annee;
    promotionId: Promotion;
    statut: string;
    notes?: {
        matiereId: string;
        cmi?: number;
        examen?: number;
        rattrapage?: number;
    }[]
}

interface FicheCotationProps {
    selectedMatiere: any;
    anneeActive: any;
    closeFicheCotation: () => void;
    promotionId: string;
}

const FicheCotation = ({
    selectedMatiere,
    anneeActive,
    closeFicheCotation,
    promotionId
}: FicheCotationProps) => {
    const [etudiants, setEtudiants] = useState<ParcoursEtudiant[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchEtudiant = async () => {
        try {
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
        }
    };

    // Charger les étudiants au montage du composant
    useEffect(() => {
        fetchEtudiant();
    }, [selectedMatiere]);

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

    const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target?.result as string;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const updatedEtudiants = etudiants.map(etudiant => {
                const dataLine = lines.find(line =>
                    line.toLowerCase().includes(etudiant.etudiantId.matricule.toLowerCase()) ||
                    line.toLowerCase().includes(etudiant.etudiantId.nom.toLowerCase())
                );

                if (dataLine) {
                    const values = dataLine.split(',').map(v => v.trim());
                    const cmiIndex = headers.findIndex(h => h.toLowerCase().includes('cmi'));
                    const examenIndex = headers.findIndex(h => h.toLowerCase().includes('examen'));
                    const rattrapageIndex = headers.findIndex(h => h.toLowerCase().includes('rattrapage'));

                    // Mettre à jour les notes dans le parcours
                    const updatedNotes = etudiant.notes || [];
                    const existingNoteIndex = updatedNotes.findIndex(note => note.matiereId === selectedMatiere._id);
                    
                    const newNote = {
                        matiereId: selectedMatiere._id,
                        cmi: cmiIndex >= 0 ? parseFloat(values[cmiIndex]) || 0 : getNotesForMatiere(etudiant).cmi,
                        examen: examenIndex >= 0 ? parseFloat(values[examenIndex]) || 0 : getNotesForMatiere(etudiant).examen,
                        rattrapage: rattrapageIndex >= 0 ? parseFloat(values[rattrapageIndex]) || 0 : getNotesForMatiere(etudiant).rattrapage,
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

            setEtudiants(updatedEtudiants);
            alert('Notes importées avec succès !');
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    const handleNoteChange = (etudiantId: string, field: 'cmi' | 'examen' | 'rattrapage', value: string) => {
        const numValue = parseFloat(value);
        const maxValue = field === 'rattrapage' ? 20 : 10;

        if (isNaN(numValue) || numValue < 0 || numValue > maxValue) {
            return;
        }

        setEtudiants(prev => prev.map(etudiant => {
            if (etudiant._id === etudiantId) {
                const updatedNotes = etudiant.notes || [];
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
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-300 text-lg font-bold">📝</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Fiche de Cotation - {selectedMatiere.designation}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedMatiere.code} • {selectedMatiere.credits} crédits • Année {anneeActive?.debut}-{anneeActive?.fin}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeFicheCotation}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>
                {/* Statistiques de la fiche */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {etudiants.length}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                            Total inscrits
                        </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {getFilteredEtudiants().length}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                            Affichés
                        </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {getFilteredEtudiants().filter(e => {
                                const notes = getNotesForMatiere(e);
                                return notes.cmi && notes.examen && ((notes.cmi + notes.examen) / 2) >= 10;
                            }).length}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                            Admis (≥10)
                        </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {getFilteredEtudiants().filter(e => {
                                const notes = getNotesForMatiere(e);
                                return notes.cmi && notes.examen && ((notes.cmi + notes.examen) / 2) < 10;
                            }).length}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                            En rattrapage
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            {(() => {
                                const etudiantsAvecNotes = getFilteredEtudiants().filter(e => {
                                    const notes = getNotesForMatiere(e);
                                    return notes.cmi && notes.examen;
                                });
                                if (etudiantsAvecNotes.length > 0) {
                                    const somme = etudiantsAvecNotes.reduce((sum, e) => {
                                        const notes = getNotesForMatiere(e);
                                        return sum + ((notes.cmi + notes.examen) / 2);
                                    }, 0);
                                    return (somme / etudiantsAvecNotes.length).toFixed(2);
                                }
                                return '0.00';
                            })()
                            }
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Moyenne générale
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {getFilteredEtudiants().length} étudiant(s) trouvé(s) sur {etudiants.length}
                        </div>
                    )}
                </div>

                {/* Actions d'import */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                Import des notes
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Format CSV attendu: Matricule, Nom, Prenom, CMI(/10), Examen(/10), Rattrapage(/20)
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleCSVImport}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                📁 Importer CSV
                            </button>
                            <button
                                onClick={() => {
                                    const csvContent = "Matricule,Nom,Prenom,CMI(/10),Examen(/10),Rattrapage(/20),Moyenne\n" +
                                        getFilteredEtudiants().map(e => {
                                            const notes = getNotesForMatiere(e);
                                            const moyenne = notes.cmi && notes.examen
                                                ? ((notes.cmi + notes.examen) / 2).toFixed(2)
                                                : notes.rattrapage
                                                    ? (notes.rattrapage / 2).toFixed(2)
                                                    : '0.00';
                                            return `${e.etudiantId.matricule},${e.etudiantId.nom},${e.etudiantId.prenom},${notes.cmi || '0'},${notes.examen || '0'},${notes.rattrapage || '0'},${moyenne}`;
                                        }).join('\n');
                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `notes_${selectedMatiere.code}_${anneeActive?.debut}-${anneeActive?.fin}.csv`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                💾 Exporter CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tableau des étudiants */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                                    Matricule
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                                    Nom & Prénom
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                                    CMI/10
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                                    Examen/10
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                                    Rattrapage/20
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                                    Moyenne
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredEtudiants().map((etudiant, index) => {
                                const notes = getNotesForMatiere(etudiant);
                                const moyenne = notes.cmi && notes.examen
                                    ? ((notes.cmi + notes.examen) / 2).toFixed(2)
                                    : notes.rattrapage
                                        ? (notes.rattrapage / 2).toFixed(2)
                                        : '0.00';

                                return (
                                    <tr key={etudiant._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-mono text-sm">
                                            {etudiant.etudiantId.matricule}
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {etudiant.etudiantId.nom} {etudiant.etudiantId.prenom}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.25"
                                                value={notes.cmi || ''}
                                                onChange={(e) => handleNoteChange(etudiant._id, 'cmi', e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.25"
                                                value={notes.examen || ''}
                                                onChange={(e) => handleNoteChange(etudiant._id, 'examen', e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.25"
                                                value={notes.rattrapage || ''}
                                                onChange={(e) => handleNoteChange(etudiant._id, 'rattrapage', e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                                            <span className={`font-semibold ${
                                                parseFloat(moyenne) >= 10
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {moyenne}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Actions de sauvegarde */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={closeFicheCotation}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={() => alert('Notes sauvegardées avec succès !')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        💾 Sauvegarder les notes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FicheCotation;
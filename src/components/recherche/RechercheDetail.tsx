'use client';

import { baseUrl } from '@/app/(admin)/page';
import React, { useState } from 'react';
import { Recherche } from './RecherchesManager';
import { generateRechercheSubscriptionSheet } from '@/utils/RechercheSheetGenerator';

// Icons alternatifs pour remplacer lucide-react temporairement
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Utilisons les interfaces depuis le parent
interface Promotion {
  _id: string;
  designation: string;
}

interface Annee {
  _id: string;
  debut: string; // Changé en string pour correspondre à l'interface Recherche
  fin: string;   // Changé en string pour correspondre à l'interface Recherche
}

// Fonctions CSV temporaires (à déplacer vers csvUtils plus tard)
const parseRechercheCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const expectedHeaders = ['matricule', 'tuteur', 'title', 'description'];
  
  // Vérifier que tous les headers requis sont présents
  const hasAllHeaders = expectedHeaders.every(header => headers.includes(header));
  if (!hasAllHeaders) {
    throw new Error(`Le fichier CSV doit contenir les colonnes: ${expectedHeaders.join(', ')}`);
  }
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Validation
      if (row.matricule && row.tuteur && row.title && row.description) {
        data.push(row);
      }
    }
  }
  
  return data;
};

const generateRechercheTemplate = () => {
  return 'matricule,tuteur,title,description\nETU001,Dr. Martin,Recherche en IA,Développement d\'algorithmes d\'apprentissage automatique';
};

const generateSubscriptionPDF = (recherche: Recherche) => {
  generateRechercheSubscriptionSheet(recherche);
};

interface RechercheDetailProps {
  stageData: Recherche;
  onBack: () => void;
}

const RechercheDetail: React.FC<RechercheDetailProps> = ({ stageData, onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importError, setImportError] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<number>(0);
  const [updatingNote, setUpdatingNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtrer les souscriptions basées sur le terme de recherche
  const filteredSubscribers = stageData.subscribers?.filter(subscriber => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const studentName = subscriber.student ? 
      `${subscriber.student.nom} ${subscriber.student.post_nom} ${subscriber.student.prenom}`.toLowerCase() : '';
    const studentMatricule = subscriber.student?.matricule?.toLowerCase() || '';
    const tuteurName = subscriber.tuteur ? 
      `${subscriber.tuteur.nom} ${subscriber.tuteur.post_nom} ${subscriber.tuteur.prenom}`.toLowerCase() : '';
    const tuteurMatricule = subscriber.tuteur?.matricule?.toLowerCase() || '';
    const title = subscriber.title?.toLowerCase() || '';
    
    return studentName.includes(search) || 
           studentMatricule.includes(search) || 
           tuteurName.includes(search) || 
           tuteurMatricule.includes(search) ||
           title.includes(search);
  }) || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setImportError('Veuillez sélectionner un fichier CSV valide');
      return;
    }

    setSelectedFile(file);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      try {
        const parsedData = parseRechercheCSV(csvText);
        setCsvPreviewData(parsedData);
        setShowPreview(true);
        
        if (parsedData.length === 0) {
          setImportError('Le fichier CSV ne contient aucune donnée valide');
        }
      } catch (error) {
        console.error('Erreur lors du parsing du CSV:', error);
        setImportError('Erreur lors de la lecture du fichier CSV. Vérifiez le format.');
      }
    };
    reader.readAsText(file);
  };

  // Fonction pour générer le PDF avec QR code
  const generateSubscriptionPDF = (recherche: Recherche) => {
    generateRechercheSubscriptionSheet(recherche);
  };

  const downloadTemplate = () => {
    const template = generateRechercheTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_inscription_recherche.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (csvPreviewData.length === 0) {
      setImportError('Aucune donnée validée à importer');
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const studentData of csvPreviewData) {
        try {
          const response = await fetch(`${baseUrl}/recherche/subscribe/${stageData._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              matricule: studentData.matricule,
              tuteur: studentData.tuteur,
              title: studentData.title,
              description: studentData.description
            }),
          });
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Erreur pour le matricule ${studentData.matricule}:`, await response.text());
          }
        } catch (err) {
          errorCount++;
          console.error(`Erreur lors de l'inscription de ${studentData.matricule}:`, err);
        }
      }

      if (successCount > 0) {
        setImportError(`${successCount} étudiants inscrits avec succès`);
        // Réinitialiser le formulaire
        setSelectedFile(null);
        setCsvPreviewData([]);
        setShowPreview(false);
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
      
      if (errorCount === 0) {
        setImportError('');
      } else if (successCount === 0) {
        setImportError(`Échec de l'inscription pour tous les ${csvPreviewData.length} étudiants`);
      } else {
        setImportError(`${successCount} étudiants inscrits avec succès, ${errorCount} échecs`);
      }
      
    } catch (err) {
      setImportError('Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const handleNoteUpdate = async (studentId: string, subscriberId: string) => {
    if (!studentId || newNote < 0 || newNote > 20) {
      alert('Veuillez entrer une note valide entre 0 et 20');
      return;
    }

    setUpdatingNote(true);
    try {
      const response = await fetch(`${baseUrl}/recherche/note/${stageData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId,
          note: newNote
        }),
      });

      if (response.ok) {
        alert('Note mise à jour avec succès');
        setEditingNoteId(null);
        // Recharger les données
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error || 'Impossible de mettre à jour la note'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      alert('Erreur lors de la mise à jour de la note');
    } finally {
      setUpdatingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'Pending': { label: 'En Attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Completed': { label: 'Terminé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Failed': { label: 'Échoué', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = configs[status as keyof typeof configs] || configs.Pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (!stageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl mb-4">
          Aucune donnée de recherche disponible
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Détails de la recherche</h1>
          <p className="text-gray-600">{stageData.title}</p>
          <p className="text-sm text-gray-500">{stageData.promotionId?.designation} - {stageData.anneeId?.debut}-{stageData.anneeId?.fin}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            stageData.categorie === 'Stage' 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {stageData.categorie}
          </span>
        </div>
      </div>

      {/* Status and Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Statut</label>
            <div className="mt-1">
              {getStatusBadge(stageData.status)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Montant</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">
              {stageData.amount.toLocaleString()} FC
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Catégorie</label>
            <p className="mt-1 text-sm text-gray-900">
              {stageData.categorie}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Inscrits</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">
              {stageData.subscribers?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <p className="text-gray-600">{stageData.description}</p>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Importer des souscriptions
        </h2>
        
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
              Importer un fichier CSV
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Le fichier CSV doit contenir les colonnes: matricule, tuteur, title, description
            </p>
          </div>

          {/* Template Download */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger le modèle CSV
            </button>
            
            <button
              onClick={() => generateSubscriptionPDF(stageData)}
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Générer fiche PDF avec QR Code
            </button>
          </div>

          {/* Error Display */}
          {importError && (
            <div className={`p-3 rounded-md ${
              importError.includes('succès') 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {importError.includes('succès') ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {importError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CSV Preview */}
          {showPreview && csvPreviewData.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Aperçu des données à importer ({csvPreviewData.length} lignes)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tuteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvPreviewData.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.tuteur}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {row.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreviewData.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2 px-6">
                    ... et {csvPreviewData.length - 10} autres lignes
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importation...
                    </>
                  ) : (
                    'Confirmer l\'import'
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedFile(null);
                    setCsvPreviewData([]);
                    const fileInput = document.getElementById('csv-file') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscribers Cards */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Souscriptions ({filteredSubscribers.length} / {stageData.subscribers?.length || 0})
          </h2>
          
          {/* Barre de recherche */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher étudiant, tuteur, titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {filteredSubscribers.length > 0 ? (
          <div className="space-y-4">
            {filteredSubscribers.map((subscriber, index) => (
              <div key={subscriber._id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Étudiant - 3 cols */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {subscriber.student ? 
                            `${subscriber.student.nom} ${subscriber.student.prenom}` : 
                            'N/A'
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {subscriber.student?.matricule || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tuteur - 3 cols */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {subscriber.tuteur ? 
                            `${subscriber.tuteur.nom} ${subscriber.tuteur.prenom}` : 
                            'Non assigné'
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {subscriber.tuteur?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Titre recherche - 3 cols */}
                  <div className="lg:col-span-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm truncate" title={subscriber.title || 'Titre non défini'}>
                        {subscriber.title || 'Titre non défini'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {subscriber.date_inscription ? 
                          new Date(subscriber.date_inscription).toLocaleDateString('fr-FR') : 
                          'Date N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Actions - 3 cols */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between space-x-3">
                      {/* Rapport */}
                      <div className="flex-1">
                        {subscriber.report && subscriber.report.trim() !== '' ? (
                          <a 
                            href={subscriber.report} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Rapport
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                            Pas de rapport
                          </span>
                        )}
                      </div>

                      {/* Note */}
                      <div className="flex items-center space-x-2">
                        {editingNoteId === subscriber._id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={newNote}
                              onChange={(e) => setNewNote(parseFloat(e.target.value) || 0)}
                              className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Note"
                            />
                            <button
                              onClick={() => subscriber.student && handleNoteUpdate(subscriber.student._id, subscriber._id)}
                              disabled={updatingNote || !subscriber.student}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span className={`text-sm font-medium ${
                              (subscriber.note || 0) >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {subscriber.note?.toFixed(1) || '0.0'}/20
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (subscriber.note || 0) >= 10 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {(subscriber.note || 0) >= 10 ? '✓' : '✗'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingNoteId(subscriber._id);
                                setNewNote(subscriber.note || 0);
                              }}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Modifier
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stageData.subscribers && stageData.subscribers.length > 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Aucun résultat trouvé</p>
            <p className="text-gray-400 text-sm mt-2">
              Essayez de modifier votre recherche
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <p className="text-gray-500 text-lg">Aucune souscription pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">
              Utilisez l'import CSV ci-dessus pour ajouter des étudiants à cette {stageData.categorie.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechercheDetail;

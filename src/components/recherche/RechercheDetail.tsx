'use client';

import { baseUrl } from '@/app/(admin)/page';
import React, { useState } from 'react';
import { Recherche } from './RecherchesManager';

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
          <div className="mt-4">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger le modèle CSV
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Souscriptions ({stageData.subscribers?.length || 0})
        </h2>
        
        {stageData.subscribers && stageData.subscribers.length > 0 ? (
          <div className="grid gap-6">
            {stageData.subscribers.map((subscriber, index) => (
              <div key={subscriber._id || index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Header avec étudiant et tuteur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Étudiant */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Étudiant
                    </h3>
                    {subscriber.student ? (
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {subscriber.student.nom} {subscriber.student.post_nom} {subscriber.student.prenom}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Matricule:</span> {subscriber.student.matricule}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Sexe:</span> {subscriber.student.sexe}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Informations étudiant non disponibles</p>
                    )}
                  </div>

                  {/* Tuteur */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Tuteur
                    </h3>
                    {subscriber.tuteur ? (
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {subscriber.tuteur.nom} {subscriber.tuteur.post_nom} {subscriber.tuteur.prenom}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Matricule:</span> {subscriber.tuteur.matricule}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {subscriber.tuteur.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Téléphone:</span> {subscriber.tuteur.telephone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Tuteur non assigné</p>
                    )}
                  </div>
                </div>

                {/* Recherche */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Recherche
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Titre:</p>
                      <p className="text-gray-700">{subscriber.title || 'Titre non défini'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Description:</p>
                      <p className="text-gray-700">{subscriber.description || 'Description non disponible'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Date d'inscription:</p>
                      <p className="text-sm text-gray-600">
                        {subscriber.date_inscription ? 
                          new Date(subscriber.date_inscription).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 
                          'Date non disponible'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report et Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Rapport
                    </h4>
                    {subscriber.report && subscriber.report.trim() !== '' ? (
                      <a 
                        href={subscriber.report} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Voir le rapport
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucun rapport soumis</p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Note
                    </h4>
                    
                    {editingNoteId === subscriber._id ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={newNote}
                            onChange={(e) => setNewNote(parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Note"
                          />
                          <span className="text-sm text-gray-500">/ 20</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => subscriber.student && handleNoteUpdate(subscriber.student._id, subscriber._id)}
                            disabled={updatingNote || !subscriber.student}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {updatingNote ? 'Sauvegarde...' : 'Sauvegarder'}
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${
                            (subscriber.note || 0) >= 10 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {subscriber.note?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-gray-500">/ 20</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            (subscriber.note || 0) >= 10 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(subscriber.note || 0) >= 10 ? 'Réussi' : 'Échec'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingNoteId(subscriber._id);
                            setNewNote(subscriber.note || 0);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

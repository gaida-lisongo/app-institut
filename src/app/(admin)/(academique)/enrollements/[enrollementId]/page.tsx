'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateEnrollmentSheet } from '@/utils/EnrollmentSheetGenerator';
import { Enrollement } from '../page';
import { Matiere } from '@/types/cours';

// Icônes SVG intégrées
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const Download = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

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

export default function EnrollmentDetailsPage({
    enrollement,
    onBack,
}: { enrollement: Enrollement; onBack?: () => void }) {  
  console.log('Enrollement reçu:', enrollement);
  const [enrollment, setEnrollment] = useState<Enrollement | null>(enrollement);
  const [loading, setLoading] = useState(false); // Pas besoin de loading si on a déjà les données
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportError('');
    } else {
      setImportError('Veuillez sélectionner un fichier CSV valide');
    }
  };

  const parseCSV = (csvText: string): string[] => {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    const matricules: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Si c'est la première ligne et qu'elle contient "matricule", on la ignore (header)
      if (i === 0 && line.toLowerCase().includes('matricule')) {
        continue;
      }
      
      // Traiter la ligne comme un matricule ou extraire le matricule
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length === 1) {
        // Une seule colonne, c'est probablement le matricule
        matricules.push(columns[0]);
      } else {
        // Plusieurs colonnes, prendre la première ou chercher celle qui ressemble à un matricule
        const matriculeCandidate = columns[0];
        if (matriculeCandidate) {
          matricules.push(matriculeCandidate);
        }
      }
    }
    
    return matricules.filter(m => m && m.length > 0);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setImporting(true);
    setImportError('');
    
    try {
      const csvText = await selectedFile.text();
      const matricules = parseCSV(csvText);
      
      if (matricules.length === 0) {
        setImportError('Aucun matricule trouvé dans le fichier');
        return;
      }

      // Importer chaque étudiant
      let successCount = 0;
      let errorCount = 0;
      
      for (const matricule of matricules) {
        try {
          const response = await fetch(`/api/finance/enrollements/subscriber/${enrollement._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matricule }),
          });
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Erreur pour le matricule ${matricule}:`, await response.text());
          }
        } catch (err) {
          errorCount++;
          console.error(`Erreur lors de l'import de ${matricule}:`, err);
        }
      }

      if (successCount > 0) {
        // Les données seront mises à jour par le composant parent
        setImportError(`${successCount} étudiants importés avec succès`);
      }
      
      if (errorCount === 0) {
        setImportError('');
      } else if (successCount === 0) {
        setImportError(`Échec de l'import pour tous les ${matricules.length} étudiants`);
      } else {
        setImportError(`${successCount} étudiants importés avec succès, ${errorCount} échecs`);
      }
      
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setImportError('Erreur lors de la lecture du fichier CSV');
    } finally {
      setImporting(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!enrollment) return;
    
    generateEnrollmentSheet(enrollment);
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

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl mb-4">
          Aucune donnée d'enrôlement disponible
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
          <h1 className="text-2xl font-bold text-gray-900">Détails de l'enrôlement</h1>
          <p className="text-gray-600">{enrollement.title}</p>
          <p className="text-sm text-gray-500">{enrollement.promotionId?.designation} - {enrollement.anneeId?.debut}-{enrollement.anneeId?.fin}</p>
        </div>
        <button
          onClick={handleGeneratePDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Générer Fiche
        </button>
      </div>

      {/* Status and Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Statut</label>
            <div className="mt-1">
              {getStatusBadge(enrollement.status)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Montant</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">
              {enrollement.amount.toLocaleString()} FC
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date d'examen</label>
            <p className="mt-1 text-sm text-gray-900">
              {enrollement.planing?.date_examen ? 
                new Date(enrollement.planing.date_examen).toLocaleDateString('fr-FR') : 
                'Non définie'
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Inscrits</label>
            <p className="mt-1 text-sm text-gray-900 font-medium">
              {enrollement.subscribers?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Courses */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Matières sélectionnées ({enrollement.matieres?.length || 0})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollement.matieres?.map((matiere: Matiere) => (
              <div key={matiere._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{matiere.designation}</h3>
                  <span className="text-sm text-gray-500">{matiere.credits} crédits</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Code: {matiere.code}</p>
                <p className="text-xs text-gray-500">{matiere.descriptions || 'Pas de description'}</p>
              </div>
            )) || []}
          </div>
          {(!enrollement.matieres || enrollement.matieres.length === 0) && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune matière sélectionnée</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des étudiants
          </h2>
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Import...' : 'Importer'}
              </button>
            </div>
            
            {importError && (
              <p className="mt-2 text-sm text-red-600">{importError}</p>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              Format CSV: Une colonne avec les matricules des étudiants
            </p>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Étudiants inscrits ({enrollement.subscribers?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollement.subscribers?.map((subscriber, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscriber.student?.nom} {subscriber.student?.prenom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscriber.student?.matricule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {subscriber.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(subscriber.date_inscription).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscriber.student?.email || '-'}
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
          
          {(!enrollement.subscribers || enrollement.subscribers.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun étudiant inscrit pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">
                Utilisez l'import CSV pour ajouter des étudiants
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

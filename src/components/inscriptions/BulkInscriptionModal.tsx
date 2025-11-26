'use client';

import React, { useState, useRef } from 'react';
import { CSVParser, ColumnMapping, csvValidators, csvTransformers } from '@/utils/csvParser';

interface BulkInscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionId: string;
  anneeId: string;
  onSuccess: () => void;
}

interface InscriptionData {
  matricule: string;
  statut: 'En cours' | 'Terminé' | 'Annulé';
}

// Icônes
const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DocumentArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export default function BulkInscriptionModal({
  isOpen,
  onClose,
  promotionId,
  anneeId,
  onSuccess
}: BulkInscriptionModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'processing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setLoading(true);
      setErrors([]);

      // Valider le fichier
      const validation = CSVParser.validateFile(selectedFile);
      if (!validation.valid) {
        setErrors([validation.error || 'Fichier invalide']);
        return;
      }

      // Lire et parser le CSV
      const content = await CSVParser.readFile(selectedFile);
      const parsed = CSVParser.parseCSV(content);

      if (parsed.headers.length === 0) {
        setErrors(['Le fichier CSV est vide ou mal formaté']);
        return;
      }

      setFile(selectedFile);
      setCsvData(parsed);
      
      // Créer les mappings avec détection automatique
      const autoDetectColumn = (targetField: string, headers: string[]) => {
        const patterns: { [key: string]: string[] } = {
          matricule: ['matricule', 'numero', 'id', 'etudiant'],
          statut: ['statut', 'status', 'etat', 'situation']
        };
        
        const fieldPatterns = patterns[targetField] || [];
        return headers.find(header => 
          fieldPatterns.some(pattern => 
            header.toLowerCase().includes(pattern.toLowerCase())
          )
        ) || '';
      };

      const mappings: ColumnMapping[] = [
        {
          csvColumn: autoDetectColumn('matricule', parsed.headers),
          targetField: 'matricule',
          required: true,
          validate: csvValidators.required,
          transform: csvTransformers.trim
        },
        {
          csvColumn: autoDetectColumn('statut', parsed.headers),
          targetField: 'statut',
          required: false,
          validate: (value: string) => {
            if (!value.trim()) return true; // Optionnel, défaut = "En cours"
            const validStatuts = ['En cours', 'Terminé', 'Annulé'];
            return validStatuts.includes(value.trim()) || 'Statut invalide (En cours, Terminé, Annulé)';
          },
          transform: (value: string) => value.trim() || 'En cours'
        }
      ];
      
      setColumnMappings(mappings);
      setStep('mapping');
      
      console.log('CSV Headers:', parsed.headers);
      console.log('Auto-detected mappings:', mappings);
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      setErrors(['Erreur lors de la lecture du fichier']);
    } finally {
      setLoading(false);
    }
  };


  const updateColumnMapping = (targetField: string, csvColumn: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.targetField === targetField 
          ? { ...mapping, csvColumn }
          : mapping
      )
    );
  };

  const handlePreview = () => {
    if (!csvData || columnMappings.some(m => m.required && !m.csvColumn)) {
      setErrors(['Veuillez mapper toutes les colonnes requises']);
      return;
    }

    try {
      const mapped = CSVParser.mapData(csvData, columnMappings);
      setMappedData(mapped);
      
      // Vérifier les erreurs
      const allErrors = mapped.flatMap(item => 
        item.errors.map(error => `Ligne ${item.rowIndex}: ${error}`)
      );
      
      if (allErrors.length > 0) {
        setErrors(allErrors);
        return;
      }

      setErrors([]);
      setStep('preview');
    } catch (error) {
      console.error('Erreur lors du mapping:', error);
      setErrors(['Erreur lors du traitement des données']);
    }
  };

  const handleSubmit = async () => {
    if (!mappedData || mappedData.length === 0) return;

    try {
      setLoading(true);
      setStep('processing');

      // Préparer les données pour l'API
      const inscriptionsData = mappedData.map(item => ({
        matricule: item.data.matricule,
        promotionId,
        anneeId,
        statut: item.data.statut
      }));

      // Envoyer vers l'API
      const response = await fetch('/api/parcours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inscriptionsData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setErrors([result.error || 'Erreur lors de l\'inscription']);
        setStep('preview');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrors(['Erreur de connexion au serveur']);
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setCsvData(null);
    setColumnMappings([]);
    setMappedData([]);
    setErrors([]);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-999">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Inscription en lot (CSV)
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Étape 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <DocumentArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Importer un fichier CSV
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Le fichier doit contenir au minimum les colonnes : <strong>matricule</strong> et optionnellement <strong>statut</strong>
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
                >
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Chargement...' : 'Sélectionner un fichier'}
                </button>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Formats acceptés: .csv, .txt (max 10MB)
                </p>
              </div>

              {/* Exemple de format */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Exemple de format CSV :
                </h4>
                <pre className="text-sm text-gray-600 dark:text-gray-300">
{`matricule,statut
ETU001,En cours
ETU002,Terminé
ETU003,En cours`}
                </pre>
              </div>
            </div>
          )}

          {/* Étape 2: Mapping des colonnes */}
          {step === 'mapping' && csvData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Mapper les colonnes
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Associez les colonnes de votre fichier CSV aux champs requis
                </p>
              </div>

              <div className="space-y-4">
                {columnMappings.map((mapping) => (
                  <div key={mapping.targetField} className="flex items-center space-x-4">
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {mapping.targetField}
                        {mapping.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                    <div className="flex-1">
                      <select
                        value={mapping.csvColumn}
                        onChange={(e) => updateColumnMapping(mapping.targetField, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Sélectionner une colonne</option>
                        {csvData.headers.map((header: string) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message informatif */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {columnMappings.some(m => m.csvColumn) 
                        ? '✅ Certaines colonnes ont été détectées automatiquement. Vérifiez et ajustez si nécessaire.'
                        : '⚠️ Aucune colonne n\'a été détectée automatiquement. Veuillez sélectionner manuellement les colonnes correspondantes.'
                      }
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Le champ "matricule" est obligatoire. Le champ "statut" est optionnel (défaut: "En cours").
                    </p>
                  </div>
                </div>
              </div>

              {/* Aperçu des données */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Aperçu des données (5 premières lignes)
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {csvData.headers.map((header: string) => (
                          <th key={header} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.data.slice(0, 5).map((row: any, index: number) => (
                        <tr key={index}>
                          {csvData.headers.map((header: string) => (
                            <td key={header} className="px-3 py-2 text-gray-600 dark:text-gray-300">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Prévisualisation */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Prévisualisation des inscriptions
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Vérifiez les données avant de procéder à l'inscription
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-200">
                    {mappedData.length} inscription(s) seront créée(s)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {mappedData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.data.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${item.data.statut === 'En cours' 
                              ? 'bg-green-100 text-green-800' 
                              : item.data.statut === 'Terminé'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                            }
                          `}>
                            {item.data.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Étape 4: Traitement */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Traitement en cours...
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Création des inscriptions, veuillez patienter
              </p>
            </div>
          )}

          {/* Messages d'erreur */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Erreurs détectées :
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          
          <div className="flex space-x-3">
            {step === 'mapping' && (
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Retour
              </button>
            )}
            
            {step === 'preview' && (
              <button
                onClick={() => setStep('mapping')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Retour
              </button>
            )}

            {step === 'mapping' && (
              <button
                onClick={handlePreview}
                disabled={columnMappings.some(m => m.required && !m.csvColumn)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                Prévisualiser
              </button>
            )}

            {step === 'preview' && (
              <button
                onClick={handleSubmit}
                disabled={loading || mappedData.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors"
              >
                {loading ? 'Traitement...' : 'Confirmer les inscriptions'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef } from 'react';
import { CSVParser, CSVParseResult, ColumnMapping, MappedData } from '@/utils/csvParser';
import ColumnMapper from './ColumnMapper';

interface ImportStep {
    step: 'upload' | 'mapping' | 'importing' | 'complete';
    title: string;
}

interface ImportProgress {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    errors: Array<{
        row: number;
        errors: string[];
        data: Record<string, any>;
    }>;
}

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    targetFields: {
        key: string;
        label: string;
        required?: boolean;
        description?: string;
    }[];
    onImport: (data: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
    onComplete: (results: { successful: number; failed: number; errors: any[] }) => void;
}

export const CSVImportModal = ({
    isOpen,
    onClose,
    title,
    targetFields,
    onImport,
    onComplete
}: CSVImportModalProps) => {
    const [currentStep, setCurrentStep] = useState<ImportStep['step']>('upload');
    const [csvData, setCsvData] = useState<CSVParseResult | null>(null);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [importProgress, setImportProgress] = useState<ImportProgress>({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: []
    });
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const steps: ImportStep[] = [
        { step: 'upload', title: 'Télécharger le fichier' },
        { step: 'mapping', title: 'Mapper les colonnes' },
        { step: 'importing', title: 'Importation en cours' },
        { step: 'complete', title: 'Terminé' }
    ];

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Valider le fichier
        const validation = CSVParser.validateFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            // Lire et parser le fichier
            const content = await CSVParser.readFile(file);
            const parsedData = CSVParser.parseCSV(content);
            
            if (parsedData.headers.length === 0) {
                alert('Le fichier CSV semble vide ou mal formaté');
                return;
            }

            setCsvData(parsedData);
            setCurrentStep('mapping');
        } catch (error) {
            alert('Erreur lors de la lecture du fichier: ' + error);
        }
    };

    const handleMappingChange = (mappings: ColumnMapping[]) => {
        setColumnMappings(mappings);
    };

    const canProceedToImport = () => {
        const requiredFields = targetFields.filter(field => field.required);
        const mappedRequiredFields = columnMappings.filter(mapping => 
            requiredFields.some(field => field.key === mapping.targetField)
        );
        return mappedRequiredFields.length === requiredFields.length;
    };

    const startImport = async () => {
        if (!csvData || !canProceedToImport()) return;

        setCurrentStep('importing');
        setIsImporting(true);

        // Mapper les données
        const mappedData = CSVParser.mapData(csvData, columnMappings);
        
        setImportProgress({
            total: mappedData.length,
            processed: 0,
            successful: 0,
            failed: 0,
            errors: []
        });

        let successful = 0;
        let failed = 0;
        const errors: ImportProgress['errors'] = [];

        // Importer chaque ligne
        for (let i = 0; i < mappedData.length; i++) {
            const item = mappedData[i];
            
            // Vérifier s'il y a des erreurs de validation
            if (item.errors.length > 0) {
                failed++;
                errors.push({
                    row: item.rowIndex,
                    errors: item.errors,
                    data: item.data
                });
            } else {
                try {
                    const result = await onImport(item.data);
                    if (result.success) {
                        successful++;
                    } else {
                        failed++;
                        errors.push({
                            row: item.rowIndex,
                            errors: [result.error || 'Erreur inconnue'],
                            data: item.data
                        });
                    }
                } catch (error) {
                    failed++;
                    errors.push({
                        row: item.rowIndex,
                        errors: [`Erreur lors de l'importation: ${error}`],
                        data: item.data
                    });
                }
            }

            // Mettre à jour le progrès
            setImportProgress({
                total: mappedData.length,
                processed: i + 1,
                successful,
                failed,
                errors
            });

            // Petite pause pour permettre à l'UI de se mettre à jour
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        setIsImporting(false);
        setCurrentStep('complete');
        onComplete({ successful, failed, errors });
    };

    const resetModal = () => {
        setCurrentStep('upload');
        setCsvData(null);
        setColumnMappings([]);
        setImportProgress({
            total: 0,
            processed: 0,
            successful: 0,
            failed: 0,
            errors: []
        });
        setIsImporting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        if (!isImporting) {
            resetModal();
            onClose();
        }
    };

    const getStepIndex = () => {
        return steps.findIndex(step => step.step === currentStep);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isImporting}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.step} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                    index <= getStepIndex()
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-300 text-gray-600'
                                }`}>
                                    {index + 1}
                                </div>
                                <span className={`ml-2 text-sm ${
                                    index <= getStepIndex() ? 'text-blue-600 font-medium' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-4 ${
                                        index < getStepIndex() ? 'bg-blue-600' : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 'upload' && (
                        <div className="text-center py-12">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Télécharger un fichier CSV
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Sélectionnez un fichier CSV avec les données à importer
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                >
                                    Choisir un fichier
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    Formats supportés: CSV, TXT (délimiteurs: virgule ou point-virgule)
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 'mapping' && csvData && (
                        <ColumnMapper
                            csvData={csvData}
                            targetFields={targetFields}
                            onMappingChange={handleMappingChange}
                        />
                    )}

                    {currentStep === 'importing' && (
                        <div className="py-8">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Importation en cours...
                                </h3>
                                <p className="text-gray-500">
                                    Veuillez patienter pendant l'importation des données
                                </p>
                            </div>

                            {/* Barre de progression */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Progression</span>
                                    <span>{importProgress.processed} / {importProgress.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${importProgress.total > 0 ? (importProgress.processed / importProgress.total) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Statistiques */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {importProgress.successful}
                                    </div>
                                    <div className="text-sm text-green-700">Réussis</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {importProgress.failed}
                                    </div>
                                    <div className="text-sm text-red-700">Échoués</div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-600">
                                        {importProgress.total - importProgress.processed}
                                    </div>
                                    <div className="text-sm text-gray-700">Restants</div>
                                </div>
                            </div>

                            {/* Erreurs en temps réel */}
                            {importProgress.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-900 mb-2">
                                        Erreurs détectées ({importProgress.errors.length})
                                    </h4>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {importProgress.errors.slice(-5).map((error, index) => (
                                            <div key={index} className="text-sm text-red-700">
                                                <span className="font-medium">Ligne {error.row}:</span> {error.errors.join(', ')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 'complete' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Importation terminée !
                            </h3>
                            <div className="text-gray-600 mb-6">
                                <p>{importProgress.successful} éléments importés avec succès</p>
                                {importProgress.failed > 0 && (
                                    <p className="text-red-600">{importProgress.failed} éléments ont échoué</p>
                                )}
                            </div>

                            {importProgress.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-h-64 overflow-y-auto">
                                    <h4 className="font-medium text-red-900 mb-2">
                                        Détail des erreurs:
                                    </h4>
                                    <div className="space-y-2">
                                        {importProgress.errors.map((error, index) => (
                                            <div key={index} className="text-sm">
                                                <div className="font-medium text-red-800">
                                                    Ligne {error.row}:
                                                </div>
                                                <ul className="list-disc list-inside text-red-700 ml-4">
                                                    {error.errors.map((err, errIndex) => (
                                                        <li key={errIndex}>{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-500">
                        {csvData && (
                            <span>
                                Fichier: {csvData.data.length} lignes, délimiteur: "{csvData.delimiter}"
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {currentStep === 'mapping' && (
                            <>
                                <button
                                    onClick={() => setCurrentStep('upload')}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Retour
                                </button>
                                <button
                                    onClick={startImport}
                                    disabled={!canProceedToImport()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Commencer l'importation
                                </button>
                            </>
                        )}
                        {currentStep === 'complete' && (
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Fermer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;

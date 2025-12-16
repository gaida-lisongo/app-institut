'use client'
import React from 'react';

interface ImportExportActionsProps {
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null> | null;
}

const ImportExportActions = ({ onImport, onExport, fileInputRef }: ImportExportActionsProps) => {
    return (
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                        <span className="mr-2">📊</span>
                        Gestion des notes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Format CSV: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs">Matricule;Nom;Prenom;CMI(/10);Examen(/10);Rattrapage(/20)</code>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ⚠️ Séparateur: point-virgule (;) - Encodage: UTF-8
                    </p>
                </div>
                <div className="flex space-x-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={onImport}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef?.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                        <span>📁</span>
                        <span>Importer CSV</span>
                    </button>
                    <button
                        onClick={onExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                    >
                        <span>💾</span>
                        <span>Exporter CSV</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExportActions;

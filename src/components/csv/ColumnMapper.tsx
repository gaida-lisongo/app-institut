"use client";
import { useState } from 'react';
import { CSVParseResult, ColumnMapping } from '@/utils/csvParser';

interface ColumnMapperProps {
    csvData: CSVParseResult;
    targetFields: {
        key: string;
        label: string;
        required?: boolean;
        description?: string;
    }[];
    onMappingChange: (mappings: ColumnMapping[]) => void;
    initialMappings?: ColumnMapping[];
}

export const ColumnMapper = ({ 
    csvData, 
    targetFields, 
    onMappingChange, 
    initialMappings = [] 
}: ColumnMapperProps) => {
    const [mappings, setMappings] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        initialMappings.forEach(mapping => {
            initial[mapping.targetField] = mapping.csvColumn;
        });
        return initial;
    });

    const handleMappingChange = (targetField: string, csvColumn: string) => {
        const newMappings = { ...mappings, [targetField]: csvColumn };
        setMappings(newMappings);

        // Convertir en ColumnMapping[]
        const columnMappings: ColumnMapping[] = targetFields
            .filter(field => newMappings[field.key])
            .map(field => ({
                csvColumn: newMappings[field.key],
                targetField: field.key,
                required: field.required
            }));

        onMappingChange(columnMappings);
    };

    const getAutoSuggestion = (targetField: string): string => {
        const field = targetFields.find(f => f.key === targetField);
        if (!field) return '';

        // Recherche par correspondance exacte
        let match = csvData.headers.find(header => 
            header.toLowerCase() === field.key.toLowerCase()
        );
        if (match) return match;

        // Recherche par correspondance partielle
        match = csvData.headers.find(header => 
            header.toLowerCase().includes(field.key.toLowerCase()) ||
            field.key.toLowerCase().includes(header.toLowerCase())
        );
        if (match) return match;

        // Recherche par label
        match = csvData.headers.find(header => 
            header.toLowerCase().includes(field.label.toLowerCase()) ||
            field.label.toLowerCase().includes(header.toLowerCase())
        );
        if (match) return match;

        return '';
    };

    const applySuggestions = () => {
        const newMappings: Record<string, string> = {};
        targetFields.forEach(field => {
            const suggestion = getAutoSuggestion(field.key);
            if (suggestion) {
                newMappings[field.key] = suggestion;
            }
        });
        setMappings(newMappings);

        const columnMappings: ColumnMapping[] = targetFields
            .filter(field => newMappings[field.key])
            .map(field => ({
                csvColumn: newMappings[field.key],
                targetField: field.key,
                required: field.required
            }));

        onMappingChange(columnMappings);
    };

    const clearMappings = () => {
        setMappings({});
        onMappingChange([]);
    };

    const getMappedCount = () => {
        return Object.values(mappings).filter(Boolean).length;
    };

    const getRequiredCount = () => {
        return targetFields.filter(field => field.required).length;
    };

    const getMappedRequiredCount = () => {
        return targetFields.filter(field => field.required && mappings[field.key]).length;
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-900">
                        Correspondance des colonnes
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={applySuggestions}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Auto-suggestion
                        </button>
                        <button
                            onClick={clearMappings}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                            Effacer tout
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-blue-700">
                        <span className="font-medium">Colonnes CSV:</span> {csvData.headers.length}
                    </div>
                    <div className="text-blue-700">
                        <span className="font-medium">Champs mappés:</span> {getMappedCount()}/{targetFields.length}
                    </div>
                    <div className="text-blue-700">
                        <span className="font-medium">Requis mappés:</span> {getMappedRequiredCount()}/{getRequiredCount()}
                    </div>
                </div>
            </div>

            {/* Aperçu des données CSV */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                    Aperçu du fichier CSV ({csvData.data.length} lignes)
                </h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                {csvData.headers.map((header, index) => (
                                    <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-r">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {csvData.data.slice(0, 3).map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t">
                                    {csvData.headers.map((header, colIndex) => (
                                        <td key={colIndex} className="px-3 py-2 text-gray-600 border-r">
                                            {row[header] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {csvData.data.length > 3 && (
                        <div className="text-center py-2 text-gray-500 text-sm">
                            ... et {csvData.data.length - 3} autres lignes
                        </div>
                    )}
                </div>
            </div>

            {/* Mapping des colonnes */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                    Associer les colonnes CSV aux champs requis
                </h4>
                
                <div className="grid gap-4">
                    {targetFields.map((field) => (
                        <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </label>
                                    {field.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {field.description}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="ml-4 flex-shrink-0">
                                    <select
                                        value={mappings[field.key] || ''}
                                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                        className={`block w-48 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            field.required && !mappings[field.key]
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">-- Sélectionner une colonne --</option>
                                        {csvData.headers.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Aperçu des valeurs */}
                            {mappings[field.key] && (
                                <div className="mt-3 p-3 bg-gray-50 rounded border">
                                    <div className="text-xs text-gray-600 mb-1">
                                        Aperçu des valeurs:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {csvData.data
                                            .slice(0, 5)
                                            .map((row, index) => row[mappings[field.key]])
                                            .filter(Boolean)
                                            .map((value, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                                >
                                                    {value}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Validation */}
            {getRequiredCount() > getMappedRequiredCount() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-700 text-sm">
                            Certains champs requis ne sont pas mappés. Veuillez les associer avant de continuer.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnMapper;

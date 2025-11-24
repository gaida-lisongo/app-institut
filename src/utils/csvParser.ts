export interface CSVParseResult {
    headers: string[];
    data: Record<string, string>[];
    rawData: string[][];
    delimiter: ',' | ';';
}

export interface CSVParseOptions {
    delimiter?: ',' | ';' | 'auto';
    skipEmptyLines?: boolean;
    trimValues?: boolean;
}

export interface ColumnMapping {
    csvColumn: string;
    targetField: string;
    required?: boolean;
    transform?: (value: string) => any;
    validate?: (value: string) => boolean | string;
}

export interface MappedData {
    data: Record<string, any>;
    errors: string[];
    rowIndex: number;
}

export class CSVParser {
    /**
     * Détecte automatiquement le délimiteur CSV
     */
    private static detectDelimiter(content: string): ',' | ';' {
        const firstLine = content.split('\n')[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        
        return semicolonCount > commaCount ? ';' : ',';
    }

    /**
     * Parse une ligne CSV en tenant compte des guillemets
     */
    private static parseLine(line: string, delimiter: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Double quote escaped
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === delimiter && !inQuotes) {
                // Field separator
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }

        result.push(current);
        return result;
    }

    /**
     * Parse le contenu CSV complet
     */
    static parseCSV(content: string, options: CSVParseOptions = {}): CSVParseResult {
        const {
            delimiter = 'auto',
            skipEmptyLines = true,
            trimValues = true
        } = options;

        // Normaliser les fins de ligne
        const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Détecter le délimiteur
        const actualDelimiter = delimiter === 'auto' 
            ? this.detectDelimiter(normalizedContent)
            : delimiter as ',' | ';';

        // Diviser en lignes
        let lines = normalizedContent.split('\n');
        
        // Supprimer les lignes vides si demandé
        if (skipEmptyLines) {
            lines = lines.filter(line => line.trim().length > 0);
        }

        if (lines.length === 0) {
            return {
                headers: [],
                data: [],
                rawData: [],
                delimiter: actualDelimiter
            };
        }

        // Parser chaque ligne
        const rawData = lines.map(line => this.parseLine(line, actualDelimiter));

        // Extraire les en-têtes (première ligne)
        const headers = rawData[0].map(header => 
            trimValues ? header.trim() : header
        );

        // Traiter les données (lignes suivantes)
        const data: Record<string, string>[] = [];
        
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            const rowData: Record<string, string> = {};
            
            headers.forEach((header, index) => {
                const value = row[index] || '';
                rowData[header] = trimValues ? value.trim() : value;
            });
            
            data.push(rowData);
        }

        return {
            headers,
            data,
            rawData,
            delimiter: actualDelimiter
        };
    }

    /**
     * Mappe les données CSV selon les colonnes sélectionnées
     */
    static mapData(
        csvData: CSVParseResult,
        columnMappings: ColumnMapping[]
    ): MappedData[] {
        return csvData.data.map((row, index) => {
            const mappedData: Record<string, any> = {};
            const errors: string[] = [];

            columnMappings.forEach(mapping => {
                const csvValue = row[mapping.csvColumn] || '';
                
                // Vérifier si le champ est requis
                if (mapping.required && !csvValue.trim()) {
                    errors.push(`Le champ '${mapping.targetField}' est requis (colonne '${mapping.csvColumn}')`);
                    return;
                }

                // Valider la valeur
                if (mapping.validate && csvValue.trim()) {
                    const validationResult = mapping.validate(csvValue);
                    if (validationResult !== true) {
                        const errorMessage = typeof validationResult === 'string' 
                            ? validationResult 
                            : `Valeur invalide pour '${mapping.targetField}': ${csvValue}`;
                        errors.push(errorMessage);
                        return;
                    }
                }

                // Transformer la valeur
                let finalValue = csvValue;
                if (mapping.transform) {
                    try {
                        finalValue = mapping.transform(csvValue);
                    } catch (error) {
                        errors.push(`Erreur de transformation pour '${mapping.targetField}': ${error}`);
                        return;
                    }
                }

                mappedData[mapping.targetField] = finalValue;
            });

            return {
                data: mappedData,
                errors,
                rowIndex: index + 2 // +2 car index 0 = ligne 2 du CSV (après les en-têtes)
            };
        });
    }

    /**
     * Lit un fichier CSV depuis un File object
     */
    static async readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const content = event.target?.result as string;
                resolve(content);
            };
            
            reader.onerror = () => {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Valide un fichier CSV
     */
    static validateFile(file: File): { valid: boolean; error?: string } {
        // Vérifier l'extension
        const validExtensions = ['.csv', '.txt'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!validExtensions.includes(fileExtension)) {
            return {
                valid: false,
                error: 'Le fichier doit être au format CSV (.csv ou .txt)'
            };
        }

        // Vérifier la taille (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'Le fichier est trop volumineux (maximum 10MB)'
            };
        }

        return { valid: true };
    }
}

// Utilitaires de validation communes
export const csvValidators = {
    email: (value: string): boolean | string => {
        if (!value.trim()) return true; // Optionnel
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Format d\'email invalide';
    },

    phone: (value: string): boolean | string => {
        if (!value.trim()) return true; // Optionnel
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(value) || 'Format de téléphone invalide';
    },

    required: (value: string): boolean | string => {
        return value.trim().length > 0 || 'Ce champ est requis';
    },

    maxLength: (max: number) => (value: string): boolean | string => {
        return value.length <= max || `Maximum ${max} caractères`;
    },

    gender: (value: string): boolean | string => {
        const normalized = value.trim().toUpperCase();
        const validValues = ['M', 'F', 'MASCULIN', 'FEMININ', 'HOMME', 'FEMME', 'MALE', 'FEMALE'];
        return validValues.includes(normalized) || 'Sexe invalide (M/F, Masculin/Féminin, etc.)';
    }
};

// Transformateurs communes
export const csvTransformers = {
    trim: (value: string) => value.trim(),
    
    upperCase: (value: string) => value.trim().toUpperCase(),
    
    toLowerCase: (value: string) => value.trim().toLowerCase(),
    
    gender: (value: string): 'M' | 'F' => {
        const normalized = value.trim().toUpperCase();
        if (['M', 'MASCULIN', 'HOMME', 'MALE'].includes(normalized)) return 'M';
        if (['F', 'FEMININ', 'FEMME', 'FEMALE'].includes(normalized)) return 'F';
        return 'M'; // Par défaut
    },

    phone: (value: string) => {
        // Nettoyer le numéro de téléphone
        return value.replace(/[\s\-\(\)]/g, '');
    }
};

export interface CSVParseResult {
    headers: string[];
    rows: string[][];
    success: boolean;
    error?: string;
}

export interface CSVExportData {
    headers: string[];
    rows: (string | number)[][];
}

/**
 * Parse un contenu CSV avec point-virgule comme séparateur
 */
export function parseCSV(csvContent: string): CSVParseResult {
    try {
        const lines = csvContent.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            return {
                headers: [],
                rows: [],
                success: false,
                error: 'Fichier CSV vide'
            };
        }

        // Première ligne = headers
        const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
        
        // Lignes suivantes = données
        const rows: string[][] = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(';').map(cell => cell.trim().replace(/"/g, ''));
            if (row.length === headers.length) {
                rows.push(row);
            }
        }

        return {
            headers,
            rows,
            success: true
        };
    } catch (error) {
        return {
            headers: [],
            rows: [],
            success: false,
            error: `Erreur lors du parsing CSV: ${error}`
        };
    }
}

/**
 * Génère un contenu CSV avec point-virgule comme séparateur
 */
export function generateCSV(data: CSVExportData): string {
    const { headers, rows } = data;
    
    // Échapper les valeurs qui contiennent des point-virgules
    const escapeValue = (value: string | number): string => {
        const str = String(value);
        if (str.includes(';') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Ligne d'en-tête
    const headerLine = headers.map(escapeValue).join(';');
    
    // Lignes de données
    const dataLines = rows.map(row => 
        row.map(escapeValue).join(';')
    );

    return [headerLine, ...dataLines].join('\n');
}

/**
 * Trouve l'index d'une colonne par nom (insensible à la casse)
 */
export function findColumnIndex(headers: string[], columnName: string): number {
    return headers.findIndex(header => 
        header.toLowerCase().includes(columnName.toLowerCase())
    );
}

/**
 * Génère un template CSV pour l'import d'inscriptions
 */
export function generateEnrollmentTemplate(): string {
    const headers = ['matricule'];
    const exampleRows = [
        ['HE.1.25.1101'],
        ['HE.1.25.1102'],
        ['HE.1.25.1103'],
        ['HE.1.25.1104'],
        ['HE.1.25.1105'],
        ['HE.1.25.1106'],
        ['HE.1.25.1107'],
        ['HE.1.25.1108'],
        ['HE.1.25.1109'],
        ['HE.1.25.1110'],
        ['HE.1.25.1111'],
        ['HE.1.25.1112'],
        ['HE.1.25.1113'],
        ['HE.1.25.1114'],
        ['HE.1.25.1115'],
        ['HE.1.25.1116'],
        ['HE.1.25.1117']
    ];
    
    return generateCSV({
        headers,
        rows: exampleRows
    });
}

/**
 * Valide les données d'enrôlement depuis un CSV
 */
export function validateEnrollmentData(csvData: CSVParseResult): {
    valid: boolean;
    errors: string[];
    data: { matricule: string }[];
} {
    const errors: string[] = [];
    const data: { matricule: string }[] = [];
    
    if (!csvData.success || csvData.rows.length === 0) {
        errors.push('Aucune donnée trouvée dans le fichier CSV');
        return { valid: false, errors, data };
    }
    
    const matriculeIndex = findColumnIndex(csvData.headers, 'matricule');
    if (matriculeIndex === -1) {
        errors.push('Colonne "matricule" manquante - elle est obligatoire');
        return { valid: false, errors, data };
    }
    
    csvData.rows.forEach((row, index) => {
        const matricule = row[matriculeIndex]?.trim();
        if (!matricule) {
            errors.push(`Ligne ${index + 2}: Matricule manquant`);
            return;
        }
        
        data.push({ matricule });
    });
    
    return {
        valid: errors.length === 0,
        errors,
        data
    };
}

/**
 * Valide le format d'un fichier CSV pour l'import de notes
 */
export function validateNotesCSVFormat(parseResult: CSVParseResult): { valid: boolean; error?: string } {
    if (!parseResult.success) {
        return { valid: false, error: parseResult.error };
    }

    const requiredColumns = ['matricule', 'nom', 'cmi', 'examen'];
    const missingColumns = requiredColumns.filter(col => 
        findColumnIndex(parseResult.headers, col) === -1
    );

    if (missingColumns.length > 0) {
        return { 
            valid: false, 
            error: `Colonnes manquantes: ${missingColumns.join(', ')}. Format attendu: Matricule;Nom;Prenom;CMI(/10);Examen(/10);Rattrapage(/20)` 
        };
    }

    return { valid: true };
}

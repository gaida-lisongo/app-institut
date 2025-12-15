"use client";
import { useState } from 'react';
import CSVImportModal from './CSVImportModal';

interface UpdateParcoursStatusCsvProps {
    promotionId: string;
}

const UpdateParcoursStatusCsv = ({ promotionId }: UpdateParcoursStatusCsvProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const targetFields = [
        {
            key: 'matricule',
            label: 'Matricule',
            required: true,
            description: "Le matricule de l'étudiant."
        },
        {
            key: 'status',
            label: 'Statut',
            required: true,
            description: "Le nouveau statut du parcours (OK ou non OK)."
        }
    ];

    const handleImport = async (data: Record<string, any>) => {
        try {
            const response = await fetch('/api/parcours/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...data, promotionId })
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Erreur inconnue' };
            }
        } catch (error) {
            return { success: false, error: 'Erreur de connexion' };
        }
    };

    const handleComplete = (results: { successful: number; failed: number; errors: any[] }) => {
        console.log('Importation terminée:', results);
        alert(`Importation terminée: ${results.successful} réussis, ${results.failed} échoués.`);
    };

    return (
        <div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
                Mettre à jour le statut du parcours par CSV
            </button>

            <CSVImportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Mettre à jour le statut du parcours par CSV"
                targetFields={targetFields}
                onImport={handleImport}
                onComplete={handleComplete}
            />
        </div>
    );
};

export default UpdateParcoursStatusCsv;

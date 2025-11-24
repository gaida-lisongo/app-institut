"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { IGrade } from "@/models/Grade";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const GradeManager = ({ type }: {type: string}) => {
    const [grades, setGrades] = useState<IGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<IGrade | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: type
    });
    const router = useRouter();

    const fetchGrades = async () => {
        try {
            const response = await fetch(`/api/grades?type=${type}`);
            const data = await response.json();
            if (data.success) {
                setGrades(data.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des grades:', error);
        } finally {
            setLoading(false);
        }
    }

    const createGrade = async (grade: Omit<IGrade, '_id'>) => {
        try {
            const response = await fetch(`/api/grades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(grade),
            });
            const data = await response.json();
            if (data.success) {
                setGrades([...grades, data.data]);
                setShowModal(false);
                resetForm();
            }
            return data;
        } catch (error) {
            console.error('Erreur lors de la création du grade:', error);
        }
    }

    const updateGrade = async (grade: IGrade) => {
        try {
            const response = await fetch(`/api/grades`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(grade),
            });
            const data = await response.json();
            if (data.success) {
                setGrades(grades.map(g => g._id === grade._id ? data.data : g));
                setEditingGrade(null);
                setShowModal(false);
                resetForm();
            }
            return data;
        } catch (error) {
            console.error('Erreur lors de la modification du grade:', error);
        }
    }

    const deleteGrade = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce grade ?')) {
            try {
                const response = await fetch(`/api/grades`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                });
                const data = await response.json();
                if (data.success) {
                    setGrades(grades.filter(g => g._id !== id));
                }
                return data;
            } catch (error) {
                console.error('Erreur lors de la suppression du grade:', error);
            }
        }
    }

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            type: type
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGrade) {
            await updateGrade({ ...editingGrade, ...formData });
        } else {
            await createGrade(formData);
        }
    }

    const handleEdit = (grade: IGrade) => {
        setEditingGrade(grade);
        setFormData({
            code: grade.code,
            description: grade.description,
            type: grade.type
        });
        setShowModal(true);
    }

    const handleNavigate = (gradeCode: string) => {
        router.push(`/enseignants/${gradeCode}`);
    }

    useEffect(() => {
        fetchGrades();
    }, [type]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header avec bouton d'ajout */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Grades - {type}</h2>
                <button
                    onClick={() => {
                        setEditingGrade(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau Grade
                </button>
            </div>

            {/* Grille des cartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grades.map((grade) => (
                    <div key={grade._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{grade.code}</h3>
                                <p className="text-gray-600 text-sm mt-1">{grade.description}</p>
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">
                                    {grade.type}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Bouton principal de navigation */}
                            <button
                                onClick={() => handleNavigate(grade.code)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                            >
                                Voir les {type}s
                            </button>

                            {/* Boutons d'action */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(grade)}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-md text-sm transition-colors"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => deleteGrade(grade._id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md text-sm transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message si aucun grade */}
            {grades.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">Aucun grade trouvé pour le type "{type}"</div>
                    <p className="text-gray-400 mt-2">Cliquez sur "Nouveau Grade" pour en créer un.</p>
                </div>
            )}

            {/* Modal pour créer/modifier un grade */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingGrade ? 'Modifier le grade' : 'Nouveau grade'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingGrade(null);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingGrade(null);
                                        resetForm();
                                    }}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                                >
                                    {editingGrade ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>        
    )
}

const EnseignantsPage = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Enseignants" />
            <GradeManager type="enseignant" />
        </div>
    );
};

export default EnseignantsPage;

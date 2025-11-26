"use client";
import { GradeData, CreateGradeData } from "@/models/Grade";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const GradeManager = ({ type }: {type: string}) => {
    const [grades, setGrades] = useState<GradeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<GradeData | null>(null);
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

    const createGrade = async (grade: CreateGradeData) => {
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
            return { success: false, error: 'Erreur lors de la création' };
        }
    }

    const updateGrade = async (grade: GradeData) => {
        try {
            const response = await fetch(`/api/grades/${grade._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(grade),
            });
            const data = await response.json();
            if (data.success) {
                setGrades(grades.map(g => g._id === grade._id ? data.data : g));
                setShowModal(false);
                setEditingGrade(null);
                resetForm();
            }
            return data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du grade:', error);
            return { success: false, error: 'Erreur lors de la mise à jour' };
        }
    }

    const deleteGrade = async (id: string) => {
        try {
            const response = await fetch(`/api/grades/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setGrades(grades.filter(g => g._id !== id));
            }
            return data;
        } catch (error) {
            console.error('Erreur lors de la suppression du grade:', error);
            return { success: false, error: 'Erreur lors de la suppression' };
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

    const handleEdit = (grade: GradeData) => {
        setEditingGrade(grade);
        setFormData({
            code: grade.code,
            description: grade.description,
            type: grade.type
        });
        setShowModal(true);
    }

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce grade ?')) {
            await deleteGrade(id);
        }
    }

    useEffect(() => {
        fetchGrades();
    }, [type]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gestion des Grades - {type === 'enseignant' ? 'Enseignants' : 'Administratifs'}
                </h1>
                <button
                    onClick={() => {
                        setEditingGrade(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Nouveau Grade
                </button>
            </div>

            {/* Grades List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {grades.map((grade) => (
                            <tr key={grade._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {grade.code}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {grade.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {grade.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(grade)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(grade?._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                {editingGrade ? 'Modifier le Grade' : 'Nouveau Grade'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingGrade(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        {editingGrade ? 'Modifier' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

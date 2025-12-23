'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
    _id: string;
    title: string;
    description: string;
    type: string;
    maximumScore: number;
}

interface Devoir {
    url: string;
    typeFile?: string;
}

interface Questionnaire {
    _id: string;
    activityId: string;
    status: string;
    dateRemise: string;
    maximumScore: number;
    devoir: Devoir;
    createdAt: string;
    updatedAt: string;
}

const DevoirPage = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = React.use(params);
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour le formulaire
    const [formData, setFormData] = useState({
        dateRemise: '',
        maximumScore: '',
        status: 'pending'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Récupérer l'activité et le questionnaire associé
    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Récupérer l'activité
            const activityResponse = await fetch(`/api/activities?id=${slug}`);
            if (!activityResponse.ok) throw new Error('Activité non trouvée');
            
            const activityResult = await activityResponse.json();
            if (!activityResult.success) throw new Error(activityResult.error);
            
            setActivity(activityResult.data);

            // Récupérer le questionnaire s'il existe
            try {
                const questionnaireResponse = await fetch(`/api/questions?activityId=${slug}`);
                if (questionnaireResponse.ok) {
                    const questionnaireResult = await questionnaireResponse.json();
                    if (questionnaireResult.success) {
                        setQuestionnaire(questionnaireResult.data);
                    }
                }
            } catch (err) {
                // Pas de questionnaire existant, c'est normal
            }

            // Initialiser le formulaire avec les données de l'activité
            setFormData(prev => ({
                ...prev,
                maximumScore: activityResult.data.maximumScore?.toString() || ''
            }));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const uploadFile = async (): Promise<string> => {
        if (!selectedFile) throw new Error('Aucun fichier sélectionné');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'devoirs');

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Erreur lors de l\'upload du fichier');

        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        return result.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            return handleUpdate();
        }
        
        if (!selectedFile) {
            alert('Veuillez sélectionner un fichier pour le devoir');
            return;
        }

        if (!formData.dateRemise || !formData.maximumScore) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            setUploading(true);
            
            // 1. Upload du fichier
            const fileUrl = await uploadFile();
            
            setCreating(true);
            
            // 2. Création du questionnaire
            const questionnaireData = {
                activityId: slug,
                dateRemise: formData.dateRemise,
                maximumScore: parseInt(formData.maximumScore),
                status: formData.status,
                devoir: {
                    url: fileUrl,
                    typeFile: selectedFile.type || selectedFile.name.split('.').pop()
                }
            };

            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionnaireData),
            });

            if (!response.ok) throw new Error('Erreur lors de la création du devoir');

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            // Actualiser les données
            await fetchData();
            setShowCreateForm(false);
            setSelectedFile(null);
            setFormData({
                dateRemise: '',
                maximumScore: activity?.maximumScore?.toString() || '',
                status: 'pending'
            });

            alert('Devoir créé avec succès!');

        } catch (err) {
            console.error('Erreur:', err);
            alert(err instanceof Error ? err.message : 'Erreur lors de la création du devoir');
        } finally {
            setUploading(false);
            setCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!questionnaire) return;

        if (!formData.dateRemise || !formData.maximumScore) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            setCreating(true);
            
            let fileUrl = questionnaire.devoir.url;
            
            // Si un nouveau fichier est sélectionné, l'uploader
            if (selectedFile) {
                setUploading(true);
                fileUrl = await uploadFile();
                setUploading(false);
            }
            
            // Mise à jour du questionnaire
            const questionnaireData = {
                dateRemise: formData.dateRemise,
                maximumScore: parseInt(formData.maximumScore),
                status: formData.status,
                devoir: {
                    url: fileUrl,
                    typeFile: selectedFile?.type || questionnaire.devoir.typeFile
                }
            };

            const response = await fetch(`/api/questions?id=${questionnaire._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionnaireData),
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour du devoir');

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            // Actualiser les données
            await fetchData();
            setShowCreateForm(false);
            setIsEditing(false);
            setSelectedFile(null);
            setFormData({
                dateRemise: '',
                maximumScore: activity?.maximumScore?.toString() || '',
                status: 'pending'
            });

            alert('Devoir mis à jour avec succès!');

        } catch (err) {
            console.error('Erreur:', err);
            alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du devoir');
        } finally {
            setUploading(false);
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!questionnaire || !confirm('Êtes-vous sûr de vouloir supprimer ce devoir ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/questions?id=${questionnaire._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            setQuestionnaire(null);
            alert('Devoir supprimé avec succès!');

        } catch (err) {
            console.error('Erreur:', err);
            alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    };

    const handleEdit = () => {
        if (!questionnaire) return;
        
        // Pré-remplir le formulaire avec les données existantes
        setFormData({
            dateRemise: new Date(questionnaire.dateRemise).toISOString().slice(0, 16),
            maximumScore: questionnaire.maximumScore.toString(),
            status: questionnaire.status
        });
        
        setIsEditing(true);
        setShowCreateForm(true);
    };

    // Fonction pour déterminer l'état actuel de la page
    const getPageState = () => {
        if (loading) return 'loading';
        if (error) return 'error';
        if (!questionnaire && !showCreateForm) return 'empty';
        if (showCreateForm) return isEditing ? 'editing' : 'creating';
        if (questionnaire) return 'display';
        return 'unknown';
    };

    // Fonction pour obtenir l'icône du statut
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ok':
                return (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'pending':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
            case 'no':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    // Fonction pour obtenir le texte du statut
    const getStatusText = (status: string) => {
        switch (status) {
            case 'ok':
                return 'Validé';
            case 'pending':
                return 'En attente';
            case 'no':
                return 'Rejeté';
            default:
                return 'Inconnu';
        }
    };

    // Fonction pour obtenir les classes CSS du statut
    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'ok':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'no':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getFileIcon = (fileType?: string) => {
        if (fileType?.includes('pdf')) {
            return (
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        }
        if (fileType?.includes('word') || fileType?.includes('document')) {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
            );
        }
        return (
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
        );
    };

    // Fonctions de rendu pour chaque état
    const renderLoadingState = () => (
        <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const renderErrorState = () => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devoir configuré</h3>
            <p className="text-gray-600 mb-6">Cette activité n'a pas encore de devoir. Créez-en un pour commencer.</p>
            <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer le premier devoir
            </button>
        </div>
    );

    const renderQuestionnaireDisplay = () => {
        if (!questionnaire) return null;

        return (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                    <h2 className="text-lg font-semibold text-green-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Devoir Configuré
                    </h2>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Informations</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Score maximum :</span> {questionnaire.maximumScore} points</p>
                                <p><span className="font-medium">Date de remise :</span> {new Date(questionnaire.dateRemise).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Statut :</span>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClasses(questionnaire.status)}`}>
                                        {getStatusIcon(questionnaire.status)}
                                        <span>{getStatusText(questionnaire.status)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Fichier du devoir</h3>
                            <div className="flex items-center space-x-3">
                                {getFileIcon(questionnaire.devoir.typeFile)}
                                <div>
                                    <p className="font-medium text-gray-900">Document joint</p>
                                    <p className="text-sm text-gray-500">Type: {questionnaire.devoir.typeFile || 'Fichier'}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex space-x-2">
                                <a
                                    href={questionnaire.devoir.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Visualiser
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderForm = () => {
        const isEditMode = isEditing;
        const formTitle = isEditMode ? 'Modifier le devoir' : 'Créer un nouveau devoir';
        
        return (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className={`px-6 py-4 border-b ${
                    isEditMode ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                }`}>
                    <h2 className={`text-lg font-semibold ${
                        isEditMode ? 'text-yellow-800' : 'text-blue-800'
                    }`}>
                        {formTitle}
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="dateRemise" className="block text-sm font-medium text-gray-700 mb-2">
                                Date de remise *
                            </label>
                            <input
                                type="datetime-local"
                                id="dateRemise"
                                name="dateRemise"
                                value={formData.dateRemise}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="maximumScore" className="block text-sm font-medium text-gray-700 mb-2">
                                Score maximum *
                            </label>
                            <input
                                type="number"
                                id="maximumScore"
                                name="maximumScore"
                                value={formData.maximumScore}
                                onChange={handleInputChange}
                                min="1"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pending">En attente</option>
                                <option value="ok">Validé</option>
                                <option value="no">Rejeté</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                                Fichier du devoir {isEditMode ? '' : '*'}
                            </label>
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,.odt"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required={!isEditMode}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Formats acceptés: PDF, Word, Texte (max 10MB)
                            </p>
                            {isEditMode && questionnaire && (
                                <p className="mt-1 text-xs text-blue-600">
                                    Laissez vide pour conserver le fichier actuel: {questionnaire.devoir.url.split('/').pop()}
                                </p>
                            )}
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Fichier sélectionné</h4>
                            <div className="flex items-center space-x-3">
                                {getFileIcon(selectedFile.type)}
                                <div>
                                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setIsEditing(false);
                                setSelectedFile(null);
                                setFormData({
                                    dateRemise: '',
                                    maximumScore: activity?.maximumScore?.toString() || '',
                                    status: 'pending'
                                });
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || creating}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                                isEditMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {uploading && (
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {uploading ? 'Upload en cours...' : creating ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour' : 'Créer le devoir')}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Rendu principal avec switch
    const renderContent = () => {
        const pageState = getPageState();
        
        switch (pageState) {
            case 'loading':
                return renderLoadingState();
                
            case 'error':
                return renderErrorState();
                
            case 'empty':
                return renderEmptyState();
                
            case 'display':
                return renderQuestionnaireDisplay();
                
            case 'creating':
            case 'editing':
                return renderForm();
                
            default:
                return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <p className="text-yellow-800">État inattendu de la page</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header avec breadcrumb */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <nav className="flex mb-4" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                        <li>
                            <Link href="/activities" className="text-gray-500 hover:text-gray-700">
                                Activités
                            </Link>
                        </li>
                        <li>
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li>
                            <Link href={`/activity/${slug}`} className="text-gray-500 hover:text-gray-700">
                                {activity?.title}
                            </Link>
                        </li>
                        <li>
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li>
                            <span className="text-blue-600 font-medium">Devoir</span>
                        </li>
                    </ol>
                </nav>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion du Devoir</h1>
                        <p className="mt-1 text-gray-600">{activity?.title}</p>
                    </div>
                    
                    {!questionnaire && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Créer un devoir
                        </button>
                    )}
                </div>
            </div>

            {/* Contenu principal avec rendu conditionnel switch */}
            {renderContent()}
        </div>
    );
};

export default DevoirPage;
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

interface TPQuestionnaire {
    id: string;
    title: string;           // Titre inline
    description: string;     // Description multiligne
    points: number;          // Points pour ce questionnaire
    attachedFile?: {
        name: string;
        url: string;
        type: string;
    };
}

interface TPData {
    questionnaires: TPQuestionnaire[];
}

interface Questionnaire {
    _id: string;
    activityId: string;
    status: string;
    dateRemise: string;
    maximumScore: number;
    tp: TPData;
    createdAt: string;
    updatedAt: string;
}

const TPPage = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = React.use(params);
    
    const [activity, setActivity] = useState<Activity | null>(null);
    const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour les formulaires
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [tpQuestionnaires, setTpQuestionnaires] = useState<TPQuestionnaire[]>([]);
    const [editingQuestionnaireIndex, setEditingQuestionnaireIndex] = useState<number | null>(null);
    
    // Données du formulaire principal
    const [formData, setFormData] = useState({
        dateRemise: '',
        maximumScore: '',
        status: 'pending' as 'pending' | 'ok' | 'no'
    });

    // Chargement des données
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Charger l'activité
                const activityResponse = await fetch(`/api/activities/${slug}`);
                if (activityResponse.ok) {
                    const activityResult = await activityResponse.json();
                    setActivity(activityResult.data);
                    
                    setFormData(prev => ({
                        ...prev,
                        maximumScore: activityResult.data.maximumScore?.toString() || ''
                    }));
                }
                
                // Charger le questionnaire TP existant
                const questionnaireResponse = await fetch(`/api/questions?activityId=${slug}&type=tp`);
                if (questionnaireResponse.ok) {
                    const questionnaireResult = await questionnaireResponse.json();
                    if (questionnaireResult.success && questionnaireResult.data) {
                        setQuestionnaire(questionnaireResult.data);
                        setTpQuestionnaires(questionnaireResult.data.tp?.questionnaires || []);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]);

    // Gestion du formulaire principal
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fonctions pour gérer les questionnaires
    const addNewQuestionnaire = () => {
        const newQuestionnaire: TPQuestionnaire = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            description: '',
            points: 1
        };
        setTpQuestionnaires(prev => [...prev, newQuestionnaire]);
    };

    const updateQuestionnaireTitle = (questionnaireIndex: number, title: string) => {
        const newQuestionnaires = [...tpQuestionnaires];
        newQuestionnaires[questionnaireIndex].title = title;
        setTpQuestionnaires(newQuestionnaires);
    };

    const updateQuestionnaireDescription = (questionnaireIndex: number, description: string) => {
        const newQuestionnaires = [...tpQuestionnaires];
        newQuestionnaires[questionnaireIndex].description = description;
        setTpQuestionnaires(newQuestionnaires);
    };

    const updateQuestionnairePoints = (questionnaireIndex: number, points: number) => {
        const newQuestionnaires = [...tpQuestionnaires];
        newQuestionnaires[questionnaireIndex].points = points;
        setTpQuestionnaires(newQuestionnaires);
    };

    const removeQuestionnaire = (questionnaireIndex: number) => {
        const newQuestionnaires = tpQuestionnaires.filter((_, index) => index !== questionnaireIndex);
        setTpQuestionnaires(newQuestionnaires);
    };

    // Gestion des fichiers
    const handleQuestionnaireFileUpload = async (questionnaireIndex: number, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'tp-questionnaire');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                const newQuestionnaires = [...tpQuestionnaires];
                newQuestionnaires[questionnaireIndex].attachedFile = {
                    name: file.name,
                    url: result.url,
                    type: file.type
                };
                setTpQuestionnaires(newQuestionnaires);
            } else {
                throw new Error('Erreur lors du téléchargement du fichier');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            alert('Erreur lors du téléchargement du fichier');
        }
    };

    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (tpQuestionnaires.length === 0) {
            alert('Veuillez ajouter au moins un questionnaire');
            return;
        }

        try {
            setCreating(true);
            
            const tpData = {
                activityId: slug,
                status: formData.status,
                dateRemise: new Date(formData.dateRemise).toISOString(),
                maximumScore: parseInt(formData.maximumScore) || 0,
                tp: {
                    questionnaires: tpQuestionnaires
                }
            };

            const url = isEditing && questionnaire 
                ? `/api/questions/${questionnaire._id}` 
                : '/api/questions';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tpData)
            });

            if (response.ok) {
                const result = await response.json();
                
                if (isEditing) {
                    setQuestionnaire(result.data);
                } else {
                    setQuestionnaire(result.data);
                }
                
                setShowCreateForm(false);
                setIsEditing(false);
                setTpQuestionnaires([]);
                setEditingQuestionnaireIndex(null);
                setFormData({
                    dateRemise: '',
                    maximumScore: activity?.maximumScore?.toString() || '',
                    status: 'pending'
                });
            } else {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
        } finally {
            setCreating(false);
        }
    };

    // Suppression
    const handleDelete = async () => {
        if (!questionnaire || !confirm('Êtes-vous sûr de vouloir supprimer ce TP ?')) return;

        try {
            const response = await fetch(`/api/questions/${questionnaire._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setQuestionnaire(null);
                setTpQuestionnaires([]);
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = () => {
        if (!questionnaire) return;
        
        setFormData({
            dateRemise: new Date(questionnaire.dateRemise).toISOString().slice(0, 16),
            maximumScore: questionnaire.maximumScore.toString(),
            status: questionnaire.status
        });
        
        // Charger les questionnaires existants
        if (questionnaire.tp && questionnaire.tp.questionnaires) {
            setTpQuestionnaires(questionnaire.tp.questionnaires.map(q => ({
                id: q.id || Math.random().toString(36).substr(2, 9),
                title: q.title || '',
                description: q.description || '',
                points: q.points || 1,
                attachedFile: q.attachedFile || undefined
            })));
        }
        
        setIsEditing(true);
        setShowCreateForm(true);
    };

    // Fonction pour déterminer l'état actuel de la page
    const getPageState = () => {
        if (loading) return 'loading';
        if (error) return 'error';
        if (!questionnaire && !showCreateForm) return 'empty';
        if (showCreateForm) return isEditing ? 'editing' : 'creating';
        return 'display';
    };

    // Composants de rendu
    const renderLoadingState = () => (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg text-gray-600">Chargement...</span>
            </div>
        </div>
    );

    const renderErrorState = () => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
                <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="text-lg font-medium text-red-800">Erreur de chargement</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun TP configuré</h3>
            <p className="text-gray-600 mb-6">
                Commencez par créer un nouveau TP avec des questionnaires et des fichiers annexés.
            </p>
            <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer le premier TP
            </button>
        </div>
    );

    const renderTPDisplay = () => {
        if (!questionnaire || !questionnaire.tp) return null;

        return (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                    <h2 className="text-lg font-semibold text-green-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        TP Configuré ({questionnaire.tp.questionnaires.length} questionnaire{questionnaire.tp.questionnaires.length > 1 ? 's' : ''})
                    </h2>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Informations générales</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Score maximum :</span> {questionnaire.maximumScore} points</p>
                                <p><span className="font-medium">Date limite :</span> {new Date(questionnaire.dateRemise).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <p><span className="font-medium">Statut :</span> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                                        questionnaire.status === 'ok' ? 'bg-green-100 text-green-800' :
                                        questionnaire.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {questionnaire.status === 'ok' ? 'Validé' : questionnaire.status === 'pending' ? 'En attente' : 'Rejeté'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Statistiques</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Questionnaires :</span> {questionnaire.tp.questionnaires.length}</p>
                                <p><span className="font-medium">Points totaux :</span> {questionnaire.tp.questionnaires.reduce((total, q) => total + q.points, 0)} points</p>
                                <p><span className="font-medium">Moyenne par questionnaire :</span> {questionnaire.tp.questionnaires.length > 0 ? (questionnaire.tp.questionnaires.reduce((total, q) => total + q.points, 0) / questionnaire.tp.questionnaires.length).toFixed(1) : 0} points</p>
                            </div>
                        </div>
                    </div>

                    {/* Aperçu des questionnaires */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-4">Aperçu des questionnaires</h3>
                        <div className="space-y-4">
                            {questionnaire.tp.questionnaires.map((questionnaireTp, index) => (
                                <div key={questionnaireTp.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-2">{questionnaireTp.title} ({questionnaireTp.points} point{questionnaireTp.points > 1 ? 's' : ''})</h4>
                                            <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                                                {questionnaireTp.description}
                                            </div>
                                        </div>
                                        {questionnaireTp.attachedFile && (
                                            <div className="ml-4 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                📎 Fichier annexé
                                            </div>
                                        )}
                                    </div>
                                    
                                    {questionnaireTp.attachedFile && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-blue-800">{questionnaireTp.attachedFile.name}</span>
                                                </div>
                                                <a
                                                    href={questionnaireTp.attachedFile.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Télécharger
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
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
        const formTitle = isEditMode ? 'Modifier le TP' : 'Créer un nouveau TP';
        
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
                    {/* Informations générales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label htmlFor="dateRemise" className="block text-sm font-medium text-gray-700 mb-2">
                                Date limite *
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
                                max="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

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
                    </div>

                    {/* Questionnaires du TP */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Questionnaires ({tpQuestionnaires.length})
                            </h3>
                            <button
                                type="button"
                                onClick={addNewQuestionnaire}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Ajouter un questionnaire
                            </button>
                        </div>

                        <div className="space-y-6">
                            {tpQuestionnaires.map((questionnaireTp, questionnaireIndex) => (
                                <div key={questionnaireTp.id} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-medium text-gray-900">
                                            Questionnaire {questionnaireIndex + 1}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-gray-600">Points:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={questionnaireTp.points}
                                                onChange={(e) => updateQuestionnairePoints(questionnaireIndex, parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeQuestionnaire(questionnaireIndex)}
                                                className="p-1 text-red-600 hover:text-red-800"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Titre et description du questionnaire */}
                                    <div className="grid grid-cols-1 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Titre du questionnaire *
                                            </label>
                                            <input
                                                type="text"
                                                value={questionnaireTp.title}
                                                onChange={(e) => updateQuestionnaireTitle(questionnaireIndex, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Ex: Calcul des structures métalliques"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description du questionnaire *
                                            </label>
                                            <textarea
                                                value={questionnaireTp.description}
                                                onChange={(e) => updateQuestionnaireDescription(questionnaireIndex, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                rows={4}
                                                placeholder="Décrivez le questionnaire en détail..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Fichier annexé au questionnaire */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fichier annexé (optionnel)
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleQuestionnaireFileUpload(questionnaireIndex, file);
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                accept=".pdf,.doc,.docx,.txt"
                                            />
                                            {questionnaireTp.attachedFile && (
                                                <div className="flex items-center text-sm text-green-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Fichier ajouté
                                                </div>
                                            )}
                                        </div>
                                        {questionnaireTp.attachedFile && (
                                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                                📎 {questionnaireTp.attachedFile.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {tpQuestionnaires.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>Aucun questionnaire ajouté</p>
                                <p className="text-sm">Cliquez sur "Ajouter un questionnaire" pour commencer</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setIsEditing(false);
                                setTpQuestionnaires([]);
                                setEditingQuestionnaireIndex(null);
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
                            disabled={creating || tpQuestionnaires.length === 0}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                                isEditMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {creating && (
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {creating ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour le TP' : 'Créer le TP')}
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
                return renderTPDisplay();
                
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
                            <span className="text-blue-600 font-medium">TP</span>
                        </li>
                    </ol>
                </nav>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des TP</h1>
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
                            Créer un TP
                        </button>
                    )}
                </div>
            </div>

            {/* Contenu principal avec rendu conditionnel switch */}
            {renderContent()}
        </div>
    );
};

export default TPPage;

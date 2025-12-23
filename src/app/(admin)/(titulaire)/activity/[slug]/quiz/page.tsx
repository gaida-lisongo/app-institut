'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MathEditor from '@/components/common/MathEditor';

interface Activity {
    _id: string;
    title: string;
    description: string;
    type: string;
    maximumScore: number;
}

interface QCMOption {
    id: string;
    text: string;           // Contenu MathQuill/LaTeX
    isCorrect: boolean;
}

interface QCMQuestion {
    id: string;
    questionText: string;   // Contenu MathQuill/LaTeX
    options: QCMOption[];
    points: number;
}

interface QCMData {
    questions: QCMQuestion[];
}

interface Questionnaire {
    _id: string;
    activityId: string;
    status: string;
    dateRemise: string;
    maximumScore: number;
    qcm: QCMData;
    createdAt: string;
    updatedAt: string;
}

const QCMPage = ({ params }: { params: Promise<{ slug: string }> }) => {
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
    
    const [qcmQuestions, setQcmQuestions] = useState<QCMQuestion[]>([]);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

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
                    if (questionnaireResult.success && questionnaireResult.data?.qcm) {
                        setQuestionnaire(questionnaireResult.data);
                        setQcmQuestions(questionnaireResult.data.qcm.questions || []);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateQuestionId = () => `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addNewQuestion = () => {
        const newQuestion: QCMQuestion = {
            id: generateQuestionId(),
            questionText: '',
            options: [
                { id: generateOptionId(), text: '', isCorrect: true },
                { id: generateOptionId(), text: '', isCorrect: false },
            ],
            points: 1
        };
        setQcmQuestions(prev => [...prev, newQuestion]);
        setEditingQuestionIndex(qcmQuestions.length);
    };

    const addOption = (questionIndex: number) => {
        const newQuestions = [...qcmQuestions];
        newQuestions[questionIndex].options.push({
            id: generateOptionId(),
            text: '',
            isCorrect: false
        });
        setQcmQuestions(newQuestions);
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        if (qcmQuestions[questionIndex].options.length <= 2) {
            alert('Une question doit avoir au moins 2 options');
            return;
        }
        const newQuestions = [...qcmQuestions];
        newQuestions[questionIndex].options.splice(optionIndex, 1);
        setQcmQuestions(newQuestions);
    };

    const removeQuestion = (questionIndex: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;
        const newQuestions = [...qcmQuestions];
        newQuestions.splice(questionIndex, 1);
        setQcmQuestions(newQuestions);
        if (editingQuestionIndex === questionIndex) {
            setEditingQuestionIndex(null);
        }
    };

    const updateQuestionText = (questionIndex: number, text: string) => {
        const newQuestions = [...qcmQuestions];
        newQuestions[questionIndex].questionText = text;
        setQcmQuestions(newQuestions);
    };

    const updateOptionText = (questionIndex: number, optionIndex: number, text: string) => {
        const newQuestions = [...qcmQuestions];
        newQuestions[questionIndex].options[optionIndex].text = text;
        setQcmQuestions(newQuestions);
    };

    const updateOptionCorrect = (questionIndex: number, optionIndex: number, isCorrect: boolean) => {
        const newQuestions = [...qcmQuestions];
        // Si on marque cette option comme correcte, démarquer les autres
        if (isCorrect) {
            newQuestions[questionIndex].options.forEach((opt, idx) => {
                opt.isCorrect = idx === optionIndex;
            });
        }
        setQcmQuestions(newQuestions);
    };

    const updateQuestionPoints = (questionIndex: number, points: number) => {
        const newQuestions = [...qcmQuestions];
        newQuestions[questionIndex].points = points;
        setQcmQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            return handleUpdate();
        }

        if (qcmQuestions.length === 0) {
            alert('Veuillez ajouter au moins une question');
            return;
        }

        if (!formData.dateRemise || !formData.maximumScore) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Validation des questions
        for (let i = 0; i < qcmQuestions.length; i++) {
            const question = qcmQuestions[i];
            if (!question.questionText.trim()) {
                alert(`La question ${i + 1} ne peut pas être vide`);
                return;
            }
            if (question.options.length < 2) {
                alert(`La question ${i + 1} doit avoir au moins 2 options`);
                return;
            }
            if (!question.options.some(opt => opt.isCorrect)) {
                alert(`La question ${i + 1} doit avoir au moins une réponse correcte`);
                return;
            }
            for (let j = 0; j < question.options.length; j++) {
                if (!question.options[j].text.trim()) {
                    alert(`L'option ${j + 1} de la question ${i + 1} ne peut pas être vide`);
                    return;
                }
            }
        }

        try {
            setCreating(true);
            
            const questionnaireData = {
                activityId: slug,
                dateRemise: formData.dateRemise,
                maximumScore: parseInt(formData.maximumScore),
                status: formData.status,
                qcm: {
                    questions: qcmQuestions
                }
            };

            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionnaireData),
            });

            if (!response.ok) throw new Error('Erreur lors de la création du QCM');

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            // Actualiser les données
            await fetchData();
            setShowCreateForm(false);
            setQcmQuestions([]);
            setEditingQuestionIndex(null);
            setFormData({
                dateRemise: '',
                maximumScore: activity?.maximumScore?.toString() || '',
                status: 'pending'
            });

            alert('QCM créé avec succès!');

        } catch (err) {
            console.error('Erreur:', err);
            alert(err instanceof Error ? err.message : 'Erreur lors de la création du QCM');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!questionnaire) return;

        if (qcmQuestions.length === 0) {
            alert('Veuillez ajouter au moins une question');
            return;
        }

        if (!formData.dateRemise || !formData.maximumScore) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            setCreating(true);
            
            const questionnaireData = {
                dateRemise: formData.dateRemise,
                maximumScore: parseInt(formData.maximumScore),
                status: formData.status,
                qcm: {
                    questions: qcmQuestions
                }
            };

            const response = await fetch(`/api/questions?id=${questionnaire._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionnaireData),
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour du QCM');

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            await fetchData();
            setShowCreateForm(false);
            setIsEditing(false);
            setEditingQuestionIndex(null);

            alert('QCM mis à jour avec succès!');

        } catch (err) {
            console.error('Erreur:', err);
            alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du QCM');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!questionnaire || !confirm('Êtes-vous sûr de vouloir supprimer ce QCM ?')) {
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
            setQcmQuestions([]);
            alert('QCM supprimé avec succès!');

        } catch (err) {
            console.error('Erreur:', err);
            alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        }
    };

    const handleEdit = () => {
        if (!questionnaire) return;
        
        setFormData({
            dateRemise: new Date(questionnaire.dateRemise).toISOString().slice(0, 16),
            maximumScore: questionnaire.maximumScore.toString(),
            status: questionnaire.status
        });
        
        // Charger les questions existantes
        if (questionnaire.qcm && questionnaire.qcm.questions) {
            setQcmQuestions(questionnaire.qcm.questions.map(q => ({
                ...q,
                id: q.id || Math.random().toString(36).substr(2, 9)
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
        if (questionnaire) return 'display';
        return 'unknown';
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
        <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun QCM trouvé</h3>
            <p className="mt-2 text-sm text-gray-500">Vous n'avez pas encore créé de QCM pour cette activité.</p>
            <button
                onClick={() => setShowCreateForm(true)}
                className="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
                Créer un QCM
            </button>
        </div>
    );

    const renderQuestionnaireDisplay = () => {
        if (!questionnaire || !questionnaire.qcm) return null;

        return (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                    <h2 className="text-lg font-semibold text-green-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        QCM Configuré ({questionnaire.qcm.questions.length} question{questionnaire.qcm.questions.length > 1 ? 's' : ''})
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
                                <p><span className="font-medium">Nombre de questions :</span> {questionnaire.qcm.questions.length}</p>
                                <p><span className="font-medium">Points totaux :</span> {questionnaire.qcm.questions.reduce((sum, q) => sum + q.points, 0)} points</p>
                                <p><span className="font-medium">Moyenne par question :</span> {(questionnaire.qcm.questions.reduce((sum, q) => sum + q.points, 0) / questionnaire.qcm.questions.length).toFixed(1)} points</p>
                            </div>
                        </div>
                    </div>

                    {/* Aperçu des questions */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-4">Aperçu des questions</h3>
                        <div className="space-y-4">
                            {questionnaire.qcm.questions.map((question, index) => (
                                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-medium text-gray-900">Question {index + 1} ({question.points} point{question.points > 1 ? 's' : ''})</h4>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <MathEditor 
                                            value={question.questionText} 
                                            readOnly={true}
                                            showToolbar={false}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {question.options.map((option, optIndex) => (
                                            <div 
                                                key={option.id} 
                                                className={`p-2 rounded border ${
                                                    option.isCorrect 
                                                        ? 'bg-green-50 border-green-200' 
                                                        : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                                                        option.isCorrect 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-gray-400 text-white'
                                                    }`}>
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <div className="flex-1">
                                                        <MathEditor 
                                                            value={option.text} 
                                                            readOnly={true}
                                                            showToolbar={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
        const formTitle = isEditMode ? 'Modifier le QCM' : 'Créer un nouveau QCM';
        
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

                    {/* Questions du QCM */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Questions ({qcmQuestions.length})
                            </h3>
                            <button
                                type="button"
                                onClick={addNewQuestion}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Ajouter une question
                            </button>
                        </div>

                        <div className="space-y-6">
                            {qcmQuestions.map((question, questionIndex) => (
                                <div key={question.id} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-medium text-gray-900">
                                            Question {questionIndex + 1}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-gray-600">Points:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={question.points}
                                                onChange={(e) => updateQuestionPoints(questionIndex, parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(questionIndex)}
                                                className="p-1 text-red-600 hover:text-red-800"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Énoncé de la question */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Énoncé de la question *
                                        </label>
                                        <MathEditor
                                            value={question.questionText}
                                            onChange={(latex) => updateQuestionText(questionIndex, latex)}
                                            placeholder="Tapez l'énoncé de votre question..."
                                            showToolbar={true}
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Options de réponse
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => addOption(questionIndex)}
                                                className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                Ajouter une option
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={option.id} className="flex items-start space-x-3 bg-white p-3 rounded border">
                                                    <div className="flex items-center mt-3">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${questionIndex}`}
                                                            checked={option.isCorrect}
                                                            onChange={(e) => updateOptionCorrect(questionIndex, optionIndex, e.target.checked)}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-gray-600 mb-1">
                                                            Option {String.fromCharCode(65 + optionIndex)} {option.isCorrect && '(Correcte)'}
                                                        </label>
                                                        <MathEditor
                                                            value={option.text}
                                                            onChange={(latex) => updateOptionText(questionIndex, optionIndex, latex)}
                                                            placeholder="Tapez le texte de cette option..."
                                                            showToolbar={true}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(questionIndex, optionIndex)}
                                                        className="p-1 text-red-600 hover:text-red-800 mt-3"
                                                        disabled={question.options.length <= 2}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {qcmQuestions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Aucune question ajoutée</p>
                                <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setIsEditing(false);
                                setQcmQuestions([]);
                                setEditingQuestionIndex(null);
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
                            disabled={creating || qcmQuestions.length === 0}
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
                            {creating ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour le QCM' : 'Créer le QCM')}
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
                            <span className="text-blue-600 font-medium">QCM</span>
                        </li>
                    </ol>
                </nav>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion du QCM</h1>
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
                            Créer un QCM
                        </button>
                    )}
                </div>
            </div>

            {/* Contenu principal avec rendu conditionnel switch */}
            {renderContent()}
        </div>
    );
};
export default QCMPage;
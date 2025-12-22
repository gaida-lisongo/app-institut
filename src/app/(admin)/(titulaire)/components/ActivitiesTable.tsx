'use client';

import React, { useEffect, useState } from 'react';
import { Etudiant } from "@/app/(resultat)/layout";
import { ListIcon } from "@/icons";


type Resolution = {
    _id: string;
    student: Etudiant;
    score: number;
    dateSubmitted: string;
}

export type Activity = {
    _id: string;
    title: string;
    description: string;
    type: string;
    maximumScore: number;
    resolutions: Resolution[];
    createdAt: string;
    updatedAt: string;
}


const ActivitiesTable = ({
    data,
    chargeId
} : { data: Activity[], chargeId: string }) => {
    // États pour le CRUD des activités
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activityForm, setActivityForm] = useState({
        title: '',
        description: '',
        type: 'devoir',
        maximumScore: 20
    });
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const openEditModal = (activity: Activity) => {
        setSelectedActivity(activity);
        setActivityForm({
            title: activity.title as string,
            description: activity.description as string,
            type: activity.type as string,
            maximumScore: activity.maximumScore as number
        });
        setIsEditMode(true);
        setShowActivityModal(true);
    };


    const handleCreateActivity = async () => {
        if (!activityForm.title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        setLoadingActivity(true);
        try {
            const response = await fetch('/api/charges/activites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...activityForm,
                    chargeId: chargeId
                })
            });

            const result = await response.json();
            if (result.success) {
                setActivities([result.data, ...activities]);
                resetActivityForm();
                setShowActivityModal(false);
                alert('Activité créée avec succès!');
            } else {
                alert(result.error || 'Erreur lors de la création');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création de l\'activité');
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleUpdateActivity = async () => {
        if (!selectedActivity || !activityForm.title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        setLoadingActivity(true);
        try {
            const response = await fetch('/api/charges/activites', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedActivity._id,
                    ...activityForm
                })
            });

            const result = await response.json();
            if (result.success) {
                setActivities(activities.map(activity => 
                    activity._id === selectedActivity._id ? result.data : activity
                ));
                resetActivityForm();
                setShowActivityModal(false);
                alert('Activité mise à jour avec succès!');
            } else {
                alert(result.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleDeleteActivity = async (activityId: string) => {
        if (!confirm('Etes-vous sûr de vouloir supprimer cette activité ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/charges/activites?id=${activityId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                setActivities(activities.filter(activity => activity._id !== activityId));
                alert('Activité supprimée avec succès!');
            } else {
                alert(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const resetActivityForm = () => {
        setActivityForm({
            title: '',
            description: '',
            type: 'devoir',
            maximumScore: 20
        });
        setSelectedActivity(null);
        setIsEditMode(false);
    };

    const openCreateModal = () => {
        resetActivityForm();
        setShowActivityModal(true);
    };

    useEffect(() => {
        setActivities(data);
    }, [data]);

    // Filtrage et pagination
    const filteredActivities = activities.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'devoir': return 'bg-blue-100 text-blue-800';
            case 'examen': return 'bg-red-100 text-red-800';
            case 'tp': return 'bg-green-100 text-green-800';
            case 'projet': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header du tableau */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <ListIcon className="w-5 h-5 mr-2 text-blue-600" />
                            Gestion des Activités
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {filteredActivities.length} activité(s) trouvée(s)
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nouvelle Activité
                    </button>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher par titre ou type..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activité</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Max</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Résolutions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedActivities.length > 0 ? (
                            paginatedActivities.map((activity, index) => (
                                <tr key={activity._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 mb-1">{activity.title}</div>
                                            <div className="text-sm text-gray-500 line-clamp-2">{activity.description || 'Aucune description'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(activity.type as string)}`}>
                                            {activity.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{activity.maximumScore} pts</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-900">{activity.resolutions?.length || 0}</span>
                                            <span className="text-sm text-gray-500 ml-1">réponse(s)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(activity)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                                title="Modifier"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteActivity(activity._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Supprimer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <h3 className="text-sm font-medium text-gray-900 mb-1">Aucune activité</h3>
                                        <p className="text-sm text-gray-500 mb-4">Commencez par créer votre première activité</p>
                                        <button
                                            onClick={openCreateModal}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            Créer une activité
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage <span className="font-medium">{startIndex + 1}</span> à{' '}
                                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</span> de{' '}
                                <span className="font-medium">{filteredActivities.length}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            page === currentPage
                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal CRUD */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {isEditMode ? 'Modifier l\'activité' : 'Nouvelle activité'}
                                </h3>
                                <button
                                    onClick={() => setShowActivityModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                                <input
                                    type="text"
                                    value={activityForm.title}
                                    onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Titre de l'activité"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select
                                    value={activityForm.type}
                                    onChange={(e) => setActivityForm({...activityForm, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="devoir">Devoir</option>
                                    <option value="examen">Examen</option>
                                    <option value="tp">TP</option>
                                    <option value="projet">Projet</option>
                                    <option value="quiz">Quiz</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score maximum *</label>
                                <input
                                    type="number"
                                    value={activityForm.maximumScore}
                                    onChange={(e) => setActivityForm({...activityForm, maximumScore: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                    max="100"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={activityForm.description}
                                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Description de l'activité"
                                />
                            </div>
                        </div>
                        
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowActivityModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={isEditMode ? handleUpdateActivity : handleCreateActivity}
                                    disabled={loadingActivity || !activityForm.title.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loadingActivity ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {isEditMode ? 'Modification...' : 'Création...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Modifier' : 'Créer'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default ActivitiesTable;
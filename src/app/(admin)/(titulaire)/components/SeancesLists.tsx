'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import SeanceSheetGenerator from '@/utils/SeanceSheet';

interface Student {
    _id: string;
    nom: string;
    prenom: string;
    matricule: string;
}

interface Presence {
    student: Student;
    location: string;
    status: string;
    timeRecorded: string;
    _id: string;
}

interface Seance {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string;
    description?: string;
    location?: string;
    presences: Presence[];
    createdAt: string;
    updatedAt: string;
}

interface SeancesListsProps {
    chargeId: string;
    seances?: Seance[];
}

const SeancesLists = ({ chargeId, seances: initialSeances = [] }: SeancesListsProps) => {
    const { addSeance, updateSeance, deleteSeance } = useUserStore();
    const [seances, setSeances] = useState<Seance[]>(initialSeances);
    const [loading, setLoading] = useState(false);
    const [generatingSheet, setGeneratingSheet] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setSeances(initialSeances);
    }, [initialSeances]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPresencesModal, setShowPresencesModal] = useState(false);
    const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);
    
    // Form states
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        topic: '',
        description: '',
        location: ''
    });

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300 * 3; // Scroll approx 3 cards
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleCreate = async () => {
        try {
            const success = await addSeance(chargeId, formData);
            if (success) {
                setShowCreateModal(false);
                resetForm();
            } else {
                alert('Erreur lors de la création');
            }
        } catch (error) {
            console.error('Erreur création:', error);
        }
    };

    const handleUpdate = async () => {
        if (!selectedSeance) return;
        try {
            const success = await updateSeance(chargeId, selectedSeance._id, formData);
            if (success) {
                setShowEditModal(false);
                resetForm();
            } else {
                alert('Erreur lors de la modification');
            }
        } catch (error) {
            console.error('Erreur modification:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
        try {
            const success = await deleteSeance(chargeId, id);
            if (!success) {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const handleGenerateSheet = async (seance: Seance) => {
        setGeneratingSheet(seance._id);
        try {
            const result = await SeanceSheetGenerator.generateSeanceSheet(seance, undefined, true);
            
            if (result.success) {
                // Afficher un message de succès avec information sur la géolocalisation
                const notification = document.createElement('div');
                const bgColor = result.usedDefaultLocation ? 'bg-yellow-500' : 'bg-green-500';
                const icon = result.usedDefaultLocation ? '⚠️' : '✅';
                
                notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm`;
                notification.innerHTML = `
                    <div class="flex items-start">
                        <span class="mr-2">${icon}</span>
                        <div>
                            <div class="font-medium">Fiche générée !</div>
                            <div class="text-sm opacity-90">${result.message}</div>
                        </div>
                    </div>
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, result.usedDefaultLocation ? 5000 : 3000);
            } else {
                // Afficher un message d'erreur
                const errorNotification = document.createElement('div');
                errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
                errorNotification.innerHTML = `
                    <div class="flex items-start">
                        <span class="mr-2">❌</span>
                        <div>
                            <div class="font-medium">Erreur de génération</div>
                            <div class="text-sm opacity-90">${result.message}</div>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorNotification);
                
                setTimeout(() => {
                    if (document.body.contains(errorNotification)) {
                        document.body.removeChild(errorNotification);
                    }
                }, 5000);
            }
            
        } catch (error) {
            console.error('Erreur génération fiche:', error);
            
            // Afficher un message d'erreur fallback
            const errorNotification = document.createElement('div');
            errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
            errorNotification.innerHTML = `
                <div class="flex items-start">
                    <span class="mr-2">❌</span>
                    <div>
                        <div class="font-medium">Erreur inattendue</div>
                        <div class="text-sm opacity-90">${error instanceof Error ? error.message : 'Impossible de générer la fiche'}</div>
                    </div>
                </div>
            `;
            document.body.appendChild(errorNotification);
            
            setTimeout(() => {
                if (document.body.contains(errorNotification)) {
                    document.body.removeChild(errorNotification);
                }
            }, 5000);
        } finally {
            setGeneratingSheet(null);
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            startTime: '',
            endTime: '',
            topic: '',
            description: '',
            location: ''
        });
        setSelectedSeance(null);
    };

    const openEdit = (seance: Seance) => {
        setSelectedSeance(seance);
        setFormData({
            date: new Date(seance.date).toISOString().split('T')[0],
            startTime: seance.startTime,
            endTime: seance.endTime,
            topic: seance.topic,
            description: seance.description || '',
            location: seance.location || ''
        });
        setShowEditModal(true);
    };

    const exportToCSV = (seance: Seance) => {
        const headers = ['Matricule', 'Nom', 'Prénom', 'Statut', 'Heure', 'Lieu'];
        const rows = seance.presences.map(p => [
            p.student.matricule,
            p.student.nom,
            p.student.prenom,
            p.status,
            new Date(p.timeRecorded).toLocaleTimeString(),
            p.location
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `presences_${seance.topic}_${seance.date}.csv`;
        link.click();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-emerald-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-teal-100 rounded-lg">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Séances de cours</h3>
                            <p className="text-sm text-gray-500">{seances.length} séances programmées</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <button
                            onClick={() => { resetForm(); setShowCreateModal(true); }}
                            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouvelle Séance
                        </button>

                        <button 
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Body - Horizontal Scroll List */}
            <div className="p-6 bg-gray-50">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                ) : seances.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">Aucune séance programmée</p>
                    </div>
                ) : (
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {seances.map((seance) => (
                            <div 
                                key={seance._id}
                                className="flex-none w-72 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all snap-start flex flex-col"
                            >
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                                            {new Date(seance.date).toLocaleDateString('fr-FR')}
                                        </span>
                                        <div className="flex space-x-1">
                                            <button 
                                                onClick={() => handleGenerateSheet(seance)}
                                                disabled={generatingSheet === seance._id}
                                                className="p-1 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                                                title="Générer fiche de séance avec QR-code"
                                            >
                                                {generatingSheet === seance._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 4L9.5 6.5a1.5 1.5 0 000 2.12L12 11.5a1.5 1.5 0 002.12 0L16.5 9a1.5 1.5 0 000-2.12L14 4.5a1.5 1.5 0 00-2 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button 
                                                onClick={() => openEdit(seance)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Modifier la séance"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(seance._id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Supprimer la séance"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 line-clamp-2 h-12" title={seance.topic}>
                                        {seance.topic}
                                    </h4>
                                </div>
                                
                                <div className="p-4 flex-1 space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {seance.startTime} - {seance.endTime}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="truncate">{seance.location || 'Non défini'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {seance.presences?.length || 0} présents
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl space-y-2">
                                    <button
                                        onClick={() => { setSelectedSeance(seance); setShowPresencesModal(true); }}
                                        className="w-full py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Voir présences
                                    </button>
                                    
                                    <button
                                        onClick={() => handleGenerateSheet(seance)}
                                        disabled={generatingSheet === seance._id}
                                        className="w-full py-2 px-4 bg-purple-50 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors flex items-center justify-center disabled:opacity-50"
                                    >
                                        {generatingSheet === seance._id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                                Génération...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Fiche QR
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Création/Edition */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {showEditModal ? 'Modifier la séance' : 'Nouvelle séance'}
                            </h3>
                            <button 
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Ex: Introduction au chapitre 1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Salle de classe, amphi..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure début *</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin *</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Description détaillée de la séance..."
                                />
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                            <button 
                                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={showEditModal ? handleUpdate : handleCreate}
                                disabled={!formData.topic || !formData.date || !formData.startTime || !formData.endTime}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {showEditModal ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Présences */}
            {showPresencesModal && selectedSeance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                Présences - {selectedSeance.topic}
                            </h3>
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => exportToCSV(selectedSeance)}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                    Exporter CSV
                                </button>
                                <button 
                                    onClick={() => setShowPresencesModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {selectedSeance.presences.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-500">Aucune présence enregistrée pour cette séance</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedSeance.presences.map((presence) => (
                                                <tr key={presence._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {presence.student.nom} {presence.student.prenom}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {presence.student.matricule}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            presence.status === 'present' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {presence.status === 'present' ? 'Présent' : 'Absent'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(presence.timeRecorded).toLocaleTimeString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {presence.location || 'Non spécifié'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeancesLists;
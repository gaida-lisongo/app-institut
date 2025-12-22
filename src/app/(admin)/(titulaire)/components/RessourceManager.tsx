'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface Resource {
    _id: string;
    title: string;
    url: string;
    montant: number;
    description?: string;
    commandes: any[];
    createdAt: string;
}

interface RessourceManagerProps {
    chargeId: string;
    resources?: Resource[];
    onUpdate?: () => void;
}

const RessourceManager = ({ chargeId, resources: initialResources = [], onUpdate }: RessourceManagerProps) => {
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        montant: 0,
        file: null as File | null
    });

    useEffect(() => {
        setResources(initialResources);
    }, [initialResources]);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFormData({ ...formData, file: acceptedFiles[0] });
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        maxFiles: 1
    });

    const handleCreate = async () => {
        if (!formData.title || !formData.file || formData.montant < 0) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload file
            const uploadData = new FormData();
            uploadData.append('file', formData.file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            
            const uploadResult = await uploadRes.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Erreur upload');
            }

            // 2. Create Resource
            const resourceData = {
                title: formData.title,
                description: formData.description,
                montant: Number(formData.montant),
                url: uploadResult.url
            };

            const createRes = await fetch(`/api/ressources?chargeId=${chargeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resourceData)
            });

            const createResult = await createRes.json();

            if (createResult.success) {
                setResources([createResult.data, ...resources]);
                setShowModal(false);
                setFormData({ title: '', description: '', montant: 0, file: null });
                alert('Ressource ajoutée avec succès');
                if (onUpdate) onUpdate();
            } else {
                throw new Error(createResult.error);
            }

        } catch (error: any) {
            console.error('Erreur:', error);
            alert(error.message || 'Une erreur est survenue');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette ressource ?')) return;

        try {
            const res = await fetch(`/api/ressources?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            
            if (data.success) {
                setResources(resources.filter(r => r._id !== id));
                if (onUpdate) onUpdate();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la suppression');
        }
    };

    const exportCSV = (resource: Resource) => {
        if (!resource.commandes || resource.commandes.length === 0) {
            alert('Aucune commande pour cette ressource');
            return;
        }

        const headers = ['Matricule', 'Nom', 'Prénom', 'Date'];
        const rows = resource.commandes.map((c: any) => [
            c.matricule,
            c.nom,
            c.prenom,
            new Date().toLocaleDateString() // Idéalement la date de commande si disponible
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `commandes_${resource.title}.csv`;
        link.click();
    };

    const filteredResources = resources.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <span className="mr-2 text-lg">📚</span> Ressources
                </h3>
                <button 
                    onClick={() => setShowModal(true)}
                    className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    title="Ajouter une ressource"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-3">
                {filteredResources.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-xs text-gray-500">Aucune ressource disponible</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredResources.map((resource) => (
                            <div key={resource._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-3 group relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 flex-1 mr-2">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate" title={resource.title}>
                                            {resource.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                            {resource.description || 'Pas de description'}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${resource.montant > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {resource.montant > 0 ? `${resource.montant} FC` : 'Gratuit'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        {resource.commandes?.length || 0} ventes
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                        <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                                        >
                                            Télécharger
                                        </a>
                                        <button 
                                            onClick={() => handleDelete(resource._id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Supprimer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {resource.commandes?.length > 0 && (
                                    <button
                                        onClick={() => exportCSV(resource)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-green-600"
                                        title="Exporter les commandes"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Ajout */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Ajouter une ressource</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ex: Syllabus Chapitre 1"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FC)</label>
                                <input
                                    type="number"
                                    value={formData.montant}
                                    onChange={(e) => setFormData({...formData, montant: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Mettre 0 pour gratuit</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
                                <div 
                                    {...getRootProps()} 
                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                        isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                                    }`}
                                >
                                    <input {...getInputProps()} />
                                    {formData.file ? (
                                        <div className="flex items-center justify-center text-purple-600">
                                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="truncate max-w-[200px]">{formData.file.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <p>Glissez un fichier ici ou cliquez pour sélectionner</p>
                                            <p className="text-xs mt-1">(PDF, DOCX, Images, Vidéos...)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={uploading}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Envoi en cours...
                                    </>
                                ) : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RessourceManager;
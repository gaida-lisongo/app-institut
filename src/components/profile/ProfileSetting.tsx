'use client';

import { useState } from "react";
import { useResultat } from "../../app/(resultat)/layout";
import Avatar from "../ui/Avatar";

// Types pour les onglets du profil
type ProfileTab = 'identity' | 'photo';

interface ProfileSettingProps {
    onBack: () => void;
}

const ProfileSetting = ({ onBack }: ProfileSettingProps) => {
    const { etudiantInfo, updateProfile, loading } = useResultat();
    const [activeTab, setActiveTab] = useState<ProfileTab>('identity');
    const [formData, setFormData] = useState({
        nom: etudiantInfo?.nom || '',
        post_nom: etudiantInfo?.post_nom || '',
        prenom: etudiantInfo?.prenom || '',
        sexe: etudiantInfo?.sexe || 'M',
        nationalite: etudiantInfo?.nationalite || '',
        date_naissance: etudiantInfo?.date_naissance ? new Date(etudiantInfo.date_naissance).toISOString().split('T')[0] : '',
        lieu_naissance: etudiantInfo?.lieu_naissance || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // États pour la gestion de la photo
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(etudiantInfo?.photo || null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Gestion de la sélection de photo
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation du type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setMessage({ type: 'error', text: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP' });
                return;
            }

            // Validation de la taille (5MB max)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setMessage({ type: 'error', text: 'Fichier trop volumineux. Taille maximale: 5MB' });
                return;
            }

            setPhotoFile(file);
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload de la photo
    const handlePhotoUpload = async () => {
        if (!photoFile || !etudiantInfo?._id) return;

        setIsUploadingPhoto(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('photo', photoFile);

            const response = await fetch(`/api/etudiant/${etudiantInfo._id}/photo`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Photo uploadée avec succès !' });
                setPhotoFile(null);
                // Mettre à jour le contexte avec la nouvelle photo
                // Note: Il faudra peut-être rafraîchir les données du contexte
            } else {
                setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'upload de la photo' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'upload de la photo' });
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // Suppression de la photo
    const handlePhotoDelete = async () => {
        if (!etudiantInfo?._id) return;

        setIsUploadingPhoto(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/etudiant/${etudiantInfo._id}/photo`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Photo supprimée avec succès !' });
                setPhotoPreview(null);
                setPhotoFile(null);
            } else {
                setMessage({ type: 'error', text: result.error || 'Erreur lors de la suppression de la photo' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression de la photo' });
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const success = await updateProfile(formData);
            if (success) {
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
                setTimeout(() => {
                    onBack();
                }, 2000);
            } else {
                setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Une erreur est survenue' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 animate-slideInRight">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Retour</span>
                </button>
                <h1 className="text-xl font-bold text-white">Modifier mon profil</h1>
                <div className="w-16"></div>
            </div>

            {/* Message de feedback */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-red-900/20 text-red-400 border border-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Container avec onglets */}
            <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Onglets de navigation */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('identity')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                            activeTab === 'identity'
                                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Identité</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('photo')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                            activeTab === 'photo'
                                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Photo</span>
                        </div>
                    </button>
                </div>

                {/* Contenu des onglets */}
                <div className="p-6">
                    {activeTab === 'identity' && (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nom */}
                                <div>
                                    <label htmlFor="nom" className="block text-sm font-medium text-white mb-2">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre nom"
                                    />
                                </div>

                                {/* Post-nom */}
                                <div>
                                    <label htmlFor="post_nom" className="block text-sm font-medium text-white mb-2">
                                        Post-nom
                                    </label>
                                    <input
                                        type="text"
                                        id="post_nom"
                                        name="post_nom"
                                        value={formData.post_nom}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre post-nom"
                                    />
                                </div>

                                {/* Prénom */}
                                <div>
                                    <label htmlFor="prenom" className="block text-sm font-medium text-white mb-2">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre prénom"
                                    />
                                </div>

                                {/* Sexe */}
                                <div>
                                    <label htmlFor="sexe" className="block text-sm font-medium text-white mb-2">
                                        Sexe *
                                    </label>
                                    <select
                                        id="sexe"
                                        name="sexe"
                                        value={formData.sexe}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>

                                {/* Nationalité */}
                                <div>
                                    <label htmlFor="nationalite" className="block text-sm font-medium text-white mb-2">
                                        Nationalité
                                    </label>
                                    <input
                                        type="text"
                                        id="nationalite"
                                        name="nationalite"
                                        value={formData.nationalite}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre nationalité"
                                    />
                                </div>

                                {/* Date de naissance */}
                                <div>
                                    <label htmlFor="date_naissance" className="block text-sm font-medium text-white mb-2">
                                        Date de naissance
                                    </label>
                                    <input
                                        type="date"
                                        id="date_naissance"
                                        name="date_naissance"
                                        value={formData.date_naissance}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Lieu de naissance */}
                                <div className="md:col-span-2">
                                    <label htmlFor="lieu_naissance" className="block text-sm font-medium text-white mb-2">
                                        Lieu de naissance
                                    </label>
                                    <input
                                        type="text"
                                        id="lieu_naissance"
                                        name="lieu_naissance"
                                        value={formData.lieu_naissance}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre lieu de naissance"
                                    />
                                </div>
                            </div>

                            {/* Informations non modifiables */}
                            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-300 mb-2">Informations non modifiables</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Matricule:</span>
                                        <span className="ml-2 text-white font-medium">{etudiantInfo?.matricule}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Solde:</span>
                                        <span className="ml-2 text-green-400 font-medium">{etudiantInfo?.solde || 0} FC</span>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || loading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Mise à jour...
                                        </>
                                    ) : (
                                        'Sauvegarder'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'photo' && (
                        <div className="space-y-6">
                            {/* Aperçu actuel */}
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-white mb-4">Photo de profil actuelle</h3>
                                <div className="flex justify-center mb-4">
                                    <Avatar 
                                        photo={etudiantInfo?.photo} 
                                        nom={etudiantInfo?.nom} 
                                        prenom={etudiantInfo?.prenom} 
                                        size="xl"
                                    />
                                </div>
                            </div>

                            {/* Section upload */}
                            <div className="bg-gray-700 rounded-lg p-6">
                                <h4 className="text-md font-medium text-white mb-4">Changer la photo</h4>
                                
                                <div className="space-y-4">
                                    {/* Sélection de fichier */}
                                    <div>
                                        <label htmlFor="photo" className="block text-sm font-medium text-white mb-2">
                                            Sélectionner une nouvelle photo
                                        </label>
                                        <input
                                            type="file"
                                            id="photo"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handlePhotoSelect}
                                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Formats acceptés: JPG, PNG, WebP. Taille max: 5MB
                                        </p>
                                    </div>

                                    {/* Aperçu de la nouvelle photo */}
                                    {photoPreview && photoPreview !== etudiantInfo?.photo && (
                                        <div className="text-center">
                                            <h5 className="text-sm font-medium text-white mb-2">Aperçu</h5>
                                            <div className="flex justify-center mb-4">
                                                <Avatar 
                                                    photo={photoPreview} 
                                                    nom={etudiantInfo?.nom} 
                                                    prenom={etudiantInfo?.prenom} 
                                                    size="lg"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Boutons d'action */}
                                    <div className="flex space-x-4">
                                        {photoFile && (
                                            <button
                                                type="button"
                                                onClick={handlePhotoUpload}
                                                disabled={isUploadingPhoto}
                                                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                {isUploadingPhoto ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Upload en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        Uploader la photo
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {etudiantInfo?.photo && (
                                            <button
                                                type="button"
                                                onClick={handlePhotoDelete}
                                                disabled={isUploadingPhoto}
                                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Supprimer la photo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bouton retour */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Retour au profil
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSetting;

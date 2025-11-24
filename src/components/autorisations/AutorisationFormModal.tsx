'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from '@/icons';
import { AutorisationData, CreateAutorisationData } from '@/models/Autorisation';

interface AutorisationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  autorisation: AutorisationData | null;
  isEditing: boolean;
}

export default function AutorisationFormModal({
  isOpen,
  onClose,
  onSubmit,
  autorisation,
  isEditing
}: AutorisationFormModalProps) {
  const [formData, setFormData] = useState<CreateAutorisationData>({
    designation: '',
    agents: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (isEditing && autorisation) {
        setFormData({
          designation: autorisation.designation,
          agents: autorisation.agents as string[] || []
        });
      } else {
        setFormData({
          designation: '',
          agents: []
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, autorisation]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.designation.trim()) {
      newErrors.designation = 'La désignation est requise';
    } else if (formData.designation.length < 3) {
      newErrors.designation = 'La désignation doit contenir au moins 3 caractères';
    } else if (formData.designation.length > 60) {
      newErrors.designation = 'La désignation ne peut pas dépasser 60 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const url = '/api/autorisations';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { _id: autorisation?._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (result.success) {
        onSubmit();
        handleClose();
      } else {
        setErrors({ submit: result.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setErrors({ submit: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ designation: '', agents: [] });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Modifier l\'Autorisation' : 'Nouvelle Autorisation'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Désignation */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Ex: Accès Bibliothèque, Gestion Examens..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.designation 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={loading}
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.designation}
                </p>
              )}
            </div>

            {/* Description optionnelle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Description optionnelle de l'autorisation..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vous pourrez assigner des agents à cette autorisation après sa création.
              </p>
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg"
              disabled={loading}
            >
              {loading 
                ? (isEditing ? 'Modification...' : 'Création...') 
                : (isEditing ? 'Modifier' : 'Créer')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FiliereCard from '@/components/filieres/FiliereCard';

interface Mention {
  _id: string;
  designation: string;
  description?: string;
  filieres?: Filiere[];
  createdAt: string;
  updatedAt: string;
}

interface Filiere {
  _id: string;
  designation: string;
  description?: string;
  bureau?: any[];
  promotions?: any[];
  createdAt: string;
  updatedAt: string;
}

// Icône SVG pour retour
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const BuildingLibraryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function MentionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentionId = params.mention as string;

  const [mention, setMention] = useState<Mention | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateFiliereModal, setShowCreateFiliereModal] = useState(false);
  const [newFiliere, setNewFiliere] = useState({
    designation: '',
    description: ''
  });

  // Fetch mention details
  const fetchMention = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentions/${mentionId}?populate=filieres`);
      const result = await response.json();
      
      if (result.success) {
        setMention(result.data);
      } else {
        setError(result.error || 'Mention non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la mention:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mentionId) {
      fetchMention();
    }
  }, [mentionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle filiere update
  const handleUpdateFiliere = (updatedFiliere: Filiere) => {
    if (mention) {
      const updatedFilieres = mention.filieres?.map(f => 
        f._id === updatedFiliere._id ? updatedFiliere : f
      ) || [];
      
      setMention(prev => prev ? {
        ...prev,
        filieres: updatedFilieres
      } : null);
    }
  };

  // Create new filiere and associate with mention
  const handleCreateFiliere = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFiliere.designation.trim()) {
      alert('La désignation est requise');
      return;
    }

    try {
      // 1. Créer la filière
      const createResponse = await fetch('/api/filieres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFiliere),
      });

      const createResult = await createResponse.json();
      
      if (!createResult.success) {
        alert(createResult.error || 'Erreur lors de la création de la filière');
        return;
      }

      // 2. Associer la filière à la mention
      const associateResponse = await fetch(`/api/mentions/${mentionId}/filieres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filiereId: createResult.data._id }),
      });

      const associateResult = await associateResponse.json();
      
      if (associateResult.success) {
        setShowCreateFiliereModal(false);
        setNewFiliere({ designation: '', description: '' });
        // Recharger les données de la mention
        fetchMention();
      } else {
        alert(associateResult.error || 'Erreur lors de l\'association de la filière');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !mention) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || 'Mention non trouvée'}
        </h3>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mention.designation}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Détails de la mention et ses filières
            </p>
          </div>
        </div>
      </div>

      {/* Mention Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <BuildingLibraryIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {mention.designation}
            </h2>
            {mention.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {mention.description}
              </p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Créée le {formatDate(mention.createdAt)}
              </div>
              <div className="flex items-center">
                <BuildingLibraryIcon className="h-4 w-4 mr-1" />
                {mention.filieres?.length || 0} filière{(mention.filieres?.length || 0) > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filières Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filières de la mention
          </h2>
          <button 
            onClick={() => setShowCreateFiliereModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une filière
          </button>
        </div>

        {mention.filieres && mention.filieres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mention.filieres.map((filiere) => (
              <FiliereCard
                key={filiere._id}
                filiere={filiere}
                onUpdate={handleUpdateFiliere}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <BuildingLibraryIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune filière
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Cette mention n'a pas encore de filières associées.
            </p>
            <button 
              onClick={() => setShowCreateFiliereModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer la première filière
            </button>
          </div>
        )}
      </div>

      {/* Create Filiere Modal */}
      {showCreateFiliereModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Créer une nouvelle filière
                </h3>
                <button
                  onClick={() => setShowCreateFiliereModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateFiliere} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Désignation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFiliere.designation}
                    onChange={(e) => setNewFiliere(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ex: Génie Logiciel"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFiliere.description}
                    onChange={(e) => setNewFiliere(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Description de la filière"
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Note:</strong> Cette filière sera automatiquement associée à la mention "{mention?.designation}".
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateFiliereModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Créer et associer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

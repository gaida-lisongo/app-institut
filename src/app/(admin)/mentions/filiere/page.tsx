'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MentionCard from '@/components/mentions/MentionCard';

interface Mention {
  _id: string;
  designation: string;
  description?: string;
  filieres?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function MentionsListPage() {
  const router = useRouter();
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch mentions
  const fetchMentions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentions?populate=filieres');
      const result = await response.json();
      
      if (result.success) {
        setMentions(result.data || []);
      } else {
        console.error('Erreur lors du chargement des mentions:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mentions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, []);

  // Filter mentions based on search term
  const filteredMentions = mentions.filter(mention =>
    mention.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mention.description && mention.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Callbacks for MentionCard
  const handleViewMention = (mentionId: string) => {
    router.push(`/mentions/filiere/${mentionId}`);
  };

  const handleUpdateMention = (updatedMention: Mention) => {
    setMentions(prev => 
      prev.map(mention => 
        mention._id === updatedMention._id ? updatedMention : mention
      )
    );
  };

  const handleDeleteMention = (mentionId: string) => {
    setMentions(prev => prev.filter(mention => mention._id !== mentionId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white sm:text-sm"
              placeholder="Rechercher une mention..."
            />
          </div>
        </div>
        
        <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
          {filteredMentions.length} mention{filteredMentions.length > 1 ? 's' : ''} trouvée{filteredMentions.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Mentions Grid */}
      {filteredMentions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Aucune mention trouvée' : 'Aucune mention disponible'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm 
              ? 'Essayez de modifier votre recherche ou créez une nouvelle mention.'
              : 'Commencez par créer votre première mention académique.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une mention
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentions.map((mention) => (
            <MentionCard
              key={mention._id}
              mention={mention}
              onView={handleViewMention}
              onUpdate={handleUpdateMention}
              onDelete={handleDeleteMention}
            />
          ))}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {filteredMentions.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Toutes les mentions ont été chargées
          </p>
        </div>
      )}
    </div>
  );
}
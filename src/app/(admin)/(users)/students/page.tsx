'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CSVImportModal } from '@/components/csv/CSVImportModal';
// Les imports suivants sont laissés, car ils sont externes mais ne concernent pas les icônes
import { csvValidators, csvTransformers } from '@/utils/csvParser';

// --- Définition des composants SVG intégrés ---

const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.545 7.37 4.5 12 4.5c4.631 0 8.577 3.045 9.964 7.173.139.394.139.846 0 1.241-1.387 4.128-5.334 7.173-9.964 7.173-4.63 0-8.577-3.045-9.964-7.173Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z"
    />
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.24 6.39m9.886-2.09l.48-1.44a1.25 1.25 0 0 0-1.04-1.687l-3.32-.83a1.25 1.25 0 0 0-1.42 1.254L5.65 6.39m9.886-2.09l.48-1.44a1.25 1.25 0 0 0-1.04-1.687l-3.32-.83a1.25 1.25 0 0 0-1.42 1.254L5.65 6.39m9.886-2.09a3.75 3.75 0 1 1 7.5 0v.75m-7.5 0v.75m-7.5 0v.75M9 14.25a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75V8.25a.75.75 0 0 0-.75-.75H9.75a.75.75 0 0 0-.75.75v6Z"
    />
  </svg>
);

const ArrowUpTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
    />
  </svg>
);

const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5m-19.5 7.5h19.5M4.5 16.5v-1.5m6-4.5H4.5m10.5 4.5h-1.5m6-4.5h-1.5m6 0h-1.5m-6-4.5H4.5m1.5 0h1.5m3 0h1.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5c4.631 0 8.577 3.045 9.964 7.173.139.394.139.846 0 1.241-1.387 4.128-5.334 7.173-9.964 7.173-4.63 0-8.577-3.045-9.964-7.173a1.012 1.012 0 0 1 0-.639C3.423 7.545 7.37 4.5 12 4.5Z"
    />
  </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

// --- Interfaces et Types ---

interface Etudiant {
  _id: string;
  nom: string;
  post_nom: string;
  prenom?: string;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Composant minimal pour éviter les erreurs de compilation
interface EtudiantCardProps {
  etudiant: Etudiant;
  onEdit: (etudiant: Etudiant) => void;
  onDelete: (etudiant: Etudiant) => void;
  onViewRecharges: (etudiant: Etudiant) => void;
}

const EtudiantCard: React.FC<EtudiantCardProps> = ({
  etudiant,
  onEdit,
  onDelete,
  onViewRecharges,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center space-x-3 mb-3">
      <div className="flex-shrink-0">
        <UserCircleIcon className="h-10 w-10 text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Matricule: {etudiant.matricule}
        </p>
      </div>
    </div>
    <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
      <p>Sexe: {etudiant.sexe}</p>
      <p>Code: {etudiant.secure}</p>
    </div>
    <div className="flex space-x-2 mt-4">
      <button
        onClick={() => onViewRecharges(etudiant)}
        className="p-2 border border-blue-500 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        title="Voir Recharges"
      >
        <CreditCardIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onEdit(etudiant)}
        className="p-2 border border-yellow-500 rounded-full text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
        title="Modifier"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onDelete(etudiant)}
        className="p-2 border border-red-500 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Supprimer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  </div>
);

// --- Composant principal StudentsPage ---

export default function StudentsPage() {
  const router = useRouter();

  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [sexeFilter, setSexeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(
    null
  );

  // États pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    sexe: 'M' as 'M' | 'F',
    matricule: '',
    secure: '',
  });

  // Récupérer les étudiants
  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (sexeFilter) {
        params.append('sexe', sexeFilter);
      }

      const response = await fetch(`/api/etudiants?${params}`);
      const result = await response.json();

      if (result.success) {
        setEtudiants(result.data);
        setPagination(result.pagination);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des étudiants');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtudiants();
  }, [pagination.page, searchTerm, sexeFilter, sortBy, sortOrder]);

  // Gérer la recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Créer un étudiant
  const handleCreateEtudiant = async () => {
    console.log('Data new student :', formData)
    try {
      const response = await fetch('/api/etudiants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setShowCreateModal(false);
        setFormData({
          nom: '',
          post_nom: '',
          prenom: '',
          sexe: 'M',
          matricule: '',
          secure: '',
        });
        fetchEtudiants();
      } else {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Modifier un étudiant
  const handleUpdateEtudiant = async () => {
    if (!selectedEtudiant) return;

    try {
      const response = await fetch(`/api/etudiants/${selectedEtudiant._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedEtudiant(null);
        fetchEtudiants();
      } else {
        setError(result.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Supprimer un étudiant
  const handleDeleteEtudiant = async () => {
    if (!selectedEtudiant) return;

    try {
      const response = await fetch(`/api/etudiants/${selectedEtudiant._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedEtudiant(null);
        fetchEtudiants();
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Importer un étudiant depuis CSV
  const handleImportEtudiant = async (data: Record<string, any>) => {
    try {
      const response = await fetch('/api/etudiants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // Gérer la fin de l'import
  const handleImportComplete = (results: {
    successful: number;
    failed: number;
    errors: any[];
  }) => {
    setShowImportModal(false);
    fetchEtudiants();

    if (results.successful > 0) {
      alert(
        `Import terminé: ${results.successful} étudiants importés avec succès${
          results.failed > 0 ? `, ${results.failed} erreurs` : ''
        }`
      );
    }
  };

  // Champs pour l'import CSV
  const csvTargetFields = [
    {
      key: 'nom',
      label: 'Nom',
      required: true,
      description: 'Nom de famille de l\'étudiant',
    },
    {
      key: 'post_nom',
      label: 'Post-nom',
      required: true,
      description: 'Post-nom de l\'étudiant',
    },
    {
      key: 'prenom',
      label: 'Prénom',
      required: false,
      description: 'Prénom de l\'étudiant',
    },
    { key: 'sexe', label: 'Sexe', required: true, description: 'M ou F' },
    {
      key: 'matricule',
      label: 'Matricule',
      required: false,
      description: 'Matricule (généré automatiquement si vide)',
    },
    {
      key: 'secure',
      label: 'Code sécurisé',
      required: false,
      description: 'Code sécurisé (généré automatiquement si vide)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Étudiants
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} étudiant{pagination.total > 1 ? 's' : ''} au total
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Importer CSV
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvel Étudiant
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filtre par sexe */}
          <div>
            <select
              value={sexeFilter}
              onChange={(e) => setSexeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous les sexes</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="createdAt-desc">Plus récent</option>
              <option value="createdAt-asc">Plus ancien</option>
              <option value="nom-asc">Nom A-Z</option>
              <option value="nom-desc">Nom Z-A</option>
              <option value="matricule-asc">Matricule A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-400 mb-4">
            <ExclamationTriangleIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {error}
          </h3>
          <button
            onClick={fetchEtudiants}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : etudiants.length === 0 ? (
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun étudiant trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm
              ? 'Aucun résultat pour cette recherche'
              : 'Commencez par ajouter des étudiants'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un étudiant
          </button>
        </div>
      ) : (
        <>
          {/* Grille des cartes d'étudiants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {etudiants.map((etudiant) => (
              <EtudiantCard
                key={etudiant._id}
                etudiant={etudiant}
                onEdit={(etudiant) => {
                  setSelectedEtudiant(etudiant);
                  setFormData({
                    nom: etudiant.nom,
                    post_nom: etudiant.post_nom,
                    prenom: etudiant.prenom || '',
                    sexe: etudiant.sexe,
                    matricule: etudiant.matricule,
                    secure: etudiant.secure,
                  });
                  setShowEditModal(true);
                }}
                onDelete={(etudiant) => {
                  setSelectedEtudiant(etudiant);
                  setShowDeleteModal(true);
                }}
                onViewRecharges={(etudiant) => {
                  router.push(`/students/${etudiant._id}`);
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>

              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Affichage de{' '}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    sur <span className="font-medium">{pagination.total}</span>{' '}
                    résultats
                  </p>
                </div>

                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum : number;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page: pageNum }))
                          }
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.pages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal d'import CSV */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importer des étudiants depuis un fichier CSV"
        targetFields={csvTargetFields}
        onImport={handleImportEtudiant}
        onComplete={handleImportComplete}
      />

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Nouvel Étudiant
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Post-nom *
                  </label>
                  <input
                    type="text"
                    value={formData.post_nom}
                    onChange={(e) =>
                      setFormData({ ...formData, post_nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sexe *
                  </label>
                  <select
                    value={formData.sexe}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sexe: e.target.value as 'M' | 'F',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Matricule
                  </label>
                  <input
                    type="text"
                    value={formData.matricule}
                    onChange={(e) =>
                      setFormData({ ...formData, matricule: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Généré automatiquement si vide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code sécurisé
                  </label>
                  <input
                    type="text"
                    value={formData.secure}
                    onChange={(e) =>
                      setFormData({ ...formData, secure: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Généré automatiquement si vide"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCreateEtudiant}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedEtudiant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Modifier l'étudiant
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEtudiant(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Post-nom *
                  </label>
                  <input
                    type="text"
                    value={formData.post_nom}
                    onChange={(e) =>
                      setFormData({ ...formData, post_nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sexe *
                  </label>
                  <select
                    value={formData.sexe}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sexe: e.target.value as 'M' | 'F',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Matricule
                  </label>
                  <input
                    type="text"
                    value={formData.matricule}
                    onChange={(e) =>
                      setFormData({ ...formData, matricule: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code sécurisé
                  </label>
                  <input
                    type="text"
                    value={formData.secure}
                    onChange={(e) =>
                      setFormData({ ...formData, secure: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateEtudiant}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEtudiant(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedEtudiant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Supprimer l'étudiant
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est
                irréversible.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedEtudiant.nom} {selectedEtudiant.post_nom}{' '}
                  {selectedEtudiant.prenom}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Matricule: {selectedEtudiant.matricule}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteEtudiant}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEtudiant(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
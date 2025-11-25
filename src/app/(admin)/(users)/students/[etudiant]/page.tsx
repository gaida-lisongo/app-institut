'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Composants d'icônes SVG
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

interface Recharge {
  _id: string;
  orderNumber: string;
  currency: string;
  phone: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  etudiantId: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

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

interface RechargeStats {
  total: number;
  totalAmount: number;
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  pendingAmount: number;
  completedAmount: number;
}

export default function EtudiantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const etudiantId = params.etudiant as string;
  
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [stats, setStats] = useState<RechargeStats>({
    total: 0,
    totalAmount: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    pendingAmount: 0,
    completedAmount: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecharge, setSelectedRecharge] = useState<Recharge | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled'>('pending');

  // Récupérer les données de l'étudiant
  const fetchEtudiant = async () => {
    try {
      const response = await fetch(`/api/etudiants/${etudiantId}`);
      const result = await response.json();
      
      if (result.success) {
        setEtudiant(result.data);
      } else {
        setError(result.error || 'Étudiant non trouvé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Récupérer les recharges de l'étudiant
  const fetchRecharges = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/etudiants/${etudiantId}/recharges?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setRecharges(result.data);
        calculateStats(result.data);
        setError(null);
      } else {
        setError(result.error || 'Erreur lors du chargement des recharges');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (rechargesData: Recharge[]) => {
    const stats = rechargesData.reduce((acc, recharge) => {
      acc.total++;
      acc.totalAmount += recharge.amount;
      
      switch (recharge.status) {
        case 'pending':
          acc.pending++;
          acc.pendingAmount += recharge.amount;
          break;
        case 'completed':
          acc.completed++;
          acc.completedAmount += recharge.amount;
          break;
        case 'failed':
          acc.failed++;
          break;
        case 'cancelled':
          acc.cancelled++;
          break;
      }
      
      return acc;
    }, {
      total: 0,
      totalAmount: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      pendingAmount: 0,
      completedAmount: 0
    });
    
    setStats(stats);
  };

  useEffect(() => {
    if (etudiantId) {
      fetchEtudiant();
      fetchRecharges();
    }
  }, [etudiantId, statusFilter]);

  // Modifier le statut d'une recharge
  const handleUpdateStatus = async () => {
    if (!selectedRecharge) return;
    
    try {
      const response = await fetch(`/api/recharges/${selectedRecharge._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedRecharge(null);
        fetchRecharges(); // Recharger les données
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  // Supprimer une recharge
  const handleDeleteRecharge = async () => {
    if (!selectedRecharge) return;
    
    try {
      const response = await fetch(`/api/recharges/${selectedRecharge._id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedRecharge(null);
        fetchRecharges(); // Recharger les données
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error}
        </h3>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec informations étudiant */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la liste
          </button>
        </div>
        
        {etudiant && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600 dark:text-blue-400">
                  {etudiant.nom.charAt(0)}{etudiant.post_nom.charAt(0)}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  etudiant.sexe === 'M' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                }`}>
                  {etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Matricule:</span> {etudiant.matricule}
                </div>
                <div>
                  <span className="font-medium">Code sécurisé:</span> {etudiant.secure}
                </div>
                <div>
                  <span className="font-medium">Inscrit le:</span> {new Date(etudiant.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques des recharges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Recharges</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">${stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complétées</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">${stats.completedAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">${stats.pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Échouées</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.failed + stats.cancelled}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Échec + Annulé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recharges</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="completed">Complétées</option>
            <option value="failed">Échouées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      {/* Liste des recharges */}
      {recharges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune recharge trouvée
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {statusFilter ? 'Aucune recharge avec ce statut' : 'Cet étudiant n\'a pas encore de recharges'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recharges.map((recharge) => (
            <RechargeCard
              key={recharge._id}
              recharge={recharge}
              onEdit={(recharge) => {
                setSelectedRecharge(recharge);
                setNewStatus(recharge.status);
                setShowEditModal(true);
              }}
              onDelete={(recharge) => {
                setSelectedRecharge(recharge);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de modification du statut */}
      {showEditModal && selectedRecharge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Modifier le statut de la recharge
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Recharge: {selectedRecharge.orderNumber}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Montant: ${selectedRecharge.amount} {selectedRecharge.currency}
                </p>
                
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau statut:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">En attente</option>
                  <option value="completed">Complétée</option>
                  <option value="failed">Échouée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Mettre à jour
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRecharge(null);
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
      {showDeleteModal && selectedRecharge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Supprimer la recharge
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Êtes-vous sûr de vouloir supprimer cette recharge ?
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedRecharge.orderNumber}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${selectedRecharge.amount} {selectedRecharge.currency} - {selectedRecharge.description}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteRecharge}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRecharge(null);
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

// Composant carte de recharge
interface RechargeCardProps {
  recharge: Recharge;
  onEdit: (recharge: Recharge) => void;
  onDelete: (recharge: Recharge) => void;
}

function RechargeCard({ recharge, onEdit, onDelete }: RechargeCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {recharge.orderNumber}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recharge.status)}`}>
              {getStatusIcon(recharge.status)}
              <span className="ml-1 capitalize">{recharge.status}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Montant:</span> ${recharge.amount} {recharge.currency}
            </div>
            <div>
              <span className="font-medium">Téléphone:</span> {recharge.phone}
            </div>
            <div>
              <span className="font-medium">Créé le:</span> {new Date(recharge.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Mis à jour:</span> {new Date(recharge.updatedAt).toLocaleDateString()}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {recharge.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(recharge)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="Modifier le statut"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(recharge)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
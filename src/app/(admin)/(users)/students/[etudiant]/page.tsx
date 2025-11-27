'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Etudiant, Recharge, RechargeStats } from '@/types/etudiant';
import { ArrowLeftIcon, ChartBarIcon, CheckCircleIcon, ClockIcon, CreditCardIcon, ExclamationCircleIcon, XCircleIcon } from '@/icons';
import RechargeCard from '@/components/ui/etudiants/RechargeCard';
import SoldeRecharge from '@/components/ui/etudiants/SoldeRecharge';


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
  const [phoneFilter, setPhoneFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecharge, setSelectedRecharge] = useState<Recharge | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled'>('pending');
  const [filteredRecharges, setFilteredRecharges] = useState<Recharge[]>([]);

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

  // Filtrer les recharges localement
  useEffect(() => {
    let filtered = recharges;

    // Filtrer par statut
    if (statusFilter) {
      filtered = filtered.filter(recharge => recharge.status === statusFilter);
    }

    // Filtrer par téléphone
    if (phoneFilter.trim()) {
      filtered = filtered.filter(recharge => 
        recharge.phone.toLowerCase().includes(phoneFilter.toLowerCase().trim())
      );
    }

    // Filtrer par date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(recharge => {
        const rechargeDate = new Date(recharge.createdAt);
        return rechargeDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredRecharges(filtered);
  }, [recharges, statusFilter, phoneFilter, dateFilter]);

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

  const getAmountStatus = (status: string) => {
    const rechargesByStatus = recharges.filter(recharge => status === 'all' ? true : recharge.status === status);
    console.log(status, ' rechargesByStatus', recharges);
    const data = {
      'cdf': rechargesByStatus.reduce((acc, recharge) => acc + (recharge.currency === 'CDF' ? recharge.amount : 0), 0),
      'usd': rechargesByStatus.reduce((acc, recharge) => acc + (recharge.currency === 'USD' ? recharge.amount : 0), 0),
    };

    // Ici les items doivent être côte à côte avec justify-between
    return (
      <div className="flex items-center justify-between w-full mt-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">{data.cdf.toFixed(2)} CDF</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{data.usd.toFixed(2)} USD</span>
      </div>
    );
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
          <SoldeRecharge 
            etudiant={etudiant} 
            onSoldeUpdate={(newSolde) => {
              setEtudiant(prev => prev ? { ...prev, solde: newSolde } : null);
            }}
          />
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
            </div>
          </div>
          {getAmountStatus('all')}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Complétées</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
          {getAmountStatus('completed')}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
          {getAmountStatus('pending')}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Échouées</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.failed + stats.cancelled}</p>
            </div>
          </div>
          {getAmountStatus('failed')}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recharges</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="completed">Complétées</option>
                <option value="failed">Échouées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            {/* Filtre par téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Rechercher par téléphone..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Filtre par date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Bouton pour effacer les filtres */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setPhoneFilter('');
                  setDateFilter('');
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Effacer filtres
              </button>
            </div>
          </div>

          {/* Affichage du nombre de résultats */}
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {filteredRecharges.length} recharge{filteredRecharges.length !== 1 ? 's' : ''} trouvée{filteredRecharges.length !== 1 ? 's' : ''}
            {(statusFilter || phoneFilter || dateFilter) && ` sur ${recharges.length} au total`}
          </div>
        </div>
      </div>

      {/* Liste des recharges */}
      {filteredRecharges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {recharges.length === 0 ? 'Aucune recharge trouvée' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {recharges.length === 0 
              ? 'Cet étudiant n\'a pas encore de recharges'
              : 'Aucune recharge ne correspond aux critères de recherche'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecharges.map((recharge) => (
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
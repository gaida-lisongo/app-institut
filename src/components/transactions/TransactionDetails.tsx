'use client';

import { useState } from 'react';

interface Student {
    _id: string;
    nom: string;
    prenom: string;
    numero: string;
}

interface Subscription {
    student: Student;
    lastSolde: number;
    newSolde: number;
}

interface Agent {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
}

interface Transaction {
    _id: string;
    amount: number;
    status: 'Pending' | 'Completed' | 'Failed';
    subscriptions?: Subscription[];
    agentId?: Agent;
    productType: string;
    productId: string;
    createdAt: string;
    updatedAt: string;
}

interface TransactionDetailsProps {
    transaction: Transaction;
    title?: string;
    showActions?: boolean;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (transactionId: string) => void;
    onUpdateStatus?: (transactionId: string, status: string) => void;
    className?: string;
}

const TransactionDetails = ({
    transaction,
    title = "Détails de la Transaction",
    showActions = false,
    onEdit,
    onDelete,
    onUpdateStatus,
    className = ""
}: TransactionDetailsProps) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Pending':
                return (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Failed':
                return (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!onUpdateStatus) return;
        
        setIsUpdatingStatus(true);
        try {
            await onUpdateStatus(transaction._id, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center">
                        {getStatusIcon(transaction.status)}
                        {title}
                    </h3>
                    {showActions && (
                        <div className="flex items-center space-x-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(transaction)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                    title="Modifier"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(transaction._id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Supprimer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Statistiques de la transaction */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Montant</h4>
                        <p className="text-2xl font-bold text-gray-900">{transaction.amount.toLocaleString()} FCFA</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Statut</h4>
                        <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                            </span>
                            {onUpdateStatus && (
                                <div className="ml-2 relative">
                                    <select
                                        value={transaction.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={isUpdatingStatus}
                                        className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Souscriptions</h4>
                        <p className="text-2xl font-bold text-gray-900">
                            {transaction.subscriptions?.length || 0}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Date de création</h4>
                        <p className="text-sm text-gray-900">
                            {formatDate(transaction.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-700 mb-2">Informations produit</h4>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Type :</span> {transaction.productType}</p>
                            <p><span className="font-medium">ID :</span> <code className="text-xs bg-white px-1 py-0.5 rounded">{transaction.productId}</code></p>
                        </div>
                    </div>
                    
                    {transaction.agentId && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-purple-700 mb-2">Agent responsable</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Nom :</span> {transaction.agentId.prenom} {transaction.agentId.nom}</p>
                                <p><span className="font-medium">Email :</span> {transaction.agentId.email}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Liste des étudiants souscrits */}
                {transaction.subscriptions && transaction.subscriptions.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900">Étudiants souscrits</h4>
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                {transaction.subscriptions.length} inscription{transaction.subscriptions.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Étudiant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ancien Solde
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nouveau Solde
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Différence
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transaction.subscriptions.map((subscription, index) => {
                                        const difference = subscription.newSolde - subscription.lastSolde;
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {subscription.student.prenom.charAt(0)}{subscription.student.nom.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {subscription.student.prenom} {subscription.student.nom}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {subscription.student.numero}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                    {subscription.lastSolde.toLocaleString()} FCFA
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                    {subscription.newSolde.toLocaleString()} FCFA
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                                    <span className={`font-medium ${
                                                        difference < 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {difference > 0 ? '+' : ''}{difference.toLocaleString()} FCFA
                                                    </span>
                                                    <div className="text-xs text-gray-500">
                                                        {difference < 0 ? 'Débit' : 'Crédit'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Message si aucune souscription */}
                {(!transaction.subscriptions || transaction.subscriptions.length === 0) && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Aucune souscription</h3>
                        <p className="text-sm text-gray-500">Cette transaction n'a pas encore d'étudiants inscrits.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionDetails;
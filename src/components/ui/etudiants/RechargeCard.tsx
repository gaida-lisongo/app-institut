'use client';

import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, PencilIcon, TrashIcon, XCircleIcon } from "@/icons";
import { Recharge } from "@/types/etudiant";


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

export default RechargeCard;
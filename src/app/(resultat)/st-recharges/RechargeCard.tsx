import { Recharge } from "./page";

const RechargeCard = ({ 
    recharge,
    onCrediter,
    onDetails,
    onDelete
 }: { recharge: Recharge, onCrediter: (recharge: Recharge) => void, onDetails: (recharge: Recharge) => void, onDelete: (rechargeId: string) => void}) => {
    return (
        <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors shadow-lg border border-gray-700">
            {/* Header avec montant et statut */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        recharge.status === 'completed' ? 'bg-green-500' :
                        recharge.status === 'pending' ? 'bg-yellow-500' :
                        recharge.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-white font-bold text-lg">
                        {recharge.amount} {recharge.currency}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    recharge.status === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                    recharge.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                    recharge.status === 'failed' ? 'bg-red-900/30 text-red-400 border border-red-700' : 'bg-gray-900/30 text-gray-400 border border-gray-700'
                }`}>
                    {recharge.status === 'completed' ? 'Réussie' :
                     recharge.status === 'pending' ? 'En attente' :
                     recharge.status === 'failed' ? 'Échouée' : recharge.status}
                </span>
            </div>

            {/* Informations de la recharge */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Commande:</span>
                    <span className="text-white font-mono text-xs">{recharge.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white text-xs">
                        {new Date(recharge.createdAt).toLocaleDateString('fr-FR')} à {new Date(recharge.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Boutons d'action - Mobile First */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {recharge.status === 'pending' && (
                    <button
                        onClick={() => onCrediter(recharge)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span>Créditer</span>
                    </button>
                )}
                <button
                    onClick={() => onDetails(recharge)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Détails</span>
                </button>
                <button
                    onClick={() => onDelete(recharge._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer</span>
                </button>
            </div>
        </div>
    );
};

export default RechargeCard;
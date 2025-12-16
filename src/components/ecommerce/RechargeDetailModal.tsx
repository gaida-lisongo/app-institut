import { Recharge } from "@/app/(resultat)/st-recharges/page";
import { useState } from "react";

interface RechargeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recharges: Recharge[];
}

export default function RechargeDetailModal({ isOpen, onClose, recharges }: RechargeDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredRecharges = recharges.filter(recharge => {
    const student = recharge.etudiantId;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      student?.nom?.toLowerCase().includes(searchTermLower) ||
      student?.post_nom?.toLowerCase().includes(searchTermLower) ||
      student?.prenom?.toLowerCase().includes(searchTermLower) ||
      student?.matricule?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Nom', 'Post-nom', 'Prénom', 'Matricule', 'Montant', 'Devise', 'Date', 'Statut', 'Méthode de paiement', 'Numéro de commande'];
    const rows = filteredRecharges.map(r => [
      r.etudiantId?.nom,
      r.etudiantId?.post_nom,
      r.etudiantId?.prenom,
      r.etudiantId?.matricule,
      r.amount,
      r.currency,
      new Date(r.createdAt).toLocaleString(),
      r.status,
      r.paymentMethod,
      r.orderNumber
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'recharges.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Détails des Recharges</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            &times;
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Exporter en CSV
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Étudiant</th>
                <th scope="col" className="px-6 py-3">Montant</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecharges.map((recharge) => (
                <tr key={recharge._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {recharge.etudiantId?.nom} {recharge.etudiantId?.post_nom}
                  </td>
                  <td className="px-6 py-4">
                    {recharge.amount} {recharge.currency}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(recharge.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recharge.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {recharge.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

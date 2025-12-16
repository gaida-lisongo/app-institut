import { Commande } from "./CommandesChart";

interface CommandeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  commande: Commande | null;
}

export default function CommandeDetailModal({ isOpen, onClose, commande }: CommandeDetailModalProps) {
  if (!isOpen || !commande) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Détails de la Commande</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            &times;
          </button>
        </div>
        <div className="space-y-2">
          <p><strong>Produit:</strong> {commande.produit}</p>
          <p><strong>Étudiant:</strong> {commande.etudiantId?.nom} {commande.etudiantId?.post_nom}</p>
          <p><strong>Matricule:</strong> {commande.etudiantId?.matricule}</p>
          <p><strong>Montant:</strong> {commande.montant} CDF</p>
          <p><strong>Statut:</strong> {commande.statut}</p>
          <p><strong>Année:</strong> {commande?.anneeId?.debut} - {commande?.anneeId?.debut}</p>
        </div>
      </div>
    </div>
  );
}

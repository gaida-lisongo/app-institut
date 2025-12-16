import Badge from "../ui/badge/Badge";
import { Commande } from "./CommandesChart";

interface CommandeCardProps {
  commande: Commande;
  onClick: () => void;
}

export default function CommandeCard({ commande, onClick }: CommandeCardProps) {
  return (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{commande.etudiantId?.nom} {commande.etudiantId?.post_nom}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{commande.etudiantId?.matricule}</p>
        </div>
        <Badge
          size="sm"
          color={
            commande.statut === "completed" || commande.statut === "Terminé"
              ? "success"
              : commande.statut === "pending"
              ? "warning"
              : "error"
          }
        >
          {commande.statut}
        </Badge>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Promotion:</span>
          <span className="font-medium text-gray-800 dark:text-white">{commande.promotion?.designation ?? 'Bulletin'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Montant:</span>
          <span className="font-medium text-gray-800 dark:text-white">{commande.montant} CDF</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Année:</span>
          <span className="font-medium text-gray-800 dark:text-white">{commande?.anneeId?.debut} - {commande?.anneeId?.fin}</span>
        </div>
      </div>
    </div>
  );
}

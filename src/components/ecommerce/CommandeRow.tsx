// src/components/ecommerce/CommandeRow.tsx

import React from 'react';
import Badge from '../ui/badge/Badge';
import { Commande } from './CommandesChart'; // Assurez-vous que l'interface est accessible

interface CommandeRowProps {
  commande: Commande;
  onClick: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Terminé':
      return 'success';
    case 'En cours':
    case 'Pending':
      return 'warning';
    case 'Annulé':
    case 'Canceled':
      return 'danger';
    default:
      return 'info';
  }
};

export default function CommandeRow({ commande, onClick }: CommandeRowProps) {
  // Extraction des données pour un affichage facile
  const etudiantNom = `${commande.etudiantId?.nom} ${commande.etudiantId?.post_nom}`;
  const matricule = commande.etudiantId?.matricule || 'N/A';
  const produitNom = commande.produit || 'Bulletin';
  const promotionDesignation = commande.promotionId?.designation || 'N/A';
  const montant = parseFloat(commande.montant || 0).toFixed(2);
  const statut = commande.statut || 'En cours';

  return (
    <div
      className="grid grid-cols-6 items-center py-4 px-6 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150 cursor-pointer"
      onClick={onClick}
    >
      {/* Colonne 1: Étudiant / Matricule */}
      <div className="col-span-2 flex flex-col">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{etudiantNom}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{matricule}</p>
      </div>

      {/* Colonne 2: Produit */}
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{produitNom}</div>

      {/* Colonne 3: Promotion */}
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{promotionDesignation}</div>

      {/* Colonne 4: Montant (CDF) */}
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {montant} CDF
      </div>

      {/* Colonne 5: Statut */}
      <div className="text-right">
        <Badge color={getStatusColor(statut)}>{statut}</Badge>
      </div>
    </div>
  );
}
"use client";

import React, { useMemo, useState } from "react";
import { DownloadIcon } from "@/icons";

interface Commande {
  _id: string;
  montant: number;
  statut: string;
  produit?: string;
  createdAt: string;
  etudiantId: {
    nom: string;
    post_nom?: string;
    prenom?: string;
    matricule: string;
    sexe?: string;
  };
  promotionId: {
    designation: string;
    cycle: string;
    niveau: string;
  };
  anneeId: {
    debut: number;
    fin: number;
  };
}

interface Props {
  commandes: Commande[];
}

export default function CommandeDataTable({ commandes }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return commandes.filter((c) =>
      `${c.etudiantId.nom} ${c.etudiantId.post_nom ?? ""} ${c.etudiantId.prenom ?? ""}`
        .toLowerCase()
        .includes(q) ||
      c.etudiantId.matricule.toLowerCase().includes(q) ||
      c.promotionId.designation.toLowerCase().includes(q)
    );
  }, [commandes, search]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-white/5 dark:border-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Toutes les commandes (CDF)
        </h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Recherche rapide (étudiant, matricule, classe)"
          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-left text-gray-600 dark:text-gray-300">
             <th className="px-4 py-3">N°</th>   
              <th className="px-4 py-3">Étudiant</th>
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Année</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Montant (CDF)</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, index) => (
              <tr
                key={c._id}
                className="border-t hover:bg-gray-50 dark:hover:bg-white/5 transition"
              >
                <td className="px-4 py-3 font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-3 font-medium">
                  {c.etudiantId.nom} {c.etudiantId.post_nom} {c.etudiantId.prenom}
                  <div className="text-xs text-gray-400">
                    {c.etudiantId.matricule} · {c.etudiantId.sexe}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.promotionId.designation}
                  <div className="text-xs text-gray-400">
                    {c.promotionId.cycle} · {c.promotionId.niveau}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.anneeId.debut}/{c.anneeId.fin}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                    {c.produit ?? "Bulletin"}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  {c.montant.toLocaleString()} CDF
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.statut === "Terminé"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {c.statut}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Aucune commande trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

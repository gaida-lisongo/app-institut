"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { PlusIcon } from "@/icons";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "../ui/jury/LoadingSpinner";
import CreateExpenseModal from "./CreateExpenseModal";
import { Retrait } from "@/app/(admin)/page";
import { Annee } from "@/app/(admin)/(appariteur)/inscriptions/[cycle]/page";
import { TargetYear } from "./MonthlyTarget";

export default function RecentOrders({
  onFetch,
  onYearData
} : {
  onFetch?: (data: Retrait[]) => void;
  onYearData?: (years: TargetYear[]) => void;
}) {
  const { agent } = useUserStore();
  const [annee, setAnnee] = useState<Annee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listDepenses, setListDepenses] = useState<Retrait[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche 🔍

  const baseUrl = 'http://localhost:3001/api/v1';

  // 1. Récupération des données
  useEffect(() => {
    const fetchAnnees = async () => {
      try {
        const request = await fetch('/api/annees');
        const response = await request.json();
        if (response.success && response.data) {
          const activeAnne = (response.data as Annee[]).find(yer => yer?.isActive === true);
          if (activeAnne) setAnnee(activeAnne);
        }
      } catch (error) {
        console.error('Erreur années:', error);
      }
    };
    fetchAnnees();
  }, []);

  useEffect(() => {
    if (agent?._id) {
      readDepenses(agent._id);
    }
  }, [agent]);

  // Fonctions pour gérer les retraits
  const readDepenses = async (agentId: string) => {
    setLoading(true);
    try {
      const request = await fetch(`${baseUrl}/retraits/user/${agentId}`);
      const response = await request.json();
      if (response.success) {
        setListDepenses(response.data);
        if (onFetch) {
          onFetch(response.data as Retrait[]);
        }

        if(onYearData && annee) {
          const totalTarget = (response.data as Retrait[]).length;
          const amountSpent = (response.data as Retrait[]).reduce((sum, depense) => sum + (depense.status == "Completed" ? depense.amount : 0), 0);
          const totalTargetOK = (response.data as Retrait[]).reduce((sum, depense) => sum + (depense.status == "Completed" ? 1 : 0), 0);
          const totalTargetPending = (response.data as Retrait[]).reduce((sum, depense) => sum + (depense.status == "Pending" ? 1 : 0), 0);
          const totalTargetFailed = (response.data as Retrait[]).reduce((sum, depense) => sum + (depense.status == "Failed" ? 1 : 0), 0);
          const designation = annee?.debut + '-' + annee?.fin || 'N/A';
          onYearData([{
            _id: annee?._id || 'N/A',
            totalTarget: totalTarget,
            amountSpent: amountSpent,
            totalTargetOK,
            totalTargetPending,
            totalTargetMissed: totalTargetFailed,
            designation
          }]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des retraits:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDepense = async (depenseData: {
    agentId: string;
    anneeId: string;
    amount: number;
    service: string;
  }) => {
    setLoading(true);
    try {
      const request = await fetch(`${baseUrl}/retraits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depenseData),
      });
      const response = await request.json();
      if (response.success && agent?._id) {
        // Rafraîchir la liste
        await readDepenses(agent._id);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
    } finally {
      setLoading(false);
    }
  };
  // 2. Logique de filtrage et limitation (10 récents) 📊
  const displayData = useMemo(() => {
    return listDepenses
      .filter((item) =>
        item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.amount.toString().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [listDepenses, searchTerm]);


  const deleteDepense = async (depenseId: string) => {
    setLoading(true)
    try {

      const request = await fetch(`${baseUrl}/retraits/${depenseId}`, {

        method: 'DELETE',

      });

      const response = await request.json();

      if(response.success) {

        console.log("Dépense supprimée:", response.data);

        const updatedDepenses = listDepenses.filter(depense => depense._id !== depenseId);

        setListDepenses(updatedDepenses);

      }

    } catch (error) {

      console.error('Erreur lors de la suppression de la dépense:', error);

    } finally {
      
      setLoading(false);
    }

  }

  if (!annee || loading) return <LoadingSpinner />;  

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Dépenses {annee.debut}-{annee.fin}
          </h3>
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">
            Total affiché: {displayData.reduce((total, depense) => total + depense.amount, 0)} FC
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input 
            type="text" 
            placeholder="Rechercher un retrait..." 
            defaultValue={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />         
          <Button 
            size="sm" 
            variant="outline" 
            endIcon={<PlusIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Ajouter une dépense
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                N° Commande / Service
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Montant
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Date
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Statut
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayData.map((retrait) => (
              <TableRow key={retrait._id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {retrait.orderNumber}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {retrait.service}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {retrait.amount.toLocaleString()} FC
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(retrait.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={
                      retrait.status === "Completed" ? "success" : 
                      retrait.status === "Pending" ? "warning" : "error"
                    }
                  >
                    {retrait.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:bg-red-50 border-red-200"
                    onClick={() => {
                      if(confirm("Voulez-vous vraiment supprimer ce retrait ?")) {
                        deleteDepense(retrait._id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {agent?._id && <CreateExpenseModal 
        userName={agent?.matricule || 'Utilisateur'}
        anneeInfo={`Année ${annee.debut}-${annee.fin}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(createdExpense) => {
          try {
            setIsModalOpen(false);
            if (agent?._id && annee?._id) {
              createDepense({
                agentId: agent._id,
                anneeId: annee._id,
                amount: createdExpense.amount,
                service: 'PAS'
              });
            }
          } catch (error) {
            console.error('Erreur lors de la création de la dépense:', error);
          }
        }}
      />}
    </div>
  );
}
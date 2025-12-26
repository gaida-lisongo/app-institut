"use client";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect, useState } from "react";
import MonthlyTarget, { TargetYear } from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import AuthStatus from "@/components/auth/AuthStatus";
import UserProfile from "@/components/user/UserProfile";
import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import { mockEcommerceData } from "@/components/ecommerce/mockData";
import { Annee } from "@/app/(admin)/(appariteur)/inscriptions/[cycle]/page";
import { Agent } from "@/types/jury";
import { useUserStore } from "@/store/useUserStore";
import LoadingSpinner from "@/components/ui/jury/LoadingSpinner";

export interface Retrait {
  _id: string;
  agentId: Agent;
  anneeId: Annee;
  service: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

console.log('Base URL:', baseUrl);
export default function Ecommerce() {
  const { agent } = useUserStore();
  const [years, setYears] = useState<Annee[] | null>(null);
  const [depenses, setDepenses] = useState<Retrait[] | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);

  const fetchAnnees = async () => {
    try {
      const request = await fetch('/api/annees');
      const response = await request.json();
      if (response.success && response.data) {
        return response.data as Annee[];
      }
    } catch (error) {
      console.error('Erreur années:', error);
    }
  };

  // Fonctions pour gérer les retraits
  const readDepenses = async (agentId: string) => {
    try {
      const request = await fetch(`${baseUrl}/finance/retraits/service/${agentId}`);
      const response = await request.json();
      if (response.success) {
        const retraits: Retrait[] = response.data;
        return retraits;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des retraits:', error);
    }
  };

  // Fonctions pour recupérer les recettes
  const readRecettes = async (agentId: string) => {
    try {
      const request = await fetch(`${baseUrl}/finance/recettes?productType=${agentId}`);
      const response = await request.json();
      if (response.success) {
        const recettes: any[] = response.data;
        return recettes;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes:', error);
    }
  };

  useEffect(() => {

    const initData = async () => {
      if (agent?._id) {
        const recettes = [];
        
        const [annees, retraits, recettesInsc, recettesDoc ] = await Promise.all([fetchAnnees(), readDepenses('ACADEMIQUE'), readRecettes('Inscription'), readRecettes('Document')]);
        setYears(annees || []);
        setDepenses(retraits || []);

        if (recettesInsc) {
          recettes.push(...recettesInsc);
        }

        if (recettesDoc) {
          recettes.push(...recettesDoc);
        }

        setTransactions(recettes || []);
      }
    };
    initData();
  }, []);

  if (!years || !depenses || !transactions) {
    return <LoadingSpinner />;
  }


  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* <div className="col-span-12">
        <AuthStatus />
      </div>
      <div className="col-span-12">
        <UserProfile />
      </div> */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics
          retraits={depenses || []}
          recettes={transactions || []}
        />

        <MonthlySalesChart 
          annees={years || []}
          retraits={depenses || []}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget productsType={[
          'Inscription',
          'Document',
        ]} recettes={transactions || []} />
      </div>

      <div className="col-span-12">
        {agent && <RecentOrders
          annee={years.filter(y => y.isActive)[0] || null}
          agent={agent}
          retraits={depenses.filter(d => d.anneeId._id === (years.filter(y => y.isActive)[0]?._id || '')) || []}
          onAddDepense={() => {
            // Rafraîchir les données après l'ajout d'une dépense
            if (agent?._id) {
              readDepenses(agent._id).then((retraits) => {
                setDepenses(retraits || []);
              });
            }
          }}
        />}
      </div>

    </div>
  );
} 

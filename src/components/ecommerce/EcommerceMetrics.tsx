import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoltIcon, BoxIconLine, DollarLineIcon, GroupIcon, PieChartIcon } from "@/icons";
import { Retrait } from "@/app/(admin)/page";

interface EcommerceMetricsProps {
  retraits: Retrait[];
  recettes: any[];
}

export default function EcommerceMetrics(
  { recettes, retraits }: EcommerceMetricsProps
) {
  const recettesMetrics = {
    totalTransactions: recettes.reduce((count, transaction) => transaction.status === 'Completed' ? count + 1 : count, 0),
    amountCollected: recettes.reduce((total, transaction) => total + (transaction.status === 'Completed' ? transaction.amount : 0), 0),
  };

  const depensesMetrics = {
    totalTransactions: retraits.reduce((count, retrait) => retrait.status === 'Completed' ? count + 1 : count, 0),
    amountSpent: retraits.reduce((total, retrait) => total + (retrait.status === 'Completed' ? retrait.amount : 0), 0),
  };
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <PieChartIcon className="text-green-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Recettes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {recettesMetrics.totalTransactions}
            </h4>
          </div>
          <Badge color="success">
            {
              (recettesMetrics.amountCollected / (recettesMetrics.amountCollected + depensesMetrics.amountSpent)) * 100 < 50.00 ? (
                <ArrowDownIcon />
              ) : (
                <ArrowUpIcon />
              )
            }
            { ((recettesMetrics.amountCollected / (recettesMetrics.amountCollected + depensesMetrics.amountSpent)) * 100).toFixed(2) }%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <PieChartIcon className="text-red-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Dépenses
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {depensesMetrics.totalTransactions}
            </h4>
          </div>

          <Badge color="error">
            {
              (depensesMetrics.amountSpent / (recettesMetrics.amountCollected + depensesMetrics.amountSpent)) * 100 < 50.00 ? (
                <ArrowDownIcon />
              ) : (
                <ArrowUpIcon />
              )
            }
            { ((depensesMetrics.amountSpent / (recettesMetrics.amountCollected + depensesMetrics.amountSpent)) * 100).toFixed(2) }%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};

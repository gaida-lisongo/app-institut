"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "@/icons";

interface RechargesMetricsProps {
  recharges: any[];
}

export default function RechargesMetrics({
  recharges
}: RechargesMetricsProps) {
  console.log("All recharge : ", recharges)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-success-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Recharges Encaissées
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {
                recharges.reduce((total, recharge) => total + (recharge?.status == 'completed' ? parseFloat(recharge?.currency == 'CDF' ? recharge?.amount : recharge?.amount * 2200) : 0 ), 0)
              } CDF
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {
              recharges?.length > 0 ? ((recharges.reduce((total, recharge) => total + (recharge?.status == 'completed' ? parseFloat(recharge?.currency == 'CDF' ? recharge?.amount : recharge?.amount * 2200) : 0 ), 0) * 100)/recharges.reduce((total, recharge) => total + ( parseFloat(recharge?.currency == 'CDF' ? recharge?.amount : recharge?.amount * 2200)), 0)).toFixed(2) : 0
            }%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-error-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Recharges Non Encaissées
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {
                recharges.reduce((total, recharge) => total + (recharge?.status == 'pending' ? parseFloat(recharge?.currency == 'CDF' ? recharge?.amount : recharge?.amount * 2200) : 0 ), 0)
              } CDF
            </h4>
          </div>

          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            {
              recharges?.length > 0 ? ((recharges.reduce((total, recharge) => total + (recharge?.status == 'pending' ? parseFloat(recharge?.currency == 'CDF' ? recharge?.amount : recharge?.amount * 2200) : 0 ), 0) * 100)/recharges.reduce((total, recharge) => total + ( parseFloat(recharge?.currency == 'CDF' ? recharge?.amount : recharge?.amount * 2200)), 0)).toFixed(2) : 0
            }%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};

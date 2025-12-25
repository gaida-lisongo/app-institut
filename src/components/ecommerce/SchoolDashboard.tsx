"use client";

import { useState } from "react";
import MonthlyRevenueChart from "./MonthlyRevenueChart";
import {
  mockAcademicYears,
  mockMonthlyRevenues,
  mockStudentStats,
  mockServiceRevenues,
  getRevenueTrends,
} from "./mockSchoolData";

export default function SchoolDashboard() {
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const trends = getRevenueTrends();
  const currentYearStats = mockStudentStats.filter(
    (stat) => stat.yearId === selectedYear
  );

  // Calcul des totaux pour l'année sélectionnée
  const yearData = mockAcademicYears.find((year) => year._id === selectedYear);
  const monthlyData = mockMonthlyRevenues.filter(
    (data) => data.yearId === selectedYear
  );

  const totalStudents = currentYearStats.reduce(
    (sum, stat) => sum + stat.totalStudents,
    0
  );
  const totalNewEnrollments = currentYearStats.reduce(
    (sum, stat) => sum + stat.newEnrollments,
    0
  );
  const averageDropoutRate =
    currentYearStats.reduce((sum, stat) => sum + stat.dropoutRate, 0) /
    currentYearStats.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency: "CDF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    trend,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    color?: "blue" | "green" | "yellow" | "red" | "purple";
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
      green:
        "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
      yellow:
        "bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
      red: "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
      purple:
        "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400",
    };

    return (
      <div
        className={`rounded-xl border p-6 ${colorClasses[color]} dark:bg-gray-800 dark:border-gray-700`}
      >
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === "number" ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {trend && (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord de l'établissement
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Année académique {selectedYear}
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {mockAcademicYears.map((year) => (
            <option key={year._id} value={year._id}>
              {year.designation}
            </option>
          ))}
        </select>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus totaux"
          value={yearData?.totalRevenue || 0}
          subtitle="Année académique complète"
          trend={trends.growthRate}
          color="green"
        />
        <StatCard
          title="Étudiants inscrits"
          value={totalStudents.toLocaleString()}
          subtitle="Tous cycles confondus"
          color="blue"
        />
        <StatCard
          title="Nouvelles inscriptions"
          value={totalNewEnrollments.toLocaleString()}
          subtitle="Cette année"
          color="purple"
        />
        <StatCard
          title="Taux d'abandon moyen"
          value={`${averageDropoutRate.toFixed(1)}%`}
          subtitle="Tous cycles"
          color={averageDropoutRate > 8 ? "red" : "yellow"}
        />
      </div>

      {/* Graphique des revenus */}
      <MonthlyRevenueChart
        years={mockAcademicYears}
        chartData={mockMonthlyRevenues}
      />

      {/* Répartition par cycle et services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques par cycle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition par cycle
          </h3>
          <div className="space-y-4">
            {currentYearStats.map((stat) => (
              <div key={stat.cycle} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {stat.cycle}
                  </h4>
                  <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Nouveaux: {stat.newEnrollments}</span>
                    <span>Diplômés: {stat.graduatedStudents}</span>
                    <span>Abandon: {stat.dropoutRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.totalStudents.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    étudiants
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services et revenus additionnels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Services et revenus additionnels
          </h3>
          <div className="space-y-4">
            {mockServiceRevenues.slice(0, 4).map((service) => (
              <div key={service._id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {service.designation}
                  </h4>
                  <div className="flex items-center mt-1">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${service.usage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {service.usage}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(service.monthlyRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    /mois
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
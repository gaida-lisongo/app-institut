"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

interface MonthlyRevenueChartProps {
  years: {
    _id: string;
    totalRevenue: number;
    designation: string;
  }[];
  chartData: {
    yearId: string;
    month: string;
    totalRevenue: number;
    inscriptions: number;
    fraisScolarite: number;
    autresServices: number;
  }[];
}

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyRevenueChart({ years, chartData }: MonthlyRevenueChartProps) {
  const [selectedYear, setSelectedYear] = useState(years[0]?._id || '');
  const [isOpen, setIsOpen] = useState(false);

  // Filtrer les données pour l'année sélectionnée
  const filteredData = chartData.filter(data => data.yearId === selectedYear);
  
  // Préparer les données pour le graphique
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const revenueData = monthNames.map(month => {
    const monthData = filteredData.find(data => data.month === month);
    return monthData ? monthData.totalRevenue : 0;
  });

  const inscriptionsData = monthNames.map(month => {
    const monthData = filteredData.find(data => data.month === month);
    return monthData ? monthData.inscriptions : 0;
  });

  const fraisScolariteData = monthNames.map(month => {
    const monthData = filteredData.find(data => data.month === month);
    return monthData ? monthData.fraisScolarite : 0;
  });

  const options: ApexOptions = {
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    chart: {
      fontFamily: "Inter, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthNames,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      markers: {
        radius: 6,
      },
    },
    yaxis: {
      title: {
        text: "Montant (FC)",
        style: {
          color: "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (val: number) => {
          if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
          } else if (val >= 1000) {
            return `${(val / 1000).toFixed(0)}K`;
          }
          return val.toString();
        },
      },
    },
    grid: {
      show: true,
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 0.9,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('fr-CD', {
            style: 'currency',
            currency: 'CDF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        },
      },
      theme: "light",
    },
  };

  const series = [
    {
      name: "Inscriptions",
      data: inscriptionsData,
    },
    {
      name: "Frais de scolarité",
      data: fraisScolariteData,
    },
    {
      name: "Autres services",
      data: monthNames.map(month => {
        const monthData = filteredData.find(data => data.month === month);
        return monthData ? monthData.autresServices : 0;
      }),
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const selectedYearData = years.find(y => y._id === selectedYear);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-gray-900 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Revenus de l'établissement
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Année académique {selectedYearData?.designation}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Total: {new Intl.NumberFormat('fr-CD', {
              style: 'currency',
              currency: 'CDF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(selectedYearData?.totalRevenue || 0)}
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
            className="dropdown-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-48 p-2"
          >
            {years.map((year) => (
              <DropdownItem
                key={year._id}
                onClick={() => {
                  setSelectedYear(year._id);
                  closeDropdown();
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{year.designation}</span>
                  <span className="text-xs text-gray-500">
                    {new Intl.NumberFormat('fr-CD', {
                      style: 'currency',
                      currency: 'CDF',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(year.totalRevenue)}
                  </span>
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[700px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
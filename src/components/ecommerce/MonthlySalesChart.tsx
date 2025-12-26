'use client';
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Annee } from "@/app/(admin)/(appariteur)/inscriptions/[cycle]/page";
import { Retrait } from "@/app/(admin)/page";

interface MonthlySalesChartProps {
  annees: Annee[];
  retraits: Retrait[];
}

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart({ annees, retraits }: MonthlySalesChartProps) {
  const [years, setYears] = useState<{
    _id: string;
    totalSales: number;
    designation: string;
  }[]>([]);

  const [year, setYear] = useState<{_id: string; totalSales: number; designation: string} | null>(null);

  const [chartData, setChartData] = useState<{
    yearId: string;
    month: string;
    totalSales: number;
  }[]>([]);


  useEffect(() => {
    const parseData = () => {
      const newYears: {
        _id: string;
        totalSales: number;
        designation: string;
      }[] = [];

      annees.forEach((annee) => {
        console.log('Processing year:', annee);
        const currentRetraits = retraits.filter(
          (retrait) => retrait.anneeId._id === annee._id
        );

        const totalSales = currentRetraits.reduce((acc, retrait) => acc + (retrait.status == 'Pending' ? 1 : 0), 0);
        const designation = annee.debut + ' - ' + annee.fin;

        newYears.push({ _id: annee._id, totalSales, designation });
      });

      setYears(newYears);
    }

    if (annees.length > 0) {
      parseData();
    }
  }, [annees, retraits])

  useEffect(() => {
    if (years.length > 0) {
      setYear(years[0]);
    }
  }, [years]);

  useEffect(() => {
    if (year) {
      const monthlyData: {
        yearId: string;
        month: string;
        totalSales: number;
      }[] = [];

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      months.forEach((month) => {
        const totalSales = retraits.filter((retrait) => {
          const retraitDate = new Date(retrait.createdAt);
          return (
            retrait.anneeId._id === year._id &&
            retraitDate.toLocaleString('en-US', { month: 'short' }) === month &&
            retrait.status == 'Pending'
          );
        }).length;

        monthlyData.push({
          yearId: year._id,
          month,
          totalSales,
        });
      });

      setChartData(monthlyData);
    }
  }, [year, retraits]);


  // Filtrer les données pour l'année sélectionnée
  const filteredData = chartData.filter(data => data.yearId === year?._id);
  
  // Préparer les données pour le graphique
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const transactionsData = monthNames.map(month => {
    const monthData = filteredData.find(data => data.month === month);
    return monthData ? monthData.totalSales : 0;
  });

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} transactions`,
      },
    },
  };
  const series = [
    {
      name: "Transactions",
      data: transactionsData,
    },
  ];
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Année académique {year?.designation}
          </h3>
          <span className="text-gray-500 text-theme-sm dark:text-gray-400">Total Transactions: {year?.totalSales}</span>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            {
              years.map((y) => (
                <DropdownItem
                  key={y._id}
                  onClick={() => {
                    // Handle year selection logic here
                    setYear(y);
                    closeDropdown();
                  }}
                >
                  {y.designation}
                </DropdownItem>
              ))
            }
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}

"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export interface Commande {
  _id: string;
  anneeId: any;
  etudiantId: any;
  promotionId: any;
  produit?: string;
  statut: string;
}

interface CommandesChartProps {
  commandes: {
    _id: string;
    designation: string;
    semestres: any[];
    cycle: string;
    niveau: string;
    systeme: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    commandes: Commande[];
  }[]
}

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CommandesChart({ commandes }: CommandesChartProps) {

  const produits = [
    'Bulletin',
    'Recours',
    'Travail',
    'Enrollement'
  ]
  const [categorie, setCategorie] = useState<string>(produits[0])
  const [chartData, setChartData] = useState<{ series: { name: string; data: number[] }[], categories: string[] }>({ series: [], categories: [] });

  useEffect(() => {
    if (commandes && commandes.length > 0) {
      const categories = commandes.map(promo => `${promo.niveau} ${(promo?.designation?.toString().split(' ')?.length > 2 ? promo?.designation?.toString().split(' ')[2].toString().slice(0, 3).toUpperCase() :  promo?.designation?.toString().split(' ')[1]) ?? promo?.designation?.toString().split('-')[1]}`);
      const seriesData = commandes.map(promo => {
        return promo.commandes.filter(cmd => {
          if (categorie === 'Bulletin') {
            return cmd.produit === 'Bulletin' || !cmd.produit;
          }
          return cmd.produit === categorie;
        }).length;
      });

      setChartData({
        categories,
        series: [{ name: categorie, data: seriesData }],
      });
    }
  }, [commandes, categorie]);

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
      categories: chartData.categories,
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
        formatter: (val: number) => `${val} commandes`,
      },
    },
  };
  
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Commandes par Promotion
        </h3>

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
              produits.map(p => (
                <DropdownItem
                  key={p}
                  onItemClick={() => {
                    setCategorie(p);
                    closeDropdown();
                  }}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {p}
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
            series={chartData.series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}

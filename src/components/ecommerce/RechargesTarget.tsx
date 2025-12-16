"use client";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useCallback, useEffect, useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Annee, Promotion } from "@/app/(resultat)/layout";
import { getJson } from "@/app/(admin)/recharges/page";
import { Recharge } from "@/app/(resultat)/st-recharges/page";
import LoadingSpinner from "../ui/jury/LoadingSpinner";
import RechargeDetailModal from "./RechargeDetailModal";

interface RechargesTargetProps {
  promotions: Promotion[];
  annees: Annee[];
  recharges: Recharge[];
}

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RechargesTarget({ promotions, annees, recharges }: RechargesTargetProps) {
  const [annee, setAnnee] = useState<Annee>(annees?.find(a => a.isActive) ?? annees[0]);
  const [promotion, setPromotion] = useState<Promotion>(promotions[0]);
  const [data, setData] = useState<Recharge[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any>({ series: [0], options: {} });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fechEtudiants = useCallback(async () => {
    // ⚠️ Note: Les variables promotion et annee sont des dépendances
    try {
      setLoading(true);
      const filterRechargesByStudent: Recharge[] = [];
      // Construction de l'URL avec les IDs actuels des états React
      const resp = await fetch(`/api/parcours?promotionId=${promotion._id}&anneeId=${annee._id}`);
      const result = await resp.json();

      if (result?.success) {
        const allStudents = result?.data as any[];

        console.log('allStudents : ', allStudents);

        recharges.forEach(recharge => {
          const isStudent = allStudents.find(student => student?.etudiantId?._id === recharge?.etudiantId?._id);
          if (isStudent) {
            filterRechargesByStudent.push(recharge);
          }
        })
      }
      setData(filterRechargesByStudent);
    } catch (error) {
      console.log('error : ', error);
    } finally {
      setLoading(false);
    }
  }, [promotion, annee, recharges]); // <-- Dépendances : la fonction ne change que si celles-ci changent

  // ⭐️ Mettre à jour useEffect pour utiliser la fonction stable
  useEffect(() => {
    // Exécute le fetch chaque fois que promotion, annee, ou fechEtudiants change
    fechEtudiants();
  }, [promotion, annee, fechEtudiants]);

  const generateMetrcis = (allRecharges: Recharge[]) => {
    const cdfRecharges = allRecharges.filter(r => r.currency === 'CDF');
    const usdRecharges = allRecharges.filter(r => r.currency === 'USD');
    console.log('cdfRecharges : ', cdfRecharges);
    console.log('usdRecharges : ', usdRecharges);

    const totalCDF = cdfRecharges.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalUSD = usdRecharges.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    console.log('totalCDF : ', totalCDF);
    console.log('totalUSD : ', totalUSD);
    const totalCompletedCDF = cdfRecharges
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
      
    const totalCompletedUSD = usdRecharges
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    console.log("totalCompletedCDF : ", totalCompletedCDF);
    console.log("totalCompletedUSD : ", totalCompletedUSD);

    return {
      cdf: {
        totalCDF: totalCompletedCDF ,
        isUp: totalCDF > 0 ? (totalCompletedCDF * 100 / totalCDF) > 50 : false,
      },
      usd: {
        totalUSD: totalCompletedUSD,
        isUp: totalUSD > 0 ? (totalCompletedUSD * 100 / totalUSD) > 50 : false,
      },
      all : allRecharges?.reduce((total, recharge) => total + (recharge?.status == 'completed' ? 1 : 0), 0),
    }    
  }

  const series = [75.55];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData({ series: [0], options: options }); // Reset or set default
      return;
    }

    const totalTransactions = data.reduce((total, recharge) => total + (recharge?.status === 'completed' || recharge?.status === 'pending' ? 1 : 0), 0);
    const completedTransactions = generateMetrcis(data).all;
    const percentage = totalTransactions > 0 ? (completedTransactions * 100 / totalTransactions) : 0;

    setChartData({
      series: [parseFloat(percentage.toFixed(2))],
      options: options,
    });
    
  }, [data]);


  console.log('data : ', data?.filter((recharge) => recharge?.status == 'completed' && recharge?.currency == 'USD' ? recharge?.amount : 0));

  if(loading){
    //Loader custom
    return <div className="flex items-center justify-center">
      <LoadingSpinner />
    </div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {promotion?.designation}
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Année académique: {annee?.debut} - {annee?.fin} 
            </p>
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
                promotions?.length && promotions?.map(p => 
                  <DropdownItem
                    key={p?._id}
                    tag="a"
                    onItemClick={() => {
                      setPromotion(p);
                      closeDropdown();
                    }}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    {p?.designation}
                  </DropdownItem>
                )
              }
            </Dropdown>
          </div>
        </div>
        <div className="relative ">
          {data && <div className="max-h-[330px]">
            <ReactApexChart
              options={chartData?.options}
              series={chartData?.series}
              type="radialBar"
              height={330}
            />
          </div>}

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            Total Recharges : {data?.length}
          </span>
        </div>
        <div className="text-center mt-10">
          <button onClick={() => setIsModalOpen(true)} className="text-sm text-blue-500 hover:underline">
            Pour voir le détail des recharges, cliquez ici
          </button>
        </div>
      </div>
      <RechargeDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} recharges={data} />

      {data && <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Transactions
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {generateMetrcis(data).all}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Recharges CDF
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {generateMetrcis(data).cdf.totalCDF}
            {generateMetrcis(data).cdf.isUp ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z" fill="#039855"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z" fill="#D92D20"/>
              </svg>
            )}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Recharges USD
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {generateMetrcis(data).usd.totalUSD}
            {generateMetrcis(data).usd.isUp ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z" fill="#039855"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z" fill="#D92D20"/>
              </svg>
            )}
          </p>
        </div>
      </div>}
    </div>
  );
}

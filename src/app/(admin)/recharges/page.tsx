import CommandesChart from "@/components/ecommerce/CommandesChart";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import RechargesMetrics from "@/components/ecommerce/RechargesMetrics";
import { headers } from "next/headers";

const RechargesPage = async () => {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "";

  const getJson = async (path: string) => {
    const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Fetch failed: ${path} (${res.status})`);
    }
    return res.json();
  };

  const [promotionsResp, rechargesResp, anneesResp] = await Promise.all([
    getJson("/api/promotions"),
    getJson("/api/recharges"),
    getJson("/api/annees"),
  ]);

  const promotions: any[] = promotionsResp?.success ? promotionsResp.data ?? [] : [];
  const recharges: any[] = rechargesResp?.success ? rechargesResp.data ?? [] : [];

  const commandesByPromotion: any[] = await Promise.all(
    promotions.map(async (promotion) => {
      const resp = await getJson(`/api/commande?promotionId=${promotion?._id}`);
      return {
        ...promotion,
        commandes: resp?.success ? resp.data ?? [] : [],
      };
    }),
  );

  console.log("recharges : ", recharges);
  console.log("promotions : ", promotions);
  console.log("commandes : ", commandesByPromotion);
  console.log("annees : ", anneesResp);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <RechargesMetrics recharges={recharges} />

        <CommandesChart commandes={commandesByPromotion} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>
      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );

};

export default RechargesPage;
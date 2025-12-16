import CommandesChart from "@/components/ecommerce/CommandesChart";
import CommandesTable from "@/components/ecommerce/CommandesTable";
import RechargesMetrics from "@/components/ecommerce/RechargesMetrics";
import { headers } from "next/headers";
import RechargesTarget from "@/components/ecommerce/RechargesTarget";
import CommandesDashboardView from "@/components/ecommerce/CommandesDashboard";
import CommandeDataTable from "@/components/ecommerce/CommandesDashboard";


export const getJson = async (path: string) => {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "";
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${path} (${res.status})`);
  }
  return res.json();
};
  
const RechargesPage = async () => {

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

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <RechargesMetrics recharges={recharges} />

        <CommandesChart commandes={commandesByPromotion} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <RechargesTarget promotions={promotions} annees={anneesResp.data} recharges={recharges} />
      </div>
      <div className="col-span-12 xl:col-span-12">
        <CommandeDataTable commandes={commandesByPromotion.map(p => p.commandes).flat()} />
        {/* <CommandesTable data={commandesByPromotion} /> */}
      </div>
    </div>
  );

};

export default RechargesPage;
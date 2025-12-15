import NavigationJury from "@/components/ui/jury/NavigationJury";
import { PromotionProvider } from "@/contexts/PromotionContext";
import dbConnect from "@/lib/dbConnect";
import AnneeModel from "@/models/Annee";
import { cookies } from "next/headers";
import { JWTUtils } from '@/lib/auth/jwt';
import { JuryAnnee, JuryPromotion, Filiere } from "@/types/jury";

const fetchAnnees = async (): Promise<JuryAnnee[]> => {
    try {
        await dbConnect();

        const anneesData = await AnneeModel.find({}).lean();

        if(!anneesData){
            return [];
        }

        // Convertir en objets plain JavaScript pour éviter l'erreur de sérialisation
        return anneesData.map((annee: any) => ({
            _id: annee._id.toString(),
            debut: annee.debut,
            fin: annee.fin,
            isActive: annee.isActive,
            createdAt: annee.createdAt.toISOString(),
            updatedAt: annee.updatedAt.toISOString()
        }));
    } catch (error) {
        console.error("Error fetching annees : ", error);
        return [];
    }
}
// Fonction pour récupérer les filières de l'utilisateur
const getUserFilieres = async (): Promise<Filiere[]> => {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');
        
        if (tokenCookie) {

            console.log("tokenCookie", tokenCookie);
            const { userId } = await JWTUtils.verifyToken(tokenCookie.value);
            console.log("userId", userId);

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const url = `${baseUrl}/api/jurys?userId=${userId}`;
            
            const req = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenCookie.value}`
                }
            });
            const res = await req.json();

            if(!res?.success){
                return [];
            }

            // Sérialiser les données pour éviter les erreurs
            return JSON.parse(JSON.stringify(res.data));
        }

        return [];
    } catch (error) {
        console.error("Error fetching user filieres:", error);
        return [];
    }
};

const JuryLayout = async ({children}: {children: React.ReactNode}) => {
    const annees = await fetchAnnees();
    const filieres = await getUserFilieres();

    console.log("annees", annees);
    console.log("filieres", filieres);
    
    // Extraire toutes les promotions des filières
    const promotions: JuryPromotion[] = [];
    filieres.forEach(filiere => {
        promotions.push(...filiere.promotions);
    });

    return (
        <PromotionProvider 
            initialAnnees={annees}
            initialPromotions={promotions}
            initialFilieres={filieres}
        >
            <div>
                <NavigationJury />
                {children}
            </div>
        </PromotionProvider>
    );
};

export default JuryLayout;
import NavigationJury from "@/components/ui/jury/NavigationJury";
import dbConnect from "@/lib/dbConnect";
import Annee from "@/models/Annee";
import { cookies, headers } from "next/headers";

const fetchAnnees = async () => {
    try {
        await dbConnect();

        const anneesData = await Annee.find({}).lean();

        if(!anneesData){
            return [];
        }

        return anneesData;
    } catch (error) {
        console.error("Error fetching annees : ", error);
        return [];
    }
}
// Fonction pour récupérer les autorisations depuis les cookies/session
const getUserAuthorizations = async () => {
    try {
        // Méthode compatible avec Next.js 15+
        const cookieStore = await cookies();
        
        // Option 1: Récupérer depuis un cookie userData
        const userDataCookie = cookieStore.get('userData');
        if (userDataCookie) {
            const userData = JSON.parse(userDataCookie.value);
            return userData.autorisations || [];
        }

        // Option 2: Récupérer depuis un token JWT dans les cookies
        const tokenCookie = cookieStore.get('authToken');
        if (tokenCookie) {
            // Vous pouvez décoder le JWT ici pour extraire les autorisations
            // const jwt = require('jsonwebtoken');
            // const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
            // return decoded.autorisations || [];
        }

        // Option 3: Récupérer depuis les headers
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (authHeader) {
            // Traiter le header d'autorisation si nécessaire
            // return extractAuthorizationsFromHeader(authHeader);
        }

        return [];
    } catch (error) {
        console.error("Error fetching user authorizations:", error);
        return [];
    }
};

const JuryLayout = async ({children}: {children: React.ReactNode}) => {
    const annees = await fetchAnnees();
    
    // Récupérer les autorisations de l'utilisateur
    const autorisations = await getUserAuthorizations();
    
    console.log("Data fetching annee:", annees);
    console.log("User autorisations:", autorisations);

    return (
        <div>
            <NavigationJury 
                annees={annees} 
                autorisations={autorisations} 
            />
            {children}
        </div>
    );
};

export default JuryLayout;
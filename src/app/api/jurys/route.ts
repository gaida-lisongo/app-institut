import { Filiere } from "@/models/Mention";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Semestre } from "@/models/Semestre";

export async function GET(req: NextRequest){
    try {
        await dbConnect();
        
        const {searchParams} = new URL(req.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: "userId is required"
            }, { status: 400 });
        }

        const filiereData = await Filiere.find({bureau: {$elemMatch: {agent: userId}}})
            .populate('bureau.agent')
            .populate('promotions')
            .lean();
        
        if(!filiereData){
            return NextResponse.json({
                success: false,
                message: "No filiere found"
            }, { status: 404 });
        }

        const filieres = [];
        
        for (const filiere of filiereData) {
            const promotionsData = filiere?.promotions?.map(async (promotion : any) => {
                const semestres = await Semestre.find({_id: { $in: promotion.semestres }}).populate({
                    path: 'unites',
                    populate: {
                        path: 'matieres'
                    }
                }).lean();
                return {
                    ...promotion,
                    semestres: semestres
                };
            })

            const promotions = await Promise.all(promotionsData || []);

            filieres.push({
                ...filiere,
                promotions: promotions
            });

        }

        return NextResponse.json({
            success: true,
            data: filieres
        });
        
    } catch (error) {
        console.error("Error fetching filieres : ", error);
        return NextResponse.json({
            success: false,
            error: error
        });
        
    }
}


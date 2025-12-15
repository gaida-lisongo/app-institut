// import { NextRequest, NextResponse } from 'next/server';
// import connectMongo from '@/lib/mongodb';
// import Etudiant from '@/models/Etudiant';

// export async function POST(req: NextRequest) {
//     try {
//         await connectMongo();

//         const { etudiantId, amount } = await req.json();

//         if (!etudiantId || !amount || amount <= 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Données invalides' },
//                 { status: 400 }
//             );
//         }

//         // Trouver l'étudiant
//         const etudiant = await Etudiant.findById(etudiantId);
        
//         if (!etudiant) {
//             return NextResponse.json(
//                 { success: false, error: 'Étudiant non trouvé' },
//                 { status: 404 }
//             );
//         }

//         // Vérifier le solde
//         const currentBalance = etudiant.solde || 0;
//         if (currentBalance < amount) {
//             return NextResponse.json(
//                 { success: false, error: 'Solde insuffisant' },
//                 { status: 400 }
//             );
//         }

//         // Déduire le montant
//         const newBalance = currentBalance - amount;
//         etudiant.solde = newBalance;
//         await etudiant.save();

//         return NextResponse.json({
//             success: true,
//             newBalance: newBalance,
//             message: 'Solde déduit avec succès'
//         });

//     } catch (error) {
//         console.error('Erreur lors de la déduction du solde:', error);
//         return NextResponse.json(
//             { success: false, error: 'Erreur serveur' },
//             { status: 500 }
//         );
//     }
// }

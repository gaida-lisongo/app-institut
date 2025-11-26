import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Recharge from '../../../../../../models/Recharge';
import Etudiant from '../../../../../../models/Etudiant';
import paymentManager from '../../../../../../lib/utils/PaymentManager';

// GET - Vérifier le statut d'une recharge
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        await dbConnect();
        const { orderNumber } = await params;

        // Trouver la recharge en base
        const recharge = await Recharge.findOne({ orderNumber })
            .populate('etudiantId', 'nom prenom matricule');

        if (!recharge) {
            return NextResponse.json(
                { error: 'Recharge non trouvée' },
                { status: 404 }
            );
        }

        // Si déjà complétée, retourner le statut
        if (recharge.status === 'completed') {
            return NextResponse.json({
                success: true,
                message: 'Recharge déjà complétée',
                data: {
                    orderNumber: recharge.orderNumber,
                    status: recharge.status,
                    amount: recharge.amount,
                    currency: recharge.currency,
                    completedAt: recharge.updatedAt
                }
            });
        }

        let payload : any = { 
            message: 'Recharge en cours de traitement',
            newSolde: null,
        };
        // Vérifier le statut auprès du provider de paiement
        const paymentStatus = await paymentManager.checkTransaction({
            orderNumber: recharge.orderNumber
        }, async (paymentResult : any) => {
            const { message, transaction } = paymentResult;
            payload.message = message;

            if(transaction.status != '0'){
                // Marquer comme complétée
                recharge.status = 'completed';
                recharge.transactionId = transaction.reference;
                await recharge.save();
                
                // Mettre à jour le solde de l'étudiant
                const etudiant = await Etudiant.findById(recharge.etudiantId);
                if (etudiant) {
                    console.log("Taux : ", process.env.TAUX)
                    payload.newSolde = transaction?.currency == 'CDF' ? (etudiant.solde || 0) + recharge.amount : (etudiant.solde || 0) + (recharge.amount * parseInt(process.env.TAUX?.toString() || '2200'));
                    etudiant.solde = payload.newSolde as number;
                    await etudiant.save();
                }
            } else {
                // Marquer comme échouée
                recharge.status = 'failed';
                await recharge.save();
            }
            console.log("Payment result : ", payload);
        });

        // Mettre à jour le statut en base selon la réponse
        if (payload?.newSolde) {


            return NextResponse.json({
                success: true,
                message: 'Recharge complétée avec succès',
                data: {
                    orderNumber: recharge.orderNumber,
                    status: 'completed',
                    amount: recharge.amount,
                    currency: recharge.currency,
                    newBalance: payload.newSolde,
                    completedAt: new Date()
                }
            });

        } else {
            // Toujours en attente
            return NextResponse.json({
                success: false,
                message: payload?.message ?? 'Recharge en cours de traitement',
                data: {
                    orderNumber: recharge.orderNumber,
                    status: recharge.status,
                    amount: recharge.amount,
                    currency: recharge.currency,
                    createdAt: recharge.createdAt
                }
            });
        }

    } catch (error) {
        console.error('Erreur vérification statut recharge:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

// PUT - Mettre à jour manuellement le statut d'une recharge
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        await dbConnect();
        const { orderNumber } = await params;
        const body = await request.json();
        const { status, transactionId } = body;

        // Validation
        const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Statut invalide' },
                { status: 400 }
            );
        }

        // Trouver la recharge
        const recharge = await Recharge.findOne({ orderNumber });
        if (!recharge) {
            return NextResponse.json(
                { error: 'Recharge non trouvée' },
                { status: 404 }
            );
        }

        // Mettre à jour selon le statut
        switch (status) {
            case 'completed':
                recharge.status = 'completed';
                if (transactionId) {
                    recharge.transactionId = transactionId;
                }
                await recharge.save();
                
                // Mettre à jour le solde étudiant
                const etudiant = await Etudiant.findById(recharge.etudiantId);
                if (etudiant) {
                    etudiant.solde = (etudiant.solde || 0) + recharge.amount;
                    await etudiant.save();
                }
                break;

            case 'failed':
                recharge.status = 'failed';
                await recharge.save();
                break;

            case 'cancelled':
                if (recharge.status === 'pending') {
                    recharge.status = 'cancelled';
                    await recharge.save();
                } else {
                    throw new Error('Seules les recharges en attente peuvent être annulées');
                }
                break;

            default:
                recharge.status = status;
                await recharge.save();
        }

        return NextResponse.json({
            success: true,
            message: `Recharge ${status} avec succès`,
            data: {
                orderNumber: recharge.orderNumber,
                status: recharge.status,
                updatedAt: recharge.updatedAt
            }
        });

    } catch (error) {
        console.error('Erreur mise à jour recharge:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

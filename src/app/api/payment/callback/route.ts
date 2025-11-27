import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Recharge from '../../../../../models/Recharge';
import Etudiant from '../../../../../models/Etudiant';

// POST - Callback de paiement FlexPay
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        console.log('📞 Callback reçu:', body);

        const { orderNumber, status, transactionId, amount, currency } = body;

        if (!orderNumber) {
            console.error('❌ OrderNumber manquant dans le callback');
            return NextResponse.json(
                { error: 'OrderNumber requis' },
                { status: 400 }
            );
        }

        // Trouver la recharge correspondante
        const recharge = await Recharge.findOne({ orderNumber });
        if (!recharge) {
            console.error('❌ Recharge non trouvée:', orderNumber);
            return NextResponse.json(
                { error: 'Recharge non trouvée' },
                { status: 404 }
            );
        }

        // Vérifier que la recharge n'est pas déjà traitée
        if (recharge.status !== 'pending') {
            console.log('⚠️ Recharge déjà traitée:', orderNumber, recharge.status);
            return NextResponse.json({
                success: true,
                message: 'Recharge déjà traitée',
                status: recharge.status
            });
        }

        // Traiter selon le statut
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'success':
            case 'successful':
                try {
                    // Marquer la recharge comme complétée
                    recharge.status = 'completed';
                    if (transactionId) {
                        recharge.transactionId = transactionId;
                    }
                    await recharge.save();
                    
                    // Mettre à jour le solde de l'étudiant
                    const etudiant = await Etudiant.findById(recharge.etudiantId);
                    if (etudiant) {
                        const oldBalance = etudiant.solde || 0;
                        etudiant.solde = oldBalance + recharge.amount;
                        await etudiant.save();
                        
                        console.log('✅ Solde mis à jour:', {
                            etudiant: etudiant.matricule,
                            oldBalance,
                            newBalance: etudiant.solde,
                            amount: recharge.amount
                        });
                    }

                    console.log('✅ Recharge complétée:', {
                        orderNumber,
                        amount: recharge.amount,
                        currency: recharge.currency,
                        transactionId
                    });

                    return NextResponse.json({
                        success: true,
                        message: 'Paiement confirmé et solde mis à jour'
                    });

                } catch (error) {
                    console.error('❌ Erreur lors de la completion:', error);
                    return NextResponse.json(
                        { error: 'Erreur lors de la mise à jour' },
                        { status: 500 }
                    );
                }

            case 'failed':
            case 'failure':
            case 'error':
                recharge.status = 'failed';
                await recharge.save();
                console.log('❌ Recharge échouée:', orderNumber);
                
                return NextResponse.json({
                    success: true,
                    message: 'Paiement échoué enregistré'
                });

            case 'cancelled':
            case 'canceled':
                try {
                    if (recharge.status === 'pending') {
                        recharge.status = 'cancelled';
                        await recharge.save();
                    } else {
                        throw new Error('Seules les recharges en attente peuvent être annulées');
                    }
                    console.log('🚫 Recharge annulée:', orderNumber);
                    
                    return NextResponse.json({
                        success: true,
                        message: 'Paiement annulé enregistré'
                    });
                } catch (error) {
                    console.error('❌ Erreur annulation:', error);
                    return NextResponse.json(
                        { error: 'Erreur lors de l\'annulation' },
                        { status: 500 }
                    );
                }

            default:
                console.log('⚠️ Statut inconnu:', status);
                return NextResponse.json({
                    success: true,
                    message: 'Statut reçu mais non traité',
                    receivedStatus: status
                });
        }

    } catch (error) {
        console.error('❌ Erreur callback paiement:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

// GET - Endpoint de test pour vérifier que le callback fonctionne
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Endpoint de callback actif',
        timestamp: new Date().toISOString()
    });
}

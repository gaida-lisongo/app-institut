import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Recharge from '../../../../models/Recharge';
import Etudiant from '../../../../models/Etudiant';
import paymentManager from '../../../../lib/utils/PaymentManager';

// POST - Créer une nouvelle recharge
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { etudiantId, amount, currency = 'USD', phone, description } = body;

        // Validation des données
        if (!etudiantId || !amount || !phone) {
            return NextResponse.json(
                { error: 'Données manquantes: etudiantId, amount, phone requis' },
                { status: 400 }
            );
        }

        // Vérifier que l'étudiant existe
        const etudiant = await Etudiant.findById(etudiantId);
        if (!etudiant) {
            return NextResponse.json(
                { error: 'Étudiant non trouvé' },
                { status: 404 }
            );
        }

        // Valider le montant
        const amountValidation = paymentManager.validateAmount(amount, currency);
        if (!amountValidation.valid) {
            return NextResponse.json(
                { error: amountValidation.message },
                { status: 400 }
            );
        }

        // Vérifier la configuration du payment manager
        if (!paymentManager.isConfigured()) {
            return NextResponse.json(
                { error: 'Service de paiement non configuré' },
                { status: 503 }
            );
        }

        // Créer l'enregistrement de recharge en base
        const recharge = new Recharge({
            etudiantId,
            amount,
            currency,
            phone: phone,
            description: `Recharge de compte - ${etudiant.nom} ${etudiant.prenom} ${etudiant.matricule}`,
            status: 'pending'
        });

        await recharge.save();
        
        return NextResponse.json({
            success: true,
            message: 'Recharge crée avec succès',
            data: recharge
        });

    } catch (error) {
        console.error('Erreur création recharge:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { amount, currency , phone, description } = body;


        const { searchParams } = new URL(request.url);
        const rechargeId = searchParams.get('rechargeId');

        const recharge = await Recharge.findById(rechargeId);
        if (!recharge) {
            return NextResponse.json(
                { error: 'Recharge non trouvée' },
                { status: 404 }
            );
        }

        // Créer la transaction de paiement
        await paymentManager.createTransaction({
            amount,
            currency,
            reference: 'Recharge ID: ' + rechargeId,
            phone: phone,
            description: description
        }, async (paymentResult) => {
            recharge.orderNumber = paymentResult.orderNumber;            
            await recharge.save();
        });

        return NextResponse.json({
            success: true,
            message: 'Recharge mise à jour',
            data: recharge,
        });
    } catch (error) {
        console.error('Erreur récupération recharges:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

// GET - Récupérer les recharges
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const etudiantId = searchParams.get('etudiantId');
        const status = searchParams.get('status');
        const orderNumber = searchParams.get('orderNumber');
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        let query: any = {};

        // Filtres
        if (etudiantId) {
            query.etudiantId = etudiantId;
        }
        if (status) {
            query.status = status;
        }
        if (orderNumber) {
            query.orderNumber = orderNumber;
        }

        // Pagination
        const skip = (page - 1) * limit;

        const recharges = await Recharge.find(query)
            .populate('etudiantId', 'nom prenom matricule')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Recharge.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: recharges,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Erreur récupération recharges:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

import {NextRequest, NextResponse} from 'next/server';
import mongoose, { Types } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import {initializeModels} from '@/lib/initModels';
import Transaction from '@/models/Transaction';
import Parcours from '@/models/Parcours';
import { Activity, Recours, Resource } from '@/models/Charge';
import Commandes from '@/models/Commande';

//Créate a new transaction
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();
        const body = await request.json();
        const {amount, agentId, productId, productType} = body;

        if(!amount || !productId || !productType){
            return NextResponse.json({success: false, error: "Missing required fields"}, {status: 400});
        }

        const newTransaction = new Transaction({
            amount,
            agentId,
            productId,
            productType,
            status: 'Pending'
        });

        await newTransaction.save();

        let model;

        switch (productType) {
            case 'Inscription':
                model = await Parcours.findById(productId);
                break;
            case 'Ressource':
                model = await Resource.findById(productId);
                break;
            case 'Activity':
                model = await Activity.findById(productId);
                break;
            case 'Recours':
                model = await Recours.findById(productId);
                break;
            case 'Bulletin':
                model = await Commandes.findById(productId);
                break;
            case 'Document':
                // model = await import('@/models/Document');
                break;
            case 'Enrollement':
                // model = await import('@/models/Enrollement');
                break;
            case 'Modalite':
                // model = await import('@/models/Modalite');
                break;
        }

        if(model){
            //ad property transaction to the model
            model.transaction = newTransaction._id;
            await model.save();
        }

        return NextResponse.json({success: true, data: newTransaction}, {status: 201});
    } catch (error) {
        return NextResponse.json({success: false, error: error instanceof Error ? error.message : 'An unknown error occurred'}, {status: 500});
    }
}

//Read all or one transaction now with query params
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const status = searchParams.get('status');
        const productType = searchParams.get('productType');
        const productId = searchParams.get('productId');
        const agentId = searchParams.get('agentId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '1000');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Si un ID est fourni, retourner cette transaction spécifique
        if (id) {
            const transaction = await Transaction.findById(id)
                .populate('agentId', 'nom prenom email')
                .populate({
                    path: 'subscriptions.student',
                    select: 'nom prenom numero'
                });

            if (!transaction) {
                return NextResponse.json(
                    { success: false, error: 'Transaction not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: transaction
            });
        }

        // Construction du filtre
        const filter: any = {};
        if (status) filter.status = status;
        if (productType) filter.productType = productType;
        if (productId) filter.productId = productId;
        if (agentId) filter.agentId = agentId;

        // Calcul de la pagination
        const skip = (page - 1) * limit;

        // Construction du tri
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Exécution de la requête avec pagination
        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .populate('agentId', 'nom prenom email')
                .populate({
                    path: 'subscriptions.student',
                    select: 'nom prenom numero'
                })
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Transaction.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unknown error occurred' 
            },
            { status: 500 }
        );
    }
}

//Update a transaction
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { amount, agentId, productId, productType, status, subscriptions } = body;

        // Vérifier si la transaction existe
        const existingTransaction = await Transaction.findById(id);
        if (!existingTransaction) {
            return NextResponse.json(
                { success: false, error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Préparer les données de mise à jour
        const updateData: any = {};
        if (amount !== undefined) updateData.amount = amount;
        if (agentId !== undefined) updateData.agentId = agentId;
        if (productId !== undefined) updateData.productId = productId;
        if (productType !== undefined) updateData.productType = productType;
        if (status !== undefined) updateData.status = status;
        if (subscriptions !== undefined) updateData.subscriptions = subscriptions;

        // Mettre à jour la transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('agentId', 'nom prenom email')
         .populate({
             path: 'subscriptions.student',
             select: 'nom prenom numero'
         });

        // Si le productId ou productType a changé, mettre à jour l'ancienne et la nouvelle référence
        if (productId || productType) {
            // Supprimer la référence de l'ancien produit
            if (existingTransaction.productType && existingTransaction.productId) {
                await updateProductReference(existingTransaction.productType, existingTransaction.productId, null);
            }

            // Ajouter la référence au nouveau produit
            if (updatedTransaction!.productType && updatedTransaction!.productId) {
                await updateProductReference(updatedTransaction!.productType, updatedTransaction!.productId, updatedTransaction!._id);
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedTransaction,
            message: 'Transaction updated successfully'
        });

    } catch (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unknown error occurred' 
            },
            { status: 500 }
        );
    }
}

//Delete a transaction
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        await initializeModels();

        const id = (await request.json()).transactionId;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        // Vérifier si la transaction existe
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return NextResponse.json(
                { success: false, error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Empêcher la suppression des transactions complétées (optionnel)
        if (transaction.status === 'Completed') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Cannot delete a completed transaction. Consider changing status to Failed instead.' 
                },
                { status: 400 }
            );
        }

        // Supprimer la référence de la transaction dans le produit associé
        if (transaction.productType && transaction.productId) {
            await updateProductReference(transaction.productType, transaction.productId, null);
        }

        // Supprimer la transaction
        await Transaction.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Transaction deleted successfully',
            deletedId: id
        });

    } catch (error) {
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unknown error occurred' 
            },
            { status: 500 }
        );
    }
}

// Fonction utilitaire pour mettre à jour les références de transaction dans les produits
async function updateProductReference(productType: string, productId: Types.ObjectId, transactionId: Types.ObjectId | null) {
    try {
        let model: any;
        
        switch (productType) {
            case 'Inscription':
                model = Parcours;
                break;
            case 'Ressource':
                model = Resource;
                break;
            case 'Activity':
                model = Activity;
                break;
            case 'Recours':
                model = Recours;
                break;
            case 'Bulletin':
                model = Commandes;
                break;
            // Ajoutez d'autres cas selon vos besoins
            default:
                return;
        }

        if (model) {
            const updateData = transactionId ? { transaction: transactionId } : { $unset: { transaction: 1 } };
            await model.findByIdAndUpdate(productId, updateData);
        }
    } catch (error) {
        console.error('Error updating product reference:', error);
        // Ne pas faire échouer la transaction principale pour cette erreur
    }
}
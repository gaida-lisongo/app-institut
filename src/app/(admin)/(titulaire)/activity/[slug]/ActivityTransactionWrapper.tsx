'use client';

import CreateTransactionForm from '@/components/transactions/CreateTransactionForm';
import TransactionDetails from '@/components/transactions/TransactionDetails';

interface ActivityTransactionWrapperProps {
    activityData: any;
}

const ActivityTransactionWrapper = ({ activityData }: ActivityTransactionWrapperProps) => {
    const createActivityTransaction = async ({
        amount,
        agentId,
        productType,
        productId,
    }: { 
        amount: number; 
        agentId?: string; 
        productType: string; 
        productId: string; 
    }) => {
        try {
            const req = await fetch('/api/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    agentId,
                    productType,
                    productId,
                }),
            });
            
            if (!req.ok) {
                throw new Error('Failed to create transaction');
            }
            
            const resp = await req.json();
            if (!resp.success) {
                throw new Error(resp.error || 'Failed to create transaction');
            }
            
            // Refresh the page to show the new transaction
            window.location.reload();
            
            return resp.data;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    };

    if (activityData?.transaction) {
        // Details de la transaction liée à l'activité et des étudiants qui y ont souscrit
        return (
            <div className="mt-6">
                <TransactionDetails
                    transaction={activityData.transaction}
                    title="Transaction Active"
                    showActions={true}
                    onEdit={(transaction) => {
                        // TODO: Implémenter la modification de transaction
                        console.log('Edit transaction:', transaction);
                    }}
                    onDelete={(transactionId) => {
                        // TODO: Implémenter la suppression de transaction
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
                            console.log('Delete transaction:', transactionId);
                        }
                    }}
                    onUpdateStatus={async (transactionId, status) => {
                        try {
                            const req = await fetch('/api/transaction', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    id: transactionId,
                                    status: status,
                                }),
                            });
                            
                            if (req.ok) {
                                window.location.reload();
                            }
                        } catch (error) {
                            console.error('Error updating status:', error);
                        }
                    }}
                />
            </div>
        );
    }

    // Formulaire pour créer une transaction liée à cette activité
    return (
        <div className="mt-6">
            <CreateTransactionForm
                productId={activityData._id}
                productType="Activity"
                productTitle={activityData.title}
                productDescription={`${activityData.type} - ${activityData.maximumScore} points`}
                onCreateTransaction={createActivityTransaction}
            />
        </div>
    );
};

export default ActivityTransactionWrapper;
import { useState, useCallback } from 'react';

export interface RechargeData {
    etudiantId: string;
    amount: number;
    currency: string;
    phone: string;
    description?: string;
}

export interface RechargeResponse {
    success: boolean;
    message: string;
    data?: {
        rechargeId: string;
        orderNumber: string;
        amount: number;
        currency: string;
        status: string;
        paymentData?: any;
    };
    error?: string;
}

export interface RechargeStatus {
    orderNumber: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    newBalance?: number;
    completedAt?: string;
    reason?: string;
}

export const useRecharge = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Créer une nouvelle recharge
    const createRecharge = useCallback(async (data: RechargeData): Promise<RechargeResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/recharge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la création de la recharge');
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Vérifier le statut d'une recharge
    const checkRechargeStatus = useCallback(async (orderNumber: string): Promise<RechargeStatus | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/recharge/${orderNumber}/status`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la vérification du statut');
            }

            return result.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Récupérer l'historique des recharges d'un étudiant
    const getRechargeHistory = useCallback(async (etudiantId: string, page: number = 1, limit: number = 10) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                etudiantId,
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await fetch(`/api/recharge?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la récupération de l\'historique');
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Polling pour vérifier le statut d'une recharge
    const pollRechargeStatus = useCallback(async (
        orderNumber: string,
        onStatusChange: (status: RechargeStatus) => void,
        maxAttempts: number = 30,
        interval: number = 5000
    ): Promise<void> => {
        let attempts = 0;

        const poll = async () => {
            if (attempts >= maxAttempts) {
                setError('Timeout: Vérification du paiement expirée');
                return;
            }

            attempts++;
            const status = await checkRechargeStatus(orderNumber);
            
            if (status) {
                onStatusChange(status);
                
                // Arrêter le polling si le statut est final
                if (['completed', 'failed', 'cancelled'].includes(status.status)) {
                    return;
                }
            }

            // Continuer le polling
            setTimeout(poll, interval);
        };

        await poll();
    }, [checkRechargeStatus]);

    // Valider les données de recharge
    const validateRechargeData = useCallback((data: RechargeData): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        // Validation du montant
        if (!data.amount || data.amount <= 0) {
            errors.push('Le montant doit être supérieur à 0');
        }

        // Validation de la devise
        const supportedCurrencies = ['USD', 'CDF', 'EUR'];
        if (!supportedCurrencies.includes(data.currency)) {
            errors.push('Devise non supportée');
        }

        // Validation du téléphone (format 243XXXXXXXXX)
        const phoneRegex = /^243[0-9]{9}$/;
        if (!phoneRegex.test(data.phone.replace(/\s+/g, ''))) {
            errors.push('Numéro de téléphone invalide - Format attendu: 243XXXXXXXXX');
        }

        // Validation de l'étudiant ID
        if (!data.etudiantId) {
            errors.push('ID étudiant requis');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }, []);

    // Formater un numéro de téléphone
    const formatPhone = useCallback((phone: string): string => {
        // Récupérer les 9 derniers chiffres
        let cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
        console.log("Phone of user : ", cleanPhone);
        cleanPhone = cleanPhone.slice(-9);
        console.log("Phone of user formatted : ", cleanPhone);
        
        // Vérifier qu'on a bien 9 chiffres
        if (cleanPhone.length !== 9) {
            console.error("Erreur: Le numéro doit contenir exactement 9 chiffres après formatage");
            return phone; // Retourner le numéro original en cas d'erreur
        }
        
        return '243' + cleanPhone;
    }, []);

    return {
        loading,
        error,
        createRecharge,
        checkRechargeStatus,
        getRechargeHistory,
        pollRechargeStatus,
        validateRechargeData,
        formatPhone,
        clearError: () => setError(null)
    };
};

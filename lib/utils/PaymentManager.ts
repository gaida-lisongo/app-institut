// Utilitaire pour gérer les paiements avec FlexPay
export interface CreateTransactionParams {
    amount: number;
    currency: string;
    reference: string;
    phone: string;
    description?: string;
}

export interface CheckTransactionParams {
    orderNumber: string;
}

export interface PaymentResponse {
    success: boolean;
    orderNumber?: string;
    transactionId?: string;
    status?: string;
    message?: string;
    data?: any;
}

class PaymentManager {
    private payment: string;
    private check: string;
    private token: string;
    private merchant: string;

    constructor() {
        this.payment = process.env.FLEX_HOST || '';
        this.check = process.env.FLEX_CHECK || '';
        this.token = process.env.FLEX_TOKEN || '';
        this.merchant = process.env.FLEX_MERCHANT || '';

        // Vérification des variables d'environnement
        if (!this.payment || !this.check || !this.token || !this.merchant) {
            console.warn('Variables d\'environnement FlexPay manquantes');
        }
    }

    /**
     * Créer une nouvelle transaction de paiement
     */
    async createTransaction(params: CreateTransactionParams, cb: (data: any) => void): Promise<PaymentResponse> {
        const { amount, currency, reference, phone, description = "Recharge de compte étudiant" } = params;

        const payload = {
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
            merchant: this.merchant,
            amount: amount,
            currency: currency,
            description: description,
            type: "1",
            reference: reference,
            phone: phone
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${this.token}`
            },
            body: JSON.stringify(payload)
        };

        console.log("🔄 Création de transaction:", {
            amount,
            currency,
            reference,
            phone: phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') // Masquer le numéro
        });

        try {
            const response = await fetch(this.payment, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Brut data from flex : ", data);
            await cb(data)

            console.log("✅ Réponse FlexPay:", {
                success: data.success || false,
                orderNumber: data.orderNumber,
                status: data.status
            });

            return {
                success: data.code == '0' ? true : false,
                orderNumber: data.orderNumber,
                transactionId: data.code,
                status: data.status,
                message: data.message,
                data: data
            };
        } catch (error) {
            console.error('❌ Erreur création transaction:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Vérifier le statut d'une transaction
     */
    async checkTransaction(params: CheckTransactionParams, cb: (data: any) => void): Promise<PaymentResponse> {
        const { orderNumber } = params;
        const url = `${this.check}${orderNumber}`;
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            }
        };

        console.log("🔍 Vérification transaction:", orderNumber);

        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            await cb(data);

            return {
                success: data.success || false,
                orderNumber: data.orderNumber || orderNumber,
                transactionId: data.transactionId,
                status: data.status,
                message: data.message,
                data: data
            };
        } catch (error) {
            console.error('❌ Erreur vérification transaction:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Valider le montant
     */
    validateAmount(amount: number, currency: string = 'USD'): { valid: boolean; message?: string } {
        if (amount <= 0) {
            return { valid: false, message: 'Le montant doit être supérieur à 0' };
        }

        // Limites par devise
        const limits = {
            USD: { min: 1, max: 10000 },
            CDF: { min: 1000, max: 10000000 },
            EUR: { min: 1, max: 10000 }
        };

        const limit = limits[currency as keyof typeof limits];
        if (!limit) {
            return { valid: false, message: 'Devise non supportée' };
        }

        if (amount < limit.min || amount > limit.max) {
            return { 
                valid: false, 
                message: `Montant doit être entre ${limit.min} et ${limit.max} ${currency}` 
            };
        }

        return { valid: true };
    }

    /**
     * Générer une référence unique
     */
    generateReference(prefix: string = 'RCH'): string {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}${timestamp.slice(-6)}${random}`;
    }

    /**
     * Vérifier la configuration
     */
    isConfigured(): boolean {
        return !!(this.payment && this.check && this.token && this.merchant);
    }

    /**
     * Obtenir les devises supportées
     */
    getSupportedCurrencies(): string[] {
        return ['USD', 'CDF', 'EUR'];
    }
}

// Instance singleton
const paymentManager = new PaymentManager();

export default paymentManager;
export { PaymentManager };

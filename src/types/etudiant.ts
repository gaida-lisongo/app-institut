
export interface Recharge {
  _id: string;
  orderNumber: string;
  currency: string;
  phone: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  etudiantId: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Etudiant {
  _id: string;
  nom: string;
  post_nom: string;
  prenom?: string;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  solde?: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RechargeStats {
  total: number;
  totalAmount: number;
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  pendingAmount: number;
  completedAmount: number;
}
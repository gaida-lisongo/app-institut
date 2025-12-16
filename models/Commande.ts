import mongoose, { Schema, Document, Model } from "mongoose";
import Parcours from "./Parcours";

export interface ICommande extends Document {
    etudiantId: mongoose.Types.ObjectId;
    promotionId: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    montant: number;
    produit: string;
    statut: string
}

const CommandeSchema = new Schema<ICommande>({
    etudiantId: { type: Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion', required: true },
    anneeId: { type: Schema.Types.ObjectId, ref: 'Annee', required: true },
    montant: Number,
    statut: { type: String, enum: ['En cours', 'Terminé', 'Annulé'], default: 'En cours' },
})

const Commandes: Model<ICommande> = mongoose.models.Commandes || mongoose.model<ICommande>('Commandes', CommandeSchema);

export default Commandes;
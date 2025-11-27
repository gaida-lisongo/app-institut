import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParcours extends Document {
    etudiantId: mongoose.Types.ObjectId;
    promotionId: mongoose.Types.ObjectId;
    anneeId: mongoose.Types.ObjectId;
    statut: string
}

const ParcoursSchema = new Schema<IParcours>({
    etudiantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
    anneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Annee', required: true },
    statut: { type: String, enum: ['En cours', 'Terminé', 'Annulé'], default: 'En cours' }
});

ParcoursSchema.index({ etudiantId: 1, promotionId: 1, anneeId: 1 }, { unique: true });


// Modèle
const Parcours: Model<IParcours> = mongoose.models.Parcours || mongoose.model<IParcours>('Parcours', ParcoursSchema);

export default Parcours;

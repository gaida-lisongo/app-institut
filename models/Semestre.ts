import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { Promotion } from './Mention';

// Interface pour Matiere
export interface IMatiere extends Document {
    designation: string;
    code: string;
    descriptions?: string;
    credits: number;
    createdAt: Date;
    updatedAt: Date;
}

// Interface pour Unite
export interface IUnite extends Document {
    designation: string;
    code: string;
    descriptions?: string;
    credits: number;
    matieres: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

// Interface pour Semestre
export interface ISemestre extends Document {
    designation: string;
    credits: number;
    unites: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

// Interface pour les méthodes statiques du modèle Semestre
export interface ISemestreModel extends Model<ISemestre> {
    createSemestreWithPromotionId(data: {designation: string, credits?: number, unites?: Types.ObjectId[]}, promotionId: string): Promise<ISemestre>;
}

// Schéma Matiere
const MatiereSchema = new Schema<IMatiere>({
    designation: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    descriptions: {
        type: String,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    }
}, {
    timestamps: true
});

// Schéma Unite
const UniteSchema = new Schema<IUnite>({
    designation: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    descriptions: {
        type: String,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 30
    },
    matieres: [{
        type: Schema.Types.ObjectId,
        ref: 'Matiere'
    }]
}, {
    timestamps: true
});

// Schéma Semestre
const SemestreSchema = new Schema<ISemestre>({
    designation: {
        type: String,
        required: true,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 60
    },
    unites: [{
        type: Schema.Types.ObjectId,
        ref: 'Unite'
    }]
}, {
    timestamps: true
});

// Index pour optimiser les recherches
MatiereSchema.index({ code: 1 });
MatiereSchema.index({ designation: 1 });

UniteSchema.index({ code: 1 });
UniteSchema.index({ designation: 1 });

SemestreSchema.index({ designation: 1 });

// Middleware pour calculer automatiquement les crédits
UniteSchema.pre('save', async function(this: IUnite) {
    if (this.matieres && this.matieres.length > 0) {
        const matieres = await mongoose.model('Matiere').find({ _id: { $in: this.matieres } });
        this.credits = matieres.reduce((total: number, matiere: any) => total + matiere.credits, 0);
    }
});

SemestreSchema.pre('save', async function(this: ISemestre) {
    if (this.unites && this.unites.length > 0) {
        const unites = await mongoose.model('Unite').find({ _id: { $in: this.unites } });
        this.credits = unites.reduce((total: number, unite: any) => total + unite.credits, 0);
    }
});

//Methode Statitique to create semestre with Promotion id
SemestreSchema.statics.createSemestreWithPromotionId = async function(data: {designation: string, credits?: number, unites?: Types.ObjectId[]}, promotionId: string) {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
        throw new Error('Promotion non trouvée');
    }
    
    // Créer le semestre avec les données fournies
    const semestreData = {
        designation: data.designation,
        credits: data.credits || 0,
        unites: data.unites || []
    };
    
    const semestre = new this(semestreData);
    const savedSemestre = await semestre.save();

    // Ajouter le semestre à la promotion
    if (!promotion.semestres) {
        promotion.semestres = [savedSemestre._id];
    } else {
        promotion.semestres.push(savedSemestre._id);
    }
    await promotion.save();

    return savedSemestre;
};

// Modèles
const Matiere = mongoose.models.Matiere || mongoose.model<IMatiere>('Matiere', MatiereSchema);
const Unite = mongoose.models.Unite || mongoose.model<IUnite>('Unite', UniteSchema);
const Semestre = (mongoose.models.Semestre || mongoose.model<ISemestre, ISemestreModel>('Semestre', SemestreSchema)) as ISemestreModel;

export { Matiere, Unite, Semestre };
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParcours extends Document {
    designation: string;
    description?: string;
    code: string;
    duree: number; // en années
    credits: number;
    niveau: 'Licence' | 'Master' | 'Doctorat' | 'Graduat';
    faculteId?: mongoose.Types.ObjectId;
    departementId?: mongoose.Types.ObjectId;
    isActive: boolean;
    prerequis?: string[];
    objectifs?: string[];
    debouches?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Schema pour les parcours
const ParcoursSchema = new Schema<IParcours>({
    designation: { 
        type: String, 
        required: [true, 'La désignation est requise'],
        trim: true,
        maxlength: [200, 'La désignation ne peut pas dépasser 200 caractères']
    },
    description: { 
        type: String,
        trim: true,
        maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
    },
    code: { 
        type: String, 
        required: [true, 'Le code est requis'],
        unique: true,
        uppercase: true,
        trim: true,
        validate: {
            validator: function(v: string) {
                return /^[A-Z]{2,6}\d{2,4}$/.test(v);
            },
            message: 'Le code doit suivre le format: 2-6 lettres suivies de 2-4 chiffres (ex: INFO2024)'
        }
    },
    duree: { 
        type: Number, 
        required: [true, 'La durée est requise'],
        min: [1, 'La durée doit être d\'au moins 1 an'],
        max: [10, 'La durée ne peut pas dépasser 10 ans']
    },
    credits: { 
        type: Number, 
        required: [true, 'Le nombre de crédits est requis'],
        min: [30, 'Le nombre de crédits doit être d\'au moins 30'],
        max: [500, 'Le nombre de crédits ne peut pas dépasser 500']
    },
    niveau: { 
        type: String, 
        required: [true, 'Le niveau est requis'],
        enum: {
            values: ['Licence', 'Master', 'Doctorat', 'Graduat'],
            message: 'Le niveau doit être: Licence, Master, Doctorat ou Graduat'
        }
    },
    faculteId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Faculte'
    },
    departementId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Departement'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    prerequis: [{
        type: String,
        trim: true,
        maxlength: [200, 'Chaque prérequis ne peut pas dépasser 200 caractères']
    }],
    objectifs: [{
        type: String,
        trim: true,
        maxlength: [300, 'Chaque objectif ne peut pas dépasser 300 caractères']
    }],
    debouches: [{
        type: String,
        trim: true,
        maxlength: [200, 'Chaque débouché ne peut pas dépasser 200 caractères']
    }]
}, {
    timestamps: true
});

// Index pour optimiser les recherches
ParcoursSchema.index({ code: 1 });
ParcoursSchema.index({ designation: 1 });
ParcoursSchema.index({ niveau: 1 });
ParcoursSchema.index({ faculteId: 1 });
ParcoursSchema.index({ departementId: 1 });
ParcoursSchema.index({ isActive: 1 });
ParcoursSchema.index({ designation: 'text', description: 'text' });

// Middleware pour valider les données avant sauvegarde
ParcoursSchema.pre('save', function(next) {
    // Générer un code automatique si non fourni
    if (!this.code) {
        const designationParts = this.designation.split(' ');
        const acronym = designationParts.map(part => part.charAt(0)).join('').toUpperCase();
        const year = new Date().getFullYear().toString().slice(-2);
        this.code = `${acronym}${year}`;
    }
    
    // Valider la cohérence niveau/durée/crédits
    if (this.niveau === 'Graduat' && this.duree > 3) {
        return next(new Error('Un graduat ne peut pas dépasser 3 ans'));
    }
    if (this.niveau === 'Licence' && (this.duree < 3 || this.duree > 4)) {
        return next(new Error('Une licence doit durer entre 3 et 4 ans'));
    }
    if (this.niveau === 'Master' && (this.duree < 1 || this.duree > 3)) {
        return next(new Error('Un master doit durer entre 1 et 3 ans'));
    }
    
    next();
});

// Méthodes d'instance
ParcoursSchema.methods.activate = function() {
    this.isActive = true;
    return this.save();
};

ParcoursSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

ParcoursSchema.methods.addObjectif = function(objectif: string) {
    this.objectifs = this.objectifs || [];
    this.objectifs.push(objectif);
    return this.save();
};

ParcoursSchema.methods.addDebouche = function(debouche: string) {
    this.debouches = this.debouches || [];
    this.debouches.push(debouche);
    return this.save();
};

ParcoursSchema.methods.addPrerequis = function(prerequis: string) {
    this.prerequis = this.prerequis || [];
    this.prerequis.push(prerequis);
    return this.save();
};

// Méthodes statiques
ParcoursSchema.statics.findByCode = function(code: string) {
    return this.findOne({ code: code.toUpperCase() });
};

ParcoursSchema.statics.findByNiveau = function(niveau: string) {
    return this.find({ niveau, isActive: true }).sort({ designation: 1 });
};

ParcoursSchema.statics.findByFaculte = function(faculteId: string) {
    return this.find({ faculteId, isActive: true }).sort({ designation: 1 });
};

ParcoursSchema.statics.findByDepartement = function(departementId: string) {
    return this.find({ departementId, isActive: true }).sort({ designation: 1 });
};

ParcoursSchema.statics.searchByName = function(searchTerm: string) {
    const regex = new RegExp(searchTerm, 'i');
    return this.find({
        $or: [
            { designation: regex },
            { description: regex },
            { code: regex }
        ],
        isActive: true
    }).sort({ designation: 1 });
};

ParcoursSchema.statics.getStatistics = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$niveau',
                count: { $sum: 1 },
                totalCredits: { $sum: '$credits' },
                avgDuree: { $avg: '$duree' }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

ParcoursSchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ designation: 1 });
};

ParcoursSchema.statics.findInactive = function() {
    return this.find({ isActive: false }).sort({ designation: 1 });
};

// Méthode pour insertion en lot (insertMany)
ParcoursSchema.statics.insertMany = function(parcours: Partial<IParcours>[]) {
    return this.create(parcours);
};

// Modèle
const Parcours: Model<IParcours> = mongoose.models.Parcours || mongoose.model<IParcours>('Parcours', ParcoursSchema);

export default Parcours;

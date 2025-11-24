import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import crypto from 'crypto';

// 1. Définir l'Interface pour les propriétés du Document
export interface IAgent extends Document {
  nom: string;
  post_nom: string;
  prenom?: string;
  grade: Types.ObjectId;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  email?: string;
  telephone?: string
}

export interface AgentData {
  _id?: string;
  nom: string;
  post_nom: string;
  prenom?: string;
  grade: string;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  email?: string;
  telephone?: string
}

export interface CreateAgentData {
  nom: string;
  post_nom: string;
  prenom?: string;
  grade: string;
  matricule: string;
  secure: string;
  sexe: 'M' | 'F';
  email?: string;
  telephone?: string
}

export interface AgentModel extends Model<IAgent> {
  // Add any static methods here if needed
}

/* Définition du Schéma */
const AgentSchema: Schema = new Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez ajouter un nom.'],
    maxlength: [60, 'Le nom ne peut pas dépasser 60 caractères.'],
  },
  post_nom: {
    type: String,
    required: [true, 'Veuillez ajouter un post nom.'],
    maxlength: [60, 'Le post nom ne peut pas dépasser 60 caractères.'],
  },
  prenom: {
    type: String,
    required: false,
    maxlength: [60, 'Le prenom ne peut pas dépasser 60 caractères.'],
  },
  grade: {
    type: Schema.Types.ObjectId,
    ref: 'Grade',
    required: [true, 'Veuillez ajouter un grade.'],
  },
  matricule: {
    type: String,
    required: [true, 'Veuillez ajouter un matricule.'],
    maxlength: [60, 'Le matricule ne peut pas dépasser 60 caractères.'],
  },
  secure: {
    type: String,
    required: [true, 'Veuillez ajouter un secure.'],
    maxlength: [60, 'Le secure ne peut pas dépasser 60 caractères.'],
  },
  sexe: {
    type: String,
    required: [true, 'Veuillez ajouter un sexe.'],
    maxlength: [60, 'Le sexe ne peut pas dépasser 60 caractères.'],
  },
  email: {
    type: String,
    required: false,
    maxlength: [60, 'Le email ne peut pas dépasser 60 caractères.'],
  },
  telephone: {
    type: String,
    required: false,
    maxlength: [60, 'Le telephone ne peut pas dépasser 60 caractères.'],
  },
}, {
    timestamps: true // Ajoute `createdAt` et `updatedAt` automatiquement
});

// Middleware pour nettoyer les chaînes vides avant validation
AgentSchema.pre('validate', function (next: any) {
    // Convertir les chaînes vides en undefined pour les champs optionnels
    if (this.email === '') {
        this.email = undefined;
    }
    if (this.telephone === '') {
        this.telephone = undefined;
    }
    if (this.prenom === '') {
        this.prenom = undefined;
    }
    next();
});

//Middle ware save pour crypté secure en SHA256
AgentSchema.pre('save', function (next : any) {
    if (this.isModified('secure')) {
        this.secure = crypto.createHash('sha256').update(this.secure as string).digest('hex');
    }
    next();
});

// 3. Exporter le Modèle Typé
const Agent = (mongoose.models.Agent || mongoose.model<IAgent, AgentModel>('Agent', AgentSchema)) as AgentModel;

export default Agent;
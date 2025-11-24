// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Définir l'Interface pour les propriétés du Document
export interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

// 2. Définir l'Interface pour le Modèle Mongoose
// Ceci ajoute les méthodes statiques/d'instance si vous en définissez
export interface UserModel extends Model<IUser> {}

/* Définition du Schéma */
const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Veuillez ajouter un nom.'],
    maxlength: [60, 'Le nom ne peut pas dépasser 60 caractères.'],
  },
  email: {
    type: String,
    required: [true, 'Veuillez ajouter un email.'],
    unique: true,
    index: true, // Bonne pratique pour les champs de recherche
  },
}, {
    timestamps: true // Ajoute `createdAt` et `updatedAt` automatiquement
});


// 3. Exporter le Modèle Typé
const User = (mongoose.models.User || mongoose.model<IUser, UserModel>('User', UserSchema)) as UserModel;

export default User;
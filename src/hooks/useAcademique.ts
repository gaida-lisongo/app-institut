import { useContext } from 'react';

// Types
export interface Filiere {
  _id: string;
  designation: string;
  description: string;
  bureau: any[];
  promotions: any[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademiqueContextType {
  filieres: Filiere[];
  selectedFiliere: Filiere | null;
  setSelectedFiliere: (filiere: Filiere | null) => void;
  loading: boolean;
  error: string | null;
  refreshFilieres: () => void;
}

// Note: Le contexte réel est défini dans le layout académique
// Ce fichier sert uniquement pour les types et l'export
export { useAcademique } from '@/app/(admin)/(academique)/layout';

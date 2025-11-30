'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JuryAnnee, JuryPromotion, Semestre, Filiere } from '@/types/jury';

// Context State
interface PromotionContextState {
  selectedAnnee: JuryAnnee | null;
  selectedPromotion: JuryPromotion | null;
  selectedSemestre: Semestre | null;
  promotions: JuryPromotion[];
  annees: JuryAnnee[];
  filieres: Filiere[];
  setSelectedAnnee: (annee: JuryAnnee | null) => void;
  setSelectedPromotion: (promotion: JuryPromotion | null) => void;
  setSelectedSemestre: (semestre: Semestre | null) => void;
  setPromotions: (promotions: JuryPromotion[]) => void;
  setAnnees: (annees: JuryAnnee[]) => void;
  setFilieres: (filieres: Filiere[]) => void;
}

// Create Context
const PromotionContext = createContext<PromotionContextState | undefined>(undefined);

// Provider Component
interface PromotionProviderProps {
  children: ReactNode;
  initialPromotions?: JuryPromotion[];
  initialAnnees?: JuryAnnee[];
  initialFilieres?: Filiere[];
}

export const PromotionProvider: React.FC<PromotionProviderProps> = ({ 
  children, 
  initialPromotions = [], 
  initialAnnees = [],
  initialFilieres = []
}) => {
  const [selectedAnnee, setSelectedAnnee] = useState<JuryAnnee | null>(
    initialAnnees.find(a => a.isActive) || null
  );
  const [selectedPromotion, setSelectedPromotion] = useState<JuryPromotion | null>(null);
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(null);
  const [promotions, setPromotions] = useState<JuryPromotion[]>(initialPromotions);
  const [annees, setAnnees] = useState<JuryAnnee[]>(initialAnnees);
  const [filieres, setFilieres] = useState<Filiere[]>(initialFilieres);

  const value: PromotionContextState = {
    selectedAnnee,
    selectedPromotion,
    selectedSemestre,
    promotions,
    annees,
    filieres,
    setSelectedAnnee,
    setSelectedPromotion,
    setSelectedSemestre,
    setPromotions,
    setAnnees,
    setFilieres,
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
};

// Hook to use the context
export const usePromotion = (): PromotionContextState => {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};

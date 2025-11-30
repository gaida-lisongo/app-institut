// Types pour le système de jury
export interface JuryAnnee {
  _id: string;
  debut: number;
  fin: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Matiere {
  _id: string;
  designation: string;
  code: string;
  credits: number;
  coefficient: number;
}

export interface Unite {
  _id: string;
  designation: string;
  code: string;
  credits: number;
  matieres: Matiere[];
}

export interface Semestre {
  _id: string;
  designation: string;
  numero: number;
  unites: Unite[];
}

export interface JuryPromotion {
  _id: string;
  designation: string;
  systeme: string;
  niveau: string;
  cycle: string;
  semestres: Semestre[];
}

export interface Agent {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface BureauMember {
  agent: Agent;
  role: string;
}

export interface Filiere {
  _id: string;
  designation: string;
  description?: string;
  bureau: BureauMember[];
  promotions: JuryPromotion[];
}

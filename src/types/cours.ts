

// Types
export interface Unite {
  _id: string;
  designation: string;
  code: string;
  descriptions?: string;
  credits: number;
  filiereId: string;
  matieres: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Matiere {
  _id: string;
  designation: string;
  code: string;
  descriptions?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

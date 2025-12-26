import { Annee } from '@/app/(admin)/(appariteur)/inscriptions/[cycle]/page';
import { baseUrl } from '@/app/(admin)/page';
import { Matiere } from '@/types/cours';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types pour le store
export interface Grade {
  _id: string;
  code: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Agent {
  _id: string;
  photo?: string;
  nom: string;
  post_nom: string;
  prenom: string;
  grade: Grade;
  matricule: string;
  secure: string;
  solde: number;
  sexe: string;
  email: string;
  telephone: string;
  adresse: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ChargeHoraire {
  _id: string;
  cours: Matiere;
  enseignant: Agent;
  anneeId: Annee;
  promotionId: string;
  status: string;
  objectif: string;
  activities: any[];
  ressources: any[];
  recours: any[];
  seances: any[];
  contenu: string;
  methodologie: string;
  evaluation: string;
  references: string;
  plannings: {
      date_debut: Date;
      date_fin: Date;
      heure_debut: string;
      heure_fin: string;
  }[];

}

export interface Autorisation {
  _id: string;
  designation: string;
}

export interface UserState {
  // État
  agent: Agent | null;
  autorisations: Autorisation[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  chargesHoraire: any[] | null;
  
  // Actions de base
  setUser: (agent: Agent, autorisations: Autorisation[]) => void;
  updateAgent: (agent: Partial<Agent>) => void;
  updatePhoto: (photFile: File) => Promise<void>;
  addAutorisation: (autorisation: Autorisation) => void;
  removeAutorisation: (autorisationId: string) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setChargesHoraire: (charges: any[] | null) => void;
  fetchChargesHoraire: (enseignantId: string) => Promise<void>;
  updateCharge: (chargeId: string, data: any) => Promise<boolean>;
  
  // Actions pour les activités
  addActivity: (chargeId: string, activityData: any) => Promise<boolean>;
  updateActivity: (chargeId: string, activityId: string, activityData: any) => Promise<boolean>;
  deleteActivity: (chargeId: string, activityId: string) => Promise<boolean>;

  // Actions pour les séances
  addSeance: (chargeId: string, seanceData: any) => Promise<boolean>;
  updateSeance: (chargeId: string, seanceId: string, seanceData: any) => Promise<boolean>;
  deleteSeance: (chargeId: string, seanceId: string) => Promise<boolean>;
  
  // Actions d'authentification
  authenticateAgent: (agentId: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  
  // Getters utilitaires
  hasAutorisation: (designation: string) => boolean;
  getFullName: () => string;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // État initial
      agent: null,
      autorisations: [],
      isAuthenticated: false,
      loading: false,
      error: null,
      chargesHoraire: null,

      // Actions de base
      setUser: (agent: Agent, autorisations: Autorisation[]) => {
        set({
          agent,
          autorisations,
          isAuthenticated: true,
          error: null,
        });
      },

      fetchChargesHoraire: async (enseignantId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/charges?enseignantId=${enseignantId}`);
          const result = await response.json();
          if (response.ok) {
            console.log("Charges horaires récupérées :", result.data);
            set({ chargesHoraire: result.data, loading: false });
          } else {
            console.error("Erreur lors de la récupération des charges horaires :", result.error);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des charges horaires :", error);
          set({ error: 'Erreur lors de la récupération des charges horaires' });
        } finally {
          set({ loading: false });
        }
      },

      setChargesHoraire(charges) {
        try {
          set({ chargesHoraire: charges });
        } catch (error) {
          console.error('Erreur lors de la mise à jour des charges horaires :', error);
        }
      },

      updateCharge: async (chargeId: string, data: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/charges', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: chargeId, ...data })
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Mettre à jour le store localement
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => 
                c._id === chargeId ? result.data : c
              );
              set({ chargesHoraire: updatedCharges, loading: false });
            } else {
              set({ loading: false });
            }
            return true;
          } else {
            set({ error: result.error || 'Erreur lors de la mise à jour', loading: false });
            return false;
          }
        } catch (error) {
          console.error('Erreur updateCharge:', error);
          set({ error: 'Erreur de connexion', loading: false });
          return false;
        }
      },

      // Activités
      addActivity: async (chargeId: string, activityData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/charges/activites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...activityData, chargeId })
          });
          const result = await response.json();
          
          if (result.success) {
            // Mettre à jour la charge dans le store
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => {
                if (c._id === chargeId) {
                  return { ...c, activities: [result.data, ...(c.activities || [])] };
                }
                return c;
              });
              set({ chargesHoraire: updatedCharges, loading: false });
            }
            return true;
          }
          set({ error: result.error, loading: false });
          return false;
        } catch (error) {
          set({ error: 'Erreur connexion', loading: false });
          return false;
        }
      },

      updateActivity: async (chargeId: string, activityId: string, activityData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/charges/activites', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: activityId, ...activityData })
          });
          const result = await response.json();
          
          if (result.success) {
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => {
                if (c._id === chargeId) {
                  const updatedActivities = (c.activities || []).map((a: any) => 
                    a._id === activityId ? result.data : a
                  );
                  return { ...c, activities: updatedActivities };
                }
                return c;
              });
              set({ chargesHoraire: updatedCharges, loading: false });
            }
            return true;
          }
          set({ error: result.error, loading: false });
          return false;
        } catch (error) {
          set({ error: 'Erreur connexion', loading: false });
          return false;
        }
      },

      deleteActivity: async (chargeId: string, activityId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/charges/activites?id=${activityId}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          
          if (result.success) {
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => {
                if (c._id === chargeId) {
                  return { 
                    ...c, 
                    activities: (c.activities || []).filter((a: any) => a._id !== activityId) 
                  };
                }
                return c;
              });
              set({ chargesHoraire: updatedCharges, loading: false });
            }
            return true;
          }
          set({ error: result.error, loading: false });
          return false;
        } catch (error) {
          set({ error: 'Erreur connexion', loading: false });
          return false;
        }
      },

      // Séances
      addSeance: async (chargeId: string, seanceData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/seances?chargeId=${chargeId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seanceData)
          });
          const result = await response.json();
          
          if (result.success) {
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => {
                if (c._id === chargeId) {
                  return { ...c, seances: [result.data, ...(c.seances || [])] };
                }
                return c;
              });
              set({ chargesHoraire: updatedCharges, loading: false });
            }
            return true;
          }
          set({ error: result.error, loading: false });
          return false;
        } catch (error) {
          set({ error: 'Erreur connexion', loading: false });
          return false;
        }
      },

      updateSeance: async (chargeId: string, seanceId: string, seanceData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/seances', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: seanceId, ...seanceData })
          });
          const result = await response.json();
          
          if (result.success) {
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => {
                if (c._id === chargeId) {
                  const updatedSeances = (c.seances || []).map((s: any) => 
                    s._id === seanceId ? result.data : s
                  );
                  return { ...c, seances: updatedSeances };
                }
                return c;
              });
              set({ chargesHoraire: updatedCharges, loading: false });
            }
            return true;
          }
          set({ error: result.error, loading: false });
          return false;
        } catch (error) {
          set({ error: 'Erreur connexion', loading: false });
          return false;
        }
      },

      deleteSeance: async (chargeId: string, seanceId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/seances?id=${seanceId}`, {
            method: 'DELETE'
          });
          const result = await response.json();
          
          if (result.success) {
            const currentCharges = get().chargesHoraire;
            if (currentCharges) {
              const updatedCharges = currentCharges.map(c => {
                if (c._id === chargeId) {
                  return { 
                    ...c, 
                    seances: (c.seances || []).filter((s: any) => s._id !== seanceId) 
                  };
                }
                return c;
              });
              set({ chargesHoraire: updatedCharges, loading: false });
            }
            return true;
          }
          set({ error: result.error, loading: false });
          return false;
        } catch (error) {
          set({ error: 'Erreur connexion', loading: false });
          return false;
        }
      },

      updateAgent: async(agentUpdate: Partial<Agent>) => {
        try {
          const currentAgent = get().agent;

          const updatedAgent = {
            ...currentAgent,
            ...agentUpdate,
          }

          const request = await fetch(`${baseUrl}/agents/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAgent),
          });

          const response = await request.json();
          console.log('updateAgent response:', response);

          if(response.success ) {
            set({
              agent: {...updatedAgent, _id: response.data._id } as Agent,
            });
          }
        } catch (error) {
          console.log("Erreur lors de la mise à jour de l'agent:", error);
        }
      },

      updatePhoto: async (photFile: File) => {
        try {
          const currentAgent = get().agent;
          if (!currentAgent) throw new Error('Aucun agent connecté');

          const formData = new FormData();
          formData.append('photo', photFile);
          formData.append('agentId', currentAgent._id);

          const request = await fetch(`${baseUrl}/agents/photo`, {
            method: 'PUT',  
            body: formData,
          });

          const response = await request.json();
          console.log('updatePhoto response:', response);

          if(response.success && response.data.photo ) {
            set({
              agent: { ...currentAgent, photo: response.data.photo },
            });
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la photo :', error);
        }
      },

      addAutorisation: (autorisation: Autorisation) => {
        const currentAutorisations = get().autorisations;
        const exists = currentAutorisations.some(auth => auth._id === autorisation._id);
        
        if (!exists) {
          set({
            autorisations: [...currentAutorisations, autorisation],
          });
        }
      },

      removeAutorisation: (autorisationId: string) => {
        const currentAutorisations = get().autorisations;
        set({
          autorisations: currentAutorisations.filter(auth => auth._id !== autorisationId),
        });
      },

      clearUser: () => {
        set({
          agent: null,
          autorisations: [],
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Actions d'authentification
      authenticateAgent: async (agentId: string) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ agentId }),
            credentials: 'include'
          });

          const result = await response.json();

          if (result.success) {
            // Persister les données dans le store
            set({
              agent: result.data.agent,
              autorisations: result.data.autorisations,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            return { success: true, data: result.data };
          } else {
            set({
              loading: false,
              error: result.error || 'Erreur d\'authentification',
            });
            return { success: false, error: result.error };
          }
        } catch (error: any) {
          const errorMessage = 'Erreur de connexion au serveur';
          set({
            loading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          set({ loading: true });

          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });

          // Nettoyer le store
          set({
            agent: null,
            autorisations: [],
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          // Nettoyer quand même le store local
          set({
            agent: null,
            autorisations: [],
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/api/auth/login', {
            method: 'GET',
            credentials: 'include'
          });

          const result = await response.json();

          if (result.success) {
            set({
              agent: result.data.agent || null,
              autorisations: result.data.autorisations || [],
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            return true;
          } else {
            set({
              agent: null,
              autorisations: [],
              isAuthenticated: false,
              loading: false,
              error: null,
            });
            return false;
          }
        } catch (error) {
          set({
            agent: null,
            autorisations: [],
            isAuthenticated: false,
            loading: false,
            error: 'Erreur de vérification d\'authentification',
          });
          return false;
        }
      },

      // Getters utilitaires
      hasAutorisation: (designation: string) => {
        const autorisations = get().autorisations;
        return autorisations.some(auth => 
          auth.designation.toLowerCase() === designation.toLowerCase()
        );
      },

      getFullName: () => {
        const agent = get().agent;
        if (!agent) return '';
        return `${agent.prenom} ${agent.nom} ${agent.post_nom}`.trim();
      },

      isAdmin: () => {
        return get().hasAutorisation('ADMINISTRATEUR');
      },

      isSuperAdmin: () => {
        return get().hasAutorisation('SUPER-ADMIN');
      },
    }),
    {
      name: 'user-storage', // Nom de la clé dans localStorage
      storage: createJSONStorage(() => localStorage),
      
      // Optionnel : personnaliser ce qui est persisté
      partialize: (state) => ({
        agent: state.agent,
        autorisations: state.autorisations,
        isAuthenticated: state.isAuthenticated,
      }),
      
      // Optionnel : version pour la migration des données
      version: 1,
      
      // Optionnel : fonction de migration si la structure change
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration depuis une version précédente si nécessaire
        }
        return persistedState as UserState;
      },
    }
  )
);

// Hook personnalisé pour des sélecteurs spécifiques (optimisation)
export const useAgent = () => useUserStore((state) => state.agent);
export const useAutorisations = () => useUserStore((state) => state.autorisations);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useUserStore((state) => state.loading);
export const useAuthError = () => useUserStore((state) => state.error);

// Hooks individuels pour éviter les boucles infinies
export const useSetUser = () => useUserStore((state) => state.setUser);
export const useUpdateAgent = () => useUserStore((state) => state.updateAgent);
export const useAddAutorisation = () => useUserStore((state) => state.addAutorisation);
export const useRemoveAutorisation = () => useUserStore((state) => state.removeAutorisation);
export const useClearUser = () => useUserStore((state) => state.clearUser);
export const useSetLoading = () => useUserStore((state) => state.setLoading);
export const useSetError = () => useUserStore((state) => state.setError);

// Actions d'authentification individuelles
export const useAuthenticateAgent = () => useUserStore((state) => state.authenticateAgent);
export const useLogout = () => useUserStore((state) => state.logout);
export const useCheckAuth = () => useUserStore((state) => state.checkAuth);

// Hooks groupés (sans shallow pour éviter les erreurs)
export const useUserActions = () => {
  const setUser = useUserStore((state) => state.setUser);
  const updateAgent = useUserStore((state) => state.updateAgent);
  const addAutorisation = useUserStore((state) => state.addAutorisation);
  const removeAutorisation = useUserStore((state) => state.removeAutorisation);
  const clearUser = useUserStore((state) => state.clearUser);
  const setLoading = useUserStore((state) => state.setLoading);
  const setError = useUserStore((state) => state.setError);
  
  return {
    setUser,
    updateAgent,
    addAutorisation,
    removeAutorisation,
    clearUser,
    setLoading,
    setError,
  };
};

export const useAuthActions = () => {
  const authenticateAgent = useUserStore((state) => state.authenticateAgent);
  const logout = useUserStore((state) => state.logout);
  const checkAuth = useUserStore((state) => state.checkAuth);
  
  return {
    authenticateAgent,
    logout,
    checkAuth,
  };
};

// Sélecteurs pour les vérifications d'autorisation avec mémoisation
export const useHasAutorisation = (designation: string) => 
  useUserStore((state) => state.hasAutorisation(designation));

export const useIsAdmin = () => useUserStore((state) => state.isAdmin());
export const useIsSuperAdmin = () => useUserStore((state) => state.isSuperAdmin());
export const useFullName = () => useUserStore((state) => state.getFullName());

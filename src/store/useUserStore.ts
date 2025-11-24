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
  nom: string;
  post_nom: string;
  prenom: string;
  grade: Grade;
  matricule: string;
  secure: string;
  sexe: string;
  email: string;
  telephone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  
  // Actions de base
  setUser: (agent: Agent, autorisations: Autorisation[]) => void;
  updateAgent: (agent: Partial<Agent>) => void;
  addAutorisation: (autorisation: Autorisation) => void;
  removeAutorisation: (autorisationId: string) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
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

      // Actions de base
      setUser: (agent: Agent, autorisations: Autorisation[]) => {
        set({
          agent,
          autorisations,
          isAuthenticated: true,
          error: null,
        });
      },

      updateAgent: (agentUpdate: Partial<Agent>) => {
        const currentAgent = get().agent;
        if (currentAgent) {
          set({
            agent: { ...currentAgent, ...agentUpdate },
          });
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

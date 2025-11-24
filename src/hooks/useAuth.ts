'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  userId: string;
  email?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  const router = useRouter();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setAuthState({
          user: result.data,
          loading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Erreur de vérification d\'authentification'
      });
    }
  };

  const login = async (agentId: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

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
        setAuthState({
          user: {
            userId: result.data.agent._id,
            email: result.data.agent.email,
            role: 'agent'
          },
          loading: false,
          error: null
        });
        return { success: true, data: result.data };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur de connexion au serveur';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setAuthState({
        user: null,
        loading: false,
        error: null
      });

      router.push('/signin');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isAuthenticated = !!authState.user;
  const isLoading = authState.loading;

  return {
    user: authState.user,
    loading: isLoading,
    error: authState.error,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@/icons';
import Link from 'next/link';
import { useAuthenticateAgent, useCheckAuth, useAuthLoading, useAuthError, useIsAuthenticated } from '@/store/useUserStore';

export default function LoginPage() {
  const [agentId, setAgentId] = useState('');
  const router = useRouter();
  const authenticateAgent = useAuthenticateAgent();
  const checkAuth = useCheckAuth();
  const loading = useAuthLoading();
  const error = useAuthError();
  const isAuthenticated = useIsAuthenticated();

  const handleCheckAuth = useCallback(async () => {
    if (isAuthenticated) {
      router.push('/');
    } else {
      await checkAuth();
    }
  }, [router, checkAuth, isAuthenticated]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    handleCheckAuth();
  }, [handleCheckAuth]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agentId.trim()) {
      return;
    }

    try {
      // Utiliser l'action du store pour authentifier
      const result = await authenticateAgent(agentId.trim());
      
      if (result.success) {
        // Redirection vers le dashboard après authentification réussie et persistance
        router.push('/');
      }
      // Les erreurs sont gérées automatiquement par le store
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  }, [agentId, authenticateAgent, router]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à l'accueil
        </Link>
      </div>
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion Agent
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scannez votre QR code ou saisissez votre ID agent
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID Agent <span className="text-red-500">*</span>
                </label>
                <input
                  id="agentId"
                  name="agentId"
                  type="text"
                  required
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Saisissez votre ID agent"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vous pouvez également scanner votre QR code pour une connexion automatique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import { useAuthenticateAgent, useCheckAuth, useAuthLoading, useAuthError, useIsAuthenticated, useUserStore } from '@/store/useUserStore';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    matricule: '',
    secure: ''
  });
  const router = useRouter();
  const { authenticateLoginAgent } = useUserStore();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matricule.trim() || !formData.secure.trim()) {
      return;
    }

    try {
      // Créer un identifiant combiné pour l'authentification
      const agentId = `${formData.matricule.trim()}:${formData.secure}`;
      
      // Utiliser l'action du store pour authentifier
      const result = await authenticateLoginAgent({
        matricule: formData.matricule.trim(),
        secure: formData.secure
      });

      const {
        token: totken
      } = result.data || {};

      console.log('Token reçu après connexion:', totken);
      
      if (result.success) {

        //save token to local storage
        localStorage.setItem('authToken', totken);
        // Redirection vers le dashboard après authentification réussie et persistance
        router.push('/');
      }
      // Les erreurs sont gérées automatiquement par le store
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  }, [formData, authenticateLoginAgent, router]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion Agent
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connectez-vous avec votre matricule et mot de passe
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Matricule <span className="text-red-500">*</span>
                </label>
                <input
                  id="matricule"
                  name="matricule"
                  type="text"
                  required
                  value={formData.matricule}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Saisissez votre matricule"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="secure" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  id="secure"
                  name="secure"
                  type="password"
                  required
                  value={formData.secure}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Saisissez votre mot de passe"
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
                  disabled={loading || !formData.matricule.trim() || !formData.secure.trim()}
                  className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <Link href="/forgot" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Mot de passe oublié ?
              </Link>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Contactez l'administrateur si vous avez oublié vos identifiants
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
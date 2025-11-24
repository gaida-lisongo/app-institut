'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { useAuthenticateAgent, useAuthLoading, useAuthError, useIsAuthenticated } from "@/store/useUserStore";

const LoginId = () => {
    const params = useParams();
    const router = useRouter();
    const authenticateAgent = useAuthenticateAgent();
    const loading = useAuthLoading();
    const error = useAuthError();
    const isAuthenticated = useIsAuthenticated();
    
    const id = params.id as string;

    const handleAuthentication = useCallback(async () => {
        if (!id) {
            return;
        }

        // Vérifier d'abord si déjà authentifié
        if (isAuthenticated) {
            router.push('/');
            return;
        }

        try {
            // Utiliser l'action du store pour authentifier
            const result = await authenticateAgent(id);
            
            if (result.success) {
                // Redirection vers le dashboard après authentification réussie et persistance
                router.push('/');
            }
            // Les erreurs sont gérées automatiquement par le store
        } catch (error) {
            console.error('Erreur lors de l\'authentification:', error);
        }
    }, [id, router, authenticateAgent, isAuthenticated]);

    useEffect(() => {
        handleAuthentication();
    }, [handleAuthentication]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Authentification en cours...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Connexion avec l'ID: {id}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Erreur d'authentification
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {error}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                            ID fourni: {id}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Réessayer
                            </button>
                            <button
                                onClick={() => router.push('/signin')}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Connexion manuelle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Ne devrait jamais arriver, mais au cas où
    return null;
};

export default LoginId;

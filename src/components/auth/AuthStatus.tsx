'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAgent, useFullName, useAutorisations } from '@/store/useUserStore';

export default function AuthStatus() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const agent = useAgent();
  const fullName = useFullName();
  const autorisations = useAutorisations();

  if (loading) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Non authentifié</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
            Authentifié avec succès
          </h3>
          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
            {agent && (
              <>
                <p><strong>Nom:</strong> {fullName}</p>
                <p><strong>Matricule:</strong> {agent.matricule}</p>
                <p><strong>Grade:</strong> {agent.grade.description}</p>
                <p><strong>Autorisations:</strong> {autorisations.length} active(s)</p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

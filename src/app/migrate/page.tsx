'use client';

import { useState } from 'react';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runMigration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur lors de l\'exécution de la migration',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Migration de la base de données</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ Correction du problème des recharges
        </h2>
        <p className="text-yellow-700">
          Cette migration va supprimer l'index problématique sur les recharges 
          et nettoyer les documents existants pour résoudre l'erreur E11000.
        </p>
      </div>

      <button
        onClick={runMigration}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium"
      >
        {isLoading ? 'Migration en cours...' : 'Exécuter la migration'}
      </button>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success ? '✅ Migration réussie' : '❌ Erreur de migration'}
          </h3>
          
          {result.success && result.results && (
            <div className="text-green-700">
              <p>• Index supprimé: {result.results.indexDropped ? 'Oui' : 'Non'}</p>
              <p>• Documents mis à jour: {result.results.documentsUpdated}</p>
              {result.results.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Erreurs:</p>
                  <ul className="list-disc list-inside">
                    {result.results.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {result.error && (
            <p className="text-red-700">{result.error}</p>
          )}
          
          {result.details && (
            <p className="text-gray-600 text-sm mt-2">Détails: {result.details}</p>
          )}
        </div>
      )}

      {result?.success && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            🎉 La migration est terminée ! Vous pouvez maintenant créer des étudiants sans problème.
            <br />
            <a href="/etudiants" className="text-blue-600 underline hover:text-blue-800">
              Retourner à la liste des étudiants
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

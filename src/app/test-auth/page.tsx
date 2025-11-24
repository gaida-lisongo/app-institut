'use client';

import { useState } from 'react';

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      // Test avec un ID d'agent (remplacez par un ID valide)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId: 'TEST_ID' }), // Remplacez par un ID valide
        credentials: 'include'
      });
      
      const data = await response.json();
      setResult({ type: 'login', data });
    } catch (error: any) {
      setResult({ type: 'login', error: error.message });
    }
    setLoading(false);
  };

  const testVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      setResult({ type: 'verify', data });
    } catch (error: any) {
      setResult({ type: 'verify', error: error.message });
    }
    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      setResult({ type: 'logout', data });
    } catch (error: any) {
      setResult({ type: 'logout', error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test d'Authentification
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Test Login
          </button>
          
          <button
            onClick={testVerify}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Test Verify
          </button>
          
          <button
            onClick={testLogout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Test Logout
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Résultat du test: {result.type}
            </h2>
            
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Instructions:
          </h3>
          <ol className="list-decimal list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>Modifiez l'ID d'agent dans le code (ligne 13) avec un ID valide</li>
            <li>Cliquez sur "Test Login" pour vous connecter</li>
            <li>Cliquez sur "Test Verify" pour vérifier le token</li>
            <li>Vérifiez les logs dans la console du navigateur et du serveur</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

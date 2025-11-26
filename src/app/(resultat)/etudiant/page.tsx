'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EtudiantIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page d'accueil ou afficher une page d'information
    // Pour l'instant, on affiche une page d'information
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Accès Étudiant
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Scannez le QR code de votre carte d'accès pour consulter vos informations académiques et résultats.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Utilisez votre carte d'étudiant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
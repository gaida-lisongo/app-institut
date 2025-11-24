import { Metadata } from 'next';
import { UserCircleIcon, GroupIcon } from '@/icons';

export const metadata: Metadata = {
  title: 'Gestion des Agents | Admin Dashboard',
  description: 'Gestion complète des agents de l\'établissement : enseignants, personnel administratif et autorisations.',
  keywords: ['agents', 'enseignants', 'personnel', 'administratif', 'gestion', 'établissement'],
  openGraph: {
    title: 'Gestion des Agents',
    description: 'Interface de gestion des agents de l\'établissement',
    type: 'website',
  },
};

interface AgentsLayoutProps {
  children: React.ReactNode;
}

export default function AgentsLayout({ children }: AgentsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête de section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-4">
            {/* Logo/Icône de la section */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <GroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            {/* Titre et description */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des Agents
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gérez les enseignants, le personnel administratif et les autorisations de votre établissement
              </p>
            </div>
            
            {/* Badge statistique */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  --
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Agents
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation rapide */}
          <div className="mt-6 flex flex-wrap gap-2">
            <div className="flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              <UserCircleIcon className="w-4 h-4 mr-1.5" />
              Enseignants
            </div>
            <div className="flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
              <UserCircleIcon className="w-4 h-4 mr-1.5" />
              Personnel Administratif
            </div>
            <div className="flex items-center px-3 py-1.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
              <UserCircleIcon className="w-4 h-4 mr-1.5" />
              Autorisations
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
}
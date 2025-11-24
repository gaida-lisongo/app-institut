import { Metadata } from 'next';
import AutorisationsDataTable from '@/components/autorisations/AutorisationsDataTable';

export const metadata: Metadata = {
  title: 'Autorisations | Admin Dashboard',
  description: 'Gestion des autorisations et privilèges des agents de l\'établissement.',
  keywords: ['autorisations', 'privilèges', 'agents', 'gestion', 'établissement'],
  openGraph: {
    title: 'Gestion des Autorisations',
    description: 'Interface de gestion des autorisations et privilèges',
    type: 'website',
  },
};

export default function AutorisationsPage() {
  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Autorisations
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Créez et gérez les privilèges et autorisations des agents
            </p>
          </div>
        </div>
      </div>

      {/* DataTable des autorisations */}
      <AutorisationsDataTable />
    </div>
  );
}
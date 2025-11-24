import { Metadata } from 'next';
import AgentsHeader from '@/components/agents/AgentsHeader';

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
      {/* En-tête de section avec fetch des agents et génération PDF */}
      <AgentsHeader />
      
      {/* Contenu principal */}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
}
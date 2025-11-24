'use client';

import { 
  useAgent, 
  useAutorisations, 
  useFullName, 
  useIsAdmin, 
  useIsSuperAdmin,
  useHasAutorisation 
} from '@/store/useUserStore';

export default function UserProfile() {
  const agent = useAgent();
  const autorisations = useAutorisations();
  const fullName = useFullName();
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const hasJuryAccess = useHasAutorisation('JURY');
  const hasAcademicAccess = useHasAutorisation('ACADEMIQUE');

  if (!agent) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur connecté</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">
            {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {fullName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {agent.grade.description} ({agent.grade.code})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations personnelles
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Matricule
              </label>
              <p className="text-gray-900 dark:text-white">{agent.matricule}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{agent.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Téléphone
              </label>
              <p className="text-gray-900 dark:text-white">{agent.telephone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sexe
              </label>
              <p className="text-gray-900 dark:text-white">
                {agent.sexe === 'M' ? 'Masculin' : 'Féminin'}
              </p>
            </div>
          </div>
        </div>

        {/* Autorisations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Autorisations ({autorisations.length})
          </h3>
          <div className="space-y-2">
            {autorisations.map((autorisation) => (
              <div
                key={autorisation._id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {autorisation.designation}
                </span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  Actif
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges de rôle */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Niveaux d'accès
        </h3>
        <div className="flex flex-wrap gap-2">
          {isSuperAdmin && (
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
              Super Administrateur
            </span>
          )}
          {isAdmin && (
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
              Administrateur
            </span>
          )}
          {hasJuryAccess && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              Accès Jury
            </span>
          )}
          {hasAcademicAccess && (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
              Accès Académique
            </span>
          )}
        </div>
      </div>

      {/* Informations système */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informations système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-gray-500 dark:text-gray-400">
              Créé le
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(agent.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <label className="text-gray-500 dark:text-gray-400">
              Dernière mise à jour
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(agent.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

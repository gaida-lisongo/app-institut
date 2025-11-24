'use client';

import { 
  useHasAutorisation, 
  useIsAdmin, 
  useIsSuperAdmin, 
  useAutorisations 
} from '@/store/useUserStore';

/**
 * Hook personnalisé pour gérer les permissions et autorisations
 */
export function usePermissions() {
  const autorisations = useAutorisations();
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();

  // Vérifications d'autorisations spécifiques
  const canAccessJury = useHasAutorisation('JURY');
  const canAccessAcademic = useHasAutorisation('ACADEMIQUE');
  const canAccessAppariteur = useHasAutorisation('APPARITEUR');

  // Fonctions utilitaires
  const hasAnyAutorisation = (designations: string[]): boolean => {
    return designations.some(designation => 
      autorisations.some(auth => 
        auth.designation.toLowerCase() === designation.toLowerCase()
      )
    );
  };

  const hasAllAutorisations = (designations: string[]): boolean => {
    return designations.every(designation => 
      autorisations.some(auth => 
        auth.designation.toLowerCase() === designation.toLowerCase()
      )
    );
  };

  // Permissions par module
  const canManageUsers = isSuperAdmin || isAdmin;
  const canManageGrades = isSuperAdmin || isAdmin;
  const canManageAutorisations = isSuperAdmin;
  const canViewReports = canAccessJury || canAccessAcademic || isAdmin || isSuperAdmin;
  const canManageSchedule = canAccessAcademic || isAdmin || isSuperAdmin;

  // Permissions CRUD génériques
  const canCreate = (resource: string): boolean => {
    switch (resource.toLowerCase()) {
      case 'agent':
      case 'user':
        return canManageUsers;
      case 'grade':
        return canManageGrades;
      case 'autorisation':
        return canManageAutorisations;
      case 'schedule':
        return canManageSchedule;
      default:
        return isSuperAdmin;
    }
  };

  const canUpdate = (resource: string): boolean => {
    // Même logique que canCreate pour la plupart des ressources
    return canCreate(resource);
  };

  const canDelete = (resource: string): boolean => {
    switch (resource.toLowerCase()) {
      case 'agent':
      case 'user':
        return isSuperAdmin; // Seul le super admin peut supprimer des utilisateurs
      case 'grade':
        return canManageGrades;
      case 'autorisation':
        return canManageAutorisations;
      default:
        return isSuperAdmin;
    }
  };

  const canView = (resource: string): boolean => {
    switch (resource.toLowerCase()) {
      case 'reports':
        return canViewReports;
      case 'schedule':
        return canManageSchedule;
      default:
        return true; // Par défaut, tous les utilisateurs connectés peuvent voir
    }
  };

  // Fonction pour vérifier les permissions par route
  const canAccessRoute = (route: string): boolean => {
    // Normaliser la route
    const normalizedRoute = route.toLowerCase().replace(/^\/+|\/+$/g, '');

    switch (normalizedRoute) {
      case 'admin/users':
      case 'admin/agents':
        return canManageUsers;
      
      case 'admin/grades':
        return canManageGrades;
      
      case 'admin/autorisations':
        return canManageAutorisations;
      
      case 'admin/reports':
      case 'reports':
        return canViewReports;
      
      case 'admin/schedule':
      case 'schedule':
        return canManageSchedule;
      
      case 'admin/settings':
        return isSuperAdmin;
      
      // Routes académiques
      case 'academic':
      case 'academic/courses':
      case 'academic/students':
        return canAccessAcademic;
      
      // Routes jury
      case 'jury':
      case 'jury/evaluations':
        return canAccessJury;
      
      // Routes appariteur
      case 'appariteur':
      case 'appariteur/tasks':
        return canAccessAppariteur;
      
      default:
        // Pour les routes non définies, vérifier si c'est une route admin
        if (normalizedRoute.startsWith('admin/')) {
          return isAdmin || isSuperAdmin;
        }
        return true; // Accès libre par défaut
    }
  };

  return {
    // État des autorisations
    autorisations,
    isAdmin,
    isSuperAdmin,
    
    // Autorisations spécifiques
    canAccessJury,
    canAccessAcademic,
    canAccessAppariteur,
    
    // Permissions par module
    canManageUsers,
    canManageGrades,
    canManageAutorisations,
    canViewReports,
    canManageSchedule,
    
    // Fonctions utilitaires
    hasAnyAutorisation,
    hasAllAutorisations,
    
    // Permissions CRUD
    canCreate,
    canUpdate,
    canDelete,
    canView,
    
    // Vérification de route
    canAccessRoute,
  };
}

# 🏪 Guide d'utilisation du Store Zustand

## 📋 Vue d'ensemble

Le store Zustand gère les informations de l'utilisateur connecté et ses autorisations avec persistance automatique dans localStorage.

## 🚀 Installation

```bash
npm install zustand
```

## 📁 Structure du Store

### Types principaux

```typescript
interface Agent {
  _id: string;
  nom: string;
  post_nom: string;
  prenom: string;
  grade: Grade;
  matricule: string;
  secure: string;
  sexe: string;
  email: string;
  telephone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Autorisation {
  _id: string;
  designation: string;
}
```

## 🎯 Utilisation de base

### 1. Hooks principaux

```typescript
import { 
  useAgent, 
  useAutorisations, 
  useIsAuthenticated,
  useUserActions 
} from '@/store/useUserStore';

function MonComposant() {
  const agent = useAgent();
  const autorisations = useAutorisations();
  const isAuthenticated = useIsAuthenticated();
  const { setUser, clearUser } = useUserActions();
  
  // Votre logique ici
}
```

### 2. Hooks utilitaires

```typescript
import { 
  useFullName,
  useIsAdmin,
  useIsSuperAdmin,
  useHasAutorisation 
} from '@/store/useUserStore';

function MonComposant() {
  const fullName = useFullName();
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const hasJuryAccess = useHasAutorisation('JURY');
  
  return (
    <div>
      <h1>Bonjour {fullName}</h1>
      {isAdmin && <AdminPanel />}
      {hasJuryAccess && <JurySection />}
    </div>
  );
}
```

## 🔐 Gestion des permissions

### Hook usePermissions

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MonComposant() {
  const {
    canManageUsers,
    canAccessJury,
    canCreate,
    canAccessRoute
  } = usePermissions();
  
  if (!canAccessRoute('admin/users')) {
    return <AccessDenied />;
  }
  
  return (
    <div>
      {canManageUsers && <UserManagement />}
      {canCreate('agent') && <CreateAgentButton />}
    </div>
  );
}
```

## 📊 Actions du Store

### Définir un utilisateur (lors du login)

```typescript
const { setUser } = useUserActions();

// Lors de la réception des données d'authentification
const loginData = {
  agent: { /* données agent */ },
  autorisations: [ /* liste autorisations */ ]
};

setUser(loginData.agent, loginData.autorisations);
```

### Mettre à jour les informations agent

```typescript
const { updateAgent } = useUserActions();

// Mettre à jour partiellement
updateAgent({
  email: 'nouveau@email.com',
  telephone: '+243123456789'
});
```

### Gérer les autorisations

```typescript
const { addAutorisation, removeAutorisation } = useUserActions();

// Ajouter une autorisation
addAutorisation({
  _id: 'new-auth-id',
  designation: 'NOUVELLE_AUTORISATION'
});

// Supprimer une autorisation
removeAutorisation('auth-id-to-remove');
```

### Déconnexion

```typescript
const { clearUser } = useUserActions();

// Nettoyer toutes les données utilisateur
clearUser();
```

## 🎨 Exemples d'interface

### Affichage conditionnel basé sur les autorisations

```typescript
function AdminMenu() {
  const { isAdmin, isSuperAdmin, canAccessJury } = usePermissions();
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      
      {canAccessJury && (
        <Link href="/jury">Gestion Jury</Link>
      )}
      
      {isAdmin && (
        <Link href="/admin/users">Gestion Utilisateurs</Link>
      )}
      
      {isSuperAdmin && (
        <Link href="/admin/settings">Paramètres Système</Link>
      )}
    </nav>
  );
}
```

### Composant de profil utilisateur

```typescript
function UserProfile() {
  const agent = useAgent();
  const fullName = useFullName();
  const autorisations = useAutorisations();
  
  if (!agent) return <div>Non connecté</div>;
  
  return (
    <div className="user-profile">
      <h2>{fullName}</h2>
      <p>Grade: {agent.grade.description}</p>
      <p>Matricule: {agent.matricule}</p>
      
      <div className="autorisations">
        <h3>Autorisations ({autorisations.length})</h3>
        {autorisations.map(auth => (
          <span key={auth._id} className="badge">
            {auth.designation}
          </span>
        ))}
      </div>
    </div>
  );
}
```

## 🔄 Persistance

Le store utilise `localStorage` pour persister automatiquement :
- Informations de l'agent
- Liste des autorisations  
- État d'authentification

Les données sont automatiquement restaurées au rechargement de la page.

## 🛡️ Sécurité

### Vérifications côté client

```typescript
function ProtectedComponent() {
  const { canAccessRoute } = usePermissions();
  
  if (!canAccessRoute('admin/sensitive-data')) {
    return <AccessDenied />;
  }
  
  return <SensitiveData />;
}
```

### Middleware de route (recommandé)

```typescript
// middleware.ts
import { useUserStore } from '@/store/useUserStore';

export function middleware(request: NextRequest) {
  // Vérifications côté serveur pour la sécurité
}
```

## 📈 Optimisation des performances

### Sélecteurs spécifiques

```typescript
// ✅ Bon - sélecteur spécifique
const fullName = useFullName();

// ❌ Éviter - sélection de tout le store
const { agent, autorisations } = useUserStore();
```

### Hooks personnalisés pour logique complexe

```typescript
function useCanEditAgent(agentId: string) {
  const { isSuperAdmin, canManageUsers } = usePermissions();
  const currentAgent = useAgent();
  
  return useMemo(() => {
    if (isSuperAdmin) return true;
    if (canManageUsers && currentAgent?._id !== agentId) return true;
    return currentAgent?._id === agentId; // Peut éditer son propre profil
  }, [isSuperAdmin, canManageUsers, currentAgent, agentId]);
}
```

## 🧪 Tests

### Test d'un composant utilisant le store

```typescript
import { renderWithStore } from '@/test-utils';

test('affiche le nom complet de l\'utilisateur', () => {
  const mockAgent = {
    prenom: 'John',
    nom: 'DOE',
    post_nom: 'SMITH'
  };
  
  const { getByText } = renderWithStore(<UserProfile />, {
    initialState: { agent: mockAgent }
  });
  
  expect(getByText('John DOE SMITH')).toBeInTheDocument();
});
```

## 🔧 Configuration avancée

### Migration des données

```typescript
// Dans useUserStore.ts
migrate: (persistedState: any, version: number) => {
  if (version === 0) {
    // Migrer depuis l'ancienne structure
    return {
      ...persistedState,
      newField: 'defaultValue'
    };
  }
  return persistedState;
}
```

### Personnalisation de la persistance

```typescript
// Exclure certains champs de la persistance
partialize: (state) => ({
  agent: state.agent,
  autorisations: state.autorisations,
  // Exclure isAuthenticated pour forcer la re-vérification
})
```

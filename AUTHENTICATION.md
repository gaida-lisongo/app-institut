# Système d'Authentification

Ce projet utilise un système d'authentification basé sur des tokens JWT pour sécuriser les routes API et les pages admin.

## Configuration

1. **Variables d'environnement** : Copiez `.env.example` vers `.env.local` et configurez :
   ```bash
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```

## Composants du système

### 1. Utilitaires JWT (`/lib/auth/jwt.ts`)
- `JWTUtils.generateToken()` : Génère un token d'authentification
- `JWTUtils.verifyToken()` : Vérifie et décode un token
- `JWTUtils.decodeToken()` : Décode un token sans vérification

### 2. Middleware global (`/middleware.ts`)
Protège automatiquement :
- **Pages admin** : Toutes les routes commençant par `/admin` ou contenant `/(admin)`
- **Routes API** : Méthodes POST, PUT, DELETE sur toutes les routes `/api/*`

### 3. Middleware d'authentification (`/lib/middlewares/authMiddleware.ts`)
- `AuthMiddleware.verifyApiAuth()` : Vérifie l'auth pour les routes API
- `AuthMiddleware.verifyPageAuth()` : Vérifie l'auth pour les pages
- `AuthMiddleware.getUserFromHeaders()` : Extrait les infos utilisateur

### 4. HOC pour routes protégées (`/lib/auth/withAuth.ts`)
- `withAuth()` : Protège une route API spécifique
- `withAuthMethods()` : Protège seulement certaines méthodes HTTP

## Utilisation

### Authentification d'un agent

```typescript
// POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agentId: 'AGENT_ID' })
});
```

### Protéger une route API

```typescript
import { withAuth, AuthenticatedRequest } from '@/lib/auth/withAuth';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  // Accès aux infos utilisateur via request.user
  console.log('Utilisateur:', request.user.userId);
  
  // Votre logique ici...
});
```

### Protéger seulement certaines méthodes

```typescript
import { withAuthMethods } from '@/lib/auth/withAuth';

export const handler = withAuthMethods(['POST', 'PUT', 'DELETE'], async (request) => {
  // GET est libre, POST/PUT/DELETE nécessitent une auth
});
```

### Hook d'authentification côté client

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }
  
  return <div>Bonjour {user?.email}</div>;
}
```

## Routes d'authentification

- `POST /api/auth/login` : Connexion avec ID agent
- `GET /api/auth/login` : Vérification du token actuel
- `POST /api/auth/logout` : Déconnexion

## Sécurité

### Token Storage
- **Côté serveur** : Cookie httpOnly, secure, sameSite
- **Côté client** : Automatiquement géré par les cookies

### Protection des routes
- **Pages admin** : Redirection automatique vers `/login`
- **API protégées** : Retour d'erreur 401 Unauthorized

### Extraction du token
Le système vérifie automatiquement :
1. Header `Authorization: Bearer <token>`
2. Cookie `auth-token`

## Exemple complet

```typescript
// Route protégée
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  const { userId, email, role } = request.user;
  
  // Vérifier les permissions
  if (role !== 'admin') {
    return NextResponse.json(
      { error: 'Permissions insuffisantes' },
      { status: 403 }
    );
  }
  
  // Traitement...
});
```

## Notes importantes

1. **Middleware global** : Protège automatiquement toutes les routes selon les règles définies
2. **Flexibilité** : Possibilité de protéger des routes spécifiques avec `withAuth`
3. **Performance** : Les routes GET ne sont pas protégées par défaut
4. **Sécurité** : Tokens signés et vérifiés côté serveur

# Guide d'utilisation du système d'authentification

## 🚀 Authentification automatique par ID

### URL de connexion avec QR Code
Lorsqu'un agent scanne son QR Code, il sera redirigé vers :
```
http://localhost:3000/login/{AGENT_ID}
```

### Processus d'authentification
1. **Scan du QR Code** → Redirection vers `/login/{id}`
2. **Authentification automatique** → Vérification de l'ID agent
3. **Redirection** → Vers le dashboard principal `/`

## 🔒 Protection des routes

### Pages protégées
- Toutes les pages dans le dossier `(admin)`
- Toutes les routes sauf `/`, `/login/*`, `/signin`, `/signup`

### Routes API protégées
- **POST, PUT, DELETE** : Nécessitent un token valide
- **GET** : Libres d'accès (lecture seule)

## 🧪 Test du système

### 1. Tester l'authentification
```
http://localhost:3000/login/AGENT_ID_EXISTANT
```

### 2. Vérifier la protection
1. Essayer d'accéder à une page admin sans être connecté
2. Vérifier la redirection vers `/login`

### 3. Tester la déconnexion
- Utiliser le bouton "Se déconnecter" sur le dashboard
- Vérifier la redirection et la suppression du token

## 🔧 Dépannage

### Problèmes courants

1. **Pages admin accessibles sans auth**
   - Vérifier que le middleware est actif
   - Consulter les logs de la console du navigateur
   - Vérifier que `AuthGuard` est bien dans le layout

2. **Authentification échoue**
   - Vérifier que l'ID agent existe dans la base
   - Consulter les logs de l'API `/api/auth/login`
   - Vérifier la connexion à MongoDB

3. **Token invalide**
   - Vérifier la variable `JWT_SECRET` dans `.env.local`
   - Supprimer les cookies et réessayer

### Logs de debug
Le système affiche des logs dans la console pour aider au debug :
- `Middleware - pathname:` : Route visitée
- `Middleware - Route admin détectée:` : Protection activée
- `AuthMiddleware - verifyPageAuth pour:` : Vérification d'auth

## 📝 Variables d'environnement requises

Créer un fichier `.env.local` :
```env
MONGODB_URI=mongodb://localhost:27017/admin-etab
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 🔄 Flux d'authentification

```mermaid
graph TD
    A[Scan QR Code] --> B[/login/{id}]
    B --> C[Authentification auto]
    C --> D{Agent existe?}
    D -->|Oui| E[Génération token]
    D -->|Non| F[Erreur]
    E --> G[Redirection vers /]
    F --> H[Page d'erreur]
    G --> I[Dashboard protégé]
```

## 🛡️ Sécurité

### Tokens
- **Durée de vie** : 7 jours par défaut
- **Stockage** : Cookie httpOnly + signature HMAC
- **Vérification** : À chaque requête protégée

### Protection CSRF
- Cookies `sameSite: 'strict'`
- Tokens signés côté serveur

### Permissions
- Actuellement : tous les agents authentifiés ont accès
- Extensible pour ajouter des rôles spécifiques

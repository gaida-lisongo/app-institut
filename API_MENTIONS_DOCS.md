# 📚 Documentation API - Système de Mentions

## 🎯 Vue d'ensemble

Cette API gère les **Mentions**, **Filières**, **Promotions** et **Sections** du système éducatif avec un contrôleur CRUD générique réutilisable.

## 🏗️ Architecture

### Modèles créés
- **Mention** : Contient des filières
- **Filière** : Contient des promotions et un bureau
- **Promotion** : Contient des semestres (à implémenter)
- **Section** : Contient des filières et un bureau

### Contrôleur générique
Un seul contrôleur `MentionControllers.ts` gère toutes les opérations CRUD pour les 4 collections.

## 📋 Endpoints disponibles

### 🎓 **MENTIONS**

#### GET `/api/mentions`
Récupérer toutes les mentions
```javascript
// Exemple de réponse
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "designation": "Informatique",
      "description": "Sciences informatiques",
      "filieres": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "count": 1
}
```

#### POST `/api/mentions`
Créer une nouvelle mention
```javascript
// Corps de la requête
{
  "designation": "Informatique",
  "description": "Sciences informatiques",
  "filieres": []
}
```

#### GET `/api/mentions/[id]`
Récupérer une mention par ID

#### PUT `/api/mentions/[id]`
Mettre à jour une mention

#### DELETE `/api/mentions/[id]`
Supprimer une mention

### 🏢 **FILIÈRES**

#### GET `/api/filieres`
Récupérer toutes les filières
```javascript
// Paramètres de population par défaut : ['promotions', 'bureau.agent']
```

#### POST `/api/filieres`
Créer une nouvelle filière
```javascript
// Corps de la requête
{
  "designation": "Génie Logiciel",
  "description": "Développement de logiciels",
  "bureau": [
    {
      "agent": "agent_id",
      "role": "Chef de Filière"
    }
  ],
  "promotions": []
}
```

#### GET `/api/filieres/[id]`
#### PUT `/api/filieres/[id]`
#### DELETE `/api/filieres/[id]`

### 🎯 **PROMOTIONS**

#### GET `/api/promotions`
Récupérer toutes les promotions

#### POST `/api/promotions`
Créer une nouvelle promotion
```javascript
// Corps de la requête
{
  "designation": "L1 Informatique 2024",
  "systeme": "LMD",
  "niveau": "L1",
  "cycle": "Licence",
  "semestres": []
}
```

**Valeurs autorisées :**
- `systeme`: `["LMD", "Classique"]`
- `niveau`: `["L1", "L2", "L3", "M1", "M2", "D1", "D2", "D3"]`
- `cycle`: `["Licence", "Master", "Doctorat"]`

#### GET `/api/promotions/[id]`
#### PUT `/api/promotions/[id]`
#### DELETE `/api/promotions/[id]`

### 🏛️ **SECTIONS**

#### GET `/api/sections`
Récupérer toutes les sections

#### POST `/api/sections`
Créer une nouvelle section
```javascript
// Corps de la requête
{
  "designation": "Section Sciences",
  "bureau": [
    {
      "agent": "agent_id",
      "role": "Chef de Section"
    }
  ],
  "filieres": []
}
```

**Rôles autorisés pour le bureau :**
- Sections : `["Chef de Section", "Secrétaire", "Membre"]`
- Filières : `["Chef de Filière", "Secrétaire", "Membre"]`

#### GET `/api/sections/[id]`
#### PUT `/api/sections/[id]`
#### DELETE `/api/sections/[id]`

## 🔗 **Relations spéciales**

### Ajouter une filière à une mention
```javascript
POST /api/mentions/[mentionId]/filieres
{
  "filiereId": "filiere_id"
}
```

### Retirer une filière d'une mention
```javascript
DELETE /api/mentions/[mentionId]/filieres?filiereId=filiere_id
```

## 📊 **Paramètres de population**

Utilisez le paramètre `populate` pour inclure les références :

```javascript
// Exemples
GET /api/mentions?populate=filieres
GET /api/filieres?populate=promotions,bureau.agent
GET /api/sections?populate=filieres,bureau.agent
```

## ✅ **Format de réponse standard**

### Succès
```javascript
{
  "success": true,
  "data": {...},
  "message": "Opération réussie" // Pour POST, PUT, DELETE
}
```

### Erreur
```javascript
{
  "success": false,
  "error": "Message d'erreur"
}
```

## 🛡️ **Validation**

### Champs requis
- **Mention** : `designation`
- **Filière** : `designation`
- **Promotion** : `designation`, `systeme`, `niveau`, `cycle`
- **Section** : `designation`

### Contraintes
- Les désignations des mentions et sections doivent être uniques
- Les valeurs enum sont strictement validées
- Les références d'agents doivent exister

## 🚀 **Utilisation dans le frontend**

```javascript
// Exemple d'utilisation
const createMention = async (data) => {
  const response = await fetch('/api/mentions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
};

// Récupérer avec population
const getMentions = async () => {
  const response = await fetch('/api/mentions?populate=filieres');
  return response.json();
};
```

## 📝 **Notes importantes**

1. **Contrôleur générique** : Le même contrôleur gère toutes les collections
2. **Population automatique** : Les relations sont automatiquement peuplées selon les besoins
3. **Validation stricte** : Toutes les données sont validées côté serveur
4. **Gestion d'erreurs** : Messages d'erreur cohérents et informatifs
5. **Extensibilité** : Facile d'ajouter de nouvelles collections avec le même pattern

## 🔮 **Prochaines étapes**

- [ ] Implémenter la collection **Semestre**
- [ ] Ajouter l'authentification aux routes
- [ ] Créer les interfaces frontend
- [ ] Ajouter la pagination pour les grandes listes

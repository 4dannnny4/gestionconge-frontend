# Frontend Angular 18 - Gestion de Congés

Application frontend Angular 18 pour la gestion des demandes de congés, conçue pour fonctionner avec le backend Spring Boot.

## 🚀 Installation rapide

### 1. Créer le projet
```bash
ng new gestion-conge-frontend --routing --style=css
cd gestion-conge-frontend
```

### 2. Installer les dépendances
```bash
npm install bootstrap @fortawesome/fontawesome-free
npm install jwt-decode
ng add @angular/material
```

### 3. Copier tous les fichiers
Copiez tous les fichiers fournis dans leur structure respective selon l'arborescence.

### 4. Démarrer l'application
```bash
ng serve
```

L'application sera disponible sur `http://localhost:4200`

## 🔑 Comptes de test
- **Admin** : `admin` / `admin`
- **Employé** : `employe` / `employe`

## 🏗️ Structure du projet

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         # Guards d'authentification et de rôles
│   │   ├── interceptors/   # Interceptors HTTP
│   │   ├── models/         # Interfaces TypeScript
│   │   └── services/       # Services API
│   ├── features/
│   │   ├── auth/           # Connexion et inscription
│   │   ├── dashboard/      # Tableau de bord
│   │   └── demandes/       # Gestion des demandes
│   ├── layout/             # Composants de mise en page
│   ├── shared/             # Composants partagés
│   └── app-routing.module.ts
├── environments/           # Configuration d'environnement
└── assets/
```

## 📱 Fonctionnalités

### ✅ Authentification
- Connexion JWT avec rôles
- Inscription d'utilisateurs
- Protection des routes

### ✅ Dashboard
- Statistiques en temps réel
- Vue d'ensemble des demandes
- Actions rapides

### ✅ Gestion des demandes
- Création de demandes de congés
- Liste des demandes avec filtres
- Modification et suppression

### ✅ Interface utilisateur
- Design responsive Bootstrap 5
- Thème moderne avec dégradés
- Icons FontAwesome
- Animations CSS

## 🔧 Configuration

### Backend
Assurez-vous que votre backend Spring Boot fonctionne sur :
- **URL** : `http://localhost:8075`
- **CORS** : Configuré pour `http://localhost:4200`

### Environment
Modifiez `src/environments/environment.ts` si nécessaire :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8075/api',
  authUrl: 'http://localhost:8075/api/v1/auth'
};
```

## 🛡️ Sécurité

- JWT Tokens avec expiration
- Guards pour protection des routes
- Interceptors pour gestion d'erreurs
- Validation côté client

## 📦 Build et déploiement

### Development
```bash
ng serve
```

### Production
```bash
ng build --prod
```

## 🔄 API Endpoints utilisés

- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription
- `GET /api/demandeConges/get/list` - Liste des demandes
- `POST /api/demandeConges/add` - Créer demande
- `GET /api/typeConges/get/list` - Types de congés
- `GET /api/users/get/list` - Liste utilisateurs

## 🎨 Personnalisation

### Thèmes
Les couleurs principales sont définies dans `src/styles.css` :
- Primaire : `#667eea` → `#764ba2`
- Succès : `#4facfe` → `#00f2fe`
- Attention : `#f093fb` → `#f5576c`

### Composants
Tous les composants sont modulaires et réutilisables.

## 🤝 Compatibilité

- **Angular** : 18.x
- **Bootstrap** : 5.3+
- **Node.js** : 18.x+
- **TypeScript** : 5.4+

## 📋 TODO

- [ ] Module d'administration complet
- [ ] Gestion des soldes de congés
- [ ] Validation des demandes
- [ ] Notifications en temps réel
- [ ] Rapports et statistiques avancés
- [ ] Tests unitaires

---

**Développé avec ❤️ pour la gestion moderne des congés**
# Guide d'Installation et de Déploiement

Ce document décrit les étapes nécessaires pour installer, configurer et déployer l'application CyberArk Capacity Planning Dashboard.

## Table des Matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Déploiement](#déploiement)
5. [Vérification](#vérification)
6. [Personnalisation](#personnalisation)
7. [Dépannage](#dépannage)

## Prérequis

### Environnement Système

- **Système d'exploitation** : Windows, macOS ou Linux
- **Node.js** : Version 14.x ou supérieure
- **npm** : Version 6.x ou supérieure
- **Git** : Pour le clonage du dépôt (optionnel)

### Navigateurs Supportés

- Google Chrome (recommandé) - version 88 ou supérieure
- Mozilla Firefox - version 85 ou supérieure
- Microsoft Edge - version 88 ou supérieure
- Safari - version 14 ou supérieure

### Accès aux Données CyberArk

- Accès aux scripts PowerShell pour l'extraction des données
- Permissions pour exécuter les scripts sur un serveur CyberArk

## Installation

### 1. Clonage du Dépôt

```bash
git clone https://votre-depot-git/cyberark-capacity-planning.git
cd cyberark-capacity-planning
```

### 2. Installation des Dépendances

```bash
# Installation des dépendances du projet
npm install

# Pour la version de production avec optimisations
npm ci
```

### 3. Construction de l'Application

```bash
# Construction pour le développement
npm run build:dev

# Construction pour la production
npm run build
```

## Configuration

### 1. Configuration de l'Environnement

Créez un fichier `.env` à la racine du projet (pour le développement) ou configurez les variables d'environnement sur votre serveur (pour la production) :

```
# Exemple de fichier .env
REACT_APP_API_URL=http://votre-api-url
REACT_APP_ENV=development|production
REACT_APP_UPLOAD_PATH=/chemin/vers/uploads
```

### 2. Configuration des Scripts PowerShell

Les scripts PowerShell doivent être accessibles aux utilisateurs finaux. Vous pouvez :

- Les inclure dans le répertoire `public/scripts` de l'application
- Les héberger sur un partage réseau accessible
- Les distribuer via un système de gestion de configuration

## Déploiement

### Option 1 : Déploiement sur un Serveur Web Statique

1. Construisez l'application pour la production :

   ```bash
   npm run build
   ```

2. Copiez le contenu du répertoire `build` sur votre serveur web (Apache, Nginx, IIS, etc.)

3. Configurez votre serveur web pour servir correctement une application React :

   **Exemple pour Nginx :**

   ```
   server {
     listen 80;
     server_name votre-domaine.com;
     root /chemin/vers/build;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

### Option 2 : Déploiement via Docker

1. Construisez l'image Docker :

   ```bash
   docker build -t cyberark-capacity-planning .
   ```

2. Exécutez le conteneur :
   ```bash
   docker run -d -p 8080:80 --name cyberark-dashboard cyberark-capacity-planning
   ```

### Option 3 : Déploiement sur un Service Cloud

#### Pour AWS S3 + CloudFront :

1. Créez un bucket S3 et configurez-le pour l'hébergement de sites web statiques
2. Déployez l'application :
   ```bash
   aws s3 sync build/ s3://votre-bucket-nom
   ```
3. Configurez CloudFront pour la distribution

#### Pour Azure Static Web Apps :

1. Suivez les instructions de déploiement Azure Static Web Apps
2. Connectez votre dépôt Git et configurez le workflow de construction

## Vérification

Après le déploiement, vérifiez que :

1. L'application est accessible via l'URL spécifiée
2. La page d'accueil s'affiche correctement
3. Tous les dashboards sont accessibles
4. Les fonctionnalités d'upload de fichiers fonctionnent
5. Les visualisations de données s'affichent correctement

## Personnalisation

### Personnalisation du Thème

Vous pouvez modifier le thème de l'application en éditant le fichier `src/theme/index.js` :

```jsx
// Exemple de personnalisation du thème
const theme = createTheme({
  palette: {
    primary: {
      main: "#votre-couleur-primaire",
    },
    secondary: {
      main: "#votre-couleur-secondaire",
    },
    // Autres personnalisations...
  },
  // ...
});
```

### Personnalisation du Logo et des Icônes

1. Remplacez les fichiers dans le répertoire `public/assets/images/`
2. Mettez à jour les références dans le code si nécessaire

### Ajout de Nouveaux Dashboards

Consultez le [Guide d'Extension](EXTENSION_GUIDE.md) pour ajouter de nouveaux dashboards à l'application.

## Dépannage

### Problèmes d'Installation

**Erreur : Unable to resolve dependency tree**

```
npm install --legacy-peer-deps
```

**Erreur : Module not found**

```
rm -rf node_modules
npm cache clean --force
npm install
```

### Problèmes de Déploiement

**Erreur 404 sur les routes**

- Assurez-vous que votre serveur est configuré pour rediriger toutes les requêtes vers index.html

**Problèmes avec les chemins relatifs**

- Vérifiez la configuration de `homepage` dans package.json
- Pour un sous-répertoire, ajoutez `"homepage": ".",`

### Problèmes d'Exécution

**Erreurs lors du chargement des données**

- Vérifiez les chemins des fichiers dans les scripts
- Assurez-vous que les formats de données correspondent aux attentes des parsers

**Problèmes d'affichage des graphiques**

- Inspectez la console du navigateur pour les erreurs
- Vérifiez que les données sont correctement formatées pour les composants de graphique

## Support et Maintenance

Pour obtenir de l'aide supplémentaire ou signaler des problèmes :

- Créez une issue dans le dépôt Git
- Contactez l'équipe de développement à support@votre-organisation.com

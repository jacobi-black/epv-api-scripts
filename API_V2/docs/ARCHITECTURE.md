# Architecture du CyberArk Capacity Planning Dashboard

Ce document décrit l'architecture technique du CyberArk Capacity Planning Dashboard, une application web React conçue pour visualiser et analyser les données de performance et de capacité des environnements CyberArk.

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Structure du Projet](#structure-du-projet)
3. [Architecture Frontend](#architecture-frontend)
4. [Gestion des Données](#gestion-des-données)
5. [Flux de Données](#flux-de-données)
6. [Composants Principaux](#composants-principaux)
7. [Considérations Techniques](#considérations-techniques)

## Vue d'Ensemble

L'application est une solution de tableau de bord single-page (SPA) basée sur React et Material-UI. Elle est conçue pour charger, parser et visualiser des données issues de scripts PowerShell qui collectent des informations sur les environnements CyberArk.

**Caractéristiques principales :**

- Interface utilisateur intuitive avec thème clair/sombre
- Visualisations interactives des métriques clés
- Support pour plusieurs types de dashboards
- Upload de fichiers de données générés par PowerShell
- Navigation contextuelle entre dashboards connexes

## Structure du Projet

```
cyberark-capacity-planning/
├── public/                     # Ressources statiques
│   ├── assets/                 # Images, icônes et autres médias
│   ├── scripts/                # Scripts PowerShell pour collecter les données
│   └── index.html              # Template HTML racine
├── src/                        # Code source de l'application
│   ├── assets/                 # Ressources utilisées dans le code
│   ├── components/             # Composants React
│   │   ├── charts/             # Composants de visualisation
│   │   ├── layouts/            # Composants de mise en page
│   │   ├── pages/              # Composants de pages
│   │   ├── ui/                 # Composants d'interface réutilisables
│   │   └── help/               # Composants d'aide et de tutoriel
│   ├── utils/                  # Utilitaires et helpers
│   │   ├── parsers/            # Fonctions de parsing des données
│   │   ├── formatters/         # Fonctions de formatage pour l'affichage
│   │   ├── DataContext.jsx     # Contexte global pour les données
│   │   └── theme.js            # Configuration du thème
│   ├── App.jsx                 # Composant racine de l'application
│   └── index.js                # Point d'entrée de l'application
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # Ce document
│   ├── EXTENSION_GUIDE.md      # Guide pour ajouter de nouveaux dashboards
│   └── INSTALLATION.md         # Instructions d'installation
├── package.json                # Dépendances et scripts npm
└── README.md                   # Documentation générale
```

## Architecture Frontend

L'application utilise une architecture basée sur les composants React avec gestion d'état centralisée via React Context. Cette approche permet un découplage des composants tout en maintenant un accès cohérent aux données à travers l'application.

### Couches d'Architecture

1. **Couche de Présentation (UI)**

   - Composants React et Material-UI
   - Visualisations basées sur Recharts
   - Gestion de thème et styles

2. **Couche d'État et Logique**

   - Contextes React pour la gestion d'état global
   - Hooks personnalisés pour la logique réutilisable
   - Gestionnaires d'événements et contrôleurs de vue

3. **Couche de Données**

   - Parsers pour traiter les fichiers d'entrée
   - Transformateurs et agrégateurs de données
   - Mise en cache et persistance locale

4. **Couche de Services**
   - Upload et gestion de fichiers
   - Interaction avec l'utilisateur (aide, tutoriels)
   - Navigation et routage

### Bibliothèques Clés

- **React** - Bibliothèque UI principale
- **React Router** - Gestion du routage et de la navigation
- **Material-UI** - Composants d'interface utilisateur
- **Recharts** - Bibliothèque de visualisation de données
- **react-dropzone** - Gestion des uploads de fichiers
- **date-fns** - Manipulation de dates

## Gestion des Données

La gestion des données est centralisée via le `DataContext`. Ce contexte fournit des méthodes pour charger, traiter et accéder aux données à travers l'application.

### Cycle de Vie des Données

1. **Acquisition** - L'utilisateur télécharge des fichiers générés par les scripts PowerShell
2. **Parsing** - Les parsers convertissent les données brutes en structures JavaScript
3. **Transformation** - Les données sont nettoyées, normalisées et enrichies
4. **Stockage** - Les données sont stockées dans le contexte et éventuellement dans localStorage
5. **Consommation** - Les composants consomment les données via des hooks personnalisés
6. **Visualisation** - Les données sont rendues sous forme de graphiques et tableaux

### Structure du DataContext

```jsx
// Exemple simplifié du DataContext
const DataContext = React.createContext(null);

export const DataProvider = ({ children }) => {
  // États pour chaque type de données
  const [accountsData, setAccountsData] = useState(null);
  const [sessionsData, setSessionsData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  // ... autres états

  // Méthode pour vérifier la disponibilité des données
  const hasRequiredData = (dashboardType) => {
    switch (dashboardType) {
      case "accounts":
        return Boolean(accountsData);
      case "sessions":
        return Boolean(sessionsData);
      // ... autres cas
    }
  };

  // Méthodes pour définir les données
  // ...

  // Valeur fournie par le contexte
  const contextValue = {
    accountsData,
    sessionsData,
    performanceData,
    // ... autres données
    setAccountsData,
    setSessionsData,
    setPerformanceData,
    // ... autres setters
    hasRequiredData,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

// Hook personnalisé pour accéder au contexte
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
```

## Flux de Données

Le flux de données à travers l'application suit ce schéma :

```
┌────────────┐     ┌────────────┐     ┌───────────┐
│ PowerShell │ ──► │  Fichiers  │ ──► │  Upload   │
│  Scripts   │     │   Sortie   │     │ Interface │
└────────────┘     └────────────┘     └───────────┘
                                           │
                                           ▼
┌────────────┐     ┌────────────┐     ┌───────────┐
│ Composants │ ◄── │ DataContext│ ◄── │  Parsers  │
│    UI      │     │            │     │           │
└────────────┘     └────────────┘     └───────────┘
```

1. Les scripts PowerShell collectent des données sur l'environnement CyberArk
2. L'utilisateur télécharge les fichiers via l'interface d'upload
3. Les parsers traitent les fichiers et extraient les données structurées
4. Les données sont stockées dans le DataContext
5. Les composants UI s'abonnent aux données pertinentes et les affichent

## Composants Principaux

### Layouts

- **MainLayout** - Structure de base de toutes les pages avec en-tête, navigation et pied de page
- **DashboardLayout** - Layout spécifique pour les pages de dashboard avec filtres et contrôles

### Pages

- **Home** - Page d'accueil avec les catégories de dashboards
- **FileUpload** - Interface pour télécharger les fichiers de données
- **AccountsAnalysis** - Analyse des comptes (nombre, types, statuts)
- **SessionsMonitoring** - Surveillance des sessions utilisateurs
- **PerformanceMetrics** - Métriques de performance du système

### Composants UI Réutilisables

- **KPICard** - Affiche un indicateur clé de performance
- **DataTable** - Tableau de données filtrable et triable
- **FilterBar** - Barre de filtres pour les visualisations
- **DashboardCard** - Carte pour accéder à un dashboard

### Visualisations

L'application utilise plusieurs types de visualisations :

- Graphiques linéaires pour les tendances temporelles
- Graphiques à barres pour les comparaisons
- Camemberts pour les répartitions
- Jauges pour les indicateurs de capacité
- Cartes de chaleur pour les matrices de données
- Tableaux pour les données détaillées

## Considérations Techniques

### Performance

- Mémoisation des calculs coûteux avec `useMemo` et `useCallback`
- Chargement paresseux des composants avec `React.lazy`
- Optimisation des rendus avec `React.memo`
- Agrégation des données côté client pour réduire la complexité des visualisations

### Accessibilité

- Structure sémantique HTML5
- Support du clavier pour toutes les interactions
- Contraste de couleurs conformes aux normes WCAG
- Support des lecteurs d'écran

### Extensibilité

L'architecture est conçue pour faciliter l'ajout de nouveaux dashboards :

1. Créer un nouveau parser pour le type de données
2. Ajouter l'état correspondant dans le DataContext
3. Créer les composants de visualisation
4. Ajouter la configuration dans la page d'accueil
5. Définir les routes dans l'application

Voir le [Guide d'Extension](EXTENSION_GUIDE.md) pour des instructions détaillées.

### Considérations de Sécurité

- Toutes les données sont traitées côté client
- Aucune donnée sensible n'est envoyée à des serveurs externes
- Validation des entrées pour les fichiers téléchargés
- Aucun stockage permanent des données sensibles

### Limitations Connues

- Application entièrement côté client - nécessite des ressources navigateur adéquates
- Performances peuvent se dégrader avec de très grands ensembles de données
- Interface optimisée pour desktop, expérience mobile limitée

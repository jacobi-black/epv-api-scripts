# CyberArk Capacity Planning Dashboard

Dashboard moderne pour visualiser et analyser les données d'un environnement CyberArk Enterprise Password Vault (EPV).

## Fonctionnalités

- **Tableaux de bord interactifs** : Visualisez les données clés de votre environnement CyberArk
- **Analyse des comptes** : Explorez la distribution des comptes par coffre et par plateforme
- **Analyse des coffres** : Examinez la structure et les permissions des coffres
- **Suivi de l'état du système** : Surveillez la santé des composants CyberArk
- **Prévision de capacité** : Planifiez votre croissance future avec des modèles prédictifs

## Prérequis

- Node.js 16.x ou supérieur
- npm ou yarn

## Installation

1. Clonez le dépôt :

   ```bash
   git clone <url-du-repo>
   cd API_V2
   ```

2. Installez les dépendances :

   ```bash
   npm install
   # ou
   yarn
   ```

3. Lancez l'application :
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## Utilisation

1. **Extraction des données** : Utilisez les scripts PowerShell fournis dans les dossiers appropriés pour extraire les données de votre environnement CyberArk:

   - `Get-Accounts.ps1` ou `Get-AccountReport.ps1` pour les données de comptes
   - `Get-SafeMemberReport.ps1` pour les données de coffres
   - `System-Health.ps1` pour les données de santé du système

2. **Import des données** : Téléchargez les fichiers CSV générés via la page "Upload Data" du dashboard

3. **Analyse** : Naviguez à travers les différentes sections du dashboard pour analyser vos données

## Structure des fichiers

```
API_V2/
├── public/               # Ressources statiques
├── src/
│   ├── assets/           # Images et ressources
│   │   ├── layouts/      # Layouts de l'application
│   │   ├── pages/        # Pages principales
│   │   └── ui/           # Composants UI réutilisables
│   ├── utils/            # Utilitaires et fonctions
│   ├── App.jsx           # Composant principal
│   ├── index.css         # Styles globaux
│   └── main.jsx          # Point d'entrée
└── package.json          # Dépendances et scripts
```

## Génération des fichiers CSV

### Données de comptes

Exécutez le script PowerShell `Get-Accounts.ps1` ou `Get-AccountReport.ps1` pour extraire les données des comptes:

```powershell
.\Get-Accounts.ps1 -PVWAURL "https://your-pvwa-server" -List -AutoNextPage -CSVPath "accounts.csv"
```

### Données de coffres

Exécutez le script PowerShell `Get-SafeMemberReport.ps1` pour extraire les données des coffres:

```powershell
.\Get-SafeMemberReport.ps1 -PVWAURL "https://your-pvwa-server" -CSVPath "safes.csv"
```

### Données de santé du système

Exécutez le script PowerShell `System-Health.ps1` pour extraire les données de santé du système:

```powershell
.\System-Health.ps1 -PVWAURL "https://your-pvwa-server" -CSVPath "system-health.csv"
```

## Capacity Planning

Le module de Capacity Planning vous permet de:

1. Visualiser votre utilisation actuelle
2. Définir différents scénarios de croissance
3. Obtenir des projections pour la taille future de votre environnement
4. Recevoir des recommandations pour gérer cette croissance

## Personnalisation

Vous pouvez personnaliser le dashboard en modifiant:

- Les couleurs et le thème: modifiez les variables dans `App.jsx`
- Les métriques affichées: ajustez les composants dans le dossier `pages`
- Les calculs de prévision: modifiez la logique dans `CapacityPlanning.jsx`

## Limitations

- L'application fonctionne uniquement avec des fichiers CSV générés par les scripts CyberArk fournis
- Aucune connexion directe à l'API CyberArk n'est établie pour des raisons de sécurité
- Les données sont stockées localement dans le navigateur (session storage)

## Contact

Pour toute question ou assistance, veuillez contacter votre représentant CyberArk.

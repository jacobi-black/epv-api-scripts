# Guide d'Extension - Création de Nouveaux Dashboards

Ce guide explique comment créer et intégrer un nouveau dashboard dans l'application CyberArk Capacity Planning.

## Table des Matières

1. [Prérequis](#prérequis)
2. [Structure d'un Dashboard](#structure-dun-dashboard)
3. [Étapes de Création](#étapes-de-création)
4. [Intégration avec les Données](#intégration-avec-les-données)
5. [Création des Visualisations](#création-des-visualisations)
6. [Tests et Déploiement](#tests-et-déploiement)

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- Une compréhension des concepts React (composants, hooks, contexte)
- Une familiarité avec Material-UI et ses composants
- Connaissance des bibliothèques de visualisation (Recharts ou Chart.js)
- Compréhension des données CyberArk qui seront utilisées

## Structure d'un Dashboard

Chaque dashboard est généralement composé des éléments suivants :

1. **Page principale** - Vue d'ensemble avec KPIs principaux
2. **Sous-pages** - Vues détaillées pour des aspects spécifiques
3. **Parsers de données** - Pour traiter les fichiers d'entrée
4. **Formateurs** - Pour préparer les données pour l'affichage
5. **Visualisations** - Graphiques et tableaux pour les métriques

## Étapes de Création

### 1. Définition du Dashboard dans la Configuration

Ajoutez votre nouveau dashboard à la liste des dashboards disponibles dans `Home.jsx` :

```jsx
// Dans src/components/pages/Home.jsx
// Ajouter à la liste des catégories de dashboards
const dashboardCategories = {
  // ... catégories existantes
  votreCategorie: [
    {
      id: "votre-dashboard",
      title: "Titre du Dashboard",
      description: "Description de votre dashboard...",
      icon: <VotreIcon sx={{ fontSize: 40 }} />,
      colorIndex: 5, // Choisir un index disponible
      scripts: ["/Chemin/Vers/Script1.ps1", "/Chemin/Vers/Script2.ps1"],
    },
    // autres dashboards dans la même catégorie
  ],
};
```

### 2. Création des Composants de Base

Créez les fichiers de composant suivants :

```
src/
└── components/
    └── pages/
        ├── VotreDashboard.jsx         # Page principale
        ├── VotreDashboardOverview.jsx # Vue d'ensemble
        └── VotreDashboardDetail.jsx   # Vue détaillée
```

Exemple de structure pour la page principale :

```jsx
// src/components/pages/VotreDashboard.jsx
import React, { useState } from "react";
import { useData } from "../../utils/DataContext";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Typography, Grid, Paper, Alert } from "@mui/material";

// Importer les composants de KPI et visualisations
import KPICard from "../ui/KPICard";
import { LineChart, BarChart } from "../charts";

const VotreDashboard = () => {
  // Accès aux données
  const dataContext = useData();
  const navigate = useNavigate();

  // État pour les onglets
  const [activeTab, setActiveTab] = useState(0);

  // Vérifier si les données sont disponibles
  const hasData = dataContext.hasRequiredData("votre-dashboard");

  if (!hasData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Données manquantes pour ce dashboard. Veuillez télécharger les scripts
          requis.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/upload/votre-dashboard")}
        >
          Télécharger les fichiers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Titre de Votre Dashboard
      </Typography>

      {/* KPIs Principaux */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Métrique 1"
            value={dataContext.votreDashboardData.metrique1}
            icon={<MetriqueIcon />}
            color="#4a6fa5"
          />
        </Grid>
        {/* Autres KPIs */}
      </Grid>

      {/* Navigation par onglets */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Vue d'ensemble" />
        <Tab label="Détails" />
        <Tab label="Autres aspects" />
      </Tabs>

      {/* Contenu basé sur l'onglet actif */}
      {activeTab === 0 && (
        <VotreDashboardOverview data={dataContext.votreDashboardData} />
      )}
      {activeTab === 1 && (
        <VotreDashboardDetail data={dataContext.votreDashboardData} />
      )}
      {/* etc. */}
    </Box>
  );
};

export default VotreDashboard;
```

### 3. Configuration du Routage

Ajoutez les routes pour votre dashboard dans `App.jsx` :

```jsx
// Dans src/App.jsx
<Routes>
  {/* ... routes existantes */}

  {/* Routes pour votre nouveau dashboard */}
  <Route path="/votre-dashboard" element={<VotreDashboard />}>
    <Route index element={<VotreDashboardOverview />} />
    <Route path="detail" element={<VotreDashboardDetail />} />
    {/* autres sous-routes si nécessaire */}
  </Route>
</Routes>
```

## Intégration avec les Données

### 1. Création des Parsers

Créez un parser pour traiter les fichiers spécifiques à votre dashboard :

```jsx
// src/utils/parsers/votreDashboardParser.js
export const parseVotreDashboardData = (fileContent) => {
  try {
    // Convertir le contenu du fichier en lignes
    const lines = fileContent.split("\n");

    // Ignorer l'en-tête et parser chaque ligne
    const data = lines
      .slice(1)
      .map((line) => {
        const values = line.split(",");
        return {
          timestamp: values[0],
          metrique1: parseFloat(values[1]),
          metrique2: values[2],
          // etc.
        };
      })
      .filter((item) => item.timestamp); // Filtrer les lignes vides

    return data;
  } catch (error) {
    console.error("Erreur lors du parsing des données:", error);
    return [];
  }
};
```

### 2. Mise à jour du DataContext

Modifiez le `DataContext` pour inclure votre nouveau dashboard :

```jsx
// Dans src/utils/DataContext.jsx
export const DataProvider = ({ children }) => {
  // ... états existants
  const [votreDashboardData, setVotreDashboardData] = useState(null);

  // Méthode pour vérifier si les données requises sont disponibles
  const hasRequiredData = (dashboardType) => {
    switch (dashboardType) {
      // ... cas existants
      case "votre-dashboard":
        return Boolean(votreDashboardData && votreDashboardData.length > 0);
      default:
        return false;
    }
  };

  // Méthode pour définir les données de votre dashboard
  const setVotreDashboardData = (data) => {
    setVotreDashboardData(data);
  };

  // Valeur du contexte
  const contextValue = {
    // ... valeurs existantes
    votreDashboardData,
    setVotreDashboardData,
    hasRequiredData,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};
```

## Création des Visualisations

### 1. Création de Composants de Graphique Réutilisables

```jsx
// src/components/charts/VotreDashboardCharts.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const MetriqueLineChart = ({ data, xKey, yKey, color }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Autres composants de graphique...
```

### 2. Utilisation dans les Vues du Dashboard

```jsx
// Dans VotreDashboardOverview.jsx
import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { MetriqueLineChart } from "../charts/VotreDashboardCharts";

const VotreDashboardOverview = ({ data }) => {
  // Préparation des données pour les graphiques
  const processedData = data.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    metrique1: item.metrique1,
    // etc.
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Évolution de la Métrique 1
          </Typography>
          <MetriqueLineChart
            data={processedData}
            xKey="date"
            yKey="metrique1"
            color="#4a6fa5"
          />
        </Paper>
      </Grid>
      {/* Autres graphiques */}
    </Grid>
  );
};

export default VotreDashboardOverview;
```

## Tests et Déploiement

### 1. Test avec des Données de Démonstration

Créez des données de démonstration pour tester votre dashboard :

```javascript
// src/utils/mockData/votreDashboardMock.js
export const mockVotreDashboardData = [
  {
    timestamp: "2023-01-01T00:00:00",
    metrique1: 85.4,
    metrique2: "Valeur1",
    // etc.
  },
  // Autres entrées...
];
```

### 2. Intégration dans l'Interface d'Upload

Mettez à jour la page `FileUpload.jsx` pour prendre en charge les types de fichiers pour votre dashboard :

```jsx
// Dans src/components/pages/FileUpload.jsx
const dashboardConfig = {
  // ... configurations existantes
  "votre-dashboard": {
    title: "Titre de Votre Dashboard",
    description: "Description de l'upload pour votre dashboard...",
    acceptedFiles: [".csv", ".json"],
    requiredScripts: ["Script1.ps1", "Script2.ps1"],
    processFunction: (fileContent, fileName) => {
      // Appeler votre parser en fonction du nom de fichier
      if (fileName.includes("Script1")) {
        return parseVotreDashboardData(fileContent);
      }
      // etc.
    },
    setDataFunction: (data, dataContext) => {
      dataContext.setVotreDashboardData(data);
    },
  },
};
```

## Bonnes Pratiques

1. **Modularité** - Créez des composants petits et réutilisables
2. **Séparation des Préoccupations** - Séparez logique, présentation et accès aux données
3. **Optimisation des Performances** - Utilisez la mémoisation pour les calculs coûteux
4. **Tests** - Écrivez des tests unitaires pour les parsers et formateurs
5. **Documentation** - Documentez clairement les entrées/sorties de chaque composant

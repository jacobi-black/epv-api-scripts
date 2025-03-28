import React, { useState, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Alert,
  Button,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Import des nouveaux composants améliorés
import {
  LevelSelector,
  EnhancedKPI,
  DataStatusIndicator,
  ExportTools,
  DataSourceInfo,
} from "../common";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const SafesAnalysis = () => {
  const { safesData, safesStats, safeMembersData } = useData();
  const [currentLevel, setCurrentLevel] = useState("operational");
  const dashboardRef = useRef(null);
  const [showDataStatus, setShowDataStatus] = useState(false);

  // Définition des fichiers requis pour ce dashboard
  const requiredFiles = [
    {
      name: "safes-details.csv",
      description: "Données des coffres-forts générées par Safe-Management.ps1",
      script: "Safe-Management.ps1 -Report",
      required: true,
    },
    {
      name: "safe-members.csv",
      description: "Données des membres des coffres-forts",
      script: "Safe-Management.ps1 -Report -OutputPath safe-members.csv",
      required: false,
    },
  ];

  // Vérification des données disponibles
  const hasSafesData = safesData && safesData.length > 0;
  const hasMembersData = safeMembersData && safeMembersData.length > 0;

  // Liste des fichiers présents (en fonction des données disponibles)
  const presentFiles = [];
  if (hasSafesData) presentFiles.push("safes-details.csv");
  if (hasMembersData) presentFiles.push("safe-members.csv");

  // Définition des sources de données avec exemples de commandes
  const dataSources = [
    {
      name: "Safe-Management.ps1",
      type: "script",
      description: "Collecte des informations sur les coffres-forts CyberArk",
      path: "/Safe Management/Safe-Management.ps1",
      command:
        '.\\Safe-Management.ps1 -PVWAURL "https://your-pvwa-server" -Report -OutputPath "safes-details.csv"',
      required: true,
    },
    {
      name: "Safe-Management-Members.ps1",
      type: "script",
      description:
        "Collecte des informations sur les membres des coffres-forts",
      path: "/Safe Management/Safe-Management.ps1",
      command:
        '.\\Safe-Management.ps1 -PVWAURL "https://your-pvwa-server" -Members -SafeName "*" -OutputPath "safe-members.csv"',
      required: false,
    },
  ];

  // Calcul de tendance simulé (à remplacer par calcul réel)
  const calculateTrend = (metric) => {
    return Math.floor(Math.random() * 10) - 5; // Simulé: entre -5% et +5%
  };

  // Si aucune donnée, afficher un message avec statut des données
  if (!hasSafesData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analyse des Coffres-forts
        </Typography>

        <DataStatusIndicator
          requiredFiles={requiredFiles}
          presentFiles={presentFiles}
          onUploadClick={() => console.log("Ouvrir le modal d'upload")}
          showDetailedInfo={showDataStatus}
          setShowDetailedInfo={setShowDataStatus}
        />

        <DataSourceInfo dataSources={dataSources} lastUpdated={null} />

        <Typography variant="body1" color="text.secondary">
          Importez des données de coffres-forts pour visualiser ce dashboard.
        </Typography>
      </Box>
    );
  }

  // Préparer les données pour les graphiques (avec vérification de disponibilité)
  const safeTypesData = safesStats?.safeTypes || [];
  const safeLocationsData = safesStats?.locations || [];
  const safeAccessData = safesStats?.access || [];

  // Extraire les KPI clés
  const totalSafes = safesData.length;
  const typesCount = safeTypesData.length;
  const locationsCount = safeLocationsData.length;

  // KPI supplémentaires (si données de membres disponibles)
  const totalMembers = hasMembersData ? safeMembersData.length : "N/A";
  const avgMembersPerSafe = hasMembersData
    ? (safeMembersData.length / totalSafes).toFixed(1)
    : "N/A";
  const adminCount = hasMembersData
    ? safeMembersData.filter((member) => member.role === "Admin").length
    : "N/A";

  return (
    <Box sx={{ p: 3 }} ref={dashboardRef}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Analyse des Coffres-forts</Typography>
        <LevelSelector onChange={setCurrentLevel} defaultLevel={currentLevel} />
      </Box>

      <DataStatusIndicator
        requiredFiles={requiredFiles}
        presentFiles={presentFiles}
        onUploadClick={() => console.log("Ouvrir le modal d'upload")}
        showDetailedInfo={showDataStatus}
        setShowDetailedInfo={setShowDataStatus}
      />

      {/* Affichage conditionnel basé sur les données disponibles */}
      {!hasMembersData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Les données des membres des coffres-forts ne sont pas disponibles.
          Certaines métriques et visualisations sont limitées.
          <Button
            size="small"
            sx={{ ml: 2 }}
            variant="outlined"
            onClick={() => console.log("Ouvrir le modal d'upload")}
          >
            Importer des données additionnelles
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* KPI Stratégiques - Visibles pour tous les niveaux */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Vue d'Ensemble des Coffres-forts
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Total des Coffres"
                value={totalSafes}
                change={calculateTrend("safes")}
                timeframe="vs mois précédent"
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["Safe-Management.ps1"]}
                description="Nombre total de coffres-forts dans l'environnement"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Types de Coffres"
                value={typesCount}
                change={calculateTrend("types")}
                timeframe="vs mois précédent"
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["Safe-Management.ps1"]}
                description="Nombre de types de coffres-forts différents"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Membres par Coffre"
                value={avgMembersPerSafe}
                unit=""
                change={calculateTrend("members")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 15, danger: 25 }}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["safe-members.csv"]}
                loading={!hasMembersData}
                description="Nombre moyen de membres par coffre-fort"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Comptes Admins"
                value={adminCount}
                change={calculateTrend("admins")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 10, danger: 20 }}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["safe-members.csv"]}
                loading={!hasMembersData}
                description="Nombre total de comptes avec droits d'administration"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Graphique des types de coffres-forts - Visible pour tous les niveaux */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Répartition par Type de Coffre-fort
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeTypesData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {safeTypesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Graphique des emplacements - Visible pour les niveaux tactique et opérationnel */}
        {(currentLevel === "tactical" || currentLevel === "operational") && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Répartition par Emplacement
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeLocationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} coffres`, "Nombre"]}
                    />
                    <Legend />
                    <Bar
                      name="Nombre de coffres"
                      dataKey="count"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Graphique des accès - Visible uniquement si les données de membres sont disponibles */}
        {hasMembersData &&
          (currentLevel === "tactical" || currentLevel === "operational") && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Distribution des Accès aux Coffres-forts
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeAccessData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="access" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} membres`, "Nombre"]}
                      />
                      <Legend />
                      <Bar
                        name="Nombre de membres"
                        dataKey="count"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}

        {/* Message de substitution quand les données de membres ne sont pas disponibles */}
        {!hasMembersData &&
          (currentLevel === "tactical" || currentLevel === "operational") && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  border: "1px dashed rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 200,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Distribution des Accès aux Coffres-forts
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 2 }}
                >
                  Les données détaillées des membres des coffres-forts ne sont
                  pas disponibles pour générer cette visualisation.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => console.log("Ouvrir le modal d'upload")}
                >
                  Importer les données des membres
                </Button>
              </Paper>
            </Grid>
          )}
      </Grid>

      {/* Données opérationnelles détaillées - Visibles uniquement au niveau opérationnel */}
      {currentLevel === "operational" && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" gutterBottom>
            Détails Opérationnels
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <EnhancedKPI
                title="Taille des Coffres"
                value={(
                  safesData.reduce((acc, safe) => acc + (safe.size || 0), 0) /
                  (1024 * 1024)
                ).toFixed(2)}
                unit="GB"
                change={calculateTrend("size")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 500, danger: 1000 }}
                level="operational"
                currentLevel={currentLevel}
                dataSources={["Safe-Management.ps1"]}
                description="Taille totale des coffres-forts en gigaoctets"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <EnhancedKPI
                title="Coffres sans CPM"
                value={safesData.filter((safe) => !safe.managingCPM).length}
                change={calculateTrend("noCPM")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 5, danger: 10 }}
                level="operational"
                currentLevel={currentLevel}
                dataSources={["Safe-Management.ps1"]}
                description="Nombre de coffres sans CPM assigné"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <EnhancedKPI
                title="Coffres Système"
                value={safesData.filter((safe) => safe.isSystem).length}
                unit=""
                change={calculateTrend("system")}
                timeframe="vs mois précédent"
                level="operational"
                currentLevel={currentLevel}
                dataSources={["Safe-Management.ps1"]}
                description="Nombre de coffres système"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Informations sur les sources de données */}
      <DataSourceInfo
        dataSources={dataSources}
        lastUpdated={new Date().toISOString()}
      />

      {/* Outil d'export */}
      <ExportTools
        data={safesData}
        containerRef={dashboardRef}
        title="Analyse des Coffres-forts"
        filename="safes-analysis-report"
      />
    </Box>
  );
};

export default SafesAnalysis;

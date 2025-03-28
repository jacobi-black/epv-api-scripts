import React, { useState, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  Button,
  Divider,
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AccountsAnalysis = () => {
  const { accountsData, accountsStats, platformsData } = useData();
  const [currentLevel, setCurrentLevel] = useState("operational");
  const dashboardRef = useRef(null);
  const [showDataStatus, setShowDataStatus] = useState(false);

  // Définition des fichiers requis pour ce dashboard
  const requiredFiles = [
    {
      name: "accounts.csv",
      description: "Données des comptes générées par Get-Accounts.ps1",
      script: "Get-Accounts.ps1",
      required: true,
    },
    {
      name: "platforms.csv",
      description: "Informations sur les plateformes",
      script: "Get-Platforms.ps1",
      required: false,
    },
  ];

  // Vérification des données disponibles
  const hasAccountsData = accountsData && accountsData.length > 0;
  const hasPlatformsData = platformsData && platformsData.length > 0;

  // Liste des fichiers présents (en fonction des données disponibles)
  const presentFiles = [];
  if (hasAccountsData) presentFiles.push("accounts.csv");
  if (hasPlatformsData) presentFiles.push("platforms.csv");

  // Définition des sources de données avec exemples de commandes
  const dataSources = [
    {
      name: "Get-Accounts.ps1",
      type: "script",
      description: "Collecte des informations sur les comptes CyberArk",
      path: "/Get Accounts/Get-Accounts.ps1",
      command:
        '.\\Get-Accounts.ps1 -PVWAURL "https://your-pvwa-server" -CSVPath "accounts.csv"',
      required: true,
    },
    {
      name: "Get-Platforms.ps1",
      type: "script",
      description: "Collecte des informations sur les plateformes CyberArk",
      path: "/Get Accounts/Get-Platforms.ps1",
      command:
        '.\\Get-Platforms.ps1 -PVWAURL "https://your-pvwa-server" -CSVPath "platforms.csv"',
      required: false,
    },
  ];

  // Calcul de tendance simulé (à remplacer par calcul réel)
  const calculateTrend = (metric) => {
    return Math.floor(Math.random() * 10) - 5; // Simulé: entre -5% et +5%
  };

  // Si aucune donnée, afficher un message avec statut des données
  if (!hasAccountsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analyse des Comptes
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
          Importez des données de comptes pour visualiser ce dashboard.
        </Typography>
      </Box>
    );
  }

  // Préparer les données pour les graphiques
  const accountTypesData = accountsStats?.accountTypes || [];
  const platformData = accountsStats?.platforms || [];
  const safeData = accountsStats?.safes || [];

  // Extraire les KPI clés
  const totalAccounts = accountsData.length;
  const uniquePlatforms = platformData.length;
  const uniqueSafes = safeData.length;

  // KPI supplémentaires (pour niveaux tactique et opérationnel)
  const accountsWithoutPassword = accountsData.filter(
    (account) => !account.hasPassword
  ).length;
  const automaticAccounts = accountsData.filter(
    (account) => account.automaticManagement
  ).length;
  const manualAccounts = accountsData.filter(
    (account) => !account.automaticManagement
  ).length;
  const accountsInReconciliation = accountsData.filter(
    (account) => account.status === "Reconciliation"
  ).length;

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
        <Typography variant="h5">Analyse des Comptes</Typography>
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
      {!hasPlatformsData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Les données détaillées des plateformes ne sont pas disponibles.
          Certaines métriques sont limitées.
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
            Vue d'Ensemble des Comptes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Total des Comptes"
                value={totalAccounts}
                change={calculateTrend("accounts")}
                timeframe="vs mois précédent"
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Nombre total de comptes dans le système"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Plateformes Distinctes"
                value={uniquePlatforms}
                change={calculateTrend("platforms")}
                timeframe="vs mois précédent"
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Nombre de plateformes différentes utilisées"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Coffres Utilisés"
                value={uniqueSafes}
                change={calculateTrend("safes")}
                timeframe="vs mois précédent"
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Nombre de coffres contenant des comptes"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Comptes Gérés Auto."
                value={automaticAccounts}
                change={calculateTrend("automatic")}
                timeframe="vs mois précédent"
                percentage={(automaticAccounts / totalAccounts) * 100}
                thresholds={{ warning: 70, danger: 50, inverse: true }}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes gérés automatiquement par CPM"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Graphique des types de comptes - Visible pour tous les niveaux */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Répartition par Type de Compte
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountTypesData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {accountTypesData.map((entry, index) => (
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

        {/* Graphique des plateformes - Visible pour les niveaux tactique et opérationnel */}
        {(currentLevel === "tactical" || currentLevel === "operational") && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Répartition par Plateforme
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} comptes`, "Nombre"]}
                    />
                    <Legend />
                    <Bar
                      name="Nombre de comptes"
                      dataKey="count"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Top 10 des safes - Visible pour tous les niveaux */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 des Safes par Nombre de Comptes
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="safe" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} comptes`, "Nombre"]}
                  />
                  <Legend />
                  <Bar
                    name="Nombre de comptes"
                    dataKey="count"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Données tactiques - Visibles pour les niveaux tactique et opérationnel */}
      {(currentLevel === "tactical" || currentLevel === "operational") && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" gutterBottom>
            Métriques de Gestion
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Comptes Manuels"
                value={manualAccounts}
                change={calculateTrend("manual")}
                timeframe="vs mois précédent"
                percentage={(manualAccounts / totalAccounts) * 100}
                thresholds={{ warning: 30, danger: 50 }}
                level="tactical"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes gérés manuellement"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Sans Mot de Passe"
                value={accountsWithoutPassword}
                change={calculateTrend("noPassword")}
                timeframe="vs mois précédent"
                percentage={(accountsWithoutPassword / totalAccounts) * 100}
                thresholds={{ warning: 5, danger: 10 }}
                level="tactical"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes sans mot de passe défini"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="En Réconciliation"
                value={accountsInReconciliation}
                change={calculateTrend("reconciliation")}
                timeframe="vs mois précédent"
                percentage={(accountsInReconciliation / totalAccounts) * 100}
                thresholds={{ warning: 5, danger: 10 }}
                level="tactical"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes en processus de réconciliation"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Comptes par Coffre"
                value={(totalAccounts / uniqueSafes).toFixed(1)}
                unit=""
                change={calculateTrend("accountsPerSafe")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 100, danger: 200 }}
                level="tactical"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Moyenne de comptes par coffre-fort"
              />
            </Grid>
          </Grid>
        </>
      )}

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
                title="Échecs de Connexion"
                value={
                  accountsData.filter((account) => account.lastLogonFailed)
                    .length
                }
                change={calculateTrend("logonFailed")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 5, danger: 10 }}
                level="operational"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes avec des échecs de connexion récents"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <EnhancedKPI
                title="Comptes Désactivés"
                value={
                  accountsData.filter((account) => account.disabled).length
                }
                change={calculateTrend("disabled")}
                timeframe="vs mois précédent"
                level="operational"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes désactivés dans le système"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <EnhancedKPI
                title="Échecs de Vérification"
                value={
                  accountsData.filter(
                    (account) => account.verificationStatus === "Failed"
                  ).length
                }
                change={calculateTrend("verificationFailed")}
                timeframe="vs mois précédent"
                thresholds={{ warning: 3, danger: 10 }}
                level="operational"
                currentLevel={currentLevel}
                dataSources={["Get-Accounts.ps1"]}
                description="Comptes avec échec de vérification"
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
        data={accountsData}
        containerRef={dashboardRef}
        title="Analyse des Comptes"
        filename="accounts-analysis-report"
      />
    </Box>
  );
};

export default AccountsAnalysis;

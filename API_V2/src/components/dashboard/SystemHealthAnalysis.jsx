import React, { useState, useRef } from "react";
import { Box, Grid, Paper, Typography, Divider } from "@mui/material";
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
  LineChart,
  Line,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// Import des nouveaux composants améliorés
import {
  LevelSelector,
  EnhancedKPI,
  DataStatusIndicator,
  ExportTools,
  DataSourceInfo,
} from "../common";
import { EnhancedLineChart } from "../charts";

const SystemHealthAnalysis = () => {
  const { systemHealthData, systemHealthStats } = useData();
  const [currentLevel, setCurrentLevel] = useState("operational");
  const dashboardRef = useRef(null);
  const [showDataStatus, setShowDataStatus] = useState(false);

  // Définition des fichiers requis pour ce dashboard
  const requiredFiles = [
    {
      name: "system-health.csv",
      description: "Données de santé système générées par System-Health.ps1",
      script: "System-Health.ps1",
      required: true,
    },
    {
      name: "components-status.csv",
      description: "État détaillé des composants",
      script: "System-Health.ps1 -ComponentStatus",
      required: false,
    },
  ];

  // Liste des fichiers présents (ceci devrait être remplacé par la vérification réelle)
  const presentFiles = systemHealthData.length ? ["system-health.csv"] : [];

  // Définition des sources de données avec exemples de commandes
  const dataSources = [
    {
      name: "System-Health.ps1",
      type: "script",
      description: "Collecte des informations de santé des composants CyberArk",
      path: "/System Health/System-Health.ps1",
      command:
        '.\\System-Health.ps1 -PVWAURL "https://your-pvwa-server" -CSVPath "system-health.csv"',
      required: true,
    },
    {
      name: "Get-SystemComponents.ps1",
      type: "script",
      description: "Détails sur les composants du système",
      path: "/System Health/Get-SystemComponents.ps1",
      command:
        '.\\Get-SystemComponents.ps1 -PVWAURL "https://your-pvwa-server" -CSVPath "components-status.csv"',
      required: false,
    },
  ];

  // Calcul de tendance et métrique simulés (à remplacer par calcul réel)
  const calculateTrend = (metric) => {
    return Math.floor(Math.random() * 10) - 5; // Simulé: entre -5% et +5%
  };

  if (!systemHealthData.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analyse de la Santé Système
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
          Importez des données de santé système pour visualiser ce dashboard.
        </Typography>
      </Box>
    );
  }

  // Préparer les données pour les graphiques
  const componentStatusData = systemHealthStats?.componentStatus || [];
  const performanceData = systemHealthStats?.performance || [];
  const resourceUsageData = systemHealthStats?.resourceUsage || [];

  // Extraction des KPI stratégiques
  const componentsCount = systemHealthData.length;
  const errorComponentsCount = componentStatusData.filter(
    (c) => c.status === "error"
  ).length;
  const errorRate = (errorComponentsCount / componentsCount) * 100;
  const maintenanceComponentsCount = componentStatusData.filter(
    (c) => c.status === "maintenance"
  ).length;

  // Extraction des KPI tactiques
  const cpuUsageAvg =
    resourceUsageData.find((r) => r.resource === "CPU")?.usage || 0;
  const memoryUsageAvg =
    resourceUsageData.find((r) => r.resource === "Memory")?.usage || 0;
  const diskUsageAvg =
    resourceUsageData.find((r) => r.resource === "Disk")?.usage || 0;

  // Performance metrics
  const responseTimeAvg =
    performanceData.find((p) => p.metric === "Response Time")?.value || 0;

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
        <Typography variant="h5">Analyse de la Santé Système</Typography>
        <LevelSelector onChange={setCurrentLevel} defaultLevel={currentLevel} />
      </Box>

      <DataStatusIndicator
        requiredFiles={requiredFiles}
        presentFiles={presentFiles}
        onUploadClick={() => console.log("Ouvrir le modal d'upload")}
        showDetailedInfo={showDataStatus}
        setShowDetailedInfo={setShowDataStatus}
      />

      <Grid container spacing={3}>
        {/* KPI Stratégiques - Visibles pour tous les niveaux */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            État Général du Système
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="État Global"
                value={
                  errorRate < 5 ? "Bon" : errorRate < 15 ? "Moyen" : "Critique"
                }
                thresholds={{ warning: 5, danger: 15 }}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["System-Health.ps1"]}
                description="Évaluation globale de la santé du système basée sur les composants en erreur"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Taux d'Erreur"
                value={errorRate.toFixed(1)}
                unit="%"
                change={calculateTrend("errorRate")}
                timeframe="vs semaine précédente"
                thresholds={{ warning: 5, danger: 15 }}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["System-Health.ps1"]}
                description="Pourcentage de composants en état d'erreur"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Temps de Réponse"
                value={responseTimeAvg}
                unit="ms"
                change={calculateTrend("responseTime")}
                timeframe="vs semaine précédente"
                thresholds={{ warning: 200, danger: 500 }}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["System-Health.ps1"]}
                description="Temps de réponse moyen des composants CyberArk"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <EnhancedKPI
                title="Composants Opérationnels"
                value={(
                  ((componentsCount -
                    errorComponentsCount -
                    maintenanceComponentsCount) /
                    componentsCount) *
                  100
                ).toFixed(1)}
                unit="%"
                change={calculateTrend("operational")}
                timeframe="vs semaine précédente"
                thresholds={{ warning: 90, danger: 80 }}
                inverseThreshold={true}
                level="strategic"
                currentLevel={currentLevel}
                dataSources={["System-Health.ps1"]}
                description="Pourcentage de composants pleinement opérationnels"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* KPI Tactiques - Visibles pour les niveaux tactical et operational */}
        {(currentLevel === "tactical" || currentLevel === "operational") && (
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Performance et Ressources
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <EnhancedKPI
                  title="Utilisation CPU"
                  value={cpuUsageAvg}
                  unit="%"
                  change={calculateTrend("cpu")}
                  timeframe="vs hier"
                  thresholds={{ warning: 70, danger: 90 }}
                  level="tactical"
                  currentLevel={currentLevel}
                  dataSources={["System-Health.ps1"]}
                  description="Utilisation moyenne du CPU sur tous les serveurs"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EnhancedKPI
                  title="Utilisation Mémoire"
                  value={memoryUsageAvg}
                  unit="%"
                  change={calculateTrend("memory")}
                  timeframe="vs hier"
                  thresholds={{ warning: 75, danger: 90 }}
                  level="tactical"
                  currentLevel={currentLevel}
                  dataSources={["System-Health.ps1"]}
                  description="Utilisation moyenne de la mémoire sur tous les serveurs"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EnhancedKPI
                  title="Utilisation Disque"
                  value={diskUsageAvg}
                  unit="%"
                  change={calculateTrend("disk")}
                  timeframe="vs hier"
                  thresholds={{ warning: 80, danger: 90 }}
                  level="tactical"
                  currentLevel={currentLevel}
                  dataSources={["System-Health.ps1"]}
                  description="Utilisation moyenne du disque sur tous les serveurs"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <EnhancedKPI
                  title="Composants en Maintenance"
                  value={maintenanceComponentsCount}
                  change={calculateTrend("maintenance")}
                  timeframe="vs semaine précédente"
                  level="tactical"
                  currentLevel={currentLevel}
                  dataSources={["System-Health.ps1"]}
                  description="Nombre de composants en maintenance planifiée"
                />
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Graphique amélioré - Performance */}
        {(currentLevel === "tactical" || currentLevel === "operational") && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Métriques de Performance
              </Typography>
              <EnhancedLineChart
                data={performanceData}
                height={300}
                lines={[
                  { dataKey: "value", displayName: "Valeur", unit: "ms" },
                ]}
                xAxisDataKey="metric"
                xAxisLabel="Métrique"
                yAxisLabel="Valeur"
                references={[
                  {
                    axis: "y",
                    value: 200,
                    label: "Seuil d'alerte",
                    color: (theme) => theme.palette.warning.main,
                  },
                  {
                    axis: "y",
                    value: 500,
                    label: "Seuil critique",
                    color: (theme) => theme.palette.error.main,
                  },
                ]}
                thresholds={[
                  {
                    y1: 200,
                    y2: 500,
                    color: "rgba(255, 193, 7, 0.1)",
                    label: "Zone d'alerte",
                  },
                  {
                    y1: 500,
                    y2: 1000,
                    color: "rgba(244, 67, 54, 0.1)",
                    label: "Zone critique",
                  },
                ]}
              />
            </Paper>
          </Grid>
        )}

        {/* Graphique amélioré - Utilisation des ressources */}
        {(currentLevel === "tactical" || currentLevel === "operational") && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Utilisation des Ressources
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="resource" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Utilisation"]}
                    />
                    <Legend />
                    <ReferenceLine
                      y={80}
                      stroke="#ff9800"
                      strokeDasharray="3 3"
                      label={{
                        value: "Seuil d'alerte",
                        position: "right",
                        fill: "#ff9800",
                      }}
                    />
                    <ReferenceLine
                      y={90}
                      stroke="#f44336"
                      strokeDasharray="3 3"
                      label={{
                        value: "Seuil critique",
                        position: "right",
                        fill: "#f44336",
                      }}
                    />
                    <Bar
                      dataKey="usage"
                      fill="#82ca9d"
                      name="Utilisation"
                      background={{ fill: "#eee" }}
                      label={{ position: "top", fill: "#666" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Graphique détaillé - Uniquement visible au niveau opérationnel */}
        {currentLevel === "operational" && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                État Détaillé des Composants
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={componentStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="component" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Nombre" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Informations sur les sources de données */}
      <DataSourceInfo
        dataSources={dataSources}
        lastUpdated={new Date().toISOString()}
      />

      {/* Outil d'export */}
      <ExportTools
        data={systemHealthData}
        containerRef={dashboardRef}
        title="Analyse de la Santé Système"
        filename="system-health-report"
      />
    </Box>
  );
};

export default SystemHealthAnalysis;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import SecurityIcon from "@mui/icons-material/Security";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyIcon from "@mui/icons-material/Key";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";

// Enregistrer les éléments requis pour Chart.js
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const IncidentResponse = ({ subview }) => {
  const dataContext = useData();
  const { riskData, systemHealthData } = dataContext;
  const [incidentStats, setIncidentStats] = useState(null);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [emergencyAccess, setEmergencyAccess] = useState([]);

  // Vérifier si les données nécessaires sont disponibles - Pour la démo, on va simuler avoir des données
  const hasRequiredData = true; // riskData?.length > 0 || systemHealthData?.length > 0;

  // Générer les statistiques d'incidents
  useEffect(() => {
    if (hasRequiredData) {
      // Statistiques simulées d'incidents
      const stats = {
        totalIncidents: 127,
        activeIncidents: 14,
        resolvedIncidents: 113,
        criticalIncidents: 8,
        highIncidents: 23,
        mediumIncidents: 52,
        lowIncidents: 44,
        avgResolutionTime: 4.2, // en heures
        emergencyAccessCount: 17,
        incidentsByType: {
          Sécurité: 42,
          Performance: 35,
          Accès: 29,
          Configuration: 15,
          Autre: 6,
        },
        incidentsBySource: {
          Système: 35,
          Utilisateur: 48,
          Automatique: 29,
          Audit: 15,
        },
        incidentsByMonth: [8, 12, 10, 14, 9, 11, 13, 15, 10, 12, 7, 8],
        resolutionTimeByType: {
          Sécurité: 6.5,
          Performance: 3.2,
          Accès: 2.8,
          Configuration: 4.7,
          Autre: 3.5,
        },
      };

      // Incidents actifs simulés
      const now = new Date();
      const active = Array(stats.activeIncidents)
        .fill()
        .map((_, i) => {
          const createdAt = new Date(now.getTime() - Math.random() * 259200000); // jusqu'à 3 jours
          const types = [
            "Sécurité",
            "Performance",
            "Accès",
            "Configuration",
            "Autre",
          ];
          const type = types[Math.floor(Math.random() * types.length)];
          const severities = ["Critique", "Élevée", "Moyenne", "Faible"];
          const severityWeights = [0.1, 0.2, 0.4, 0.3]; // probabilités pour chaque sévérité
          let severityIndex = 0;
          const rand = Math.random();
          let cumulativeWeight = 0;
          for (let j = 0; j < severityWeights.length; j++) {
            cumulativeWeight += severityWeights[j];
            if (rand < cumulativeWeight) {
              severityIndex = j;
              break;
            }
          }
          const severity = severities[severityIndex];

          const sources = ["Système", "Utilisateur", "Automatique", "Audit"];
          const source = sources[Math.floor(Math.random() * sources.length)];

          const titles = [
            "Tentative d'accès non autorisée",
            "Performance dégradée du serveur",
            "Échec d'authentification multiple",
            "Certificat expiré",
            "Coffre inaccessible",
            "Service CyberArk arrêté",
            "Erreur de synchronisation",
            "Violation de politique d'accès",
            "Compte déverrouillé en dehors des heures",
            "Erreur de rotation de mot de passe",
          ];
          const title = titles[Math.floor(Math.random() * titles.length)];

          return {
            id: `INC-${1000 + i}`,
            title,
            description: `Description détaillée de l'incident ${title.toLowerCase()}.`,
            type,
            severity,
            status: "Actif",
            createdAt: createdAt.toISOString(),
            source,
            assignedTo:
              Math.random() > 0.3
                ? ["John Doe", "Jane Smith", "Robert Johnson", "Emma Wilson"][
                    Math.floor(Math.random() * 4)
                  ]
                : "Non assigné",
            affectedSystems: ["Vault", "PVWA", "CPM", "PSM", "Cloud Platform"][
              Math.floor(Math.random() * 5)
            ],
            progress: Math.floor(Math.random() * 80),
            estimatedResolution:
              severity === "Critique"
                ? 2
                : severity === "Élevée"
                ? 8
                : severity === "Moyenne"
                ? 24
                : 48, // heures
            priority:
              severity === "Critique"
                ? "P1"
                : severity === "Élevée"
                ? "P2"
                : severity === "Moyenne"
                ? "P3"
                : "P4",
          };
        });

      // Historique des incidents simulé
      const history = Array(30)
        .fill()
        .map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const formattedDate = date.toISOString().split("T")[0];

          const dailyIncidents = Math.floor(Math.random() * 5) + 1;
          const dailyCritical =
            Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
          const dailyHigh = Math.floor(Math.random() * 3);
          const dailyMedium = Math.floor(Math.random() * 3);
          const dailyLow =
            dailyIncidents - (dailyCritical + dailyHigh + dailyMedium);

          const resolutionTime = Math.random() * 8 + 2;

          return {
            date: formattedDate,
            totalIncidents: dailyIncidents,
            criticalIncidents: dailyCritical,
            highIncidents: dailyHigh,
            mediumIncidents: dailyMedium,
            lowIncidents: dailyLow,
            avgResolutionTime: resolutionTime,
            emergencyAccess: Math.random() > 0.8 ? 1 : 0,
            bySeverity: {
              Critique: dailyCritical,
              Élevée: dailyHigh,
              Moyenne: dailyMedium,
              Faible: dailyLow,
            },
          };
        });

      // Accès d'urgence simulés
      const emergency = Array(stats.emergencyAccessCount)
        .fill()
        .map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 60));
          const duration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
          const users = [
            "admin",
            "john.smith",
            "emma.wilson",
            "robert.johnson",
            "security.officer",
          ];
          const user = users[Math.floor(Math.random() * users.length)];
          const targets = [
            "Production DB",
            "Core Server",
            "Payment Gateway",
            "Authentication Service",
            "Customer Data",
          ];
          const target = targets[Math.floor(Math.random() * targets.length)];

          return {
            id: `EA-${1000 + i}`,
            user,
            target,
            accessDate: date.toISOString(),
            duration, // minutes
            reason: [
              "Incident de production",
              "Panne système",
              "Problème de sécurité",
              "Maintenance d'urgence",
              "Demande direction",
            ][Math.floor(Math.random() * 5)],
            approvedBy: ["security.manager", "it.director", "system.admin"][
              Math.floor(Math.random() * 3)
            ],
            status:
              date > new Date(Date.now() - 86400000) ? "Actif" : "Terminé",
            linkedIncident:
              Math.random() > 0.3
                ? `INC-${
                    1000 + Math.floor(Math.random() * stats.totalIncidents)
                  }`
                : "N/A",
          };
        });

      setIncidentStats(stats);
      setActiveIncidents(active);
      setIncidentHistory(history);
      setEmergencyAccess(emergency);
    }
  }, [hasRequiredData]);

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard de réponse aux
        incidents. Veuillez importer les fichiers de risque et d'état du
        système.
      </Alert>
    );
  }

  // Préparer les données pour les graphiques
  const incidentTypeData = {
    labels: incidentStats ? Object.keys(incidentStats.incidentsByType) : [],
    datasets: [
      {
        data: incidentStats ? Object.values(incidentStats.incidentsByType) : [],
        backgroundColor: [
          "#f44336",
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
        ],
        borderWidth: 1,
      },
    ],
  };

  const incidentSourceData = {
    labels: incidentStats ? Object.keys(incidentStats.incidentsBySource) : [],
    datasets: [
      {
        data: incidentStats
          ? Object.values(incidentStats.incidentsBySource)
          : [],
        backgroundColor: ["#2196f3", "#4caf50", "#ff9800", "#9c27b0"],
        borderWidth: 1,
      },
    ],
  };

  const incidentTrendData = {
    labels: incidentHistory
      .slice(0, 14)
      .reverse()
      .map((h) => h.date),
    datasets: [
      {
        label: "Incidents critiques",
        data: incidentHistory
          .slice(0, 14)
          .reverse()
          .map((h) => h.criticalIncidents),
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.1)",
        tension: 0.3,
      },
      {
        label: "Incidents élevés",
        data: incidentHistory
          .slice(0, 14)
          .reverse()
          .map((h) => h.highIncidents),
        borderColor: "#ff9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        tension: 0.3,
      },
      {
        label: "Incidents moyens",
        data: incidentHistory
          .slice(0, 14)
          .reverse()
          .map((h) => h.mediumIncidents),
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.3,
      },
      {
        label: "Incidents faibles",
        data: incidentHistory
          .slice(0, 14)
          .reverse()
          .map((h) => h.lowIncidents),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.3,
      },
    ],
  };

  const resolutionTimeData = {
    labels: incidentStats
      ? Object.keys(incidentStats.resolutionTimeByType)
      : [],
    datasets: [
      {
        label: "Temps de résolution moyen (heures)",
        data: incidentStats
          ? Object.values(incidentStats.resolutionTimeByType)
          : [],
        backgroundColor: [
          "#f44336",
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "active":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Incidents Actifs
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Liste des incidents en cours
                  </Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Titre</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Sévérité</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Créé le</TableCell>
                          <TableCell>Système affecté</TableCell>
                          <TableCell>Assigné à</TableCell>
                          <TableCell>Priorité</TableCell>
                          <TableCell>Progrès</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeIncidents.map((incident) => (
                          <TableRow
                            key={incident.id}
                            sx={{
                              bgcolor:
                                incident.severity === "Critique"
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : incident.severity === "Élevée"
                                  ? "rgba(255, 152, 0, 0.1)"
                                  : "inherit",
                            }}
                          >
                            <TableCell>{incident.id}</TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {incident.severity === "Critique" && (
                                  <Tooltip title="Critique - Résolution urgente requise">
                                    <PriorityHighIcon
                                      fontSize="small"
                                      color="error"
                                      sx={{ mr: 1 }}
                                    />
                                  </Tooltip>
                                )}
                                <Typography variant="body2">
                                  {incident.title}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{incident.type}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={incident.severity}
                                color={
                                  incident.severity === "Critique"
                                    ? "error"
                                    : incident.severity === "Élevée"
                                    ? "warning"
                                    : incident.severity === "Moyenne"
                                    ? "info"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>{incident.source}</TableCell>
                            <TableCell>
                              {new Date(incident.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{incident.affectedSystems}</TableCell>
                            <TableCell>
                              {incident.assignedTo === "Non assigné" ? (
                                <Chip
                                  size="small"
                                  label="Non assigné"
                                  color="error"
                                />
                              ) : (
                                incident.assignedTo
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={incident.priority}
                                color={
                                  incident.priority === "P1"
                                    ? "error"
                                    : incident.priority === "P2"
                                    ? "warning"
                                    : incident.priority === "P3"
                                    ? "info"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box sx={{ width: "100%", mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={incident.progress}
                                    color={
                                      incident.progress < 30
                                        ? "error"
                                        : incident.progress < 70
                                        ? "warning"
                                        : "success"
                                    }
                                    sx={{ height: 8, borderRadius: 5 }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >{`${incident.progress}%`}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Incidents par type
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {incidentStats && <Pie data={incidentTypeData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Incidents par source
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {incidentStats && <Pie data={incidentSourceData} />}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "resolution":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Résolution et MTTR
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Temps moyen de résolution par type d'incident
                  </Typography>
                  <Box sx={{ height: 350, mt: 2 }}>
                    <Bar
                      data={resolutionTimeData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Heures",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Historique des temps de résolution
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Line
                      data={{
                        labels: incidentHistory
                          .slice(0, 14)
                          .reverse()
                          .map((h) => h.date),
                        datasets: [
                          {
                            label: "Temps moyen de résolution (heures)",
                            data: incidentHistory
                              .slice(0, 14)
                              .reverse()
                              .map((h) => h.avgResolutionTime),
                            borderColor: "#2196f3",
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                            tension: 0.3,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Heures",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance de résolution par sévérité
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Sévérité</TableCell>
                          <TableCell>Temps moyen (h)</TableCell>
                          <TableCell>Objectif SLA (h)</TableCell>
                          <TableCell>Performance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Chip size="small" label="Critique" color="error" />
                          </TableCell>
                          <TableCell>4.5</TableCell>
                          <TableCell>2.0</TableCell>
                          <TableCell>
                            <Chip size="small" label="-125%" color="error" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip size="small" label="Élevée" color="warning" />
                          </TableCell>
                          <TableCell>6.8</TableCell>
                          <TableCell>8.0</TableCell>
                          <TableCell>
                            <Chip size="small" label="+15%" color="success" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip size="small" label="Moyenne" color="info" />
                          </TableCell>
                          <TableCell>12.5</TableCell>
                          <TableCell>24.0</TableCell>
                          <TableCell>
                            <Chip size="small" label="+48%" color="success" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip size="small" label="Faible" color="success" />
                          </TableCell>
                          <TableCell>36.2</TableCell>
                          <TableCell>48.0</TableCell>
                          <TableCell>
                            <Chip size="small" label="+25%" color="success" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "trends":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Analyse des Tendances
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendance des incidents sur 14 jours
                  </Typography>
                  <Box sx={{ height: 400, mt: 2 }}>
                    <Line
                      data={incidentTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            stacked: true,
                            title: {
                              display: true,
                              text: "Nombre d'incidents",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Date",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Incidents par mois
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Bar
                      data={{
                        labels: [
                          "Jan",
                          "Fév",
                          "Mar",
                          "Avr",
                          "Mai",
                          "Juin",
                          "Juil",
                          "Août",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Déc",
                        ],
                        datasets: [
                          {
                            label: "Nombre d'incidents",
                            data: incidentStats?.incidentsByMonth || [],
                            backgroundColor: "#2196f3",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Accès d'urgence par mois
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Bar
                      data={{
                        labels: Array.from({ length: 6 }, (_, i) => {
                          const date = new Date();
                          date.setMonth(date.getMonth() - 5 + i);
                          return date.toLocaleString("default", {
                            month: "long",
                          });
                        }),
                        datasets: [
                          {
                            label: "Accès d'urgence",
                            data: [4, 2, 3, 5, 1, 2],
                            backgroundColor: "#f44336",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    Dashboard de Réponse aux Incidents
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Suivi et analyse des incidents de sécurité dans
                    l'environnement CyberArk.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#ffebee" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ErrorIcon
                        sx={{ fontSize: 40, mr: 2, color: "#f44336" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Incidents actifs
                        </Typography>
                        <Typography variant="h4">
                          {incidentStats?.activeIncidents || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e3f2fd" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TimerIcon
                        sx={{ fontSize: 40, mr: 2, color: "#2196f3" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Temps moyen de résolution
                        </Typography>
                        <Typography variant="h4">
                          {incidentStats?.avgResolutionTime || "-"} h
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#fff8e1" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <WarningIcon
                        sx={{ fontSize: 40, mr: 2, color: "#ff9800" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Incidents critiques
                        </Typography>
                        <Typography variant="h4">
                          {incidentStats?.criticalIncidents || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#f9fbe7" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <KeyIcon sx={{ fontSize: 40, mr: 2, color: "#827717" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Accès d'urgence
                        </Typography>
                        <Typography variant="h4">
                          {incidentStats?.emergencyAccessCount || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendance des incidents
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Line
                      data={incidentTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Nombre d'incidents",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Incidents par type
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {incidentStats && <Doughnut data={incidentTypeData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Incidents actifs récents
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Titre</TableCell>
                          <TableCell>Sévérité</TableCell>
                          <TableCell>Temps écoulé</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeIncidents.slice(0, 5).map((incident) => {
                          const createdAt = new Date(incident.createdAt);
                          const now = new Date();
                          const hoursElapsed =
                            Math.round(((now - createdAt) / 3600000) * 10) / 10;

                          return (
                            <TableRow key={incident.id}>
                              <TableCell>{incident.id}</TableCell>
                              <TableCell>{incident.title}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={incident.severity}
                                  color={
                                    incident.severity === "Critique"
                                      ? "error"
                                      : incident.severity === "Élevée"
                                      ? "warning"
                                      : incident.severity === "Moyenne"
                                      ? "info"
                                      : "success"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <AccessTimeIcon
                                    fontSize="small"
                                    sx={{ mr: 0.5 }}
                                  />
                                  {hoursElapsed}h
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Accès d'urgence récents
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Utilisateur</TableCell>
                          <TableCell>Cible</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Durée</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {emergencyAccess
                          .sort(
                            (a, b) =>
                              new Date(b.accessDate) - new Date(a.accessDate)
                          )
                          .slice(0, 5)
                          .map((access) => (
                            <TableRow key={access.id}>
                              <TableCell>{access.user}</TableCell>
                              <TableCell>{access.target}</TableCell>
                              <TableCell>
                                {new Date(
                                  access.accessDate
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{access.duration} min</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={access.status}
                                  color={
                                    access.status === "Actif"
                                      ? "error"
                                      : "default"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  return <Box>{renderSubview()}</Box>;
};

export default IncidentResponse;

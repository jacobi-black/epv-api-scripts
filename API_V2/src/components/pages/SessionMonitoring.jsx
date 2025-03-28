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
  LinearProgress,
  Avatar,
  Badge,
  Tooltip,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import ComputerIcon from "@mui/icons-material/Computer";
import SecurityIcon from "@mui/icons-material/Security";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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

const SessionMonitoring = ({ subview }) => {
  const dataContext = useData();
  const { sessionsData, accountsData } = dataContext;
  const [sessionStats, setSessionStats] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [geoData, setGeoData] = useState(null);

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = sessionsData?.length > 0;

  // Calculer les statistiques de sessions
  useEffect(() => {
    if (hasRequiredData) {
      // Générer des données simulées pour les sessions
      const now = new Date();

      // Statistiques générales
      const stats = {
        activeSessions: 42,
        totalSessions: 1875,
        averageDuration: 28, // en minutes
        anomaliesDetected: 15,
        terminatedAbnormally: 23,
        sessionsPerHour: [
          12, 15, 18, 25, 30, 35, 42, 45, 40, 38, 35, 30, 25, 20, 18, 15, 20,
          25, 30, 35, 38, 32, 28, 20,
        ],
        sessionsByType: {
          RDP: 62,
          SSH: 25,
          Database: 8,
          Web: 5,
        },
        sessionsByStatus: {
          Active: 42,
          Suspended: 8,
          Terminated: 1825,
        },
      };

      // Sessions actives
      const active = Array(stats.activeSessions)
        .fill()
        .map((_, i) => {
          const startedAt = new Date(
            now.getTime() - Math.random() * 3600000 * 3
          );
          const duration = Math.round(
            (now.getTime() - startedAt.getTime()) / 60000
          );
          const types = ["RDP", "SSH", "Database", "Web"];
          const type = types[Math.floor(Math.random() * types.length)];
          const usernames = [
            "admin",
            "jsmith",
            "dbadmin",
            "operator",
            "sysadmin",
            "netadmin",
            "secadmin",
          ];
          const username =
            usernames[Math.floor(Math.random() * usernames.length)];
          const targets = [
            "srv-app01",
            "db-prod01",
            "web-svr03",
            "network-sw01",
            "auth-svr02",
          ];
          const target = targets[Math.floor(Math.random() * targets.length)];

          return {
            id: `sess-${i + 1000}`,
            username,
            type,
            target,
            startedAt: startedAt.toISOString(),
            duration,
            status: Math.random() > 0.8 ? "Suspended" : "Active",
            isRecorded: Math.random() > 0.3,
            risk:
              Math.random() > 0.8
                ? "High"
                : Math.random() > 0.5
                ? "Medium"
                : "Low",
          };
        });

      // Anomalies détectées
      const anomaliesData = Array(stats.anomaliesDetected)
        .fill()
        .map((_, i) => {
          const detectedAt = new Date(
            now.getTime() - Math.random() * 86400000 * 3
          );
          const types = [
            "Unusual timing",
            "Excessive privileges",
            "Abnormal behavior",
            "Multiple auth failures",
            "Suspicious geolocation",
          ];
          const type = types[Math.floor(Math.random() * types.length)];
          const usernames = [
            "admin",
            "jsmith",
            "dbadmin",
            "operator",
            "sysadmin",
            "netadmin",
          ];
          const username =
            usernames[Math.floor(Math.random() * usernames.length)];

          return {
            id: `anom-${i + 1000}`,
            username,
            type,
            severity:
              Math.random() > 0.7
                ? "Critical"
                : Math.random() > 0.4
                ? "High"
                : "Medium",
            detectedAt: detectedAt.toISOString(),
            status: Math.random() > 0.3 ? "Open" : "Resolved",
            description: `Anomalie détectée: ${type} for user ${username}`,
          };
        });

      // Données géographiques
      const geoStats = {
        countries: {
          France: 45,
          "United States": 25,
          "United Kingdom": 15,
          Germany: 10,
          Japan: 5,
          Brazil: 3,
          Australia: 2,
          Others: 5,
        },
        cities: {
          Paris: 35,
          "New York": 15,
          London: 10,
          Berlin: 8,
          Tokyo: 5,
          "San Francisco": 7,
          Sydney: 2,
          Others: 18,
        },
      };

      setSessionStats(stats);
      setActiveSessions(active);
      setAnomalies(anomaliesData);
      setGeoData(geoStats);
    }
  }, [sessionsData, hasRequiredData]);

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard de monitoring des
        sessions. Veuillez importer les fichiers de sessions.
      </Alert>
    );
  }

  // Préparer les données pour les graphiques
  const sessionTypeData = {
    labels: sessionStats ? Object.keys(sessionStats.sessionsByType) : [],
    datasets: [
      {
        data: sessionStats ? Object.values(sessionStats.sessionsByType) : [],
        backgroundColor: ["#2196f3", "#4caf50", "#ff9800", "#9c27b0"],
        borderWidth: 1,
      },
    ],
  };

  const sessionStatusData = {
    labels: sessionStats ? Object.keys(sessionStats.sessionsByStatus) : [],
    datasets: [
      {
        data: sessionStats ? Object.values(sessionStats.sessionsByStatus) : [],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
        borderWidth: 1,
      },
    ],
  };

  const geoLocationData = {
    labels: geoData ? Object.keys(geoData.countries) : [],
    datasets: [
      {
        data: geoData ? Object.values(geoData.countries) : [],
        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#9c27b0",
          "#ff9800",
          "#f44336",
          "#795548",
          "#607d8b",
          "#e91e63",
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
              Sessions Actives
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Liste des sessions actives
                  </Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Utilisateur</TableCell>
                          <TableCell>Cible</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Durée</TableCell>
                          <TableCell>Risque</TableCell>
                          <TableCell>Enregistrement</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{session.id}</TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    mr: 1,
                                    bgcolor:
                                      session.risk === "High"
                                        ? "#f44336"
                                        : "#4caf50",
                                  }}
                                >
                                  {session.username.charAt(0).toUpperCase()}
                                </Avatar>
                                {session.username}
                              </Box>
                            </TableCell>
                            <TableCell>{session.target}</TableCell>
                            <TableCell>{session.type}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={session.status}
                                color={
                                  session.status === "Active"
                                    ? "success"
                                    : "warning"
                                }
                              />
                            </TableCell>
                            <TableCell>{session.duration} min</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={session.risk}
                                color={
                                  session.risk === "High"
                                    ? "error"
                                    : session.risk === "Medium"
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {session.isRecorded ? (
                                <Tooltip title="Session enregistrée">
                                  <Badge color="primary" variant="dot">
                                    <SecurityIcon fontSize="small" />
                                  </Badge>
                                </Tooltip>
                              ) : (
                                <SecurityIcon
                                  fontSize="small"
                                  color="disabled"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Répartition par type
                      </Typography>
                      <Box
                        sx={{
                          height: 240,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {sessionStats && <Doughnut data={sessionTypeData} />}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Statistiques
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Sessions actives vs suspendues
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1">Actives</Typography>
                          <Typography variant="body1">
                            {sessionStats?.sessionsByStatus?.Active || 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            sessionStats
                              ? (sessionStats.sessionsByStatus.Active /
                                  (sessionStats.sessionsByStatus.Active +
                                    sessionStats.sessionsByStatus.Suspended)) *
                                100
                              : 0
                          }
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1">Suspendues</Typography>
                          <Typography variant="body1">
                            {sessionStats?.sessionsByStatus?.Suspended || 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            sessionStats
                              ? (sessionStats.sessionsByStatus.Suspended /
                                  (sessionStats.sessionsByStatus.Active +
                                    sessionStats.sessionsByStatus.Suspended)) *
                                100
                              : 0
                          }
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                          color="warning"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );
      case "anomalies":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Analyse Comportementale
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Anomalies détectées récemment
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Utilisateur</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Sévérité</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Date de détection</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {anomalies.map((anomaly) => (
                          <TableRow key={anomaly.id}>
                            <TableCell>{anomaly.id}</TableCell>
                            <TableCell>{anomaly.username}</TableCell>
                            <TableCell>{anomaly.type}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={anomaly.severity}
                                color={
                                  anomaly.severity === "Critical"
                                    ? "error"
                                    : anomaly.severity === "High"
                                    ? "warning"
                                    : "info"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={anomaly.status}
                                color={
                                  anomaly.status === "Open"
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(anomaly.detectedAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Distribution des anomalies par type
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Bar
                      data={{
                        labels: [
                          "Unusual timing",
                          "Excessive privileges",
                          "Abnormal behavior",
                          "Multiple auth failures",
                          "Suspicious geolocation",
                        ],
                        datasets: [
                          {
                            label: "Nombre d'anomalies",
                            data: [4, 3, 5, 2, 1],
                            backgroundColor: [
                              "#f44336",
                              "#ff9800",
                              "#9c27b0",
                              "#2196f3",
                              "#4caf50",
                            ],
                          },
                        ],
                      }}
                      options={{
                        indexAxis: "y",
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendances des anomalies
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Line
                      data={{
                        labels: [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ],
                        datasets: [
                          {
                            label: "Anomalies détectées",
                            data: [5, 7, 8, 12, 15, 10, 13, 17, 15, 12, 14, 15],
                            borderColor: "#f44336",
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                            tension: 0.3,
                          },
                          {
                            label: "Anomalies résolues",
                            data: [4, 6, 7, 10, 14, 8, 11, 14, 12, 10, 12, 11],
                            borderColor: "#4caf50",
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
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
      case "geo":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Visualisation Géographique
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Carte de chaleur des connexions
                  </Typography>
                  <Box
                    sx={{
                      height: 400,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography>
                      Carte interactive non disponible dans cette version de
                      démonstration
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition par pays
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {geoData && <Pie data={geoLocationData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Connexions par localisation
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Pays</TableCell>
                          <TableCell>Ville</TableCell>
                          <TableCell align="right">
                            Nombre de connexions
                          </TableCell>
                          <TableCell>Pourcentage</TableCell>
                          <TableCell>Anomalies</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {geoData &&
                          Object.entries(geoData.countries)
                            .slice(0, 7)
                            .map(([country, count], index) => {
                              const city = Object.keys(geoData.cities)[index];
                              const cityCount = Object.values(geoData.cities)[
                                index
                              ];
                              return (
                                <TableRow key={country}>
                                  <TableCell>{country}</TableCell>
                                  <TableCell>{city}</TableCell>
                                  <TableCell align="right">{count}</TableCell>
                                  <TableCell>
                                    {Math.round(
                                      (count /
                                        Object.values(geoData.countries).reduce(
                                          (a, b) => a + b,
                                          0
                                        )) *
                                        100
                                    )}
                                    %
                                  </TableCell>
                                  <TableCell>
                                    {Math.random() > 0.7 ? (
                                      <Chip
                                        size="small"
                                        label="Anomalie"
                                        color="error"
                                      />
                                    ) : (
                                      <Chip
                                        size="small"
                                        label="Normal"
                                        color="success"
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                    Dashboard de Monitoring des Sessions
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Vue d'ensemble du monitoring des sessions utilisateurs dans
                    l'environnement CyberArk.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e8f5e9" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ComputerIcon
                        sx={{ fontSize: 40, mr: 2, color: "#4caf50" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Sessions actives
                        </Typography>
                        <Typography variant="h4">
                          {sessionStats?.activeSessions || "-"}
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
                      <AccessTimeIcon
                        sx={{ fontSize: 40, mr: 2, color: "#2196f3" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Durée moyenne
                        </Typography>
                        <Typography variant="h4">
                          {sessionStats
                            ? `${sessionStats.averageDuration} min`
                            : "-"}
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
                          Anomalies détectées
                        </Typography>
                        <Typography variant="h4">
                          {sessionStats?.anomaliesDetected || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#ffebee" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <SecurityIcon
                        sx={{ fontSize: 40, mr: 2, color: "#f44336" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Terminées anormalement
                        </Typography>
                        <Typography variant="h4">
                          {sessionStats?.terminatedAbnormally || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Activité des sessions sur 24h
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {sessionStats && (
                      <Line
                        data={{
                          labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                          datasets: [
                            {
                              label: "Nombre de sessions",
                              data: sessionStats.sessionsPerHour,
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
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Sessions par type
                      </Typography>
                      <Box sx={{ height: 140, mt: 2 }}>
                        {sessionStats && <Doughnut data={sessionTypeData} />}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Sessions par statut
                      </Typography>
                      <Box sx={{ height: 140, mt: 2 }}>
                        {sessionStats && <Doughnut data={sessionStatusData} />}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Sessions actives récentes
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Utilisateur</TableCell>
                          <TableCell>Cible</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Durée</TableCell>
                          <TableCell>Risque</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeSessions.slice(0, 6).map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{session.username}</TableCell>
                            <TableCell>{session.target}</TableCell>
                            <TableCell>{session.type}</TableCell>
                            <TableCell>{session.duration} min</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={session.risk}
                                color={
                                  session.risk === "High"
                                    ? "error"
                                    : session.risk === "Medium"
                                    ? "warning"
                                    : "success"
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
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Anomalies récentes
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Utilisateur</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Sévérité</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {anomalies.slice(0, 6).map((anomaly) => (
                          <TableRow key={anomaly.id}>
                            <TableCell>{anomaly.username}</TableCell>
                            <TableCell>{anomaly.type}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={anomaly.severity}
                                color={
                                  anomaly.severity === "Critical"
                                    ? "error"
                                    : anomaly.severity === "High"
                                    ? "warning"
                                    : "info"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={anomaly.status}
                                color={
                                  anomaly.status === "Open"
                                    ? "warning"
                                    : "success"
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

export default SessionMonitoring;

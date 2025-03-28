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
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import AppsIcon from "@mui/icons-material/Apps";
import WarningIcon from "@mui/icons-material/Warning";
import StorageIcon from "@mui/icons-material/Storage";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorIcon from "@mui/icons-material/Error";
import TimerIcon from "@mui/icons-material/Timer";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/Info";
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

const ApplicationUsage = ({ subview }) => {
  const dataContext = useData();
  const { applicationsData, performanceData } = dataContext;
  const [appStats, setAppStats] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [apiPerformance, setApiPerformance] = useState([]);

  // Vérifier si les données nécessaires sont disponibles - Pour la démo, on va simuler avoir des données
  const hasRequiredData = true; // applicationsData?.length > 0 || performanceData?.length > 0;

  // Générer les statistiques d'applications et d'API
  useEffect(() => {
    if (hasRequiredData) {
      // Statistiques simulées pour les applications
      const apps = {
        totalApplications: 42,
        activeApplications: 38,
        inactiveApplications: 4,
        newApplicationsLast30Days: 5,
        applicationsByType: {
          Web: 18,
          Mobile: 8,
          Desktop: 12,
          Autre: 4,
        },
        applicationsByStatus: {
          Actif: 38,
          Inactif: 4,
          "En maintenance": 2,
          "En développement": 3,
        },
        totalApiCalls: 1250489,
        dailyAverageCalls: 41683,
        peakCallsPerDay: 67892,
      };

      // Statistiques simulées pour les API
      const api = {
        totalEndpoints: 78,
        averageResponseTime: 235, // en ms
        errorRate: 1.8, // pourcentage
        callsByEndpointType: {
          Authentication: 582340,
          "Account Management": 325690,
          "Safe Operations": 215780,
          "Platform Management": 98560,
          "Audit & Reports": 28119,
        },
        responseTimesByEndpoint: {
          Authentication: 185,
          "Account Management": 250,
          "Safe Operations": 270,
          "Platform Management": 310,
          "Audit & Reports": 340,
        },
        errorsByType: {
          Authentication: 12,
          Authorization: 18,
          "Resource not found": 32,
          Timeout: 15,
          "Service unavailable": 5,
          Other: 8,
        },
        performanceByHour: [
          230, 225, 220, 218, 215, 220, 240, 270, 310, 325, 310, 295, 305, 315,
          320, 305, 290, 275, 260, 250, 245, 240, 235, 232,
        ],
        callsByHour: [
          800, 600, 450, 350, 300, 450, 1200, 2500, 3800, 4500, 4200, 3800,
          4000, 4300, 4100, 3900, 3500, 3000, 2700, 2300, 1800, 1500, 1200, 900,
        ],
      };

      // Simuler une liste d'applications intégrées
      const appList = Array(apps.totalApplications)
        .fill()
        .map((_, i) => {
          const types = ["Web", "Mobile", "Desktop", "Autre"];
          const type = types[Math.floor(Math.random() * types.length)];
          const statuses = [
            "Actif",
            "Inactif",
            "En maintenance",
            "En développement",
          ];
          const statusWeight = [0.8, 0.1, 0.05, 0.05]; // 80% chance d'être actif
          let statusIndex = 0;
          const rand = Math.random();
          let cumulativeWeight = 0;
          for (let j = 0; j < statusWeight.length; j++) {
            cumulativeWeight += statusWeight[j];
            if (rand < cumulativeWeight) {
              statusIndex = j;
              break;
            }
          }
          const status = statuses[statusIndex];

          const appNames = [
            "ERP System",
            "CRM Portal",
            "HR Management",
            "Inventory Control",
            "Financial Suite",
            "Customer Portal",
            "Logistics Manager",
            "Reporting Tool",
            "Analytics Dashboard",
            "Document Management",
            "Project Tracker",
            "Asset Management",
            "Billing System",
            "Payment Gateway",
            "Security Monitor",
            "Network Manager",
            "Cloud Services",
            "Data Warehouse",
            "Mobile Banking",
            "Trading Platform",
          ];
          const name = `${
            appNames[Math.floor(Math.random() * appNames.length)]
          } ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

          return {
            id: `app-${i + 1000}`,
            name,
            type,
            status,
            integrationDate: new Date(
              Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            ).toISOString(),
            lastActivity: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            apiCallsLast30Days: Math.floor(Math.random() * 10000) + 500,
            errorRate: Math.random() * 3,
            avgResponseTime: Math.floor(Math.random() * 200) + 150, // en ms
            owner: [
              "IT Dept",
              "Security Team",
              "Development",
              "Operations",
              "Finance",
              "HR",
            ][Math.floor(Math.random() * 6)],
            version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(
              Math.random() * 10
            )}.${Math.floor(Math.random() * 10)}`,
          };
        });

      // Simuler les données de performance API par endpoint
      const apiPerf = Object.entries(api.callsByEndpointType).map(
        ([endpoint, calls], i) => {
          return {
            endpoint,
            totalCalls: calls,
            averageResponseTime: api.responseTimesByEndpoint[endpoint],
            errorsCount: Math.floor(calls * (api.errorRate / 100)),
            errorRate: api.errorRate + (Math.random() - 0.5),
            availability: 100 - Math.random() * 0.5,
            peakTimeOfDay: ["10:00", "11:00", "14:00", "15:00", "16:00"][
              Math.floor(Math.random() * 5)
            ],
            slowestOperation: [
              "Create",
              "Read",
              "Update",
              "Delete",
              "List",
              "Search",
            ][Math.floor(Math.random() * 6)],
          };
        }
      );

      // Historical data for trends
      const historicalTrends = Array(12)
        .fill()
        .map((_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toLocaleString("default", { month: "long" }),
            totalCalls: Math.floor(800000 + Math.random() * 500000),
            activeApps: Math.floor(30 + i * 0.8 + (Math.random() * 5 - 2.5)),
            avgResponseTime: Math.floor(
              220 + i * 1.5 + (Math.random() * 30 - 15)
            ),
            errorRate: Math.max(0.5, 2.0 - i * 0.05 + (Math.random() - 0.5)),
          };
        });

      setAppStats(apps);
      setApiStats({ ...api, historicalTrends });
      setApplications(appList);
      setApiPerformance(apiPerf);
    }
  }, [hasRequiredData]);

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard d'utilisation des
        applications. Veuillez importer les fichiers d'applications et de
        performances API.
      </Alert>
    );
  }

  // Préparer les données pour les graphiques
  const appTypeData = {
    labels: appStats ? Object.keys(appStats.applicationsByType) : [],
    datasets: [
      {
        data: appStats ? Object.values(appStats.applicationsByType) : [],
        backgroundColor: ["#2196f3", "#4caf50", "#ff9800", "#9c27b0"],
        borderWidth: 1,
      },
    ],
  };

  const appStatusData = {
    labels: appStats ? Object.keys(appStats.applicationsByStatus) : [],
    datasets: [
      {
        data: appStats ? Object.values(appStats.applicationsByStatus) : [],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800", "#2196f3"],
        borderWidth: 1,
      },
    ],
  };

  const apiCallsData = {
    labels: apiStats ? Object.keys(apiStats.callsByEndpointType) : [],
    datasets: [
      {
        data: apiStats ? Object.values(apiStats.callsByEndpointType) : [],
        backgroundColor: [
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#f44336",
        ],
        borderWidth: 1,
      },
    ],
  };

  const apiErrorsData = {
    labels: apiStats ? Object.keys(apiStats.errorsByType) : [],
    datasets: [
      {
        data: apiStats ? Object.values(apiStats.errorsByType) : [],
        backgroundColor: [
          "#f44336",
          "#ff9800",
          "#2196f3",
          "#9c27b0",
          "#4caf50",
          "#795548",
        ],
        borderWidth: 1,
      },
    ],
  };

  const apiTrendData = {
    labels: apiStats ? apiStats.historicalTrends.map((t) => t.month) : [],
    datasets: [
      {
        label: "Temps de réponse moyen (ms)",
        data: apiStats
          ? apiStats.historicalTrends.map((t) => t.avgResponseTime)
          : [],
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        yAxisID: "y",
        tension: 0.3,
      },
      {
        label: "Taux d'erreur (%)",
        data: apiStats ? apiStats.historicalTrends.map((t) => t.errorRate) : [],
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.1)",
        yAxisID: "y1",
        tension: 0.3,
      },
    ],
  };

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "applications":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Applications Intégrées
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Liste des applications intégrées
                  </Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Date d'intégration</TableCell>
                          <TableCell>Dernière activité</TableCell>
                          <TableCell>Appels API (30j)</TableCell>
                          <TableCell>Taux d'erreur</TableCell>
                          <TableCell>Temps de réponse</TableCell>
                          <TableCell>Propriétaire</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow
                            key={app.id}
                            sx={{
                              bgcolor:
                                app.status === "Inactif"
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : app.errorRate > 2
                                  ? "rgba(255, 152, 0, 0.1)"
                                  : "inherit",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Typography variant="body2">
                                  {app.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ ml: 1 }}
                                >
                                  {app.version}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{app.type}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={app.status}
                                color={
                                  app.status === "Actif"
                                    ? "success"
                                    : app.status === "Inactif"
                                    ? "error"
                                    : app.status === "En maintenance"
                                    ? "warning"
                                    : "info"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(
                                app.integrationDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(app.lastActivity).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {app.apiCallsLast30Days.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`${app.errorRate.toFixed(2)}%`}
                                color={
                                  app.errorRate > 2
                                    ? "error"
                                    : app.errorRate > 1
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>{app.avgResponseTime} ms</TableCell>
                            <TableCell>{app.owner}</TableCell>
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
                    Applications par type
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
                    {appStats && <Pie data={appTypeData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Applications par statut
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
                    {appStats && <Pie data={appStatusData} />}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "api":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performances API
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance par endpoint
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Endpoint</TableCell>
                          <TableCell align="right">Appels totaux</TableCell>
                          <TableCell>Temps de réponse moyen</TableCell>
                          <TableCell>Taux d'erreur</TableCell>
                          <TableCell>Disponibilité</TableCell>
                          <TableCell>Pic d'utilisation</TableCell>
                          <TableCell>Opération la plus lente</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiPerformance.map((endpoint) => (
                          <TableRow key={endpoint.endpoint}>
                            <TableCell>{endpoint.endpoint}</TableCell>
                            <TableCell align="right">
                              {endpoint.totalCalls.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Typography variant="body2">
                                  {endpoint.averageResponseTime} ms
                                </Typography>
                                {endpoint.averageResponseTime > 300 && (
                                  <Tooltip title="Temps de réponse élevé">
                                    <WarningIcon
                                      fontSize="small"
                                      color="warning"
                                      sx={{ ml: 1 }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`${endpoint.errorRate.toFixed(2)}%`}
                                color={
                                  endpoint.errorRate > 2
                                    ? "error"
                                    : endpoint.errorRate > 1
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`${endpoint.availability.toFixed(2)}%`}
                                color={
                                  endpoint.availability < 99.5
                                    ? "error"
                                    : endpoint.availability < 99.9
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>{endpoint.peakTimeOfDay}</TableCell>
                            <TableCell>{endpoint.slowestOperation}</TableCell>
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
                    Distribution des appels API par endpoint
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {apiStats && <Doughnut data={apiCallsData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Types d'erreurs API
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {apiStats && <Doughnut data={apiErrorsData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance API sur 24h
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {apiStats && (
                      <Line
                        data={{
                          labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                          datasets: [
                            {
                              label: "Temps de réponse moyen (ms)",
                              data: apiStats.performanceByHour,
                              borderColor: "#2196f3",
                              backgroundColor: "rgba(33, 150, 243, 0.1)",
                              tension: 0.3,
                              yAxisID: "y",
                            },
                            {
                              label: "Appels API (échelle logarithmique)",
                              data: apiStats.callsByHour,
                              borderColor: "#4caf50",
                              backgroundColor: "rgba(76, 175, 80, 0.1)",
                              tension: 0.3,
                              yAxisID: "y1",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              type: "linear",
                              display: true,
                              position: "left",
                              title: {
                                display: true,
                                text: "Temps de réponse (ms)",
                              },
                            },
                            y1: {
                              type: "logarithmic",
                              display: true,
                              position: "right",
                              title: {
                                display: true,
                                text: "Nombre d'appels",
                              },
                              grid: {
                                drawOnChartArea: false,
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "trends":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Tendances d'Utilisation
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution sur 12 mois
                  </Typography>
                  <Box sx={{ height: 400, mt: 2 }}>
                    {apiStats && (
                      <Line
                        data={apiTrendData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              type: "linear",
                              display: true,
                              position: "left",
                              title: {
                                display: true,
                                text: "Temps de réponse (ms)",
                              },
                            },
                            y1: {
                              type: "linear",
                              display: true,
                              position: "right",
                              title: {
                                display: true,
                                text: "Taux d'erreur (%)",
                              },
                              min: 0,
                              max: 5,
                              grid: {
                                drawOnChartArea: false,
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Applications actives par mois
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {apiStats && (
                      <Bar
                        data={{
                          labels: apiStats.historicalTrends.map((t) => t.month),
                          datasets: [
                            {
                              label: "Applications actives",
                              data: apiStats.historicalTrends.map(
                                (t) => t.activeApps
                              ),
                              backgroundColor: "#4caf50",
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
                                text: "Nombre d'applications",
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Volume d'appels API par mois
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {apiStats && (
                      <Bar
                        data={{
                          labels: apiStats.historicalTrends.map((t) => t.month),
                          datasets: [
                            {
                              label: "Appels API mensuels",
                              data: apiStats.historicalTrends.map(
                                (t) => t.totalCalls
                              ),
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
                              title: {
                                display: true,
                                text: "Nombre d'appels",
                              },
                            },
                          },
                        }}
                      />
                    )}
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
                    Dashboard d'Utilisation des Applications et API
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Analyse de l'utilisation des applications et des
                    performances API dans l'environnement CyberArk.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e8f5e9" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AppsIcon
                        sx={{ fontSize: 40, mr: 2, color: "#4caf50" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Applications intégrées
                        </Typography>
                        <Typography variant="h4">
                          {appStats?.totalApplications || "-"}
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
                      <StorageIcon
                        sx={{ fontSize: 40, mr: 2, color: "#2196f3" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Appels API quotidiens
                        </Typography>
                        <Typography variant="h4">
                          {appStats?.dailyAverageCalls?.toLocaleString() || "-"}
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
                      <AccessTimeIcon
                        sx={{ fontSize: 40, mr: 2, color: "#ff9800" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Temps de réponse moyen
                        </Typography>
                        <Typography variant="h4">
                          {apiStats?.averageResponseTime || "-"} ms
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
                      <ErrorIcon
                        sx={{ fontSize: 40, mr: 2, color: "#f44336" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Taux d'erreur API
                        </Typography>
                        <Typography variant="h4">
                          {apiStats?.errorRate.toFixed(1) || "-"}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance API sur 24h
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {apiStats && (
                      <Line
                        data={{
                          labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                          datasets: [
                            {
                              label: "Temps de réponse moyen (ms)",
                              data: apiStats.performanceByHour,
                              borderColor: "#2196f3",
                              backgroundColor: "rgba(33, 150, 243, 0.1)",
                              tension: 0.3,
                              yAxisID: "y",
                            },
                            {
                              label: "Volume d'appels",
                              data: apiStats.callsByHour,
                              borderColor: "#4caf50",
                              backgroundColor: "rgba(76, 175, 80, 0.1)",
                              tension: 0.3,
                              yAxisID: "y1",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              type: "linear",
                              display: true,
                              position: "left",
                              title: {
                                display: true,
                                text: "Temps de réponse (ms)",
                              },
                            },
                            y1: {
                              type: "linear",
                              display: true,
                              position: "right",
                              title: {
                                display: true,
                                text: "Appels API",
                              },
                              grid: {
                                drawOnChartArea: false,
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Distribution des appels API
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
                    {apiStats && <Pie data={apiCallsData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Applications récemment intégrées
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Date d'intégration</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {applications
                          .sort(
                            (a, b) =>
                              new Date(b.integrationDate) -
                              new Date(a.integrationDate)
                          )
                          .slice(0, 5)
                          .map((app) => (
                            <TableRow key={app.id}>
                              <TableCell>{app.name}</TableCell>
                              <TableCell>{app.type}</TableCell>
                              <TableCell>
                                {new Date(
                                  app.integrationDate
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={app.status}
                                  color={
                                    app.status === "Actif"
                                      ? "success"
                                      : app.status === "Inactif"
                                      ? "error"
                                      : app.status === "En maintenance"
                                      ? "warning"
                                      : "info"
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
                    Top 5 des applications par volume d'appels API
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Application</TableCell>
                          <TableCell align="right">Appels (30j)</TableCell>
                          <TableCell>Temps de réponse</TableCell>
                          <TableCell>Taux d'erreur</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {applications
                          .sort(
                            (a, b) =>
                              b.apiCallsLast30Days - a.apiCallsLast30Days
                          )
                          .slice(0, 5)
                          .map((app) => (
                            <TableRow key={app.id}>
                              <TableCell>{app.name}</TableCell>
                              <TableCell align="right">
                                {app.apiCallsLast30Days.toLocaleString()}
                              </TableCell>
                              <TableCell>{app.avgResponseTime} ms</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={`${app.errorRate.toFixed(2)}%`}
                                  color={
                                    app.errorRate > 2
                                      ? "error"
                                      : app.errorRate > 1
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

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Ce dashboard sera implémenté dans la Phase 2 de la roadmap.
      </Alert>
      {renderSubview()}
    </Box>
  );
};

export default ApplicationUsage;

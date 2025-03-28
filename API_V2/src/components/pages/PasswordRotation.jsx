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
  Button,
  Divider,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SecurityIcon from "@mui/icons-material/Security";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { ChartjsLine, ChartjsBar, ChartjsPie } from "../../components/charts";
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
import { Helmet } from "react-helmet";

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

const PasswordRotation = ({ subview }) => {
  const dataContext = useData();
  const { accountsData, safesData } = dataContext;
  const [rotationStats, setRotationStats] = useState(null);
  const [passwordPolicies, setPasswordPolicies] = useState([]);
  const [accountsToRotate, setAccountsToRotate] = useState([]);
  const [rotationHistory, setRotationHistory] = useState([]);

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = accountsData?.length > 0;

  // Générer les statistiques de rotation
  useEffect(() => {
    if (hasRequiredData) {
      // Statistiques de rotation (simulées)
      const stats = {
        totalAccounts: accountsData.length,
        accountsOnAutoRotation: Math.floor(accountsData.length * 0.85),
        accountsWithManualRotation: Math.floor(accountsData.length * 0.12),
        accountsWithoutRotation: Math.floor(accountsData.length * 0.03),
        expiringSoon: Math.floor(accountsData.length * 0.08),
        rotationFailures: Math.floor(accountsData.length * 0.05),
        rotationsByMonth: [
          250, 275, 290, 310, 325, 320, 350, 370, 345, 380, 390, 400,
        ],
        rotationStatus: {
          "À jour": Math.floor(accountsData.length * 0.78),
          "Expire bientôt": Math.floor(accountsData.length * 0.08),
          Expiré: Math.floor(accountsData.length * 0.09),
          "Échec de rotation": Math.floor(accountsData.length * 0.05),
        },
        successRate: 95,
      };

      // Politiques de mots de passe
      const policies = [
        {
          id: "pol1",
          name: "Serveurs critiques",
          minLength: 16,
          complexity: "Très élevée",
          rotationPeriod: 30,
          accountsCount: Math.floor(accountsData.length * 0.25),
          lastUpdated: "2023-09-15",
          status: "Active",
        },
        {
          id: "pol2",
          name: "Applications standards",
          minLength: 12,
          complexity: "Élevée",
          rotationPeriod: 60,
          accountsCount: Math.floor(accountsData.length * 0.35),
          lastUpdated: "2023-08-20",
          status: "Active",
        },
        {
          id: "pol3",
          name: "Services non critiques",
          minLength: 10,
          complexity: "Moyenne",
          rotationPeriod: 90,
          accountsCount: Math.floor(accountsData.length * 0.3),
          lastUpdated: "2023-07-10",
          status: "Active",
        },
        {
          id: "pol4",
          name: "Comptes de test",
          minLength: 8,
          complexity: "Basique",
          rotationPeriod: 180,
          accountsCount: Math.floor(accountsData.length * 0.1),
          lastUpdated: "2023-06-05",
          status: "Inactive",
        },
      ];

      // Comptes à faire tourner
      const accounts = Array(stats.expiringSoon + stats.rotationFailures)
        .fill()
        .map((_, i) => {
          const now = new Date();
          const expiryDate = new Date(
            now.getTime() + Math.floor(Math.random() * 15) * 86400000
          );
          const types = ["Windows Server", "SSH", "Database", "Web", "API"];
          const type = types[Math.floor(Math.random() * types.length)];
          const safes = safesData?.map((s) => s.SafeName) || [
            "Safe1",
            "Safe2",
            "Safe3",
            "Safe4",
          ];
          const safe = safes[Math.floor(Math.random() * safes.length)];
          const usernames = [
            "admin",
            "root",
            "sysadmin",
            "dbadmin",
            "webadmin",
            "apiuser",
          ];
          const username =
            usernames[Math.floor(Math.random() * usernames.length)];
          const targets = [
            "srv-prod-01",
            "db-prod-01",
            "app-srv-02",
            "web-srv-01",
            "api-gw-01",
          ];
          const target = targets[Math.floor(Math.random() * targets.length)];
          const isFailure = i < stats.rotationFailures;

          return {
            id: `acc-${i + 1000}`,
            username,
            accountType: type,
            target,
            safe,
            lastRotated: new Date(
              now.getTime() - Math.floor(Math.random() * 90) * 86400000
            ).toISOString(),
            expirationDate: expiryDate.toISOString(),
            daysRemaining: Math.floor(
              (expiryDate.getTime() - now.getTime()) / 86400000
            ),
            status: isFailure
              ? "Échec"
              : Math.random() > 0.3
              ? "À faire tourner"
              : "Expire bientôt",
            rotationMethod: Math.random() > 0.2 ? "Automatique" : "Manuel",
            priority: isFailure
              ? "Critique"
              : Math.random() > 0.5
              ? "Élevée"
              : "Moyenne",
            failureReason: isFailure
              ? [
                  "Connexion échouée",
                  "Erreur de service",
                  "Échec de vérification",
                  "Erreur réseau",
                ][Math.floor(Math.random() * 4)]
              : null,
          };
        });

      // Historique de rotation
      const history = Array(30)
        .fill()
        .map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const accountTypes = {
            "Windows Server": Math.floor(Math.random() * 10) + 5,
            SSH: Math.floor(Math.random() * 8) + 3,
            Database: Math.floor(Math.random() * 6) + 2,
            Web: Math.floor(Math.random() * 4) + 1,
            API: Math.floor(Math.random() * 3) + 1,
          };
          const totalSuccess = Object.values(accountTypes).reduce(
            (a, b) => a + b,
            0
          );
          const failures = Math.floor(Math.random() * 3);

          return {
            date: date.toISOString().split("T")[0],
            totalRotations: totalSuccess + failures,
            successfulRotations: totalSuccess,
            failedRotations: failures,
            byAccountType: accountTypes,
          };
        });

      setRotationStats(stats);
      setPasswordPolicies(policies);
      setAccountsToRotate(accounts);
      setRotationHistory(history);
    }
  }, [accountsData, hasRequiredData, safesData]);

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard de rotation des mots de
        passe. Veuillez importer les fichiers de comptes.
      </Alert>
    );
  }

  // Préparer les données pour les graphiques
  const rotationStatusData = {
    labels: rotationStats ? Object.keys(rotationStats.rotationStatus) : [],
    datasets: [
      {
        data: rotationStats ? Object.values(rotationStats.rotationStatus) : [],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#9c27b0"],
        borderWidth: 1,
      },
    ],
  };

  const rotationTrendsData = {
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
        label: "Rotations mensuelles",
        data: rotationStats?.rotationsByMonth || [],
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.3,
      },
    ],
  };

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "status":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Statut des Rotations
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Comptes à faire tourner
                  </Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Compte</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Coffre</TableCell>
                          <TableCell>Dernière rotation</TableCell>
                          <TableCell>Expiration</TableCell>
                          <TableCell>Jours restants</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accountsToRotate.map((account) => (
                          <TableRow
                            key={account.id}
                            sx={{
                              bgcolor:
                                account.status === "Échec"
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : account.daysRemaining < 3
                                  ? "rgba(255, 152, 0, 0.1)"
                                  : "inherit",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {account.priority === "Critique" && (
                                  <Tooltip title="Priorité critique">
                                    <PriorityHighIcon
                                      fontSize="small"
                                      color="error"
                                      sx={{ mr: 1 }}
                                    />
                                  </Tooltip>
                                )}
                                {account.username}@{account.target}
                              </Box>
                            </TableCell>
                            <TableCell>{account.accountType}</TableCell>
                            <TableCell>{account.safe}</TableCell>
                            <TableCell>
                              {new Date(
                                account.lastRotated
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                account.expirationDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`${account.daysRemaining} jours`}
                                color={
                                  account.daysRemaining < 3
                                    ? "error"
                                    : account.daysRemaining < 7
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={account.status}
                                color={
                                  account.status === "Échec"
                                    ? "error"
                                    : account.status === "Expire bientôt"
                                    ? "warning"
                                    : "info"
                                }
                                icon={
                                  account.status === "Échec" ? (
                                    <ErrorIcon />
                                  ) : undefined
                                }
                              />
                              {account.failureReason && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  {account.failureReason}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Faire tourner maintenant">
                                <IconButton size="small" color="primary">
                                  <AutorenewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Répartition des statuts
                      </Typography>
                      <Box
                        sx={{
                          height: 240,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ChartjsPie data={rotationStatusData} />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Comptes par méthode de rotation
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Méthodes de rotation de mots de passe
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1">Automatique</Typography>
                          <Typography variant="body1">
                            {rotationStats?.accountsOnAutoRotation || 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            rotationStats
                              ? (rotationStats.accountsOnAutoRotation /
                                  rotationStats.totalAccounts) *
                                100
                              : 0
                          }
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                          color="success"
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1">Manuelle</Typography>
                          <Typography variant="body1">
                            {rotationStats?.accountsWithManualRotation || 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            rotationStats
                              ? (rotationStats.accountsWithManualRotation /
                                  rotationStats.totalAccounts) *
                                100
                              : 0
                          }
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                          color="warning"
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1">
                            Aucune rotation
                          </Typography>
                          <Typography variant="body1">
                            {rotationStats?.accountsWithoutRotation || 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            rotationStats
                              ? (rotationStats.accountsWithoutRotation /
                                  rotationStats.totalAccounts) *
                                100
                              : 0
                          }
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                          color="error"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );
      case "policies":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Politiques de Mots de Passe
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Politiques configurées
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Longueur min.</TableCell>
                          <TableCell>Complexité</TableCell>
                          <TableCell>Période de rotation (jours)</TableCell>
                          <TableCell>Comptes associés</TableCell>
                          <TableCell>Dernière mise à jour</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {passwordPolicies.map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <SecurityIcon
                                  fontSize="small"
                                  sx={{
                                    mr: 1,
                                    color:
                                      policy.complexity === "Très élevée"
                                        ? "#f44336"
                                        : policy.complexity === "Élevée"
                                        ? "#ff9800"
                                        : policy.complexity === "Moyenne"
                                        ? "#2196f3"
                                        : "#4caf50",
                                  }}
                                />
                                {policy.name}
                              </Box>
                            </TableCell>
                            <TableCell>{policy.minLength} caractères</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={policy.complexity}
                                color={
                                  policy.complexity === "Très élevée"
                                    ? "error"
                                    : policy.complexity === "Élevée"
                                    ? "warning"
                                    : policy.complexity === "Moyenne"
                                    ? "info"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>{policy.rotationPeriod} jours</TableCell>
                            <TableCell>
                              {policy.accountsCount} comptes
                            </TableCell>
                            <TableCell>{policy.lastUpdated}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={policy.status}
                                color={
                                  policy.status === "Active"
                                    ? "success"
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
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Complexité des mots de passe par politique
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ChartjsBar
                      data={{
                        labels: passwordPolicies.map((p) => p.name),
                        datasets: [
                          {
                            label: "Longueur minimale",
                            data: passwordPolicies.map((p) => p.minLength),
                            backgroundColor: [
                              "#f44336",
                              "#ff9800",
                              "#2196f3",
                              "#4caf50",
                            ],
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
                              text: "Caractères",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Politique",
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
                    Période de rotation par politique
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ChartjsBar
                      data={{
                        labels: passwordPolicies.map((p) => p.name),
                        datasets: [
                          {
                            label: "Jours entre rotations",
                            data: passwordPolicies.map((p) => p.rotationPeriod),
                            backgroundColor: [
                              "#f44336",
                              "#ff9800",
                              "#2196f3",
                              "#4caf50",
                            ],
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
                              text: "Jours",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Politique",
                            },
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
      case "history":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Historique de Rotation
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendance des rotations
                  </Typography>
                  <Box sx={{ height: 350, mt: 2 }}>
                    <ChartjsLine
                      data={{
                        labels: rotationHistory
                          .slice(0, 14)
                          .reverse()
                          .map((h) => h.date),
                        datasets: [
                          {
                            label: "Rotations réussies",
                            data: rotationHistory
                              .slice(0, 14)
                              .reverse()
                              .map((h) => h.successfulRotations),
                            borderColor: "#4caf50",
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                            tension: 0.3,
                          },
                          {
                            label: "Rotations échouées",
                            data: rotationHistory
                              .slice(0, 14)
                              .reverse()
                              .map((h) => h.failedRotations),
                            borderColor: "#f44336",
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
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
                              text: "Nombre de rotations",
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
                    Historique récent
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Rotations totales</TableCell>
                          <TableCell>Réussies</TableCell>
                          <TableCell>Échouées</TableCell>
                          <TableCell>Taux de succès</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rotationHistory.slice(0, 10).map((entry) => {
                          const successRate = Math.round(
                            (entry.successfulRotations / entry.totalRotations) *
                              100
                          );
                          return (
                            <TableRow key={entry.date}>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell>{entry.totalRotations}</TableCell>
                              <TableCell>{entry.successfulRotations}</TableCell>
                              <TableCell>{entry.failedRotations}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={`${successRate}%`}
                                  color={
                                    successRate >= 95
                                      ? "success"
                                      : successRate >= 80
                                      ? "info"
                                      : "warning"
                                  }
                                />
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
                    Rotations par type de compte
                  </Typography>
                  <Box sx={{ height: 270, mt: 2 }}>
                    <ChartjsBar
                      data={{
                        labels: Object.keys(
                          rotationHistory[0]?.byAccountType || {}
                        ),
                        datasets: [
                          {
                            label: "Nombre de rotations (7 derniers jours)",
                            data: Object.keys(
                              rotationHistory[0]?.byAccountType || {}
                            ).map((type) =>
                              rotationHistory
                                .slice(0, 7)
                                .reduce(
                                  (sum, entry) =>
                                    sum + (entry.byAccountType[type] || 0),
                                  0
                                )
                            ),
                            backgroundColor: [
                              "#2196f3",
                              "#4caf50",
                              "#ff9800",
                              "#9c27b0",
                              "#f44336",
                            ],
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
                    Dashboard de Rotation des Mots de Passe
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Surveillance et gestion des rotations de mots de passe dans
                    l'environnement CyberArk.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e8f5e9" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AutorenewIcon
                        sx={{ fontSize: 40, mr: 2, color: "#4caf50" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Comptes avec auto-rotation
                        </Typography>
                        <Typography variant="h4">
                          {rotationStats?.accountsOnAutoRotation || "-"}
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
                      <RefreshIcon
                        sx={{ fontSize: 40, mr: 2, color: "#ff9800" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Comptes expirant bientôt
                        </Typography>
                        <Typography variant="h4">
                          {rotationStats?.expiringSoon || "-"}
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
                      <WarningIcon
                        sx={{ fontSize: 40, mr: 2, color: "#f44336" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Échecs de rotation
                        </Typography>
                        <Typography variant="h4">
                          {rotationStats?.rotationFailures || "-"}
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
                      <SecurityIcon
                        sx={{ fontSize: 40, mr: 2, color: "#2196f3" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Taux de succès global
                        </Typography>
                        <Typography variant="h4">
                          {rotationStats?.successRate || "-"}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendance des rotations sur l'année
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {rotationStats && (
                      <ChartjsLine
                        data={rotationTrendsData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Nombre de rotations",
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
                    Statut des rotations de mots de passe
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
                    <ChartjsPie data={rotationStatusData} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Comptes à faire tourner prochainement
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Compte</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Jours restants</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accountsToRotate.slice(0, 6).map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>
                              {account.username}@{account.target}
                            </TableCell>
                            <TableCell>{account.accountType}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`${account.daysRemaining} jours`}
                                color={
                                  account.daysRemaining < 3
                                    ? "error"
                                    : account.daysRemaining < 7
                                    ? "warning"
                                    : "success"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={account.status}
                                color={
                                  account.status === "Échec"
                                    ? "error"
                                    : account.status === "Expire bientôt"
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
                    Politiques de mots de passe
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Complexité</TableCell>
                          <TableCell>Rotation (jours)</TableCell>
                          <TableCell>Comptes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {passwordPolicies
                          .filter((p) => p.status === "Active")
                          .map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell>{policy.name}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={policy.complexity}
                                  color={
                                    policy.complexity === "Très élevée"
                                      ? "error"
                                      : policy.complexity === "Élevée"
                                      ? "warning"
                                      : policy.complexity === "Moyenne"
                                      ? "info"
                                      : "success"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                {policy.rotationPeriod} jours
                              </TableCell>
                              <TableCell>{policy.accountsCount}</TableCell>
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

export default PasswordRotation;

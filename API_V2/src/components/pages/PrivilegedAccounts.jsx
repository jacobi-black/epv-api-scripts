import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import LockIcon from "@mui/icons-material/Lock";
import { ChartjsLine, ChartjsBar, ChartjsPie } from "../../components/charts";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
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
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const PrivilegedAccounts = ({ subview }) => {
  const dataContext = useData();
  const { accountsData, usersData } = dataContext;
  const [accountUsageStats, setAccountUsageStats] = useState(null);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [accountTrends, setAccountTrends] = useState(null);
  const [topAccounts, setTopAccounts] = useState([]);

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = accountsData?.length > 0 && usersData?.length > 0;

  // Calculer les statistiques d'utilisation des comptes
  useEffect(() => {
    if (hasRequiredData) {
      // Simuler les données d'utilisation des comptes privilégiés
      const usageStats = {
        totalAccesses: 1245,
        normalAccesses: 980,
        emergencyAccesses: 265,
        averageDuration: 22, // en minutes
        accessesLastMonth: [
          42, 38, 45, 40, 38, 35, 50, 52, 48, 55, 60, 58, 62, 65, 58, 55, 68,
          70, 72, 68, 65, 75, 78, 82, 80, 78, 85, 90, 88, 85,
        ],
      };

      // Départements et équipes (simulé)
      const deptStats = {
        ITOperations: 380,
        Security: 260,
        DevOps: 205,
        Helpdesk: 185,
        DBAdmins: 150,
        Management: 65,
      };

      // Top 10 des comptes les plus utilisés
      const top = accountsData.slice(0, 10).map((account) => ({
        ...account,
        usageCount: Math.floor(Math.random() * 200) + 20,
        lastAccess: new Date(Date.now() - Math.random() * 86400000 * 10)
          .toISOString()
          .split("T")[0],
        averageDuration: Math.floor(Math.random() * 40) + 5,
      }));

      // Tendances d'utilisation sur les 6 derniers mois
      const trends = {
        labels: [
          "Octobre",
          "Novembre",
          "Décembre",
          "Janvier",
          "Février",
          "Mars",
        ],
        data: [820, 890, 950, 1050, 1150, 1245],
        emergencyData: [180, 195, 210, 230, 255, 265],
      };

      setAccountUsageStats(usageStats);
      setDepartmentStats(deptStats);
      setTopAccounts(top);
      setAccountTrends(trends);
    }
  }, [accountsData, usersData, hasRequiredData]);

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard des comptes
        privilégiés. Veuillez importer les fichiers d'inventaire de comptes et
        d'utilisateurs.
      </Alert>
    );
  }

  // Graphique en camembert pour la répartition par département
  const departmentPieData = {
    labels: departmentStats ? Object.keys(departmentStats) : [],
    datasets: [
      {
        data: departmentStats ? Object.values(departmentStats) : [],
        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#ff9800",
          "#9c27b0",
          "#e91e63",
          "#607d8b",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Graphique en barres pour les top comptes
  const topAccountsBarData = {
    labels: topAccounts.map(
      (acc) => acc.Username || acc.AccountID || "Unknown"
    ),
    datasets: [
      {
        label: "Nombre d'accès",
        data: topAccounts.map((acc) => acc.usageCount),
        backgroundColor: "#3f51b5",
      },
    ],
  };

  // Graphique en ligne pour les tendances
  const trendsLineData = {
    labels: accountTrends ? accountTrends.labels : [],
    datasets: [
      {
        label: "Accès normaux",
        data: accountTrends
          ? accountTrends.data.map(
              (v) =>
                v -
                (accountTrends.emergencyData[accountTrends.data.indexOf(v)] ||
                  0)
            )
          : [],
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.3,
      },
      {
        label: "Accès d'urgence",
        data: accountTrends ? accountTrends.emergencyData : [],
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.2)",
        tension: 0.3,
      },
    ],
  };

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "usage":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Utilisation Générale des Comptes Privilégiés
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendances d'utilisation sur les 30 derniers jours
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {accountUsageStats && (
                      <ChartjsLine
                        data={{
                          labels: Array.from({ length: 30 }, (_, i) => i + 1),
                          datasets: [
                            {
                              label: "Nombre d'accès quotidiens",
                              data: accountUsageStats.accessesLastMonth,
                              borderColor: "#3f51b5",
                              backgroundColor: "rgba(63, 81, 181, 0.1)",
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
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Types d'accès
                  </Typography>
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    {accountUsageStats && (
                      <ChartjsPie
                        data={{
                          labels: ["Accès normaux", "Accès d'urgence"],
                          datasets: [
                            {
                              data: [
                                accountUsageStats.normalAccesses,
                                accountUsageStats.emergencyAccesses,
                              ],
                              backgroundColor: ["#4caf50", "#f44336"],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "bottom",
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Ratio d'accès normaux vs exceptionnels
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {accountUsageStats
                        ? `${Math.round(
                            (accountUsageStats.normalAccesses /
                              accountUsageStats.totalAccesses) *
                              100
                          )}% / ${Math.round(
                            (accountUsageStats.emergencyAccesses /
                              accountUsageStats.totalAccesses) *
                              100
                          )}%`
                        : "-"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top 10 des comptes privilégiés les plus utilisés
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom du compte</TableCell>
                          <TableCell>Plateforme</TableCell>
                          <TableCell align="right">Nb d'accès</TableCell>
                          <TableCell>Dernier accès</TableCell>
                          <TableCell align="right">
                            Durée moyenne (min)
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topAccounts.map((account, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {account.Username ||
                                account.AccountID ||
                                "Unknown"}
                            </TableCell>
                            <TableCell>
                              {account.Platform ||
                                account.PlatformID ||
                                "Unknown"}
                            </TableCell>
                            <TableCell align="right">
                              {account.usageCount}
                            </TableCell>
                            <TableCell>{account.lastAccess}</TableCell>
                            <TableCell align="right">
                              {account.averageDuration}
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
      case "team":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Analyses Par Équipe
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition des accès par département
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {departmentStats && <ChartjsPie data={departmentPieData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Statistiques par département
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Département</TableCell>
                          <TableCell align="right">Nombre d'accès</TableCell>
                          <TableCell>Pourcentage</TableCell>
                          <TableCell>Niveau d'activité</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departmentStats &&
                          Object.entries(departmentStats).map(
                            ([dept, count], index) => (
                              <TableRow key={index}>
                                <TableCell>{dept}</TableCell>
                                <TableCell align="right">{count}</TableCell>
                                <TableCell>
                                  {`${Math.round(
                                    (count / accountUsageStats.totalAccesses) *
                                      100
                                  )}%`}
                                </TableCell>
                                <TableCell>
                                  <LinearProgress
                                    variant="determinate"
                                    value={
                                      (count /
                                        Object.values(departmentStats).reduce(
                                          (a, b) => Math.max(a, b),
                                          0
                                        )) *
                                      100
                                    }
                                    sx={{ height: 10, borderRadius: 5 }}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Comptes les plus utilisés par département
                  </Typography>
                  <Grid container spacing={3}>
                    {departmentStats &&
                      Object.keys(departmentStats)
                        .slice(0, 3)
                        .map((dept, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {dept}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Top compte:{" "}
                                  {topAccounts[index]?.Username || "Unknown"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Accès: {topAccounts[index]?.usageCount || 0}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "trends":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Tendances d'Usage
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution des accès sur les 6 derniers mois
                  </Typography>
                  <Box sx={{ height: 350, mt: 2 }}>
                    {accountTrends && (
                      <ChartjsLine
                        data={trendsLineData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Nombre d'accès",
                              },
                            },
                          },
                          plugins: {
                            title: {
                              display: true,
                              text: "Évolution des accès aux comptes privilégiés",
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
                    Top 5 des comptes
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {topAccounts.length > 0 && (
                      <ChartjsBar
                        data={topAccountsBarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                            },
                          },
                          plugins: {
                            legend: {
                              display: false,
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
                    Indicateurs de tendance
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ bgcolor: "#f5f5f5" }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <AccessTimeIcon sx={{ mr: 1 }} /> Durée moyenne
                          </Typography>
                          <Typography variant="h4">
                            {accountUsageStats
                              ? `${accountUsageStats.averageDuration} min`
                              : "-"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Durée moyenne des sessions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ bgcolor: "#f5f5f5" }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <EqualizerIcon sx={{ mr: 1 }} /> Tendance
                          </Typography>
                          <Typography variant="h4" sx={{ color: "#4caf50" }}>
                            {accountTrends
                              ? `+${Math.round(
                                  ((accountTrends.data[5] -
                                    accountTrends.data[4]) /
                                    accountTrends.data[4]) *
                                    100
                                )}%`
                              : "-"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Variation vs mois précédent
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
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
                    Dashboard d'Utilisation des Comptes Privilégiés
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Vue d'ensemble de l'utilisation des comptes privilégiés dans
                    l'environnement CyberArk.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e8f5e9" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LockIcon
                        sx={{ fontSize: 40, mr: 2, color: "#4caf50" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Accès totaux
                        </Typography>
                        <Typography variant="h4">
                          {accountUsageStats?.totalAccesses || "-"}
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
                          {accountUsageStats
                            ? `${accountUsageStats.averageDuration} min`
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
                      <PersonIcon
                        sx={{ fontSize: 40, mr: 2, color: "#ff9800" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Top compte
                        </Typography>
                        <Typography variant="h5" noWrap>
                          {topAccounts.length > 0
                            ? topAccounts[0].Username
                            : "-"}
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
                      <GroupIcon
                        sx={{ fontSize: 40, mr: 2, color: "#f44336" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Accès d'urgence
                        </Typography>
                        <Typography variant="h4">
                          {accountUsageStats?.emergencyAccesses || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top 10 des comptes les plus utilisés
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {topAccounts.length > 0 && (
                      <ChartjsBar
                        data={topAccountsBarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Nombre d'accès",
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition par département
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {departmentStats && <ChartjsPie data={departmentPieData} />}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendances d'utilisation
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    {accountTrends && (
                      <ChartjsLine
                        data={trendsLineData}
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
            </Grid>
          </Box>
        );
    }
  };

  return <Box>{renderSubview()}</Box>;
};

export default PrivilegedAccounts;

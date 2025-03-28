import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  CircularProgress,
  Button,
  Slider,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from "@mui/icons-material/Memory";
import DnsIcon from "@mui/icons-material/Dns";
import SpeedIcon from "@mui/icons-material/Speed";

// Composants graphiques
import CPUUsageChart from "../charts/CPUUsageChart";
import MemoryUsageChart from "../charts/MemoryUsageChart";
import DiskUsageChart from "../charts/DiskUsageChart";
import SessionsCapacityChart from "../charts/SessionsCapacityChart";
import SafesStorageChart from "../charts/SafesStorageChart";
import ResponseTimeChart from "../charts/ResponseTimeChart";

// Capacity Planning Component
const CapacityPlanning = () => {
  const {
    accountsData,
    safesData,
    systemHealthData,
    sessionsData,
    loading,
    error,
  } = useData();
  const navigate = useNavigate();

  // State for UI tabs
  const [currentTab, setCurrentTab] = useState(0);

  // State for growth planning settings
  const [growthRate, setGrowthRate] = useState(15); // Default 15% annual growth
  const [planningPeriod, setPlanningPeriod] = useState(36); // Default 36 months
  const [initialAccountCount, setInitialAccountCount] = useState(0);
  const [growthModel, setGrowthModel] = useState("linear"); // Linear or exponential
  const [forecastData, setForecastData] = useState([]);

  // Données simulées pour les graphiques (à remplacer par des données réelles)
  const [mockData, setMockData] = useState({
    cpuUsage: [],
    memoryUsage: [],
    diskUsage: [],
    sessionsCapacity: [],
    safesStorage: [],
    responseTime: [],
  });

  // Generate mock data for demonstrations
  useEffect(() => {
    // Simuler des données d'utilisation CPU
    const cpuData = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      cpuData.push({
        timestamp: hour,
        PVWA: Math.floor(Math.random() * 30) + 20,
        CPM: Math.floor(Math.random() * 40) + 30,
        PSM: Math.floor(Math.random() * 50) + 40,
      });
    }

    // Simuler des données d'utilisation mémoire
    const memoryData = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      memoryData.push({
        timestamp: hour,
        PVWA: Math.floor(Math.random() * 30) + 40,
        CPM: Math.floor(Math.random() * 20) + 30,
        PSM: Math.floor(Math.random() * 30) + 50,
      });
    }

    // Simuler des données d'utilisation disque
    const diskData = [
      { server: "PVWA", usage: Math.floor(Math.random() * 30) + 40 },
      { server: "CPM", usage: Math.floor(Math.random() * 20) + 50 },
      { server: "PSM-1", usage: Math.floor(Math.random() * 40) + 30 },
      { server: "PSM-2", usage: Math.floor(Math.random() * 35) + 40 },
      { server: "Vault", usage: Math.floor(Math.random() * 25) + 60 },
    ];

    // Simuler des données de capacité de sessions
    const sessionsData = [
      {
        server: "PSM-1",
        current: Math.floor(Math.random() * 15) + 5,
        max: 40,
        recommended: 32,
      },
      {
        server: "PSM-2",
        current: Math.floor(Math.random() * 20) + 10,
        max: 40,
        recommended: 32,
      },
      {
        server: "PSM-3",
        current: Math.floor(Math.random() * 10) + 3,
        max: 40,
        recommended: 32,
      },
    ];

    // Simuler des données de stockage des coffres
    const safesData = [
      {
        name: "Root",
        used: Math.floor(Math.random() * 500) + 1000,
        size: 2048,
      },
      {
        name: "System",
        used: Math.floor(Math.random() * 300) + 500,
        size: 1024,
      },
      {
        name: "Applications",
        used: Math.floor(Math.random() * 400) + 600,
        size: 1536,
      },
      { name: "VIP", used: Math.floor(Math.random() * 200) + 200, size: 512 },
      {
        name: "Others",
        used: Math.floor(Math.random() * 100) + 200,
        size: 512,
      },
    ];

    // Simuler des données de temps de réponse
    const responseData = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      responseData.push({
        timestamp: hour,
        PVWA: Math.floor(Math.random() * 200) + 100,
        CPM: Math.floor(Math.random() * 150) + 50,
        PSM: Math.floor(Math.random() * 300) + 200,
        Vault: Math.floor(Math.random() * 100) + 20,
      });
    }

    setMockData({
      cpuUsage: cpuData,
      memoryUsage: memoryData,
      diskUsage: diskData,
      sessionsCapacity: sessionsData,
      safesStorage: safesData,
      responseTime: responseData,
    });
  }, []);

  // Calculate the initial account count and prepare forecast data
  useEffect(() => {
    if (accountsData) {
      setInitialAccountCount(accountsData.length);
    }
  }, [accountsData]);

  // Generate forecast data when parameters change
  useEffect(() => {
    if (initialAccountCount > 0) {
      const newForecastData = [];
      const monthlyGrowthRate = growthRate / 12 / 100; // Convert annual percentage to monthly decimal

      for (let month = 0; month <= planningPeriod; month++) {
        let accountCount;

        if (growthModel === "linear") {
          // Linear growth: constant number of accounts added each month
          accountCount =
            initialAccountCount +
            initialAccountCount * monthlyGrowthRate * month;
        } else {
          // Exponential growth: percentage growth compounded monthly
          accountCount =
            initialAccountCount * Math.pow(1 + monthlyGrowthRate, month);
        }

        newForecastData.push({
          month,
          accounts: Math.round(accountCount),
          label: `Month ${month}`,
        });
      }

      setForecastData(newForecastData);
    }
  }, [initialAccountCount, growthRate, planningPeriod, growthModel]);

  // If loading, show loading indicator
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no data, show message to upload
  if (!accountsData && !safesData && !systemHealthData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Capacity Planning
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          No data available. Please upload data first to enable capacity
          planning.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate("/upload/capacity")}
        >
          Upload Data
        </Button>
      </Box>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Capacity Planning
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Current status metrics
  const currentAccounts = accountsData ? accountsData.length : 0;
  const currentSafes = safesData
    ? [...new Set(safesData.map((item) => item.SafeName || item.Safe))].length
    : 0;
  const currentComponents = systemHealthData ? systemHealthData.length : 0;

  // Projection of key milestones
  const getMonthForAccountCount = (targetCount) => {
    if (!forecastData.length) return "N/A";
    const milestone = forecastData.find((data) => data.accounts >= targetCount);
    return milestone ? `Month ${milestone.month}` : "Beyond forecast period";
  };

  const doubledAccountsMonth = getMonthForAccountCount(currentAccounts * 2);
  const tripledAccountsMonth = getMonthForAccountCount(currentAccounts * 3);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Capacity Planning
      </Typography>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="capacity planning tabs"
        >
          <Tab
            label="Vue d'ensemble"
            icon={<InfoOutlinedIcon />}
            iconPosition="start"
          />
          <Tab
            label="Utilisation Serveurs"
            icon={<StorageIcon />}
            iconPosition="start"
          />
          <Tab label="Sessions PSM" icon={<DnsIcon />} iconPosition="start" />
          <Tab
            label="Stockage Coffres"
            icon={<MemoryIcon />}
            iconPosition="start"
          />
          <Tab label="Performance" icon={<SpeedIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Vue d'ensemble Tab */}
      {currentTab === 0 && (
        <>
          {/* Current Status Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              État Actuel de l'Environnement
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Comptes Gérés
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {currentAccounts}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Coffres
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {currentSafes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Composants
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {currentComponents}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Growth Planning Settings */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Paramètres de Planification</Typography>
              <Tooltip title="Ajustez ces paramètres pour modéliser différents scénarios de croissance de votre environnement CyberArk.">
                <IconButton size="small">
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Taux de Croissance Annuel
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Slider
                    value={growthRate}
                    onChange={(_, newValue) => setGrowthRate(newValue)}
                    min={1}
                    max={50}
                    step={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                    sx={{ mr: 2, flexGrow: 1 }}
                  />
                  <TextField
                    value={growthRate}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setGrowthRate(Math.min(Math.max(value, 1), 50));
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    sx={{ width: 100 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Période de Prévision
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Slider
                    value={planningPeriod}
                    onChange={(_, newValue) => setPlanningPeriod(newValue)}
                    min={12}
                    max={60}
                    step={6}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} mois`}
                    sx={{ mr: 2, flexGrow: 1 }}
                  />
                  <TextField
                    value={planningPeriod}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 12;
                      setPlanningPeriod(Math.min(Math.max(value, 12), 60));
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">mois</InputAdornment>
                      ),
                    }}
                    sx={{ width: 120 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="growth-model-label">
                    Modèle de Croissance
                  </InputLabel>
                  <Select
                    labelId="growth-model-label"
                    value={growthModel}
                    label="Modèle de Croissance"
                    onChange={(e) => setGrowthModel(e.target.value)}
                  >
                    <MenuItem value="linear">Croissance Linéaire</MenuItem>
                    <MenuItem value="exponential">
                      Croissance Exponentielle
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre Initial de Comptes"
                  type="number"
                  value={initialAccountCount}
                  onChange={(e) =>
                    setInitialAccountCount(parseInt(e.target.value) || 0)
                  }
                  InputProps={{
                    readOnly: !!accountsData,
                  }}
                  helperText={
                    accountsData
                      ? "Depuis les données importées"
                      : "Entrez votre nombre initial de comptes"
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Key Milestones */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Jalons Clés de Croissance
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader title="Double de la Taille Actuelle" />
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {doubledAccountsMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temps prévu pour atteindre {currentAccounts * 2} comptes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader title="Triple de la Taille Actuelle" />
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {tripledAccountsMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temps prévu pour atteindre {currentAccounts * 3} comptes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader title="Projection à 3 Ans" />
                  <CardContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {forecastData[36]?.accounts.toLocaleString() || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comptes projetés au mois 36
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Recommendations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recommandations de Planification
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Basé sur votre taux de croissance projeté de {growthRate}%
                annuellement, considérez les recommandations suivantes.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                    <CardHeader title="Court Terme (0-12 mois)" />
                    <Divider />
                    <CardContent>
                      <Typography paragraph>
                        • Assurez-vous que vos serveurs CPM peuvent gérer{" "}
                        {forecastData[12]?.accounts || "N/A"} comptes
                      </Typography>
                      <Typography paragraph>
                        • Prévoyez au moins{" "}
                        {Math.ceil(
                          (currentSafes * forecastData[12]?.accounts) /
                            currentAccounts
                        ) || "N/A"}{" "}
                        coffres
                      </Typography>
                      <Typography paragraph>
                        • Validez que le matériel actuel répond aux exigences de
                        performance
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                    <CardHeader title="Moyen Terme (13-24 mois)" />
                    <Divider />
                    <CardContent>
                      <Typography paragraph>
                        • Envisagez d'ajouter des instances CPM supplémentaires
                        pour répartir la charge
                      </Typography>
                      <Typography paragraph>
                        • Implémentez des politiques de gestion du cycle de vie
                        des comptes
                      </Typography>
                      <Typography paragraph>
                        • Revoyez et optimisez les ressources PSM pour un volume
                        de sessions accru
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                    <CardHeader title="Long Terme (25+ mois)" />
                    <Divider />
                    <CardContent>
                      <Typography paragraph>
                        • Planifiez le dimensionnement de l'infrastructure pour
                        supporter {forecastData[36]?.accounts || "N/A"} comptes
                      </Typography>
                      <Typography paragraph>
                        • Envisagez une architecture distribuée et l'équilibrage
                        de charge
                      </Typography>
                      <Typography paragraph>
                        • Implémentez des processus automatisés d'intégration de
                        comptes pour gérer le volume
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </>
      )}

      {/* Utilisation Serveurs Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Ce dashboard présente l'utilisation des ressources des serveurs
              CyberArk, vous permettant d'identifier les goulots d'étranglement
              potentiels.
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <CPUUsageChart data={mockData.cpuUsage} />
          </Grid>
          <Grid item xs={12} md={6}>
            <MemoryUsageChart data={mockData.memoryUsage} />
          </Grid>
          <Grid item xs={12}>
            <DiskUsageChart data={mockData.diskUsage} />
          </Grid>
        </Grid>
      )}

      {/* Sessions PSM Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Cette section analyse la capacité de sessions PSM simultanées et
              propose des recommandations pour dimensionner votre
              infrastructure.
            </Alert>
          </Grid>
          <Grid item xs={12}>
            <SessionsCapacityChart data={mockData.sessionsCapacity} />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recommandations pour les Sessions PSM
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Configuration Recommandée
                  </Typography>
                  <Typography paragraph>
                    Basé sur l'utilisation actuelle et le taux de croissance
                    projeté, nous recommandons d'ajouter 1 instance PSM
                    supplémentaire tous les{" "}
                    {Math.floor(12 / (growthRate / 100))} mois.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Seuils d'Alerte
                  </Typography>
                  <Typography paragraph>
                    • 75% de capacité: Alerte de planification
                    <br />
                    • 85% de capacité: Alerte critique
                    <br />• 95% de capacité: Intervention immédiate requise
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Configuration Matérielle
                  </Typography>
                  <Typography paragraph>
                    Pour chaque 40 sessions simultanées, assurez-vous que votre
                    serveur PSM dispose d'au moins:
                    <br />
                    • 8 cœurs CPU
                    <br />
                    • 16 GB de RAM
                    <br />• 100 GB d'espace disque
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Stockage Coffres Tab */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Cette section analyse l'utilisation du stockage des coffres et
              vous aide à planifier l'expansion de capacité.
            </Alert>
          </Grid>
          <Grid item xs={12}>
            <SafesStorageChart data={mockData.safesStorage} />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analyse de Capacité des Coffres
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Utilisation par Type de Coffre
                  </Typography>
                  <Typography paragraph>
                    • Coffres système: Croissance typique de 5% par an
                    <br />• Coffres d'applications: Croissance de{" "}
                    {Math.round(growthRate * 0.8)}% par an (basé sur votre taux)
                    <br />• Coffres d'utilisateurs: Croissance de {growthRate}%
                    par an
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Recommandations
                  </Typography>
                  <Typography paragraph>
                    • Maintenez au moins 30% d'espace libre sur le stockage des
                    coffres
                    <br />
                    • Planifiez des revues trimestrielles de l'utilisation du
                    stockage
                    <br />• Augmentez la capacité de stockage lorsque
                    l'utilisation dépasse 70%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Performance Tab */}
      {currentTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Cette section analyse les temps de réponse des différents
              composants CyberArk pour identifier les problèmes de performance.
            </Alert>
          </Grid>
          <Grid item xs={12}>
            <ResponseTimeChart data={mockData.responseTime} />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Analyse des Temps de Réponse
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Seuils Recommandés
                  </Typography>
                  <Typography paragraph>
                    • PVWA: &lt; 200ms (optimal), &lt; 500ms (acceptable)
                    <br />
                    • Vault: &lt; 50ms (optimal), &lt; 100ms (acceptable)
                    <br />
                    • CPM: &lt; 100ms (optimal), &lt; 250ms (acceptable)
                    <br />• PSM: &lt; 300ms (optimal), &lt; 600ms (acceptable)
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Facteurs d'Impact
                  </Typography>
                  <Typography paragraph>
                    • Nombre de comptes: Impact élevé sur CPM
                    <br />
                    • Nombre d'utilisateurs: Impact élevé sur PVWA
                    <br />
                    • Sessions simultanées: Impact élevé sur PSM
                    <br />• Taille des coffres: Impact élevé sur Vault
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Recommandations d'Optimisation
                  </Typography>
                  <Typography paragraph>
                    • PVWA: Équilibrage de charge, mise en cache
                    <br />
                    • Vault: Optimisation de base de données
                    <br />
                    • CPM: Parallélisation des opérations
                    <br />• PSM: Répartition des connexions
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CapacityPlanning;

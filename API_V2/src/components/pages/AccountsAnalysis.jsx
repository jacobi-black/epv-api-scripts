import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import { getAccountStats } from "../../utils/csvParser";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import SecurityIcon from "@mui/icons-material/Security";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TimelineIcon from "@mui/icons-material/Timeline";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssessmentIcon from "@mui/icons-material/Assessment";

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

// Additional mock data for age distribution
const ageDistribution = [
  { name: "< 30 jours", value: 125, color: "#4caf50" },
  { name: "30-90 jours", value: 348, color: "#8bc34a" },
  { name: "90-180 jours", value: 427, color: "#ff9800" },
  { name: "180-365 jours", value: 286, color: "#f44336" },
  { name: "> 365 jours", value: 98, color: "#d32f2f" },
];

// Critical accounts mock data
const criticalAccounts = [
  {
    id: 1,
    name: "admin@domain",
    platform: "Windows Server",
    safe: "IT-Admin",
    lastAccessed: "2023-10-15",
    status: "At Risk",
    risk: "High",
  },
  {
    id: 2,
    name: "root@linuxserver01",
    platform: "Linux",
    safe: "Unix-Admin",
    lastAccessed: "2023-11-02",
    status: "Compliant",
    risk: "Low",
  },
  {
    id: 3,
    name: "sa@sqlserver01",
    platform: "SQL Server",
    safe: "DB-Admin",
    lastAccessed: "2023-09-28",
    status: "At Risk",
    risk: "Critical",
  },
  {
    id: 4,
    name: "administrator@domain",
    platform: "Active Directory",
    safe: "Enterprise-Admin",
    lastAccessed: "2023-10-30",
    status: "Compliant",
    risk: "Low",
  },
  {
    id: 5,
    name: "oracle@oracledb",
    platform: "Oracle Database",
    safe: "DB-Admin",
    lastAccessed: "2023-08-15",
    status: "At Risk",
    risk: "Medium",
  },
];

// AccountsAnalysis Component
const AccountsAnalysis = () => {
  const { accountsData, accountsStats } = useData();
  const [stats, setStats] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterSafe, setFilterSafe] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [dateRange] = useState({
    start: "2023-01-01",
    end: "2023-12-31",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Calculate stats when accountsData changes
  useEffect(() => {
    try {
      setIsLoading(true);
      if (accountsData && accountsData.length > 0) {
        const calculatedStats = accountsStats || getAccountStats(accountsData);
        setStats(calculatedStats);
        setFilteredAccounts(accountsData);
      }
      setError(null);
    } catch (err) {
      console.error("Erreur lors du traitement des données de comptes:", err);
      setError("Impossible de traiter les données des comptes. " + err.message);
    } finally {
      // Simulating data loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  }, [accountsData, accountsStats]);

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Si en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si erreur, afficher un message
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Si pas de données, afficher un message
  if (!accountsData || accountsData.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Aucune donnée de comptes disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Pour visualiser les analyses des comptes, veuillez d'abord importer
            vos données CSV.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate("/upload")}
          >
            Importer des données
          </Button>
        </Paper>
      </Box>
    );
  }

  // Apply filters when they change
  useEffect(() => {
    if (!accountsData) return;

    try {
      let filtered = [...accountsData];

      // Apply platform filter
      if (filterPlatform !== "All") {
        filtered = filtered.filter((account) => {
          const platform = account.Platform || account.PlatformID || "";
          return platform === filterPlatform;
        });
      }

      // Apply safe filter
      if (filterSafe !== "All") {
        filtered = filtered.filter((account) => {
          const safe = account.Safe || account.SafeName || "";
          return safe === filterSafe;
        });
      }

      // Apply search term
      if (searchTerm && searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((account) => {
          const username = (
            account.Username ||
            account.Name ||
            ""
          ).toLowerCase();
          const address = (account.Address || "").toLowerCase();
          const name = (account.Name || "").toLowerCase();
          return (
            username.includes(term) ||
            address.includes(term) ||
            name.includes(term)
          );
        });
      }

      setFilteredAccounts(filtered);
    } catch (err) {
      console.error("Erreur lors du filtrage des comptes:", err);
      setError("Impossible de filtrer les données des comptes. " + err.message);
    }
  }, [accountsData, filterPlatform, filterSafe, searchTerm]);

  // Prepare data for platform distribution chart
  const platformData = stats?.byPlatform
    ? Object.entries(stats.byPlatform).map(([name, value]) => ({
        name: name || "Non spécifié",
        value,
      }))
    : [];

  // Prepare data for managed vs unmanaged chart
  const managedChartData = [
    { name: "Gérés", value: stats?.managed || 0 },
    { name: "Non gérés", value: stats?.unmanaged || 0 },
  ];

  // Prepare data for safes chart
  const safeChartData = stats?.bySafe
    ? Object.entries(stats.bySafe)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name: name || "Non spécifié",
          value,
        }))
    : [];

  // Get unique platforms and safes for filters
  const platforms = accountsData
    ? [
        "All",
        ...new Set(
          accountsData
            .map((account) => account.Platform || account.PlatformID)
            .filter(Boolean)
        ),
      ]
    : ["All"];

  const safes = accountsData
    ? [
        "All",
        ...new Set(
          accountsData
            .map((account) => account.Safe || account.SafeName)
            .filter(Boolean)
        ),
      ]
    : ["All"];

  // Fonction pour rendre le contenu en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <>
            {/* Filter Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Recherche"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom, adresse..."
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Plateforme</InputLabel>
                    <Select
                      value={filterPlatform}
                      label="Plateforme"
                      onChange={(e) => setFilterPlatform(e.target.value)}
                    >
                      {platforms.map((platform) => (
                        <MenuItem key={platform} value={platform}>
                          {platform}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Coffre</InputLabel>
                    <Select
                      value={filterSafe}
                      label="Coffre"
                      onChange={(e) => setFilterSafe(e.target.value)}
                    >
                      {safes.map((safe) => (
                        <MenuItem key={safe} value={safe}>
                          {safe}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setFilterPlatform("All");
                      setFilterSafe("All");
                      setSearchTerm("");
                    }}
                  >
                    Réinitialiser
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Account Table */}
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom d'utilisateur</TableCell>
                      <TableCell>Adresse</TableCell>
                      <TableCell>Plateforme</TableCell>
                      <TableCell>Coffre</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.slice(0, 100).map((account, index) => (
                        <TableRow hover key={index}>
                          <TableCell>
                            {account.Username || account.Name || "N/A"}
                          </TableCell>
                          <TableCell>{account.Address || "N/A"}</TableCell>
                          <TableCell>
                            {account.Platform || account.PlatformID || "N/A"}
                          </TableCell>
                          <TableCell>
                            {account.Safe || account.SafeName || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                account.CPMStatus === "success" ||
                                account.CPMStatus === "Success" ||
                                account.AutomaticManagement === "True" ||
                                account.AutomaticManagement === "true" ||
                                account.AutomaticManagement === true
                                  ? "Géré"
                                  : "Non géré"
                              }
                              color={
                                account.CPMStatus === "success" ||
                                account.CPMStatus === "Success" ||
                                account.AutomaticManagement === "True" ||
                                account.AutomaticManagement === "true" ||
                                account.AutomaticManagement === true
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="text">
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Aucun compte ne correspond aux critères de recherche
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{ p: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2" color="text.secondary">
                  {filteredAccounts.length} comptes au total
                </Typography>
                {filteredAccounts.length > 100 && (
                  <Typography variant="body2" color="text.secondary">
                    Affichage des 100 premiers résultats
                  </Typography>
                )}
              </Box>
            </Paper>
          </>
        );
      case "trends":
        return (
          <Grid container spacing={3}>
            {/* Distribution par plateforme */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Distribution des comptes par plateforme
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        platformData.length > 0
                          ? platformData
                          : [{ name: "Aucune donnée", value: 1 }]
                      }
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {platformData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Distribution par âge */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Âge des comptes et conformité
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={ageDistribution}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Nombre de comptes">
                      {ageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Distribution gérés vs non gérés */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Comptes gérés vs non gérés
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={managedChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#4caf50" />
                      <Cell fill="#ff9800" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Top 10 Safes */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top 10 Coffres par nombre de comptes
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={
                      safeChartData.length > 0
                        ? safeChartData
                        : [{ name: "Aucune donnée", value: 0 }]
                    }
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Nombre de comptes"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Tendances d'évolution */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h6">
                    Évolution du nombre de comptes
                  </Typography>
                  {/* Remplacer les DatePickers par un simple affichage de date */}
                  <Box sx={{ display: "flex", gap: 2, my: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Période: {dateRange.start} - {dateRange.end}
                    </Typography>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "Jan",
                        total: 980,
                        managed: 850,
                        unmanaged: 130,
                      },
                      {
                        name: "Fév",
                        total: 1020,
                        managed: 880,
                        unmanaged: 140,
                      },
                      {
                        name: "Mar",
                        total: 1080,
                        managed: 920,
                        unmanaged: 160,
                      },
                      {
                        name: "Avr",
                        total: 1150,
                        managed: 950,
                        unmanaged: 200,
                      },
                      {
                        name: "Mai",
                        total: 1180,
                        managed: 970,
                        unmanaged: 210,
                      },
                      {
                        name: "Juin",
                        total: 1220,
                        managed: 1000,
                        unmanaged: 220,
                      },
                      {
                        name: "Juil",
                        total: 1240,
                        managed: 1020,
                        unmanaged: 220,
                      },
                      {
                        name: "Août",
                        total: 1260,
                        managed: 1050,
                        unmanaged: 210,
                      },
                      {
                        name: "Sep",
                        total: 1280,
                        managed: 1080,
                        unmanaged: 200,
                      },
                      {
                        name: "Oct",
                        total: 1300,
                        managed: 1100,
                        unmanaged: 200,
                      },
                      {
                        name: "Nov",
                        total: 1320,
                        managed: 1130,
                        unmanaged: 190,
                      },
                      {
                        name: "Déc",
                        total: 1350,
                        managed: 1150,
                        unmanaged: 200,
                      },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="managed"
                      name="Comptes gérés"
                      stackId="a"
                      fill="#4caf50"
                    />
                    <Bar
                      dataKey="unmanaged"
                      name="Comptes non gérés"
                      stackId="a"
                      fill="#ff9800"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        );
      case "risk":
        return (
          <Grid container spacing={3}>
            {/* Critical Accounts */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Comptes critiques et leur statut
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nom du compte</TableCell>
                        <TableCell>Plateforme</TableCell>
                        <TableCell>Coffre</TableCell>
                        <TableCell>Dernier accès</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Niveau de risque</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {criticalAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>{account.platform}</TableCell>
                          <TableCell>{account.safe}</TableCell>
                          <TableCell>{account.lastAccessed}</TableCell>
                          <TableCell>
                            <Chip
                              label={account.status}
                              color={
                                account.status === "Compliant"
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={account.risk}
                              color={
                                account.risk === "Critical"
                                  ? "error"
                                  : account.risk === "High"
                                  ? "error"
                                  : account.risk === "Medium"
                                  ? "warning"
                                  : "success"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="outlined" size="small">
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Risk Factors */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Facteurs de risque identifiés
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Comptes avec privilèges élevés non conformes"
                      secondary="3 comptes administrateur dans des environnements critiques"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarMonthIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Comptes avec rotation de mot de passe dépassée"
                      secondary="5 comptes avec des mots de passe de plus de 90 jours"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimelineIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Comptes avec activité anormale"
                      secondary="2 comptes présentant des patterns d'accès inhabituels"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Recommended Actions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions recommandées
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Audit complet des comptes à privilèges élevés"
                      secondary="Priorité: Haute - Impact: Critique"
                    />
                    <Button variant="outlined" size="small">
                      Planifier
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Forcer la rotation des mots de passe anciens"
                      secondary="Priorité: Moyenne - Impact: Élevé"
                    />
                    <Button variant="outlined" size="small">
                      Exécuter
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Révision des droits d'accès aux comptes critiques"
                      secondary="Priorité: Haute - Impact: Élevé"
                    />
                    <Button variant="outlined" size="small">
                      Planifier
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analyse des Comptes
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total des Comptes
              </Typography>
              <Typography variant="h3" color="primary">
                {stats?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comptes Gérés
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats?.managed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.managed
                  ? `(${Math.round(
                      (stats.managed / stats.total) * 100
                    )}% du total)`
                  : "(0% du total)"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comptes Non Gérés
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats?.unmanaged || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.unmanaged
                  ? `(${Math.round(
                      (stats.unmanaged / stats.total) * 100
                    )}% du total)`
                  : "(0% du total)"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comptes à Risque
              </Typography>
              <Typography variant="h3" color="error.main">
                {
                  criticalAccounts.filter(
                    (acc) => acc.risk === "High" || acc.risk === "Critical"
                  ).length
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nécessitant une attention immédiate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Remplacer le système d'onglets de @mui/lab par celui de @mui/material */}
      <Box sx={{ width: "100%", mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            variant="fullWidth"
            aria-label="account analysis tabs"
          >
            <Tab
              icon={<InfoIcon />}
              label="Inventaire des Comptes"
              value="inventory"
              iconPosition="start"
            />
            <Tab
              icon={<AnalyticsIcon />}
              label="Analyses & Tendances"
              value="trends"
              iconPosition="start"
            />
            <Tab
              icon={<WarningIcon />}
              label="Comptes à Risque"
              value="risk"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <Box sx={{ py: 2 }}>{renderTabContent()}</Box>
      </Box>
    </Box>
  );
};

// PropTypes validation
AccountsAnalysis.propTypes = {
  initialTab: PropTypes.oneOf(["inventory", "trends", "risk"]),
};

export default AccountsAnalysis;

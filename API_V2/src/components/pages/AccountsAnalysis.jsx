import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import { getAccountStats } from "../../utils/csvParser";
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

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

// AccountsAnalysis Component
const AccountsAnalysis = () => {
  const { accountsData, accountsStats } = useData();
  const [stats, setStats] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [filterSafe, setFilterSafe] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const navigate = useNavigate();

  // Calculate stats when accountsData changes
  useEffect(() => {
    if (accountsData && accountsData.length > 0) {
      setStats(accountsStats || getAccountStats(accountsData));
      setFilteredAccounts(accountsData);
    }
  }, [accountsData, accountsStats]);

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
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((account) => {
        const username = (account.Username || "").toLowerCase();
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
  }, [accountsData, filterPlatform, filterSafe, searchTerm]);

  // Prepare data for platform distribution chart
  const platformData = stats?.byPlatform
    ? Object.entries(stats.byPlatform).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  // Prepare data for managed vs unmanaged chart
  const managedChartData = [
    { name: "Managed", value: stats?.managed || 0 },
    { name: "Unmanaged", value: stats?.unmanaged || 0 },
  ];

  // Prepare data for safes chart
  const safeChartData = stats?.bySafe
    ? Object.entries(stats.bySafe)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name,
          value,
        }))
    : [];

  // Get unique platforms and safes for filters
  const platforms = accountsData
    ? [
        "All",
        ...new Set(
          accountsData.map((account) => account.Platform || account.PlatformID)
        ),
      ]
    : ["All"];

  const safes = accountsData
    ? [
        "All",
        ...new Set(
          accountsData.map((account) => account.Safe || account.SafeName)
        ),
      ]
    : ["All"];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analyse des Comptes
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comptes Gérés
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats?.managed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (
                {stats?.managed
                  ? Math.round((stats.managed / stats.total) * 100)
                  : 0}
                % du total)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comptes Non Gérés
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats?.unmanaged || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (
                {stats?.unmanaged
                  ? Math.round((stats.unmanaged / stats.total) * 100)
                  : 0}
                % du total)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Typography variant="h5" gutterBottom>
        Distribution des Comptes
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des comptes par plateforme
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Gérés vs Non Gérés
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={managedChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {managedChartData.map((entry, index) => (
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
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Safes par Nombre de Comptes
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Accounts Table Section */}
      <Typography variant="h5" gutterBottom>
        Liste des Comptes
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="platform-filter-label">Plateforme</InputLabel>
              <Select
                labelId="platform-filter-label"
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
            <FormControl fullWidth>
              <InputLabel id="safe-filter-label">Safe</InputLabel>
              <Select
                labelId="safe-filter-label"
                value={filterSafe}
                label="Safe"
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Rechercher par nom d'utilisateur ou adresse"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterPlatform("All");
                setFilterSafe("All");
                setSearchTerm("");
              }}
            >
              Effacer les Filtres
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Accounts Table */}
      <Paper sx={{ width: "100%", overflow: "hidden", mb: 4 }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nom d'utilisateur</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Plateforme</TableCell>
                <TableCell>Safe</TableCell>
                <TableCell>Gestion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.slice(0, 100).map((account, index) => (
                <TableRow key={index} hover>
                  <TableCell>{account.Username || "N/A"}</TableCell>
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
                          : "Non Géré"
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
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredAccounts.length > 100 && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Affichage de 100 comptes sur {filteredAccounts.length}. Utilisez
              les filtres pour affiner les résultats.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AccountsAnalysis;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import { getSafeStats } from "../../utils/csvParser";
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
  TextField,
  Chip,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoIcon from "@mui/icons-material/Info";
import DataStatusIndicator from "../common/DataStatusIndicator";
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

// Données de test pour affichage quand les données réelles ne sont pas disponibles
const mockData = {
  safes: [
    {
      SafeName: "Root",
      Description: "Safe principal",
      Status: "Active",
      Size: 120,
      LastModified: "2023-05-12",
    },
    {
      SafeName: "Administrators",
      Description: "Safe administrateur",
      Status: "Active",
      Size: 85,
      LastModified: "2023-06-04",
    },
    {
      SafeName: "Applications",
      Description: "Applications intégrées",
      Status: "Active",
      Size: 230,
      LastModified: "2023-05-28",
    },
    {
      SafeName: "Backup",
      Description: "Sauvegardes système",
      Status: "Inactive",
      Size: 320,
      LastModified: "2023-01-15",
    },
    {
      SafeName: "VendorAccess",
      Description: "Accès fournisseurs",
      Status: "Active",
      Size: 45,
      LastModified: "2023-04-20",
    },
  ],
  statusDistribution: [
    { name: "Actifs", value: 4 },
    { name: "Inactifs", value: 1 },
  ],
  sizeDistribution: [
    { name: "0-50 MB", value: 1 },
    { name: "51-100 MB", value: 1 },
    { name: "101-200 MB", value: 1 },
    { name: ">200 MB", value: 2 },
  ],
};

// SafesAnalysis Component
const SafesAnalysis = ({ dashboardType }) => {
  const { safesData, safesStats, getDashboardDataStatus } = useData();
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSafes, setFilteredSafes] = useState([]);
  const navigate = useNavigate();

  // Vérifier la disponibilité des données
  const hasSafesData = safesData && safesData.length > 0;
  const dataStatus = getDashboardDataStatus(dashboardType || "capacity");

  // Calculate stats when safesData changes
  useEffect(() => {
    if (hasSafesData) {
      setStats(safesStats || getSafeStats(safesData));
      setFilteredSafes(safesData);
    }
  }, [safesData, safesStats, hasSafesData]);

  // Apply search filter
  useEffect(() => {
    if (!safesData) return;

    if (searchTerm.trim() === "") {
      setFilteredSafes(safesData);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = safesData.filter((safe) => {
      const safeName = (safe.SafeName || "").toLowerCase();
      const description = (safe.Description || "").toLowerCase();
      return safeName.includes(term) || description.includes(term);
    });

    setFilteredSafes(filtered);
  }, [safesData, searchTerm]);

  // Fonction pour afficher un message lorsque les données ne sont pas disponibles
  const renderDataNotAvailableMessage = () => (
    <Alert
      severity="info"
      icon={<InfoIcon />}
      sx={{ mb: 3 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => navigate(`/upload/${dashboardType || "capacity"}`)}
        >
          Importer
        </Button>
      }
    >
      Les données de safes ne sont pas disponibles. Certaines analyses ne
      peuvent pas être affichées.
    </Alert>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analyse des Safes
      </Typography>

      {/* Indicateur de statut des données spécifique à cette page */}
      {!hasSafesData && renderDataNotAvailableMessage()}

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Rechercher un safe"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total des Safes
              </Typography>
              <Typography variant="h4">
                {hasSafesData ? stats?.totalSafes || 0 : mockData.safes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Safes Actifs
              </Typography>
              <Typography variant="h4">
                {hasSafesData
                  ? stats?.activeSafes || 0
                  : mockData.safes.filter((s) => s.Status === "Active").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Safes Inactifs
              </Typography>
              <Typography variant="h4">
                {hasSafesData
                  ? stats?.inactiveSafes || 0
                  : mockData.safes.filter((s) => s.Status === "Inactive")
                      .length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taille Moyenne
              </Typography>
              <Typography variant="h4">
                {hasSafesData
                  ? stats?.averageSize
                    ? `${stats.averageSize.toFixed(2)} MB`
                    : "0 MB"
                  : `${(
                      mockData.safes.reduce((acc, safe) => acc + safe.Size, 0) /
                      mockData.safes.length
                    ).toFixed(2)} MB`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Safe Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des Statuts
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      hasSafesData
                        ? stats?.statusDistribution || []
                        : mockData.statusDistribution
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(hasSafesData
                      ? stats?.statusDistribution || []
                      : mockData.statusDistribution
                    ).map((entry, index) => (
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
            </Box>
          </Paper>
        </Grid>

        {/* Safe Size Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des Tailles
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    hasSafesData
                      ? stats?.sizeDistribution || []
                      : mockData.sizeDistribution
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Safes Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nom du Safe</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Taille (MB)</TableCell>
                <TableCell>Dernière Modification</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(hasSafesData ? filteredSafes : mockData.safes).map(
                (safe, index) => (
                  <TableRow key={index}>
                    <TableCell>{safe.SafeName}</TableCell>
                    <TableCell>{safe.Description}</TableCell>
                    <TableCell>
                      <Chip
                        label={safe.Status}
                        color={safe.Status === "Active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{safe.Size}</TableCell>
                    <TableCell>{safe.LastModified}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!hasSafesData && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Les données affichées sont des exemples. Importez vos données pour
              voir les analyses réelles.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => navigate(`/upload/${dashboardType || "capacity"}`)}
              sx={{ mt: 1 }}
            >
              Importer des données
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SafesAnalysis;

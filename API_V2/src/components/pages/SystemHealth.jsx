import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import { getSystemHealthStats } from "../../utils/csvParser";
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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// SystemHealth Component
const SystemHealth = () => {
  const { systemHealthData, systemHealthStats } = useData();
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const navigate = useNavigate();

  // Calculate stats when systemHealthData changes
  useEffect(() => {
    if (systemHealthData && systemHealthData.length > 0) {
      setStats(systemHealthStats || getSystemHealthStats(systemHealthData));
      setFilteredMetrics(systemHealthData);
    }
  }, [systemHealthData, systemHealthStats]);

  // Si pas de données, afficher un message
  if (!systemHealthData || systemHealthData.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Aucune donnée système disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Pour visualiser l'état du système, veuillez d'abord importer vos
            données CSV.
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

  // Apply search filter
  useEffect(() => {
    if (!systemHealthData) return;

    if (searchTerm.trim() === "") {
      setFilteredMetrics(systemHealthData);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = systemHealthData.filter((metric) => {
      const component = (metric.Component || "").toLowerCase();
      const status = (metric.Status || "").toLowerCase();
      return component.includes(term) || status.includes(term);
    });

    setFilteredMetrics(filtered);
  }, [systemHealthData, searchTerm]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        État du Système
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Rechercher un composant"
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
                Total des Composants
              </Typography>
              <Typography variant="h4">
                {stats?.totalComponents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Composants Sains
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats?.healthyComponents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Composants en Alerte
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats?.warningComponents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Composants en Erreur
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats?.errorComponents || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Métriques de Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.performanceMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU (%)"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    name="Mémoire (%)"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Component Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des États
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.statusDistribution || []}>
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

      {/* Components Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Composant</TableCell>
                <TableCell>État</TableCell>
                <TableCell>CPU (%)</TableCell>
                <TableCell>Mémoire (%)</TableCell>
                <TableCell>Dernière Mise à Jour</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMetrics.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell>{metric.Component}</TableCell>
                  <TableCell>
                    <Chip
                      label={metric.Status}
                      color={
                        metric.Status === "Healthy"
                          ? "success"
                          : metric.Status === "Warning"
                          ? "warning"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{metric.CPU}%</TableCell>
                  <TableCell>{metric.Memory}%</TableCell>
                  <TableCell>
                    {metric.Timestamp
                      ? new Date(metric.Timestamp).toLocaleString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SystemHealth;

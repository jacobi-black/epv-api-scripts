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

// SafesAnalysis Component
const SafesAnalysis = () => {
  const { safesData, safesStats } = useData();
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSafes, setFilteredSafes] = useState([]);
  const navigate = useNavigate();

  // Calculate stats when safesData changes
  useEffect(() => {
    if (safesData && safesData.length > 0) {
      setStats(safesStats || getSafeStats(safesData));
      setFilteredSafes(safesData);
    }
  }, [safesData, safesStats]);

  // Si pas de données, afficher un message
  if (!safesData || safesData.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Aucune donnée de safes disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Pour visualiser les analyses des safes, veuillez d'abord importer
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analyse des Safes
      </Typography>

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
              <Typography variant="h4">{stats?.totalSafes || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Safes Actifs
              </Typography>
              <Typography variant="h4">{stats?.activeSafes || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Safes Inactifs
              </Typography>
              <Typography variant="h4">{stats?.inactiveSafes || 0}</Typography>
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
                {stats?.averageSize
                  ? `${stats.averageSize.toFixed(2)} MB`
                  : "0 MB"}
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
                    data={stats?.statusDistribution || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(stats?.statusDistribution || []).map((entry, index) => (
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
                <BarChart data={stats?.sizeDistribution || []}>
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
              {filteredSafes.map((safe, index) => (
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
                  <TableCell>{safe.Size ? `${safe.Size} MB` : "N/A"}</TableCell>
                  <TableCell>
                    {safe.LastModified
                      ? new Date(safe.LastModified).toLocaleDateString()
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

export default SafesAnalysis;

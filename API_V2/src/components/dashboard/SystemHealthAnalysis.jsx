import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useData } from "../../utils/DataContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const SystemHealthAnalysis = () => {
  const { systemHealthData, systemHealthStats } = useData();

  if (!systemHealthData.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Aucune donnée de santé système disponible
        </Typography>
      </Box>
    );
  }

  // Préparer les données pour les graphiques
  const componentStatusData = systemHealthStats?.componentStatus || [];
  const performanceData = systemHealthStats?.performance || [];
  const resourceUsageData = systemHealthStats?.resourceUsage || [];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Statistiques générales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              État Général du Système
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Composants surveillés
                </Typography>
                <Typography variant="h4">{systemHealthData.length}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Composants en erreur
                </Typography>
                <Typography variant="h4" color="error">
                  {
                    componentStatusData.filter((c) => c.status === "error")
                      .length
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Composants en maintenance
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {
                    componentStatusData.filter(
                      (c) => c.status === "maintenance"
                    ).length
                  }
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Graphique de l'état des composants */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              État des Composants
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={componentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="component" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Graphique des performances */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Métriques de Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Graphique de l'utilisation des ressources */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Utilisation des Ressources
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="resource" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="usage" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemHealthAnalysis;

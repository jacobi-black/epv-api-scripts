import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Box, Typography, Paper, Grid } from "@mui/material";

const ServicesStatusChart = ({
  data,
  title = "Statut des Services CyberArk",
  height = 300,
}) => {
  // Couleurs pour les différents états
  const COLORS = {
    Running: "#4caf50",
    Stopped: "#f44336",
    Warning: "#ff9800",
    Unknown: "#9e9e9e",
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: height }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Données insuffisantes pour afficher ce graphique
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Transformer les données pour le graphique à secteurs
  const chartData = Object.entries(
    data.reduce((acc, service) => {
      const status = service.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Calculer le pourcentage de services actifs
  const totalServices = chartData.reduce((sum, item) => sum + item.value, 0);
  const runningServices =
    chartData.find((item) => item.name === "Running")?.value || 0;
  const runningPercentage = totalServices
    ? Math.round((runningServices / totalServices) * 100)
    : 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography
              variant="h5"
              color={
                runningPercentage > 90
                  ? "success.main"
                  : runningPercentage > 70
                  ? "warning.main"
                  : "error.main"
              }
            >
              {runningPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Services Actifs
            </Typography>
            <Typography variant="body1" mt={2}>
              {runningServices} services en cours d'exécution
            </Typography>
            <Typography variant="body1">
              sur {totalServices} services au total
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#9e9e9e"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServicesStatusChart;

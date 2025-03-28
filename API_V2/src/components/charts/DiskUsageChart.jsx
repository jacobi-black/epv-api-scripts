import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Box, Typography, Paper } from "@mui/material";

const DiskUsageChart = ({
  data,
  title = "Utilisation Disque des Serveurs",
  height = 300,
}) => {
  // Formatter pour le tooltip qui affichera "x%" pour les valeurs
  const percentFormatter = (value) => `${value}%`;

  // Définition des couleurs selon le niveau d'utilisation
  const getBarColor = (value) => {
    if (value < 70) return "#4caf50"; // Vert pour utilisation faible
    if (value < 85) return "#ff9800"; // Orange pour utilisation moyenne
    return "#f44336"; // Rouge pour utilisation élevée
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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="server" />
            <YAxis
              domain={[0, 100]}
              tickFormatter={percentFormatter}
              label={{
                value: "Utilisation (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={percentFormatter}
              labelFormatter={(value) => `Serveur: ${value}`}
            />
            <Legend />
            <Bar dataKey="usage" name="Utilisation" fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.usage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default DiskUsageChart;

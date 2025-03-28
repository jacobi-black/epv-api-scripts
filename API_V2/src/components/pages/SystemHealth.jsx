import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const SystemHealth = () => {
  // Exemple de données pour le graphique
  const data = [
    { name: "Lun", cpu: 45, memory: 60, disk: 55 },
    { name: "Mar", cpu: 50, memory: 65, disk: 56 },
    { name: "Mer", cpu: 55, memory: 70, disk: 58 },
    { name: "Jeu", cpu: 48, memory: 62, disk: 57 },
    { name: "Ven", cpu: 52, memory: 68, disk: 59 },
    { name: "Sam", cpu: 40, memory: 58, disk: 54 },
    { name: "Dim", cpu: 35, memory: 55, disk: 53 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Health
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Utilisation des ressources système
            </Typography>
            <LineChart width={800} height={400} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#8884d8"
                name="CPU (%)"
              />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="#82ca9d"
                name="Mémoire (%)"
              />
              <Line
                type="monotone"
                dataKey="disk"
                stroke="#ffc658"
                name="Disque (%)"
              />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemHealth;

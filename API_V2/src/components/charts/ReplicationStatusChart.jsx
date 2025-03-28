import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Paper, Grid, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SyncIcon from "@mui/icons-material/Sync";

const ReplicationStatusChart = ({
  data,
  title = "Réplication vers les Sites DR",
  height = 300,
}) => {
  // Formatter pour le tooltip
  const timeFormatter = (value) => `${value} ms`;

  // Définition des couleurs selon l'état
  const getBarColor = (status) => {
    switch (status) {
      case "Connected":
        return "#4caf50";
      case "Disconnected":
        return "#f44336";
      case "Syncing":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
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

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Résumé
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
              <Typography variant="body2">
                {data.filter((item) => item.status === "Connected").length} DR
                sites connectés
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <SyncIcon sx={{ color: "warning.main", mr: 1 }} />
              <Typography variant="body2">
                {data.filter((item) => item.status === "Syncing").length} DR
                sites en synchronisation
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ErrorIcon sx={{ color: "error.main", mr: 1 }} />
              <Typography variant="body2">
                {data.filter((item) => item.status === "Disconnected").length}{" "}
                DR sites déconnectés
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box sx={{ height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="site" />
                <YAxis
                  label={{
                    value: "Délai (ms)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={timeFormatter}
                  labelFormatter={(value) => `Site: ${value}`}
                />
                <Legend />
                <Bar dataKey="delay" name="Délai de Réplication" fill="#8884d8">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.status)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Statut par Site DR
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {data.map((item, index) => (
            <Chip
              key={index}
              label={`${item.site}: ${item.status}`}
              icon={
                item.status === "Connected" ? (
                  <CheckCircleIcon />
                ) : item.status === "Syncing" ? (
                  <SyncIcon />
                ) : (
                  <ErrorIcon />
                )
              }
              color={
                item.status === "Connected"
                  ? "success"
                  : item.status === "Syncing"
                  ? "warning"
                  : "error"
              }
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReplicationStatusChart;

import React from "react";
import { Box, Typography, Paper, Grid, Button, Alert } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import { useData } from "../../utils/DataContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const dataContext = useData();

  // Vérifier si des données sont disponibles
  const hasData =
    dataContext.accountsData.length > 0 ||
    dataContext.safesData.length > 0 ||
    dataContext.systemHealthData.length > 0;

  if (!hasData) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Aucune donnée disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Pour visualiser les dashboards, veuillez d'abord importer vos
            données CSV.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/upload")}
          >
            Importer des données
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={
              window.location.pathname.includes("accounts")
                ? "contained"
                : "outlined"
            }
            onClick={() => navigate("/dashboard/accounts")}
          >
            Comptes
          </Button>
          <Button
            variant={
              window.location.pathname.includes("safes")
                ? "contained"
                : "outlined"
            }
            onClick={() => navigate("/dashboard/safes")}
          >
            Safes
          </Button>
          <Button
            variant={
              window.location.pathname.includes("system-health")
                ? "contained"
                : "outlined"
            }
            onClick={() => navigate("/dashboard/system-health")}
          >
            Santé Système
          </Button>
        </Box>
      </Box>

      <Outlet />
    </Box>
  );
};

export default Dashboard;

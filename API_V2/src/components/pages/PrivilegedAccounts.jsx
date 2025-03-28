import React from "react";
import { Box, Typography, Paper, Grid, Alert } from "@mui/material";
import { useData } from "../../utils/DataContext";

const PrivilegedAccounts = ({ subview }) => {
  const dataContext = useData();
  const { accountsData, sessionsData, usersData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = accountsData?.length > 0 && usersData?.length > 0;

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard des comptes
        privilégiés. Veuillez importer les fichiers d'inventaire de comptes et
        d'utilisateurs.
      </Alert>
    );
  }

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "privilegedAccounts":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Inventaire des comptes privilégiés
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "accessActivity":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Activité d'accès
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      default:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Distribution des comptes par type
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Comptes à risque élevé
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Tendances d'utilisation des comptes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Ce dashboard sera implémenté dans la Phase 2 de la roadmap.
      </Alert>
      {renderSubview()}
    </Box>
  );
};

export default PrivilegedAccounts;

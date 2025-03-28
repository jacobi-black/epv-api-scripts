import React from "react";
import { Box, Typography, Paper, Grid, Alert } from "@mui/material";
import { useData } from "../../utils/DataContext";

const SessionMonitoring = ({ subview }) => {
  const dataContext = useData();
  const { sessionsData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = sessionsData?.length > 0;

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard de monitoring des
        sessions. Veuillez importer les fichiers de sessions.
      </Alert>
    );
  }

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "active":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Sessions actives
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "anomalies":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Détection d'anomalies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "geo":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Visualisation géographique
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
                  Sessions actives
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Statistiques des sessions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Analyse temporelle
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

export default SessionMonitoring;

import React from "react";
import { Box, Typography, Paper, Grid, Alert } from "@mui/material";
import { useData } from "../../utils/DataContext";

const PasswordRotation = ({ subview }) => {
  const dataContext = useData();
  const { accountsData, safesData, pendingData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = accountsData?.length > 0 && safesData?.length > 0;

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard de rotation des mots de
        passe. Veuillez importer les fichiers d'inventaire de comptes et de
        coffres.
      </Alert>
    );
  }

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "performance":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance des rotations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "issues":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Comptes problématiques
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "safes":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Coffres et sauvegardes
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
                  Statistiques de rotation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Comptes en échec
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Analyse des tendances
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

export default PasswordRotation;

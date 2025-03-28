import React from "react";
import { Box, Typography, Paper, Grid, Alert } from "@mui/material";
import { useData } from "../../utils/DataContext";

const AdoptionEfficiency = ({ subview }) => {
  const dataContext = useData();
  const { usersData, usageData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = usersData?.length > 0 || usageData?.length > 0;

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard d'efficacité et
        adoption. Veuillez importer les fichiers d'utilisateurs et
        d'utilisation.
      </Alert>
    );
  }

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "department":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Adoption par département
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "operational":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Efficacité opérationnelle
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "satisfaction":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Satisfaction utilisateurs
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
                  Taux d'adoption par équipe
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Utilisateurs actifs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Workflows automatisés
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

export default AdoptionEfficiency;

import React from "react";
import { Box, Typography, Paper, Grid, Alert } from "@mui/material";
import { useData } from "../../utils/DataContext";

const AuditReports = ({ subview }) => {
  const dataContext = useData();
  const { auditData, accountsData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = auditData?.length > 0 || accountsData?.length > 0;

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard des rapports d'audit.
        Veuillez importer les fichiers d'audit ou d'inventaire de comptes.
      </Alert>
    );
  }

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "compliance":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Rapports de conformité
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cette section est en cours de développement (Phase 2).
            </Typography>
          </Paper>
        );
      case "activity":
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Rapports d'activité
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
                  Rapports prédéfinis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Générateur de rapports
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cette section est en cours de développement (Phase 2).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Historique des rapports
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

export default AuditReports;

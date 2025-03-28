import React from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";

const SystemHealth = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Health
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Cette page est en cours de développement. Elle permettra de surveiller
          la santé du système CyberArk.
        </Alert>
      </Paper>
    </Box>
  );
};

export default SystemHealth;

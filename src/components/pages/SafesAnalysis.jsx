import React from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";

const SafesAnalysis = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Safes Analysis
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Cette page est en cours de développement. Elle permettra d'analyser
          les coffres CyberArk.
        </Alert>
      </Paper>
    </Box>
  );
};

export default SafesAnalysis;

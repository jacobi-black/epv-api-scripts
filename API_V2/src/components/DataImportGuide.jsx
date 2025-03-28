import React from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Code,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import TerminalIcon from "@mui/icons-material/Terminal";
import SecurityIcon from "@mui/icons-material/Security";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const DataImportGuide = () => {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Guide d'importation de données
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Ce guide vous explique comment générer les fichiers CSV nécessaires pour
        alimenter les dashboards de l'application.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Prérequis
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="PowerShell v5.1 ou supérieur"
              secondary="Les scripts utilisent des fonctionnalités de PowerShell v5.1+"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Accès aux API CyberArk"
              secondary="Les scripts nécessitent un accès aux API REST de CyberArk"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Droits administratifs"
              secondary="Certains scripts nécessitent des droits administratifs pour s'exécuter correctement"
            />
          </ListItem>
        </List>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Scripts disponibles
      </Typography>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <TerminalIcon sx={{ mr: 1 }} /> System-Health.ps1
            <Chip
              label="Health Dashboard"
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Ce script collecte des informations sur l'état de santé de vos
            composants CyberArk (CPM, PVWA, Vault, etc.) incluant utilisation
            CPU, mémoire, espace disque, état des services et bien plus.
          </Typography>
          <Typography variant="body2">
            Plus de détails sur ce script seront ajoutés prochainement.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Autres scripts peuvent être ajoutés ici */}
    </Box>
  );
};

export default DataImportGuide;

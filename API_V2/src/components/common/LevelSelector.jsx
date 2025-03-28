import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Tooltip,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import BusinessIcon from "@mui/icons-material/Business";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EngineeringIcon from "@mui/icons-material/Engineering";

/**
 * Composant de sélection du niveau d'affichage des KPI
 * Permet de filtrer les indicateurs selon le niveau hiérarchique de l'utilisateur
 */
const LevelSelector = ({ onChange, defaultLevel = "operational" }) => {
  const [level, setLevel] = useState(defaultLevel);

  const levels = [
    {
      value: "strategic",
      label: "Stratégique",
      description: "Vision globale pour la direction",
      icon: <BusinessIcon />,
    },
    {
      value: "tactical",
      label: "Tactique",
      description: "Indicateurs pour les managers",
      icon: <SupervisorAccountIcon />,
    },
    {
      value: "operational",
      label: "Opérationnel",
      description: "Métriques détaillées pour les équipes techniques",
      icon: <EngineeringIcon />,
    },
  ];

  useEffect(() => {
    if (onChange) {
      onChange(level);
    }
  }, [level, onChange]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="level-selector-label">Niveau d'affichage</InputLabel>
        <Select
          labelId="level-selector-label"
          id="level-selector"
          value={level}
          label="Niveau d'affichage"
          onChange={(e) => setLevel(e.target.value)}
        >
          {levels.map((lvl) => (
            <MenuItem key={lvl.value} value={lvl.value}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {lvl.icon}
                <Typography>{lvl.label}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip
        title={
          <Box>
            <Typography variant="subtitle2">Niveaux d'affichage:</Typography>
            {levels.map((lvl) => (
              <Box key={lvl.value} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>{lvl.label}:</strong> {lvl.description}
                </Typography>
              </Box>
            ))}
          </Box>
        }
      >
        <IconButton size="small">
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {level === "strategic" && (
        <Chip
          label="KPI Direction"
          size="small"
          color="primary"
          icon={<BusinessIcon />}
        />
      )}
      {level === "tactical" && (
        <Chip
          label="KPI Management"
          size="small"
          color="secondary"
          icon={<SupervisorAccountIcon />}
        />
      )}
      {level === "operational" && (
        <Chip
          label="KPI Opérationnels"
          size="small"
          color="default"
          icon={<EngineeringIcon />}
        />
      )}
    </Box>
  );
};

export default LevelSelector;

import React from "react";
import {
  Box,
  Typography,
  Tooltip,
  Chip,
  Paper,
  Button,
  IconButton,
  Collapse,
  Alert,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import HelpIcon from "@mui/icons-material/Help";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FileUploadIcon from "@mui/icons-material/FileUpload";

/**
 * Composant qui affiche l'état des données pour un dashboard
 * Indique quels fichiers sont nécessaires, lesquels sont manquants, et offre de l'aide
 */
const DataStatusIndicator = ({
  requiredFiles = [],
  presentFiles = [],
  onUploadClick,
  showDetailedInfo = false,
  setShowDetailedInfo = () => {},
}) => {
  // Calcul des fichiers manquants
  const missingFiles = requiredFiles.filter(
    (file) => !presentFiles.includes(file.name)
  );

  // Calcul du pourcentage de complétude
  const completionPercentage =
    requiredFiles.length > 0
      ? Math.round((presentFiles.length / requiredFiles.length) * 100)
      : 100;

  // Statut global basé sur le pourcentage
  const getStatus = () => {
    if (completionPercentage === 100) return "complete";
    if (completionPercentage >= 60) return "partial";
    return "minimal";
  };

  const status = getStatus();

  const getStatusColor = () => {
    if (status === "complete") return "success";
    if (status === "partial") return "warning";
    return "error";
  };

  const getStatusLabel = () => {
    if (status === "complete") return "Données complètes";
    if (status === "partial") return "Données partielles";
    return "Données minimales";
  };

  const getStatusIcon = () => {
    if (status === "complete") return null;
    if (status === "partial") return <WarningIcon fontSize="small" />;
    return <WarningIcon fontSize="small" />;
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        mb: 2,
        borderLeft: 4,
        borderColor: `${getStatusColor()}.main`,
        backgroundColor: `${getStatusColor()}.light`,
        opacity: 0.9,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {getStatusIcon()}
          <Typography variant="subtitle2" sx={{ mx: 1 }}>
            {getStatusLabel()} ({completionPercentage}%)
          </Typography>
          <Chip
            label={`${presentFiles.length}/${requiredFiles.length} fichiers`}
            size="small"
            color={getStatusColor()}
          />
        </Box>

        <Box>
          {missingFiles.length > 0 && (
            <Button
              startIcon={<FileUploadIcon />}
              size="small"
              variant="outlined"
              color={getStatusColor()}
              onClick={onUploadClick}
              sx={{ mr: 1 }}
            >
              Importer
            </Button>
          )}

          <IconButton
            size="small"
            onClick={() => setShowDetailedInfo(!showDetailedInfo)}
            color="inherit"
          >
            {showDetailedInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={showDetailedInfo}>
        <Box sx={{ mt: 2 }}>
          {requiredFiles.map((file) => {
            const isPresent = presentFiles.includes(file.name);
            return (
              <Box
                key={file.name}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Chip
                  size="small"
                  label={isPresent ? "Présent" : "Manquant"}
                  color={isPresent ? "success" : "error"}
                  sx={{ mr: 1, width: 80 }}
                />
                <Typography variant="body2">{file.name}</Typography>

                <Tooltip
                  title={file.description || "Aucune description disponible"}
                >
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {file.script && (
                  <Tooltip title={`Script: ${file.script}`}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {file.script}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            );
          })}

          {status !== "complete" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Ce dashboard s'adapte aux données disponibles. Certaines
                visualisations peuvent être limitées.
              </Typography>
            </Alert>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DataStatusIndicator;

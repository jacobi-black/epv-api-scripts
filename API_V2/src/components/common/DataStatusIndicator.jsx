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
  // Ne rien afficher du tout - composant désactivé
  return null;
};

export default DataStatusIndicator;

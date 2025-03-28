import React from "react";
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  Chip,
  CircularProgress,
  LinearProgress,
  useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

/**
 * Composant KPI amélioré avec indicateurs de tendance et seuils d'alerte
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Titre du KPI
 * @param {any} props.value - Valeur actuelle du KPI
 * @param {string} props.unit - Unité de mesure (%, ms, etc.)
 * @param {number} props.change - Pourcentage de changement (positif ou négatif)
 * @param {string} props.timeframe - Période de comparaison (ex: "vs mois dernier")
 * @param {Object} props.thresholds - Seuils d'alerte {warning: 70, danger: 90}
 * @param {boolean} props.loading - Indicateur de chargement
 * @param {boolean} props.inverseThreshold - Inverser la logique des seuils (pour les métriques où une valeur basse est problématique)
 * @param {('strategic'|'tactical'|'operational')} props.level - Niveau hiérarchique cible du KPI
 * @param {('strategic'|'tactical'|'operational')} props.currentLevel - Niveau actuellement sélectionné
 * @param {string} props.description - Description détaillée du KPI
 */
const EnhancedKPI = ({
  title,
  value,
  unit = "",
  change,
  timeframe = "",
  thresholds = { warning: 70, danger: 90 },
  loading = false,
  inverseThreshold = false,
  level = "operational",
  currentLevel = "operational",
  description = "",
  dataSources = [],
  width = 300,
}) => {
  const theme = useTheme();

  // Si le niveau actuel ne correspond pas au niveau cible du KPI, on réduit l'opacité
  const matchesLevel =
    (currentLevel === "strategic" && level === "strategic") ||
    (currentLevel === "tactical" &&
      (level === "tactical" || level === "strategic")) ||
    currentLevel === "operational";

  const opacity = matchesLevel ? 1 : 0.5;

  // Détermination de la couleur basée sur les seuils
  const getStatusColor = () => {
    if (loading || value === undefined || value === null)
      return theme.palette.grey[500];

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return theme.palette.info.main;

    if (inverseThreshold) {
      if (numValue <= thresholds.danger) return theme.palette.error.main;
      if (numValue <= thresholds.warning) return theme.palette.warning.main;
      return theme.palette.success.main;
    } else {
      if (numValue >= thresholds.danger) return theme.palette.error.main;
      if (numValue >= thresholds.warning) return theme.palette.warning.main;
      return theme.palette.success.main;
    }
  };

  // Détermination de l'icône de tendance
  const getTrendIcon = () => {
    if (change === undefined || change === null) return null;
    if (change > 3)
      return (
        <TrendingUpIcon
          fontSize="small"
          color={inverseThreshold ? "error" : "success"}
        />
      );
    if (change < -3)
      return (
        <TrendingDownIcon
          fontSize="small"
          color={inverseThreshold ? "success" : "error"}
        />
      );
    return <TrendingFlatIcon fontSize="small" color="info" />;
  };

  // Détermination de l'icône de statut
  const getStatusIcon = () => {
    if (loading || value === undefined || value === null) return null;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    if (inverseThreshold) {
      if (numValue <= thresholds.danger)
        return <ErrorIcon fontSize="small" color="error" />;
      if (numValue <= thresholds.warning)
        return <WarningIcon fontSize="small" color="warning" />;
      return <CheckCircleIcon fontSize="small" color="success" />;
    } else {
      if (numValue >= thresholds.danger)
        return <ErrorIcon fontSize="small" color="error" />;
      if (numValue >= thresholds.warning)
        return <WarningIcon fontSize="small" color="warning" />;
      return <CheckCircleIcon fontSize="small" color="success" />;
    }
  };

  // Calcul du pourcentage pour la barre de progression
  const getProgressValue = () => {
    if (value === undefined || value === null) return 0;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;

    // Limiter entre 0 et 100
    return Math.min(100, Math.max(0, numValue));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        width: width,
        height: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity,
        transition: "opacity 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Badge de niveau */}
      <Chip
        label={
          level === "strategic"
            ? "Direction"
            : level === "tactical"
            ? "Management"
            : "Opérationnel"
        }
        size="small"
        color={
          level === "strategic"
            ? "primary"
            : level === "tactical"
            ? "secondary"
            : "default"
        }
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          opacity: 0.7,
        }}
      />

      {/* Titre */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Tooltip title={description || title}>
          <Typography variant="subtitle1" fontWeight={500}>
            {title}
          </Typography>
        </Tooltip>
      </Box>

      {/* Valeur */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          my: 1,
        }}
      >
        {loading ? (
          <CircularProgress size={40} />
        ) : (
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <Typography variant="h4" fontWeight="bold" color={getStatusColor()}>
              {value}
            </Typography>
            <Typography variant="body1" sx={{ ml: 0.5 }} color="text.secondary">
              {unit}
            </Typography>
            {getStatusIcon()}
          </Box>
        )}
      </Box>

      {/* Indicateur de tendance */}
      {change !== undefined && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          {getTrendIcon()}
          <Typography
            variant="body2"
            color={
              change > 3
                ? inverseThreshold
                  ? "error"
                  : "success"
                : change < -3
                ? inverseThreshold
                  ? "success"
                  : "error"
                : "text.secondary"
            }
            sx={{ ml: 0.5 }}
          >
            {change > 0 ? "+" : ""}
            {change}% {timeframe}
          </Typography>
        </Box>
      )}

      {/* Barre de progression */}
      {value !== undefined && !isNaN(parseFloat(value)) && (
        <Tooltip title={`${getProgressValue()}% ${description || ""}`}>
          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                backgroundColor: getStatusColor(),
              },
            }}
          />
        </Tooltip>
      )}

      {/* Source des données */}
      {dataSources && dataSources.length > 0 && (
        <Tooltip title={`Sources: ${dataSources.join(", ")}`}>
          <Typography
            variant="caption"
            sx={{ mt: 1, textAlign: "right", opacity: 0.6 }}
          >
            {dataSources.length > 1
              ? `${dataSources.length} sources`
              : dataSources[0]}
          </Typography>
        </Tooltip>
      )}
    </Paper>
  );
};

export default EnhancedKPI;

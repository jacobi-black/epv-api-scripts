import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  Chip,
  CircularProgress,
  LinearProgress,
  useTheme,
  IconButton,
  Collapse,
  Divider,
  Badge,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import LockIcon from "@mui/icons-material/Lock";

/**
 * Composant KPI amélioré avec indicateurs de tendance, seuils d'alerte
 * et visualisation des niveaux de sécurité
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
 * @param {Array} props.dataSources - Sources de données utilisées pour ce KPI
 * @param {number} props.width - Largeur du composant
 * @param {Object} props.securityLevel - Niveau de sécurité {level: 'high'|'medium'|'low', description: '...'}
 * @param {Object} props.historyData - Données historiques pour mini-graphique
 * @param {Object} props.complianceStatus - Statut de conformité {status: 'compliant'|'warning'|'violation', details: '...'}
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
  securityLevel = null,
  historyData = null,
  complianceStatus = null,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

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

  // Récupérer l'icône de niveau de sécurité
  const getSecurityLevelIcon = () => {
    if (!securityLevel) return null;

    switch (securityLevel.level) {
      case "high":
        return <SecurityIcon color="success" fontSize="small" />;
      case "medium":
        return <ShieldIcon color="warning" fontSize="small" />;
      case "low":
        return <LockIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  // Récupérer l'icône de statut de conformité
  const getComplianceStatusIcon = () => {
    if (!complianceStatus) return null;

    switch (complianceStatus.status) {
      case "compliant":
        return <CheckCircleIcon color="success" fontSize="small" />;
      case "warning":
        return <WarningIcon color="warning" fontSize="small" />;
      case "violation":
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  // Dessiner un mini-graphique avec les données historiques
  const renderMiniChart = () => {
    if (!historyData || !historyData.values || historyData.values.length === 0)
      return null;

    const values = historyData.values;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    return (
      <Box
        sx={{ mt: 1, height: "20px", display: "flex", alignItems: "flex-end" }}
      >
        {values.map((val, index) => {
          const height = range === 0 ? 10 : 5 + ((val - min) / range) * 15;
          return (
            <Box
              key={index}
              sx={{
                height: `${height}px`,
                width: "3px",
                backgroundColor: getBarColor(val),
                mx: "1px",
                borderRadius: "1px",
                transition: "height 0.3s ease",
              }}
            />
          );
        })}
      </Box>
    );
  };

  // Couleur des barres du mini-graphique
  const getBarColor = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return theme.palette.primary.main;

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

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        width: width,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-2px)",
        },
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

      {/* Titre avec niveau de sécurité et conformité si disponibles */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Tooltip title={description || title}>
          <Typography variant="subtitle1" fontWeight={500}>
            {title}
          </Typography>
        </Tooltip>
        {(securityLevel || complianceStatus) && (
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", mr: 3 }}
          >
            {securityLevel && (
              <Tooltip
                title={`Niveau de sécurité: ${
                  securityLevel.description || securityLevel.level
                }`}
              >
                <IconButton size="small" sx={{ mr: 0.5 }}>
                  {getSecurityLevelIcon()}
                </IconButton>
              </Tooltip>
            )}
            {complianceStatus && (
              <Tooltip
                title={`Conformité: ${
                  complianceStatus.details || complianceStatus.status
                }`}
              >
                <IconButton size="small">
                  {getComplianceStatusIcon()}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
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

      {/* Mini-graphique historique si disponible */}
      {renderMiniChart()}

      {/* Tendance et barre de progression */}
      <Box sx={{ mt: 1 }}>
        {change !== undefined && change !== null && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getTrendIcon()}
              <Typography
                variant="caption"
                color={
                  change > 0
                    ? inverseThreshold
                      ? "error.main"
                      : "success.main"
                    : change < 0
                    ? inverseThreshold
                      ? "success.main"
                      : "error.main"
                    : "text.secondary"
                }
                sx={{ ml: 0.5 }}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {timeframe}
            </Typography>
          </Box>
        )}

        <LinearProgress
          variant="determinate"
          value={getProgressValue()}
          color={
            getProgressValue() >= thresholds.danger
              ? "error"
              : getProgressValue() >= thresholds.warning
              ? "warning"
              : "success"
          }
          sx={{ height: 5, borderRadius: 5 }}
        />
      </Box>

      {/* Bouton d'expansion pour plus de détails */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Section de détails supplémentaires */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ py: 1 }}>
          {/* Sources de données */}
          {dataSources && dataSources.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Sources de données:
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                {dataSources.map((source, index) => (
                  <Chip
                    key={index}
                    label={source}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.625rem" }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Description détaillée */}
          {description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {description}
            </Typography>
          )}

          {/* Détails de sécurité */}
          {securityLevel && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {getSecurityLevelIcon()}
                <span style={{ marginLeft: "4px" }}>
                  Niveau de sécurité:{" "}
                  {securityLevel.level.charAt(0).toUpperCase() +
                    securityLevel.level.slice(1)}
                </span>
              </Typography>
              {securityLevel.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 2 }}
                >
                  {securityLevel.description}
                </Typography>
              )}
            </Box>
          )}

          {/* Détails de conformité */}
          {complianceStatus && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {getComplianceStatusIcon()}
                <span style={{ marginLeft: "4px" }}>
                  Conformité:{" "}
                  {complianceStatus.status.charAt(0).toUpperCase() +
                    complianceStatus.status.slice(1)}
                </span>
              </Typography>
              {complianceStatus.details && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 2 }}
                >
                  {complianceStatus.details}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default EnhancedKPI;

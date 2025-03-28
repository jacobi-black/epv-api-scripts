import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeIcon from "@mui/icons-material/Code";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpIcon from "@mui/icons-material/Help";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

/**
 * Composant affichant des informations sur les sources de données
 * Détaille les scripts requis et fournit des exemples de commandes pour générer les données
 */
const DataSourceInfo = ({
  dataSources = [],
  lastUpdated = null,
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [copySuccess, setCopySuccess] = useState("");

  // Fonction pour copier une commande dans le presse-papier
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess("Copié!");
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch((err) => {
        console.error("Erreur lors de la copie:", err);
      });
  };

  // Si aucune source de données, affichage minimal
  if (!dataSources || dataSources.length === 0) {
    return (
      <Box sx={{ mt: 2, mb: 3, opacity: 0.7 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
          Aucune information sur les sources de données disponible
        </Typography>
      </Box>
    );
  }

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
      sx={{
        mt: 2,
        mb: 3,
        boxShadow: "none",
        "&:before": { display: "none" },
        backgroundColor: "transparent",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: "36px",
          "& .MuiAccordionSummary-content": { margin: "6px 0" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="subtitle2" sx={{ mr: 1 }}>
            Sources de données
          </Typography>

          <Chip
            size="small"
            label={`${dataSources.length} source${
              dataSources.length > 1 ? "s" : ""
            }`}
            color="primary"
            variant="outlined"
            sx={{ mr: 1 }}
          />

          {lastUpdated && (
            <Tooltip
              title={`Dernière mise à jour: ${new Date(
                lastUpdated
              ).toLocaleString("fr-FR")}`}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccessTimeIcon
                  fontSize="small"
                  sx={{ mr: 0.5, opacity: 0.7 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(lastUpdated).toLocaleDateString("fr-FR")}
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
          {dataSources.map((source, index) => (
            <React.Fragment key={source.name || `source-${index}`}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {source.type === "script" ? (
                    <CodeIcon color="primary" />
                  ) : (
                    <DescriptionIcon color="secondary" />
                  )}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="subtitle2">{source.name}</Typography>
                      {source.required && (
                        <Chip
                          size="small"
                          label="Requis"
                          color="error"
                          variant="outlined"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                      {!source.required && (
                        <Chip
                          size="small"
                          label="Optionnel"
                          color="info"
                          variant="outlined"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {source.description}
                      </Typography>

                      {source.type === "script" && source.path && (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Chemin: {source.path}
                          </Typography>
                        </Box>
                      )}

                      {source.type === "script" && source.command && (
                        <Paper
                          variant="outlined"
                          sx={{
                            mt: 1,
                            p: 1,
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            position: "relative",
                          }}
                        >
                          <Typography
                            variant="caption"
                            component="code"
                            sx={{
                              display: "block",
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                            }}
                          >
                            {source.command}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(source.command)}
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              opacity: 0.7,
                              "&:hover": { opacity: 1 },
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                          {copySuccess && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                right: 8,
                              }}
                            >
                              {copySuccess}
                            </Typography>
                          )}
                        </Paper>
                      )}

                      {source.link && (
                        <Box sx={{ mt: 1 }}>
                          <Link
                            href={source.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2"
                          >
                            Documentation
                          </Link>
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < dataSources.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
          <HelpIcon fontSize="small" sx={{ mr: 1, color: "info.main" }} />
          <Typography variant="body2" color="text.secondary">
            Tous les fichiers générés doivent être au format CSV, avec encodage
            UTF-8.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default DataSourceInfo;

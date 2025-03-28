import React from "react";
import {
  Tooltip as MUITooltip,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { green, red, orange } from "@mui/material/colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";

const ConnectivityChart = ({
  data,
  title = "Connectivité entre Composants",
  height = 300,
}) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: height }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Données insuffisantes pour afficher ce graphique
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Extraction de la liste unique des composants source et destination
  const components = Array.from(
    new Set([
      ...data.map((item) => item.source),
      ...data.map((item) => item.target),
    ])
  );

  // Création d'une matrice pour représenter la connectivité
  const connectivityMatrix = {};
  components.forEach((source) => {
    connectivityMatrix[source] = {};
    components.forEach((target) => {
      // Initialisation à null (non applicable) lorsque source = target
      connectivityMatrix[source][target] =
        source === target
          ? null
          : {
              status: "Unknown",
              latency: 0,
            };
    });
  });

  // Remplissage de la matrice avec les données réelles
  data.forEach((connection) => {
    connectivityMatrix[connection.source][connection.target] = {
      status: connection.status,
      latency: connection.latency,
    };
  });

  // Fonction pour déterminer l'icône et la couleur en fonction du statut
  const getStatusIcon = (status, latency) => {
    if (!status || status === "Unknown") return null;

    if (status === "Connected") {
      // Déterminer le niveau de latence
      if (latency < 100) {
        return <CheckCircleIcon sx={{ color: green[500] }} />;
      } else if (latency < 300) {
        return <WarningIcon sx={{ color: orange[500] }} />;
      } else {
        return <WarningIcon sx={{ color: red[300] }} />;
      }
    } else {
      return <ErrorIcon sx={{ color: red[500] }} />;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <TableContainer sx={{ maxHeight: height }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>De / Vers</TableCell>
              {components.map((component, index) => (
                <TableCell key={index} align="center">
                  {component}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {components.map((source, rowIndex) => (
              <TableRow key={rowIndex} hover>
                <TableCell component="th" scope="row">
                  {source}
                </TableCell>
                {components.map((target, colIndex) => {
                  const connection = connectivityMatrix[source][target];

                  // Si source = target ou pas de connexion, afficher une cellule vide
                  if (!connection) {
                    return (
                      <TableCell key={colIndex} align="center">
                        -
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={colIndex} align="center">
                      <MUITooltip
                        title={
                          <>
                            <Typography variant="body2">
                              {`${source} → ${target}`}
                            </Typography>
                            <Typography variant="body2">
                              {`Statut: ${connection.status}`}
                            </Typography>
                            {connection.status === "Connected" && (
                              <Typography variant="body2">
                                {`Latence: ${connection.latency} ms`}
                              </Typography>
                            )}
                          </>
                        }
                      >
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          {getStatusIcon(connection.status, connection.latency)}
                          {connection.status === "Connected" && (
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              {connection.latency}ms
                            </Typography>
                          )}
                        </Box>
                      </MUITooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", gap: 3, justifyContent: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CheckCircleIcon sx={{ color: green[500], mr: 0.5 }} />
          <Typography variant="body2">Connecté (&lt; 100ms)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon sx={{ color: orange[500], mr: 0.5 }} />
          <Typography variant="body2">Lent (100-300ms)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon sx={{ color: red[300], mr: 0.5 }} />
          <Typography variant="body2">Très lent (&gt; 300ms)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ErrorIcon sx={{ color: red[500], mr: 0.5 }} />
          <Typography variant="body2">Déconnecté</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ConnectivityChart;

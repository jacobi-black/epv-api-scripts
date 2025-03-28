import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Collapse,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { parseCSV, getStats } from "../../utils/csvParser";
import { useData } from "../../utils/DataContext";

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);

  // Vérifier que les fonctions de mise à jour sont disponibles
  const dataContext = useData();
  if (!dataContext) {
    console.error("DataContext is not available");
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur: Le contexte de données n'est pas disponible.
        </Alert>
      </Box>
    );
  }

  const { setAccountsData, setSafesData, setSystemHealthData } = dataContext;

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".csv"));

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setMessage({
        type: "success",
        text: `${validFiles.length} fichier(s) CSV sélectionné(s) avec succès.`,
      });
    } else {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner des fichiers CSV valides.",
      });
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    const results = {
      accounts: 0,
      safes: 0,
      systemHealth: 0,
      errors: [],
      processedFiles: [],
    };

    try {
      for (const file of selectedFiles) {
        try {
          console.log(`Traitement du fichier: ${file.name}`);
          const data = await parseCSV(file);
          const stats = getStats(data);
          console.log(`Données parsées:`, stats);

          if (file.name.includes("accounts")) {
            console.log("Mise à jour des données de comptes");
            setAccountsData(data);
            results.accounts += stats.total;
            results.processedFiles.push({
              name: file.name,
              type: "comptes",
              count: stats.total,
              status: "success",
            });
          } else if (file.name.includes("safes")) {
            console.log("Mise à jour des données de coffres");
            setSafesData(data);
            results.safes += stats.total;
            results.processedFiles.push({
              name: file.name,
              type: "coffres",
              count: stats.total,
              status: "success",
            });
          } else if (file.name.includes("system-health")) {
            console.log("Mise à jour des données système");
            setSystemHealthData(data);
            results.systemHealth += stats.total;
            results.processedFiles.push({
              name: file.name,
              type: "système",
              count: stats.total,
              status: "success",
            });
          } else {
            const error = `Type de fichier non reconnu: ${file.name}`;
            console.error(error);
            results.errors.push(error);
            results.processedFiles.push({
              name: file.name,
              type: "inconnu",
              count: 0,
              status: "error",
              error,
            });
          }
        } catch (error) {
          console.error(`Erreur lors du traitement de ${file.name}:`, error);
          const errorMessage = `Erreur lors du traitement de ${file.name}: ${error.message}`;
          results.errors.push(errorMessage);
          results.processedFiles.push({
            name: file.name,
            type: "erreur",
            count: 0,
            status: "error",
            error: errorMessage,
          });
        }
      }

      // Mettre à jour les fichiers traités dans l'état
      setProcessedFiles(results.processedFiles);

      // Afficher le résumé
      const successMessage = [
        results.accounts > 0 && `${results.accounts} comptes`,
        results.safes > 0 && `${results.safes} coffres`,
        results.systemHealth > 0 &&
          `${results.systemHealth} composants système`,
      ]
        .filter(Boolean)
        .join(", ");

      if (successMessage) {
        setMessage({
          type: "success",
          text: `Import réussi: ${successMessage}.`,
        });
      }

      if (results.errors.length > 0) {
        setMessage((prev) => ({
          type: "warning",
          text: `${prev.text} ${results.errors.length} erreur(s) rencontrée(s).`,
        }));
      }

      // Vider la liste des fichiers après un import réussi
      setSelectedFiles([]);
    } catch (error) {
      console.error("Erreur générale:", error);
      setMessage({
        type: "error",
        text: `Erreur lors du traitement des fichiers: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Data
      </Typography>

      <Paper sx={{ p: 3, textAlign: "center" }}>
        <input
          accept=".csv"
          style={{ display: "none" }}
          id="csv-file"
          type="file"
          multiple
          onChange={handleFileSelect}
        />
        <label htmlFor="csv-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Sélectionner des fichiers CSV
          </Button>
        </label>

        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fichiers sélectionnés ({selectedFiles.length})
            </Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveFile(index)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Box
              sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "center" }}
            >
              <Chip
                label={`${
                  selectedFiles.filter((f) => f.name.includes("accounts"))
                    .length
                } comptes`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${
                  selectedFiles.filter((f) => f.name.includes("safes")).length
                } coffres`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${
                  selectedFiles.filter((f) => f.name.includes("system-health"))
                    .length
                } système`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Traiter les fichiers"
              )}
            </Button>
          </Box>
        )}

        {message && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={message.type}>{message.text}</Alert>
            {message.type === "warning" && (
              <>
                <Button
                  startIcon={
                    showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  onClick={() => setShowErrors(!showErrors)}
                  sx={{ mt: 1 }}
                >
                  {showErrors ? "Masquer les détails" : "Voir les détails"}
                </Button>
                <Collapse in={showErrors}>
                  <List sx={{ mt: 1 }}>
                    {processedFiles
                      .filter((file) => file.status === "error")
                      .map((file, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={file.name}
                            secondary={file.error}
                            sx={{ color: "error.main" }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FileUpload;

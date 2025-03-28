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
import { useNavigate } from "react-router-dom";

const FileUpload = () => {
  const navigate = useNavigate();
  const dataContext = useData();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [processedFiles, setProcessedFiles] = useState({
    success: [],
    errors: [],
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.type === "text/csv");

    if (validFiles.length === 0) {
      setError("Veuillez sélectionner uniquement des fichiers CSV valides.");
      return;
    }

    setSelectedFiles(validFiles);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Veuillez sélectionner au moins un fichier.");
      return;
    }

    setLoading(true);
    setError(null);
    dataContext.resetAllData(); // Réinitialiser toutes les données avant l'import

    const results = {
      success: [],
      errors: [],
    };

    for (const file of selectedFiles) {
      try {
        const data = await parseCSV(file);
        const stats = getStats(data);

        if (file.name.toLowerCase().includes("accounts")) {
          dataContext.setAccountsData(data);
          dataContext.setAccountsStats(stats);
          results.success.push(
            `Comptes importés avec succès (${data.length} entrées)`
          );
        } else if (file.name.toLowerCase().includes("safes")) {
          dataContext.setSafesData(data);
          dataContext.setSafesStats(stats);
          results.success.push(
            `Safes importés avec succès (${data.length} entrées)`
          );
        } else if (file.name.toLowerCase().includes("system-health")) {
          dataContext.setSystemHealthData(data);
          dataContext.setSystemHealthStats(stats);
          results.success.push(
            `Données système importées avec succès (${data.length} entrées)`
          );
        } else {
          results.errors.push(`Type de fichier non reconnu: ${file.name}`);
        }
      } catch (err) {
        console.error("Erreur lors du traitement du fichier:", err);
        results.errors.push(
          `Erreur lors du traitement de ${file.name}: ${err.message}`
        );
      }
    }

    setProcessedFiles(results);
    setLoading(false);

    if (results.success.length > 0) {
      navigate("/dashboard");
    }
  };

  const getFileTypeCount = (type) => {
    return selectedFiles.filter((file) => file.name.includes(type)).length;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Import de Données
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <input
          accept=".csv"
          style={{ display: "none" }}
          id="file-upload"
          multiple
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span" disabled={loading}>
            Sélectionner des fichiers CSV
          </Button>
        </label>

        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Fichiers sélectionnés:
            </Typography>
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Chip
                label={`Comptes: ${getFileTypeCount("accounts")}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Safes: ${getFileTypeCount("safes")}`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={`Système: ${getFileTypeCount("system-health")}`}
                color="info"
                variant="outlined"
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading || selectedFiles.length === 0}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Traitement en cours...
                </>
              ) : (
                "Importer les données"
              )}
            </Button>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {processedFiles.errors.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Button
            startIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowErrors(!showErrors)}
            sx={{ mb: 1 }}
          >
            {showErrors ? "Masquer les erreurs" : "Afficher les erreurs"}
          </Button>
          <Collapse in={showErrors}>
            <List>
              {processedFiles.errors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}

      {processedFiles.success.length > 0 && (
        <Alert severity="success">{processedFiles.success.join(", ")}</Alert>
      )}
    </Box>
  );
};

export default FileUpload;

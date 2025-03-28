import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { parseCSV } from "../../utils/csvParser";
import { useData } from "../../utils/DataContext";

// Configuration des dashboards et leurs scripts requis
const dashboardConfig = {
  capacity: {
    title: "Capacity Dashboard",
    color: "#1976d2",
    scripts: [
      { name: "System-Health.ps1", type: "system", required: true },
      { name: "Get-Safes.ps1", type: "safes", required: true },
    ],
  },
  health: {
    title: "Health Dashboard",
    color: "#2e7d32",
    scripts: [
      { name: "System-Health.ps1", type: "system", required: true },
      { name: "Test-HTML5Gateway.ps1", type: "certificates", required: true },
    ],
  },
  security: {
    title: "Security & Compliance Dashboard",
    color: "#d32f2f",
    scripts: [
      { name: "Get-AccoutnsRiskReport.ps1", type: "risk", required: true },
      { name: "Accounts_Inventory.ps1", type: "accounts", required: true },
      { name: "Safe_Inventory.ps1", type: "safes", required: false },
    ],
  },
  "privileged-accounts": {
    title: "Privileged Accounts Usage Dashboard",
    color: "#7b1fa2",
    scripts: [
      { name: "Get-Account.ps1", type: "accounts", required: true },
      { name: "Get-UsersActivityReport.ps1", type: "users", required: true },
    ],
  },
  sessions: {
    title: "Session Monitoring Dashboard",
    color: "#ff9800",
    scripts: [
      { name: "PSM-SessionsManagement.ps1", type: "sessions", required: true },
      { name: "Get-AdHocAccess.ps1", type: "access", required: false },
      { name: "Get-AccoutnsRiskReport.ps1", type: "risk", required: true },
    ],
  },
  "password-rotation": {
    title: "Password Rotation Dashboard",
    color: "#0097a7",
    scripts: [
      { name: "Get-Safes.ps1", type: "safes", required: true },
      { name: "Get-PendingAccounts.ps1", type: "pending", required: true },
      { name: "Accounts_Inventory.ps1", type: "accounts", required: true },
    ],
  },
  "application-usage": {
    title: "Applications & API Usage Dashboard",
    color: "#5d4037",
    scripts: [
      { name: "Get-Applications.ps1", type: "applications", required: true },
      { name: "Get-CCPPerformance.ps1", type: "performance", required: true },
    ],
  },
  "incident-response": {
    title: "Incident Response Dashboard",
    color: "#e91e63",
    scripts: [
      { name: "Get-AccoutnsRiskReport.ps1", type: "risk", required: true },
      { name: "System-Health.ps1", type: "system", required: true },
    ],
  },
  "adoption-efficiency": {
    title: "Adoption & Efficiency Dashboard",
    color: "#009688",
    scripts: [
      { name: "Get-UsersActivityReport.ps1", type: "users", required: true },
      { name: "Accounts_Usage.ps1", type: "usage", required: true },
    ],
  },
};

const FileUpload = () => {
  const { dashboardType } = useParams();
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
  const [activeStep, setActiveStep] = useState(0);

  // Récupérer la configuration du dashboard sélectionné
  const dashboardInfo = dashboardConfig[dashboardType] || {
    title: "Unknown Dashboard",
    color: "#777",
    scripts: [],
  };

  useEffect(() => {
    // Réinitialiser l'état lors du changement de type de dashboard
    setSelectedFiles([]);
    setError(null);
    setProcessedFiles({ success: [], errors: [] });
    setActiveStep(0);
  }, [dashboardType]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv")
    );

    if (validFiles.length === 0) {
      setError("Veuillez sélectionner uniquement des fichiers CSV valides.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
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

        // Déterminer le type de données en fonction du nom du fichier
        let dataType = "unknown";
        let dataStored = false;

        // Vérifier par correspondance avec les scripts requis
        for (const script of dashboardInfo.scripts) {
          if (
            file.name.toLowerCase().includes(script.name.toLowerCase()) ||
            file.name.toLowerCase().includes(script.type.toLowerCase())
          ) {
            dataType = script.type;

            // Stocker selon le type
            switch (dataType) {
              case "accounts":
                dataContext.setAccountsData(data);
                results.success.push(
                  `Comptes importés avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "safes":
                dataContext.setSafesData(data);
                results.success.push(
                  `Coffres importés avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "system":
                dataContext.setSystemHealthData(data);
                results.success.push(
                  `Données système importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              default:
                // Pour les autres types, les stocker dans des données génériques
                dataContext[
                  `set${
                    script.type.charAt(0).toUpperCase() + script.type.slice(1)
                  }Data`
                ] = data;
                results.success.push(
                  `Données ${script.type} importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
            }
            break;
          }
        }

        // Si le type n'a pas été identifié par les scripts requis, essayer des matchs génériques
        if (!dataStored) {
          if (file.name.toLowerCase().includes("account")) {
            dataContext.setAccountsData(data);
            results.success.push(
              `Comptes importés avec succès (${data.length} entrées)`
            );
          } else if (file.name.toLowerCase().includes("safe")) {
            dataContext.setSafesData(data);
            results.success.push(
              `Coffres importés avec succès (${data.length} entrées)`
            );
          } else if (
            file.name.toLowerCase().includes("system") ||
            file.name.toLowerCase().includes("health")
          ) {
            dataContext.setSystemHealthData(data);
            results.success.push(
              `Données système importées avec succès (${data.length} entrées)`
            );
          } else {
            results.errors.push(`Type de fichier non reconnu: ${file.name}`);
          }
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
      setActiveStep(2); // Passer à l'étape de confirmation
    }
  };

  const navigateToDashboard = () => {
    navigate(`/${dashboardType}`);
  };

  const navigateBack = () => {
    navigate("/");
  };

  const getFileTypeCount = (type) => {
    return selectedFiles.filter((file) =>
      file.name.toLowerCase().includes(type.toLowerCase())
    ).length;
  };

  const isRequiredScriptMissing = () => {
    const requiredScripts = dashboardInfo.scripts.filter(
      (script) => script.required
    );

    return requiredScripts.some((script) => {
      return !selectedFiles.some(
        (file) =>
          file.name.toLowerCase().includes(script.name.toLowerCase()) ||
          file.name.toLowerCase().includes(script.type.toLowerCase())
      );
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Scripts requis pour ce dashboard
            </Typography>
            <Box sx={{ my: 2 }}>
              {dashboardInfo.scripts.map((script, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    borderLeft: `4px solid ${
                      script.required ? dashboardInfo.color : "#aaa"
                    }`,
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {script.name}
                      {script.required && (
                        <Chip
                          label="Requis"
                          size="small"
                          color="primary"
                          sx={{ ml: 1, fontSize: "0.7rem" }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type de données: {script.type}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              sx={{ mt: 2 }}
            >
              Continuer
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Sélectionnez les fichiers générés par les scripts requis
            </Typography>
            <input
              accept=".csv"
              style={{ display: "none" }}
              id="file-upload"
              multiple
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                disabled={loading}
                startIcon={<CloudUploadIcon />}
              >
                Sélectionner des fichiers CSV
              </Button>
            </label>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 3 }}>
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

                {isRequiredScriptMissing() && (
                  <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                    Attention: Certains scripts requis semblent manquants.
                    Vérifiez que vous avez bien sélectionné tous les fichiers
                    nécessaires.
                  </Alert>
                )}

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
                    "Traiter les fichiers"
                  )}
                </Button>
              </Box>
            )}
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Importation terminée
            </Typography>

            {processedFiles.success.length > 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {processedFiles.success.join(", ")}
              </Alert>
            )}

            {processedFiles.errors.length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Button
                  startIcon={
                    showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
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

            <Button
              variant="contained"
              color="primary"
              onClick={navigateToDashboard}
              sx={{ mt: 2 }}
            >
              Accéder au dashboard
            </Button>
          </>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={navigateBack}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1">
          {dashboardInfo.title}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Instructions</StepLabel>
        </Step>
        <Step>
          <StepLabel>Upload des fichiers</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirmation</StepLabel>
        </Step>
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>{getStepContent(activeStep)}</Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;

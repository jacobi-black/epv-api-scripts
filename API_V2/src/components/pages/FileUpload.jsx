import React, { useState, useEffect, useRef } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { parseCSV } from "../../utils/csvParser";
import { useData } from "../../utils/DataContext";
import Papa from "papaparse";

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

// Étape 3: Aperçu et Confirmation
const ReviewStep = ({ fileData, setActiveStep, handleUpload, fileName }) => {
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (fileData) {
      Papa.parse(fileData, {
        header: true,
        preview: 5,
        complete: (results) => {
          setPreview(results.data);
        },
      });
    }
  }, [fileData]);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Aperçu du fichier {fileName}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Voici un aperçu des 5 premières lignes du fichier. Vérifiez que le
        format est correct avant de procéder à l'importation.
      </Typography>

      {preview.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(preview[0]).map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(1)}
              startIcon={<DriveFileRenameOutlineIcon />}
            >
              Changer de fichier
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              startIcon={<CloudUploadIcon />}
            >
              Importer les données
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="error">
          Impossible de prévisualiser le fichier. Vérifiez que le format est
          correct.
        </Typography>
      )}
    </Box>
  );
};

// Fonction pour charger les données de démo
const loadDemoData = async (dataType, importCSV) => {
  try {
    const response = await fetch(`/src/mockData/demo/${dataType}.csv`);
    if (!response.ok) {
      throw new Error(
        `Erreur lors du chargement des données de démo: ${response.statusText}`
      );
    }

    const csvText = await response.text();
    const file = new File([csvText], `${dataType}.csv`, { type: "text/csv" });

    return importCSV(file, dataType);
  } catch (error) {
    console.error("Erreur lors du chargement des données de démo:", error);
    return {
      success: false,
      message: `Erreur: ${error.message}`,
    };
  }
};

// Nouveau composant pour l'upload direct de chaque script
const ScriptUploadItem = ({
  script,
  onFileUpload,
  loadDemoData,
  processedFiles,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const dataContext = useData(); // Accéder directement au contexte de données

  // Vérifier si ce script a déjà été traité avec succès
  const isProcessed = processedFiles.success.some(
    (file) => file.type === script.type
  );

  // Vérifier directement les données pour ce type dans le contexte
  const hasData = (() => {
    switch (script.type) {
      case "system":
        return (
          dataContext.systemHealthData &&
          dataContext.systemHealthData.length > 0
        );
      case "safes":
        return dataContext.safesData && dataContext.safesData.length > 0;
      case "accounts":
        return dataContext.accountsData && dataContext.accountsData.length > 0;
      case "users":
        return dataContext.usersData && dataContext.usersData.length > 0;
      case "certificates":
        return (
          dataContext.certificatesData &&
          dataContext.certificatesData.length > 0
        );
      default:
        return false;
    }
  })();

  // Gérer l'upload du fichier
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      console.log(
        `Tentative d'importation du fichier ${file.name} comme type ${script.type}`
      );
      const result = await onFileUpload(file, script.type);
      console.log(`Résultat de l'importation:`, result);
      setUploadStatus({
        success: result.success,
        message: result.message,
      });

      // Notifier le parent que l'upload a réussi
      if (result.success) {
        console.log(`Notification de succès pour le type ${script.type}`);
        onUploadSuccess(script.type);

        // Vérifier que les données sont bien dans le contexte
        setTimeout(() => {
          console.log(
            `Vérification des données après importation pour ${script.type}:`
          );
          switch (script.type) {
            case "system":
              console.log(
                `systemHealthData: ${
                  dataContext.systemHealthData?.length || 0
                } éléments`
              );
              break;
            case "safes":
              console.log(
                `safesData: ${dataContext.safesData?.length || 0} éléments`
              );
              break;
            case "accounts":
              console.log(
                `accountsData: ${
                  dataContext.accountsData?.length || 0
                } éléments`
              );
              break;
            case "users":
              console.log(
                `usersData: ${dataContext.usersData?.length || 0} éléments`
              );
              break;
            case "certificates":
              console.log(
                `certificatesData: ${
                  dataContext.certificatesData?.length || 0
                } éléments`
              );
              break;
          }
        }, 200); // Attendre un peu que le state soit mis à jour
      }
    } catch (error) {
      console.error(`Erreur d'importation pour ${script.type}:`, error);
      setUploadStatus({
        success: false,
        message: `Erreur: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderLeft:
          isProcessed || hasData
            ? "4px solid #4caf50"
            : script.required
            ? "4px solid #ff9800"
            : "4px solid #2196f3",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="subtitle1">
            {script.name}
            {script.required ? (
              <Chip
                size="small"
                label="Requis"
                color="warning"
                sx={{ ml: 1 }}
              />
            ) : (
              <Chip
                size="small"
                label="Optionnel"
                color="info"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type de données: {script.type}
            {hasData && " (Données présentes)"}
          </Typography>
        </Box>

        <Box>
          {isProcessed || hasData ? (
            <Chip
              icon={<CloudUploadIcon />}
              label="Importé"
              color="success"
              variant="outlined"
            />
          ) : (
            <>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <Button
                variant="outlined"
                component="span"
                onClick={() => fileInputRef.current.click()}
                startIcon={<CloudUploadIcon />}
                disabled={isUploading}
              >
                {isUploading ? "Importation..." : "Importer"}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {uploadStatus && (
        <Alert
          severity={uploadStatus.success ? "success" : "error"}
          sx={{ mt: 1 }}
        >
          {uploadStatus.message}
        </Alert>
      )}
    </Paper>
  );
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
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

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
    setFileName("");
    setFileData(null);
    setSelectedDataType("");
    setUploadStatus(null);
    setIsLoadingDemo(false);
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

    if (dataContext.resetAllData) {
      dataContext.resetAllData();
    } else {
      console.warn("resetAllData n'est pas disponible dans le contexte");
      dataContext.clearAllData();
    }

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
              case "users":
                dataContext.setUsersData(data);
                results.success.push(
                  `Données utilisateurs importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "sessions":
                dataContext.setSessionsData(data);
                results.success.push(
                  `Données de sessions importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "certificates":
                dataContext.setCertificatesData(data);
                results.success.push(
                  `Données de certificats importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "risk":
                dataContext.setRiskData(data);
                results.success.push(
                  `Données de risque importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "pending":
                dataContext.setPendingData(data);
                results.success.push(
                  `Données de comptes en attente importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "applications":
                dataContext.setApplicationsData(data);
                results.success.push(
                  `Données d'applications importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "performance":
                dataContext.setPerformanceData(data);
                results.success.push(
                  `Données de performance importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "access":
                dataContext.setAccessData(data);
                results.success.push(
                  `Données d'accès importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              case "usage":
                dataContext.setUsageData(data);
                results.success.push(
                  `Données d'utilisation importées avec succès (${data.length} entrées)`
                );
                dataStored = true;
                break;
              default:
                results.errors.push(`Type de données inconnu: ${dataType}`);
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
    console.log("Navigation vers le dashboard:", dashboardType);

    console.log("État des données avant navigation:");
    console.log("safesData:", dataContext.safesData?.length || 0, "éléments");
    console.log(
      "systemHealthData:",
      dataContext.systemHealthData?.length || 0,
      "éléments"
    );
    console.log(
      "hasDashboardData:",
      dataContext.hasDashboardData(dashboardType)
    );

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

  // Appelé quand un fichier est importé avec succès
  const handleUploadSuccess = (scriptType) => {
    // Ajouter cette donnée au processedFiles si elle n'existe pas déjà
    setProcessedFiles((prev) => {
      // Vérifier si ce type de script existe déjà dans les succès
      if (!prev.success.some((file) => file.type === scriptType)) {
        return {
          ...prev,
          success: [...prev.success, { type: scriptType }],
        };
      }
      return prev;
    });

    // Incrémenter le compteur
    setUploadedFilesCount((prev) => prev + 1);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          Importation des données pour {dashboardInfo.title}
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        Pour alimenter ce dashboard, vous devez importer les fichiers suivants.
        Cliquez sur le bouton "Importer" pour sélectionner le fichier
        correspondant à chaque script, ou utilisez "Démo" pour charger des
        données de démonstration.
      </Typography>

      <Box sx={{ mb: 3 }}>
        {dashboardInfo.scripts.map((script, index) => (
          <ScriptUploadItem
            key={index}
            script={script}
            onFileUpload={dataContext.importCSV}
            loadDemoData={dataContext.loadDemoData}
            processedFiles={processedFiles}
            onUploadSuccess={handleUploadSuccess}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: 2,
          borderTop: "1px solid #ddd",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {processedFiles.success.length} fichier(s) importé(s) sur{" "}
          {dashboardInfo.scripts.length}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          disabled={
            processedFiles.success.length === 0 ||
            dashboardInfo.scripts
              .filter((s) => s.required)
              .some(
                (requiredScript) =>
                  !processedFiles.success.some(
                    (f) => f.type === requiredScript.type
                  )
              )
          }
          onClick={navigateToDashboard}
        >
          Voir le dashboard
        </Button>
      </Box>

      {processedFiles.errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle1"
            color="error"
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => setShowErrors(!showErrors)}
          >
            {showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            {processedFiles.errors.length} erreur(s) d'importation
          </Typography>
          <Collapse in={showErrors}>
            <List>
              {processedFiles.errors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={error.file}
                    secondary={error.message}
                    primaryTypographyProps={{ color: "error" }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;

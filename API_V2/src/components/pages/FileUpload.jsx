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
  Grid,
  TextField,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
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
    color: "#2196f3",
    scripts: [{ name: "System-Health.ps1", type: "system", required: true }],
  },
  security: {
    title: "Security & Compliance Dashboard",
    color: "#d32f2f",
    scripts: [
      { name: "Get-AccountReport.ps1", type: "risk", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "Safe-Management.ps1", type: "safes", required: false },
    ],
  },
  "privileged-accounts": {
    title: "Privileged Accounts Usage Dashboard",
    color: "#7b1fa2",
    scripts: [
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "Get-UsersActivityReport.ps1", type: "users", required: true },
      { name: "Invoke-BulkAccountActions.ps1", type: "usage", required: false },
    ],
  },
  sessions: {
    title: "Session Monitoring Dashboard",
    color: "#ff9800",
    scripts: [
      { name: "PSM-SessionsManagement.ps1", type: "sessions", required: true },
      { name: "Get-AccountReport.ps1", type: "risk", required: false },
    ],
  },
  "password-rotation": {
    title: "Password Rotation Dashboard",
    color: "#0097a7",
    scripts: [
      { name: "Get-Safes.ps1", type: "safes", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "Invoke-BulkAccountActions.ps1", type: "usage", required: true },
    ],
  },
  "application-usage": {
    title: "Applications & API Usage Dashboard",
    color: "#5d4037",
    scripts: [
      { name: "Get-Applications.ps1", type: "applications", required: true },
      { name: "Get-CCPPerformance.ps1", type: "performance", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: false },
    ],
  },
  "incident-response": {
    title: "Incident Response Dashboard",
    color: "#e91e63",
    scripts: [
      { name: "Get-AccountReport.ps1", type: "risk", required: true },
      { name: "System-Health.ps1", type: "system", required: true },
    ],
  },
  "adoption-efficiency": {
    title: "Adoption & Efficiency Dashboard",
    color: "#009688",
    scripts: [
      { name: "Get-UsersActivityReport.ps1", type: "users", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "PSM-SessionsManagement.ps1", type: "sessions", required: false },
    ],
  },
  performance: {
    title: "Performance Dashboard",
    color: "#3f51b5",
    scripts: [
      { name: "System-Health.ps1", type: "system", required: true },
      { name: "PSM-SessionsManagement.ps1", type: "sessions", required: true },
      { name: "Test-HTML5Gateway.ps1", type: "certificates", required: false },
    ],
  },
  executive: {
    title: "Executive Dashboard",
    color: "#607d8b",
    scripts: [
      { name: "System-Health.ps1", type: "system", required: true },
      { name: "Get-AccountReport.ps1", type: "risk", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "Get-UsersActivityReport.ps1", type: "users", required: false },
    ],
  },
  "safes-analysis": {
    title: "Safes Analysis Dashboard",
    color: "#00acc1",
    scripts: [
      { name: "Safe-Management.ps1", type: "safes", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: false },
    ],
  },
  "accounts-analysis": {
    title: "Accounts Analysis Dashboard",
    color: "#ff5722",
    scripts: [
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "Safe-Management.ps1", type: "safes", required: true },
      { name: "Invoke-BulkAccountActions.ps1", type: "usage", required: false },
    ],
  },
  "safes-platforms": {
    title: "Safes & Platforms Dashboard",
    color: "#4CAF50",
    scripts: [
      { name: "Get-Safes.ps1", type: "safes", required: true },
      { name: "Get-Accounts.ps1", type: "accounts", required: true },
      { name: "Get-Platforms.ps1", type: "platforms", required: true },
    ],
  },
};

// Configuration des commandes PowerShell pour chaque script
const powershellCommands = {
  "System-Health.ps1": {
    command:
      "./System-Health.ps1 -ExportPath $OutputFolder -OutputCSV System_Health.csv",
    args: [
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-Safes.ps1": {
    command:
      "./Get-Safes.ps1 -PVWA $PVWA -AuthType $AuthType -ExportPath $OutputFolder -OutputCSV Safes.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Test-HTML5Gateway.ps1": {
    command:
      "./Test-HTML5Certificate.ps1 -Gateway $Gateway -ExportPath $OutputFolder -OutputCSV HTML5_Gateway_Test.csv",
    args: [
      {
        name: "Gateway",
        defaultValue: "https://gateway.cyberark.local",
        description: "URL de la passerelle HTML5",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-AccountReport.ps1": {
    command:
      "./Get-AccountReport.ps1 -PVWAAddress $PVWA -PVWAAuthType $AuthType -ReportPath $OutputFolder/Accounts_Risk.csv -allProps",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Accounts_Inventory.ps1": {
    command:
      "./Accounts_Inventory.ps1 -PVWA $PVWA -AuthType $AuthType -ExportPath $OutputFolder -OutputCSV Accounts_Inventory.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Safe_Inventory.ps1": {
    command:
      "./Safe_Inventory.ps1 -PVWA $PVWA -AuthType $AuthType -ExportPath $OutputFolder -OutputCSV Safe_Inventory.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-Accounts.ps1": {
    command:
      "./Get-Accounts.ps1 -PVWAURL $PVWA -List -Report -AutoNextPage -CSVPath $OutputFolder/Accounts.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-UsersActivityReport.ps1": {
    command:
      "./Get-UsersActivityReport.ps1 -PVWA $PVWA -AuthType $AuthType -Days $Days -ExportPath $OutputFolder -OutputCSV Users_Activity.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "Days",
        defaultValue: "30",
        description: "Nombre de jours d'historique à extraire",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "PSM-SessionsManagement.ps1": {
    command:
      "./PSM-SessionsManagement.ps1 -PVWA $PVWA -AuthType $AuthType -List -ExportPath $OutputFolder -OutputCSV PSM_Sessions.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-PendingAccounts.ps1": {
    command:
      "./Get-PendingAccounts.ps1 -PVWA $PVWA -AuthType $AuthType -ExportPath $OutputFolder -OutputCSV Pending_Accounts.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-Applications.ps1": {
    command:
      "./Get-Applications.ps1 -PVWA $PVWA -AuthType $AuthType -ExportPath $OutputFolder -OutputCSV Applications.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-CCPPerformance.ps1": {
    command:
      "./Get-CCPPerformance.ps1 -CCP $CCP -Days $Days -ExportPath $OutputFolder -OutputCSV CCP_Performance.csv",
    args: [
      {
        name: "CCP",
        defaultValue: "https://ccp.cyberark.local",
        description: "URL du CCP",
      },
      {
        name: "Days",
        defaultValue: "30",
        description: "Nombre de jours d'historique à extraire",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Accounts_Usage.ps1": {
    command:
      "./Accounts_Usage.ps1 -PVWA $PVWA -AuthType $AuthType -Days $Days -ExportPath $OutputFolder -OutputCSV Accounts_Usage.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "Days",
        defaultValue: "30",
        description: "Nombre de jours d'historique à extraire",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Safe-Management.ps1": {
    command:
      "./Safe-Management.ps1 -PVWAURL $PVWA -AuthType $AuthType -Report -OutputPath $OutputFolder/Safes.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Invoke-BulkAccountActions.ps1": {
    command:
      "./Invoke-BulkAccountActions.ps1 -PVWAURL $PVWA -AuthType $AuthType -AccountsAction 'Verify' -OutputCSV $OutputFolder/Accounts_Usage.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
    ],
  },
  "Get-Platforms.ps1": {
    command:
      "./Get-Platforms.ps1 -PVWA $PVWA -AuthType $AuthType -ExportPath $OutputFolder -OutputCSV Platforms.csv",
    args: [
      {
        name: "PVWA",
        defaultValue: "https://pvwa.cyberark.local",
        description: "URL du PVWA",
      },
      {
        name: "AuthType",
        defaultValue: "CyberArk",
        description: "Type d'authentification (CyberArk, LDAP, RADIUS)",
      },
      {
        name: "OutputFolder",
        defaultValue: "C:/Temp",
        description: "Dossier de sortie pour les fichiers CSV",
      },
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
  const [isDemoLoading, setIsDemoLoading] = useState(false);
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
      case "platforms":
        return (
          dataContext.platformsData && dataContext.platformsData.length > 0
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
            case "platforms":
              console.log(
                `platformsData: ${
                  dataContext.platformsData?.length || 0
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

  // Gérer le chargement des données de démo
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    setUploadStatus(null);

    try {
      console.log(`Chargement des données de démo pour ${script.type}`);
      const result = await dataContext.loadDemoData(script.type);
      console.log(`Résultat du chargement de démo:`, result);

      setUploadStatus({
        success: result.success,
        message: result.message,
      });

      if (result.success) {
        onUploadSuccess(script.type);
      }
    } catch (error) {
      console.error(
        `Erreur lors du chargement des données de démo pour ${script.type}:`,
        error
      );
      setUploadStatus({
        success: false,
        message: `Erreur de chargement des données de démo: ${error.message}`,
      });
    } finally {
      setIsDemoLoading(false);
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

        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <Button
            variant={isProcessed || hasData ? "outlined" : "contained"}
            component="span"
            onClick={() => fileInputRef.current.click()}
            startIcon={<CloudUploadIcon />}
            disabled={isUploading || isDemoLoading}
            color={isProcessed || hasData ? "success" : "primary"}
            size="small"
          >
            {isUploading
              ? "Importation..."
              : isProcessed || hasData
              ? "Mettre à jour"
              : "Importer"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLoadDemo}
            disabled={isUploading || isDemoLoading}
            size="small"
          >
            {isDemoLoading ? "Chargement..." : "Utiliser démo"}
          </Button>
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

// Modifier le composant PowerShellCommandHelper pour un meilleur design
const PowerShellCommandHelper = ({
  dashboardInfo,
  processedFiles,
  dataContext,
}) => {
  const [customArgs, setCustomArgs] = useState({});
  const [copiedScript, setCopiedScript] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Configuration initiale des arguments par défaut pour chaque script
  const [scriptArguments, setScriptArguments] = useState({
    "Get-AccountReport.ps1": {
      PVWA: "https://cyberark.example.com",
      AuthType: "LDAP",
      OutputFolder: "./output",
    },
    "Get-Accounts.ps1": {
      PVWA: "https://cyberark.example.com",
      OutputFolder: "./output",
    },
    "Safe-Management.ps1": {
      PVWA: "https://cyberark.example.com",
      OutputFolder: "./output",
    },
    "Invoke-BulkAccountActions.ps1": {
      PVWA: "https://cyberark.example.com",
      AuthType: "LDAP",
      OutputFolder: "./output",
    },
    "System-Health.ps1": {
      OutputFolder: "./output",
    },
    "Test-HTML5Gateway.ps1": {
      Gateway: "https://gateway.example.com",
      OutputFolder: "./output",
    },
  });

  // Fonction pour vérifier si un script a déjà été traité ou si les données sont présentes
  const isScriptProcessed = (script) => {
    // Vérifier si le script a été traité avec succès
    const isUploaded = processedFiles.success.some(
      (file) => file.type === script.type
    );

    // Vérifier directement dans le contexte si les données sont présentes
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
          return (
            dataContext.accountsData && dataContext.accountsData.length > 0
          );
        case "users":
          return dataContext.usersData && dataContext.usersData.length > 0;
        case "certificates":
          return (
            dataContext.certificatesData &&
            dataContext.certificatesData.length > 0
          );
        case "risk":
          return dataContext.riskData && dataContext.riskData.length > 0;
        case "sessions":
          return (
            dataContext.sessionsData && dataContext.sessionsData.length > 0
          );
        case "pending":
          return (
            dataContext.pendingAccountsData &&
            dataContext.pendingAccountsData.length > 0
          );
        case "applications":
          return (
            dataContext.applicationsData &&
            dataContext.applicationsData.length > 0
          );
        case "performance":
          return (
            dataContext.performanceData &&
            dataContext.performanceData.length > 0
          );
        case "usage":
          return dataContext.usageData && dataContext.usageData.length > 0;
        default:
          return false;
      }
    })();

    return isUploaded || hasData;
  };

  // Filtrer pour n'obtenir que les scripts qui n'ont pas encore été traités
  const missingScripts = dashboardInfo.scripts.filter(
    (script) => !isScriptProcessed(script)
  );

  // Mettre à jour la commande avec les arguments personnalisés
  const getFullCommand = (scriptName) => {
    const args = scriptArguments[scriptName] || {};
    const argString = Object.entries(args)
      .filter(([_, value]) => value && value.toString().trim() !== "")
      .map(([key, value]) => `-${key} '${value}'`)
      .join(" ");

    switch (scriptName) {
      case "Get-AccountReport.ps1":
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./Get-AccountReport.ps1 ${argString}`;
      case "Get-Accounts.ps1":
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./Get-Accounts.ps1 ${argString}`;
      case "Safe-Management.ps1":
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./Safe-Management.ps1 ${argString}`;
      case "Invoke-BulkAccountActions.ps1":
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./Invoke-BulkAccountActions.ps1 ${argString}`;
      case "System-Health.ps1":
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./System-Health.ps1 ${argString}`;
      case "Test-HTML5Gateway.ps1":
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./Test-HTML5Gateway.ps1 ${argString}`;
      default:
        return `$env:COLUMNS="$((Get-Host).UI.RawUI.BufferSize.Width)"; ./${scriptName} ${argString}`;
    }
  };

  // Gérer les changements d'arguments personnalisés
  const handleArgChange = (scriptName, argName, value) => {
    setCustomArgs((prev) => ({
      ...prev,
      [scriptName]: {
        ...(prev[scriptName] || {}),
        [argName]: value,
      },
    }));
  };

  // Copier la commande dans le presse-papiers
  const copyToClipboard = (scriptName) => {
    const command = getFullCommand(scriptName);
    navigator.clipboard.writeText(command).then(
      () => {
        // Indiquer visuellement que la commande a été copiée
        setCopiedScript(scriptName);
        setTimeout(() => setCopiedScript(null), 2000);
      },
      (err) => {
        console.error("Erreur lors de la copie : ", err);
      }
    );
  };

  if (missingScripts.length === 0) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        border: "1px solid rgba(0, 0, 0, 0.12)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.primary",
            fontWeight: 500,
          }}
        >
          <CodeIcon sx={{ mr: 2, fontSize: 28 }} />
          Commandes PowerShell pour générer les fichiers manquants
        </Typography>
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label="toggle commands visibility"
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          Exécutez ces commandes sur votre serveur CyberArk pour générer les
          fichiers CSV nécessaires au dashboard.
          {missingScripts.some((s) => s.required) && (
            <Box
              component="span"
              sx={{ fontWeight: "bold", color: "warning.main" }}
            >
              {" "}
              Attention : certains fichiers requis sont manquants.
            </Box>
          )}
        </Typography>

        <Box sx={{ mb: 3 }}>
          {missingScripts.map((script) => (
            <Paper
              key={script.name}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                borderLeft: `6px solid ${
                  script.required ? "#ff9800" : "#2196f3"
                }`,
                backgroundColor: "background.paper",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {script.name}
                  {script.required ? (
                    <Chip
                      size="small"
                      label="Requis"
                      color="warning"
                      sx={{ ml: 1, height: 24 }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Optionnel"
                      color="primary"
                      sx={{ ml: 1, height: 24 }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {script.type}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                Personnaliser les paramètres:
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                {powershellCommands[script.name]?.args.map((arg) => (
                  <Grid item xs={12} sm={6} md={4} key={arg.name}>
                    <TextField
                      fullWidth
                      label={arg.name}
                      variant="outlined"
                      size="small"
                      defaultValue={arg.defaultValue}
                      helperText={arg.description}
                      onChange={(e) =>
                        handleArgChange(script.name, arg.name, e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <Box
                            component="span"
                            sx={{ color: "text.secondary", mr: 0.5 }}
                          >
                            $
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: "#f5f5f5",
                  position: "relative",
                  border: "1px solid #e0e0e0",
                  fontFamily: "monospace",
                }}
              >
                <pre
                  style={{ margin: 0, overflowX: "auto", fontSize: "0.9rem" }}
                >
                  {getFullCommand(script.name)}
                </pre>
                <Button
                  variant="contained"
                  size="small"
                  color={copiedScript === script.name ? "success" : "primary"}
                  onClick={() => copyToClipboard(script.name)}
                  endIcon={
                    copiedScript === script.name ? (
                      <CheckIcon />
                    ) : (
                      <ContentCopyIcon />
                    )
                  }
                  sx={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    textTransform: "none",
                  }}
                >
                  {copiedScript === script.name ? "Copié!" : "Copier"}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

// Modifier le composant FileUpload pour supprimer les contrôles d'import manuel
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
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Récupérer la configuration du dashboard sélectionné
  const dashboardInfo = dashboardConfig[dashboardType] || {
    title: "Unknown Dashboard",
    color: "#777",
    scripts: [],
  };

  // Fonction pour vérifier si les données requises sont disponibles dans le contexte
  const hasRequiredData = (scriptType) => {
    switch (scriptType) {
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
      case "risk":
        return dataContext.riskData && dataContext.riskData.length > 0;
      case "sessions":
        return dataContext.sessionsData && dataContext.sessionsData.length > 0;
      case "pending":
        return (
          dataContext.pendingAccountsData &&
          dataContext.pendingAccountsData.length > 0
        );
      case "applications":
        return (
          dataContext.applicationsData &&
          dataContext.applicationsData.length > 0
        );
      case "performance":
        return (
          dataContext.performanceData && dataContext.performanceData.length > 0
        );
      case "usage":
        return dataContext.usageData && dataContext.usageData.length > 0;
      case "access":
        return dataContext.accessData && dataContext.accessData.length > 0;
      default:
        return false;
    }
  };

  useEffect(() => {
    // Réinitialiser l'état lors du changement de type de dashboard
    setSelectedFiles([]);
    setError(null);
    setProcessedFiles({ success: [], errors: [] });
    setUploadStatus(null);
    setIsLoadingDemo(false);
  }, [dashboardType]);

  // Fonction pour gérer le succès de l'upload d'un fichier
  const handleUploadSuccess = (scriptType) => {
    console.log(`Upload réussi pour le type ${scriptType}`);

    // Ajouter le type de script aux fichiers traités
    setProcessedFiles((prev) => ({
      ...prev,
      success: [
        ...prev.success,
        { type: scriptType, timestamp: new Date().toISOString() },
      ],
    }));

    // Vérifier si nous avons toutes les données requises pour ce dashboard
    const allRequiredFilesProcessed = dashboardConfig[dashboardType].scripts
      .filter((script) => script.required)
      .every(
        (script) =>
          processedFiles.success.some((file) => file.type === script.type) ||
          script.type === scriptType
      );

    console.log("Tous les fichiers requis traités:", allRequiredFilesProcessed);
    console.log("Fichiers traités:", [
      ...processedFiles.success,
      { type: scriptType, timestamp: new Date().toISOString() },
    ]);

    if (allRequiredFilesProcessed) {
      setUploadComplete(true);

      // Afficher un message de succès mais ne pas rediriger automatiquement
      setUploadStatus({
        success: true,
        message:
          "Tous les fichiers requis ont été importés avec succès. Vous pouvez maintenant accéder au dashboard.",
      });

      // La redirection automatique a été supprimée
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mr: 2 }}
        >
          Accueil
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{ flexGrow: 1, fontWeight: 500 }}
        >
          Import de données pour {dashboardInfo.title}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {uploadStatus && (
        <Alert
          severity={uploadStatus.success ? "success" : "error"}
          sx={{ mb: 3 }}
        >
          {uploadStatus.message}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}
        >
          <CloudUploadIcon sx={{ mr: 2 }} />
          Fichiers requis pour ce dashboard
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Importez les fichiers CSV générés par les scripts PowerShell pour
          alimenter ce dashboard.
        </Typography>

        <Box sx={{ mt: 3 }}>
          {dashboardInfo.scripts.map((script) => (
            <ScriptUploadItem
              key={script.type}
              script={script}
              onFileUpload={dataContext.importCSV}
              loadDemoData={dataContext.loadDemoData}
              processedFiles={processedFiles}
              onUploadSuccess={handleUploadSuccess}
            />
          ))}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/${dashboardType}`)}
            disabled={
              !dashboardInfo.scripts
                .filter((s) => s.required)
                .every(
                  (script) =>
                    processedFiles.success.some(
                      (file) => file.type === script.type
                    ) || hasRequiredData(script.type)
                )
            }
            startIcon={<PlayCircleFilledIcon />}
            size="large"
          >
            Accéder au dashboard
          </Button>
        </Box>
      </Paper>

      {/* Afficher les commandes PowerShell pour les scripts manquants */}
      <PowerShellCommandHelper
        dashboardInfo={dashboardInfo}
        processedFiles={processedFiles}
        dataContext={dataContext}
      />
    </Box>
  );
};

export default FileUpload;

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Divider,
} from "@mui/material";
import {
  useNavigate,
  Outlet,
  useParams,
  useLocation,
  Link as RouterLink,
} from "react-router-dom";
import { useData } from "../../utils/DataContext";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DataStatusIndicator from "../common/DataStatusIndicator";

// Configuration des onglets pour chaque type de dashboard
const dashboardTabs = {
  capacity: [
    { label: "Vue d'ensemble", path: "" },
    { label: "Performance Système", path: "/system" },
    { label: "Stockage & Coffres", path: "/safes" },
  ],
  security: [
    { label: "Vue d'ensemble", path: "" },
    { label: "Conformité Comptes", path: "/accounts" },
    { label: "Violations", path: "/violations" },
    { label: "Risques", path: "/risks" },
  ],
  "privileged-accounts": [
    { label: "Vue d'ensemble", path: "" },
    { label: "Utilisation Générale", path: "/usage" },
    { label: "Analyses Par Équipe", path: "/team" },
    { label: "Tendances d'Usage", path: "/trends" },
  ],
  sessions: [
    { label: "Vue d'ensemble", path: "" },
    { label: "Sessions Actives", path: "/active" },
    { label: "Analyse Comportementale", path: "/anomalies" },
    { label: "Géolocalisation", path: "/geo" },
  ],
  "password-rotation": [
    { label: "Vue d'ensemble", path: "" },
    { label: "Performance des Rotations", path: "/performance" },
    { label: "Comptes Problématiques", path: "/issues" },
    { label: "Coffres et Sauvegardes", path: "/safes" },
  ],
  "application-usage": [
    { label: "Vue d'ensemble", path: "" },
    { label: "Applications Intégrées", path: "/apps" },
    { label: "Performances API", path: "/api" },
    { label: "Tendances d'Utilisation", path: "/trends" },
  ],
  "incident-response": [
    { label: "Vue d'ensemble", path: "" },
    { label: "Incidents Actifs", path: "/active" },
    { label: "Résolution et MTTR", path: "/resolution" },
    { label: "Analyse des Tendances", path: "/trends" },
  ],
  "adoption-efficiency": [
    { label: "Vue d'ensemble", path: "" },
    { label: "Adoption par Département", path: "/departments" },
    { label: "Efficacité Opérationnelle", path: "/operational" },
    { label: "Satisfaction Utilisateurs", path: "/satisfaction" },
  ],
};

// Noms des dashboards
const dashboardNames = {
  capacity: "Capacity Dashboard",
  security: "Security & Compliance Dashboard",
  "privileged-accounts": "Privileged Accounts Usage Dashboard",
  sessions: "Session Monitoring Dashboard",
  "password-rotation": "Password Rotation Dashboard",
  "application-usage": "Applications & API Usage Dashboard",
  "incident-response": "Incident Response Dashboard",
  "adoption-efficiency": "Adoption & Efficiency Dashboard",
};

const Dashboard = ({ title }) => {
  const navigate = useNavigate();
  const { dashboardType } = useParams();
  const location = useLocation();
  const dataContext = useData();

  // Extraire le chemin actuel pour déterminer l'onglet actif
  const currentPath = location.pathname.split(`/${dashboardType}`)[1] || "";

  // Déterminer l'index de l'onglet actif
  const tabs = dashboardTabs[dashboardType] || [];
  const activeTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.path === currentPath)
  );

  // Obtenir le statut des données pour ce dashboard
  const dataStatus = dataContext.getDashboardDataStatus(dashboardType);

  // Vérifier si des données sont disponibles (même partielles)
  const hasAnyData = dataStatus.availableData.length > 0;

  const handleTabChange = (event, newValue) => {
    const targetPath = `/${dashboardType}${tabs[newValue].path}`;
    navigate(targetPath);
  };

  // Si aucune donnée n'est disponible, afficher un message
  if (!hasAnyData) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Aucune donnée disponible pour ce dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Pour visualiser ce dashboard, veuillez importer au moins un des
            fichiers requis.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/upload/${dashboardType}`)}
          >
            Importer des données
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 2 }}>
      {/* Fil d'Ariane */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Accueil
        </Link>
        <Typography color="text.primary">
          {title || dashboardNames[dashboardType]}
        </Typography>
        {activeTabIndex > 0 && (
          <Typography color="text.primary">
            {tabs[activeTabIndex].label}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Titre du dashboard */}
      <Typography variant="h4" component="h1" gutterBottom>
        {title || dashboardNames[dashboardType]}
      </Typography>

      {/* Indicateur de statut des données */}
      <Box sx={{ mb: 3 }}>
        <DataStatusIndicator
          dashboardType={dashboardType}
          requiredData={dataStatus.requiredData}
          availableData={dataStatus.availableData}
          missingData={dataStatus.missingData}
          onUploadClick={() => navigate(`/upload/${dashboardType}`)}
        />
      </Box>

      {/* Onglets de navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTabIndex}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          sx={{ mb: 3 }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Contenu du sous-dashboard */}
      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;

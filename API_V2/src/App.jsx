import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DataProvider, useData } from "./utils/DataContext";

// Layouts
import MainLayout from "./components/layouts/MainLayout";

// Pages
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import FileUpload from "./components/pages/FileUpload";

// Dashboard views
import AccountsAnalysis from "./components/pages/AccountsAnalysis";
import SafesAnalysis from "./components/pages/SafesAnalysis";
import SystemHealth from "./components/pages/SystemHealth";
import CapacityPlanning from "./components/pages/CapacityPlanning";
import SecurityCompliance from "./components/pages/SecurityCompliance";
import PrivilegedAccounts from "./components/pages/PrivilegedAccounts";
import SessionMonitoring from "./components/pages/SessionMonitoring";
import PasswordRotation from "./components/pages/PasswordRotation";
import ApplicationUsage from "./components/pages/ApplicationUsage";
import IncidentResponse from "./components/pages/IncidentResponse";
import AdoptionEfficiency from "./components/pages/AdoptionEfficiency";

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#004e8c",
    },
    secondary: {
      main: "#11cb5f",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
        },
      },
    },
  },
});

// Composant qui vérifie si les données requises sont disponibles
// et redirige vers la page d'upload si nécessaire
const DashboardGuard = ({ element, dashboardType }) => {
  const { hasDashboardData } = useData();
  const navigate = useNavigate();

  // Si les données requises pour ce dashboard ne sont pas disponibles,
  // rediriger vers la page d'upload correspondante
  React.useEffect(() => {
    if (!hasDashboardData(dashboardType)) {
      navigate(`/upload/${dashboardType}`);
    }
  }, [dashboardType, hasDashboardData, navigate]);

  // Retourner le composant normalement si les données sont disponibles
  return element;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <MainLayout>
          <Routes>
            {/* Page d'accueil avec sélection des dashboards */}
            <Route path="/" element={<Home />} />

            {/* Système d'upload des fichiers */}
            <Route path="/upload/:dashboardType" element={<FileUpload />} />

            {/* Dashboard Capacité */}
            <Route
              path="/capacity"
              element={
                <DashboardGuard
                  element={<Dashboard title="Capacity Dashboard" />}
                  dashboardType="capacity"
                />
              }
            >
              <Route index element={<CapacityPlanning />} />
              <Route
                path="system"
                element={<SystemHealth dashboardType="capacity" />}
              />
              <Route
                path="safes"
                element={<SafesAnalysis dashboardType="capacity" />}
              />
            </Route>

            {/* Dashboard Santé */}
            <Route
              path="/health"
              element={
                <DashboardGuard
                  element={<Dashboard title="Health Dashboard" />}
                  dashboardType="health"
                />
              }
            >
              <Route index element={<SystemHealth dashboardType="health" />} />
              <Route
                path="certificates"
                element={<SystemHealth dashboardType="certificates" />}
              />
              <Route
                path="connectivity"
                element={<SystemHealth dashboardType="connectivity" />}
              />
            </Route>

            {/* Dashboard Sécurité et Conformité */}
            <Route
              path="/security"
              element={
                <DashboardGuard
                  element={
                    <Dashboard title="Security and Compliance Dashboard" />
                  }
                  dashboardType="security"
                />
              }
            >
              <Route
                index
                element={<SecurityCompliance dashboardType="security" />}
              />
              <Route
                path="accounts"
                element={<AccountsAnalysis dashboardType="security" />}
              />
              <Route
                path="violations"
                element={<SecurityCompliance dashboardType="violations" />}
              />
              <Route
                path="risks"
                element={<SecurityCompliance dashboardType="risks" />}
              />
            </Route>

            {/* Dashboard Accounts Analysis */}
            <Route
              path="/accounts-analysis"
              element={
                <DashboardGuard
                  element={<Dashboard title="Accounts Analysis Dashboard" />}
                  dashboardType="accounts-analysis"
                />
              }
            >
              <Route
                index
                element={<AccountsAnalysis dashboardType="accounts" />}
              />
            </Route>

            {/* Dashboard Privileged Accounts */}
            <Route
              path="/privileged-accounts"
              element={
                <DashboardGuard
                  element={<Dashboard title="Privileged Accounts Dashboard" />}
                  dashboardType="privileged-accounts"
                />
              }
            >
              <Route
                index
                element={<PrivilegedAccounts dashboardType="overview" />}
              />
              <Route
                path="usage"
                element={<PrivilegedAccounts dashboardType="usage" />}
              />
              <Route
                path="team"
                element={<PrivilegedAccounts dashboardType="team" />}
              />
              <Route
                path="trends"
                element={<PrivilegedAccounts dashboardType="trends" />}
              />
            </Route>

            {/* Dashboard Sessions */}
            <Route
              path="/sessions"
              element={
                <DashboardGuard
                  element={<Dashboard title="Sessions Dashboard" />}
                  dashboardType="sessions"
                />
              }
            >
              <Route
                index
                element={<SessionMonitoring dashboardType="overview" />}
              />
              <Route
                path="active"
                element={<SessionMonitoring dashboardType="active" />}
              />
              <Route
                path="anomalies"
                element={<SessionMonitoring dashboardType="anomalies" />}
              />
              <Route
                path="geo"
                element={<SessionMonitoring dashboardType="geo" />}
              />
            </Route>

            {/* Dashboard Password Rotation */}
            <Route
              path="/password-rotation"
              element={
                <DashboardGuard
                  element={<Dashboard title="Password Rotation Dashboard" />}
                  dashboardType="password-rotation"
                />
              }
            >
              <Route
                index
                element={<PasswordRotation dashboardType="overview" />}
              />
              <Route
                path="performance"
                element={<PasswordRotation dashboardType="performance" />}
              />
              <Route
                path="issues"
                element={<PasswordRotation dashboardType="issues" />}
              />
              <Route
                path="safes"
                element={<PasswordRotation dashboardType="safes" />}
              />
            </Route>

            {/* Dashboard Application Usage */}
            <Route
              path="/application-usage"
              element={
                <DashboardGuard
                  element={<Dashboard title="Application Usage Dashboard" />}
                  dashboardType="application-usage"
                />
              }
            >
              <Route
                index
                element={<ApplicationUsage dashboardType="overview" />}
              />
              <Route
                path="api"
                element={<ApplicationUsage dashboardType="api" />}
              />
              <Route
                path="trends"
                element={<ApplicationUsage dashboardType="trends" />}
              />
            </Route>

            {/* Dashboard Incident Response */}
            <Route
              path="/incident-response"
              element={
                <DashboardGuard
                  element={<Dashboard title="Incident Response Dashboard" />}
                  dashboardType="incident-response"
                />
              }
            >
              <Route
                index
                element={<IncidentResponse dashboardType="overview" />}
              />
              <Route
                path="active"
                element={<IncidentResponse dashboardType="active" />}
              />
              <Route
                path="resolution"
                element={<IncidentResponse dashboardType="resolution" />}
              />
              <Route
                path="trends"
                element={<IncidentResponse dashboardType="trends" />}
              />
            </Route>

            {/* Dashboard Adoption & Efficiency */}
            <Route
              path="/adoption-efficiency"
              element={
                <DashboardGuard
                  element={
                    <Dashboard title="Adoption & Efficiency Dashboard" />
                  }
                  dashboardType="adoption-efficiency"
                />
              }
            >
              <Route
                index
                element={<AdoptionEfficiency dashboardType="overview" />}
              />
              <Route
                path="teams"
                element={<AdoptionEfficiency dashboardType="teams" />}
              />
              <Route
                path="operational"
                element={<AdoptionEfficiency dashboardType="operational" />}
              />
              <Route
                path="satisfaction"
                element={<AdoptionEfficiency dashboardType="satisfaction" />}
              />
            </Route>

            {/* Redirection par défaut vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

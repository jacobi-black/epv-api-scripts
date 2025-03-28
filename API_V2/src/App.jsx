import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DataProvider } from "./utils/DataContext";

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
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#fafafa",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.2rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "1.8rem",
      fontWeight: 500,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
  },
});

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
              element={<Dashboard title="Capacity Dashboard" />}
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
              element={<Dashboard title="Health Dashboard" />}
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
              element={<Dashboard title="Security and Compliance Dashboard" />}
            >
              <Route index element={<SecurityCompliance />} />
              <Route
                path="accounts"
                element={<AccountsAnalysis dashboardType="security" />}
              />
              <Route
                path="violations"
                element={<SecurityCompliance subview="violations" />}
              />
              <Route
                path="risks"
                element={<SecurityCompliance subview="risks" />}
              />
            </Route>

            {/* Dashboard Utilisation des Comptes Privilégiés */}
            <Route
              path="/privileged-accounts"
              element={
                <Dashboard title="Privileged Accounts Usage Dashboard" />
              }
            >
              <Route index element={<PrivilegedAccounts />} />
              <Route
                path="usage"
                element={<PrivilegedAccounts subview="usage" />}
              />
              <Route
                path="team"
                element={<PrivilegedAccounts subview="team" />}
              />
              <Route
                path="trends"
                element={<PrivilegedAccounts subview="trends" />}
              />
            </Route>

            {/* Dashboard Monitoring des Sessions */}
            <Route
              path="/sessions"
              element={<Dashboard title="Session Monitoring Dashboard" />}
            >
              <Route index element={<SessionMonitoring />} />
              <Route
                path="active"
                element={<SessionMonitoring subview="active" />}
              />
              <Route
                path="anomalies"
                element={<SessionMonitoring subview="anomalies" />}
              />
              <Route path="geo" element={<SessionMonitoring subview="geo" />} />
            </Route>

            {/* Dashboard Rotation des Mots de Passe */}
            <Route
              path="/password-rotation"
              element={<Dashboard title="Password Rotation Dashboard" />}
            >
              <Route index element={<PasswordRotation />} />
              <Route
                path="performance"
                element={<PasswordRotation subview="performance" />}
              />
              <Route
                path="issues"
                element={<PasswordRotation subview="issues" />}
              />
              <Route
                path="safes"
                element={<PasswordRotation subview="safes" />}
              />
            </Route>

            {/* Dashboard Utilisation des Applications et API */}
            <Route
              path="/application-usage"
              element={<Dashboard title="Applications & API Usage Dashboard" />}
            >
              <Route index element={<ApplicationUsage />} />
              <Route
                path="apps"
                element={<ApplicationUsage subview="apps" />}
              />
              <Route path="api" element={<ApplicationUsage subview="api" />} />
              <Route
                path="trends"
                element={<ApplicationUsage subview="trends" />}
              />
            </Route>

            {/* Dashboard Réponse aux Incidents */}
            <Route
              path="/incident-response"
              element={<Dashboard title="Incident Response Dashboard" />}
            >
              <Route index element={<IncidentResponse />} />
              <Route
                path="active"
                element={<IncidentResponse subview="active" />}
              />
              <Route
                path="resolution"
                element={<IncidentResponse subview="resolution" />}
              />
              <Route
                path="trends"
                element={<IncidentResponse subview="trends" />}
              />
            </Route>

            {/* Dashboard Efficacité et Adoption */}
            <Route
              path="/adoption-efficiency"
              element={<Dashboard title="Adoption & Efficiency Dashboard" />}
            >
              <Route index element={<AdoptionEfficiency />} />
              <Route
                path="departments"
                element={<AdoptionEfficiency subview="departments" />}
              />
              <Route
                path="operational"
                element={<AdoptionEfficiency subview="operational" />}
              />
              <Route
                path="satisfaction"
                element={<AdoptionEfficiency subview="satisfaction" />}
              />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

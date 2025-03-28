import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { DataProvider } from "./utils/DataContext";
import { ThemeContextProvider } from "./utils/ThemeContext";

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
import ComplianceDashboard from "./components/pages/ComplianceDashboard";
import ExecutiveDashboard from "./components/pages/ExecutiveDashboard";
import PerformanceDashboard from "./components/pages/PerformanceDashboard";
import SafesPlatformsDashboard from "./components/pages/SafesPlatformsDashboard";

function App() {
  return (
    <ThemeContextProvider>
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

            {/* Dashboard Compliance */}
            <Route
              path="/compliance"
              element={<Dashboard title="Regulatory Compliance Dashboard" />}
            >
              <Route index element={<ComplianceDashboard />} />
              <Route
                path="audit"
                element={<ComplianceDashboard subview="audit" />}
              />
              <Route
                path="reports"
                element={<ComplianceDashboard subview="reports" />}
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

            {/* Dashboard Executive */}
            <Route
              path="/executive"
              element={<Dashboard title="Executive Dashboard" />}
            >
              <Route index element={<ExecutiveDashboard />} />
              <Route
                path="strategic"
                element={<ExecutiveDashboard subview="1" />}
              />
              <Route
                path="resources"
                element={<ExecutiveDashboard subview="2" />}
              />
              <Route
                path="planning"
                element={<ExecutiveDashboard subview="3" />}
              />
            </Route>

            {/* Dashboard Performance */}
            <Route
              path="/performance"
              element={<Dashboard title="Performance Dashboard" />}
            >
              <Route index element={<PerformanceDashboard />} />
              <Route
                path="components"
                element={<PerformanceDashboard subview="1" />}
              />
              <Route
                path="analysis"
                element={<PerformanceDashboard subview="2" />}
              />
              <Route
                path="api"
                element={<PerformanceDashboard subview="3" />}
              />
            </Route>

            {/* Dashboard Safes & Platforms */}
            <Route
              path="/safes-platforms"
              element={<Dashboard title="Safes & Platforms Dashboard" />}
            >
              <Route index element={<SafesPlatformsDashboard />} />
              <Route
                path="safes"
                element={<SafesPlatformsDashboard subview="1" />}
              />
              <Route
                path="platforms"
                element={<SafesPlatformsDashboard subview="2" />}
              />
              <Route
                path="trends"
                element={<SafesPlatformsDashboard subview="3" />}
              />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </DataProvider>
    </ThemeContextProvider>
  );
}

export default App;

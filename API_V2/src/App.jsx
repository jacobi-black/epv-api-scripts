import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DataProvider } from "./utils/DataContext";

// Layouts
import MainLayout from "./components/layouts/MainLayout";

// Pages
import Dashboard from "./components/pages/Dashboard";
import AccountsAnalysis from "./components/pages/AccountsAnalysis";
import SafesAnalysis from "./components/pages/SafesAnalysis";
import SystemHealth from "./components/pages/SystemHealth";
import CapacityPlanning from "./components/pages/CapacityPlanning";
import FileUpload from "./components/pages/FileUpload";

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
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="accounts" replace />} />
              <Route path="accounts" element={<AccountsAnalysis />} />
              <Route path="safes" element={<SafesAnalysis />} />
              <Route path="system-health" element={<SystemHealth />} />
            </Route>
          </Routes>
        </MainLayout>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

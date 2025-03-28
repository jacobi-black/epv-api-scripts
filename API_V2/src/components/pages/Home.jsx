import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Container,
  Chip,
  CardMedia,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  HealthAndSafety as HealthIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  MonitorHeart as MonitorIcon,
  Password as PasswordIcon,
  Api as ApiIcon,
  Report as ReportIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

// Définition des dashboards
const dashboards = [
  {
    id: "capacity",
    title: "Capacity Dashboard",
    description:
      "Visualize system capacity metrics including CPU, memory, disk usage, and session capacity.",
    icon: <SpeedIcon sx={{ fontSize: 60 }} />,
    color: "#1976d2",
    scripts: [
      "/System Health/System-Health.ps1",
      "/Safe Management/Get-Safes.ps1",
    ],
    chipLabel: "Priorité Haute",
  },
  {
    id: "health",
    title: "Health Dashboard",
    description:
      "Monitor the health status of CyberArk services, components and certificates.",
    icon: <HealthIcon sx={{ fontSize: 60 }} />,
    color: "#2e7d32",
    scripts: [
      "/System Health/System-Health.ps1",
      "/Test HTML5 Certificate/Test-HTML5Gateway.ps1",
    ],
    chipLabel: "Priorité Haute",
  },
  {
    id: "security",
    title: "Security & Compliance",
    description:
      "Track security compliance, policy violations and risk metrics for privileged accounts.",
    icon: <SecurityIcon sx={{ fontSize: 60 }} />,
    color: "#d32f2f",
    scripts: [
      "/Security Events/Get-AccoutnsRiskReport.ps1",
      "/Reports/Accounts/Accounts_Inventory.ps1",
    ],
    chipLabel: "Priorité Haute",
  },
  {
    id: "privileged-accounts",
    title: "Privileged Accounts Usage",
    description:
      "Analyze privileged account access patterns, top used accounts and usage by teams.",
    icon: <AccountIcon sx={{ fontSize: 60 }} />,
    color: "#7b1fa2",
    scripts: [
      "/Get Accounts/Get-Account.ps1",
      "/User Management/Get-UsersActivityReport.ps1",
    ],
    chipLabel: "Priorité Moyenne",
  },
  {
    id: "sessions",
    title: "Session Monitoring",
    description:
      "Monitor active sessions, detect anomalous behavior and visualize geographical access.",
    icon: <MonitorIcon sx={{ fontSize: 60 }} />,
    color: "#ff9800",
    scripts: [
      "/PSM Sessions Management/PSM-SessionsManagement.ps1",
      "/Security Events/Get-AccoutnsRiskReport.ps1",
    ],
    chipLabel: "Priorité Moyenne",
  },
  {
    id: "password-rotation",
    title: "Password Rotation Status",
    description:
      "Track password rotation success rates, failed rotations and credential age.",
    icon: <PasswordIcon sx={{ fontSize: 60 }} />,
    color: "#0097a7",
    scripts: [
      "/Safe Management/Get-Safes.ps1",
      "/Get Accounts/Get-PendingAccounts.ps1",
    ],
    chipLabel: "Priorité Moyenne",
  },
  {
    id: "application-usage",
    title: "Applications & API Usage",
    description:
      "Monitor application integrations, API call volumes and performance metrics.",
    icon: <ApiIcon sx={{ fontSize: 60 }} />,
    color: "#5d4037",
    scripts: [
      "/AAM Applications/Get-Applications.ps1",
      "/CCP Setup/Get-CCPPerformance.ps1",
    ],
    chipLabel: "Priorité Basse",
  },
  {
    id: "incident-response",
    title: "Incident Response",
    description:
      "Track security incidents, resolution times and criticality levels of alerts.",
    icon: <ReportIcon sx={{ fontSize: 60 }} />,
    color: "#e91e63",
    scripts: [
      "/Security Events/Get-AccoutnsRiskReport.ps1",
      "/System Health/System-Health.ps1",
    ],
    chipLabel: "Priorité Basse",
  },
  {
    id: "adoption-efficiency",
    title: "Adoption & Efficiency",
    description:
      "Measure adoption rates by team, active users growth and access efficiency.",
    icon: <AssessmentIcon sx={{ fontSize: 60 }} />,
    color: "#009688",
    scripts: [
      "/User Management/Get-UsersActivityReport.ps1",
      "/Reports/Accounts/Accounts_Usage.ps1",
    ],
    chipLabel: "Priorité Basse",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const handleDashboardClick = (dashboardId) => {
    navigate(`/upload/${dashboardId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h1" component="h1" gutterBottom>
          CyberArk Capacity Planning Dashboard
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Sélectionnez un dashboard pour commencer
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {dashboards.map((dashboard) => (
          <Grid item xs={12} sm={6} md={4} key={dashboard.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleDashboardClick(dashboard.id)}
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: dashboard.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {React.cloneElement(dashboard.icon, {
                    sx: { fontSize: 60, color: "white" },
                  })}
                </Box>

                <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h5" component="h2" gutterBottom>
                      {dashboard.title}
                    </Typography>
                    <Chip
                      label={dashboard.chipLabel}
                      size="small"
                      sx={{
                        backgroundColor: dashboard.chipLabel.includes("Haute")
                          ? "#e3f2fd"
                          : dashboard.chipLabel.includes("Moyenne")
                          ? "#fff3e0"
                          : "#f5f5f5",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {dashboard.description}
                  </Typography>
                </CardContent>

                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Scripts nécessaires:
                  </Typography>
                  {dashboard.scripts.map((script, index) => (
                    <Chip
                      key={index}
                      label={script.split("/").pop()}
                      size="small"
                      sx={{ mr: 1, mb: 1, fontSize: "0.7rem" }}
                    />
                  ))}
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;

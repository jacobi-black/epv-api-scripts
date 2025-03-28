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
  Paper,
  alpha,
  Divider,
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
  GppGood as ComplianceIcon,
  DashboardOutlined,
  RocketOutlined,
} from "@mui/icons-material";

// Nouvelle palette avec couleurs uniques pour chaque dashboard
const dashboardColors = [
  {
    primary: "#4a6fa5", // bleu marine
    bg: "#ebf1f9",
  },
  {
    primary: "#5b8a7c", // vert sapin
    bg: "#eaf4f1",
  },
  {
    primary: "#a15c90", // violet prune
    bg: "#f6eef3",
  },
  {
    primary: "#cb7e58", // orange terracotta
    bg: "#f9efe9",
  },
  {
    primary: "#5575a7", // bleu acier
    bg: "#edf1f8",
  },
  {
    primary: "#738857", // vert olive
    bg: "#f0f3eb",
  },
  {
    primary: "#996888", // violet rosé
    bg: "#f5eef3",
  },
  {
    primary: "#b76d62", // rouge terracotta
    bg: "#f7edeb",
  },
  {
    primary: "#6d8a9c", // bleu gris
    bg: "#eef3f6",
  },
  {
    primary: "#8c6d9c", // violet lavande
    bg: "#f3eef6",
  },
];

// Groupes de dashboards
const dashboardCategories = {
  infrastructure: [
    {
      id: "capacity",
      title: "Capacity Dashboard",
      description:
        "Visualize system capacity metrics including CPU, memory, disk usage, and session capacity.",
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      colorIndex: 0,
      scripts: [
        "/System Health/System-Health.ps1",
        "/Safe Management/Get-Safes.ps1",
      ],
    },
    {
      id: "health",
      title: "Health Dashboard",
      description:
        "Monitor the health status of CyberArk services, components and certificates.",
      icon: <HealthIcon sx={{ fontSize: 40 }} />,
      colorIndex: 1,
      scripts: [
        "/System Health/System-Health.ps1",
        "/Test HTML5 Certificate/Test-HTML5Gateway.ps1",
      ],
    },
    {
      id: "performance",
      title: "Performance Dashboard",
      description:
        "Analyze detailed component performance metrics, response times, and optimization opportunities.",
      icon: <RocketOutlined sx={{ fontSize: 40 }} />,
      colorIndex: 2,
      scripts: [
        "/System Health/System-Health.ps1",
        "/PSM Sessions Management/PSM-SessionsManagement.ps1",
      ],
    },
  ],
  security: [
    {
      id: "security",
      title: "Security & Compliance",
      description:
        "Track security compliance, policy violations and risk metrics for privileged accounts.",
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      colorIndex: 2,
      scripts: [
        "/Security Events/Get-AccoutnsRiskReport.ps1",
        "/Reports/Accounts/Accounts_Inventory.ps1",
      ],
    },
    {
      id: "compliance",
      title: "Compliance Dashboard",
      description:
        "Monitor regulatory compliance, audit results and security controls to meet industry standards.",
      icon: <ComplianceIcon sx={{ fontSize: 40 }} />,
      colorIndex: 9,
      scripts: [
        "/Security Events/Get-AccoutnsRiskReport.ps1",
        "/Reports/Accounts/Accounts_Inventory.ps1",
      ],
    },
    {
      id: "privileged-accounts",
      title: "Privileged Accounts",
      description:
        "Analyze privileged account access patterns, top used accounts and usage by teams.",
      icon: <AccountIcon sx={{ fontSize: 40 }} />,
      colorIndex: 3,
      scripts: [
        "/Get Accounts/Get-Account.ps1",
        "/User Management/Get-UsersActivityReport.ps1",
      ],
    },
    {
      id: "incident-response",
      title: "Incident Response",
      description:
        "Track security incidents, resolution times and criticality levels of alerts.",
      icon: <ReportIcon sx={{ fontSize: 40 }} />,
      colorIndex: 7,
      scripts: [
        "/Security Events/Get-AccoutnsRiskReport.ps1",
        "/System Health/System-Health.ps1",
      ],
    },
  ],
  monitoring: [
    {
      id: "sessions",
      title: "Session Monitoring",
      description:
        "Monitor active sessions, detect anomalous behavior and visualize geographical access.",
      icon: <MonitorIcon sx={{ fontSize: 40 }} />,
      colorIndex: 4,
      scripts: [
        "/PSM Sessions Management/PSM-SessionsManagement.ps1",
        "/Security Events/Get-AccoutnsRiskReport.ps1",
      ],
    },
    {
      id: "password-rotation",
      title: "Password Rotation",
      description:
        "Track password rotation success rates, failed rotations and credential age.",
      icon: <PasswordIcon sx={{ fontSize: 40 }} />,
      colorIndex: 5,
      scripts: [
        "/Safe Management/Get-Safes.ps1",
        "/Get Accounts/Get-PendingAccounts.ps1",
      ],
    },
  ],
  analytics: [
    {
      id: "application-usage",
      title: "Applications & API",
      description:
        "Monitor application integrations, API call volumes and performance metrics.",
      icon: <ApiIcon sx={{ fontSize: 40 }} />,
      colorIndex: 6,
      scripts: [
        "/AAM Applications/Get-Applications.ps1",
        "/CCP Setup/Get-CCPPerformance.ps1",
      ],
    },
    {
      id: "adoption-efficiency",
      title: "Adoption & Efficiency",
      description:
        "Measure adoption rates by team, active users growth and access efficiency.",
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      colorIndex: 8,
      scripts: [
        "/User Management/Get-UsersActivityReport.ps1",
        "/Reports/Accounts/Accounts_Usage.ps1",
      ],
    },
    {
      id: "executive",
      title: "Executive Dashboard",
      description:
        "Strategic overview of security posture, compliance status, and resource allocation for management.",
      icon: <DashboardOutlined sx={{ fontSize: 40 }} />,
      colorIndex: 3,
      scripts: [
        "/System Health/System-Health.ps1",
        "/Security Events/Get-AccoutnsRiskReport.ps1",
      ],
    },
  ],
};

const DashboardCard = ({ dashboard, onClick }) => {
  const color = dashboardColors[dashboard.colorIndex];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        background: color.bg,
        border: `1px solid ${alpha(color.primary, 0.2)}`,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        borderRadius: 2,
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 8px 30px ${alpha(color.primary, 0.15)}`,
          "& .icon-wrapper": {
            background: alpha(color.primary, 0.12),
            transform: "scale(1.05)",
          },
          "& .dashboard-title": {
            color: color.primary,
          },
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          height: "100%",
          p: 0,
        }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            className="icon-wrapper"
            sx={{
              width: 56,
              height: 56,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "12px",
              background: alpha(color.primary, 0.08),
              color: color.primary,
              transition: "all 0.3s ease",
              mr: 2,
            }}
          >
            {React.cloneElement(dashboard.icon, {
              sx: { fontSize: 30, color: color.primary },
            })}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              className="dashboard-title"
              variant="h6"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "rgba(0, 0, 0, 0.78)",
                transition: "color 0.3s ease",
                mb: 0.5,
              }}
            >
              {dashboard.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "0.85rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 38,
              }}
            >
              {dashboard.description}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, opacity: 0.6 }} />

        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 1,
              color: alpha(color.primary, 0.8),
              fontWeight: 600,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Scripts nécessaires
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {dashboard.scripts.map((script, index) => (
              <Chip
                key={index}
                label={script.split("/").pop()}
                size="small"
                sx={{
                  mr: 1,
                  mb: 1,
                  fontSize: "0.65rem",
                  height: 22,
                  background: "rgba(255, 255, 255, 0.7)",
                  border: `1px solid ${alpha(color.primary, 0.15)}`,
                  color: alpha(color.primary, 0.85),
                }}
              />
            ))}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const CategorySection = ({ title, dashboards, handleDashboardClick }) => (
  <Box sx={{ mb: 6 }}>
    <Typography
      variant="h5"
      component="h2"
      sx={{
        fontWeight: 600,
        mb: 3,
        pb: 1,
        borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
        color: "rgba(0, 0, 0, 0.75)",
      }}
    >
      {title}
    </Typography>
    <Grid container spacing={3}>
      {dashboards.map((dashboard) => (
        <Grid item xs={12} sm={6} md={4} key={dashboard.id}>
          <DashboardCard
            dashboard={dashboard}
            onClick={() => handleDashboardClick(dashboard.id)}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const Home = () => {
  const navigate = useNavigate();

  const handleDashboardClick = (dashboardId) => {
    navigate(`/upload/${dashboardId}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "linear-gradient(to bottom right, #f9fafc, #f0f4f9)",
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              color: "#36506c",
              mb: 1,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 80,
                height: 3,
                borderRadius: 3,
                background: "linear-gradient(to right, #36506c, #5a8cad)",
              },
            }}
          >
            CyberArk Capacity Planning
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              color: "rgba(0, 0, 0, 0.6)",
              maxWidth: "600px",
            }}
          >
            Explorez et analysez vos données CyberArk à travers ces tableaux de
            bord spécialisés
          </Typography>
        </Box>

        <CategorySection
          title="Infrastructure & Capacité"
          dashboards={dashboardCategories.infrastructure}
          handleDashboardClick={handleDashboardClick}
        />

        <CategorySection
          title="Sécurité & Conformité"
          dashboards={dashboardCategories.security}
          handleDashboardClick={handleDashboardClick}
        />

        <CategorySection
          title="Surveillance & Supervision"
          dashboards={dashboardCategories.monitoring}
          handleDashboardClick={handleDashboardClick}
        />

        <CategorySection
          title="Analyse & Performance"
          dashboards={dashboardCategories.analytics}
          handleDashboardClick={handleDashboardClick}
        />
      </Container>
    </Box>
  );
};

export default Home;

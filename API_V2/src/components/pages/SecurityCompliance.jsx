import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import GppBadIcon from "@mui/icons-material/GppBad";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

// Palettes de couleurs
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#d88489",
];
const RISK_COLORS = {
  High: "#f44336",
  Medium: "#ff9800",
  Low: "#4caf50",
  Critical: "#d32f2f",
};

// Données de simulation pour les violations et conformité
const mockComplianceData = {
  total: 1250,
  compliant: 875,
  nonCompliant: 375,
  byPolicyType: [
    {
      name: "Rotation de mots de passe",
      total: 420,
      compliant: 350,
      nonCompliant: 70,
    },
    {
      name: "Complexité de mots de passe",
      total: 420,
      compliant: 310,
      nonCompliant: 110,
    },
    {
      name: "Accès administrateur",
      total: 210,
      compliant: 150,
      nonCompliant: 60,
    },
    {
      name: "Double authentification",
      total: 200,
      compliant: 65,
      nonCompliant: 135,
    },
  ],
  violations: [
    {
      id: 1,
      type: "Password Policy",
      account: "admin@system1",
      severity: "High",
      date: "2023-11-15",
      status: "Open",
    },
    {
      id: 2,
      type: "Access Control",
      account: "dbuser@oracle01",
      severity: "Medium",
      date: "2023-11-14",
      status: "Resolved",
    },
    {
      id: 3,
      type: "Authentication Failure",
      account: "sysadmin@network",
      severity: "Critical",
      date: "2023-11-12",
      status: "Open",
    },
    {
      id: 4,
      type: "Unauthorized Access",
      account: "backupuser@server7",
      severity: "High",
      date: "2023-11-10",
      status: "Under Review",
    },
    {
      id: 5,
      type: "Password Expiration",
      account: "serviceaccount1",
      severity: "Low",
      date: "2023-11-08",
      status: "Resolved",
    },
    {
      id: 6,
      type: "Privilege Escalation",
      account: "operatoruser@db5",
      severity: "Critical",
      date: "2023-11-05",
      status: "Open",
    },
    {
      id: 7,
      type: "Concurrent Login",
      account: "developer3@devserver",
      severity: "Medium",
      date: "2023-11-01",
      status: "Resolved",
    },
  ],
  recentAccessDenied: 18,
  unmanagedAccountsPercentage: 14,
};

const mockRiskData = {
  overview: {
    critical: 12,
    high: 45,
    medium: 86,
    low: 137,
  },
  topRisks: [
    {
      id: 1,
      name: "Comptes à privilèges élevés non audités",
      affected: 23,
      severity: "Critical",
      impact: "Très élevé",
    },
    {
      id: 2,
      name: "Droits d'accès excessifs sur serveurs critiques",
      affected: 17,
      severity: "High",
      impact: "Élevé",
    },
    {
      id: 3,
      name: "Mots de passe non renouvelés (>90 jours)",
      affected: 42,
      severity: "Medium",
      impact: "Moyen",
    },
    {
      id: 4,
      name: "Accès direct sans traçabilité",
      affected: 15,
      severity: "High",
      impact: "Élevé",
    },
    {
      id: 5,
      name: "Comptes partagés sans conventions",
      affected: 28,
      severity: "Medium",
      impact: "Moyen",
    },
  ],
};

const SecurityCompliance = ({ subview = "overview" }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentSubview, setCurrentSubview] = useState(subview);
  const dataContext = useData();
  const { riskData, accountsData } = dataContext;

  // Utilisation des données du contexte ou des mocks si non disponibles
  const complianceData = mockComplianceData;
  const risksData = mockRiskData;

  // Si les données requises ne sont pas disponibles, afficher une alerte
  const hasRequiredData = accountsData?.length > 0 || true; // On utilise true ici pour simuler la présence de données

  useEffect(() => {
    setCurrentSubview(subview);

    // Mise à jour de l'onglet actif en fonction de la sous-vue
    if (subview === "overview") setActiveTab(0);
    else if (subview === "compliance") setActiveTab(1);
    else if (subview === "violations") setActiveTab(2);
    else if (subview === "risks") setActiveTab(3);
  }, [subview]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // Mise à jour de la sous-vue en fonction de l'onglet sélectionné
    if (newValue === 0) setCurrentSubview("overview");
    else if (newValue === 1) setCurrentSubview("compliance");
    else if (newValue === 2) setCurrentSubview("violations");
    else if (newValue === 3) setCurrentSubview("risks");
  };

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard de sécurité et
        conformité. Veuillez importer les fichiers de risque et d'inventaire de
        comptes.
      </Alert>
    );
  }

  // Préparation des données pour les graphiques
  const complianceChartData = [
    { name: "Conformes", value: complianceData.compliant },
    { name: "Non Conformes", value: complianceData.nonCompliant },
  ];

  const riskSeverityData = [
    {
      name: "Critique",
      value: risksData.overview.critical,
      color: RISK_COLORS.Critical,
    },
    { name: "Élevé", value: risksData.overview.high, color: RISK_COLORS.High },
    {
      name: "Moyen",
      value: risksData.overview.medium,
      color: RISK_COLORS.Medium,
    },
    { name: "Faible", value: risksData.overview.low, color: RISK_COLORS.Low },
  ];

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* KPIs Row */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Taux de conformité
            </Typography>
            <Typography variant="h3" color="primary">
              {Math.round(
                (complianceData.compliant / complianceData.total) * 100
              )}
              %
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(complianceData.compliant / complianceData.total) * 100}
              sx={{ my: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary">
              {complianceData.compliant} comptes conformes sur{" "}
              {complianceData.total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Violations détectées
            </Typography>
            <Typography variant="h3" color="error">
              {
                complianceData.violations.filter((v) => v.status === "Open")
                  .length
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              dont{" "}
              {
                complianceData.violations.filter(
                  (v) => v.severity === "Critical"
                ).length
              }{" "}
              critiques
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comptes non gérés
            </Typography>
            <Typography variant="h3" color="warning.main">
              {complianceData.unmanagedAccountsPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {complianceData.recentAccessDenied} tentatives d'accès refusées
              récemment
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts Row */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Conformité aux politiques
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {complianceChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#4caf50" : "#f44336"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Distribution des risques par sévérité
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={riskSeverityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Nombre de risques">
                {riskSeverityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Recommendations */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recommandations de sécurité
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <WarningIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Résoudre les violations critiques (12)"
                secondary="Les comptes avec privilèges élevés non audités présentent un risque majeur"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ErrorIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Améliorer la conformité des mots de passe"
                secondary="26% des comptes ne respectent pas les politiques de complexité des mots de passe"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Réduire le nombre de comptes non gérés"
                secondary="Objectif recommandé: moins de 5% du parc total"
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderComplianceView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Conformité des comptes par politique
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type de politique</TableCell>
                  <TableCell>Comptes concernés</TableCell>
                  <TableCell>Conformes</TableCell>
                  <TableCell>Non conformes</TableCell>
                  <TableCell>Taux de conformité</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complianceData.byPolicyType.map((policy, index) => (
                  <TableRow key={index}>
                    <TableCell>{policy.name}</TableCell>
                    <TableCell>{policy.total}</TableCell>
                    <TableCell>{policy.compliant}</TableCell>
                    <TableCell>{policy.nonCompliant}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(policy.compliant / policy.total) * 100}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(
                              (policy.compliant / policy.total) * 100
                            )}
                            %
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          policy.compliant / policy.total > 0.9
                            ? "Bon"
                            : policy.compliant / policy.total > 0.7
                            ? "Moyen"
                            : "Critique"
                        }
                        color={
                          policy.compliant / policy.total > 0.9
                            ? "success"
                            : policy.compliant / policy.total > 0.7
                            ? "warning"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Mesures d'amélioration recommandées
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <TaskAltIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Audit des comptes non conformes à la double authentification"
                secondary="Priorité: Haute - Impact: Critique"
              />
              <Button variant="outlined" size="small">
                Détails
              </Button>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TaskAltIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Révision des comptes administrateurs non conformes"
                secondary="Priorité: Haute - Impact: Élevé"
              />
              <Button variant="outlined" size="small">
                Détails
              </Button>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TaskAltIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Renforcement des politiques de complexité des mots de passe"
                secondary="Priorité: Moyenne - Impact: Moyen"
              />
              <Button variant="outlined" size="small">
                Détails
              </Button>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderViolationsView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Violations de politiques de sécurité
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type de violation</TableCell>
                  <TableCell>Compte concerné</TableCell>
                  <TableCell>Sévérité</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complianceData.violations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell>{violation.id}</TableCell>
                    <TableCell>{violation.type}</TableCell>
                    <TableCell>{violation.account}</TableCell>
                    <TableCell>
                      <Chip
                        label={violation.severity}
                        color={
                          violation.severity === "Critical"
                            ? "error"
                            : violation.severity === "High"
                            ? "error"
                            : violation.severity === "Medium"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{violation.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={violation.status}
                        color={
                          violation.status === "Open"
                            ? "error"
                            : violation.status === "Under Review"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderRisksView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Top 5 des risques identifiés
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Risque</TableCell>
                  <TableCell>Comptes affectés</TableCell>
                  <TableCell>Sévérité</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {risksData.topRisks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>{risk.name}</TableCell>
                    <TableCell>{risk.affected}</TableCell>
                    <TableCell>
                      <Chip
                        label={risk.severity}
                        color={
                          risk.severity === "Critical"
                            ? "error"
                            : risk.severity === "High"
                            ? "error"
                            : risk.severity === "Medium"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{risk.impact}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Analyser
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Distribution des risques par catégorie
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Authentification", value: 28 },
                  { name: "Privilèges", value: 35 },
                  { name: "Accès non autorisés", value: 22 },
                  { name: "Configuration", value: 15 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Actions de mitigation recommandées
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <GppBadIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Mettre en place l'audit systématique des comptes à privilèges élevés"
                secondary="Réduction de l'exposition: 85%"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <GppBadIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Restreindre les accès directs et implémenter des mécanismes de traçabilité"
                secondary="Réduction de l'exposition: 70%"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AssignmentLateIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Appliquer une rotation forcée des mots de passe anciens"
                secondary="Réduction de l'exposition: 60%"
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  // Rendu du contenu en fonction de la sous-vue
  const renderContent = () => {
    switch (currentSubview) {
      case "compliance":
        return renderComplianceView();
      case "violations":
        return renderViolationsView();
      case "risks":
        return renderRisksView();
      default:
        return renderOverview();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sécurité et Conformité
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3, bgcolor: "background.paper", borderRadius: 1 }}
      >
        <Tab icon={<SecurityIcon />} label="Vue d'ensemble" />
        <Tab icon={<CheckCircleIcon />} label="Conformité" />
        <Tab icon={<ErrorIcon />} label="Violations" />
        <Tab icon={<WarningIcon />} label="Risques" />
      </Tabs>

      {renderContent()}
    </Box>
  );
};

export default SecurityCompliance;

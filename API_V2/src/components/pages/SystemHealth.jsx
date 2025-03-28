import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import { getSystemHealthStats } from "../../utils/csvParser";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Chip,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import DnsIcon from "@mui/icons-material/Dns";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";

// Importation des composants de graphiques
import ServicesStatusChart from "../charts/ServicesStatusChart";
import ReplicationStatusChart from "../charts/ReplicationStatusChart";
import ConnectivityChart from "../charts/ConnectivityChart";
import CertificatesStatusChart from "../charts/CertificatesStatusChart";

// Données simulées pour démo
const mockData = {
  services: [
    { name: "CyberArk Password Manager", component: "CPM", status: "Running" },
    {
      name: "CyberArk Central Policy Manager",
      component: "CPM",
      status: "Running",
    },
    {
      name: "CyberArk Privileged Session Manager",
      component: "PSM",
      status: "Running",
    },
    {
      name: "CyberArk Privileged Session Manager Service",
      component: "PSM",
      status: "Running",
    },
    { name: "CyberArk Vault", component: "Vault", status: "Running" },
    {
      name: "CyberArk PrivateArk Server",
      component: "Vault",
      status: "Running",
    },
    { name: "CyberArk PVWA App Pool", component: "PVWA", status: "Running" },
    {
      name: "CyberArk Windows Hardening Service",
      component: "PTA",
      status: "Stopped",
    },
    {
      name: "CyberArk Event Notification Engine",
      component: "PTA",
      status: "Warning",
    },
    {
      name: "CyberArk Authentication Service",
      component: "PAS",
      status: "Running",
    },
  ],
  replication: [
    { site: "DR-Site-01", status: "Connected", delay: 45 },
    { site: "DR-Site-02", status: "Connected", delay: 78 },
    { site: "DR-Site-03", status: "Syncing", delay: 320 },
    { site: "DR-Site-04", status: "Disconnected", delay: 0 },
  ],
  connectivity: [
    { source: "PVWA", target: "Vault", status: "Connected", latency: 23 },
    { source: "PVWA", target: "PSM", status: "Connected", latency: 42 },
    { source: "PVWA", target: "CPM", status: "Connected", latency: 36 },
    { source: "PSM", target: "Vault", status: "Connected", latency: 31 },
    { source: "CPM", target: "Vault", status: "Connected", latency: 28 },
    { source: "PSM", target: "PVWA", status: "Connected", latency: 45 },
    { source: "CPM", target: "PVWA", status: "Connected", latency: 38 },
    { source: "Vault", target: "DR-Site", status: "Connected", latency: 105 },
    { source: "DR-Site", target: "Vault", status: "Connected", latency: 112 },
    { source: "PVWA", target: "DR-Site", status: "Disconnected", latency: 0 },
  ],
  certificates: [
    {
      name: "vault-cert",
      component: "Vault",
      expiryDate: "2023-12-15",
      issuer: "Internal CA",
    },
    {
      name: "pvwa-cert",
      component: "PVWA",
      expiryDate: "2024-01-10",
      issuer: "Internal CA",
    },
    {
      name: "psm-cert",
      component: "PSM",
      expiryDate: "2024-02-20",
      issuer: "Internal CA",
    },
    {
      name: "cpm-cert",
      component: "CPM",
      expiryDate: "2024-03-05",
      issuer: "Internal CA",
    },
    {
      name: "ldap-cert",
      component: "PVWA",
      expiryDate: "2024-04-12",
      issuer: "Internal CA",
    },
    {
      name: "dr-site-cert",
      component: "DR-Site",
      expiryDate: "2024-05-18",
      issuer: "Internal CA",
    },
    {
      name: "auth-service-cert",
      component: "PAS",
      expiryDate: "2024-06-22",
      issuer: "Internal CA",
    },
    {
      name: "root-ca-cert",
      component: "Global",
      expiryDate: "2027-07-30",
      issuer: "Root CA",
    },
  ],
};

// SystemHealth Component
const SystemHealth = ({ dashboardType, subview }) => {
  const { systemHealthData, systemHealthStats } = useData();
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const navigate = useNavigate();

  // Si un subview est fourni, définir l'onglet en conséquence
  useEffect(() => {
    if (subview === "connectivity") {
      setCurrentTab(1);
    } else if (subview === "certificates") {
      setCurrentTab(2);
    } else {
      setCurrentTab(0);
    }
  }, [subview]);

  // Calculate stats when systemHealthData changes
  useEffect(() => {
    if (systemHealthData && systemHealthData.length > 0) {
      setStats(systemHealthStats || getSystemHealthStats(systemHealthData));
      setFilteredMetrics(systemHealthData);
    }
  }, [systemHealthData, systemHealthStats]);

  // Si pas de données, afficher un message
  if (!systemHealthData || systemHealthData.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Aucune donnée système disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Pour visualiser l'état du système, veuillez d'abord importer vos
            données CSV.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate("/upload/health")}
          >
            Importer des données
          </Button>
        </Paper>
      </Box>
    );
  }

  // Apply search filter
  useEffect(() => {
    if (!systemHealthData) return;

    if (searchTerm.trim() === "") {
      setFilteredMetrics(systemHealthData);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = systemHealthData.filter((metric) => {
      const component = (metric.Component || "").toLowerCase();
      const status = (metric.Status || "").toLowerCase();
      return component.includes(term) || status.includes(term);
    });

    setFilteredMetrics(filtered);
  }, [systemHealthData, searchTerm]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">État du Système</Typography>
        <Box>
          <Tooltip title="Rafraîchir les données">
            <IconButton color="primary" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filtrer les résultats">
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="system health tabs"
        >
          <Tab
            label="Statut Services"
            icon={<DnsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Connectivité"
            icon={<StorageIcon />}
            iconPosition="start"
          />
          <Tab
            label="Certificats"
            icon={<SecurityIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Onglet Statut Services */}
      {currentTab === 0 && (
        <>
          {/* Search Bar */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Rechercher un composant"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total des Composants
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalComponents || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Composants Sains
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats?.healthyComponents || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Composants en Alerte
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats?.warningComponents || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Composants en Erreur
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats?.errorComponents || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Service Status Chart */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <ServicesStatusChart data={mockData.services} />
            </Grid>
          </Grid>

          {/* Components Table */}
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Composant</TableCell>
                    <TableCell>État</TableCell>
                    <TableCell>CPU (%)</TableCell>
                    <TableCell>Mémoire (%)</TableCell>
                    <TableCell>Dernière Mise à Jour</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMetrics.map((metric, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{metric.Component}</TableCell>
                      <TableCell>
                        <Chip
                          label={metric.Status}
                          color={
                            metric.Status === "Healthy"
                              ? "success"
                              : metric.Status === "Warning"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{metric.CPU || "N/A"}</TableCell>
                      <TableCell>{metric.Memory || "N/A"}</TableCell>
                      <TableCell>{metric.LastUpdated || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Onglet Connectivité */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Cette section montre la connectivité entre les différents
              composants CyberArk et l'état de la réplication.
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <ConnectivityChart data={mockData.connectivity} height={400} />
          </Grid>

          <Grid item xs={12}>
            <ReplicationStatusChart data={mockData.replication} />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recommandations de Connectivité
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Optimisation des Performances
                  </Typography>
                  <Typography paragraph>
                    • Assurez-vous que la latence entre PVWA et Vault reste
                    inférieure à 50ms
                    <br />
                    • Maintenez une connexion stable entre tous les composants
                    CPM et le Vault
                    <br />• Vérifiez régulièrement la qualité du réseau entre
                    les sites principaux et DR
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Résolution des Problèmes
                  </Typography>
                  <Typography paragraph>
                    • Problème de connexion PVWA-DR: vérifiez les règles de
                    pare-feu
                    <br />
                    • Latence élevée Vault-DR: optimisez la bande passante
                    réseau entre sites
                    <br />• Pour tout composant déconnecté, vérifiez les
                    services Windows et les configurations réseau
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Onglet Certificats */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Cette section montre l'état des certificats utilisés par les
              différents composants CyberArk.
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <CertificatesStatusChart
              data={mockData.certificates}
              height={350}
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bonnes Pratiques pour la Gestion des Certificats
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Cycle de Vie
                  </Typography>
                  <Typography paragraph>
                    • Planifiez le renouvellement des certificats 30 jours avant
                    leur expiration
                    <br />
                    • Conservez une documentation à jour de tous les certificats
                    et de leurs emplacements
                    <br />• Implémentez un processus de gestion automatisée du
                    cycle de vie des certificats
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Sécurité
                  </Typography>
                  <Typography paragraph>
                    • Utilisez des certificats avec des clés d'au moins 2048
                    bits
                    <br />
                    • Assurez-vous que tous les certificats sont émis par une
                    autorité de certification approuvée
                    <br />• Vérifiez régulièrement la chaîne de confiance des
                    certificats
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Bonnes Pratiques
                  </Typography>
                  <Typography paragraph>
                    • Utilisez des certificats wildcard avec prudence et
                    uniquement lorsque nécessaire
                    <br />
                    • Configurez des alertes pour les certificats approchant de
                    leur date d'expiration
                    <br />• Testez le processus de renouvellement des
                    certificats avant leur expiration
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SystemHealth;

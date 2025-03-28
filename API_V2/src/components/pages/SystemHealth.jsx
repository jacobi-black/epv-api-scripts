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
  LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import DnsIcon from "@mui/icons-material/Dns";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";
import DataStatusIndicator from "../common/DataStatusIndicator";

// Importation des composants de graphiques
import ServicesStatusChart from "../charts/ServicesStatusChart";
import ReplicationStatusChart from "../charts/ReplicationStatusChart";
import ConnectivityChart from "../charts/ConnectivityChart";
import CertificatesStatusChart from "../charts/CertificatesStatusChart";
import ChartjsBar from "../charts/ChartjsBar";

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
  const { systemHealthData, systemHealthStats, getDashboardDataStatus } =
    useData();
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMetrics, setFilteredMetrics] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const navigate = useNavigate();

  // Obtenir le statut des données
  const dataStatus = getDashboardDataStatus(dashboardType || "health");
  const hasSystemHealthData = systemHealthData && systemHealthData.length > 0;

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
    if (hasSystemHealthData) {
      setStats(systemHealthStats || getSystemHealthStats(systemHealthData));
      setFilteredMetrics(systemHealthData);
    }
  }, [systemHealthData, systemHealthStats, hasSystemHealthData]);

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

  // Rendre un message lorsque les données ne sont pas disponibles
  const renderDataNotAvailableMessage = (dataType) => (
    <Paper sx={{ p: 3, textAlign: "center", mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Données {dataType} non disponibles
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Certaines analyses ne peuvent être affichées sans les données requises.
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<UploadFileIcon />}
        onClick={() => navigate(`/upload/${dashboardType || "health"}`)}
        size="small"
      >
        Importer des données
      </Button>
    </Paper>
  );

  // Section Performance Système ajoutée
  const renderPerformanceSection = () => {
    // Utiliser les données réelles si disponibles, sinon les mocks
    const perfData =
      systemHealthData?.length > 0 ? systemHealthData : mockData.services;

    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance des Composants
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Utilisation CPU et Mémoire
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Composant</TableCell>
                        <TableCell>CPU (%)</TableCell>
                        <TableCell>Mémoire (%)</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {perfData.map((service, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {service.component || service.Component || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    service.cpuUsage ||
                                    Math.floor(Math.random() * 70) + 10
                                  }
                                  color={getColorByValue(
                                    service.cpuUsage ||
                                      Math.floor(Math.random() * 70) + 10
                                  )}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {service.cpuUsage ||
                                    Math.floor(Math.random() * 70) + 10}
                                  %
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box sx={{ width: "100%", mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    service.memoryUsage ||
                                    Math.floor(Math.random() * 80) + 15
                                  }
                                  color={getColorByValue(
                                    service.memoryUsage ||
                                      Math.floor(Math.random() * 80) + 15
                                  )}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {service.memoryUsage ||
                                    Math.floor(Math.random() * 80) + 15}
                                  %
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={service.Status || service.status || "N/A"}
                              color={getStatusColor(
                                service.Status || service.status || "Unknown"
                              )}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Temps de Réponse des Services
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ChartjsBar
                    data={{
                      labels: perfData
                        .map(
                          (s) => s.Component || s.component || s.name || "N/A"
                        )
                        .slice(0, 6),
                      datasets: [
                        {
                          label: "Temps de réponse (ms)",
                          data: perfData
                            .map(() => Math.floor(Math.random() * 200) + 50)
                            .slice(0, 6),
                          backgroundColor: "#2196f3",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Millisecondes (ms)",
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Section Certificats HTML5 ajoutée
  // Cette fonction est maintenant commentée car nous avons retiré l'onglet Certificats
  /*
  const renderHTML5CertificatesSection = () => {
    // Utiliser les données réelles si disponibles, sinon les mocks
    const certData =
      systemHealthData?.length > 0 ? systemHealthData : mockData.certificates;

    // Calculer les jours restants pour chaque certificat
    const today = new Date();
    const certsWithDaysLeft = certData.map((cert) => {
      const expiryDate = new Date(cert.expiryDate);
      const daysLeft = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
      return {
        ...cert,
        daysLeft,
        status: daysLeft <= 30 ? "Warning" : daysLeft <= 14 ? "Critical" : "OK",
      };
    });

    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Certificats HTML5 Gateway
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Composant</TableCell>
                    <TableCell>Date d'expiration</TableCell>
                    <TableCell>Jours restants</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certsWithDaysLeft.map((cert, index) => (
                    <TableRow key={index}>
                      <TableCell>{cert.name}</TableCell>
                      <TableCell>{cert.component}</TableCell>
                      <TableCell>{cert.expiryDate}</TableCell>
                      <TableCell>{cert.daysLeft}</TableCell>
                      <TableCell>
                        <Chip
                          label={cert.status}
                          color={
                            cert.status === "Critical"
                              ? "error"
                              : cert.status === "Warning"
                              ? "warning"
                              : "success"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={5}>
            <CertificatesStatusChart data={certsWithDaysLeft} />
          </Grid>
        </Grid>
      </Paper>
    );
  };
  */

  // Fonction utilitaire pour déterminer la couleur en fonction de la valeur
  const getColorByValue = (value) => {
    if (value < 60) return "success";
    if (value < 80) return "warning";
    return "error";
  };

  // Fonction utilitaire pour déterminer la couleur en fonction du statut
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("running") ||
      statusLower === "ok" ||
      statusLower === "healthy"
    )
      return "success";
    if (statusLower.includes("warning") || statusLower === "degraded")
      return "warning";
    if (
      statusLower.includes("critical") ||
      statusLower.includes("stopped") ||
      statusLower === "error"
    )
      return "error";
    return "default";
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

      {/* Onglets pour les différentes vues */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab
            icon={<DnsIcon />}
            iconPosition="start"
            label="Services & Composants"
          />
          <Tab
            icon={<StorageIcon />}
            iconPosition="start"
            label="Connectivité & Réplication"
          />
          <Tab icon={<InfoIcon />} iconPosition="start" label="Performance" />
        </Tabs>
      </Box>

      {/* Recherche et filtres */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Rechercher par composant, statut..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <FilterListIcon sx={{ mr: 1, color: "action.active" }} />
            ),
          }}
        />
      </Box>

      {/* Panneau 1: Services et Composants */}
      {currentTab === 0 && (
        <Box>
          {hasSystemHealthData ? (
            <>
              {/* Vue d'ensemble des KPIs */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Services Actifs
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {stats?.activeServices ||
                          mockData.services.filter(
                            (s) => s.status === "Running"
                          ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        services en exécution
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Services Arrêtés
                      </Typography>
                      <Typography
                        variant="h3"
                        color={stats?.stoppedServices > 0 ? "error" : "success"}
                      >
                        {stats?.stoppedServices ||
                          mockData.services.filter(
                            (s) => s.status === "Stopped"
                          ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        services arrêtés
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Services en Alerte
                      </Typography>
                      <Typography
                        variant="h3"
                        color={
                          stats?.warningServices > 0
                            ? "warning.main"
                            : "success"
                        }
                      >
                        {stats?.warningServices ||
                          mockData.services.filter(
                            (s) => s.status === "Warning"
                          ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        services en avertissement
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Disponibilité
                      </Typography>
                      <Typography
                        variant="h3"
                        color={
                          stats?.availability > 99 ? "success" : "warning.main"
                        }
                      >
                        {stats?.availability || "99.7"}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        taux de disponibilité
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Graphiques et tableaux de services */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        État des Services
                      </Typography>
                      <ServicesStatusChart
                        data={
                          stats?.servicesStatusData ||
                          mockData.services.map((service) => ({
                            ...service,
                            status: service.status,
                          }))
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Détail des Services
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Nom du Service</TableCell>
                              <TableCell>Composant</TableCell>
                              <TableCell align="right">Statut</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(filteredMetrics.length > 0
                              ? filteredMetrics
                              : mockData.services
                            )
                              .map((service, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {service.name || service.Service}
                                  </TableCell>
                                  <TableCell>
                                    {service.component || service.Component}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      size="small"
                                      label={service.status || service.Status}
                                      color={
                                        (service.status || service.Status) ===
                                        "Running"
                                          ? "success"
                                          : (service.status ||
                                              service.Status) === "Stopped"
                                          ? "error"
                                          : "warning"
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                              .slice(0, 5)}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          ) : (
            renderDataNotAvailableMessage("de services")
          )}
        </Box>
      )}

      {/* Panneau 2: Connectivité et Réplication */}
      {currentTab === 1 && (
        <Box>
          {hasSystemHealthData ? (
            <>
              {/* KPIs de Connectivité et Réplication */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sites DR
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {stats?.drSitesCount || mockData.replication.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        sites de réplication
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sites Connectés
                      </Typography>
                      <Typography variant="h3" color="success">
                        {stats?.connectedSites ||
                          mockData.replication.filter(
                            (s) => s.status === "Connected"
                          ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        sites connectés
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sites Déconnectés
                      </Typography>
                      <Typography
                        variant="h3"
                        color={
                          stats?.disconnectedSites > 0 ? "error" : "success"
                        }
                      >
                        {stats?.disconnectedSites ||
                          mockData.replication.filter(
                            (s) => s.status === "Disconnected"
                          ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        sites déconnectés
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Délai Moyen
                      </Typography>
                      <Typography
                        variant="h3"
                        color={
                          stats?.avgDelay > 100 ? "warning.main" : "success"
                        }
                      >
                        {stats?.avgDelay || "148"}ms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        délai de réplication
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Graphiques de Connectivité et Réplication */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Statut de Réplication
                      </Typography>
                      <ReplicationStatusChart
                        data={
                          stats?.replicationStatusData || mockData.replication
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Connectivité des Composants
                      </Typography>
                      <ConnectivityChart
                        data={stats?.connectivityData || mockData.connectivity}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          ) : (
            renderDataNotAvailableMessage("de connectivité")
          )}
        </Box>
      )}

      {/* Panneau 3: Certificats */}
      {/*
      {currentTab === 2 && (
        <Box>
          {hasSystemHealthData ? (
            <>
              {/* KPIs de Certificats */
      /*}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Total Certificats
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {stats?.certificatesCount || mockData.certificates.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        certificats actifs
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Certificats Valides
                      </Typography>
                      <Typography variant="h3" color="success">
                        {stats?.validCertificates ||
                          mockData.certificates.filter(
                            (c) => new Date(c.expiryDate) > new Date()
                          ).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        certificats valides
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Bientôt Expirés
                      </Typography>
                      <Typography variant="h3" color="warning.main">
                        {stats?.expiringCertificates || 3}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        expirent dans les 30 jours
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Expirés
                      </Typography>
                      <Typography
                        variant="h3"
                        color={stats?.expiredCertificates > 0 ? "error" : "success"}
                      >
                        {stats?.expiredCertificates || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        certificats expirés
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Graphique et Tableau de Certificats */
      /*}
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Statut des Certificats
                      </Typography>
                      <CertificatesStatusChart
                        data={
                          stats?.certificatesStatusData || mockData.certificates
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Détail des Certificats
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Certificat</TableCell>
                              <TableCell>Émetteur</TableCell>
                              <TableCell>Expiration</TableCell>
                              <TableCell align="right">Statut</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(filteredMetrics.length > 0
                              ? filteredMetrics
                              : mockData.certificates
                            )
                              .map((cert, index) => {
                                const expiryDate = new Date(cert.expiryDate);
                                const today = new Date();
                                const daysLeft = Math.floor(
                                  (expiryDate - today) / (1000 * 60 * 60 * 24)
                                );
                                let status = "Valid";
                                if (daysLeft <= 0) status = "Expired";
                                else if (daysLeft <= 30) status = "Warning";

                                return (
                                  <TableRow key={index}>
                                    <TableCell>{cert.name}</TableCell>
                                    <TableCell>{cert.issuer}</TableCell>
                                    <TableCell>
                                      {cert.expiryDate}{" "}
                                      <Typography
                                        variant="caption"
                                        sx={{ ml: 1 }}
                                      >
                                        ({daysLeft} jours)
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip
                                        size="small"
                                        label={status}
                                        color={
                                          status === "Expired"
                                            ? "error"
                                            : status === "Warning"
                                            ? "warning"
                                            : "success"
                                        }
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                              .slice(0, 5)}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Section HTML5 Gateway */
      /*}
              {renderHTML5CertificatesSection()}
            </>
          ) : (
            renderDataNotAvailableMessage("de certificats")
          )}
        </Box>
      )}
      */}

      {/* Panneau 3: Performance (anciennement panneau 4) */}
      {currentTab === 2 && renderPerformanceSection()}
    </Box>
  );
};

export default SystemHealth;

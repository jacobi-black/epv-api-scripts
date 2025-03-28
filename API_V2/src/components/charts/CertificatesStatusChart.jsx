import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { ChartjsPie } from "./";

const CertificatesStatusChart = ({
  data,
  title = "État des Certificats",
  height = 300,
}) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: height }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Données insuffisantes pour afficher ce graphique
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Calculer les jours restants avant expiration
  const calculateDaysRemaining = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Enrichir les données avec les jours restants
  const processedData = data.map((cert) => ({
    ...cert,
    daysRemaining: calculateDaysRemaining(cert.expiryDate),
  }));

  // Trier par jours restants (du plus urgent au moins urgent)
  const sortedData = [...processedData].sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  );

  // Données pour le graphique
  const chartData = sortedData.slice(0, 10); // Prendre les 10 certificats les plus urgents

  // Définir la couleur en fonction des jours restants
  const getBarColor = (daysRemaining) => {
    if (daysRemaining <= 30) return "#f44336"; // Rouge pour < 30 jours
    if (daysRemaining <= 90) return "#ff9800"; // Orange pour < 90 jours
    return "#4caf50"; // Vert pour > 90 jours
  };

  // Statistiques sur les certificats
  const expiringSoon = sortedData.filter(
    (cert) => cert.daysRemaining <= 30 && cert.daysRemaining > 0
  ).length;
  const expired = sortedData.filter((cert) => cert.daysRemaining <= 0).length;
  const totalCerts = sortedData.length;

  // Utiliser les données passées en props ou des données de démonstration par défaut
  const certificatesData = data || [
    {
      name: "PVWA Certificate",
      component: "PVWA",
      expiryDate: "2023-12-25",
      status: "OK",
      daysLeft: 180,
    },
    {
      name: "CPM Certificate",
      component: "CPM",
      expiryDate: "2023-11-15",
      status: "Warning",
      daysLeft: 25,
    },
    {
      name: "PSM Certificate",
      component: "PSM",
      expiryDate: "2023-10-05",
      status: "Critical",
      daysLeft: 5,
    },
    {
      name: "PVWA Load Balancer",
      component: "Load Balancer",
      expiryDate: "2024-01-20",
      status: "OK",
      daysLeft: 210,
    },
    {
      name: "DR Certificate",
      component: "DR",
      expiryDate: "2023-09-30",
      status: "Critical",
      daysLeft: 2,
    },
  ];

  // Calculer le nombre de certificats par statut
  const statusCounts = certificatesData.reduce((acc, cert) => {
    acc[cert.status] = (acc[cert.status] || 0) + 1;
    return acc;
  }, {});

  // Préparer les données pour le graphique
  const pieChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "#4caf50", // OK - vert
          "#ff9800", // Warning - orange
          "#f44336", // Critical - rouge
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options du graphique
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Résumé des Certificats
            </Typography>

            <Typography variant="body2" gutterBottom>
              Certificats totaux: {totalCerts}
            </Typography>

            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Chip
                label={`${expiringSoon} expirent dans < 30 jours`}
                color="error"
                variant={expiringSoon > 0 ? "default" : "outlined"}
              />
              <Chip
                label={`${expired} certificats expirés`}
                color="error"
                variant={expired > 0 ? "default" : "outlined"}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box sx={{ height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  label={{
                    value: "Jours restants",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip
                  formatter={(value) => [`${value} jours`, "Avant expiration"]}
                  labelFormatter={(value) => `Certificat: ${value}`}
                />
                <Legend />
                <ReferenceLine x={30} stroke="#f44336" strokeDasharray="3 3" />
                <ReferenceLine x={90} stroke="#ff9800" strokeDasharray="3 3" />
                <Bar dataKey="daysRemaining" name="Jours avant expiration">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.daysRemaining)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Certificats à renouveler en priorité
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom du certificat</TableCell>
                <TableCell>Composant</TableCell>
                <TableCell>Date d'expiration</TableCell>
                <TableCell align="center">Jours restants</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.slice(0, 5).map((cert, index) => (
                <TableRow key={index} hover>
                  <TableCell>{cert.name}</TableCell>
                  <TableCell>{cert.component}</TableCell>
                  <TableCell>
                    {new Date(cert.expiryDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">{cert.daysRemaining}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        cert.daysRemaining <= 30
                          ? "Critique"
                          : cert.daysRemaining <= 90
                          ? "Attention"
                          : "Valide"
                      }
                      color={
                        cert.daysRemaining <= 30
                          ? "error"
                          : cert.daysRemaining <= 90
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
      </Box>

      <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
        <Typography variant="subtitle1" gutterBottom align="center">
          État des Certificats
        </Typography>
        <Box sx={{ height: 300 }}>
          <ChartjsPie data={pieChartData} options={pieChartOptions} />
        </Box>
        {certificatesData.filter((cert) => cert.status === "Critical").length >
          0 && (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mt: 2 }}
          >
            {
              certificatesData.filter((cert) => cert.status === "Critical")
                .length
            }{" "}
            certificat(s) à renouveler d'urgence
          </Typography>
        )}
        {certificatesData.filter((cert) => cert.status === "Warning").length >
          0 && (
          <Typography variant="body2" color="warning.main" align="center">
            {
              certificatesData.filter((cert) => cert.status === "Warning")
                .length
            }{" "}
            certificat(s) à renouveler prochainement
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default CertificatesStatusChart;

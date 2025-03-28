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

  // Calculer les statistiques
  const expiringSoon = sortedData.filter(
    (cert) => cert.daysRemaining <= 30
  ).length;
  const expiringMedium = sortedData.filter(
    (cert) => cert.daysRemaining > 30 && cert.daysRemaining <= 90
  ).length;
  const validCerts = sortedData.filter(
    (cert) => cert.daysRemaining > 90
  ).length;
  const totalCerts = sortedData.length;

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
                label={`${expiringMedium} expirent dans 30-90 jours`}
                color="warning"
                variant={expiringMedium > 0 ? "default" : "outlined"}
              />
              <Chip
                label={`${validCerts} valides > 90 jours`}
                color="success"
                variant={validCerts > 0 ? "default" : "outlined"}
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
    </Paper>
  );
};

export default CertificatesStatusChart;

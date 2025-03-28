import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Paper, Grid } from "@mui/material";

const SafesStorageChart = ({
  data,
  title = "Utilisation du Stockage des Coffres",
  height = 300,
}) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28CFF",
    "#FF6B6B",
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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

  // Calcul des statistiques globales
  const totalSize = data.reduce((sum, item) => sum + item.size, 0);
  const usedSpace = data.reduce((sum, item) => sum + item.used, 0);
  const usedPercentage = totalSize
    ? Math.round((usedSpace / totalSize) * 100)
    : 0;
  const freeSpace = totalSize - usedSpace;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h5" color="primary">
              {usedPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utilisation Totale
            </Typography>
            <Typography variant="body1" mt={2}>
              {(usedSpace / 1024).toFixed(2)} GB utilisés
            </Typography>
            <Typography variant="body1">
              sur {(totalSize / 1024).toFixed(2)} GB total
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="used"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${(value / 1024).toFixed(2)} GB`}
                  labelFormatter={(name) => `Coffre: ${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SafesStorageChart;

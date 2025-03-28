import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const SafesAnalysis = () => {
  // Exemple de données pour le graphique
  const data = [
    { name: "Applications", value: 30 },
    { name: "Infrastructure", value: 25 },
    { name: "Développement", value: 20 },
    { name: "Production", value: 25 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Safes Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribution des coffres par catégorie
            </Typography>
            <PieChart width={800} height={400}>
              <Pie
                data={data}
                cx={400}
                cy={200}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={160}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SafesAnalysis;

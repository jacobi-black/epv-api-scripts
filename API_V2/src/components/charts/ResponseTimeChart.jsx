import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Paper } from "@mui/material";

const ResponseTimeChart = ({
  data,
  title = "Temps de Réponse des Composants",
  height = 300,
}) => {
  // Formatter pour le tooltip qui affichera "xx ms" pour les valeurs
  const msFormatter = (value) => `${value} ms`;

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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis
              label={{
                value: "Temps (ms)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip formatter={msFormatter} />
            <Legend />
            {data[0] &&
              Object.keys(data[0])
                .filter((key) => key !== "timestamp")
                .map((component, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={component}
                    name={component}
                    stroke={`hsl(${index * 30}, 70%, 50%)`}
                    activeDot={{ r: 8 }}
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ResponseTimeChart;

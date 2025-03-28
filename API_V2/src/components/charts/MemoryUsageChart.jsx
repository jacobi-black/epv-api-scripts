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

const MemoryUsageChart = ({
  data,
  title = "Utilisation Mémoire des Serveurs",
  height = 300,
}) => {
  // Formatter pour le tooltip qui affichera "x%" pour les valeurs
  const percentFormatter = (value) => `${value}%`;

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
              domain={[0, 100]}
              tickFormatter={percentFormatter}
              label={{
                value: "Utilisation (%)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip formatter={percentFormatter} />
            <Legend />
            {data[0] &&
              Object.keys(data[0])
                .filter((key) => key !== "timestamp")
                .map((server, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={server}
                    name={server}
                    stroke={`hsl(${(index * 45 + 120) % 360}, 70%, 50%)`}
                    activeDot={{ r: 8 }}
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default MemoryUsageChart;

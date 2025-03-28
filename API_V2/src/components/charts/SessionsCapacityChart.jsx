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
  ReferenceLine,
} from "recharts";
import { Box, Typography, Paper } from "@mui/material";

const SessionsCapacityChart = ({
  data,
  title = "Capacité des Sessions PSM",
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

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="server" />
            <YAxis
              label={{
                value: "Nombre de sessions",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" name="Sessions Actives" fill="#2196f3" />
            <Bar dataKey="max" name="Capacité Maximale" fill="#9e9e9e" />
            <ReferenceLine
              y={
                data.reduce((acc, item) => acc + (item.recommended || 0), 0) /
                data.length
              }
              stroke="#f44336"
              strokeDasharray="3 3"
              label={{
                value: "Recommandé",
                position: "right",
                fill: "#f44336",
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default SessionsCapacityChart;

import React from "react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { Box, Typography, Paper } from "@mui/material";

const ConnectivityChart = ({ data, height = 300 }) => {
  // Vérifier si data est vide ou non défini
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: height }}>
        <Typography variant="h6" gutterBottom>
          Connectivité des Composants
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
            Données insuffisantes pour afficher la connectivité
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Définir les couleurs pour les statuts de connexion
  const getNodeColor = (name) => {
    // Couleurs par défaut pour les différents composants
    if (name.includes("Vault")) return "#1976d2";
    if (name.includes("PVWA")) return "#2e7d32";
    if (name.includes("PSM")) return "#ed6c02";
    if (name.includes("CPM")) return "#9c27b0";
    if (name.includes("DR")) return "#d32f2f";
    return "#607d8b";
  };

  // Définir la couleur des liens en fonction du statut
  const getLinkColor = (status) => {
    switch (status) {
      case "Connected":
        return "#4caf50";
      case "Disconnected":
        return "#f44336";
      case "Syncing":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  // Préparer les données pour le graphique Sankey
  // Convertir les données en format compatible avec Sankey
  const sankeyData = {
    nodes: [],
    links: [],
  };

  // Extraire tous les noeuds uniques
  const uniqueNodes = new Set();
  data.forEach((item) => {
    uniqueNodes.add(item.source);
    uniqueNodes.add(item.target);
  });

  // Ajouter les noeuds
  sankeyData.nodes = Array.from(uniqueNodes).map((name) => ({
    name,
    color: getNodeColor(name),
  }));

  // Ajouter les liens
  sankeyData.links = data.map((item) => ({
    source: sankeyData.nodes.findIndex((node) => node.name === item.source),
    target: sankeyData.nodes.findIndex((node) => node.name === item.target),
    value: 1, // Valeur fixe pour visualiser le lien
    status: item.status,
    latency: item.latency,
    color: getLinkColor(item.status),
  }));

  return (
    <Box sx={{ height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={sankeyData}
          nodePadding={50}
          nodeWidth={10}
          link={{
            stroke: (entry) => entry.color,
          }}
          node={{ fill: (entry) => entry.color }}
        >
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0].payload;

              // Pour les noeuds
              if (data.name) {
                return (
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "10px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <p>
                      <strong>Composant:</strong> {data.name}
                    </p>
                  </div>
                );
              }

              // Pour les liens
              const sourceNode = sankeyData.nodes[data.source];
              const targetNode = sankeyData.nodes[data.target];

              return (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  <p>
                    <strong>Source:</strong> {sourceNode.name}
                  </p>
                  <p>
                    <strong>Destination:</strong> {targetNode.name}
                  </p>
                  <p>
                    <strong>Statut:</strong> {data.status}
                  </p>
                  <p>
                    <strong>Latence:</strong> {data.latency} ms
                  </p>
                </div>
              );
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </Box>
  );
};

export default ConnectivityChart;

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

// Custom resize observer hook
const useResizeObserver = ({ ref }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observeTarget = ref.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
    });

    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);

  return dimensions;
};

const ChartjsPie = ({ data, options = {} }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const containerRef = useRef(null);
  const [chartId] = useState(
    `pie-chart-${Math.random().toString(36).substring(2, 9)}`
  ); // ID unique pour chaque instance

  // Observer les changements de taille du conteneur
  const { width } = useResizeObserver({ ref: containerRef });

  // Vérifier si les données sont valides
  const isDataValid =
    data &&
    data.datasets &&
    data.datasets.length > 0 &&
    data.datasets[0].data &&
    data.datasets[0].data.length > 0;

  useEffect(() => {
    // Nettoyer l'instance précédente du graphique
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // Créer une nouvelle instance du graphique seulement si les données sont valides
    if (chartRef.current && isDataValid) {
      const ctx = chartRef.current.getContext("2d");

      // Configuration par défaut pour les graphiques circulaires
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              padding: 20,
              font: {
                size: 12,
              },
              generateLabels: (chart) => {
                const defaultLabels =
                  Chart.defaults.plugins.legend.labels.generateLabels(chart);

                // Vérification supplémentaire pour éviter les erreurs
                if (!defaultLabels || !Array.isArray(defaultLabels)) {
                  return [];
                }

                // Pour les petits écrans, on limite la taille des labels
                if (width < 500) {
                  defaultLabels.forEach((label) => {
                    if (label && typeof label.text === "string") {
                      label.text =
                        label.text.length > 15
                          ? label.text.substring(0, 15) + "..."
                          : label.text;
                    }
                  });
                }
                return defaultLabels;
              },
            },
          },
          tooltip: {
            mode: "nearest",
            intersect: true,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 10,
            cornerRadius: 4,
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              label: function (context) {
                if (
                  !context ||
                  !context.chart ||
                  !context.chart.data ||
                  !context.chart.data.datasets ||
                  !context.chart.data.datasets[0] ||
                  !context.chart.data.datasets[0].data
                ) {
                  return "";
                }

                const label = context.label || "";
                const value = context.formattedValue || "";

                try {
                  const total = context.chart.data.datasets[0].data.reduce(
                    (a, b) => a + (isNaN(b) ? 0 : b),
                    0
                  );

                  if (total === 0 || isNaN(context.raw)) {
                    return `${label}: ${value}`;
                  }

                  const percentage = Math.round((context.raw / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                } catch (error) {
                  console.error("Error calculating tooltip label:", error);
                  return `${label}: ${value}`;
                }
              },
            },
          },
        },
        elements: {
          arc: {
            borderWidth: 1,
            borderColor: "#fff",
          },
        },
        cutout: "50%", // Crée un donut chart avec un trou au milieu
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          },
        },
      };

      // Adapter la position de la légende pour les petits écrans
      if (width < 500) {
        defaultOptions.plugins.legend.position = "bottom";
      }

      // Fusionner les options par défaut avec les options personnalisées
      const mergedOptions = { ...defaultOptions, ...options };

      try {
        // Créer l'instance du graphique avec un ID unique
        chartInstance.current = new Chart(ctx, {
          type: "pie",
          data: data,
          options: mergedOptions,
          id: chartId,
        });
      } catch (error) {
        console.error("Error creating chart:", error);
      }
    }

    // Nettoyer lors du démontage du composant
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, options, width, isDataValid, chartId]);

  // Si les données ne sont pas valides, afficher un message
  if (!isDataValid) {
    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "300px",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <p style={{ color: "#999", fontSize: "14px" }}>
          Données insuffisantes pour afficher ce graphique
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "300px", position: "relative" }}
    >
      <canvas ref={chartRef} id={chartId}></canvas>
    </div>
  );
};

export default ChartjsPie;

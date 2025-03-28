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

const ChartjsBar = ({ data, options = {} }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const containerRef = useRef(null);
  const [chartId] = useState(
    `bar-chart-${Math.random().toString(36).substring(2, 9)}`
  ); // ID unique

  // Observer les changements de taille du conteneur
  const { width } = useResizeObserver({ ref: containerRef });

  // Vérifier si les données sont valides
  const isDataValid =
    data &&
    data.datasets &&
    data.datasets.length > 0 &&
    data.labels &&
    data.labels.length > 0;

  useEffect(() => {
    // Si l'instance du graphique existe déjà, la détruire
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    // Créer une nouvelle instance du graphique seulement si les données sont valides
    if (chartRef.current && isDataValid) {
      const ctx = chartRef.current.getContext("2d");

      // Configuration par défaut pour les graphiques barres
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
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
          },
        },
        scales: {
          x: {
            grid: {
              drawOnChartArea: false,
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              drawOnChartArea: true,
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              font: {
                size: 11,
              },
            },
          },
          ...(data.datasets &&
          data.datasets[0] &&
          data.datasets[0].yAxisID === "y-axis-1"
            ? {
                "y-axis-1": {
                  type: "linear",
                  position: "left",
                  beginAtZero: true,
                  grid: {
                    drawOnChartArea: true,
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                  ticks: {
                    font: {
                      size: 11,
                    },
                  },
                },
                "y-axis-2": {
                  type: "linear",
                  position: "right",
                  beginAtZero: true,
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    font: {
                      size: 11,
                    },
                  },
                },
              }
            : {}),
        },
        elements: {
          bar: {
            borderWidth: 1,
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 10,
            bottom: 0,
          },
        },
      };

      // Fusionner les options par défaut avec les options personnalisées
      const mergedOptions = { ...defaultOptions, ...options };

      try {
        // Créer l'instance du graphique avec un ID unique
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: data,
          options: mergedOptions,
          id: chartId,
        });
      } catch (error) {
        console.error("Error creating bar chart:", error);
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

export default ChartjsBar;

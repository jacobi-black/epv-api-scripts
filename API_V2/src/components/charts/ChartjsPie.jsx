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

  // Observer les changements de taille du conteneur
  const { width } = useResizeObserver({ ref: containerRef });

  useEffect(() => {
    // Si l'instance du graphique existe déjà, la détruire
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Créer une nouvelle instance du graphique
    if (chartRef.current && data) {
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
                const labels =
                  Chart.defaults.plugins.legend.labels.generateLabels(chart);
                // Pour les petits écrans, on limite la taille des labels
                if (width < 500) {
                  labels.forEach((label) => {
                    label.text =
                      label.text.length > 15
                        ? label.text.substring(0, 15) + "..."
                        : label.text;
                  });
                }
                return labels;
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
                const label = context.label || "";
                const value = context.formattedValue;
                const total = context.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = Math.round((context.raw / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
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

      // Créer l'instance du graphique
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: data,
        options: mergedOptions,
      });
    }

    // Nettoyer lors du démontage du composant
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options, width]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "300px", position: "relative" }}
    >
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartjsPie;

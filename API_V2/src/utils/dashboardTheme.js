/**
 * Thème commun pour les dashboards
 * Ce fichier définit les styles et couleurs partagés pour tous les dashboards
 * afin d'assurer une cohérence visuelle.
 */

// Définition des couleurs principales
export const colors = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#52c41a",
  warning: "#faad14",
  danger: "#f5222d",
  info: "#1890ff",

  // Couleurs pour les graphiques
  chart: {
    blue: "#1890ff",
    green: "#52c41a",
    yellow: "#faad14",
    red: "#f5222d",
    purple: "#722ed1",
    cyan: "#13c2c2",
    orange: "#fa8c16",
    lime: "#a0d911",
    gold: "#faad14",
    magenta: "#eb2f96",
  },

  // Gradients
  gradients: {
    blue: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
    green: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
    red: "linear-gradient(135deg, #f5222d 0%, #cf1322 100%)",
    yellow: "linear-gradient(135deg, #faad14 0%, #d48806 100%)",
    purple: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
  },
};

// Définition des styles pour Ant Design
export const antdTheme = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorInfo: colors.info,
    borderRadius: 8,
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    Card: {
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Table: {
      borderRadius: 8,
      headerBg: "rgba(0, 0, 0, 0.02)",
    },
    Tabs: {
      inkBarColor: colors.primary,
    },
    Progress: {
      defaultColor: colors.primary,
      successColor: colors.success,
      warningColor: colors.warning,
      exceptionColor: colors.danger,
    },
  },
};

// Définition des styles pour Material-UI
export const muiTheme = {
  palette: {
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.danger,
    },
    info: {
      main: colors.info,
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 500,
      fontSize: "1.5rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
};

// Styles communs pour les graphiques
export const chartStyles = {
  // Couleurs pour les graphiques
  colors: [
    colors.chart.blue,
    colors.chart.green,
    colors.chart.yellow,
    colors.chart.red,
    colors.chart.purple,
    colors.chart.cyan,
    colors.chart.orange,
    colors.chart.lime,
    colors.chart.gold,
    colors.chart.magenta,
  ],

  // Options pour Chart.js
  chartjsOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "rgba(0, 0, 0, 0.05)",
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        boxWidth: 8,
        cornerRadius: 8,
        titleFont: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 11,
          },
          color: "#666",
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 11,
          },
          color: "#666",
        },
      },
    },
  },

  // Couleurs personnalisées pour Recharts
  rechartsColors: {
    grid: "rgba(0, 0, 0, 0.05)",
    text: "#666",
  },
};

// Options pour le mode sombre
export const darkModeOverrides = {
  antd: {
    components: {
      Card: {
        backgroundColor: "#252525",
        color: "rgba(255, 255, 255, 0.85)",
      },
      Table: {
        headerBg: "rgba(255, 255, 255, 0.04)",
        headerColor: "rgba(255, 255, 255, 0.85)",
        bodyColor: "rgba(255, 255, 255, 0.65)",
        rowHoverBg: "rgba(255, 255, 255, 0.04)",
      },
    },
  },
  mui: {
    palette: {
      background: {
        paper: "#252525",
      },
      text: {
        primary: "rgba(255, 255, 255, 0.85)",
        secondary: "rgba(255, 255, 255, 0.6)",
      },
      divider: "rgba(255, 255, 255, 0.1)",
    },
  },
  chartjs: {
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.85)",
        },
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "rgba(255, 255, 255, 0.85)",
        bodyColor: "rgba(255, 255, 255, 0.65)",
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.65)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.65)",
        },
      },
    },
  },
  recharts: {
    grid: "rgba(255, 255, 255, 0.1)",
    text: "rgba(255, 255, 255, 0.65)",
  },
};

export default {
  colors,
  antdTheme,
  muiTheme,
  chartStyles,
  darkModeOverrides,
};

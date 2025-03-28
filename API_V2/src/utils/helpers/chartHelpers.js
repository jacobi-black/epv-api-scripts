// Color palette for charts
export const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#82ca9d", // Light Green
];

// Chart dimensions
export const CHART_DIMENSIONS = {
  PIE: {
    height: 400,
    outerRadius: 150,
    innerRadius: 60,
  },
  BAR: {
    height: 400,
  },
};

// Chart options
export const getChartOptions = (type) => {
  switch (type) {
    case "pie":
      return {
        labelLine: false,
        label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
        paddingAngle: 5,
      };
    case "bar":
      return {
        strokeDasharray: "3 3",
      };
    default:
      return {};
  }
};

// Data transformation helpers
export const transformPlatformData = (stats) => {
  return stats?.byPlatform
    ? Object.entries(stats.byPlatform).map(([name, value]) => ({
        name,
        value,
      }))
    : [];
};

export const transformManagedData = (stats) => {
  return [
    { name: "Managed", value: stats?.managed || 0 },
    { name: "Unmanaged", value: stats?.unmanaged || 0 },
  ];
};

export const transformSafeData = (stats) => {
  return stats?.bySafe
    ? Object.entries(stats.bySafe)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name,
          value,
        }))
    : [];
};

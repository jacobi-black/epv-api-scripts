import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Label,
  Brush,
} from "recharts";
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from "@mui/material";

/**
 * Composant de graphique linéaire amélioré avec référence, annotations et zones de seuil
 */
const EnhancedLineChart = ({
  data = [],
  width = "100%",
  height = 400,
  lines = [],
  xAxisDataKey = "name",
  xAxisLabel = "",
  yAxisLabel = "",
  title = "",
  thresholds = [],
  references = [],
  animate = true,
  showGrid = true,
  brush = false,
  timeRanges = [],
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState(
    timeRanges.length > 0 ? timeRanges[0].value : null
  );

  // Fonction pour filtrer les données selon la plage de temps sélectionnée
  const getFilteredData = () => {
    if (!timeRange) return data;

    const selectedRange = timeRanges.find((range) => range.value === timeRange);
    if (!selectedRange) return data;

    if (typeof selectedRange.filter === "function") {
      return data.filter(selectedRange.filter);
    }

    return data.slice(-selectedRange.value);
  };

  // Données filtrées selon la plage de temps
  const filteredData = getFilteredData();

  // Couleurs pour les lignes
  const getLineColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];

    return colors[index % colors.length];
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: height + 100, width: width }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      {/* Sélecteur de plage temporelle */}
      {timeRanges.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, value) => setTimeRange(value)}
            size="small"
            aria-label="Plage temporelle"
          >
            {timeRanges.map((range) => (
              <ToggleButton key={range.value} value={range.value}>
                {range.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={filteredData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}

          <XAxis
            dataKey={xAxisDataKey}
            label={{
              value: xAxisLabel,
              position: "bottom",
              offset: 0,
            }}
            tick={{ fontSize: 12 }}
          />

          <YAxis
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              offset: 0,
            }}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              boxShadow: theme.shadows[3],
            }}
            formatter={(value, name) => {
              const line = lines.find((l) => l.dataKey === name);
              return [`${value}${line?.unit || ""}`, line?.displayName || name];
            }}
            labelFormatter={(label) => `${xAxisLabel || "Date"}: ${label}`}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => {
              const line = lines.find((l) => l.dataKey === value);
              return line?.displayName || value;
            }}
          />

          {/* Lignes de données */}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.displayName || line.dataKey}
              stroke={line.color || getLineColor(index)}
              strokeWidth={2}
              dot={line.dot || { r: 3 }}
              activeDot={line.activeDot || { r: 5 }}
              isAnimationActive={animate}
              animationDuration={1000}
            />
          ))}

          {/* Lignes de référence verticales */}
          {references
            .filter((ref) => ref.axis === "x")
            .map((reference, index) => (
              <ReferenceLine
                key={`xref-${index}`}
                x={reference.value}
                stroke={reference.color || theme.palette.text.secondary}
                strokeDasharray={reference.dashArray || "3 3"}
                label={
                  reference.label && {
                    value: reference.label,
                    position: reference.labelPosition || "top",
                    fill: reference.labelColor || theme.palette.text.primary,
                    fontSize: 12,
                  }
                }
              />
            ))}

          {/* Lignes de référence horizontales */}
          {references
            .filter((ref) => ref.axis === "y")
            .map((reference, index) => (
              <ReferenceLine
                key={`yref-${index}`}
                y={reference.value}
                stroke={reference.color || theme.palette.text.secondary}
                strokeDasharray={reference.dashArray || "3 3"}
                label={
                  reference.label && {
                    value: reference.label,
                    position: reference.labelPosition || "right",
                    fill: reference.labelColor || theme.palette.text.primary,
                    fontSize: 12,
                  }
                }
              />
            ))}

          {/* Zones de seuil */}
          {thresholds.map((threshold, index) => (
            <ReferenceArea
              key={`threshold-${index}`}
              y1={threshold.y1}
              y2={threshold.y2}
              x1={threshold.x1}
              x2={threshold.x2}
              fill={threshold.color || "rgba(255, 0, 0, 0.1)"}
              fillOpacity={threshold.opacity || 0.3}
              label={
                threshold.label && {
                  value: threshold.label,
                  position: threshold.labelPosition || "insideTopRight",
                  fill:
                    threshold.labelColor ||
                    theme.palette.getContrastText(
                      threshold.color || "rgba(255, 0, 0, 0.1)"
                    ),
                  fontSize: 12,
                }
              }
            />
          ))}

          {/* Brosse de sélection temporelle */}
          {brush && (
            <Brush
              dataKey={xAxisDataKey}
              height={30}
              stroke={theme.palette.primary.main}
              tickFormatter={(tick) => {
                // Formater le tick si c'est une date
                if (tick instanceof Date) {
                  return new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  }).format(tick);
                }
                return tick;
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default EnhancedLineChart;

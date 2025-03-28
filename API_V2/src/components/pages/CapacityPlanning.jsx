import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  CircularProgress,
  Button,
  Slider,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Icons
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Capacity Planning Component
const CapacityPlanning = () => {
  const { accountsData, safesData, systemHealthData, loading, error } =
    useData();
  const navigate = useNavigate();

  // State for growth planning settings
  const [growthRate, setGrowthRate] = useState(15); // Default 15% annual growth
  const [planningPeriod, setPlanningPeriod] = useState(36); // Default 36 months
  const [initialAccountCount, setInitialAccountCount] = useState(0);
  const [growthModel, setGrowthModel] = useState("linear"); // Linear or exponential
  const [forecastData, setForecastData] = useState([]);

  // Calculate the initial account count and prepare forecast data
  useEffect(() => {
    if (accountsData) {
      setInitialAccountCount(accountsData.length);
    }
  }, [accountsData]);

  // Generate forecast data when parameters change
  useEffect(() => {
    if (initialAccountCount > 0) {
      const newForecastData = [];
      const monthlyGrowthRate = growthRate / 12 / 100; // Convert annual percentage to monthly decimal

      for (let month = 0; month <= planningPeriod; month++) {
        let accountCount;

        if (growthModel === "linear") {
          // Linear growth: constant number of accounts added each month
          accountCount =
            initialAccountCount +
            initialAccountCount * monthlyGrowthRate * month;
        } else {
          // Exponential growth: percentage growth compounded monthly
          accountCount =
            initialAccountCount * Math.pow(1 + monthlyGrowthRate, month);
        }

        newForecastData.push({
          month,
          accounts: Math.round(accountCount),
          label: `Month ${month}`,
        });
      }

      setForecastData(newForecastData);
    }
  }, [initialAccountCount, growthRate, planningPeriod, growthModel]);

  // If loading, show loading indicator
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no data, show message to upload
  if (!accountsData && !safesData && !systemHealthData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Capacity Planning
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          No data available. Please upload data first to enable capacity
          planning.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate("/upload")}
        >
          Upload Data
        </Button>
      </Box>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Capacity Planning
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Current status metrics
  const currentAccounts = accountsData ? accountsData.length : 0;
  const currentSafes = safesData
    ? [...new Set(safesData.map((item) => item.SafeName || item.Safe))].length
    : 0;
  const currentComponents = systemHealthData ? systemHealthData.length : 0;

  // Projection of key milestones
  const getMonthForAccountCount = (targetCount) => {
    if (!forecastData.length) return "N/A";
    const milestone = forecastData.find((data) => data.accounts >= targetCount);
    return milestone ? `Month ${milestone.month}` : "Beyond forecast period";
  };

  const doubledAccountsMonth = getMonthForAccountCount(currentAccounts * 2);
  const tripledAccountsMonth = getMonthForAccountCount(currentAccounts * 3);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Capacity Planning
      </Typography>

      {/* Current Status Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Current Environment
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Accounts
                </Typography>
                <Typography variant="h3" color="primary">
                  {currentAccounts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Safes
                </Typography>
                <Typography variant="h3" color="primary">
                  {currentSafes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Components
                </Typography>
                <Typography variant="h3" color="primary">
                  {currentComponents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Growth Planning Settings */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Growth Planning Settings</Typography>
          <Tooltip title="Adjust these parameters to model different growth scenarios for your CyberArk environment.">
            <IconButton size="small">
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Annual Growth Rate
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Slider
                value={growthRate}
                onChange={(_, newValue) => setGrowthRate(newValue)}
                min={1}
                max={50}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{ mr: 2, flexGrow: 1 }}
              />
              <TextField
                value={growthRate}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setGrowthRate(Math.min(Math.max(value, 1), 50));
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                sx={{ width: 100 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Forecast Period
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Slider
                value={planningPeriod}
                onChange={(_, newValue) => setPlanningPeriod(newValue)}
                min={12}
                max={60}
                step={6}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} months`}
                sx={{ mr: 2, flexGrow: 1 }}
              />
              <TextField
                value={planningPeriod}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 12;
                  setPlanningPeriod(Math.min(Math.max(value, 12), 60));
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">months</InputAdornment>
                  ),
                }}
                sx={{ width: 120 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="growth-model-label">Growth Model</InputLabel>
              <Select
                labelId="growth-model-label"
                value={growthModel}
                label="Growth Model"
                onChange={(e) => setGrowthModel(e.target.value)}
              >
                <MenuItem value="linear">Linear Growth</MenuItem>
                <MenuItem value="exponential">Exponential Growth</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Initial Account Count"
              type="number"
              value={initialAccountCount}
              onChange={(e) =>
                setInitialAccountCount(parseInt(e.target.value) || 0)
              }
              InputProps={{
                readOnly: !!accountsData,
              }}
              helperText={
                accountsData
                  ? "From uploaded data"
                  : "Enter your starting account count"
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Growth Forecast Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Account Growth Forecast
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={forecastData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{
                  value: "Months",
                  position: "insideBottomRight",
                  offset: -10,
                }}
              />
              <YAxis
                label={{
                  value: "Account Count",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ChartTooltip
                formatter={(value) => [`${value} accounts`, "Projected"]}
                labelFormatter={(value) => `Month ${value}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accounts"
                name="Projected Accounts"
                stroke="#1976d2"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Key Milestones */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Key Growth Milestones
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Double Current Size" />
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {doubledAccountsMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected time to reach {currentAccounts * 2} accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Triple Current Size" />
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {tripledAccountsMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected time to reach {currentAccounts * 3} accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Year 3 Projection" />
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {forecastData[36]?.accounts.toLocaleString() || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected accounts at month 36
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Capacity Planning Recommendations
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Based on your projected growth rate of {growthRate}% annually,
            consider the following recommendations.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                <CardHeader title="Short Term (0-12 months)" />
                <Divider />
                <CardContent>
                  <Typography paragraph>
                    • Ensure CPM servers can handle{" "}
                    {forecastData[12]?.accounts || "N/A"} accounts
                  </Typography>
                  <Typography paragraph>
                    • Plan for at least{" "}
                    {Math.ceil(
                      (currentSafes * forecastData[12]?.accounts) /
                        currentAccounts
                    ) || "N/A"}{" "}
                    safes
                  </Typography>
                  <Typography paragraph>
                    • Validate that current hardware meets performance
                    requirements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                <CardHeader title="Medium Term (13-24 months)" />
                <Divider />
                <CardContent>
                  <Typography paragraph>
                    • Consider adding additional CPM instances to distribute
                    load
                  </Typography>
                  <Typography paragraph>
                    • Implement account lifecycle management policies
                  </Typography>
                  <Typography paragraph>
                    • Review and optimize PSM resources for increased session
                    volume
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", border: "1px solid #e0e0e0" }}>
                <CardHeader title="Long Term (25+ months)" />
                <Divider />
                <CardContent>
                  <Typography paragraph>
                    • Plan for infrastructure scaling to support{" "}
                    {forecastData[36]?.accounts || "N/A"} accounts
                  </Typography>
                  <Typography paragraph>
                    • Consider distributed architecture and load balancing
                  </Typography>
                  <Typography paragraph>
                    • Implement automated account onboarding processes to handle
                    volume
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CapacityPlanning;

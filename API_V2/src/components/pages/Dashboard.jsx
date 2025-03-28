import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../../utils/DataContext";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AssessmentIcon from "@mui/icons-material/Assessment";

// Dashboard summary component
const DashboardSummary = ({
  accountsData,
  safesData,
  systemHealthData,
  lastUpdated,
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Grid container spacing={3}>
      {/* Accounts Summary Card */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            height: "100%",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardHeader
            avatar={<AccountCircleIcon color="primary" />}
            title="Accounts"
            titleTypographyProps={{ variant: "h6" }}
          />
          <CardContent>
            <Typography
              variant="h3"
              component="div"
              align="center"
              gutterBottom
            >
              {accountsData ? accountsData.length : "No Data"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                component={Link}
                to="/accounts"
                variant="outlined"
                color="primary"
                fullWidth
                disabled={!accountsData}
              >
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Safes Summary Card */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            height: "100%",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardHeader
            avatar={<LockIcon color="primary" />}
            title="Safes"
            titleTypographyProps={{ variant: "h6" }}
          />
          <CardContent>
            <Typography
              variant="h3"
              component="div"
              align="center"
              gutterBottom
            >
              {safesData
                ? [
                    ...new Set(
                      safesData.map((item) => item.SafeName || item.Safe)
                    ),
                  ].length
                : "No Data"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                component={Link}
                to="/safes"
                variant="outlined"
                color="primary"
                fullWidth
                disabled={!safesData}
              >
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* System Health Summary Card */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            height: "100%",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardHeader
            avatar={<HealthAndSafetyIcon color="primary" />}
            title="System Components"
            titleTypographyProps={{ variant: "h6" }}
          />
          <CardContent>
            <Typography
              variant="h3"
              component="div"
              align="center"
              gutterBottom
            >
              {systemHealthData ? systemHealthData.length : "No Data"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                component={Link}
                to="/system-health"
                variant="outlined"
                color="primary"
                fullWidth
                disabled={!systemHealthData}
              >
                View Details
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Last Updated Info */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Last updated: {formatDate(lastUpdated)}
            </Typography>
            <Button
              component={Link}
              to="/upload"
              startIcon={<UploadFileIcon />}
              color="primary"
            >
              Upload New Data
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Quick Link Card Component
const QuickLinkCard = ({ title, description, icon, linkTo, color }) => {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
        },
        borderLeft: `4px solid ${color}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button
          component={Link}
          to={linkTo}
          variant="contained"
          color="primary"
          size="small"
          sx={{ mt: "auto" }}
        >
          Go to {title}
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const {
    accountsData,
    safesData,
    systemHealthData,
    loading,
    error,
    lastUpdated,
  } = useData();

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

  // Show a message if no data is loaded
  const hasData = accountsData || safesData || systemHealthData;
  if (!hasData && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          CyberArk Capacity Planning Dashboard
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome to the CyberArk Capacity Planning Dashboard. No data has been
          uploaded yet.
        </Alert>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Getting Started
          </Typography>
          <Typography paragraph>
            This dashboard helps you analyze your CyberArk environment and plan
            for future capacity needs. To begin, upload your CSV data files
            generated from the CyberArk EPV REST API scripts.
          </Typography>
          <Button
            component={Link}
            to="/upload"
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            sx={{ mt: 2 }}
          >
            Upload Data Files
          </Button>
        </Paper>
      </Box>
    );
  }

  // Show error if there is one
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  // Exemple de données pour le graphique
  const data = [
    { name: "Jan", accounts: 400 },
    { name: "Feb", accounts: 450 },
    { name: "Mar", accounts: 500 },
    { name: "Apr", accounts: 550 },
    { name: "May", accounts: 600 },
    { name: "Jun", accounts: 650 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Graphique principal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des comptes
            </Typography>
            <LineChart width={800} height={400} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accounts" stroke="#1976d2" />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

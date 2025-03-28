import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Rating,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import { useData } from "../../utils/DataContext";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutomationIcon from "@mui/icons-material/AutoFixHigh";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";

// Enregistrer les éléments requis pour Chart.js
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const AdoptionEfficiency = ({ subview }) => {
  const dataContext = useData();
  const { usersData, usageData } = dataContext;
  const [adoptionStats, setAdoptionStats] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [workflowData, setWorkflowData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState(null);

  // Vérifier si les données nécessaires sont disponibles - Pour la démo, on va simuler avoir des données
  const hasRequiredData = true; // usersData?.length > 0 || usageData?.length > 0;

  // Générer les statistiques d'adoption et d'efficacité
  useEffect(() => {
    if (hasRequiredData) {
      // Statistiques simulées
      const stats = {
        totalUsers: 248,
        activeUsers: 187,
        occasionalUsers: 42,
        inactiveUsers: 19,
        activationRate: 75.4, // pourcentage
        growthRate: 12.8, // pourcentage
        totalDepartments: 8,
        departmentsAbove80Percent: 5,
        averageAccessTime: 2.8, // en minutes
        accessTimeReduction: 68, // pourcentage par rapport à avant
        automatedWorkflows: 23,
        manualWorkflows: 12,
        workflowTimeReduction: 72, // pourcentage par rapport à avant
        satisfactionScore: 4.2, // sur 5
        satisfactionTrend: 0.8, // augmentation en points par rapport à l'année précédente
        npsScore: 42, // Net Promoter Score
        usersByDept: {
          IT: 58,
          Finance: 48,
          RH: 32,
          Direction: 14,
          Opérations: 42,
          Marketing: 22,
          Commercial: 18,
          Support: 14,
        },
        adoptionByDept: {
          IT: 92,
          Finance: 85,
          RH: 68,
          Direction: 62,
          Opérations: 78,
          Marketing: 55,
          Commercial: 48,
          Support: 72,
        },
        activitiesByMonth: [
          1250, 1380, 1470, 1520, 1650, 1720, 1850, 1920, 2050, 2180, 2240,
          2320,
        ],
        accessTimeByMonth: [
          8.2, 7.5, 6.8, 5.9, 5.2, 4.6, 4.1, 3.8, 3.5, 3.2, 3.0, 2.8,
        ],
      };

      // Données par département simulées
      const departments = Object.entries(stats.usersByDept).map(
        ([name, users], i) => {
          const adoption = stats.adoptionByDept[name];
          return {
            name,
            users,
            adopters: Math.floor((users * adoption) / 100),
            adoptionRate: adoption,
            activeUsers: Math.floor(
              users * (adoption / 100) * (Math.random() * 0.2 + 0.8)
            ),
            growthLastMonth: Math.floor(Math.random() * 20 - 5), // entre -5% et +15%
            avgTimeToAccess: Math.floor(Math.random() * 5) + 1, // 1-6 minutes
            keyUsers: Math.floor(users * 0.15), // ~15% des utilisateurs sont des "key users"
            satisfaction: (3.5 + Math.random() * 1.5).toFixed(1), // entre 3.5 et 5.0
            leadName: [
              "John Doe",
              "Jane Smith",
              "Robert Johnson",
              "Emma Wilson",
              "Michael Brown",
              "Sarah Davis",
              "David Miller",
              "Lisa Wilson",
            ][i],
          };
        }
      );

      // Workflows automatisés simulés
      const workflows = Array(stats.automatedWorkflows)
        .fill()
        .map((_, i) => {
          const types = [
            "Approbation",
            "Onboarding",
            "Rotation",
            "Audit",
            "Reporting",
            "Provisioning",
          ];
          const type = types[Math.floor(Math.random() * types.length)];
          const depts = Object.keys(stats.usersByDept);
          const dept = depts[Math.floor(Math.random() * depts.length)];
          const timeBeforeMinutes = Math.floor(Math.random() * 120) + 30; // 30-150 minutes avant
          const timeAfterMinutes = Math.floor(
            timeBeforeMinutes * (1 - stats.workflowTimeReduction / 100)
          );
          const savingsPercent = Math.floor(
            ((timeBeforeMinutes - timeAfterMinutes) / timeBeforeMinutes) * 100
          );

          return {
            id: `WF-${1000 + i}`,
            name: `${type} ${Math.floor(Math.random() * 100)}`,
            description: `Workflow de ${type.toLowerCase()} pour le département ${dept}`,
            type,
            department: dept,
            implementationDate: new Date(
              Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            usageCount: Math.floor(Math.random() * 500) + 50,
            timeBeforeMinutes,
            timeAfterMinutes,
            savingsPercent,
            status: Math.random() > 0.9 ? "Maintenance" : "Actif",
            users: Math.floor(Math.random() * 50) + 5,
          };
        });

      // Données de satisfaction simulées
      const satisfaction = {
        overall: stats.satisfactionScore,
        trend: stats.satisfactionTrend,
        nps: stats.npsScore,
        byDepartment: departments.reduce((acc, dept) => {
          acc[dept.name] = parseFloat(dept.satisfaction);
          return acc;
        }, {}),
        byFeature: {
          Interface: 4.5,
          "Facilité d'utilisation": 4.2,
          Performance: 3.8,
          Documentation: 3.4,
          "Support technique": 4.3,
        },
        byMonth: [3.4, 3.5, 3.6, 3.8, 3.9, 4.0, 4.0, 4.1, 4.1, 4.2, 4.2, 4.2],
        comments: [
          {
            id: 1,
            user: "Jean Dupont",
            department: "IT",
            date: "2023-12-15",
            comment:
              "L'interface est intuitive et facile à utiliser. Le temps d'accès a été considérablement réduit.",
            rating: 5,
          },
          {
            id: 2,
            user: "Marie Martin",
            department: "Finance",
            date: "2023-12-10",
            comment:
              "Les rapports automatisés m'ont fait gagner beaucoup de temps. Quelques bugs mineurs à corriger.",
            rating: 4,
          },
          {
            id: 3,
            user: "Pierre Lefevre",
            department: "Opérations",
            date: "2023-12-05",
            comment:
              "La rotation automatique des mots de passe est un énorme avantage. Besoin d'améliorer la documentation.",
            rating: 4,
          },
          {
            id: 4,
            user: "Sophie Bernard",
            department: "RH",
            date: "2023-11-28",
            comment:
              "Le processus d'onboarding est beaucoup plus fluide maintenant. Excellent travail!",
            rating: 5,
          },
          {
            id: 5,
            user: "Thomas Moreau",
            department: "Commercial",
            date: "2023-11-22",
            comment:
              "Temps de chargement parfois lent. Le support technique est très réactif.",
            rating: 3,
          },
        ],
      };

      setAdoptionStats(stats);
      setDepartmentData(departments);
      setWorkflowData(workflows);
      setSatisfactionData(satisfaction);
    }
  }, [hasRequiredData]);

  if (!hasRequiredData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Données insuffisantes pour afficher le dashboard d'efficacité et
        adoption. Veuillez importer les fichiers d'utilisateurs et
        d'utilisation.
      </Alert>
    );
  }

  // Préparer les données pour les graphiques
  const adoptionByDeptData = {
    labels: departmentData ? departmentData.map((d) => d.name) : [],
    datasets: [
      {
        label: "Taux d'adoption (%)",
        data: departmentData ? departmentData.map((d) => d.adoptionRate) : [],
        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#ff9800",
          "#9c27b0",
          "#f44336",
          "#00bcd4",
          "#ffc107",
          "#607d8b",
        ],
        borderWidth: 1,
      },
    ],
  };

  const usersByDeptData = {
    labels: departmentData ? departmentData.map((d) => d.name) : [],
    datasets: [
      {
        label: "Nombre d'utilisateurs",
        data: departmentData ? departmentData.map((d) => d.users) : [],
        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#ff9800",
          "#9c27b0",
          "#f44336",
          "#00bcd4",
          "#ffc107",
          "#607d8b",
        ],
        borderWidth: 1,
      },
    ],
  };

  const activityTrendData = {
    labels: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
    datasets: [
      {
        label: "Activités mensuelles",
        data: adoptionStats?.activitiesByMonth || [],
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.3,
      },
    ],
  };

  const accessTimeTrendData = {
    labels: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
    datasets: [
      {
        label: "Temps d'accès moyen (minutes)",
        data: adoptionStats?.accessTimeByMonth || [],
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.3,
      },
    ],
  };

  const satisfactionChartData = {
    labels: Object.keys(satisfactionData?.byFeature || {}),
    datasets: [
      {
        label: "Satisfaction par fonctionnalité",
        data: Object.values(satisfactionData?.byFeature || {}),
        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#ff9800",
          "#f44336",
          "#9c27b0",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Logique spécifique en fonction de la sous-vue
  const renderSubview = () => {
    switch (subview) {
      case "department":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Adoption par Département
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Vue détaillée par département
                  </Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Département</TableCell>
                          <TableCell>Responsable</TableCell>
                          <TableCell align="right">Utilisateurs</TableCell>
                          <TableCell align="right">Adopteurs</TableCell>
                          <TableCell>Taux d'adoption</TableCell>
                          <TableCell>Croissance (M-1)</TableCell>
                          <TableCell>Temps d'accès moyen</TableCell>
                          <TableCell align="right">Utilisateurs clés</TableCell>
                          <TableCell>Satisfaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departmentData.map((dept) => (
                          <TableRow
                            key={dept.name}
                            sx={{
                              bgcolor:
                                dept.adoptionRate < 50
                                  ? "rgba(244, 67, 54, 0.1)"
                                  : dept.adoptionRate > 80
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "inherit",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                                {dept.name}
                              </Box>
                            </TableCell>
                            <TableCell>{dept.leadName}</TableCell>
                            <TableCell align="right">{dept.users}</TableCell>
                            <TableCell align="right">{dept.adopters}</TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box sx={{ width: "100%", mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={dept.adoptionRate}
                                    color={
                                      dept.adoptionRate < 50
                                        ? "error"
                                        : dept.adoptionRate < 70
                                        ? "warning"
                                        : "success"
                                    }
                                    sx={{ height: 8, borderRadius: 5 }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >{`${dept.adoptionRate}%`}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`${dept.growthLastMonth > 0 ? "+" : ""}${
                                  dept.growthLastMonth
                                }%`}
                                color={
                                  dept.growthLastMonth > 5
                                    ? "success"
                                    : dept.growthLastMonth > 0
                                    ? "info"
                                    : "error"
                                }
                              />
                            </TableCell>
                            <TableCell>{dept.avgTimeToAccess} min</TableCell>
                            <TableCell align="right">{dept.keyUsers}</TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Rating
                                  value={parseFloat(dept.satisfaction)}
                                  precision={0.5}
                                  size="small"
                                  readOnly
                                />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {dept.satisfaction}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Taux d'adoption par département
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Bar
                      data={adoptionByDeptData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: "Taux d'adoption (%)",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Répartition des utilisateurs par département
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Pie data={usersByDeptData} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "operational":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Efficacité Opérationnelle
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Workflows automatisés
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Département</TableCell>
                          <TableCell>Date d'implémentation</TableCell>
                          <TableCell align="right">Utilisations</TableCell>
                          <TableCell align="right">Utilisateurs</TableCell>
                          <TableCell>Temps avant</TableCell>
                          <TableCell>Temps après</TableCell>
                          <TableCell>Gain</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {workflowData.map((workflow) => (
                          <TableRow key={workflow.id}>
                            <TableCell>{workflow.name}</TableCell>
                            <TableCell>{workflow.type}</TableCell>
                            <TableCell>{workflow.department}</TableCell>
                            <TableCell>{workflow.implementationDate}</TableCell>
                            <TableCell align="right">
                              {workflow.usageCount}
                            </TableCell>
                            <TableCell align="right">
                              {workflow.users}
                            </TableCell>
                            <TableCell>
                              {workflow.timeBeforeMinutes} min
                            </TableCell>
                            <TableCell>
                              {workflow.timeAfterMinutes} min
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={`-${workflow.savingsPercent}%`}
                                color={
                                  workflow.savingsPercent > 80
                                    ? "success"
                                    : workflow.savingsPercent > 50
                                    ? "info"
                                    : "warning"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={workflow.status}
                                color={
                                  workflow.status === "Actif"
                                    ? "success"
                                    : "warning"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution du temps d'accès
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Line
                      data={accessTimeTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Temps (minutes)",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Gains en temps par type de workflow
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Bar
                      data={{
                        labels: [
                          "Approbation",
                          "Onboarding",
                          "Rotation",
                          "Audit",
                          "Reporting",
                          "Provisioning",
                        ],
                        datasets: [
                          {
                            label: "Avant automation (min)",
                            data: [45, 120, 60, 90, 40, 75],
                            backgroundColor: "#f44336",
                          },
                          {
                            label: "Après automation (min)",
                            data: [10, 15, 5, 20, 5, 12],
                            backgroundColor: "#4caf50",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Temps (minutes)",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Type de workflow",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "satisfaction":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Satisfaction Utilisateurs
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Commentaires récents
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Utilisateur</TableCell>
                          <TableCell>Département</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Évaluation</TableCell>
                          <TableCell>Commentaire</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {satisfactionData?.comments.map((comment) => (
                          <TableRow key={comment.id}>
                            <TableCell>{comment.user}</TableCell>
                            <TableCell>{comment.department}</TableCell>
                            <TableCell>{comment.date}</TableCell>
                            <TableCell>
                              <Rating
                                value={comment.rating}
                                size="small"
                                readOnly
                              />
                            </TableCell>
                            <TableCell>{comment.comment}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Satisfaction par fonctionnalité
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Bar
                      data={satisfactionChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 5,
                            title: {
                              display: true,
                              text: "Évaluation (sur 5)",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Évolution de la satisfaction
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Line
                      data={{
                        labels: [
                          "Jan",
                          "Fév",
                          "Mar",
                          "Avr",
                          "Mai",
                          "Juin",
                          "Juil",
                          "Août",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Déc",
                        ],
                        datasets: [
                          {
                            label: "Satisfaction globale",
                            data: satisfactionData?.byMonth || [],
                            borderColor: "#2196f3",
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                            tension: 0.3,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 5,
                            title: {
                              display: true,
                              text: "Satisfaction (sur 5)",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    Dashboard d'Efficacité et d'Adoption
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Analyse de l'adoption de CyberArk et des gains d'efficacité
                    opérationnelle.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e8f5e9" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PeopleIcon
                        sx={{ fontSize: 40, mr: 2, color: "#4caf50" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Taux d'adoption global
                        </Typography>
                        <Typography variant="h4">
                          {adoptionStats?.activationRate || "-"}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e3f2fd" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TrendingUpIcon
                        sx={{ fontSize: 40, mr: 2, color: "#2196f3" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Croissance de l'adoption
                        </Typography>
                        <Typography variant="h4">
                          +{adoptionStats?.growthRate || "-"}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#fff8e1" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 40, mr: 2, color: "#ff9800" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Temps d'accès moyen
                        </Typography>
                        <Typography variant="h4">
                          {adoptionStats?.averageAccessTime || "-"} min
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#fce4ec" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <SentimentSatisfiedIcon
                        sx={{ fontSize: 40, mr: 2, color: "#e91e63" }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Satisfaction utilisateurs
                        </Typography>
                        <Typography variant="h4">
                          {satisfactionData?.overall || "-"}/5
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tendance d'activité mensuelle
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <Line
                      data={activityTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Nombre d'activités",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Adoption par département
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Doughnut
                      data={adoptionByDeptData}
                      options={{
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `${context.label}: ${context.raw}%`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top départements par adoption
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Département</TableCell>
                          <TableCell>Taux d'adoption</TableCell>
                          <TableCell>Utilisateurs actifs</TableCell>
                          <TableCell>Satisfaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departmentData
                          .sort((a, b) => b.adoptionRate - a.adoptionRate)
                          .slice(0, 5)
                          .map((dept) => (
                            <TableRow key={dept.name}>
                              <TableCell>{dept.name}</TableCell>
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Box sx={{ width: "100%", mr: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={dept.adoptionRate}
                                      color={
                                        dept.adoptionRate < 50
                                          ? "error"
                                          : dept.adoptionRate < 70
                                          ? "warning"
                                          : "success"
                                      }
                                      sx={{ height: 8, borderRadius: 5 }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >{`${dept.adoptionRate}%`}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>{dept.activeUsers}</TableCell>
                              <TableCell>
                                <Rating
                                  value={parseFloat(dept.satisfaction)}
                                  precision={0.5}
                                  size="small"
                                  readOnly
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top workflows par gain d'efficacité
                  </Typography>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Workflow</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Gain de temps</TableCell>
                          <TableCell>Utilisations</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {workflowData
                          .sort((a, b) => b.savingsPercent - a.savingsPercent)
                          .slice(0, 5)
                          .map((workflow) => (
                            <TableRow key={workflow.id}>
                              <TableCell>{workflow.name}</TableCell>
                              <TableCell>{workflow.type}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={`-${workflow.savingsPercent}%`}
                                  color={
                                    workflow.savingsPercent > 80
                                      ? "success"
                                      : workflow.savingsPercent > 50
                                      ? "info"
                                      : "warning"
                                  }
                                />
                              </TableCell>
                              <TableCell>{workflow.usageCount}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  return <Box>{renderSubview()}</Box>;
};

export default AdoptionEfficiency;

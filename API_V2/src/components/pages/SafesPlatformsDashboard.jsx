import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Table,
  Tabs,
  Statistic,
  Badge,
  Button,
  Select,
  Tooltip,
  Divider,
  Alert,
  Tag,
  List,
  Empty,
} from "antd";
import {
  DatabaseOutlined,
  AppstoreOutlined,
  SecurityScanOutlined,
  SafetyOutlined,
  UserOutlined,
  DownloadOutlined,
  PieChartOutlined,
  TableOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { ChartjsLine, ChartjsPie, ChartjsBar } from "../charts";
import { Helmet } from "react-helmet";
import { useData } from "../../utils/DataContext";

const { TabPane } = Tabs;
const { Option } = Select;

const SafesPlatformsDashboard = ({ subview }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState(subview || "1");
  const [safesFilter, setSafesFilter] = useState("all");
  const [platformsFilter, setPlatformsFilter] = useState("all");

  const dataContext = useData();
  const { safesData, platformsData, accountsData, isDemoMode } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData =
    (safesData && safesData.length > 0) ||
    (platformsData && platformsData.length > 0) ||
    isDemoMode;

  // Vérifie le mode sombre selon les préférences système
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Simuler le chargement des données
  useEffect(() => {
    const fetchData = async () => {
      if (hasRequiredData) {
        // Dans une implémentation réelle, ces données proviendraient d'une API
        setTimeout(() => {
          setDashboardData(mockDashboardData);
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, safesFilter, platformsFilter, hasRequiredData]);

  // Données fictives pour le dashboard
  const mockDashboardData = {
    safesOverview: {
      totalSafes: 156,
      secureSafes: 142,
      unsecureSafes: 14,
      totalAccounts: 3872,
      safesWithIssues: 8,
      averageAccountsPerSafe: 24.8,
      capacityUsage: 67,
    },
    platformsOverview: {
      totalPlatforms: 48,
      activePlatforms: 42,
      inactivePlatforms: 6,
      platformsWithIssues: 3,
      mostUsedPlatform: "Windows Server",
      accountsOnMostUsedPlatform: 876,
    },
    safesDistribution: [
      { name: "Privileged Accounts", value: 36, color: "#1890ff" },
      { name: "Service Accounts", value: 42, color: "#52c41a" },
      { name: "Application Accounts", value: 28, color: "#722ed1" },
      { name: "Shared Accounts", value: 20, color: "#faad14" },
      { name: "Emergency Access", value: 12, color: "#f5222d" },
      { name: "Other", value: 18, color: "#13c2c2" },
    ],
    platformsDistribution: [
      { name: "Windows", value: 16, color: "#1890ff" },
      { name: "Unix/Linux", value: 12, color: "#52c41a" },
      { name: "Database", value: 8, color: "#722ed1" },
      { name: "Network Devices", value: 6, color: "#faad14" },
      { name: "Cloud", value: 4, color: "#f5222d" },
      { name: "Other", value: 2, color: "#13c2c2" },
    ],
    accountsPerPlatformType: {
      labels: [
        "Windows",
        "Unix/Linux",
        "Database",
        "Network",
        "Cloud",
        "Other",
      ],
      datasets: [
        {
          label: "Nombre de comptes",
          data: [1428, 986, 572, 346, 298, 242],
          backgroundColor: [
            "rgba(24, 144, 255, 0.6)",
            "rgba(82, 196, 26, 0.6)",
            "rgba(114, 46, 209, 0.6)",
            "rgba(250, 173, 20, 0.6)",
            "rgba(245, 34, 45, 0.6)",
            "rgba(19, 194, 194, 0.6)",
          ],
        },
      ],
    },
    accountsByContentType: {
      labels: ["Password", "SSH Key", "Certificate", "API Key", "Other"],
      datasets: [
        {
          label: "Nombre de comptes",
          data: [2682, 546, 324, 186, 134],
          backgroundColor: [
            "rgba(24, 144, 255, 0.6)",
            "rgba(82, 196, 26, 0.6)",
            "rgba(114, 46, 209, 0.6)",
            "rgba(250, 173, 20, 0.6)",
            "rgba(245, 34, 45, 0.6)",
          ],
        },
      ],
    },
    topSafes: [
      {
        id: 1,
        name: "Windows-Admin-Accounts",
        accounts: 142,
        status: "Healthy",
        lastAccessed: "2023-12-01",
        creator: "System Admin",
      },
      {
        id: 2,
        name: "Unix-Root-Accounts",
        accounts: 98,
        status: "Healthy",
        lastAccessed: "2023-12-02",
        creator: "System Admin",
      },
      {
        id: 3,
        name: "Database-Admin-Accounts",
        accounts: 86,
        status: "Warning",
        lastAccessed: "2023-11-28",
        creator: "DBA Team",
      },
      {
        id: 4,
        name: "Network-Devices",
        accounts: 72,
        status: "Healthy",
        lastAccessed: "2023-11-30",
        creator: "Network Team",
      },
      {
        id: 5,
        name: "Emergency-Access",
        accounts: 24,
        status: "Critical",
        lastAccessed: "2023-10-15",
        creator: "CISO Office",
      },
      {
        id: 6,
        name: "Service-Accounts-Prod",
        accounts: 156,
        status: "Healthy",
        lastAccessed: "2023-12-01",
        creator: "Operations Team",
      },
      {
        id: 7,
        name: "API-Keys",
        accounts: 48,
        status: "Warning",
        lastAccessed: "2023-11-20",
        creator: "DevOps Team",
      },
      {
        id: 8,
        name: "Cloud-Admin-Accounts",
        accounts: 62,
        status: "Healthy",
        lastAccessed: "2023-11-29",
        creator: "Cloud Team",
      },
    ],
    topPlatforms: [
      {
        id: 1,
        name: "Windows Server",
        accounts: 876,
        status: "Active",
        lastUpdated: "2023-12-01",
        version: "1.3.2",
      },
      {
        id: 2,
        name: "Linux Server",
        accounts: 642,
        status: "Active",
        lastUpdated: "2023-11-28",
        version: "1.2.5",
      },
      {
        id: 3,
        name: "Oracle Database",
        accounts: 324,
        status: "Active",
        lastUpdated: "2023-11-15",
        version: "1.1.8",
      },
      {
        id: 4,
        name: "Cisco Devices",
        accounts: 186,
        status: "Issue",
        lastUpdated: "2023-10-30",
        version: "1.0.4",
      },
      {
        id: 5,
        name: "AWS",
        accounts: 152,
        status: "Active",
        lastUpdated: "2023-11-25",
        version: "2.0.1",
      },
      {
        id: 6,
        name: "Azure",
        accounts: 128,
        status: "Active",
        lastUpdated: "2023-11-20",
        version: "1.5.2",
      },
      {
        id: 7,
        name: "MongoDB",
        accounts: 96,
        status: "Inactive",
        lastUpdated: "2023-09-15",
        version: "0.9.4",
      },
      {
        id: 8,
        name: "F5 Load Balancers",
        accounts: 42,
        status: "Active",
        lastUpdated: "2023-11-10",
        version: "1.1.3",
      },
    ],
    safesActivityTrend: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Créations",
          data: [5, 7, 4, 6, 3, 8, 5, 9, 4, 6, 10, 7],
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
        },
        {
          label: "Suppressions",
          data: [2, 1, 3, 1, 0, 2, 1, 2, 0, 1, 2, 1],
          borderColor: "#f5222d",
          backgroundColor: "rgba(245, 34, 45, 0.2)",
        },
        {
          label: "Modifications",
          data: [12, 15, 10, 14, 18, 16, 21, 19, 17, 22, 25, 20],
          borderColor: "#52c41a",
          backgroundColor: "rgba(82, 196, 26, 0.2)",
        },
      ],
    },
    accountsGrowthByPlatform: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Windows",
          data: [
            820, 846, 880, 906, 932, 968, 1010, 1056, 1102, 1210, 1320, 1428,
          ],
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
        },
        {
          label: "Unix/Linux",
          data: [620, 642, 660, 686, 710, 738, 768, 798, 830, 880, 930, 986],
          borderColor: "#52c41a",
          backgroundColor: "rgba(82, 196, 26, 0.2)",
        },
        {
          label: "Database",
          data: [310, 324, 340, 356, 370, 392, 420, 456, 486, 520, 548, 572],
          borderColor: "#722ed1",
          backgroundColor: "rgba(114, 46, 209, 0.2)",
        },
      ],
    },
    safeIssues: [
      {
        id: 1,
        safe: "Database-Admin-Accounts",
        issue: "Permission inconsistency",
        severity: "Warning",
        createdDate: "2023-11-28",
      },
      {
        id: 2,
        safe: "Emergency-Access",
        issue: "CPM reconciliation failed",
        severity: "Critical",
        createdDate: "2023-11-30",
      },
      {
        id: 3,
        safe: "API-Keys",
        issue: "Quota limit reached",
        severity: "Warning",
        createdDate: "2023-11-25",
      },
      {
        id: 4,
        safe: "Service-Accounts-Dev",
        issue: "Password not rotated",
        severity: "Warning",
        createdDate: "2023-11-22",
      },
      {
        id: 5,
        safe: "Shared-Accounts",
        issue: "Excessive access",
        severity: "Medium",
        createdDate: "2023-11-18",
      },
    ],
    platformIssues: [
      {
        id: 1,
        platform: "Cisco Devices",
        issue: "Connection error",
        severity: "High",
        createdDate: "2023-11-05",
      },
      {
        id: 2,
        platform: "MongoDB",
        issue: "Platform inactive",
        severity: "Medium",
        createdDate: "2023-09-15",
      },
      {
        id: 3,
        platform: "SAP",
        issue: "Version outdated",
        severity: "Low",
        createdDate: "2023-10-20",
      },
    ],
    safesSecurityScores: {
      labels: ["90-100%", "80-89%", "70-79%", "60-69%", "< 60%"],
      datasets: [
        {
          label: "Nombre de safes",
          data: [86, 42, 18, 6, 4],
          backgroundColor: [
            "rgba(82, 196, 26, 0.6)",
            "rgba(24, 144, 255, 0.6)",
            "rgba(250, 173, 20, 0.6)",
            "rgba(245, 108, 108, 0.6)",
            "rgba(245, 34, 45, 0.6)",
          ],
        },
      ],
    },
  };

  // Colonnes pour le tableau des safes
  const safeColumns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Comptes",
      dataIndex: "accounts",
      key: "accounts",
      sorter: (a, b) => a.accounts - b.accounts,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        let icon = <CheckCircleOutlined />;

        if (status === "Warning") {
          color = "orange";
          icon = <WarningOutlined />;
        } else if (status === "Critical") {
          color = "red";
          icon = <CloseCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: "Healthy", value: "Healthy" },
        { text: "Warning", value: "Warning" },
        { text: "Critical", value: "Critical" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Dernier accès",
      dataIndex: "lastAccessed",
      key: "lastAccessed",
      sorter: (a, b) => new Date(a.lastAccessed) - new Date(b.lastAccessed),
    },
    {
      title: "Créateur",
      dataIndex: "creator",
      key: "creator",
    },
  ];

  // Colonnes pour le tableau des plateformes
  const platformColumns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Comptes",
      dataIndex: "accounts",
      key: "accounts",
      sorter: (a, b) => a.accounts - b.accounts,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        let icon = <CheckCircleOutlined />;

        if (status === "Issue") {
          color = "orange";
          icon = <WarningOutlined />;
        } else if (status === "Inactive") {
          color = "default";
          icon = <CloseCircleOutlined />;
        }

        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
      filters: [
        { text: "Active", value: "Active" },
        { text: "Issue", value: "Issue" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Dernière mise à jour",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
    },
  ];

  // Colonnes pour les problèmes de safes
  const safeIssueColumns = [
    {
      title: "Safe",
      dataIndex: "safe",
      key: "safe",
    },
    {
      title: "Problème",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Sévérité",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => {
        let color = "green";
        if (severity === "Warning") color = "orange";
        if (severity === "Medium") color = "gold";
        if (severity === "High" || severity === "Critical") color = "red";

        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: "Date création",
      dataIndex: "createdDate",
      key: "createdDate",
    },
  ];

  // Colonnes pour les problèmes de plateformes
  const platformIssueColumns = [
    {
      title: "Plateforme",
      dataIndex: "platform",
      key: "platform",
    },
    {
      title: "Problème",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Sévérité",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => {
        let color = "green";
        if (severity === "Low") color = "lime";
        if (severity === "Medium") color = "gold";
        if (severity === "High") color = "red";

        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: "Date création",
      dataIndex: "createdDate",
      key: "createdDate",
    },
  ];

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <SyncOutlined spin style={{ fontSize: 24 }} />
        <p>Chargement des données...</p>
      </div>
    );
  }

  // Si aucune donnée n'est disponible et que nous ne sommes pas en mode démo
  if (!hasRequiredData && !isDemoMode) {
    return (
      <Alert
        message="Données non disponibles"
        description="Aucune donnée de safes ou de plateformes n'est disponible. Veuillez importer des données pour afficher ce dashboard."
        type="info"
        showIcon
        style={{ margin: "20px 0" }}
        action={
          <Button
            type="primary"
            onClick={() => (window.location.href = "/upload")}
          >
            Importer des données
          </Button>
        }
      />
    );
  }

  return (
    <div className="safes-platforms-dashboard">
      <Helmet>
        <title>Safes & Platforms Dashboard | CyberArk Explorer</title>
      </Helmet>

      <div className="dashboard-header">
        <h1>
          <DatabaseOutlined /> Safes & Platforms Dashboard
        </h1>
        <p>
          Vue complète des safes, plateformes, et leurs statistiques associées
        </p>
      </div>

      <div className="dashboard-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: "100%" }}
            >
              <Option value="7d">Derniers 7 jours</Option>
              <Option value="30d">Derniers 30 jours</Option>
              <Option value="90d">Derniers 90 jours</Option>
              <Option value="1y">Dernière année</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              value={safesFilter}
              onChange={setSafesFilter}
              style={{ width: "100%" }}
              placeholder="Filtrer par type de safe"
            >
              <Option value="all">Tous les safes</Option>
              <Option value="privileged">Comptes privilégiés</Option>
              <Option value="service">Comptes de service</Option>
              <Option value="application">Comptes d'application</Option>
              <Option value="shared">Comptes partagés</Option>
              <Option value="emergency">Accès d'urgence</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              value={platformsFilter}
              onChange={setPlatformsFilter}
              style={{ width: "100%" }}
              placeholder="Filtrer par type de plateforme"
            >
              <Option value="all">Toutes les plateformes</Option>
              <Option value="windows">Windows</Option>
              <Option value="unix">Unix/Linux</Option>
              <Option value="database">Base de données</Option>
              <Option value="network">Équipements réseau</Option>
              <Option value="cloud">Cloud</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Exporter
            </Button>
          </Col>
        </Row>
      </div>

      {/* Vue d'ensemble des Safes et Plateformes */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <SafetyOutlined /> Vue d'ensemble des Safes
              </span>
            }
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Total des Safes"
                  value={dashboardData.safesOverview.totalSafes}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Comptes stockés"
                  value={dashboardData.safesOverview.totalAccounts}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Safes avec problèmes"
                  value={dashboardData.safesOverview.safesWithIssues}
                  valueStyle={{
                    color:
                      dashboardData.safesOverview.safesWithIssues > 0
                        ? "#faad14"
                        : "#52c41a",
                  }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Moy. comptes/safe"
                  value={dashboardData.safesOverview.averageAccountsPerSafe}
                  precision={1}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Safes sécurisés"
                  value={`${Math.round(
                    (dashboardData.safesOverview.secureSafes /
                      dashboardData.safesOverview.totalSafes) *
                      100
                  )}%`}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Utilisation capacité"
                  value={`${dashboardData.safesOverview.capacityUsage}%`}
                  valueStyle={{
                    color:
                      dashboardData.safesOverview.capacityUsage > 90
                        ? "#f5222d"
                        : dashboardData.safesOverview.capacityUsage > 75
                        ? "#faad14"
                        : "#52c41a",
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <AppstoreOutlined /> Vue d'ensemble des Plateformes
              </span>
            }
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Total des plateformes"
                  value={dashboardData.platformsOverview.totalPlatforms}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Plateformes actives"
                  value={dashboardData.platformsOverview.activePlatforms}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Plateformes inactives"
                  value={dashboardData.platformsOverview.inactivePlatforms}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="Avec problèmes"
                  value={dashboardData.platformsOverview.platformsWithIssues}
                  valueStyle={{
                    color:
                      dashboardData.platformsOverview.platformsWithIssues > 0
                        ? "#faad14"
                        : "#52c41a",
                  }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Tooltip
                  title={`${dashboardData.platformsOverview.accountsOnMostUsedPlatform} comptes`}
                >
                  <Statistic
                    title="Plateforme la plus utilisée"
                    value={dashboardData.platformsOverview.mostUsedPlatform}
                    valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                  />
                </Tooltip>
              </Col>
              <Col xs={12} sm={8}>
                <Statistic
                  title="% Plateformes actives"
                  value={`${Math.round(
                    (dashboardData.platformsOverview.activePlatforms /
                      dashboardData.platformsOverview.totalPlatforms) *
                      100
                  )}%`}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Graphiques de distribution */}
      <Row gutter={16} className="mt-4">
        <Col xs={24} sm={12}>
          <Card
            title={
              <span>
                <PieChartOutlined /> Distribution des Safes par type
              </span>
            }
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
          >
            <ChartjsPie
              data={{
                labels: dashboardData.safesDistribution.map(
                  (item) => item.name
                ),
                datasets: [
                  {
                    data: dashboardData.safesDistribution.map(
                      (item) => item.value
                    ),
                    backgroundColor: dashboardData.safesDistribution.map(
                      (item) => item.color
                    ),
                  },
                ],
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            title={
              <span>
                <PieChartOutlined /> Distribution des Plateformes par type
              </span>
            }
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
          >
            <ChartjsPie
              data={{
                labels: dashboardData.platformsDistribution.map(
                  (item) => item.name
                ),
                datasets: [
                  {
                    data: dashboardData.platformsDistribution.map(
                      (item) => item.value
                    ),
                    backgroundColor: dashboardData.platformsDistribution.map(
                      (item) => item.color
                    ),
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="dashboard-tabs"
      >
        <TabPane
          tab={
            <span>
              <SafetyOutlined /> Analyse des Safes
            </span>
          }
          key="1"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <TableOutlined /> Top Safes par nombre de comptes
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={dashboardData.topSafes}
                  columns={safeColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="middle"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <BarChartOutlined /> Comptes par type de contenu
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsBar data={dashboardData.accountsByContentType} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <PieChartOutlined /> Scores de sécurité des Safes
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsPie data={dashboardData.safesSecurityScores} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <WarningOutlined /> Problèmes détectés dans les Safes
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                {dashboardData.safeIssues.length > 0 ? (
                  <Table
                    dataSource={dashboardData.safeIssues}
                    columns={safeIssueColumns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                ) : (
                  <Empty description="Aucun problème détecté" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <AppstoreOutlined /> Analyse des Plateformes
            </span>
          }
          key="2"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <TableOutlined /> Top Plateformes par nombre de comptes
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={dashboardData.topPlatforms}
                  columns={platformColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="middle"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <BarChartOutlined /> Comptes par type de plateforme
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsBar data={dashboardData.accountsPerPlatformType} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <WarningOutlined /> Problèmes détectés dans les Plateformes
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                {dashboardData.platformIssues.length > 0 ? (
                  <Table
                    dataSource={dashboardData.platformIssues}
                    columns={platformIssueColumns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                ) : (
                  <Empty description="Aucun problème détecté" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <LineChartOutlined /> Tendances & Activités
            </span>
          }
          key="3"
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <LineChartOutlined /> Activité des Safes (12 derniers mois)
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsLine data={dashboardData.safesActivityTrend} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <LineChartOutlined /> Croissance des comptes par plateforme
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsLine data={dashboardData.accountsGrowthByPlatform} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <InfoCircleOutlined /> Recommandations de sécurité
                  </span>
                }
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <List
                  size="large"
                  bordered={false}
                  dataSource={[
                    "Vérifier les safes ayant des scores de sécurité inférieurs à 70%",
                    "Mettre à jour les plateformes inactives ou avec des versions obsolètes",
                    "Revoir les permissions des safes contenant des comptes d'accès d'urgence",
                    "Optimiser la distribution des comptes dans les safes contenant plus de 100 comptes",
                    "Activer la journalisation d'audit pour tous les safes contenant des comptes privilégiés",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />{" "}
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SafesPlatformsDashboard;

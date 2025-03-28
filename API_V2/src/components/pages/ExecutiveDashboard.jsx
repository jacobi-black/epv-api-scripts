import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Table,
  Tabs,
  Badge,
  Tooltip,
  Select,
  DatePicker,
  Button,
  Alert,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  SecurityScanOutlined,
  LockOutlined,
  FundOutlined,
} from "@ant-design/icons";
import { ChartjsLine, ChartjsBar, ChartjsPie } from "../charts";
import { Helmet } from "react-helmet";
import { useData } from "../../utils/DataContext";

const { TabPane } = Tabs;
const { Option } = Select;

const ExecutiveDashboard = ({ subview }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [executiveData, setExecutiveData] = useState(null);
  const [timeRange, setTimeRange] = useState("quarter");
  const [activeTab, setActiveTab] = useState(subview || "1");
  const dataContext = useData();
  const { riskData, accountsData, systemData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData =
    riskData?.length > 0 || accountsData?.length > 0 || systemData?.length > 0;

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
      // Vérifie si des données ont été importées
      if (hasRequiredData) {
        // Dans une implémentation réelle, ces données proviendraient d'une API
        setTimeout(() => {
          setExecutiveData(mockExecutiveData);
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, hasRequiredData]);

  // Données fictives pour le dashboard exécutif
  const mockExecutiveData = {
    kpis: {
      securityScore: 87,
      securityTrend: 3,
      complianceLevel: 92,
      complianceTrend: 5,
      activeAccounts: 1254,
      accountsTrend: 8,
      activeUsers: 387,
      usersTrend: -2,
      incidents: 14,
      incidentsTrend: -25,
      riskLevel: "Low",
      riskTrend: -1,
    },
    securityTrends: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Security Score",
          data: [82, 83, 85, 84, 86, 87],
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
        },
        {
          label: "Compliance Level",
          data: [85, 87, 88, 90, 91, 92],
          borderColor: "#52c41a",
          backgroundColor: "rgba(82, 196, 26, 0.2)",
        },
      ],
    },
    riskDistribution: {
      labels: ["Critical", "High", "Medium", "Low"],
      datasets: [
        {
          data: [5, 22, 38, 35],
          backgroundColor: ["#f5222d", "#fa8c16", "#faad14", "#52c41a"],
        },
      ],
    },
    resourceAllocation: {
      labels: [
        "System Administration",
        "Security",
        "Development",
        "Operations",
        "Management",
      ],
      datasets: [
        {
          label: "Resource Allocation",
          data: [30, 25, 20, 15, 10],
          backgroundColor: [
            "#1890ff",
            "#52c41a",
            "#faad14",
            "#eb2f96",
            "#722ed1",
          ],
        },
      ],
    },
    keyProjects: [
      {
        id: 1,
        name: "Privileged Access Expansion",
        status: "In Progress",
        completion: 65,
        risk: "Low",
      },
      {
        id: 2,
        name: "Security Infrastructure Upgrade",
        status: "In Progress",
        completion: 42,
        risk: "Medium",
      },
      {
        id: 3,
        name: "GDPR Compliance Initiative",
        status: "Completed",
        completion: 100,
        risk: "Low",
      },
      {
        id: 4,
        name: "API Gateway Migration",
        status: "At Risk",
        completion: 28,
        risk: "High",
      },
      {
        id: 5,
        name: "Multi-Factor Authentication Rollout",
        status: "On Hold",
        completion: 15,
        risk: "Medium",
      },
    ],
    budgetAllocation: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        {
          label: "Budget",
          type: "bar",
          data: [250000, 320000, 290000, 300000],
          backgroundColor: "rgba(24, 144, 255, 0.6)",
          borderColor: "#1890ff",
          borderWidth: 1,
        },
        {
          label: "Actual Spend",
          type: "bar",
          data: [245000, 315000, 280000, null],
          backgroundColor: "rgba(82, 196, 26, 0.6)",
          borderColor: "#52c41a",
          borderWidth: 1,
        },
        {
          label: "Forecast",
          type: "line",
          data: [250000, 320000, 290000, 310000],
          borderColor: "#faad14",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <Badge status="success" text="Completed" />;
      case "In Progress":
        return <Badge status="processing" text="In Progress" />;
      case "At Risk":
        return <Badge status="error" text="At Risk" />;
      case "On Hold":
        return <Badge status="warning" text="On Hold" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "Low":
        return <Badge color="green" text="Low" />;
      case "Medium":
        return <Badge color="orange" text="Medium" />;
      case "High":
        return <Badge color="red" text="High" />;
      default:
        return <Badge color="blue" text={risk} />;
    }
  };

  const projectsColumns = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Completion",
      dataIndex: "completion",
      key: "completion",
      render: (completion) => <Progress percent={completion} size="small" />,
    },
    {
      title: "Risk Level",
      dataIndex: "risk",
      key: "risk",
      render: (risk) => getRiskBadge(risk),
    },
  ];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading executive dashboard...</p>
      </div>
    );
  }

  if (!hasRequiredData) {
    return (
      <Alert
        message="Données requises manquantes"
        description="Veuillez importer les fichiers de données nécessaires pour visualiser le dashboard exécutif. Rendez-vous dans la section 'Import Data' pour charger les fichiers de rapport de risque, d'inventaire de comptes et de santé système."
        type="info"
        showIcon
        action={
          <Button type="primary" href="/upload/executive">
            Importer des données
          </Button>
        }
      />
    );
  }

  return (
    <div className="executive-dashboard">
      <Helmet>
        <title>Executive Dashboard | CyberArk Capacity Planning</title>
      </Helmet>

      <div className="dashboard-header">
        <h1>
          <DashboardOutlined /> Executive Dashboard
        </h1>
        <p>
          Strategic overview of security, compliance, and resource allocation
        </p>
      </div>

      <div className="dashboard-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: "100%" }}
            >
              <Option value="month">Current Month</Option>
              <Option value="quarter">Current Quarter</Option>
              <Option value="year">Current Year</Option>
              <Option value="ytd">Year to Date</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Col>
        </Row>
      </div>

      {/* KPI Summary Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Security Score"
              value={executiveData.kpis.securityScore}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SecurityScanOutlined />}
              suffix="%"
            />
            <div className="trend-indicator">
              {executiveData.kpis.securityTrend > 0 ? (
                <span style={{ color: "#52c41a" }}>
                  <ArrowUpOutlined /> {executiveData.kpis.securityTrend}%
                </span>
              ) : (
                <span style={{ color: "#f5222d" }}>
                  <ArrowDownOutlined />{" "}
                  {Math.abs(executiveData.kpis.securityTrend)}%
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Compliance Level"
              value={executiveData.kpis.complianceLevel}
              precision={0}
              valueStyle={{ color: "#52c41a" }}
              prefix={<LockOutlined />}
              suffix="%"
            />
            <div className="trend-indicator">
              {executiveData.kpis.complianceTrend > 0 ? (
                <span style={{ color: "#52c41a" }}>
                  <ArrowUpOutlined /> {executiveData.kpis.complianceTrend}%
                </span>
              ) : (
                <span style={{ color: "#f5222d" }}>
                  <ArrowDownOutlined />{" "}
                  {Math.abs(executiveData.kpis.complianceTrend)}%
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Active Accounts"
              value={executiveData.kpis.activeAccounts}
              precision={0}
              valueStyle={{ color: "#722ed1" }}
              prefix={<ShoppingOutlined />}
            />
            <div className="trend-indicator">
              {executiveData.kpis.accountsTrend > 0 ? (
                <span style={{ color: "#52c41a" }}>
                  <ArrowUpOutlined /> {executiveData.kpis.accountsTrend}%
                </span>
              ) : (
                <span style={{ color: "#f5222d" }}>
                  <ArrowDownOutlined />{" "}
                  {Math.abs(executiveData.kpis.accountsTrend)}%
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Active Users"
              value={executiveData.kpis.activeUsers}
              precision={0}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<UserOutlined />}
            />
            <div className="trend-indicator">
              {executiveData.kpis.usersTrend > 0 ? (
                <span style={{ color: "#52c41a" }}>
                  <ArrowUpOutlined /> {executiveData.kpis.usersTrend}%
                </span>
              ) : (
                <span style={{ color: "#f5222d" }}>
                  <ArrowDownOutlined />{" "}
                  {Math.abs(executiveData.kpis.usersTrend)}%
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Security Incidents"
              value={executiveData.kpis.incidents}
              precision={0}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ExclamationCircleOutlined />}
            />
            <div className="trend-indicator">
              {executiveData.kpis.incidentsTrend < 0 ? (
                <span style={{ color: "#52c41a" }}>
                  <ArrowDownOutlined />{" "}
                  {Math.abs(executiveData.kpis.incidentsTrend)}%
                </span>
              ) : (
                <span style={{ color: "#f5222d" }}>
                  <ArrowUpOutlined /> {executiveData.kpis.incidentsTrend}%
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Current Risk Level"
              value={executiveData.kpis.riskLevel}
              valueStyle={{
                color:
                  executiveData.kpis.riskLevel === "Low"
                    ? "#52c41a"
                    : executiveData.kpis.riskLevel === "Medium"
                    ? "#faad14"
                    : "#f5222d",
              }}
              prefix={<FundOutlined />}
            />
            <div className="trend-indicator">
              {executiveData.kpis.riskTrend < 0 ? (
                <span style={{ color: "#52c41a" }}>
                  <ArrowDownOutlined /> Improving
                </span>
              ) : executiveData.kpis.riskTrend > 0 ? (
                <span style={{ color: "#f5222d" }}>
                  <ArrowUpOutlined /> Worsening
                </span>
              ) : (
                <span style={{ color: "#faad14" }}>Stable</span>
              )}
            </div>
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
              <LineChartOutlined /> Strategic Overview
            </span>
          }
          key="1"
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title="Security & Compliance Trends"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsLine data={executiveData.securityTrends} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Risk Distribution"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsPie data={executiveData.riskDistribution} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24}>
              <Card
                title="Key Project Status"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={executiveData.keyProjects}
                  columns={projectsColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BarChartOutlined /> Resource Planning
            </span>
          }
          key="2"
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title="Resource Allocation"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsPie data={executiveData.resourceAllocation} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Budget Allocation & Forecast"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsBar data={executiveData.budgetAllocation} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24}>
              <Card
                title="Key Recommendations"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ul className="recommendation-list">
                  <li>
                    <strong>Increase security posture:</strong> Allocate
                    additional resources to the API Gateway Migration project to
                    address high risk areas.
                  </li>
                  <li>
                    <strong>Improve compliance:</strong> Continue investment in
                    GDPR compliance initiatives based on successful completion
                    of initial phase.
                  </li>
                  <li>
                    <strong>Optimize resource allocation:</strong> Consider
                    redistributing resources from System Administration to
                    Security based on current needs.
                  </li>
                  <li>
                    <strong>Address incidents:</strong> The 25% reduction in
                    security incidents indicates successful implementation of
                    preventative measures.
                  </li>
                </ul>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <PieChartOutlined /> Future Planning
            </span>
          }
          key="3"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title="Strategic Initiatives"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <div className="strategic-initiatives">
                  <div className="initiative-item">
                    <h3>Zero Trust Architecture Adoption</h3>
                    <p>
                      Implement a comprehensive zero trust security model across
                      the organization.
                    </p>
                    <div className="timeline">
                      <span className="timeline-label">Timeline:</span>
                      <span className="timeline-value">Q1 2024 - Q4 2024</span>
                    </div>
                    <div className="estimated-budget">
                      <span className="budget-label">Estimated Budget:</span>
                      <span className="budget-value">$450,000</span>
                    </div>
                    <div className="expected-benefits">
                      <span className="benefits-label">Expected Benefits:</span>
                      <ul>
                        <li>Enhanced security posture</li>
                        <li>Reduced attack surface</li>
                        <li>Improved compliance with industry regulations</li>
                      </ul>
                    </div>
                  </div>

                  <div className="initiative-item">
                    <h3>Cloud Security Expansion</h3>
                    <p>
                      Extend privileged access management capabilities to cloud
                      environments.
                    </p>
                    <div className="timeline">
                      <span className="timeline-label">Timeline:</span>
                      <span className="timeline-value">Q2 2024 - Q3 2024</span>
                    </div>
                    <div className="estimated-budget">
                      <span className="budget-label">Estimated Budget:</span>
                      <span className="budget-value">$300,000</span>
                    </div>
                    <div className="expected-benefits">
                      <span className="benefits-label">Expected Benefits:</span>
                      <ul>
                        <li>Comprehensive cloud security</li>
                        <li>
                          Consistent security policies across environments
                        </li>
                        <li>Improved visibility into cloud resource usage</li>
                      </ul>
                    </div>
                  </div>

                  <div className="initiative-item">
                    <h3>Security Automation Framework</h3>
                    <p>
                      Develop and implement a framework for automating security
                      processes.
                    </p>
                    <div className="timeline">
                      <span className="timeline-label">Timeline:</span>
                      <span className="timeline-value">Q3 2024 - Q1 2025</span>
                    </div>
                    <div className="estimated-budget">
                      <span className="budget-label">Estimated Budget:</span>
                      <span className="budget-value">$375,000</span>
                    </div>
                    <div className="expected-benefits">
                      <span className="benefits-label">Expected Benefits:</span>
                      <ul>
                        <li>Reduced operational costs</li>
                        <li>Faster response to security incidents</li>
                        <li>Improved consistency in security operations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ExecutiveDashboard;

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
} from "antd";
import {
  LineChartOutlined,
  BarChartOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  DownloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ChartjsLine, ChartjsBar } from "../charts";
import { Helmet } from "react-helmet";
import { useData } from "../../utils/DataContext";

const { TabPane } = Tabs;
const { Option } = Select;

const PerformanceDashboard = ({ subview }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState(subview || "1");
  const dataContext = useData();
  const { systemData, certificatesData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = systemData?.length > 0;

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
          setPerformanceData(mockPerformanceData);
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, hasRequiredData]);

  // Données fictives pour le dashboard de performance
  const mockPerformanceData = {
    systemOverview: {
      cpuUsage: 68,
      memoryUsage: 74,
      diskIO: 45,
      networkLatency: 28,
      responseTime: 240, // ms
      throughput: 345, // requêtes/sec
    },
    componentPerformance: [
      {
        id: 1,
        component: "PVWA",
        responseTime: 220,
        throughput: 150,
        status: "Healthy",
        load: 65,
      },
      {
        id: 2,
        component: "CPM",
        responseTime: 180,
        throughput: 85,
        status: "Healthy",
        load: 58,
      },
      {
        id: 3,
        component: "PSM",
        responseTime: 420,
        throughput: 65,
        status: "Warning",
        load: 82,
      },
      {
        id: 4,
        component: "PSMP",
        responseTime: 150,
        throughput: 45,
        status: "Healthy",
        load: 42,
      },
      {
        id: 5,
        component: "Vault",
        responseTime: 120,
        throughput: 280,
        status: "Healthy",
        load: 62,
      },
      {
        id: 6,
        component: "AIM",
        responseTime: 95,
        throughput: 120,
        status: "Healthy",
        load: 38,
      },
    ],
    bottlenecks: [
      {
        id: 1,
        issue: "PSM Session Handling",
        severity: "Medium",
        impact: "Higher session initiation time",
        recommendation: "Increase PSM pool size",
      },
      {
        id: 2,
        issue: "Database Query Optimization",
        severity: "Medium",
        impact: "Vault operations slowed during peak periods",
        recommendation: "Optimize query patterns and indexing",
      },
      {
        id: 3,
        issue: "Network Latency to Remote Sites",
        severity: "High",
        impact: "Poor performance for offshore users",
        recommendation: "Deploy Edge nodes closer to remote users",
      },
      {
        id: 4,
        issue: "Memory Pressure on PVWA Servers",
        severity: "Low",
        impact: "Occasional page load delays",
        recommendation: "Increase memory allocation on PVWA servers",
      },
    ],
    responseTimeTrend: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "PVWA",
          data: [210, 230, 240, 220, 225, 215, 220],
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
        },
        {
          label: "CPM",
          data: [175, 170, 180, 185, 190, 180, 180],
          borderColor: "#52c41a",
          backgroundColor: "rgba(82, 196, 26, 0.2)",
        },
        {
          label: "PSM",
          data: [400, 410, 425, 405, 420, 415, 420],
          borderColor: "#faad14",
          backgroundColor: "rgba(250, 173, 20, 0.2)",
        },
        {
          label: "Vault",
          data: [115, 125, 120, 115, 130, 120, 120],
          borderColor: "#eb2f96",
          backgroundColor: "rgba(235, 47, 150, 0.2)",
        },
      ],
    },
    throughputTrend: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Requêtes par seconde",
          data: [320, 350, 380, 420, 390, 310, 345],
          borderColor: "#722ed1",
          backgroundColor: "rgba(114, 46, 209, 0.2)",
        },
      ],
    },
    loadDistribution: {
      labels: ["PVWA", "CPM", "PSM", "PSMP", "Vault", "AIM"],
      datasets: [
        {
          label: "Charge (%)",
          data: [65, 58, 82, 42, 62, 38],
          backgroundColor: [
            "rgba(24, 144, 255, 0.6)",
            "rgba(82, 196, 26, 0.6)",
            "rgba(250, 173, 20, 0.6)",
            "rgba(235, 47, 150, 0.6)",
            "rgba(114, 46, 209, 0.6)",
            "rgba(16, 142, 233, 0.6)",
          ],
        },
      ],
    },
    performanceByHour: {
      labels: [
        "00:00",
        "02:00",
        "04:00",
        "06:00",
        "08:00",
        "10:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
        "22:00",
      ],
      datasets: [
        {
          label: "Temps de réponse (ms)",
          type: "line",
          data: [180, 175, 170, 190, 280, 320, 300, 310, 290, 270, 210, 190],
          borderColor: "#1890ff",
          yAxisID: "y-axis-1",
        },
        {
          label: "Requêtes par seconde",
          type: "bar",
          data: [120, 100, 80, 150, 380, 450, 420, 430, 400, 350, 250, 180],
          backgroundColor: "rgba(114, 46, 209, 0.4)",
          yAxisID: "y-axis-2",
        },
      ],
    },
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Healthy":
        return <Badge status="success" text="Healthy" />;
      case "Warning":
        return <Badge status="warning" text="Warning" />;
      case "Critical":
        return <Badge status="error" text="Critical" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Low":
        return <Badge color="green" text="Low" />;
      case "Medium":
        return <Badge color="orange" text="Medium" />;
      case "High":
        return <Badge color="red" text="High" />;
      default:
        return <Badge color="blue" text={severity} />;
    }
  };

  const componentColumns = [
    {
      title: "Component",
      dataIndex: "component",
      key: "component",
    },
    {
      title: "Response Time (ms)",
      dataIndex: "responseTime",
      key: "responseTime",
      sorter: (a, b) => a.responseTime - b.responseTime,
      render: (time) => (
        <span
          style={{
            color: time > 300 ? "#faad14" : time > 200 ? "#1890ff" : "#52c41a",
          }}
        >
          {time} ms
        </span>
      ),
    },
    {
      title: "Throughput (req/s)",
      dataIndex: "throughput",
      key: "throughput",
      sorter: (a, b) => a.throughput - b.throughput,
    },
    {
      title: "Load",
      dataIndex: "load",
      key: "load",
      render: (load) => (
        <Progress
          percent={load}
          size="small"
          strokeColor={
            load > 80 ? "#f5222d" : load > 60 ? "#faad14" : "#52c41a"
          }
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
  ];

  const bottleneckColumns = [
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => getSeverityBadge(severity),
    },
    {
      title: "Impact",
      dataIndex: "impact",
      key: "impact",
    },
    {
      title: "Recommendation",
      dataIndex: "recommendation",
      key: "recommendation",
    },
  ];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading performance dashboard...</p>
      </div>
    );
  }

  if (!hasRequiredData) {
    return (
      <Alert
        message="Données requises manquantes"
        description="Veuillez importer les fichiers de données nécessaires pour visualiser le dashboard de performance. Rendez-vous dans la section 'Import Data' pour charger les fichiers de santé système."
        type="info"
        showIcon
        action={
          <Button type="primary" href="/upload/performance">
            Importer des données
          </Button>
        }
      />
    );
  }

  return (
    <div className="performance-dashboard">
      <Helmet>
        <title>Performance Dashboard | CyberArk Capacity Planning</title>
      </Helmet>

      <div className="dashboard-header">
        <h1>
          <RocketOutlined /> Performance Dashboard
        </h1>
        <p>Monitor and optimize system performance across all components</p>
      </div>

      <div className="dashboard-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: "100%" }}
            >
              <Option value="1d">Last 24 hours</Option>
              <Option value="7d">Last 7 days</Option>
              <Option value="30d">Last 30 days</Option>
              <Option value="90d">Last 90 days</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Col>
        </Row>
      </div>

      {/* System Overview Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Response Time"
              value={performanceData.systemOverview.responseTime}
              precision={0}
              valueStyle={{
                color:
                  performanceData.systemOverview.responseTime > 300
                    ? "#faad14"
                    : performanceData.systemOverview.responseTime > 200
                    ? "#1890ff"
                    : "#52c41a",
              }}
              prefix={<ClockCircleOutlined />}
              suffix="ms"
            />
            <div className="status-indicator">
              {performanceData.systemOverview.responseTime > 300 ? (
                <span style={{ color: "#faad14" }}>
                  <WarningOutlined /> Attention
                </span>
              ) : (
                <span style={{ color: "#52c41a" }}>
                  <CheckCircleOutlined /> Good
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
              title="Throughput"
              value={performanceData.systemOverview.throughput}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<ThunderboltOutlined />}
              suffix="req/s"
            />
            <div className="status-indicator">
              <span style={{ color: "#52c41a" }}>
                <CheckCircleOutlined /> Optimal
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="CPU Usage"
              value={performanceData.systemOverview.cpuUsage}
              precision={0}
              valueStyle={{
                color:
                  performanceData.systemOverview.cpuUsage > 80
                    ? "#f5222d"
                    : performanceData.systemOverview.cpuUsage > 60
                    ? "#faad14"
                    : "#52c41a",
              }}
              suffix="%"
            />
            <Progress
              percent={performanceData.systemOverview.cpuUsage}
              size="small"
              status={
                performanceData.systemOverview.cpuUsage > 80
                  ? "exception"
                  : "normal"
              }
              strokeColor={
                performanceData.systemOverview.cpuUsage > 80
                  ? "#f5222d"
                  : performanceData.systemOverview.cpuUsage > 60
                  ? "#faad14"
                  : "#52c41a"
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Memory Usage"
              value={performanceData.systemOverview.memoryUsage}
              precision={0}
              valueStyle={{
                color:
                  performanceData.systemOverview.memoryUsage > 80
                    ? "#f5222d"
                    : performanceData.systemOverview.memoryUsage > 60
                    ? "#faad14"
                    : "#52c41a",
              }}
              suffix="%"
            />
            <Progress
              percent={performanceData.systemOverview.memoryUsage}
              size="small"
              status={
                performanceData.systemOverview.memoryUsage > 80
                  ? "exception"
                  : "normal"
              }
              strokeColor={
                performanceData.systemOverview.memoryUsage > 80
                  ? "#f5222d"
                  : performanceData.systemOverview.memoryUsage > 60
                  ? "#faad14"
                  : "#52c41a"
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Disk I/O"
              value={performanceData.systemOverview.diskIO}
              precision={0}
              valueStyle={{
                color:
                  performanceData.systemOverview.diskIO > 80
                    ? "#f5222d"
                    : performanceData.systemOverview.diskIO > 60
                    ? "#faad14"
                    : "#52c41a",
              }}
              suffix="%"
            />
            <Progress
              percent={performanceData.systemOverview.diskIO}
              size="small"
              status={
                performanceData.systemOverview.diskIO > 80
                  ? "exception"
                  : "normal"
              }
              strokeColor={
                performanceData.systemOverview.diskIO > 80
                  ? "#f5222d"
                  : performanceData.systemOverview.diskIO > 60
                  ? "#faad14"
                  : "#52c41a"
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
            style={{ height: "100%" }}
          >
            <Statistic
              title="Network Latency"
              value={performanceData.systemOverview.networkLatency}
              precision={0}
              valueStyle={{
                color:
                  performanceData.systemOverview.networkLatency > 40
                    ? "#f5222d"
                    : performanceData.systemOverview.networkLatency > 30
                    ? "#faad14"
                    : "#52c41a",
              }}
              suffix="ms"
            />
            <div className="status-indicator">
              {performanceData.systemOverview.networkLatency > 40 ? (
                <span style={{ color: "#f5222d" }}>
                  <ExclamationCircleOutlined /> High
                </span>
              ) : performanceData.systemOverview.networkLatency > 30 ? (
                <span style={{ color: "#faad14" }}>
                  <WarningOutlined /> Moderate
                </span>
              ) : (
                <span style={{ color: "#52c41a" }}>
                  <CheckCircleOutlined /> Low
                </span>
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
              <DashboardOutlined /> Component Performance
            </span>
          }
          key="1"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title="Component-Level Performance Metrics"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={performanceData.componentPerformance}
                  columns={componentColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24} lg={12}>
              <Card
                title="Component Response Time Trends"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsLine data={performanceData.responseTimeTrend} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Component Load Distribution"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsBar data={performanceData.loadDistribution} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <LineChartOutlined /> Performance Analysis
            </span>
          }
          key="2"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title="Performance by Hour (Last 24 Hours)"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsBar data={performanceData.performanceByHour} />
                <Divider />
                <div className="chart-explanation">
                  <p>
                    <strong>Analysis:</strong> Peak system load occurs between
                    8:00 AM and 4:00 PM, with the highest volume around 10:00
                    AM. Response times increase by approximately 80% during peak
                    hours compared to off-hours.
                  </p>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24} lg={12}>
              <Card
                title="Throughput Trend (Last 7 Days)"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsLine data={performanceData.throughputTrend} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title="Performance Bottlenecks & Recommendations"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={performanceData.bottlenecks}
                  columns={bottleneckColumns}
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
              <ApiOutlined /> API Performance
            </span>
          }
          key="3"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title="API Performance Optimization Recommendations"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <div className="optimization-recommendations">
                  <div className="recommendation-item">
                    <h3>Implement API Request Batching</h3>
                    <p>
                      Current pattern of individual API calls is causing
                      unnecessary overhead. Implementing request batching could
                      reduce API calls by up to 60% for certain operations.
                    </p>
                    <div className="expected-improvement">
                      <span className="improvement-label">
                        Expected Improvement:
                      </span>
                      <span className="improvement-value">
                        35-40% reduction in API overhead
                      </span>
                    </div>
                    <div className="implementation-complexity">
                      <span className="complexity-label">
                        Implementation Complexity:
                      </span>
                      <span className="complexity-value">Medium</span>
                    </div>
                  </div>

                  <div className="recommendation-item">
                    <h3>Optimize Database Query Patterns</h3>
                    <p>
                      Analysis shows that several API endpoints are using
                      inefficient query patterns resulting in full table scans.
                      Optimizing these queries with proper indexing would
                      significantly improve response times.
                    </p>
                    <div className="expected-improvement">
                      <span className="improvement-label">
                        Expected Improvement:
                      </span>
                      <span className="improvement-value">
                        50-70% faster query execution
                      </span>
                    </div>
                    <div className="implementation-complexity">
                      <span className="complexity-label">
                        Implementation Complexity:
                      </span>
                      <span className="complexity-value">Medium</span>
                    </div>
                  </div>

                  <div className="recommendation-item">
                    <h3>Implement API Response Caching</h3>
                    <p>
                      Many API requests retrieve static or slowly-changing data.
                      Implementing a tiered caching strategy could significantly
                      reduce database load and improve response times.
                    </p>
                    <div className="expected-improvement">
                      <span className="improvement-label">
                        Expected Improvement:
                      </span>
                      <span className="improvement-value">
                        70-80% faster response for cached items
                      </span>
                    </div>
                    <div className="implementation-complexity">
                      <span className="complexity-label">
                        Implementation Complexity:
                      </span>
                      <span className="complexity-value">High</span>
                    </div>
                  </div>

                  <div className="recommendation-item">
                    <h3>Implement Connection Pooling</h3>
                    <p>
                      Current implementation creates new database connections
                      for each request. Implementing connection pooling would
                      reduce connection overhead and improve throughput.
                    </p>
                    <div className="expected-improvement">
                      <span className="improvement-label">
                        Expected Improvement:
                      </span>
                      <span className="improvement-value">
                        25-30% improvement in throughput
                      </span>
                    </div>
                    <div className="implementation-complexity">
                      <span className="complexity-label">
                        Implementation Complexity:
                      </span>
                      <span className="complexity-value">Low</span>
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

export default PerformanceDashboard;

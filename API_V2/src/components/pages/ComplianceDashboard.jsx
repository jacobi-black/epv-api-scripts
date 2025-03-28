import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Table,
  Tabs,
  List,
  Badge,
  Alert,
  Button,
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import {
  FileProtectOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { ChartjsLine, ChartjsPie, ChartjsBar } from "../charts";
import { Helmet } from "react-helmet";
import { useData } from "../../utils/DataContext";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ComplianceDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState(null);
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const dataContext = useData();
  const { riskData, accountsData, safesData } = dataContext;

  // Vérifier si les données nécessaires sont disponibles
  const hasRequiredData = riskData?.length > 0;

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
          setComplianceData(mockComplianceData);
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, complianceFilter, hasRequiredData]);

  // Données fictives pour le dashboard de conformité
  const mockComplianceData = {
    overallCompliance: 87,
    regulatoryCompliance: {
      gdpr: 92,
      hipaa: 88,
      pci: 85,
      sox: 90,
      nist: 82,
    },
    auditHistory: [
      {
        id: 1,
        date: "2023-11-15",
        type: "Internal",
        status: "Completed",
        findings: 3,
        critical: 0,
        remediated: 3,
      },
      {
        id: 2,
        date: "2023-09-22",
        type: "External",
        status: "Completed",
        findings: 7,
        critical: 1,
        remediated: 6,
      },
      {
        id: 3,
        date: "2023-07-10",
        type: "Automated",
        status: "Completed",
        findings: 2,
        critical: 0,
        remediated: 2,
      },
      {
        id: 4,
        date: "2023-05-05",
        type: "Internal",
        status: "Completed",
        findings: 5,
        critical: 1,
        remediated: 5,
      },
    ],
    complianceIssues: [
      {
        id: 1,
        rule: "Password rotation policy",
        status: "Non-compliant",
        severity: "High",
        affectedElements: 12,
        lastChecked: "2023-12-01",
      },
      {
        id: 2,
        rule: "Administrative access review",
        status: "Non-compliant",
        severity: "Medium",
        affectedElements: 8,
        lastChecked: "2023-12-01",
      },
      {
        id: 3,
        rule: "Privileged account monitoring",
        status: "Compliant",
        severity: "Low",
        affectedElements: 0,
        lastChecked: "2023-12-01",
      },
      {
        id: 4,
        rule: "Dual control enforcement",
        status: "Warning",
        severity: "Medium",
        affectedElements: 3,
        lastChecked: "2023-12-01",
      },
      {
        id: 5,
        rule: "Session recording retention",
        status: "Compliant",
        severity: "Low",
        affectedElements: 0,
        lastChecked: "2023-12-01",
      },
    ],
    complianceTrends: {
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
          label: "Overall Compliance",
          data: [82, 83, 85, 84, 86, 88, 87, 89, 88, 87, 86, 87],
          borderColor: "#1890ff",
          backgroundColor: "rgba(24, 144, 255, 0.2)",
        },
        {
          label: "Password Policies",
          data: [78, 80, 82, 85, 84, 86, 87, 88, 89, 90, 91, 92],
          borderColor: "#52c41a",
          backgroundColor: "rgba(82, 196, 26, 0.2)",
        },
        {
          label: "Access Controls",
          data: [85, 86, 84, 83, 85, 87, 88, 86, 87, 85, 84, 85],
          borderColor: "#faad14",
          backgroundColor: "rgba(250, 173, 20, 0.2)",
        },
      ],
    },
    regulatoryDistribution: {
      labels: ["GDPR", "HIPAA", "PCI-DSS", "SOX", "NIST"],
      datasets: [
        {
          data: [92, 88, 85, 90, 82],
          backgroundColor: [
            "#1890ff",
            "#52c41a",
            "#faad14",
            "#722ed1",
            "#eb2f96",
          ],
        },
      ],
    },
    issuesBySeverity: {
      labels: ["Critical", "High", "Medium", "Low"],
      datasets: [
        {
          label: "Number of Issues",
          data: [2, 8, 15, 10],
          backgroundColor: ["#f5222d", "#fa8c16", "#faad14", "#a0d911"],
        },
      ],
    },
  };

  const getStatusBadge = (status) => {
    if (status === "Compliant")
      return <Badge status="success" text="Compliant" />;
    if (status === "Non-compliant")
      return <Badge status="error" text="Non-compliant" />;
    if (status === "Warning") return <Badge status="warning" text="Warning" />;
    return <Badge status="default" text={status} />;
  };

  const getSeverityTag = (severity) => {
    if (severity === "High") return <Badge color="red" text="High" />;
    if (severity === "Medium") return <Badge color="orange" text="Medium" />;
    if (severity === "Low") return <Badge color="green" text="Low" />;
    return <Badge color="default" text={severity} />;
  };

  const complianceIssuesColumns = [
    {
      title: "Rule",
      dataIndex: "rule",
      key: "rule",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => getSeverityTag(severity),
    },
    {
      title: "Affected Elements",
      dataIndex: "affectedElements",
      key: "affectedElements",
    },
    {
      title: "Last Checked",
      dataIndex: "lastChecked",
      key: "lastChecked",
    },
  ];

  const auditHistoryColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Findings",
      dataIndex: "findings",
      key: "findings",
    },
    {
      title: "Critical Issues",
      dataIndex: "critical",
      key: "critical",
      render: (critical) => (
        <span style={{ color: critical > 0 ? "#f5222d" : "#52c41a" }}>
          {critical}
        </span>
      ),
    },
    {
      title: "Remediated",
      dataIndex: "remediated",
      key: "remediated",
    },
  ];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading compliance dashboard...</p>
      </div>
    );
  }

  if (!hasRequiredData) {
    return (
      <Alert
        message="Données requises manquantes"
        description="Veuillez importer les fichiers de données nécessaires pour visualiser le dashboard de conformité. Rendez-vous dans la section 'Import Data' pour charger les fichiers de rapport de risque."
        type="info"
        showIcon
        action={
          <Button type="primary" href="/upload/compliance">
            Importer des données
          </Button>
        }
      />
    );
  }

  return (
    <div className="compliance-dashboard">
      <Helmet>
        <title>Compliance Dashboard | CyberArk Capacity Planning</title>
      </Helmet>

      <div className="dashboard-header">
        <h1>
          <FileProtectOutlined /> Compliance Dashboard
        </h1>
        <p>
          Track and manage regulatory compliance, audit results, and security
          controls
        </p>
      </div>

      <div className="dashboard-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            <Select
              value={complianceFilter}
              onChange={setComplianceFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Regulations</Option>
              <Option value="gdpr">GDPR</Option>
              <Option value="hipaa">HIPAA</Option>
              <Option value="pci">PCI-DSS</Option>
              <Option value="sox">SOX</Option>
              <Option value="nist">NIST</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10} md={8} lg={6}>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: "100%" }}
            >
              <Option value="7d">Last 7 days</Option>
              <Option value="30d">Last 30 days</Option>
              <Option value="90d">Last 90 days</Option>
              <Option value="1y">Last 12 months</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Col>
        </Row>
      </div>

      {/* Overall Compliance Score */}
      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card
            title="Overall Compliance Score"
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
          >
            <div className="text-center">
              <Progress
                type="dashboard"
                percent={complianceData.overallCompliance}
                format={(percent) => `${percent}%`}
                strokeColor={
                  complianceData.overallCompliance >= 90
                    ? "#52c41a"
                    : complianceData.overallCompliance >= 75
                    ? "#faad14"
                    : "#f5222d"
                }
              />
              <div className="compliance-rating">
                {complianceData.overallCompliance >= 90 ? (
                  <span className="success-text">Excellent</span>
                ) : complianceData.overallCompliance >= 75 ? (
                  <span className="warning-text">Good</span>
                ) : (
                  <span className="danger-text">Needs Improvement</span>
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Regulatory Framework Compliance"
            className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
          >
            <Row gutter={[16, 16]}>
              {Object.entries(complianceData.regulatoryCompliance).map(
                ([key, value]) => (
                  <Col xs={12} sm={8} md={4} key={key}>
                    <Tooltip title={`${key.toUpperCase()} Compliance`}>
                      <div className="text-center">
                        <Progress
                          type="circle"
                          percent={value}
                          width={80}
                          format={(percent) => `${percent}%`}
                          strokeColor={
                            value >= 90
                              ? "#52c41a"
                              : value >= 75
                              ? "#faad14"
                              : "#f5222d"
                          }
                        />
                        <div className="mt-2">{key.toUpperCase()}</div>
                      </div>
                    </Tooltip>
                  </Col>
                )
              )}
            </Row>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" className="dashboard-tabs">
        <TabPane
          tab={
            <span>
              <BarChartOutlined /> Compliance Issues
            </span>
          }
          key="1"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title="Current Compliance Issues"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={complianceData.complianceIssues}
                  columns={complianceIssuesColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24} lg={12}>
              <Card
                title="Issues by Severity"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsPie data={complianceData.issuesBySeverity} />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="Compliance Recommendations"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    "Update password rotation policy for service accounts",
                    "Complete quarterly administrative access review",
                    "Implement additional controls for dual control enforcement",
                    "Ensure session recording retention meets policy requirements",
                    "Schedule regular privilege access reviews",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined />}
                        title={item}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <AuditOutlined /> Audit History
            </span>
          }
          key="2"
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Card
                title="Audit History and Results"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <Table
                  dataSource={complianceData.auditHistory}
                  columns={auditHistoryColumns}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col xs={24}>
              <Card
                title="Compliance Trend Analysis"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsLine data={complianceData.complianceTrends} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <PieChartOutlined /> Regulatory Distribution
            </span>
          }
          key="3"
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title="Regulatory Compliance Distribution"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <ChartjsPie data={complianceData.regulatoryDistribution} />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="Automated Compliance Reports"
                className={`dashboard-card ${isDarkMode ? "dark-card" : ""}`}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: "GDPR Quarterly Compliance Report",
                      date: "2023-12-01",
                      status: "Available",
                    },
                    {
                      title: "HIPAA Monthly Security Assessment",
                      date: "2023-12-05",
                      status: "Scheduled",
                    },
                    {
                      title: "PCI-DSS Compliance Audit",
                      date: "2023-11-15",
                      status: "Available",
                    },
                    {
                      title: "SOX Access Control Verification",
                      date: "2023-11-10",
                      status: "Available",
                    },
                    {
                      title: "NIST Security Framework Assessment",
                      date: "2023-10-28",
                      status: "Available",
                    },
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        item.status === "Available" ? (
                          <Button
                            type="primary"
                            size="small"
                            icon={<DownloadOutlined />}
                          >
                            Download
                          </Button>
                        ) : (
                          <Button disabled size="small">
                            Pending
                          </Button>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        title={item.title}
                        description={`Generated: ${item.date}`}
                      />
                      <div>
                        {item.status === "Available" ? (
                          <Badge status="success" text="Available" />
                        ) : (
                          <Badge status="processing" text="Scheduled" />
                        )}
                      </div>
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

export default ComplianceDashboard;

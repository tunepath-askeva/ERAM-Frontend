import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  List,
  Tag,
  Progress,
  Empty,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FileProtectOutlined,
  BellOutlined,
  TrophyOutlined,
  DollarOutlined,
  BookOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetEmployeeAdminDashboardQuery } from "../../Slices/Employee/EmployeeApis";

const EmployeeAdminDashboard = () => {
  const [showAlert, setShowAlert] = useState(true);

  const { data: demoData, isLoading } = useGetEmployeeAdminDashboardQuery();
  const dashboardData = demoData?.data;

  // Chart data preparations
  const leaveStatusData = [
    { name: "Pending", value: dashboardData?.leaves?.pending },
    { name: "Approved", value: dashboardData?.leaves?.approved },
    { name: "Rejected", value: dashboardData?.leaves?.rejected },
  ];

  const requestStatusData = [
    { name: "Pending", value: dashboardData?.requests?.pending },
    { name: "Approved", value: dashboardData?.requests?.approved },
    { name: "Rejected", value: dashboardData?.requests?.rejected },
  ];

  const leaveTypeData = dashboardData?.leaves?.byType.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
  }));

  const requestTypeData = dashboardData?.requests?.byType.map((item) => ({
    name: item._id,
    count: item.count,
  }));

  const COLORS = ["#da2c46", "#ff6b6b", "#ff9999"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            border: "2px solid #da2c46",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
            {label
              ? `${label}: ${payload[0].value}`
              : `${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#da2c46";
      case "approved":
        return "#52c41a";
      case "rejected":
        return "#ff4d4f";
      default:
        return "#da2c46";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
      }}
    >
      {/* Alert Cards */}
      {showAlert && dashboardData?.alerts?.pendingApprovals > 0 && (
        <Card
          style={{
            marginBottom: "24px",
            border: "2px solid #da2c46",
            backgroundColor: "#fff5f5",
            position: "relative", // ADD THIS
          }}
        >
          <CloseOutlined
            onClick={() => setShowAlert(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              fontSize: "16px",
              color: "#da2c46",
              cursor: "pointer",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <BellOutlined style={{ fontSize: "32px", color: "#da2c46" }} />
            <div>
              <h3 style={{ margin: 0, color: "#da2c46", fontSize: "18px" }}>
                {dashboardData?.alerts?.pendingApprovals} Pending Approvals
              </h3>
              <p style={{ margin: 0, color: "#666" }}>
                {dashboardData?.alerts?.urgentLeaves > 0 &&
                  `${dashboardData?.alerts?.urgentLeaves} urgent leaves require immediate attention`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: "4px solid #da2c46" }}>
            <Statistic
              title={
                <span style={{ fontSize: "16px", color: "#666" }}>
                  Total Employees
                </span>
              }
              value={dashboardData?.overview?.totalEmployees}
              prefix={
                <UserOutlined style={{ color: "#da2c46", fontSize: "24px" }} />
              }
              valueStyle={{
                color: "#da2c46",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            />
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
              <Tag color="#da2c46">
                {dashboardData?.overview?.newEmployeesThisMonth} new this month
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: "4px solid #da2c46" }}>
            <Statistic
              title={
                <span style={{ fontSize: "16px", color: "#666" }}>
                  Active Employees
                </span>
              }
              value={dashboardData?.overview?.activeEmployees}
              prefix={
                <CheckCircleOutlined
                  style={{ color: "#da2c46", fontSize: "24px" }}
                />
              }
              valueStyle={{
                color: "#da2c46",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            />
            <Progress
              percent={dashboardData?.overview?.activeEmployeePercentage}
              strokeColor="#da2c46"
              style={{ marginTop: "12px" }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: "4px solid #da2c46" }}>
            <Statistic
              title={
                <span style={{ fontSize: "16px", color: "#666" }}>
                  Leave Requests
                </span>
              }
              value={dashboardData?.leaves?.total}
              prefix={
                <CalendarOutlined
                  style={{ color: "#da2c46", fontSize: "24px" }}
                />
              }
              valueStyle={{
                color: "#da2c46",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            />
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
              <Tag color="#da2c46">
                {dashboardData?.leaves?.thisMonth} this month
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: "4px solid #da2c46" }}>
            <Statistic
              title={
                <span style={{ fontSize: "16px", color: "#666" }}>
                  Other Requests
                </span>
              }
              value={dashboardData?.requests?.total}
              prefix={
                <FileTextOutlined
                  style={{ color: "#da2c46", fontSize: "24px" }}
                />
              }
              valueStyle={{
                color: "#da2c46",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            />
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
              <Tag color="#da2c46">
                {dashboardData?.requests?.thisMonth} this month
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Approval Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Pending Leaves"
              value={dashboardData?.leaves?.pending}
              prefix={<ClockCircleOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Leave Approval Rate"
              value={dashboardData?.leaves?.approvalRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Pending Requests"
              value={dashboardData?.requests?.pending}
              prefix={<ClockCircleOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Request Approval Rate"
              value={dashboardData?.requests?.approvalRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Documents Attention"
              value={dashboardData?.documents?.requiresAttention}
              prefix={<FileProtectOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Feedback Received"
              value={dashboardData?.feedback?.total}
              prefix={<WarningOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Policies"
              value={dashboardData?.content?.activePolicies}
              prefix={<BookOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Payroll This Month"
              value={dashboardData?.payroll?.recordsThisMonth}
              prefix={<DollarOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Leave Types Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  color: "#da2c46",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Leave Types Distribution
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#da2c46" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Request Types Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  color: "#da2c46",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Request Types Distribution
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#666" }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#da2c46" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Leave Status Pie Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  color: "#da2c46",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Leave Request Status Breakdown
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leaveStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Request Status Pie Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  color: "#da2c46",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Other Request Status Breakdown
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requestStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]}>
        {/* Recent Leaves */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  color: "#da2c46",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Recent Leave Requests
              </span>
            }
            style={{ height: "100%" }}
          >
            {dashboardData?.recentActivities?.leaves?.length > 0 ? (
              <List
                dataSource={dashboardData?.recentActivities?.leaves}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: "bold", color: "#333" }}>
                            {item.employee.fullName}
                          </span>
                          <Tag color={getStatusColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ color: "#666", fontSize: "13px" }}>
                            <span style={{ fontWeight: "500" }}>Type:</span>{" "}
                            {item.leaveType.charAt(0).toUpperCase() +
                              item.leaveType.slice(1)}
                          </div>
                          <div style={{ color: "#666", fontSize: "13px" }}>
                            <span style={{ fontWeight: "500" }}>ID:</span>{" "}
                            {item.employee.employmentDetails.eramId}
                          </div>
                          <div
                            style={{
                              color: "#999",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No recent leave requests" />
            )}
          </Card>
        </Col>

        {/* Recent Requests */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  color: "#da2c46",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Recent Other Requests
              </span>
            }
            style={{ height: "100%" }}
          >
            {dashboardData?.recentActivities?.requests?.length > 0 ? (
              <List
                dataSource={dashboardData?.recentActivities?.requests}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: "bold", color: "#333" }}>
                            {item.employee.fullName}
                          </span>
                          <Tag color={getStatusColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ color: "#666", fontSize: "13px" }}>
                            <span style={{ fontWeight: "500" }}>Type:</span>{" "}
                            {item.requestType}
                          </div>
                          <div style={{ color: "#666", fontSize: "13px" }}>
                            <span style={{ fontWeight: "500" }}>ID:</span>{" "}
                            {item.employee.employmentDetails.eramId}
                          </div>
                          <div
                            style={{
                              color: "#999",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No recent requests" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeAdminDashboard;

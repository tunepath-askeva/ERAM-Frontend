import React from "react";
import { useGetAdminDashboardDataQuery } from "../../Slices/Admin/AdminApis";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Typography,
  Space,
  Spin,
  Empty,
} from "antd";
import {
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  SolutionOutlined,
  TrophyOutlined,
  RiseOutlined,
  UsergroupAddOutlined,
  FunnelPlotOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { data, isLoading, error } = useGetAdminDashboardDataQuery();

  // Prepare role data for pie chart
  const roleData =
    data?.roleCounts?.map((item) => ({
      type: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    })) || [];

  // Calculate total users from role counts
  const totalUsers =
    data?.roleCounts?.reduce((sum, role) => sum + role.count, 0) || 0;

  // Get specific role counts
  const getCount = (role) =>
    data?.roleCounts?.find((r) => r._id === role)?.count || 0;

  // Custom card styles with primary color theme
  const statisticCardStyles = [
    {
      background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
    {
      background: "linear-gradient(135deg, #da2c46 0%, #f04a6e 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
    {
      background: "linear-gradient(135deg, #da2c46 0%, #ff4757 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
    {
      background: "linear-gradient(135deg, #da2c46 0%, #e74c3c 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
  ];

  const whiteCardStyle = {
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "none",
  };

  // Enhanced pie chart visualization
  const PieChart = ({ data }) => {
    if (!data || data.length === 0)
      return <Empty description="No data available" />;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = [
      "#da2c46",
      "#f04a6e",
      "#ff4757",
      "#e74c3c",
      "#dc3545",
      "#c82333",
    ];

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: `conic-gradient(
            ${data
              .map((item, index) => {
                const startAngle =
                  (data.slice(0, index).reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  360;
                const endAngle =
                  (data
                    .slice(0, index + 1)
                    .reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  360;
                return `${colors[index]} ${startAngle}deg ${endAngle}deg`;
              })
              .join(", ")}
          )`,
            position: "relative",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "28px",
                color: "#da2c46",
                marginBottom: "-5px",
              }}
            >
              {total}
            </Text>
            <Text style={{ fontSize: "14px", color: "#666" }}>Total Users</Text>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "15px",
            width: "100%",
          }}
        >
          {data.map((item, index) => (
            <div
              key={item.type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#f8f9fa",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: colors[index],
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              ></div>
              <div>
                <Text style={{ fontSize: "13px", fontWeight: "500" }}>
                  {item.type}
                </Text>
                <Text
                  style={{ fontSize: "11px", color: "#666", marginLeft: "5px" }}
                >
                  ({Math.round((item.value / total) * 100)}%)
                </Text>
                <div>
                  <Text
                    strong
                    style={{ fontSize: "16px", color: colors[index] }}
                  >
                    {item.value}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced bar chart for status data
  const BarChart = ({ data }) => {
    if (!data || data.length === 0)
      return <Empty description="No status data available" />;

    const maxValue = Math.max(...data.map((item) => item.count));
    const colors = ["#da2c46", "#f04a6e", "#ff4757", "#e74c3c"];

    return (
      <div style={{ padding: "30px 20px" }}>
        {data.map((item, index) => (
          <div key={item._id} style={{ marginBottom: "25px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Text style={{ fontSize: "16px", fontWeight: "500" }}>
                {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
              </Text>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Text strong style={{ fontSize: "18px", color: colors[index] }}>
                  {item.count}
                </Text>
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  (
                  {Math.round(
                    (item.count / data.reduce((sum, d) => sum + d.count, 0)) *
                      100
                  )}
                  %)
                </Text>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: "12px",
                backgroundColor: "#f0f2f5",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  width: `${(item.count / maxValue) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${colors[index]}, ${colors[index]}dd)`,
                  borderRadius: "6px",
                  transition: "width 0.3s ease",
                  boxShadow: `0 2px 8px ${colors[index]}40`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={3} type="danger">
          Error loading dashboard data
        </Title>
        <Text>Please try refreshing the page</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={1}
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          Admin Dashboard
        </Title>
        <Text style={{ fontSize: "16px", color: "#666" }}>
          Overview of your platform statistics and user data
        </Text>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ ...statisticCardStyles[0], color: "white" }} hoverable>
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Total Candidates
                </span>
              }
              value={data?.totalCandidates || 0}
              prefix={<UserOutlined style={{ color: "white" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ ...statisticCardStyles[1], color: "white" }} hoverable>
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Total Users
                </span>
              }
              value={totalUsers}
              prefix={<TeamOutlined style={{ color: "white" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ ...statisticCardStyles[2], color: "white" }} hoverable>
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Recruiters
                </span>
              }
              value={getCount("recruiter")}
              prefix={<SolutionOutlined style={{ color: "white" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ ...statisticCardStyles[3], color: "white" }} hoverable>
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Employees
                </span>
              }
              value={getCount("employee")}
              prefix={<UsergroupAddOutlined style={{ color: "white" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <PieChartOutlined style={{ color: "#da2c46" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  User Distribution by Role
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            <Spin spinning={isLoading}>
              <PieChart data={roleData} />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FunnelPlotOutlined style={{ color: "#da2c46" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  Candidate Pipeline Status
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            <Spin spinning={isLoading}>
              <BarChart data={data?.statusCounts} />
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <TeamOutlined style={{ color: "#da2c46" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  Role Distribution Details
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            <Spin spinning={isLoading}>
              {data?.roleCounts?.map((role, index) => (
                <div key={role._id} style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <Text style={{ fontSize: "16px", fontWeight: "500" }}>
                      {role._id.charAt(0).toUpperCase() + role._id.slice(1)}
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Text strong style={{ fontSize: "18px" }}>
                        {role.count}
                      </Text>
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        ({Math.round((role.count / totalUsers) * 100)}%)
                      </Text>
                    </div>
                  </div>
                  <Progress
                    percent={Math.round((role.count / totalUsers) * 100)}
                    strokeColor={{
                      "0%": ["#667eea", "#f093fb", "#4facfe", "#43e97b"][index],
                      "100%": ["#764ba2", "#f5576c", "#00f2fe", "#38f9d7"][
                        index
                      ],
                    }}
                    trailColor="#f0f2f5"
                    strokeWidth={10}
                    style={{ marginBottom: "8px" }}
                  />
                </div>
              ))}
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <TrophyOutlined style={{ color: "#da2c46" }} />
                <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  Status Overview
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            <Spin spinning={isLoading}>
              {data?.statusCounts?.map((status, index) => (
                <div
                  key={status._id}
                  style={{
                    marginBottom: "20px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${
                      ["#667eea", "#f093fb"][index]
                    }15, ${["#764ba2", "#f5576c"][index]}15)`,
                    border: `1px solid ${["#667eea", "#f093fb"][index]}30`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${
                          ["#667eea", "#f093fb"][index]
                        }, ${["#764ba2", "#f5576c"][index]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      {status.count}
                    </div>
                    <div>
                      <Text
                        style={{
                          fontSize: "16px",
                          fontWeight: "500",
                          display: "block",
                        }}
                      >
                        {status._id.charAt(0).toUpperCase() +
                          status._id.slice(1)}
                      </Text>
                      <Text style={{ fontSize: "12px", color: "#666" }}>
                        Candidates in this stage
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;

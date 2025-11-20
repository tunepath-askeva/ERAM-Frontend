import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Space,
  Typography,
  Progress,
  Row,
  Col,
  Statistic,
  Avatar,
  Alert,
  Button,
  Modal,
  Badge,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  RocketOutlined,
  EyeOutlined,
  UserAddOutlined,
  StarOutlined,
  FileTextOutlined,
  GiftOutlined,
  EditOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import { useGetWorkOrderDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;

const AdminWorkOrderStatus = ({
  jobId,
  numberOfCandidate,
  numberOfEmployees,
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { data, isLoading, error } = useGetWorkOrderDetailsQuery({ jobId });

  console.log("Props:", { numberOfCandidate, numberOfEmployees });
  console.log("Data:", data);

  // Updated status configuration with primary color theme
  const statusConfig = {
    applied: {
      color: "#da2c46",
      text: "Applied",
      icon: <FileTextOutlined />,
    },
    sourced: {
      color: "#1890ff",
      text: "Sourced",
      icon: <UserAddOutlined />,
    },
    screening: {
      color: "#fa8c16",
      text: "Screening",
      icon: <EyeOutlined />,
    },
    pipeline: {
      color: "#722ed1",
      text: "Pipeline",
      icon: <ClockCircleOutlined />,
    },
    interview: {
      color: "#faad14",
      text: "Interview",
      icon: <TeamOutlined />,
    },
    selected: {
      color: "#52c41a",
      text: "Selected",
      icon: <CheckCircleOutlined />,
    },
    approved: {
      color: "#13c2c2",
      text: "Approved",
      icon: <StarOutlined />,
    },
    offer: {
      color: "#eb2f96",
      text: "Offer",
      icon: <GiftOutlined />,
    },
    offer_pending: {
      color: "#fa541c",
      text: "Offer Pending",
      icon: <HourglassOutlined />,
    },
    offer_revised: {
      color: "#f5222d",
      text: "Offer Revised",
      icon: <EditOutlined />,
    },
    hired: {
      color: "#52c41a",
      text: "Hired",
      icon: <TrophyOutlined />,
    },
    completed: {
      color: "#389e0d",
      text: "Completed",
      icon: <RocketOutlined />,
    },
    rejected: {
      color: "#ff4d4f",
      text: "Rejected",
      icon: <CloseCircleOutlined />,
    },
    "in-pending": {
      color: "#8c8c8c",
      text: "In Pending",
      icon: <ClockCircleOutlined />,
    },
  };

  // Calculate status counts
  const getStatusCounts = () => {
    if (!data || !data.allWorkorderResponse) return {};

    return data.allWorkorderResponse.reduce((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1;
      return acc;
    }, {});
  };

  const statusCounts = getStatusCounts();
  const totalCandidates = data ? data.allWorkorderResponse.length : 0;

  // Use numberOfEmployees prop directly as it represents actual converted employees
  const convertedEmployees = numberOfEmployees || 0;
  const requiredCandidates = numberOfCandidate || 0;

  // Check if work order is complete
  const isWorkOrderComplete = convertedEmployees >= requiredCandidates;
  const completionPercentage =
    requiredCandidates > 0
      ? Math.round((convertedEmployees / requiredCandidates) * 100)
      : 0;

  useEffect(() => {
    if (isWorkOrderComplete && convertedEmployees > 0 && !showCompletionModal) {
      setShowCompletionModal(true);
    }
  }, [isWorkOrderComplete, convertedEmployees]);

  // Table columns with responsive design
  const columns = [
    {
      title: "Candidate",
      dataIndex: "user",
      key: "candidate",
      width: "40%",
      render: (user) => (
        <Space size="small">
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#da2c46" }}
            size="small"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 500,
                fontSize: "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.fullName || "N/A"}
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email}
            </Text>
          </div>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "35%",
      render: (status) => (
        <Tag
          color={statusConfig[status]?.color || "default"}
          icon={statusConfig[status]?.icon}
          style={{ borderRadius: "6px", fontWeight: 500 }}
        >
          {statusConfig[status]?.text || status}
        </Tag>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Sourced",
      dataIndex: "isSourced",
      key: "sourced",
      width: "25%",
      render: (isSourced) => (
        <Tag
          color={isSourced === "true" ? "#52c41a" : "#ff4d4f"}
          style={{ borderRadius: "6px" }}
        >
          {isSourced === "true" ? "Yes" : "No"}
        </Tag>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
  ];

  if (error) return <div>Error loading work order status</div>;

  return (
    <div
      style={{
        padding: "16px",
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <Title
          level={2}
          style={{
            color: "#da2c46",
            marginBottom: "4px",
            fontSize: "clamp(20px, 4vw, 28px)",
          }}
        >
          Work Order Status
        </Title>
        <Text type="secondary" style={{ fontSize: "clamp(12px, 2vw, 14px)" }}>
          Track candidate progress and monitor hiring targets
        </Text>
      </div>

      {isWorkOrderComplete && (
        <Alert
          message="🎉 Work Order Complete!"
          description={`Success! You have converted ${convertedEmployees} out of ${requiredCandidates} required candidates to employees. Consider raising a new request for additional hiring needs.`}
          type="success"
          showIcon
          action={
            <Button
              size="small"
              style={{
                backgroundColor: "#da2c46",
                borderColor: "#da2c46",
                color: "white",
              }}
              onClick={() => setShowCompletionModal(true)}
            >
              View Details
            </Button>
          }
          style={{
            marginBottom: "20px",
            borderRadius: "8px",
            border: `1px solid #52c41a`,
          }}
          closable
        />
      )}

      {/* Key Metrics Row - Responsive Grid */}
      <Row gutter={[12, 12]} style={{ marginBottom: "20px" }}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(218,44,70,0.1)",
              border: `1px solid #da2c46`,
              height: "100%",
            }}
          >
            <Statistic
              title={
                <Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
                  Required
                </Text>
              }
              value={requiredCandidates}
              prefix={<UserAddOutlined style={{ color: "#da2c46" }} />}
              valueStyle={{
                color: "#da2c46",
                fontWeight: "bold",
                fontSize: "clamp(16px, 4vw, 24px)",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(82,196,26,0.1)",
              border: `1px solid #52c41a`,
              height: "100%",
            }}
          >
            <Statistic
              title={
                <Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
                  Converted
                </Text>
              }
              value={convertedEmployees}
              prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontWeight: "bold",
                fontSize: "clamp(16px, 4vw, 24px)",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(114,46,209,0.1)",
              border: `1px solid #722ed1`,
              height: "100%",
            }}
          >
            <Statistic
              title={
                <Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
                  Total Candidates
                </Text>
              }
              value={totalCandidates}
              prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{
                color: "#722ed1",
                fontWeight: "bold",
                fontSize: "clamp(16px, 4vw, 24px)",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(250,140,22,0.1)",
              border: `1px solid #fa8c16`,
              height: "100%",
            }}
          >
            <Statistic
              title={
                <Text style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
                  Progress
                </Text>
              }
              value={completionPercentage}
              suffix="%"
              prefix={<RocketOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{
                color: isWorkOrderComplete ? "#52c41a" : "#fa8c16",
                fontWeight: "bold",
                fontSize: "clamp(16px, 4vw, 24px)",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Section */}
      <Card
        title={
          <Text style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 600 }}>
            Hiring Progress
          </Text>
        }
        size="small"
        style={{
          marginBottom: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <Progress
            percent={completionPercentage}
            status={isWorkOrderComplete ? "success" : "active"}
            strokeColor={
              isWorkOrderComplete
                ? "#52c41a"
                : {
                    "0%": "#da2c46",
                    "100%": "#52c41a",
                  }
            }
            strokeWidth={window.innerWidth < 768 ? 8 : 12}
            style={{ marginBottom: "12px" }}
          />
          <Row justify="space-between" align="middle">
            <Col>
              <Text
                type="secondary"
                style={{ fontSize: "clamp(11px, 2vw, 13px)" }}
              >
                Employees Converted: {convertedEmployees}/{requiredCandidates}
              </Text>
            </Col>
            <Col>
              <Text
                strong
                style={{
                  color: isWorkOrderComplete ? "#52c41a" : "#da2c46",
                  fontSize: "clamp(11px, 2vw, 13px)",
                }}
              >
                {completionPercentage}% Complete
              </Text>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Status Distribution - Responsive Grid */}
      <Row gutter={[8, 8]} style={{ marginBottom: "20px" }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={3} key={status}>
            <Card
              size="small"
              style={{
                borderRadius: "6px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                textAlign: "center",
                height: "80px",
              }}
              bodyStyle={{ padding: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Badge
                  count={count}
                  style={{
                    backgroundColor: statusConfig[status]?.color,
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                    {statusConfig[status]?.icon}
                  </div>
                </Badge>
                <Text
                  style={{
                    fontSize: "clamp(9px, 1.5vw, 11px)",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {statusConfig[status]?.text || status}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Candidates Table - Responsive */}
      <Card
        title={
          <Text style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 600 }}>
            Candidate Details
          </Text>
        }
        size="small"
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Table
          columns={columns}
          dataSource={data ? data.allWorkorderResponse : []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: window.innerWidth < 768 ? 5 : 10,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            size: "small",
          }}
          scroll={{ x: "100%" }}
          size="small"
        />
      </Card>

      {/* Completion Modal */}
      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ color: "#52c41a" }} />
            <span>Work Order Completed!</span>
          </Space>
        }
        open={showCompletionModal}
        onCancel={() => setShowCompletionModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowCompletionModal(false)}>
            Close
          </Button>,
         
        ]}
        width={Math.min(600, window.innerWidth - 32)}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <Title level={3} style={{ color: "#52c41a", marginBottom: "16px" }}>
            Congratulations!
          </Title>
          <Text
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              display: "block",
              marginBottom: "20px",
            }}
          >
            You have successfully converted{" "}
            <strong>{convertedEmployees}</strong> out of{" "}
            <strong>{requiredCandidates}</strong> required candidates to
            employees.
          </Text>
          <Alert
            message="Recommendation"
            description="Since you've met your hiring target, consider raising a new work order request if you anticipate future hiring needs."
            type="info"
            showIcon
            style={{ textAlign: "left" }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminWorkOrderStatus;

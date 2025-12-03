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
  Timeline,
  Descriptions,
  Steps,
  Divider,
  Empty,
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
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  LoadingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useGetWorkOrderDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { Step } = Steps;

const AdminWorkOrderStatus = ({
  jobId,
  numberOfCandidate,
  numberOfEmployees,
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Add state
  const [pageSize, setPageSize] = useState(10); // Add state

  const { data, isLoading, error } = useGetWorkOrderDetailsQuery({
    jobId,
    page: currentPage,
    limit: pageSize,
  });

  // Status configuration
  const statusConfig = {
    applied: { color: "#da2c46", text: "Applied", icon: <FileTextOutlined /> },
    sourced: { color: "#1890ff", text: "Sourced", icon: <UserAddOutlined /> },
    screening: { color: "#fa8c16", text: "Screening", icon: <EyeOutlined /> },
    pipeline: {
      color: "#722ed1",
      text: "Pipeline",
      icon: <ClockCircleOutlined />,
    },
    interview: { color: "#faad14", text: "Interview", icon: <TeamOutlined /> },
    selected: {
      color: "#52c41a",
      text: "Selected",
      icon: <CheckCircleOutlined />,
    },
    approved: { color: "#13c2c2", text: "Approved", icon: <StarOutlined /> },
    offer: { color: "#eb2f96", text: "Offer", icon: <GiftOutlined /> },
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
    hired: { color: "#52c41a", text: "Hired", icon: <TrophyOutlined /> },
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

  const stageStatusConfig = {
    pending: { color: "default", icon: <ClockCircleOutlined /> },
    inProgress: { color: "processing", icon: <LoadingOutlined /> },
    approved: { color: "success", icon: <CheckOutlined /> },
    rejected: { color: "error", icon: <StopOutlined /> },
  };

  // Show candidate details modal
  const showCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailModalVisible(true);
  };

  // Calculate status counts
  const getStatusCounts = () => {
    if (!data || !data.candidates) return {};
    return data.candidates.reduce((acc, candidate) => {
      acc[candidate.currentStatus] = (acc[candidate.currentStatus] || 0) + 1;
      return acc;
    }, {});
  };

  const statusCounts = data?.summary?.statusDistribution || {};
  const totalCandidates = data?.pagination?.totalRecords || 0;
  const convertedEmployees = numberOfEmployees || 0;
  const requiredCandidates = numberOfCandidate || 0;
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

  // Enhanced table columns
  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidate",
      key: "candidate",
      width: "25%",
      render: (candidate) => (
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
              {candidate?.fullName || "N/A"}
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
              {candidate?.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Current Status",
      dataIndex: "currentStatus",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag
          color={statusConfig[status]?.color || "default"}
          icon={statusConfig[status]?.icon}
          style={{ borderRadius: "6px", fontWeight: 500 }}
        >
          {statusConfig[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: "Current Pipeline",
      dataIndex: "currentStage",
      key: "pipeline",
      width: "15%",
      render: (currentStage) => (
        <Text style={{ fontSize: "12px" }}>
          {currentStage?.pipelineName || "N/A"}
        </Text>
      ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Current Stage",
      dataIndex: "currentStage",
      key: "stage",
      width: "20%",
      render: (currentStage) => (
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>
            {currentStage?.stageName || "N/A"}
          </div>
          {currentStage && (
            <Tag
              color={stageStatusConfig[currentStage.stageStatus]?.color}
              icon={stageStatusConfig[currentStage.stageStatus]?.icon}
              style={{ fontSize: "11px", marginTop: "4px" }}
            >
              {currentStage.stageStatus}
            </Tag>
          )}
        </div>
      ),
      responsive: ["lg", "xl"],
    },
    {
      title: "Progress",
      dataIndex: "stageProgressionSummary",
      key: "progress",
      width: "15%",
      render: (summary) => (
        <div>
          <Progress
            percent={summary?.progressPercentage || 0}
            size="small"
            strokeColor="#52c41a"
            style={{ marginBottom: "4px" }}
          />
          <Text style={{ fontSize: "11px" }} type="secondary">
            {summary?.completedStages || 0}/{summary?.totalStages || 0} stages
          </Text>
        </div>
      ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Action",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showCandidateDetails(record)}
          style={{ borderColor: "#da2c46", color: "#da2c46" }}
        >
          Details
        </Button>
      ),
    },
  ];

  if (error)
    return <Alert message="Error loading work order status" type="error" />;

  return (
    <div
      style={{
        padding: "16px",
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
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

      {/* Completion Alert */}
      {isWorkOrderComplete && (
        <Alert
          message="🎉 Work Order Complete!"
          description={`Success! You have converted ${convertedEmployees} out of ${requiredCandidates} required candidates to employees.`}
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

      {/* Key Metrics */}
      <Row gutter={[12, 12]} style={{ marginBottom: "20px" }}>
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
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
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
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
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
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
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: "8px",
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
        <Progress
          percent={completionPercentage}
          status={isWorkOrderComplete ? "success" : "active"}
          strokeColor={
            isWorkOrderComplete
              ? "#52c41a"
              : { "0%": "#da2c46", "100%": "#52c41a" }
          }
          strokeWidth={12}
          style={{ marginBottom: "12px" }}
        />
        <Row justify="space-between">
          <Text type="secondary" style={{ fontSize: "clamp(11px, 2vw, 13px)" }}>
            Employees Converted: {convertedEmployees}/{requiredCandidates}
          </Text>
          <Text
            strong
            style={{
              color: isWorkOrderComplete ? "#52c41a" : "#da2c46",
              fontSize: "clamp(11px, 2vw, 13px)",
            }}
          >
            {completionPercentage}% Complete
          </Text>
        </Row>
      </Card>

      {/* Status Distribution */}
      <Row gutter={[8, 8]} style={{ marginBottom: "20px" }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={3} key={status}>
            <Card
              size="small"
              style={{
                borderRadius: "6px",
                textAlign: "center",
                height: "80px",
              }}
              bodyStyle={{ padding: "8px" }}
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
            </Card>
          </Col>
        ))}
      </Row>

      {/* Candidates Table */}
      <Card
        title={
          <Text style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 600 }}>
            Candidate Details
          </Text>
        }
        size="small"
        style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <Table
          columns={columns}
          dataSource={data ? data.candidates : []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.pagination?.totalRecords || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            size: "small",
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: "100%" }}
          size="small"
        />
      </Card>

      {/* Candidate Detail Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: "#da2c46" }} />
            <span>
              {selectedCandidate?.candidate?.fullName || "Candidate"} - Journey
              Details
            </span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={Math.min(900, window.innerWidth - 32)}
        style={{ top: 20 }}
      >
        {selectedCandidate && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Candidate Basic Info */}
            <Card
              size="small"
              title="Candidate Information"
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Name" span={2}>
                  <Text strong>{selectedCandidate.candidate.fullName}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> Email
                    </>
                  }
                >
                  {selectedCandidate.candidate.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> Phone
                    </>
                  }
                >
                  {selectedCandidate.candidate.phone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <EnvironmentOutlined /> Location
                    </>
                  }
                >
                  {selectedCandidate.candidate.location || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Applied At">
                  {new Date(selectedCandidate.appliedAt).toLocaleDateString()}
                </Descriptions.Item>
                {selectedCandidate.candidate.skills?.length > 0 && (
                  <Descriptions.Item label="Skills" span={2}>
                    {selectedCandidate.candidate.skills.map((skill, i) => (
                      <Tag key={i} color="blue">
                        {skill}
                      </Tag>
                    ))}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Current Status & Stage */}
            <Card
              size="small"
              title="Current Status"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Status: </Text>
                  <Tag
                    color={statusConfig[selectedCandidate.currentStatus]?.color}
                    icon={statusConfig[selectedCandidate.currentStatus]?.icon}
                  >
                    {statusConfig[selectedCandidate.currentStatus]?.text}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Sourced: </Text>
                  <Tag
                    color={
                      selectedCandidate.isSourced === "true"
                        ? "#52c41a"
                        : "#ff4d4f"
                    }
                  >
                    {selectedCandidate.isSourced === "true" ? "Yes" : "No"}
                  </Tag>
                </Col>
              </Row>
              {selectedCandidate.currentStage && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Current Pipeline" span={2}>
                      <Text strong>
                        {selectedCandidate.currentStage.pipelineName}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Stage">
                      {selectedCandidate.currentStage.stageName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Stage Status">
                      <Tag
                        color={
                          stageStatusConfig[
                            selectedCandidate.currentStage.stageStatus
                          ]?.color
                        }
                      >
                        {selectedCandidate.currentStage.stageStatus}
                      </Tag>
                    </Descriptions.Item>
                    {selectedCandidate.currentStage.recruiter && (
                      <Descriptions.Item label="Assigned Recruiter" span={2}>
                        <Space>
                          <Avatar size="small" icon={<UserOutlined />} />
                          <span>
                            {selectedCandidate.currentStage.recruiter.name}
                          </span>
                        </Space>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </>
              )}
            </Card>

            {/* Stage Progress Summary */}
            {selectedCandidate.stageProgressionSummary && (
              <Card
                size="small"
                title="Stage Progress Summary"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Total Stages"
                      value={
                        selectedCandidate.stageProgressionSummary.totalStages
                      }
                      valueStyle={{ fontSize: "20px" }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Completed"
                      value={
                        selectedCandidate.stageProgressionSummary
                          .completedStages
                      }
                      valueStyle={{ fontSize: "20px", color: "#52c41a" }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="In Progress"
                      value={
                        selectedCandidate.stageProgressionSummary
                          .inProgressStages
                      }
                      valueStyle={{ fontSize: "20px", color: "#1890ff" }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Progress"
                      value={
                        selectedCandidate.stageProgressionSummary
                          .progressPercentage
                      }
                      suffix="%"
                      valueStyle={{ fontSize: "20px", color: "#fa8c16" }}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* Complete Pipeline Journey */}
            {selectedCandidate.stageHistory?.length > 0 && (
              <Card
                size="small"
                title="Complete Pipeline Journey"
                style={{ marginBottom: 16 }}
              >
                <Timeline mode="left">
                  {selectedCandidate.stageHistory.map((stage, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        stage.stageStatus === "approved"
                          ? "green"
                          : stage.stageStatus === "inProgress"
                          ? "blue"
                          : stage.stageStatus === "rejected"
                          ? "red"
                          : "gray"
                      }
                      dot={stageStatusConfig[stage.stageStatus]?.icon}
                    >
                      <Card size="small" style={{ marginBottom: 8 }}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong style={{ fontSize: "14px" }}>
                            Stage {stage.stageNumber}: {stage.stageName}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Tag color="purple">{stage.pipelineName}</Tag>
                            <Tag
                              color={
                                stageStatusConfig[stage.stageStatus]?.color
                              }
                            >
                              {stage.stageStatus}
                            </Tag>
                          </div>
                        </div>

                        {stage.recruiter && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Work order Assigned Recruiter:{" "}
                            </Text>
                            <Space size="small">
                              <Avatar size="small" icon={<UserOutlined />} />
                              <Text style={{ fontSize: "12px" }}>
                                {stage.recruiter.name}
                              </Text>
                            </Space>
                          </div>
                        )}

                        {stage.stageDefinition?.assignedRecruiters?.length >
                          0 && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Stage Assigned Recruiter:{" "}
                            </Text>
                            {stage.stageDefinition.assignedRecruiters.map(
                              (rec, i) => (
                                <Tag key={i} size="small">
                                  {rec.fullName}
                                </Tag>
                              )
                            )}
                          </div>
                        )}

                        {stage.stageCompletedAt && (
                          <div style={{ marginTop: 8 }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              Completed:{" "}
                              {new Date(
                                stage.stageCompletedAt
                              ).toLocaleString()}
                            </Text>
                          </div>
                        )}

                        {stage.reviews?.length > 0 && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: 8,
                              background: "#f5f5f5",
                              borderRadius: 4,
                            }}
                          >
                            <Text strong style={{ fontSize: "12px" }}>
                              Reviews:
                            </Text>
                            {stage.reviews.map((review, i) => (
                              <div key={i} style={{ marginTop: 4 }}>
                                <Text style={{ fontSize: "11px" }}>
                                  {review.reviewer?.name}: {review.comments}
                                  <Tag
                                    size="small"
                                    color={
                                      review.status === "approved"
                                        ? "green"
                                        : "orange"
                                    }
                                    style={{ marginLeft: 8 }}
                                  >
                                    {review.status}
                                  </Tag>
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {/* Pending Stages */}
            {selectedCandidate.pendingStages?.length > 0 && (
              <Card
                size="small"
                title="Pending Stages"
                style={{ marginBottom: 16 }}
              >
                {selectedCandidate.pendingStages.map((stage, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ marginBottom: 8, background: "#f0f0f0" }}
                  >
                    <Text strong>{stage.stageName}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="purple">{stage.pipelineName}</Tag>
                      <Tag>Order: {stage.stageOrder}</Tag>
                    </div>
                    {stage.assignedRecruiters?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Assigned:{" "}
                        </Text>
                        {stage.assignedRecruiters.map((rec, i) => (
                          <Tag key={i} size="small">
                            {rec.fullName}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </Card>
            )}

            {/* Interview History */}
            {selectedCandidate.interviews?.length > 0 && (
              <Card
                size="small"
                title="Interview History"
                style={{ marginBottom: 16 }}
              >
                {selectedCandidate.interviews.map((interview, index) => (
                  <Card key={index} size="small" style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text strong>{interview.title}</Text>
                      <div>
                        <Tag color="blue">{interview.mode}</Tag>
                        <Tag
                          color={
                            interview.status === "interview_completed"
                              ? "green"
                              : "orange"
                          }
                        >
                          {interview.status}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <CalendarOutlined />{" "}
                        {new Date(interview.date).toLocaleString()}
                      </Text>
                      {interview.interviewers?.length > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Interviewers:{" "}
                          </Text>
                          {interview.interviewers.map((interviewer, i) => (
                            <Tag key={i} size="small">
                              {interviewer.name}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </Space>
                  </Card>
                ))}
              </Card>
            )}

            {/* Offer Details */}
            {selectedCandidate.offers?.length > 0 && (
              <Card size="small" title="Offer Details">
                {selectedCandidate.offers.map((offer, index) => (
                  <Card key={index} size="small" style={{ marginBottom: 8 }}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Status">
                        <Tag color="green">{offer.currentStatus}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Salary Package">
                        {offer.salaryPackage}
                      </Descriptions.Item>
                      <Descriptions.Item label="Description">
                        {offer.description}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ))}
              </Card>
            )}
          </div>
        )}
      </Modal>

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
            style={{ fontSize: "16px", display: "block", marginBottom: "20px" }}
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

import React, { useState, useEffect } from "react";
import {
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
  Timeline,
  Descriptions,
  Divider,
  List,
  Spin,
  Grid,
  Tabs,
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
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  LinkOutlined,
  HistoryOutlined,
  CloseOutlined,
  ClusterOutlined,
  SolutionOutlined,
  AuditOutlined,
  GlobalOutlined,
  BankOutlined,
  ScheduleOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useGetWorkOrderDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const calculateOverdueDays = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  if (today > end) {
    const diffTime = Math.abs(today - end);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
};

const AdminWorkOrderStatus = ({
  jobId,
  numberOfCandidate,
  numberOfEmployees,
}) => {
  const screens = useBreakpoint();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [allCandidateData, setAllCandidateData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const { data, isLoading, refetch, isFetching } = useGetWorkOrderDetailsQuery({
    jobId,
    page: currentPage,
    limit: pageSize,
  });

  useEffect(() => {
    if (data?.candidates) {
      setAllCandidateData(data.candidates);
      setHasMore(data?.hasMore);
    }
  }, [data]);

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

  const getStatusTag = (status) => {
    const config = statusConfig[status];
    return (
      <Badge
        status={
          status === "selected" || status === "approved" || status === "hired"
            ? "success"
            : status === "rejected"
            ? "error"
            : "processing"
        }
        text={config?.text || status}
      />
    );
  };

  const getStatusColor = (status) => {
    return statusConfig[status]?.color || "default";
  };

  const handleNext = () => {
    if (hasMore) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const toggleCandidateExpansion = (candidateId) => {
    setExpandedCandidate(
      expandedCandidate === candidateId ? null : candidateId
    );
  };

  const showFullDetailsModal = (candidateData) => {
    setSelectedCandidate(candidateData);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCandidate(null);
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

  const FullDetailsModal = () => {
    if (!selectedCandidate) return null;

    const candidate = selectedCandidate.candidate;
    const workOrder = data?.workorder;
    const isMobile = !screens.md;

    return (
      <Modal
        title={
          <Space>
            <Avatar icon={<UserOutlined />} size="large" />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {candidate.fullName}
              </Title>
              <Text type="secondary">{candidate.email}</Text>
            </div>
          </Space>
        }
        open={modalVisible}
        onCancel={handleModalClose}
        width={isMobile ? "100%" : 1200}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        bodyStyle={{ padding: 0, maxHeight: "80vh", overflowY: "auto" }}
      >
        <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
          {/* Tab 1: Candidate Profile */}
          <TabPane
            tab={
              <span>
                <UserOutlined /> Profile
              </span>
            }
            key="1"
          >
            <Row gutter={isMobile ? [0, 16] : 24}>
              <Col xs={24} md={12}>
                <Card title="Personal Information" size="small">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Full Name">
                      <Text strong>{candidate.fullName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Candidate ID">
                      <Tag color="blue">{candidate.uniqueCode}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        <a href={`mailto:${candidate.email}`}>
                          {candidate.email}
                        </a>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <a href={`tel:${candidate.phone}`}>{candidate.phone}</a>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nationality">
                      <Space>
                        <GlobalOutlined />
                        {candidate.nationality}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Candidate Type">
                      <Tag color="purple">{candidate.candidateType}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Experience">
                      <ScheduleOutlined /> {candidate.totalExperienceYears}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Professional Details"
                  size="small"
                  style={{ marginTop: 16 }}
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Specialization">
                      {candidate.specialization}
                    </Descriptions.Item>
                    <Descriptions.Item label="Company">
                      <BankOutlined /> {candidate.companyName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Qualifications">
                      {candidate.qualifications?.length > 0
                        ? candidate.qualifications.map((q, i) => (
                            <Tag key={i}>{q}</Tag>
                          ))
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Skills">
                      {candidate.skills?.length > 0
                        ? candidate.skills.map((skill, i) => (
                            <Tag key={i} color="cyan">
                              {skill}
                            </Tag>
                          ))
                        : "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Work Order Details" size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: "#fafafa",
                        borderRadius: 8,
                      }}
                    >
                      <Title level={5}>{workOrder?.title}</Title>
                      <Space wrap>
                        <Tag color="blue">{workOrder?.jobCode}</Tag>
                        <Tag
                          color={
                            workOrder?.workplace === "on-site"
                              ? "green"
                              : "orange"
                          }
                        >
                          {workOrder?.workplace}
                        </Tag>
                      </Space>
                      <Divider style={{ margin: "12px 0" }} />
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Location">
                          <EnvironmentOutlined /> {workOrder?.officeLocation}
                        </Descriptions.Item>
                        <Descriptions.Item label="Job Function">
                          <TeamOutlined /> {workOrder?.jobFunction}
                        </Descriptions.Item>
                        <Descriptions.Item label="Industry">
                          <BankOutlined /> {workOrder?.companyIndustry}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    <Card
                      title="Current Status"
                      size="small"
                      style={{ marginTop: 16 }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <Text strong>Application Status:</Text>
                          <Tag
                            color={getStatusColor(
                              selectedCandidate.currentStatus
                            )}
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                          >
                            {selectedCandidate.currentStatus?.toUpperCase()}
                          </Tag>
                        </div>

                        {selectedCandidate.isSourced === "true" && (
                          <Tag color="purple" style={{ marginTop: 8 }}>
                            <SolutionOutlined /> Sourced Candidate
                          </Tag>
                        )}

                        {selectedCandidate.selectedMovingComment && (
                          <>
                            <Divider style={{ margin: "8px 0" }} />
                            <Text strong>Selection Comments:</Text>
                            <Text
                              type="secondary"
                              style={{ fontStyle: "italic", display: "block" }}
                            >
                              "{selectedCandidate.selectedMovingComment}"
                            </Text>
                          </>
                        )}

                        <Divider style={{ margin: "8px 0" }} />
                        <Text strong>Timeline:</Text>
                        <Text type="secondary" style={{ display: "block" }}>
                          Created:{" "}
                          {dayjs(selectedCandidate.appliedAt).format(
                            "DD MMM YYYY, hh:mm A"
                          )}
                        </Text>
                        <Text type="secondary" style={{ display: "block" }}>
                          Last Updated:{" "}
                          {dayjs(selectedCandidate.lastUpdatedAt).format(
                            "DD MMM YYYY, hh:mm A"
                          )}
                        </Text>
                      </Space>
                    </Card>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 2: Pipeline Stages */}
          <TabPane
            tab={
              <span>
                <ClusterOutlined /> Pipeline Stages
              </span>
            }
            key="2"
          >
            {selectedCandidate.stageHistory?.length > 0 ? (
              <Row gutter={24}>
                <Col span={24}>
                  <Card title="Stage Progress" size="small">
                    <Timeline mode={isMobile ? "left" : "alternate"}>
                      {[...(selectedCandidate.stageHistory || [])]
                        .sort(
                          (a, b) => (a.stageOrder || 0) - (b.stageOrder || 0)
                        )
                        .map((stage) => (
                          <Timeline.Item
                            key={stage.stageId}
                            color={
                              stage.stageStatus === "approved"
                                ? "green"
                                : stage.stageStatus === "pending"
                                ? "orange"
                                : "red"
                            }
                            label={
                              stage.stageDefinition?.startDate && (
                                <Space direction="vertical" size={0}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Start:{" "}
                                    {dayjs(
                                      stage.stageDefinition.startDate
                                    ).format("DD MMM YYYY")}
                                  </Text>
                                  {stage.stageDefinition.endDate && (
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}
                                    >
                                      End:{" "}
                                      {dayjs(
                                        stage.stageDefinition.endDate
                                      ).format("DD MMM YYYY")}
                                    </Text>
                                  )}
                                </Space>
                              )
                            }
                          >
                            <Card
                              size="small"
                              title={
                                <Space wrap>
                                  <Text strong>{stage.stageName}</Text>
                                  <Tag
                                    color={
                                      stage.stageStatus === "approved"
                                        ? "green"
                                        : stage.stageStatus === "pending"
                                        ? "orange"
                                        : "red"
                                    }
                                  >
                                    {stage.stageStatus}
                                  </Tag>
                                  {stage.approval && (
                                    <Tag color="purple">
                                      <AuditOutlined /> Requires Approval
                                    </Tag>
                                  )}
                                </Space>
                              }
                              style={{ marginBottom: 8 }}
                            >
                              <Descriptions
                                column={isMobile ? 1 : 2}
                                size="small"
                              >
                                <Descriptions.Item label="Pipeline">
                                  {stage.pipelineName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Stage Order">
                                  Stage {stage.stageNumber}
                                </Descriptions.Item>
                                {stage.stageCompletedAt && (
                                  <Descriptions.Item label="Completed At">
                                    {dayjs(stage.stageCompletedAt).format(
                                      "DD MMM YYYY, hh:mm A"
                                    )}
                                  </Descriptions.Item>
                                )}
                              </Descriptions>

                              {/* Approval Summary */}
                              {stage.approvalSummary && (
                                <>
                                  <Divider
                                    style={{ margin: "8px 0" }}
                                    orientation="left"
                                  >
                                    Approval Details
                                  </Divider>
                                  {Object.entries(stage.approvalSummary).map(
                                    ([level, detail]) => (
                                      <Card
                                        key={level}
                                        size="small"
                                        style={{ marginBottom: 8 }}
                                      >
                                        <Space
                                          direction="vertical"
                                          style={{ width: "100%" }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <Text strong>{level}</Text>
                                            <Tag
                                              color={
                                                detail.status === "approved"
                                                  ? "green"
                                                  : detail.status === "rejected"
                                                  ? "red"
                                                  : "orange"
                                              }
                                            >
                                              {detail.status}
                                            </Tag>
                                          </div>
                                          {detail.reviewer && (
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 12 }}
                                            >
                                              Reviewer: {detail.reviewer.name}
                                            </Text>
                                          )}
                                          {detail.comment && (
                                            <Text style={{ fontSize: 12 }}>
                                              Comment: {detail.comment}
                                            </Text>
                                          )}
                                          {detail.reviewedAt && (
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: 11 }}
                                            >
                                              {dayjs(detail.reviewedAt).format(
                                                "DD MMM YYYY, hh:mm A"
                                              )}
                                            </Text>
                                          )}
                                        </Space>
                                      </Card>
                                    )
                                  )}
                                </>
                              )}

                              {/* Recruiter Reviews */}
                              {stage.reviews?.length > 0 && (
                                <>
                                  <Divider
                                    style={{ margin: "8px 0" }}
                                    orientation="left"
                                  >
                                    Reviews ({stage.reviews.length})
                                  </Divider>
                                  <List
                                    size="small"
                                    dataSource={stage.reviews}
                                    renderItem={(review) => (
                                      <List.Item>
                                        <List.Item.Meta
                                          avatar={
                                            <Avatar
                                              size="small"
                                              icon={<UserOutlined />}
                                            />
                                          }
                                          title={
                                            <Space wrap>
                                              <Text>
                                                {review.reviewer?.name}
                                              </Text>
                                              <Tag
                                                color={
                                                  review.status === "approved"
                                                    ? "green"
                                                    : review.status ===
                                                      "pending"
                                                    ? "orange"
                                                    : "red"
                                                }
                                                size="small"
                                              >
                                                {review.status}
                                              </Tag>
                                            </Space>
                                          }
                                          description={
                                            <>
                                              {review.comments && (
                                                <Text
                                                  style={{
                                                    display: "block",
                                                    marginBottom: 4,
                                                  }}
                                                >
                                                  {review.comments}
                                                </Text>
                                              )}
                                              <Text
                                                type="secondary"
                                                style={{ fontSize: 12 }}
                                              >
                                                {review.reviewedAt
                                                  ? dayjs(
                                                      review.reviewedAt
                                                    ).format(
                                                      "DD MMM YYYY, hh:mm A"
                                                    )
                                                  : "Not reviewed yet"}
                                              </Text>
                                            </>
                                          }
                                        />
                                      </List.Item>
                                    )}
                                  />
                                </>
                              )}

                              {/* Uploaded Documents */}
                              {stage.uploadedDocuments?.length > 0 && (
                                <>
                                  <Divider
                                    style={{ margin: "8px 0" }}
                                    orientation="left"
                                  >
                                    Documents ({stage.uploadedDocuments.length})
                                  </Divider>
                                  <Row gutter={[8, 8]}>
                                    {stage.uploadedDocuments.map((doc) => (
                                      <Col key={doc._id} xs={24} sm={12}>
                                        <Card size="small" hoverable>
                                          <Space>
                                            <FilePdfOutlined
                                              style={{ color: "#ff4d4f" }}
                                            />
                                            <div style={{ flex: 1 }}>
                                              <Text
                                                strong
                                                style={{ fontSize: 12 }}
                                              >
                                                {doc.documentName}
                                              </Text>
                                              <div style={{ marginTop: 4 }}>
                                                <Button
                                                  type="link"
                                                  size="small"
                                                  href={doc.fileUrl}
                                                  target="_blank"
                                                  icon={<EyeOutlined />}
                                                >
                                                  View
                                                </Button>
                                                <Button
                                                  type="link"
                                                  size="small"
                                                  href={doc.fileUrl}
                                                  icon={<DownloadOutlined />}
                                                >
                                                  Download
                                                </Button>
                                              </div>
                                            </div>
                                          </Space>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                </>
                              )}
                            </Card>
                          </Timeline.Item>
                        ))}
                    </Timeline>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Card>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <InfoCircleOutlined
                    style={{ fontSize: 48, color: "#d9d9d9" }}
                  />
                  <Title level={4} style={{ marginTop: 16 }}>
                    No Pipeline Stages
                  </Title>
                  <Text type="secondary">
                    This candidate doesn't have any pipeline stages.
                  </Text>
                </div>
              </Card>
            )}
          </TabPane>

          {/* Tab 3: Interview Details */}
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Interviews
              </span>
            }
            key="3"
          >
            {selectedCandidate.interviews?.length > 0 ? (
              <Card title="Interview History" size="small">
                <Timeline mode={isMobile ? "left" : "alternate"}>
                  {selectedCandidate.interviews.map((interview, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        interview.status === "interview_completed"
                          ? "green"
                          : interview.status === "fail" ||
                            interview.status === "interview_rejected"
                          ? "red"
                          : interview.status === "scheduled"
                          ? "orange"
                          : "gray"
                      }
                      label={
                        interview.date && (
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(interview.date).format("DD MMM YYYY")}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(interview.date).format("hh:mm A")}
                            </Text>
                          </Space>
                        )
                      }
                    >
                      <Card
                        size="small"
                        title={
                          <Space wrap>
                            <Text strong>{interview.title}</Text>
                            <Tag
                              color={
                                interview.status === "interview_completed"
                                  ? "green"
                                  : interview.status === "fail" ||
                                    interview.status === "interview_rejected"
                                  ? "red"
                                  : interview.status === "scheduled"
                                  ? "orange"
                                  : "gray"
                              }
                            >
                              {interview.status?.replace("_", " ")}
                            </Tag>
                          </Space>
                        }
                        style={{ marginBottom: 8 }}
                      >
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="Mode">
                            <Tag color="cyan">{interview.mode}</Tag>
                          </Descriptions.Item>

                          {interview.mode === "in-person" &&
                            interview.location && (
                              <Descriptions.Item label="Location">
                                <EnvironmentOutlined /> {interview.location}
                              </Descriptions.Item>
                            )}

                          {interview.mode === "online" &&
                            interview.meetingLink && (
                              <Descriptions.Item label="Meeting Link">
                                <a
                                  href={interview.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <LinkOutlined /> Join Meeting
                                </a>
                              </Descriptions.Item>
                            )}

                          {interview.notes && (
                            <Descriptions.Item label="Notes">
                              <Text>{interview.notes}</Text>
                            </Descriptions.Item>
                          )}

                          {interview.interviewers?.length > 0 && (
                            <Descriptions.Item label="Interviewers">
                              <Space wrap>
                                {interview.interviewers.map(
                                  (interviewer, idx) => (
                                    <Tag key={idx} color="purple">
                                      {interviewer.name}
                                    </Tag>
                                  )
                                )}
                              </Space>
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <InfoCircleOutlined
                    style={{ fontSize: 48, color: "#d9d9d9" }}
                  />
                  <Title level={4} style={{ marginTop: 16 }}>
                    No Interviews
                  </Title>
                  <Text type="secondary">
                    No interview details available for this candidate.
                  </Text>
                </div>
              </Card>
            )}
          </TabPane>

          {/* Tab 4: Offer Details */}
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined /> Offers
              </span>
            }
            key="4"
          >
            {selectedCandidate.offers?.length > 0 ? (
              <Card title="Offer Details" size="small">
                {selectedCandidate.offers.map((offer, index) => (
                  <Card
                    key={index}
                    size="small"
                    title={`Offer ${index + 1}`}
                    style={{ marginBottom: 16 }}
                    extra={
                      <Tag
                        color={
                          offer.currentStatus === "offer-accepted"
                            ? "green"
                            : offer.currentStatus === "offer-rejected"
                            ? "red"
                            : offer.currentStatus === "offer-revised"
                            ? "orange"
                            : "blue"
                        }
                      >
                        {offer.currentStatus?.replace("-", " ")}
                      </Tag>
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {offer.salaryPackage && (
                        <div>
                          <Text strong>Salary Package:</Text>
                          <Title level={5} style={{ margin: "4px 0" }}>
                            {offer.salaryPackage}
                          </Title>
                        </div>
                      )}

                      {offer.description && (
                        <div>
                          <Text strong>Description:</Text>
                          <Text style={{ display: "block" }}>
                            {offer.description}
                          </Text>
                        </div>
                      )}

                      {offer.offerDocument && (
                        <Card size="small" title="Offer Document">
                          <Space>
                            <FilePdfOutlined
                              style={{ color: "#ff4d4f", fontSize: 20 }}
                            />
                            <div>
                              <Text strong>
                                {offer.offerDocument.documentName}
                              </Text>
                              <div style={{ marginTop: 4 }}>
                                <Button
                                  type="link"
                                  size="small"
                                  href={offer.offerDocument.fileUrl}
                                  target="_blank"
                                  icon={<EyeOutlined />}
                                >
                                  View
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  href={offer.offerDocument.fileUrl}
                                  icon={<DownloadOutlined />}
                                >
                                  Download
                                </Button>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: 8, fontSize: 12 }}
                                >
                                  {dayjs(offer.offerDocument.uploadedAt).format(
                                    "DD MMM YYYY"
                                  )}
                                </Text>
                              </div>
                            </div>
                          </Space>
                        </Card>
                      )}

                      {offer.signedOfferDocument && (
                        <Card
                          size="small"
                          title="Signed Offer Document"
                          style={{ marginTop: 8 }}
                        >
                          <Space>
                            <FilePdfOutlined
                              style={{ color: "#52c41a", fontSize: 20 }}
                            />
                            <div>
                              <Text strong>
                                {offer.signedOfferDocument.documentName}
                              </Text>
                              <div style={{ marginTop: 4 }}>
                                <Button
                                  type="link"
                                  size="small"
                                  href={offer.signedOfferDocument.fileUrl}
                                  target="_blank"
                                  icon={<EyeOutlined />}
                                >
                                  View
                                </Button>
                                <Button
                                  type="link"
                                  size="small"
                                  href={offer.signedOfferDocument.fileUrl}
                                  icon={<DownloadOutlined />}
                                >
                                  Download
                                </Button>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: 8, fontSize: 12 }}
                                >
                                  {dayjs(
                                    offer.signedOfferDocument.uploadedAt
                                  ).format("DD MMM YYYY")}
                                </Text>
                              </div>
                            </div>
                          </Space>
                        </Card>
                      )}

                      {/* Offer Status History */}
                      {offer.statusHistory?.length > 0 && (
                        <Card
                          size="small"
                          title="Status History"
                          style={{ marginTop: 8 }}
                        >
                          <Timeline>
                            {offer.statusHistory.map((history, idx) => (
                              <Timeline.Item
                                key={idx}
                                color={
                                  history.status === "offer-accepted"
                                    ? "green"
                                    : history.status === "offer-rejected"
                                    ? "red"
                                    : history.status === "offer-revised"
                                    ? "orange"
                                    : "blue"
                                }
                              >
                                <Space direction="vertical">
                                  <Space>
                                    <Text strong>Status changed to:</Text>
                                    <Tag
                                      color={
                                        history.status === "offer-accepted"
                                          ? "green"
                                          : history.status === "offer-rejected"
                                          ? "red"
                                          : history.status === "offer-revised"
                                          ? "orange"
                                          : "blue"
                                      }
                                    >
                                      {history.status?.replace("-", " ")}
                                    </Tag>
                                  </Space>
                                  {history.description && (
                                    <Text type="secondary">
                                      {history.description}
                                    </Text>
                                  )}
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    <CalendarOutlined />{" "}
                                    {dayjs(history.changedAt).format(
                                      "DD MMM YYYY, hh:mm A"
                                    )}
                                  </Text>
                                </Space>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        </Card>
                      )}
                    </Space>
                  </Card>
                ))}
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <InfoCircleOutlined
                    style={{ fontSize: 48, color: "#d9d9d9" }}
                  />
                  <Title level={4} style={{ marginTop: 16 }}>
                    No Offers
                  </Title>
                  <Text type="secondary">
                    No offer details available for this candidate.
                  </Text>
                </div>
              </Card>
            )}
          </TabPane>

          {/* Tab 5: Status History */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined /> Status History
              </span>
            }
            key="5"
          >
            <Card title="Status History Tracking" size="small">
              {selectedCandidate.statusHistory?.length > 0 ? (
                <Timeline mode={isMobile ? "left" : "alternate"}>
                  {selectedCandidate.statusHistory.map((historyItem, idx) => (
                    <Timeline.Item
                      key={idx}
                      color={getStatusColor(historyItem.status)}
                      dot={
                        historyItem.status === "selected" ||
                        historyItem.status === "approved" ? (
                          <CheckOutlined />
                        ) : historyItem.status === "rejected" ||
                          historyItem.status === "interview_rejected" ? (
                          <CloseOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                    >
                      <Card size="small">
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Space wrap>
                            <Text strong>Status changed to:</Text>
                            {getStatusTag(historyItem.status)}
                          </Space>
                          {historyItem.changedBy && (
                            <Text>
                              <UserOutlined /> Changed by:{" "}
                              <Text strong>{historyItem.changedBy.name}</Text>
                            </Text>
                          )}
                          <Text type="secondary">
                            <CalendarOutlined />{" "}
                            {dayjs(historyItem.changedAt).format(
                              "DD MMM YYYY, hh:mm A"
                            )}
                          </Text>
                        </Space>
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Text type="secondary">No status history available</Text>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  const renderCandidateCard = (item) => {
    const candidate = item.candidate;
    const isExpanded = expandedCandidate === item._id;
    const isMobile = !screens.md;

    const totalStages = item.stageHistory?.length || 0;
    const completedStages =
      item.stageHistory?.filter((s) => s.stageStatus === "approved").length ||
      0;
    const progressPercent =
      totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return (
      <Card
        key={item._id}
        style={{
          marginBottom: 16,
          borderLeft: `4px solid ${getStatusColor(item.currentStatus)}`,
        }}
      >
        {/* Candidate Header - Always Visible */}
        <div
          onClick={() => toggleCandidateExpansion(item._id)}
          style={{ cursor: "pointer" }}
        >
          <Row gutter={16} align="middle">
            <Col flex="none">
              <Avatar
                size={isMobile ? "default" : "large"}
                icon={<UserOutlined />}
                style={{ backgroundColor: getStatusColor(item.currentStatus) }}
              />
            </Col>
            <Col flex="auto">
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Row justify="space-between" align="middle" wrap={isMobile}>
                  <Col>
                    <Space wrap>
                      <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                        {candidate.fullName}
                      </Text>
                      {getStatusTag(item.currentStatus)}
                      {item.isSourced === "true" && (
                        <Tag color="purple" size="small">
                          Sourced
                        </Tag>
                      )}
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="link"
                      size={isMobile ? "small" : "middle"}
                      icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                    >
                      {isExpanded ? "Show Less" : "Show Details"}
                    </Button>
                  </Col>
                </Row>

                <Row gutter={16} wrap={isMobile}>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <MailOutlined style={{ color: "#1890ff" }} />
                      <Text ellipsis>{candidate.email}</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <PhoneOutlined style={{ color: "#52c41a" }} />
                      <Text>{candidate.phone}</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <ScheduleOutlined style={{ color: "#fa8c16" }} />
                      <Text>Exp: {candidate.totalExperienceYears}</Text>
                    </Space>
                  </Col>
                </Row>

                {/* Pipeline Progress Bar */}
                {item.currentStatus === "pipeline" && totalStages > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                        }}
                      >
                        <Text type="secondary">Pipeline Progress</Text>
                        <Text strong>
                          {completedStages}/{totalStages} stages
                        </Text>
                      </div>
                      <Progress
                        percent={progressPercent}
                        size="small"
                        status={progressPercent === 100 ? "success" : "active"}
                      />
                    </Space>
                  </div>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {/* Expanded Details - Only shown when expanded */}
        {isExpanded && (
          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #f0f0f0",
              paddingTop: 16,
            }}
          >
            <Row gutter={isMobile ? [0, 16] : 16}>
              {/* Basic Info */}
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title="Basic Information"
                  style={{ marginBottom: 16 }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text>
                      <strong>Nationality:</strong> {candidate.nationality}
                    </Text>
                    <Text>
                      <strong>Specialization:</strong>{" "}
                      {candidate.specialization}
                    </Text>
                    <Text>
                      <strong>Skills:</strong>{" "}
                      {candidate.skills?.length > 0
                        ? candidate.skills.join(", ")
                        : "N/A"}
                    </Text>
                    <Text>
                      <strong>Company:</strong> {candidate.companyName}
                    </Text>
                    <Text>
                      <strong>Candidate ID:</strong>{" "}
                      <Tag color="blue">{candidate.uniqueCode}</Tag>
                    </Text>
                  </Space>
                </Card>

                {/* Quick Stats */}
                <Card
                  size="small"
                  title="Quick Stats"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={8}>
                    <Col xs={8} sm={6} md={4}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#1890ff" }}
                        >
                          {item.stageHistory?.length || 0}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Stages
                        </Text>
                      </div>
                    </Col>
                    <Col xs={8} sm={6} md={4}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#52c41a" }}
                        >
                          {completedStages}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Completed
                        </Text>
                      </div>
                    </Col>
                    <Col xs={8} sm={6} md={4}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#fa8c16" }}
                        >
                          {item.interviews?.length || 0}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Interviews
                        </Text>
                      </div>
                    </Col>
                    <Col xs={8} sm={6} md={4}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#722ed1" }}
                        >
                          {item.offers?.length || 0}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Offers
                        </Text>
                      </div>
                    </Col>
                    <Col xs={8} sm={6} md={4}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#13c2c2" }}
                        >
                          {item.workOrderDocuments?.length || 0}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Documents
                        </Text>
                      </div>
                    </Col>
                    <Col xs={8} sm={6} md={4}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#f759ab" }}
                        >
                          {item.statusHistory?.length || 0}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Status Changes
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Right Column - Current Stage & Comments */}
              <Col xs={24} md={12}>
                {item.currentStage && (
                  <Card
                    size="small"
                    title="Current Stage"
                    style={{ marginBottom: 16 }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text strong>{item.currentStage.stageName}</Text>
                      <Text type="secondary">
                        Pipeline: {item.currentStage.pipelineName}
                      </Text>
                      <div>
                        <Tag
                          color={
                            stageStatusConfig[item.currentStage.stageStatus]
                              ?.color
                          }
                        >
                          {item.currentStage.stageStatus}
                        </Tag>
                      </div>
                      {item.currentStage.recruiter && (
                        <div>
                          <Text type="secondary">Assigned Recruiter: </Text>
                          <Tag>{item.currentStage.recruiter.name}</Tag>
                        </div>
                      )}
                    </Space>
                  </Card>
                )}

                {/* Selection Comments */}
                {item.selectedMovingComment && (
                  <Card
                    size="small"
                    title="Selection Comments"
                    style={{ marginBottom: 16 }}
                  >
                    <Text type="secondary">{item.selectedMovingComment}</Text>
                  </Card>
                )}

                {/* Status History Preview */}
                {item.statusHistory?.length > 0 && (
                  <Card size="small" title="Recent Status Changes">
                    <List
                      size="small"
                      dataSource={item.statusHistory.slice(0, 2)}
                      renderItem={(history) => (
                        <List.Item>
                          <Space direction="vertical" size={0}>
                            <Space>
                              <Text strong>Status:</Text>
                              {getStatusTag(history.status)}
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(history.changedAt).format(
                                "DD MMM YYYY, hh:mm A"
                              )}
                            </Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </Col>
            </Row>

            {/* Quick Action Buttons */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Space wrap>
                <Button
                  type="primary"
                  onClick={() => showFullDetailsModal(item)}
                  icon={<EyeOutlined />}
                  size={isMobile ? "small" : "middle"}
                  style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
                >
                  View Full Details
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderStatusSummary = () => {
    const isMobile = !screens.md;

    const statusConfigs = [
      {
        key: "selected",
        label: "Selected",
        color: "#52c41a",
        icon: CheckCircleOutlined,
      },
      {
        key: "pipeline",
        label: "Pipeline",
        color: "#722ed1",
        icon: ClusterOutlined,
      },
      {
        key: "screening",
        label: "Screening",
        color: "#fa8c16",
        icon: ScheduleOutlined,
      },
      {
        key: "interview",
        label: "Interview",
        color: "#faad14",
        icon: TeamOutlined,
      },
      {
        key: "offer",
        label: "Offer",
        color: "#eb2f96",
        icon: CheckCircleOutlined,
      },
      {
        key: "applied",
        label: "Applied",
        color: "#da2c46",
        icon: FileTextOutlined,
      },
      {
        key: "rejected",
        label: "Rejected",
        color: "#ff4d4f",
        icon: CloseCircleOutlined,
      },
    ];

    return (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={isMobile ? [8, 8] : 16}>
          {statusConfigs.map((status) => {
            const count = statusCounts[status.key] || 0;
            const IconComponent = status.icon;

            if (count === 0 && screens.md) {
              return null;
            }

            return (
              <Col key={status.key} xs={12} sm={8} md={4} lg={3}>
                <div style={{ textAlign: "center" }}>
                  <Badge
                    count={count}
                    style={{ backgroundColor: status.color }}
                    offset={[-10, 10]}
                  >
                    <Card
                      size="small"
                      style={{
                        backgroundColor: `${status.color}10`,
                        minHeight: isMobile ? 80 : 100,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <IconComponent
                        style={{
                          fontSize: isMobile ? 20 : 24,
                          color: status.color,
                          marginBottom: 8,
                        }}
                      />
                      <div style={{ fontSize: isMobile ? 12 : 14 }}>
                        {status.label}
                      </div>
                    </Card>
                  </Badge>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  };

  if (isLoading)
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );

  return (
    <div style={{ padding: screens.xs ? 16 : 24 }}>
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
      {renderStatusSummary()}

      {/* Candidates List */}
      <Card
        title={`Candidates (${allCandidateData.length})`}
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Text type="secondary">
              Showing {allCandidateData.length} of {totalCandidates}
            </Text>
          </Space>
        }
      >
        {allCandidateData.map(renderCandidateCard)}
      </Card>

      {/* Pagination */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Space wrap>
          <Button
            onClick={handlePrev}
            disabled={currentPage === 1 || isFetching}
            icon={<LeftOutlined />}
            size={screens.xs ? "small" : "middle"}
          >
            Previous
          </Button>

          <Text>
            Page {currentPage} of {data?.pagination?.totalPages || 1}
          </Text>

          <Button
            type="primary"
            onClick={handleNext}
            disabled={!hasMore || isFetching}
            size={screens.xs ? "small" : "middle"}
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
          >
            Next
          </Button>

          <Button
            onClick={() => refetch()}
            loading={isFetching}
            size={screens.xs ? "small" : "middle"}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Full Details Modal */}
      <FullDetailsModal />

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

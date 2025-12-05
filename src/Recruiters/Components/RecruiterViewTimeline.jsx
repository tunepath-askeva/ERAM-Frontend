import { React, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetRecruiterJobTimelineIdQuery } from "../../Slices/Recruiter/RecruiterApis";
import {
  Card,
  Tag,
  List,
  Avatar,
  Space,
  Typography,
  Result,
  Button,
  Spin,
  Breadcrumb,
  Descriptions,
  Collapse,
  Badge,
  Row,
  Col,
  Progress,
  Timeline,
  Modal,
  Tabs,
  Divider,
  Grid,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FrownOutlined,
  LeftOutlined,
  DownOutlined,
  RightOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  EyeOutlined,
  ScheduleOutlined,
  InfoCircleOutlined,
  IdcardOutlined,
  GlobalOutlined,
  BankOutlined,
  DownloadOutlined,
  LinkOutlined,
  HistoryOutlined,
  CheckOutlined,
  CloseOutlined,
  PaperClipOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  SolutionOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const RecruiterViewTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [allTimelineData, setAllTimelineData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const { data, isLoading, refetch, isFetching } =
    useGetRecruiterJobTimelineIdQuery({
      id,
      page: currentPage,
      limit: pageSize,
    });

  useEffect(() => {
    if (data?.data) {
      setAllTimelineData(data.data);
      setHasMore(data?.hasMore);
    }
  }, [data]);

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

  const getStatusTag = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "selected":
      case "approved":
      case "screening":
        return (
          <Badge
            status="success"
            text={status.charAt(0).toUpperCase() + status.slice(1)}
          />
        );
      case "pending":
        return <Badge status="processing" text="Pending" />;
      case "interview":
        return <Badge status="processing" text="In Interview" />;
      case "rejected":
      case "interview_rejected":
        return <Badge status="error" text="Rejected" />;
      case "pipeline":
        return <Badge status="warning" text="In Pipeline" />;
      case "sourced":
        return <Badge status="default" text="Sourced" />;
      case "offer":
        return <Badge status="success" text="Offer Stage" />;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "approved":
      case "selected":
      case "screening":
      case "offer":
        return "green";
      case "pending":
      case "interview":
        return "orange";
      case "rejected":
      case "interview_rejected":
        return "red";
      case "pipeline":
      case "sourced":
        return "blue";
      default:
        return "default";
    }
  };

  const FullDetailsModal = () => {
    if (!selectedCandidate) return null;

    const user = selectedCandidate.user;
    const workOrder = selectedCandidate.workOrder;
    const isMobile = !screens.md;

    return (
      <Modal
        title={
          <Space>
            <Avatar icon={<UserOutlined />} size="large" />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {user.fullName}
              </Title>
              <Text type="secondary">{user.email}</Text>
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
                      <Text strong>{user.fullName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Candidate ID">
                      <Tag color="blue">{user.uniqueCode || user._id}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <a href={`tel:${user.phone}`}>{user.phone}</a>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nationality">
                      <Space>
                        <GlobalOutlined />
                        {user.nationality || "N/A"}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Candidate Type">
                      <Tag color="purple">{user.candidateType}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Experience">
                      <ScheduleOutlined /> {user.totalExperienceYears || "N/A"}
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
                      {user.specialization || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Company">
                      <BankOutlined /> {user.companyName || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Qualifications">
                      {user.qualifications?.length > 0
                        ? user.qualifications.map((q, i) => (
                            <Tag key={i}>{q}</Tag>
                          ))
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Skills">
                      {user.skills?.length > 0
                        ? user.skills.map((skill, i) => (
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
                      <Title level={5}>{workOrder.title}</Title>
                      <Space wrap>
                        <Tag color="blue">{workOrder.jobCode}</Tag>
                        <Tag
                          color={
                            workOrder.workplace === "on-site"
                              ? "green"
                              : "orange"
                          }
                        >
                          {workOrder.workplace}
                        </Tag>
                      </Space>
                      <Divider style={{ margin: "12px 0" }} />
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Location">
                          <EnvironmentOutlined /> {workOrder.officeLocation}
                        </Descriptions.Item>
                        <Descriptions.Item label="Job Function">
                          <TeamOutlined /> {workOrder.jobFunction}
                        </Descriptions.Item>
                        <Descriptions.Item label="Industry">
                          <BankOutlined /> {workOrder.companyIndustry}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    {/* Current Status Card */}
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
                            color={getStatusColor(selectedCandidate.status)}
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                          >
                            {selectedCandidate.status?.toUpperCase()}
                          </Tag>
                        </div>

                        {/* Show if candidate is sourced */}
                        {selectedCandidate.isSourced === "true" && (
                          <Tag color="purple" style={{ marginTop: 8 }}>
                            <SolutionOutlined /> Sourced Candidate
                          </Tag>
                        )}

                        {/* Selection Comments */}
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
                          {dayjs(selectedCandidate.createdAt).format(
                            "DD MMM YYYY, hh:mm A"
                          )}
                        </Text>
                        <Text type="secondary" style={{ display: "block" }}>
                          Last Updated:{" "}
                          {dayjs(selectedCandidate.updatedAt).format(
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
            {selectedCandidate.stageProgress?.length > 0 ? (
              <Row gutter={24}>
                <Col span={24}>
                  <Card title="Stage Progress" size="small">
                    <Timeline mode={isMobile ? "left" : "alternate"}>
                      {/* Create a copy of the array before sorting */}
                      {[...(selectedCandidate.stageProgress || [])]
                        .sort((a, b) => a.stageOrder - b.stageOrder)
                        .map((stage) => (
                          <Timeline.Item
                            key={stage._id}
                            color={
                              stage.stageStatus === "approved"
                                ? "green"
                                : stage.stageStatus === "pending"
                                ? "orange"
                                : "red"
                            }
                            label={
                              stage.startDate && (
                                <Space direction="vertical" size={0}>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Start:{" "}
                                    {dayjs(stage.startDate).format(
                                      "DD MMM YYYY"
                                    )}
                                  </Text>
                                  {stage.endDate && (
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}
                                    >
                                      End:{" "}
                                      {dayjs(stage.endDate).format(
                                        "DD MMM YYYY"
                                      )}
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
                              {/* Rest of the stage details code remains the same */}
                              <Descriptions
                                column={isMobile ? 1 : 2}
                                size="small"
                              >
                                <Descriptions.Item label="Pipeline">
                                  {stage.pipelineId?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Stage Order">
                                  Stage {stage.stageOrder + 1}
                                </Descriptions.Item>
                                {stage.stageCompletedAt && (
                                  <Descriptions.Item label="Completed At">
                                    {dayjs(stage.stageCompletedAt).format(
                                      "DD MMM YYYY, hh:mm A"
                                    )}
                                  </Descriptions.Item>
                                )}
                              </Descriptions>

                              {/* Recruiter Reviews */}
                              {stage.recruiterReviews?.length > 0 && (
                                <>
                                  <Divider
                                    style={{ margin: "8px 0" }}
                                    orientation="left"
                                  >
                                    Reviews ({stage.recruiterReviews.length})
                                  </Divider>
                                  <List
                                    size="small"
                                    dataSource={stage.recruiterReviews}
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
                                                {review.recruiterId?.fullName}
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
                                              {review.reviewComments && (
                                                <Text
                                                  style={{
                                                    display: "block",
                                                    marginBottom: 4,
                                                  }}
                                                >
                                                  {review.reviewComments}
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
                <Result
                  icon={<InfoCircleOutlined />}
                  title="No Pipeline Stages"
                  subTitle="This candidate doesn't have any pipeline stages."
                />
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
            {selectedCandidate.interviewDetails?.length > 0 ? (
              <Card title="Interview History" size="small">
                <Timeline mode={isMobile ? "left" : "alternate"}>
                  {selectedCandidate.interviewDetails.map(
                    (interview, index) => (
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

                            {interview.interviewerIds?.length > 0 && (
                              <Descriptions.Item label="Interviewers">
                                <Space wrap>
                                  {interview.interviewerIds.map(
                                    (interviewer, idx) => (
                                      <Tag key={idx} color="purple">
                                        {interviewer.name ||
                                          interviewer.fullName}
                                      </Tag>
                                    )
                                  )}
                                </Space>
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                        </Card>
                      </Timeline.Item>
                    )
                  )}
                </Timeline>
              </Card>
            ) : (
              <Card>
                <Result
                  icon={<InfoCircleOutlined />}
                  title="No Interviews"
                  subTitle="No interview details available for this candidate."
                />
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
            {selectedCandidate.offerDetails?.length > 0 ? (
              <Card title="Offer Details" size="small">
                {selectedCandidate.offerDetails.map((offer, index) => (
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
                      {/* Salary Package */}
                      {offer.salaryPackage && (
                        <div>
                          <Text strong>Salary Package:</Text>
                          <Title level={5} style={{ margin: "4px 0" }}>
                            {offer.salaryPackage}
                          </Title>
                        </div>
                      )}

                      {/* Description */}
                      {offer.description && (
                        <div>
                          <Text strong>Description:</Text>
                          <Text style={{ display: "block" }}>
                            {offer.description}
                          </Text>
                        </div>
                      )}

                      {/* Offer Document */}
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

                      {/* Signed Offer Document */}
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
                <Result
                  icon={<InfoCircleOutlined />}
                  title="No Offers"
                  subTitle="No offer details available for this candidate."
                />
              </Card>
            )}
          </TabPane>

          {/* Tab 5: History & Status Tracking */}
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
                  {selectedCandidate.statusHistory.map((historyItem) => (
                    <Timeline.Item
                      key={historyItem._id}
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
                          <Text>
                            <UserOutlined /> Changed by:{" "}
                            <Text strong>{historyItem.changedBy?.name}</Text>
                          </Text>
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
    const user = item.user;
    const isExpanded = expandedCandidate === item._id;
    const isMobile = !screens.md;

    // Calculate pipeline progress
    const totalStages = item.stageProgress?.length || 0;
    const completedStages =
      item.stageProgress?.filter((s) => s.stageStatus === "approved").length ||
      0;
    const progressPercent =
      totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return (
      <Card
        key={item._id}
        style={{
          marginBottom: 16,
          borderLeft: `4px solid ${getStatusColor(item.status)}`,
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
                style={{
                  backgroundColor: getStatusColor(item.status),
                }}
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
                        {user.fullName}
                      </Text>
                      {getStatusTag(item.status)}
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
                      <Text ellipsis>{user.email}</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <PhoneOutlined style={{ color: "#52c41a" }} />
                      <Text>{user.phone}</Text>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space>
                      <ScheduleOutlined style={{ color: "#fa8c16" }} />
                      <Text>Exp: {user.totalExperienceYears || "N/A"}</Text>
                    </Space>
                  </Col>
                </Row>

                {/* Pipeline Progress Bar */}
                {item.status === "pipeline" && totalStages > 0 && (
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
                      <strong>Nationality:</strong> {user.nationality || "N/A"}
                    </Text>
                    <Text>
                      <strong>Specialization:</strong>{" "}
                      {user.specialization || "N/A"}
                    </Text>
                    <Text>
                      <strong>Skills:</strong>{" "}
                      {user.skills?.length > 0 ? user.skills.join(", ") : "N/A"}
                    </Text>
                    <Text>
                      <strong>Company:</strong> {user.companyName || "N/A"}
                    </Text>
                    <Text>
                      <strong>Candidate ID:</strong>{" "}
                      <Tag color="blue">{user.uniqueCode || user._id}</Tag>
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
                          {item.stageProgress?.length || 0}
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
                          {item.interviewDetails?.length || 0}
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
                          {item.offerDetails?.length || 0}
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
                          {item.workOrderuploadedDocuments?.length || 0}
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

              {/* Right Column - Job Details */}
              <Col xs={24} md={12}>
                <Card
                  size="small"
                  title="Job Details"
                  style={{ marginBottom: 16 }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong>{item.workOrder.title}</Text>
                    <Text type="secondary">Code: {item.workOrder.jobCode}</Text>
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{item.workOrder.officeLocation}</Text>
                    </Space>
                    <Text>Industry: {item.workOrder.companyIndustry}</Text>
                    <Text>
                      Workplace:{" "}
                      <Tag
                        color={
                          item.workOrder.workplace === "on-site"
                            ? "green"
                            : "orange"
                        }
                      >
                        {item.workOrder.workplace}
                      </Tag>
                    </Text>
                  </Space>
                </Card>

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
    const statusCounts = {
      selected: 0,
      pipeline: 0,
      pending: 0,
      rejected: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      sourced: 0,
    };

    allTimelineData.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

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
        color: "#1890ff",
        icon: ClusterOutlined,
      },
      {
        key: "screening",
        label: "Screening",
        color: "#faad14",
        icon: ScheduleOutlined,
      },
      {
        key: "interview",
        label: "Interview",
        color: "#722ed1",
        icon: TeamOutlined,
      },
      {
        key: "offer",
        label: "Offer",
        color: "#13c2c2",
        icon: CheckCircleOutlined,
      },
      {
        key: "pending",
        label: "Pending",
        color: "#fa8c16",
        icon: ClockCircleOutlined,
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

            // Skip if count is 0 and not on mobile
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

  if (isLoading) return <SkeletonLoader />;

  if (!isLoading && allTimelineData.length === 0) {
    return (
      <div style={{ padding: screens.xs ? 16 : 24 }}>
        <div style={{ marginBottom: "16px" }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Button
                type="link"
                onClick={() => navigate("/recruiter/jobs-timeline")}
                icon={<LeftOutlined />}
                style={{
                  paddingLeft: 0,
                  color: "#da2c46",
                }}
              >
                Back to Jobs
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Result
          icon={<FrownOutlined />}
          title="No Timeline Data"
          subTitle="No records found for this Work Order."
          extra={<Button onClick={() => refetch()}>Refresh</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: screens.xs ? 16 : 24 }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Button
              type="link"
              onClick={() => navigate("/recruiter/jobs-timeline")}
              icon={<LeftOutlined />}
              style={{
                paddingLeft: 0,
                color: "#da2c46",
              }}
            >
              Back to Jobs
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Text strong>Work Order Timeline</Text>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Work Order Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" wrap>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0 }}>
                {allTimelineData[0]?.workOrder?.title}
              </Title>
              <Space wrap>
                <Tag color="blue">{allTimelineData[0]?.workOrder?.jobCode}</Tag>
                <Tag color="purple">
                  {allTimelineData[0]?.workOrder?.workplace}
                </Tag>
                <EnvironmentOutlined />
                <Text>{allTimelineData[0]?.workOrder?.officeLocation}</Text>
              </Space>
            </Space>
          </Col>
          <Col
            xs={24}
            md={8}
            style={{
              textAlign: screens.md ? "right" : "left",
              marginTop: screens.md ? 0 : 16,
            }}
          >
            <Space direction="vertical" align={screens.md ? "end" : "start"}>
              <Text strong>Total Candidates: {data?.totalCount || 0}</Text>
              <Text type="secondary">
                Page {currentPage} of{" "}
                {Math.ceil((data?.totalCount || 0) / pageSize)}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Status Summary */}
      {renderStatusSummary()}

      {/* Candidate List */}
      <Card
        title={`Candidates (${allTimelineData.length})`}
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Text type="secondary">
              Showing {allTimelineData.length} of {data?.totalCount || 0}
            </Text>
          </Space>
        }
      >
        {allTimelineData.map(renderCandidateCard)}
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
            Page {currentPage} of{" "}
            {Math.ceil((data?.totalCount || 0) / pageSize)}
          </Text>

          <Button
            type="primary"
            onClick={handleNext}
            disabled={!hasMore || isFetching}
            size={screens.xs ? "small" : "middle"}
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
    </div>
  );
};

export default RecruiterViewTimeline;

import { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import dayjs from "dayjs";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const RecruiterViewTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    switch (status?.toLowerCase()) {
      case "selected":
      case "approved":
        return (
          <Badge
            status="success"
            text={status.charAt(0).toUpperCase() + status.slice(1)}
          />
        );
      case "selected":
        return (
          <Badge
            status="success"
            text={status.charAt(0).toUpperCase() + status.slice(1)}
          />
        );
      case "screening":
        return (
          <Badge
            status="success"
            text={status.charAt(0).toUpperCase() + status.slice(1)}
          />
        );
      case "pending":
        return <Badge status="processing" text="Pending" />;
      case "rejected":
      case "interview":
        return <Badge status="processing" text="In interview" />;
      case "interview_rejected":
        return <Badge status="error" text="Rejected" />;
      case "pipeline":
        return <Badge status="warning" text="In Pipeline" />;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "selected":
        return "green";
      case "pending":
        return "orange";
      case "rejected":
        return "red";
      case "pipeline":
        return "blue";
      default:
        return "default";
    }
  };

  const FullDetailsModal = () => {
    if (!selectedCandidate) return null;

    const user = selectedCandidate.user;
    const workOrder = selectedCandidate.workOrder;

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
        width={1200}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          <Button
            key="contact"
            type="primary"
            onClick={() => (window.location.href = `mailto:${user.email}`)}
          >
            <MailOutlined /> Contact Candidate
          </Button>,
        ]}
        bodyStyle={{ padding: 0 }}
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
            <Row gutter={24}>
              <Col span={12}>
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
                  </Descriptions>
                </Card>

                <Card
                  title="Professional Details"
                  size="small"
                  style={{ marginTop: 16 }}
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Total Experience">
                      <ScheduleOutlined /> {user.totalExperienceYears || "N/A"}
                    </Descriptions.Item>
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
                    <Descriptions.Item label="Languages">
                      {user.languages?.length > 0
                        ? user.languages.map((lang, i) => (
                            <Tag key={i} color="geekblue">
                              {lang}
                            </Tag>
                          ))
                        : "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={12}>
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
                      <Space>
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
                          }}
                        >
                          <Text strong>Application Status:</Text>
                          <Tag
                            color={
                              selectedCandidate.status === "selected" ||
                              selectedCandidate.status === "approved"
                                ? "green"
                                : selectedCandidate.status === "rejected"
                                ? "red"
                                : selectedCandidate.status === "pipeline"
                                ? "blue"
                                : selectedCandidate.status === "screening" ||
                                  selectedCandidate.status === "sourced"
                                ? "cyan"
                                : selectedCandidate.status === "hired" ||
                                  selectedCandidate.status === "completed"
                                ? "success"
                                : selectedCandidate.status === "applied"
                                ? "orange"
                                : "default"
                            }
                            style={{ fontSize: "14px", padding: "4px 12px" }}
                          >
                            {selectedCandidate.status?.toUpperCase()}
                          </Tag>
                        </div>

                        {/* Show if candidate is sourced */}
                        {selectedCandidate.isSourced === "true" && (
                          <Tag color="purple">Sourced Candidate</Tag>
                        )}

                        {/* Show tag pipeline if exists */}
                        {selectedCandidate.tagPipelineId && (
                          <div>
                            <Text type="secondary">Tagged to Pipeline:</Text>
                            <Text strong>
                              {" "}
                              {selectedCandidate.tagPipelineId}
                            </Text>
                          </div>
                        )}

                        {/* Show custom field responses if any */}
                        {selectedCandidate.responses?.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <Text strong>Custom Responses:</Text>
                            {selectedCandidate.responses.map(
                              (response, idx) => (
                                <div key={idx} style={{ marginTop: 4 }}>
                                  <Text type="secondary">
                                    {response.label}:
                                  </Text>
                                  <Text strong style={{ marginLeft: 8 }}>
                                    {response.value}
                                  </Text>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Selection Comments */}
                        {selectedCandidate.selectedMovingComment && (
                          <>
                            <Divider style={{ margin: "8px 0" }} />
                            <Text strong>Selection Comments:</Text>
                            <Text
                              type="secondary"
                              style={{ fontStyle: "italic" }}
                            >
                              "{selectedCandidate.selectedMovingComment}"
                            </Text>
                          </>
                        )}

                        <Divider style={{ margin: "8px 0" }} />
                        <Text strong>Timeline:</Text>
                        <Text type="secondary">
                          Created:{" "}
                          {dayjs(selectedCandidate.createdAt).format(
                            "DD MMM YYYY, hh:mm A"
                          )}
                        </Text>
                        <Text type="secondary">
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
                <ScheduleOutlined /> Pipeline Stages
              </span>
            }
            key="2"
          >
            {selectedCandidate.stageProgress?.length > 0 ? (
              <Row gutter={24}>
                <Col span={24}>
                  <Card title="Stage Progress" size="small">
                    <Timeline mode="left">
                      {selectedCandidate.stageProgress.map((stage) => (
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
                            <Space direction="vertical" size={0}>
                              {stage.startDate && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Start:{" "}
                                  {dayjs(stage.startDate).format("DD MMM")}
                                </Text>
                              )}
                              {stage.endDate && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  End: {dayjs(stage.endDate).format("DD MMM")}
                                </Text>
                              )}
                            </Space>
                          }
                        >
                          <Card
                            size="small"
                            title={
                              <Space>
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
                              </Space>
                            }
                            style={{ marginBottom: 8 }}
                          >
                            {/* Stage Details */}
                            <Descriptions column={2} size="small">
                              <Descriptions.Item label="Pipeline">
                                {stage.pipelineId?.name}
                              </Descriptions.Item>
                              <Descriptions.Item label="Stage Order">
                                {stage.stageOrder + 1}
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
                                          <Space>
                                            <Text>
                                              {review.recruiterId?.fullName}
                                            </Text>
                                            <Tag
                                              color={
                                                review.status === "approved"
                                                  ? "green"
                                                  : review.status === "pending"
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
                                    <Col key={doc._id} span={12}>
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
                                            <div>
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

          {/* Tab 3: Documents */}
          <TabPane
            tab={
              <span>
                <PaperClipOutlined /> Documents
              </span>
            }
            key="3"
          >
            <Row gutter={24}>
              {/* Work Order Documents */}
              <Col span={12}>
                <Card title="Work Order Documents" size="small">
                  {selectedCandidate.workOrderuploadedDocuments?.length > 0 ? (
                    <List
                      dataSource={selectedCandidate.workOrderuploadedDocuments}
                      renderItem={(doc) => (
                        <List.Item
                          actions={[
                            <Button
                              type="link"
                              size="small"
                              href={doc.fileUrl}
                              target="_blank"
                              icon={<EyeOutlined />}
                            >
                              View
                            </Button>,
                            <Button
                              type="link"
                              size="small"
                              href={doc.fileUrl}
                              icon={<DownloadOutlined />}
                            >
                              Download
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <FilePdfOutlined
                                style={{ fontSize: 24, color: "#ff4d4f" }}
                              />
                            }
                            title={doc.documentName}
                            description={
                              <>
                                <Text
                                  type="secondary"
                                  style={{ display: "block" }}
                                >
                                  {doc.fileName}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Uploaded:{" "}
                                  {dayjs(doc.uploadedAt).format(
                                    "DD MMM YYYY, hh:mm A"
                                  )}
                                </Text>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Text type="secondary">
                      No documents uploaded for this work order
                    </Text>
                  )}
                </Card>
              </Col>

              {/* All Stage Documents */}
              <Col span={12}>
                <Card title="All Stage Documents" size="small">
                  {selectedCandidate.stageProgress?.some(
                    (stage) => stage.uploadedDocuments?.length > 0
                  ) ? (
                    <Collapse>
                      {selectedCandidate.stageProgress
                        .filter((stage) => stage.uploadedDocuments?.length > 0)
                        .map((stage) => (
                          <Collapse.Panel
                            key={stage._id}
                            header={
                              <Space>
                                <Text strong>{stage.stageName}</Text>
                                <Tag>{stage.uploadedDocuments.length} docs</Tag>
                              </Space>
                            }
                          >
                            <List
                              size="small"
                              dataSource={stage.uploadedDocuments}
                              renderItem={(doc) => (
                                <List.Item>
                                  <List.Item.Meta
                                    title={
                                      <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {doc.documentName}
                                      </a>
                                    }
                                    description={doc.fileName}
                                  />
                                  <Button
                                    type="link"
                                    size="small"
                                    href={doc.fileUrl}
                                    icon={<DownloadOutlined />}
                                  />
                                </List.Item>
                              )}
                            />
                          </Collapse.Panel>
                        ))}
                    </Collapse>
                  ) : (
                    <Text type="secondary">No stage documents found</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 4: History & Status */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined /> History
              </span>
            }
            key="4"
          >
            <Card title="Status History" size="small">
              {selectedCandidate.statusHistory?.length > 0 ? (
                <Timeline>
                  {selectedCandidate.statusHistory.map((historyItem) => (
                    <Timeline.Item
                      key={historyItem._id}
                      color={getStatusColor(historyItem.status)}
                      dot={
                        historyItem.status === "selected" ? (
                          <CheckOutlined />
                        ) : historyItem.status === "rejected" ? (
                          <CloseOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                    >
                      <Card size="small">
                        <Space direction="vertical">
                          <Space>
                            <Text strong>Status changed to:</Text>
                            {getStatusTag(historyItem.status)}
                          </Space>
                          <Text>
                            <UserOutlined /> Changed by:{" "}
                            <Text strong>{historyItem.changedBy?.name}</Text> (
                            {historyItem.changedBy?.email})
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

          {/* Tab 5: Interview Details */}
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Interviews
              </span>
            }
            key="5"
          >
            {selectedCandidate.interviewDetails?.length > 0 ? (
              <Card title="Interview History" size="small">
                <Timeline mode="left">
                  {selectedCandidate.interviewDetails.map(
                    (interview, index) => (
                      <Timeline.Item
                        key={index}
                        color={
                          interview.status === "pass"
                            ? "green"
                            : interview.status === "fail" ||
                              interview.status === "interview_rejected"
                            ? "red"
                            : interview.status === "interview_completed"
                            ? "blue"
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
                            <Space>
                              <Text strong>{interview.title}</Text>
                              <Tag
                                color={
                                  interview.status === "pass"
                                    ? "green"
                                    : interview.status === "fail" ||
                                      interview.status === "interview_rejected"
                                    ? "red"
                                    : interview.status === "interview_completed"
                                    ? "blue"
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

                            {interview.remarks && (
                              <Descriptions.Item label="Remarks">
                                <Text type="secondary">
                                  {interview.remarks}
                                </Text>
                              </Descriptions.Item>
                            )}

                            {interview.interviewerIds?.length > 0 && (
                              <Descriptions.Item label="Interviewers">
                                <Space wrap>
                                  {interview.interviewerIds.map(
                                    (interviewer, idx) => (
                                      <Tag key={idx} color="purple">
                                        {interviewer.name ||
                                          `Interviewer ${idx + 1}`}
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

          {/* Tab 6: Offer Details */}
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined /> Offers
              </span>
            }
            key="6"
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
        </Tabs>
      </Modal>
    );
  };

  const renderCandidateCard = (item) => {
    const user = item.user;
    const isExpanded = expandedCandidate === item._id;

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
          borderLeft: `4px solid ${
            getStatusColor(item.status) === "green"
              ? "#52c41a"
              : getStatusColor(item.status) === "red"
              ? "#ff4d4f"
              : getStatusColor(item.status) === "orange"
              ? "#fa8c16"
              : "#1890ff"
          }`,
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
                size="large"
                icon={<UserOutlined />}
                style={{ backgroundColor: getStatusColor(item.status) }}
              />
            </Col>
            <Col flex="auto">
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Text strong style={{ fontSize: 16 }}>
                        {user.fullName}
                      </Text>
                      {getStatusTag(item.status)}
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="link"
                      icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                    >
                      {isExpanded ? "Show Less" : "Show Details"}
                    </Button>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Space>
                      <MailOutlined style={{ color: "#1890ff" }} />
                      <Text>{user.email}</Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space>
                      <PhoneOutlined style={{ color: "#52c41a" }} />
                      <Text>{user.phone}</Text>
                    </Space>
                  </Col>
                  <Col span={8}>
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
            <Row gutter={16}>
              {/* Basic Info */}
              <Col span={12}>
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
                  </Space>
                </Card>

                {/* Quick Stats */}
                <Card
                  size="small"
                  title="Quick Stats"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={8}>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#1890ff" }}
                        >
                          {item.stageProgress?.length || 0}
                        </Title>
                        <Text type="secondary">Total Stages</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#52c41a" }}
                        >
                          {completedStages}
                        </Title>
                        <Text type="secondary">Completed</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#fa8c16" }}
                        >
                          {item.interviewDetails?.length || 0}
                        </Title>
                        <Text type="secondary">Interviews</Text>
                      </div>
                    </Col>
                  </Row>
                  <Divider style={{ margin: "8px 0" }} />
                  <Row gutter={8}>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#722ed1" }}
                        >
                          {item.offerDetails?.length || 0}
                        </Title>
                        <Text type="secondary">Offers</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#13c2c2" }}
                        >
                          {item.workOrderuploadedDocuments?.length || 0}
                        </Title>
                        <Text type="secondary">Documents</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Title
                          level={4}
                          style={{ margin: 0, color: "#f759ab" }}
                        >
                          {item.statusHistory?.length || 0}
                        </Title>
                        <Text type="secondary">Status Changes</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Right Column - Job Details */}
              <Col span={12}>
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
              </Col>
            </Row>

            {/* Quick Action Buttons */}
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Space>
                <Button
                  type="primary"
                  onClick={() => showFullDetailsModal(item)}
                >
                  <EyeOutlined /> View Full Details
                </Button>
                <Button
                  onClick={() =>
                    (window.location.href = `mailto:${user.email}`)
                  }
                >
                  <MailOutlined /> Contact Candidate
                </Button>
                {item.workOrderuploadedDocuments?.length > 0 && (
                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={() => showFullDetailsModal(item)}
                  >
                    View Documents
                  </Button>
                )}
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
    };

    allTimelineData.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Badge
                count={statusCounts.selected}
                style={{ backgroundColor: "#52c41a" }}
              >
                <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
                  <CheckCircleOutlined
                    style={{ fontSize: 24, color: "#52c41a" }}
                  />
                  <div style={{ marginTop: 8 }}>Selected</div>
                </Card>
              </Badge>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Badge
                count={statusCounts.pipeline}
                style={{ backgroundColor: "#1890ff" }}
              >
                <Card size="small" style={{ backgroundColor: "#e6f7ff" }}>
                  <ScheduleOutlined
                    style={{ fontSize: 24, color: "#1890ff" }}
                  />
                  <div style={{ marginTop: 8 }}>In Pipeline</div>
                </Card>
              </Badge>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Badge
                count={statusCounts.pending}
                style={{ backgroundColor: "#fa8c16" }}
              >
                <Card size="small" style={{ backgroundColor: "#fff7e6" }}>
                  <ClockCircleOutlined
                    style={{ fontSize: 24, color: "#fa8c16" }}
                  />
                  <div style={{ marginTop: 8 }}>Pending</div>
                </Card>
              </Badge>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: "center" }}>
              <Badge
                count={statusCounts.rejected}
                style={{ backgroundColor: "#ff4d4f" }}
              >
                <Card size="small" style={{ backgroundColor: "#fff2f0" }}>
                  <CloseCircleOutlined
                    style={{ fontSize: 24, color: "#ff4d4f" }}
                  />
                  <div style={{ marginTop: 8 }}>Rejected</div>
                </Card>
              </Badge>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  if (isLoading) return <SkeletonLoader />;

  if (!isLoading && allTimelineData.length === 0) {
    return (
      <>
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
      </>
    );
  }

  return (
    <div style={{ padding: 24 }}>
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
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0 }}>
                {allTimelineData[0]?.workOrder?.title}
              </Title>
              <Space>
                <Tag color="blue">{allTimelineData[0]?.workOrder?.jobCode}</Tag>
                <Tag color="purple">
                  {allTimelineData[0]?.workOrder?.workplace}
                </Tag>
                <EnvironmentOutlined />
                <Text>{allTimelineData[0]?.workOrder?.officeLocation}</Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Text strong>Total Candidates: {data?.totalCount || 0}</Text>
              <Text type="secondary">Page {currentPage}</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Status Summary */}
      {renderStatusSummary()}

      {/* Candidate List */}
      <Card title="Candidates" style={{ marginBottom: 16 }}>
        {allTimelineData.map(renderCandidateCard)}
      </Card>

      {/* Pagination */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Space>
          <Button
            onClick={handlePrev}
            disabled={currentPage === 1 || isFetching}
            icon={<LeftOutlined />}
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
          >
            Next
          </Button>

          <Button onClick={() => refetch()} loading={isFetching}>
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

import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  Tabs,
  Badge,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  message,
  Drawer,
  List,
  Divider,
  Upload,
  Collapse,
  Popconfirm,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MessageOutlined,
  PlusOutlined,
  DownloadOutlined,
  CloseOutlined,
  UploadOutlined,
  InboxOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  FileOutlined,
  ArrowRightOutlined,
  GiftOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  useGetPipelineCompletedCandidatesQuery,
  useMoveCandidateStatusMutation,
  useGetAllRecruitersQuery,
  useAddInterviewDetailsMutation,
  useChangeInterviewStatusMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;
const { Panel } = Collapse;

const RecruiterCandidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDrawerVisible, setCandidateDrawerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [addCandidateModalVisible, setAddCandidateModalVisible] =
    useState(false);
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [scheduleInterviewModalVisible, setScheduleInterviewModalVisible] =
    useState(false);
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [addCandidateForm] = Form.useForm();

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useGetPipelineCompletedCandidatesQuery();
  const [moveToNextStage, { isLoading: isMovingStage }] =
    useMoveCandidateStatusMutation();
  const [addInterviewDetails, { isLoading: isSchedulingInterview }] =
    useAddInterviewDetailsMutation();
  const [changeInterviewStatus, { isLoading: isChangingStatus }] =
    useChangeInterviewStatusMutation();

  const { data: allRecruiters } = useGetAllRecruitersQuery();

  const candidates =
    apiData?.data?.map((candidate) => {
      return {
        id: candidate._id,
        _id: candidate._id,
        name: candidate.user.fullName,
        email: candidate.user.email,
        position: candidate.workOrder.title,
        jobCode: candidate.workOrder.jobCode,
        status: candidate.status,
        stageProgress: candidate.stageProgress,
        updatedAt: candidate.updatedAt,
        avatar: candidate.user.image || null,
        interviewDetails: candidate.interviewDetails?.[0] || null, // Take first element or null
      };
    }) || [];

  // Custom styles
  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const recruiterOptionStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  const mobileButtonGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    "& > button": {
      width: "100%",
    },
  };

  const statusConfig = {
    interview: { color: "purple", label: "Interview" },
    offer: { color: "green", label: "Offer" },
    rejected: { color: "red", label: "Rejected" },
    completed: { color: "green", label: "Completed" },
    default: { color: "gray", label: "Unknown" },
  };

  const filterCounts = {
    all: candidates.length,
    completed: candidates.filter((c) => c.status === "completed").length,
    interview: candidates.filter((c) => c.status === "interview").length,
    offer: candidates.filter((c) => c.status === "offer").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesFilter =
      selectedStatus === "all" || candidate.status === selectedStatus;
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.jobCode &&
        candidate.jobCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleMoveToInterview = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "interview",
      }).unwrap();

      message.success(
        `${candidate.name} moved to interview stage successfully!`
      );
      refetch();
    } catch (error) {
      message.error(
        `Failed to move ${candidate.name} to interview stage. Please try again.`
      );
      console.error("Move to interview error:", error);
    }
  };

  const handleMakeOffer = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "offer",
      }).unwrap();

      message.success(`Offer sent to ${candidate.name} successfully!`);
      refetch();
    } catch (error) {
      message.error(
        `Failed to send offer to ${candidate.name}. Please try again.`
      );
      console.error("Make offer error:", error);
    }
  };

  const handleRejectCandidate = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "rejected",
      }).unwrap();

      message.success(`${candidate.name} has been rejected.`);
      refetch();
    } catch (error) {
      message.error(`Failed to reject ${candidate.name}. Please try again.`);
      console.error("Reject candidate error:", error);
    }
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    if (candidate.interviewDetails) {
      form.setFieldsValue({
        type: candidate.interviewDetails.mode,
        meetingLink: candidate.interviewDetails.meetingLink,
        location: candidate.interviewDetails.location,
        datetime: dayjs(candidate.interviewDetails.date),
        interviewers: candidate.interviewDetails.interviewerIds,
        notes: candidate.interviewDetails.notes,
      });
    }
    setScheduleInterviewModalVisible(true);
  };

  const handleChangeInterviewStatus = async (status) => {
    if (!selectedCandidate) return;

    try {
      await changeInterviewStatus({
        id: selectedCandidate._id,
        status,
      }).unwrap();

      message.success(`Interview ${status.replace("_", " ")} successfully!`);
      refetch();

      if (
        status === "interview_completed" ||
        status === "interview_cancelled"
      ) {
        setScheduleInterviewModalVisible(false);
      }
    } catch (error) {
      message.error(`Failed to update interview status: ${error.message}`);
      console.error("Interview status change error:", error);
    }
  };

  const handleRescheduleInterview = () => {
    if (!selectedCandidate?.interviewDetails) return;

    const interview = selectedCandidate.interviewDetails;
    form.setFieldsValue({
      type: interview.mode,
      meetingLink: interview.meetingLink,
      location: interview.location,
      datetime: dayjs(interview.date),
      interviewers: interview.interviewerIds,
      notes: interview.notes,
    });
    setScheduleInterviewModalVisible(true);
  };

  const handleScheduleInterviewSubmit = async (values, candidateId) => {
    if (!values.datetime || !values.interviewers?.length) {
      message.error("Please fill all required fields");
      return false;
    }

    try {
      const payload = {
        id: candidateId,
        scheduledAt: values.datetime.format(),
        platform: values.type,
        status: "scheduled",
        recruiterId: values.interviewers[0],
        notes: values.notes,
      };

      if (values.type === "online") {
        payload.link = values.meetingLink;
      } else if (values.type === "in-person") {
        payload.location = values.location;
      }

      await addInterviewDetails(payload).unwrap();

      message.success("Interview scheduled successfully!");
      return true;
    } catch (error) {
      console.error("Interview scheduling error:", error);
      const errorMessage =
        error.data?.message || error.message || "Failed to schedule interview";
      message.error(errorMessage);
      return false;
    } finally {
      setScheduleInterviewModalVisible(false);
      form.resetFields();
      refetch();
    }
  };

  const getAvailableActions = (candidate) => {
    const actions = [];

    switch (candidate.status) {
      case "completed":
        actions.push({
          key: "interview",
          label: "Move to Interview",
          icon: <ArrowRightOutlined style={iconTextStyle} />,
          onClick: () => handleMoveToInterview(candidate),
          style: { color: "#722ed1" },
        });
        break;
      case "interview":
        if (
          !candidate.interviewDetails ||
          candidate.interviewDetails.status !== "interview_completed"
        ) {
          actions.push({
            key: "schedule",
            label: candidate.interviewDetails
              ? "Reschedule Interview"
              : "Schedule Interview",
            icon: <CalendarOutlined style={iconTextStyle} />,
            onClick: () => handleScheduleInterview(candidate),
            style: { color: "#722ed1" },
          });
        }
        actions.push({
          key: "offer",
          label: "Make Offer",
          icon: <GiftOutlined style={iconTextStyle} />,
          onClick: () => handleMakeOffer(candidate),
          style: { color: "#52c41a" },
        });
        break;
      default:
        break;
    }

    if (candidate.status !== "rejected") {
      actions.push({
        key: "reject",
        label: "Reject",
        icon: <StopOutlined style={iconTextStyle} />,
        onClick: () => handleRejectCandidate(candidate),
        style: { color: "#f5222d" },
        confirm: true,
        confirmTitle: `Are you sure you want to reject ${candidate.name}?`,
        confirmDescription: "This action cannot be undone.",
      });
    }

    return actions;
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDrawerVisible(true);
  };

  const handleSendMessage = (candidate) => {
    setSelectedCandidate(candidate);
    setMessageModalVisible(true);
  };

  const handleDownloadResume = (candidate) => {
    if (candidate.stageProgress?.length > 0) {
      const firstStage = candidate.stageProgress[0];
      if (firstStage.uploadedDocuments?.length > 0) {
        const document = firstStage.uploadedDocuments[0];
        window.open(document.fileUrl, "_blank");
        message.success(`Downloading ${document.fileName}...`);
        return;
      }
    }
    message.warning("No documents available for download");
  };

  const renderStageActions = (candidate) => {
    const actions = getAvailableActions(candidate);

    if (actions.length === 0) return null;

    return (
      <Space size="small" wrap>
        {actions.map((action) => {
          if (action.confirm) {
            return (
              <Popconfirm
                key={action.key}
                title={action.confirmTitle}
                description={action.confirmDescription}
                onConfirm={action.onClick}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: action.key === "reject" }}
              >
                <Button
                  size="small"
                  icon={action.icon}
                  style={action.style}
                  loading={isMovingStage}
                >
                  {action.label}
                </Button>
              </Popconfirm>
            );
          }

          return (
            <Button
              key={action.key}
              size="small"
              icon={action.icon}
              onClick={action.onClick}
              style={action.style}
              loading={isMovingStage}
            >
              {action.label}
            </Button>
          );
        })}
      </Space>
    );
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: "name",
      key: "name",
      responsive: ["md"],
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size={40}>
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong>{record.name}</Text>
              <Button type="text" size="small" />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined style={iconTextStyle} /> {record.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      responsive: ["lg"],
      render: (text, record) => (
        <div>
          <Text strong>{record.position}</Text>
          {record.jobCode && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.jobCode}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const statusInfo = statusConfig[status] || statusConfig.default;
        return (
          <div>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.stageProgress?.length || 0} stages completed
            </Text>
          </div>
        );
      },
    },

    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      responsive: ["md"],
      render: (date) => <Text>{new Date(date).toLocaleDateString()}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="View Profile">
            <Button
              type="text"
              icon={<EyeOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => handleViewProfile(record)}
            />
          </Tooltip>
          <Tooltip title="Send Message">
            <Button
              type="text"
              icon={<MessageOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => handleSendMessage(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: "View Profile",
                  icon: <EyeOutlined style={iconTextStyle} />,
                  onClick: () => handleViewProfile(record),
                },
                {
                  key: "message",
                  label: "Send Message",
                  icon: <MessageOutlined style={iconTextStyle} />,
                  onClick: () => handleSendMessage(record),
                },
                {
                  key: "download",
                  label: "Download Documents",
                  icon: <DownloadOutlined style={iconTextStyle} />,
                  onClick: () => handleDownloadResume(record),
                },
                {
                  type: "divider",
                },
                ...getAvailableActions(record).map((action) => ({
                  key: action.key,
                  label: action.label,
                  icon: action.icon,
                  onClick: action.onClick,
                  style: action.style,
                })),
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined style={iconTextStyle} />}
              size="small"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const tabItems = Object.entries(filterCounts).map(([status, count]) => ({
    key: status,
    label: (
      <Badge count={count} size="small" offset={[10, 0]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    ),
  }));

  // Mobile card view for candidates
  const CandidateCard = ({ candidate }) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      actions={[
        <EyeOutlined
          key="view"
          style={iconTextStyle}
          onClick={() => handleViewProfile(candidate)}
        />,
        <MessageOutlined
          key="message"
          style={iconTextStyle}
          onClick={() => handleSendMessage(candidate)}
        />,
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "View Profile",
                icon: <EyeOutlined style={iconTextStyle} />,
                onClick: () => handleViewProfile(candidate),
              },
              {
                key: "message",
                label: "Send Message",
                icon: <MessageOutlined style={iconTextStyle} />,
                onClick: () => handleSendMessage(candidate),
              },
              {
                key: "download",
                label: "Download Documents",
                icon: <DownloadOutlined style={iconTextStyle} />,
                onClick: () => handleDownloadResume(candidate),
              },
              {
                type: "divider",
              },
              ...getAvailableActions(candidate).map((action) => ({
                key: action.key,
                label: action.label,
                icon: action.icon,
                onClick: action.onClick,
                style: action.style,
              })),
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <MoreOutlined style={iconTextStyle} />
        </Dropdown>,
      ]}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar src={candidate.avatar} size={48}>
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text strong>{candidate.name}</Text>
          </div>
          <Text style={{ display: "block", marginBottom: 4 }}>
            {candidate.position}
          </Text>
          {candidate.jobCode && (
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 4 }}
            >
              {candidate.jobCode}
            </Text>
          )}
          <div style={{ marginBottom: 8 }}>
            <Tag color={statusConfig[candidate.status].color} size="small">
              {statusConfig[candidate.status].label}
            </Tag>
          </div>

          {/* Stage Actions for Mobile */}
          <div style={{ marginBottom: 8 }}>{renderStageActions(candidate)}</div>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Last updated: {new Date(candidate.updatedAt).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </Card>
  );

  // Helper to render stage reviews
  const renderStageReviews = (stage) => {
    return (
      <Collapse>
        {stage.recruiterReviews?.map((review, index) => (
          <Panel
            header={`Review by ${review.reviewerName}`}
            key={`review-${index}`}
            extra={
              <Tag
                color={review.status === "approved" ? "green" : "orange"}
                icon={
                  review.status === "approved" ? (
                    <CheckOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  )
                }
              >
                {review.status}
              </Tag>
            }
          >
            <Text strong>Comments:</Text>
            <Text style={{ display: "block", marginBottom: 8 }}>
              {review.reviewComments}
            </Text>
            <Text type="secondary">
              Reviewed at: {new Date(review.reviewedAt).toLocaleString()}
            </Text>
          </Panel>
        ))}
      </Collapse>
    );
  };

  // Helper to render activity timeline
  const renderActivityTimeline = (stageProgress) => {
    return stageProgress?.map((stage) => ({
      title: stage.stageName,
      description:
        stage.recruiterReviews?.[0]?.reviewComments || "Stage completed",
      date: new Date(
        stage.stageCompletedAt || stage.recruiterReviews?.[0]?.reviewedAt
      ).toLocaleString(),
      icon: <CheckOutlined />,
      stage,
    }));
  };

  const renderDocuments = (stageProgress) => {
    const allDocuments = [];
    stageProgress?.forEach((stage) => {
      if (stage.uploadedDocuments?.length) {
        allDocuments.push({
          stageName: stage.stageName,
          documents: stage.uploadedDocuments,
        });
      }
    });

    return (
      <div>
        {allDocuments.length > 0 ? (
          allDocuments.map((docGroup, index) => (
            <div key={`doc-group-${index}`} style={{ marginBottom: 16 }}>
              <Text strong>{docGroup.stageName}</Text>
              <List
                dataSource={docGroup.documents}
                renderItem={(doc) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileOutlined />}
                      title={
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {doc.fileName}
                        </a>
                      }
                      description={`Uploaded at: ${new Date(
                        doc.uploadedAt
                      ).toLocaleString()}`}
                    />
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    />
                  </List.Item>
                )}
              />
            </div>
          ))
        ) : (
          <Text type="secondary">No documents uploaded yet.</Text>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "12px", minHeight: "100vh" }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Title
              level={2}
              style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}
            >
              Candidates
            </Title>
            <Text type="secondary">
              Manage and track your candidate pipeline
            </Text>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Space
              size="small"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                onClick={() => setBulkUploadModalVisible(true)}
              >
                Bulk Upload
              </Button>
              <Button
                style={buttonStyle}
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setAddCandidateModalVisible(true)}
              >
                Add Candidate
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Input
              placeholder="Search candidates, positions, or job codes..."
              prefix={<SearchOutlined style={iconTextStyle} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} md={6}>
            <Button
              icon={<FilterOutlined style={iconTextStyle} />}
              size="large"
              block
            >
              More Filters
            </Button>
          </Col>
        </Row>

        {/* Status Filter Tabs */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Tabs
            activeKey={selectedStatus}
            onChange={setSelectedStatus}
            items={tabItems}
            size="small"
            tabBarStyle={{ margin: 0 }}
          />
        </div>
      </Card>

      {/* Candidates Table/Cards */}
      <Card>
        {/* Desktop Table View */}
        <div
          className="desktop-view"
          style={{ display: window.innerWidth >= 768 ? "block" : "none" }}
        >
          <Table
            columns={columns}
            dataSource={filteredCandidates}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} candidates`,
              responsive: true,
            }}
            scroll={{ x: 1400 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <UserOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <Title level={4} type="secondary">
                    No candidates found
                  </Title>
                  <Text type="secondary">
                    Try adjusting your search or filters to find candidates.
                  </Text>
                </div>
              ),
            }}
          />
        </div>

        {/* Mobile Card View */}
        <div
          className="mobile-view"
          style={{ display: window.innerWidth < 768 ? "block" : "none" }}
        >
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <UserOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} type="secondary">
                No candidates found
              </Title>
              <Text type="secondary">
                Try adjusting your search or filters to find candidates.
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* Candidate Profile Drawer */}
      <Drawer
        title={selectedCandidate?.name}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 600}
        onClose={() => setCandidateDrawerVisible(false)}
        open={candidateDrawerVisible}
        extra={
          <Space>
            <Button
              icon={<MessageOutlined />}
              onClick={() => {
                setCandidateDrawerVisible(false);
                handleSendMessage(selectedCandidate);
              }}
            >
              Message
            </Button>
            {/* {selectedCandidate && renderStageActions(selectedCandidate)} */}
          </Space>
        }
      >
        {selectedCandidate && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Avatar src={selectedCandidate.avatar} size={64}>
                {selectedCandidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
              <div style={{ marginLeft: 16 }}>
                <Title level={4} style={{ marginBottom: 0 }}>
                  {selectedCandidate.name}
                </Title>
                <Text type="secondary">{selectedCandidate.position}</Text>
                {selectedCandidate.jobCode && (
                  <Text type="secondary" style={{ display: "block" }}>
                    {selectedCandidate.jobCode}
                  </Text>
                )}
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusConfig[selectedCandidate.status].color}>
                    {statusConfig[selectedCandidate.status].label}
                  </Tag>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Overview" key="1">
                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Contact Information</Title>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <Text>
                      <MailOutlined
                        style={{ marginRight: 8, ...iconTextStyle }}
                      />
                      {selectedCandidate.email}
                    </Text>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Stage Reviews</Title>
                  {selectedCandidate.stageProgress?.map((stage, index) => (
                    <div key={`stage-${index}`} style={{ marginBottom: 16 }}>
                      <Text strong>{stage.stageName}</Text>
                      {renderStageReviews(stage)}
                    </div>
                  ))}
                </div>
              </TabPane>

              <TabPane tab="Activity" key="2">
                <List
                  itemLayout="horizontal"
                  dataSource={renderActivityTimeline(
                    selectedCandidate.stageProgress
                  )}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={item.icon}
                            style={{
                              backgroundColor: "#f0f0f0",
                              color: "#da2c46",
                            }}
                          />
                        }
                        title={<Text strong>{item.title}</Text>}
                        description={
                          <>
                            <Text>{item.description}</Text>
                            <br />
                            <Text type="secondary">{item.date}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="Documents" key="3">
                {renderDocuments(selectedCandidate.stageProgress)}
              </TabPane>

              <TabPane tab="Interview Details" key="4">
                {selectedCandidate.interviewDetails ? (
                  <div>
                    <Divider orientation="left">Interview Information</Divider>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Mode">
                        {selectedCandidate.interviewDetails.mode === "online"
                          ? "Online"
                          : selectedCandidate.interviewDetails.mode ===
                            "in-person"
                          ? "In Person"
                          : "Telephonic"}
                      </Descriptions.Item>
                      {selectedCandidate.interviewDetails.mode === "online" && (
                        <Descriptions.Item label="Meeting Link">
                          <a
                            href={
                              selectedCandidate.interviewDetails.meetingLink
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Join Meeting
                          </a>
                        </Descriptions.Item>
                      )}
                      {selectedCandidate.interviewDetails.mode ===
                        "in-person" && (
                        <Descriptions.Item label="Location">
                          {selectedCandidate.interviewDetails.location}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Scheduled Date">
                        {new Date(
                          selectedCandidate.interviewDetails.date
                        ).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag
                          color={
                            selectedCandidate.interviewDetails.status ===
                            "scheduled"
                              ? "blue"
                              : selectedCandidate.interviewDetails.status ===
                                "completed"
                              ? "green"
                              : "orange"
                          }
                        >
                          {selectedCandidate.interviewDetails.status
                            .charAt(0)
                            .toUpperCase() +
                            selectedCandidate.interviewDetails.status.slice(1)}
                        </Tag>
                      </Descriptions.Item>
                      {selectedCandidate.interviewDetails.notes && (
                        <Descriptions.Item label="Notes">
                          {selectedCandidate.interviewDetails.notes}
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    <Divider orientation="left">Interviewers</Divider>
                    {allRecruiters && (
                      <List
                        dataSource={selectedCandidate.interviewDetails.interviewerIds.map(
                          (id) =>
                            allRecruiters.otherRecruiters.find(
                              (r) => r._id === id
                            )
                        )}
                        renderItem={(recruiter) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  src={recruiter?.image}
                                  style={{ backgroundColor: "#f56a00" }}
                                >
                                  {recruiter?.fullName?.charAt(0)}
                                </Avatar>
                              }
                              title={<Text strong>{recruiter?.fullName}</Text>}
                              description={
                                <>
                                  <Text>{recruiter?.specialization}</Text>
                                  <br />
                                  <Text type="secondary">
                                    {recruiter?.email}
                                  </Text>
                                </>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}

                    {selectedCandidate?.interviewDetails?.status ===
                      "scheduled" && (
                      <div
                        style={
                          window.innerWidth < 768
                            ? mobileButtonGroupStyle
                            : { display: "flex", gap: 8, marginTop: 16 }
                        }
                      >
                        <Button
                          type="primary"
                          onClick={() =>
                            handleChangeInterviewStatus("interview_completed")
                          }
                          loading={isChangingStatus}
                          block={window.innerWidth < 768}
                          style={{ background: "#da2c46" }}
                        >
                          Mark as Completed
                        </Button>
                        <Button
                          danger
                          onClick={() =>
                            handleChangeInterviewStatus("interview_cancelled")
                          }
                          loading={isChangingStatus}
                          block={window.innerWidth < 768}
                        >
                          Cancel Interview
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleRescheduleInterview}
                          block={window.innerWidth < 768}
                          style={{ background: "#da2c46" }}
                        >
                          Reschedule Interview
                        </Button>
                      </div>
                    )}
                    {selectedCandidate?.interviewDetails?.status ===
                      "cancelled" && (
                      <div
                        style={
                          window.innerWidth < 768
                            ? mobileButtonGroupStyle
                            : { display: "flex", gap: 8, marginTop: 16 }
                        }
                      >
                        <Button
                          type="primary"
                          onClick={handleRescheduleInterview}
                          block={window.innerWidth < 768}
                        >
                          Reschedule Interview
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Text type="secondary">No interview scheduled yet.</Text>
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>

      {/* Add Candidate Modal */}
      <Modal
        title="Add New Candidate"
        open={addCandidateModalVisible}
        onCancel={() => {
          setAddCandidateModalVisible(false);
          addCandidateForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={addCandidateForm}
          layout="vertical"
          initialValues={{
            status: "new",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter candidate's name" },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter phone number",
                  },
                  {
                    pattern: /^[0-9+\- ]+$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Position"
                name="position"
                rules={[
                  {
                    required: true,
                    message: "Please select a position",
                  },
                ]}
              >
                <Select placeholder="Select position">
                  <Option value="frontend">Frontend Developer</Option>
                  <Option value="backend">Backend Developer</Option>
                  <Option value="fullstack">Full Stack Developer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={4} placeholder="Add any additional notes" />
          </Form.Item>

          <Form.Item
            label="Resume"
            name="resume"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload.Dragger
              name="resume"
              multiple={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                const isDOC =
                  file.type === "application/msword" ||
                  file.type ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                if (!isPDF && !isDOC) {
                  message.error("You can only upload PDF/DOC files!");
                  return Upload.LIST_IGNORE;
                }

                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("File must smaller than 2MB!");
                  return Upload.LIST_IGNORE;
                }

                return isPDF || isDOC;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single PDF or DOC file upload (max 2MB)
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setAddCandidateModalVisible(false);
                  addCandidateForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={buttonStyle}
                onClick={() => {
                  addCandidateForm
                    .validateFields()
                    .then((values) => {
                      // Handle form submission
                      message.success("Candidate added successfully!");
                      setAddCandidateModalVisible(false);
                      addCandidateForm.resetFields();
                      refetch(); // Refresh the candidate list
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
              >
                Add Candidate
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Candidates"
        open={bulkUploadModalVisible}
        onCancel={() => setBulkUploadModalVisible(false)}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <div style={{ marginBottom: 24 }}>
          <Text>
            Upload an Excel file with candidate details. Download our template
            file to ensure proper formatting.
          </Text>
        </div>

        <Dragger
          name="file"
          multiple={false}
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          accept=".xlsx,.xls"
          beforeUpload={(file) => {
            const isExcel =
              file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
              file.type === "application/vnd.ms-excel";

            if (!isExcel) {
              message.error("You can only upload Excel files!");
              return Upload.LIST_IGNORE;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error("File must smaller than 5MB!");
              return Upload.LIST_IGNORE;
            }

            return isExcel;
          }}
          onChange={(info) => {
            const { status } = info.file;
            if (status === "done") {
              message.success(`${info.file.name} file uploaded successfully.`);
              setBulkUploadModalVisible(false);
              refetch(); // Refresh the candidate list
            } else if (status === "error") {
              message.error(`${info.file.name} file upload failed.`);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single Excel file upload (max 5MB)
          </p>
        </Dragger>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => {
              // Handle template download
              message.info("Downloading template file...");
            }}
          >
            Download Template File
          </Button>
        </div>
      </Modal>

      {/* Message Modal */}
      <Modal
        title={`Message ${selectedCandidate?.name}`}
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={messageForm}
          layout="vertical"
          initialValues={{
            subject: `Regarding your application for ${selectedCandidate?.position}`,
          }}
        >
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter a subject" }]}
          >
            <Input placeholder="Enter subject" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea rows={6} placeholder="Type your message here" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setMessageModalVisible(false);
                  messageForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={buttonStyle}
                onClick={() => {
                  messageForm
                    .validateFields()
                    .then((values) => {
                      // Handle message sending
                      message.success("Message sent successfully!");
                      setMessageModalVisible(false);
                      messageForm.resetFields();
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
              >
                Send Message
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        title={`${
          selectedCandidate?.interviewDetails ? "Reschedule" : "Schedule"
        } Interview with ${selectedCandidate?.name}`}
        open={scheduleInterviewModalVisible}
        onCancel={() => {
          setScheduleInterviewModalVisible(false);
          form.resetFields();
        }}
        footer={[
          selectedCandidate?.interviewDetails?.status === "scheduled" && (
            <Space key="actions" style={{ float: "left" }}>
              <Button
                type="primary"
                onClick={() =>
                  handleChangeInterviewStatus("interview_completed")
                }
                loading={isChangingStatus}
                style={{ background: "#da2c46" }}
              >
                Mark as Completed
              </Button>
              <Button
                danger
                onClick={() =>
                  handleChangeInterviewStatus("interview_cancelled")
                }
                loading={isChangingStatus}
              >
                Cancel Interview
              </Button>
            </Space>
          ),
          <Button
            key="cancel"
            onClick={() => {
              setScheduleInterviewModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          selectedCandidate?.interviewDetails?.status !== "completed" &&
            selectedCandidate?.interviewDetails?.status !== "cancelled" && (
              <Button
                key="submit"
                type="primary"
                style={buttonStyle}
                onClick={() => form.submit()}
                loading={isSchedulingInterview}
              >
                {selectedCandidate?.interviewDetails
                  ? "Reschedule"
                  : "Schedule"}{" "}
                Interview
              </Button>
            ),
        ]}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: "online",
          }}
          onFinish={async (values) => {
            await handleScheduleInterviewSubmit(values, selectedCandidate._id);
          }}
        >
          <Form.Item
            label="Interview Type"
            name="type"
            rules={[
              { required: true, message: "Please select interview type" },
            ]}
          >
            <Select placeholder="Select interview type">
              <Option value="online">Online (Video Call)</Option>
              <Option value="telephonic">Telephonic</Option>
              <Option value="in-person">In Person</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "online" ? (
                <Form.Item
                  label="Meeting Link"
                  name="meetingLink"
                  rules={[
                    {
                      type: "url",
                      message: "Please enter a valid URL",
                    },
                  ]}
                >
                  <Input placeholder="Enter Google Meet or Zoom link" />
                </Form.Item>
              ) : getFieldValue("type") === "in-person" ? (
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[
                    {
                      required: true,
                      message: "Please enter interview location",
                    },
                  ]}
                >
                  <Input placeholder="Enter office address or location" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            label="Interview Date & Time"
            name="datetime"
            rules={[{ required: true, message: "Please select date and time" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            label="Interviewers"
            name="interviewers"
            rules={[
              {
                required: true,
                message: "Please select at least one interviewer",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select interviewers"
              loading={!allRecruiters}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {allRecruiters?.otherRecruiters?.map((recruiter) => (
                <Option
                  key={recruiter._id}
                  value={recruiter._id}
                  label={`${recruiter.fullName || ""} (${
                    recruiter.specialization || ""
                  })`}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      size="small"
                      style={{ marginRight: 8, backgroundColor: "#f56a00" }}
                    >
                      {recruiter.fullName?.charAt(0) || "?"}
                    </Avatar>
                    <div>
                      <Text strong>{recruiter.fullName || "Unknown"}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {recruiter.specialization || "No specialization"} •{" "}
                        {recruiter.email || "No email"}
                      </Text>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Additional Notes" name="notes">
            <Input.TextArea
              rows={4}
              placeholder="Add any additional notes or instructions"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruiterCandidates;

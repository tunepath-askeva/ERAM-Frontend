import React, { useState, useEffect, useCallback } from "react";
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
  Empty,
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
  useConvertEmployeeMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;
const { Panel } = Collapse;

const RecruiterCandidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDrawerVisible, setCandidateDrawerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [interviewToReschedule, setInterviewToReschedule] = useState(null);
  const [scheduleInterviewModalVisible, setScheduleInterviewModalVisible] =
    useState(false);
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [convertForm] = Form.useForm();
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useGetPipelineCompletedCandidatesQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });
  const [moveToNextStage, { isLoading: isMovingStage }] =
    useMoveCandidateStatusMutation();
  const [addInterviewDetails, { isLoading: isSchedulingInterview }] =
    useAddInterviewDetailsMutation();
  const [changeInterviewStatus, { isLoading: isChangingStatus }] =
    useChangeInterviewStatusMutation();
  const [convertEmployee, { isLoading: isAddingEmployee }] =
    useConvertEmployeeMutation();

  const { data: allRecruiters } = useGetAllRecruitersQuery();

  useEffect(() => {
    if (apiData?.total) {
      setPagination((prev) => ({
        ...prev,
        total: apiData.total,
      }));
    }
  }, [apiData]);

  const tablePagination = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total} candidates`,
    responsive: true,
    onChange: (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
      }));
    },
    onShowSizeChange: (current, size) => {
      setPagination((prev) => ({
        ...prev,
        current: 1, // Reset to first page when changing page size
        pageSize: size,
      }));
    },
  };

  const candidates =
    apiData?.data?.map((candidate) => ({
      id: candidate._id,
      _id: candidate._id,
      candidateId: candidate.user._id,
      name: candidate.user.fullName,
      email: candidate.user.email,
      position: candidate.workOrder.title,
      jobCode: candidate.workOrder.jobCode,
      status: candidate.status,
      stageProgress: candidate.stageProgress,
      updatedAt: candidate.updatedAt,
      avatar: candidate.user.image || null,
      interviewDetails: candidate.interviewDetails || [],
    })) || [];

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

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const recruiterInfo = JSON.parse(
    localStorage.getItem("recruiterInfo") || "{}"
  );

  console.log(recruiterInfo, "Recruiter info");

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

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page when searching
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page when changing status
  };

  const handleMakeOffer = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "offer",
      }).unwrap();

      message.success(`Offer sent to ${candidate.name} successfully!`);
      refetch();

      const recruiterEmail = recruiterInfo?.email || "";
      const candidateEmail = candidate.email;
      const subject = encodeURIComponent(`Job Offer for ${candidate.position}`);
      const body = encodeURIComponent(
        `Dear ${candidate.name},\n\nWe are pleased to offer you the position of ${candidate.position}.\n\nBest regards,\n${recruiterEmail}`
      );

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${candidateEmail}&su=${subject}&body=${body}&bcc=${recruiterEmail}`;

      window.open(gmailUrl, "_blank");
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

  const getActiveInterview = (candidate) => {
    if (!candidate?.interviewDetails?.length) return null;

    return (
      candidate.interviewDetails.find(
        (interview) => !["completed", "cancelled"].includes(interview.status)
      ) || candidate.interviewDetails[candidate.interviewDetails.length - 1]
    );
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    const activeInterview = getActiveInterview(candidate);

    form.resetFields();

    if (activeInterview) {
      form.setFieldsValue({
        title: activeInterview.title,
        type: activeInterview.mode,
        meetingLink: activeInterview.meetingLink,
        location: activeInterview.location,
        datetime: dayjs(activeInterview.date),
        interviewers: activeInterview.interviewerIds,
        notes: activeInterview.notes,
      });
    }

    setScheduleInterviewModalVisible(true);
  };
  const handleChangeInterviewStatus = async (status, interviewId) => {
    if (!selectedCandidate || !interviewId) return;

    try {
      await changeInterviewStatus({
        id: selectedCandidate._id,
        _id: interviewId,
        status,
      }).unwrap();

      message.success(`Interview ${status.replace("_", " ")} successfully!`);
      refetch();
      setScheduleInterviewModalVisible(false);
    } catch (error) {
      message.error(`Failed to update interview status: ${error.message}`);
      console.error("Interview status change error:", error);
    }
  };

  const handleRescheduleInterview = (interview) => {
    form.resetFields();
    form.setFieldsValue({
      title: interview.title,
      type: interview.mode,
      meetingLink: interview.meetingLink,
      location: interview.location,
      datetime: dayjs(interview.date),
      interviewers: interview.interviewerIds,
      notes: interview.notes,
    });
    setInterviewToReschedule(interview._id);
    setScheduleInterviewModalVisible(true);
  };

  const handleConvertToEmployee = (candidate) => {
    setCandidateToConvert(candidate);
    convertForm.setFieldsValue({ fullName: candidate.name });
    setConvertModalVisible(true);
  };

  const handleScheduleInterviewSubmit = async (values) => {
    try {
      const payload = {
        title: values.title,
        scheduledAt: values.datetime.format(),
        mode: values.type,
        status: "scheduled",
        interviewerIds: values.interviewers,
        notes: values.notes,
      };

      if (values.type === "online") {
        payload.meetingLink = values.meetingLink;
      } else if (values.type === "in-person") {
        payload.location = values.location;
      }

      if (interviewToReschedule) {
        payload.id = interviewToReschedule;
      }

      await addInterviewDetails({
        id: selectedCandidate._id,
        payload,
      }).unwrap();
      message.success(
        interviewToReschedule
          ? "Interview rescheduled successfully!"
          : "Interview scheduled successfully!"
      );

      setScheduleInterviewModalVisible(false);
      form.resetFields();
      setInterviewToReschedule(null);
      refetch();
    } catch (error) {
      message.error("Failed to schedule interview");
      console.error("Error:", error);
    }
  };

  const getAvailableActions = (candidate) => {
    const actions = [];

    switch (candidate.status) {
      case "completed":
        if (hasPermission("move-to-interview")) {
          actions.push({
            key: "interview",
            label: "Move to Interview",
            icon: <ArrowRightOutlined style={iconTextStyle} />,
            onClick: () => handleMoveToInterview(candidate),
            style: { color: "#722ed1" },
          });
        }
        break;
      case "interview":
        if ((candidate.interviewDetails?.length || 0) === 0) {
          if (hasPermission("schedule-interview")) {
            actions.push({
              key: "schedule",
              label: "Schedule Interview",
              icon: <CalendarOutlined style={iconTextStyle} />,
              onClick: () => handleScheduleInterview(candidate),
              style: { color: "#722ed1" },
            });
          }
        } else if (hasPermission("view-interviews")) {
          actions.push({
            key: "view-interviews",
            label: "View Interviews",
            icon: <EyeOutlined style={iconTextStyle} />,
            onClick: () => handleViewProfile(candidate),
            style: { color: "#722ed1" },
          });
        }
        if (hasPermission("make-offer")) {
          actions.push({
            key: "offer",
            label: "Make Offer",
            icon: <GiftOutlined style={iconTextStyle} />,
            onClick: () => handleMakeOffer(candidate),
            style: { color: "#52c41a" },
          });
        }
        break;
      default:
        break;
    }

    if (candidate.status !== "rejected" && hasPermission("reject-candidate")) {
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

    if (hasPermission("convert-to-employee")) {
      actions.push({
        key: "convert",
        label: "Convert to Employee",
        icon: <CheckOutlined style={iconTextStyle} />,
        onClick: () => handleConvertToEmployee(candidate),
        style: { color: "#52c41a" },
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
          {hasPermission("view-profile") && (
            <Tooltip title="View Profile">
              <Button
                type="text"
                icon={<EyeOutlined style={iconTextStyle} />}
                size="small"
                onClick={() => handleViewProfile(record)}
              />
            </Tooltip>
          )}
          {hasPermission("send-messages") && (
            <Tooltip title="Send Message">
              <Button
                type="text"
                icon={<MessageOutlined style={iconTextStyle} />}
                size="small"
                onClick={() => handleSendMessage(record)}
              />
            </Tooltip>
          )}
          {(hasPermission("download-documents") ||
            getAvailableActions(record).length > 0) && (
            <Dropdown
              menu={{
                items: [
                  hasPermission("view-profile") && {
                    key: "view",
                    label: "View Profile",
                    icon: <EyeOutlined style={iconTextStyle} />,
                    onClick: () => handleViewProfile(record),
                  },
                  hasPermission("send-messages") && {
                    key: "message",
                    label: "Send Message",
                    icon: <MessageOutlined style={iconTextStyle} />,
                    onClick: () => handleSendMessage(record),
                  },
                  hasPermission("download-documents") && {
                    key: "download",
                    label: "Download Documents",
                    icon: <DownloadOutlined style={iconTextStyle} />,
                    onClick: () => handleDownloadResume(record),
                  },
                  ...(getAvailableActions(record).length > 0
                    ? [
                        {
                          type: "divider",
                        },
                      ]
                    : []),
                  ...getAvailableActions(record).map((action) => ({
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    onClick: action.onClick,
                    style: action.style,
                  })),
                ].filter(Boolean), // Remove any falsey values from the array
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
          )}
        </Space>
      ),
    },
  ];

  const tabItems = Object.entries(filterCounts)
    .filter(([status]) => {
      if (status === "all") return hasPermission("view-all-tab");
      return hasPermission(`view-${status}-tab`);
    })
    .map(([status, count]) => ({
      key: status,
      label: (
        <Badge count={count} size="small" offset={[10, 0]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    }));

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
              Completed Candidates
            </Title>
            <Text type="secondary">
              Manage and track your compelted candidates in pipeline
            </Text>
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
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
              allowClear
              onPressEnter={(e) => handleSearch(e.target.value)}
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
            onChange={handleStatusChange}
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
            dataSource={candidates} // Use candidates directly instead of filteredCandidates
            rowKey="id"
            loading={isLoading}
            pagination={tablePagination}
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
              {hasPermission("view-overview-tab") && (
                <TabPane tab="Overview" key="1">
                  <div style={{ marginBottom: 24 }}>
                    <Title level={5}>Contact Information</Title>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
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
              )}
              {hasPermission("view-activity-tab") && (
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
              )}
              {hasPermission("view-documents-tab") && (
                <TabPane tab="Documents" key="3">
                  {renderDocuments(selectedCandidate.stageProgress)}
                </TabPane>
              )}
              {hasPermission("view-interviews") && (
                <TabPane
                  tab={
                    <span>
                      Interviews{" "}
                      <Badge
                        count={selectedCandidate.interviewDetails?.length || 0}
                      />
                    </span>
                  }
                  key="4"
                >
                  {selectedCandidate.status === "interview" && (
                    <div style={{ marginBottom: 16 }}>
                      <Button
                        type="primary"
                        style={{ background: "#da2c46" }}
                        onClick={() => {
                          form.resetFields();
                          setScheduleInterviewModalVisible(true);
                        }}
                        icon={<PlusOutlined />}
                      >
                        Schedule New Interview
                      </Button>
                    </div>
                  )}
                  {selectedCandidate.interviewDetails?.length > 0 ? (
                    <Collapse accordion>
                      {selectedCandidate.interviewDetails.map((interview) => (
                        <Panel
                          header={`${interview.title} (${interview.status})`}
                          key={interview._id}
                          extra={
                            <Space>
                              <Tag
                                color={
                                  interview.status === "scheduled"
                                    ? "blue"
                                    : interview.status === "interview_completed"
                                    ? "green"
                                    : interview.status === "interview_hold"
                                    ? "orange"
                                    : "red"
                                }
                              >
                                {interview.status}
                              </Tag>
                              <Button
                                size="small"
                                disabled={
                                  interview.status !== "scheduled" &&
                                  interview.status !== "interview_hold"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRescheduleInterview(interview);
                                }}
                              >
                                Reschedule
                              </Button>
                            </Space>
                          }
                        >
                          <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Date & Time">
                              {new Date(interview.date).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mode">
                              {interview.mode === "online"
                                ? "Online"
                                : "In-Person"}
                            </Descriptions.Item>
                            {interview.mode === "online" && (
                              <Descriptions.Item label="Meeting Link">
                                <a
                                  href={interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Join Meeting
                                </a>
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Interviewers">
                              {allRecruiters ? (
                                <List
                                  size="small"
                                  dataSource={interview?.interviewerIds?.map(
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
                                            size="small"
                                          />
                                        }
                                        title={recruiter?.fullName || "Unknown"}
                                        description={recruiter?.specialization}
                                      />
                                    </List.Item>
                                  )}
                                />
                              ) : (
                                <Text>Loading interviewers...</Text>
                              )}
                            </Descriptions.Item>
                            {interview.notes && (
                              <Descriptions.Item label="Notes">
                                {interview.notes}
                              </Descriptions.Item>
                            )}
                          </Descriptions>

                          {/* Action buttons */}
                          <div
                            style={{ marginTop: 16, display: "flex", gap: 8 }}
                          >
                            {interview.status === "scheduled" && (
                              <>
                                <Button
                                  type="primary"
                                  style={{ background: "#52c41a" }}
                                  onClick={() =>
                                    handleChangeInterviewStatus(
                                      "interview_completed",
                                      interview._id
                                    )
                                  }
                                  loading={isChangingStatus}
                                >
                                  Mark as Completed
                                </Button>
                                <Button
                                  type="primary"
                                  style={{ background: "#faad14" }}
                                  onClick={() =>
                                    handleChangeInterviewStatus(
                                      "interview_hold",
                                      interview._id
                                    )
                                  }
                                  loading={isChangingStatus}
                                >
                                  Hold
                                </Button>
                                <Button
                                  danger
                                  onClick={() =>
                                    handleChangeInterviewStatus(
                                      "interview_rejected",
                                      interview._id
                                    )
                                  }
                                  loading={isChangingStatus}
                                >
                                  Reject
                                </Button>
                                <Button
                                  danger
                                  onClick={() =>
                                    handleChangeInterviewStatus(
                                      "interview_cancelled",
                                      interview._id
                                    )
                                  }
                                  loading={isChangingStatus}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}

                            {interview.status === "interview_hold" && (
                              <>
                                <Button
                                  type="primary"
                                  style={{ backgroundColor: "#da2c46" }}
                                  onClick={() =>
                                    handleChangeInterviewStatus(
                                      "interview_completed",
                                      interview._id
                                    )
                                  }
                                  loading={isChangingStatus}
                                >
                                  Mark as Completed
                                </Button>
                                <Button
                                  danger
                                  onClick={() =>
                                    handleChangeInterviewStatus(
                                      "interview_rejected",
                                      interview._id
                                    )
                                  }
                                  loading={isChangingStatus}
                                >
                                  Reject
                                </Button>
                                <Button
                                  type="primary"
                                  style={{ backgroundColor: "#da2c46" }}
                                  onClick={(e) => {
                                    handleRescheduleInterview(interview);
                                  }}
                                >
                                  Reschedule
                                </Button>
                              </>
                            )}

                            {interview.status === "interview_completed" && (
                              <Button
                                danger
                                onClick={() =>
                                  handleChangeInterviewStatus(
                                    "interview_rejected",
                                    interview._id
                                  )
                                }
                                loading={isChangingStatus}
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </Panel>
                      ))}
                    </Collapse>
                  ) : (
                    <Empty
                      description={
                        selectedCandidate.status === "interview"
                          ? "No interviews scheduled yet"
                          : "No interviews were scheduled for this candidate"
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      {selectedCandidate.status === "interview" && (
                        <Button
                          type="primary"
                          onClick={() => setScheduleInterviewModalVisible(true)}
                        >
                          Schedule Interview
                        </Button>
                      )}
                    </Empty>
                  )}
                </TabPane>
              )}
            </Tabs>
          </div>
        )}
      </Drawer>

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
          interviewToReschedule ? "Reschedule" : "Schedule New"
        } Interview`}
        open={scheduleInterviewModalVisible}
        onCancel={() => {
          setScheduleInterviewModalVisible(false);
          form.resetFields();
          setInterviewToReschedule(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setScheduleInterviewModalVisible(false);
              form.resetFields();
              setInterviewToReschedule(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={buttonStyle}
            onClick={() => form.submit()}
            loading={isSchedulingInterview}
          >
            {interviewToReschedule ? "Reschedule" : "Schedule"} Interview
          </Button>,
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
            label="Interview Title"
            name="title"
            rules={[
              { required: true, message: "Please enter interview title" },
            ]}
          >
            <Input placeholder="e.g. Technical Interview, HR Round, etc." />
          </Form.Item>
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

      <Modal
        title={`Convert ${candidateToConvert?.name || ""} to Employee`}
        open={convertModalVisible}
        onCancel={() => {
          setConvertModalVisible(false);
          convertForm.resetFields();
          setCandidateToConvert(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={convertForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!candidateToConvert) {
                throw new Error("No candidate selected");
              }

              console.log("Candidate object structure:", {
                candidateId: candidateToConvert._id,
                userId: candidateToConvert.candidateId,
                fullObject: candidateToConvert,
              });

              if (!candidateToConvert.candidateId) {
                throw new Error("Candidate user information is incomplete");
              }

              const payload = {
                ...values,
                candidateId: candidateToConvert.candidateId,
                customFieldId: candidateToConvert._id,
              };

              console.log("Submit to API:", payload);
              await convertEmployee(payload).unwrap();

              message.success("Candidate successfully converted to employee!");
              setConvertModalVisible(false);
              convertForm.resetFields();
              setCandidateToConvert(null);
              refetch();
            } catch (error) {
              console.error("Conversion failed:", error);
              message.error(error.message || "Failed to convert candidate.");
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date of Join"
                name="dateOfJoining"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Assigned Job Title"
                name="assignedJobTitle"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ERAMID"
                name="eramId"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Badge No"
                name="badgeNo"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Gate Pass ID" name="gatePassId">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Aramco ID" name="aramcoId">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Other ID" name="otherId">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Plant ID" name="plantId">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Official E-Mail Account" name="officialEmail">
            <Input />
          </Form.Item>

          <Form.Item
            label="Basic Asset MGT: Laptop, Vehicle, etc (Reporting and Documentation)"
            name="basicAssets"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setConvertModalVisible(false);
                convertForm.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#da2c46" }}
              htmlType="submit"
            >
              Convert to Employee
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruiterCandidates;

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Drawer,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Descriptions,
  message,
  Typography,
  Layout,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PauseOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useGetRecruiterInterviewsQuery,
  useChangeInterviewStatusMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { TextArea } = Input;
const { Title } = Typography;
const { Header, Content } = Layout;

const RecruiterAssignedInterviews = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form] = Form.useForm();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const { data, isLoading, error, refetch } = useGetRecruiterInterviewsQuery({
    page,
    limit,
    search: debouncedSearch,
  });
  const [changeStatus] = useChangeInterviewStatusMutation();

  const transformInterviewData = (apiData) => {
    if (!apiData || !apiData.interviews) return [];

    const transformedData = [];

    apiData.interviews.forEach((candidateInterview) => {
      if (!candidateInterview?.interviews) return;

      candidateInterview.interviews.forEach((interview) => {
        transformedData.push({
          id: interview?._id || null,
          customFieldResponseId:
            candidateInterview?.customFieldResponseId || null,
          candidateId: candidateInterview?.candidate?._id || null,
          candidateEmail: candidateInterview?.candidate?.email || "N/A",
          candidateName: candidateInterview?.candidate?.name ||
            (candidateInterview?.candidate?.firstName && candidateInterview?.candidate?.lastName
              ? `${candidateInterview.candidate.firstName} ${candidateInterview.candidate.lastName}`
              : candidateInterview?.candidate?.email
              ? candidateInterview.candidate.email.split("@")[0]
              : "Unknown"),
          position: candidateInterview?.workOrder?.title || "N/A",
          jobCode: candidateInterview?.workOrder?.jobCode || "N/A",
          workplace: candidateInterview?.workOrder?.workplace || "N/A",
          workOrderId: candidateInterview?.workOrder?._id || null,
          scheduledDate: interview?.date
            ? new Date(interview.date).toLocaleDateString("en-GB")
            : "N/A",
          scheduledTime: interview?.date
            ? new Date(interview.date).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A",
          fullDateTime: interview?.date || null,
          status: interview?.status
            ? interview.status
                .replace("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : "N/A",
          interviewType: interview?.title || "N/A",
          mode: interview?.mode || "N/A",
          meetingLink: interview?.meetingLink || null,
          location: interview?.location || null,
          notes: interview?.notes || null,
          interviewerIds: interview?.interviewerIds || [],
          originalInterview: interview,
          originalCandidate: candidateInterview?.candidate || {},
          originalWorkOrder: candidateInterview?.workOrder || {},
        });
      });
    });

    return transformedData;
  };

  // Transform API data
  const transformedData = useMemo(() => {
    if (!data) return [];
    return transformInterviewData(data);
  }, [data]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "interview completed":
        return "green";
      case "scheduled":
        return "blue";
      case "in progress":
        return "orange";
      case "cancelled":
        return "red";
      case "on hold":
        return "volcano";
      default:
        return "default";
    }
  };

  const getModeIcon = (mode) => {
    switch (mode.toLowerCase()) {
      case "online":
        return "🔗";
      case "telephonic":
        return "📞";
      case "in-person":
        return "🏢";
      default:
        return "📋";
    }
  };

  const getModeColor = (mode) => {
    switch (mode.toLowerCase()) {
      case "online":
        return "green";
      case "telephonic":
        return "blue";
      case "in-person":
        return "orange";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidateName",
      key: "candidateNameMobile",
      width: 200,
      responsive: ["xs", "sm", "md", "lg"],
      render: (text, record) => (
        <div>
          <Space direction="vertical" size="small">
            <Space>
              <UserOutlined style={{ color: "#da2c46" }} />
              <span
                style={{
                  wordBreak: "break-word",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {text}
              </span>
            </Space>
            <span style={{ fontSize: "10px", color: "#666" }}>
              {record.candidateEmail}
            </span>
          </Space>
        </div>
      ),
    },
    {
      title: "Position & Job Code",
      dataIndex: "position",
      key: "position",
      width: 200,
      render: (text, record) => (
        <div>
          <div
            style={{
              wordBreak: "break-word",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {text}
          </div>
          <div style={{ fontSize: "10px", color: "#666" }}>
            {record.jobCode} • {record.workplace}
          </div>
        </div>
      ),
    },
    {
      title: "Interview Type & Mode",
      dataIndex: "interviewType",
      key: "interviewType",
      width: 180,
      render: (text, record) => (
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            {text}
          </div>
          <Tag color={getModeColor(record.mode)} size="small">
            {getModeIcon(record.mode)} {record.mode}
          </Tag>
        </div>
      ),
    },
    {
      title: "Date & Time",
      key: "dateTime",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            <Space size="small">
              <CalendarOutlined style={{ color: "#da2c46" }} />
              <span style={{ fontSize: "12px" }}>{record.scheduledDate}</span>
            </Space>
          </div>
          <div>
            <Space size="small">
              <ClockCircleOutlined style={{ color: "#da2c46" }} />
              <span style={{ fontSize: "12px" }}>{record.scheduledTime}</span>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: "10px" }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
          style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
        >
          View
        </Button>
      ),
    },
  ];

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setDrawerVisible(true);
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setModalVisible(true);
  };

  const handleSubmitRemarks = async (values) => {
    try {
      // Map the action to the correct status
      const statusMapping = {
        pass: "pass",
        fail: "fail",
        hold: "interview_hold",
      };

      await changeStatus({
        id: selectedInterview.customFieldResponseId, // <-- goes in params

        _id: selectedInterview.id, // <-- correct interview _id
        status: statusMapping[selectedAction],
        remarks: values.remarks,
      }).unwrap();

      refetch();
      message.success(`Interview marked as ${selectedAction} successfully!`);
      setModalVisible(false);
      setDrawerVisible(false);
      form.resetFields();

      // Reset state
      setSelectedInterview(null);
      setSelectedAction("");
    } catch (error) {
      console.error("Error updating interview status:", error);
      message.error("Failed to submit interview result");
    }
  };

  const getActionButtonStyle = (action) => ({
    backgroundColor:
      action === "pass" ? "#52c41a" : action === "fail" ? "#ff4d4f" : "#faad14",
    borderColor:
      action === "pass" ? "#52c41a" : action === "fail" ? "#ff4d4f" : "#faad14",
  });

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <Card
        style={{
          padding: window.innerWidth < 768 ? "0 16px" : "0 24px",
          height: "auto",
          lineHeight: "normal",
          paddingTop: window.innerWidth < 768 ? "16px" : "20px",
          paddingBottom: window.innerWidth < 768 ? "16px" : "20px",
        }}
      >
        <Title
          level={window.innerWidth < 768 ? 3 : 2}
          style={{
            margin: 0,
            textAlign: "left",
          }}
        >
          Recruiter Assigned Interviews
        </Title>
      </Card>

      <Content style={{ padding: window.innerWidth < 768 ? "16px" : "24px" }}>
        {/* Search Bar */}
        <Card
          style={{
            marginBottom: window.innerWidth < 768 ? "16px" : "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Row>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Input
                allowClear
                placeholder="Search by candidate, position, job code, or status..."
                prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
                value={searchText}
                onChange={handleSearchChange}
                size={window.innerWidth < 768 ? "middle" : "large"}
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
        </Card>

        {/* Interviews Table */}
        <Card
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <Table
            columns={columns}
            dataSource={transformedData}
            rowKey="id"
            scroll={{ x: 1100 }}
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.total || 0,
              onChange: (newPage, newLimit) => {
                setPage(newPage);
                setLimit(newLimit);
              },
              showSizeChanger: window.innerWidth >= 768,
              showQuickJumper: window.innerWidth >= 768,
              simple: window.innerWidth < 768,
              size: "small",
              showTotal: (total, range) =>
                window.innerWidth >= 768
                  ? `${range[0]}-${range[1]} of ${total} interviews`
                  : `${total} total`,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            size={window.innerWidth < 768 ? "small" : "middle"}
            loading={isLoading}
          />
        </Card>
      </Content>

      {/* Interview Details Drawer */}
      <Drawer
        title="Interview Details"
        placement="right"
        width={
          window.innerWidth < 768 ? "90%" : window.innerWidth < 1024 ? 500 : 600
        }
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        headerStyle={{ backgroundColor: "#da2c46", color: "white" }}
      >
        {selectedInterview && (
          <div>
            <Descriptions
              title="Interview Information"
              bordered
              column={1}
              size="small"
              labelStyle={{
                fontSize: window.innerWidth < 768 ? "12px" : "14px",
              }}
              contentStyle={{
                fontSize: window.innerWidth < 768 ? "12px" : "14px",
              }}
            >
              <Descriptions.Item label="Candidate Name">
                {selectedInterview.candidateName}
              </Descriptions.Item>
              <Descriptions.Item label="Candidate Email">
                {selectedInterview.candidateEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Position">
                {selectedInterview.position}
              </Descriptions.Item>
              <Descriptions.Item label="Job Code">
                {selectedInterview.jobCode}
              </Descriptions.Item>
              <Descriptions.Item label="Workplace">
                <Tag color="blue">{selectedInterview.workplace}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Interview Type">
                {selectedInterview.interviewType}
              </Descriptions.Item>
              <Descriptions.Item label="Interview Mode">
                <Tag color={getModeColor(selectedInterview.mode)}>
                  {getModeIcon(selectedInterview.mode)} {selectedInterview.mode}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Date">
                {selectedInterview.scheduledDate}
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Time">
                {selectedInterview.scheduledTime}
              </Descriptions.Item>
              {selectedInterview.mode === "online" &&
                selectedInterview.meetingLink && (
                  <Descriptions.Item label="Meeting Link">
                    <a
                      href={
                        selectedInterview.meetingLink.startsWith("http")
                          ? selectedInterview.meetingLink
                          : `https://${selectedInterview.meetingLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ wordBreak: "break-all" }}
                    >
                      <LinkOutlined /> Join Meeting
                    </a>
                  </Descriptions.Item>
                )}
              {selectedInterview.mode === "in-person" &&
                selectedInterview.location && (
                  <Descriptions.Item label="Location">
                    📍 {selectedInterview.location}
                  </Descriptions.Item>
                )}
              {selectedInterview.mode === "telephonic" && (
                <Descriptions.Item label="Interview Mode">
                  <Tag color="blue">📞 Phone Interview</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Notes">
                {selectedInterview.notes || "No notes provided"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedInterview.status)}>
                  {selectedInterview.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Interviewers">
                <Tag color="purple">
                  {selectedInterview.interviewerIds.length} interviewer(s)
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Only show action buttons if interview is scheduled */}
            {(selectedInterview.status.toLowerCase() === "scheduled" ||
              selectedInterview.status.toLowerCase() === "interview hold" ||
              selectedInterview.status.toLowerCase() === "on hold") && (
              <Card
                title="Interview Actions"
                style={{ marginTop: window.innerWidth < 768 ? "16px" : "24px" }}
                headStyle={{
                  backgroundColor: "#f5f5f5",
                  fontSize: window.innerWidth < 768 ? "14px" : "16px",
                }}
              >
                <Row gutter={[8, 8]}>
                  {/* Show Pass button for both scheduled and hold status */}
                  <Col
                    xs={24}
                    sm={
                      selectedInterview.status.toLowerCase() === "scheduled"
                        ? 8
                        : 12
                    }
                  >
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      block
                      size={window.innerWidth < 768 ? "middle" : "large"}
                      style={getActionButtonStyle("pass")}
                      onClick={() => handleActionClick("pass")}
                    >
                      Pass
                    </Button>
                  </Col>

                  {/* Show Fail button for both scheduled and hold status */}
                  <Col
                    xs={24}
                    sm={
                      selectedInterview.status.toLowerCase() === "scheduled"
                        ? 8
                        : 12
                    }
                  >
                    <Button
                      type="primary"
                      icon={<CloseOutlined />}
                      block
                      size={window.innerWidth < 768 ? "middle" : "large"}
                      style={getActionButtonStyle("fail")}
                      onClick={() => handleActionClick("fail")}
                    >
                      Fail
                    </Button>
                  </Col>

                  {/* Show Hold button only for scheduled interviews */}
                  {selectedInterview.status.toLowerCase() === "scheduled" && (
                    <Col xs={24} sm={8}>
                      <Button
                        type="primary"
                        icon={<PauseOutlined />}
                        block
                        size={window.innerWidth < 768 ? "middle" : "large"}
                        style={getActionButtonStyle("hold")}
                        onClick={() => handleActionClick("hold")}
                      >
                        Hold
                      </Button>
                    </Col>
                  )}
                </Row>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* Remarks Modal */}
      <Modal
        title={`Interview Result - ${
          selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)
        }`}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={
          window.innerWidth < 768 ? "95%" : window.innerWidth < 1024 ? 500 : 600
        }
        centered={window.innerWidth < 768}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitRemarks}>
          <Form.Item
            name="remarks"
            label="Interview Remarks"
            rules={[
              { required: true, message: "Please provide your remarks!" },
            ]}
          >
            <TextArea
              rows={window.innerWidth < 768 ? 4 : 6}
              placeholder="Please provide detailed remarks about the interview, candidate performance, and your decision..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space
              direction={window.innerWidth < 576 ? "vertical" : "horizontal"}
              style={{ width: window.innerWidth < 576 ? "100%" : "auto" }}
            >
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                block={window.innerWidth < 576}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
                block={window.innerWidth < 576}
              >
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruiterAssignedInterviews;

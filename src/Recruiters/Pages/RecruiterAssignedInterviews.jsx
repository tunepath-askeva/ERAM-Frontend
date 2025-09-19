import React, { useState, useEffect, useCallback } from "react";
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
  const [filteredData, setFilteredData] = useState([]);
  const [form] = Form.useForm();

  const { data, isLoading, error, refetch } = useGetRecruiterInterviewsQuery();
  const [changeStatus] = useChangeInterviewStatusMutation();

  const transformInterviewData = (apiData) => {
    if (!apiData || !apiData.interviews) return [];

    const transformedData = [];

    apiData.interviews.forEach((candidateInterview) => {
      candidateInterview.interviews.forEach((interview) => {
        transformedData.push({
          id: interview._id,
          customFieldResponseId: candidateInterview.customFieldResponseId,
          candidateId: candidateInterview.candidate._id,
          candidateEmail: candidateInterview.candidate.email,
          candidateName: candidateInterview.candidate.email.split("@")[0],
          position: candidateInterview.workOrder.title,
          jobCode: candidateInterview.workOrder.jobCode,
          workplace: candidateInterview.workOrder.workplace,
          workOrderId: candidateInterview.workOrder._id,
          scheduledDate: new Date(interview.date).toLocaleDateString("en-GB"),
          scheduledTime: new Date(interview.date).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          fullDateTime: interview.date,
          status: interview.status
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          interviewType: interview.title,
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          location: interview.location,
          notes: interview.notes,
          interviewerIds: interview.interviewerIds,
          originalInterview: interview,
          originalCandidate: candidateInterview.candidate,
          originalWorkOrder: candidateInterview.workOrder,
        });
      });
    });

    return transformedData;
  };

  // Initialize filtered data when API data changes
  useEffect(() => {
    if (data) {
      const transformedData = transformInterviewData(data);
      setFilteredData(transformedData);
    }
  }, [data]);

  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchValue) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!data) return;

          const allData = transformInterviewData(data);

          if (searchValue.trim() === "") {
            setFilteredData(allData);
          } else {
            const filtered = allData.filter(
              (interview) =>
                interview.candidateName
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                interview.candidateEmail
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                interview.position
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                interview.interviewType
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                interview.status
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()) ||
                interview.jobCode
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
            );
            setFilteredData(filtered);
          }
        }, 300); // Reduced debounce time to 300ms for better UX
      };
    })(),
    [data]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debounceSearch(value);
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
            dataSource={filteredData}
            rowKey="id"
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: window.innerWidth < 768 ? 5 : 10,
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
            {selectedInterview.status.toLowerCase() === "scheduled" && (
              <Card
                title="Interview Actions"
                style={{ marginTop: window.innerWidth < 768 ? "16px" : "24px" }}
                headStyle={{
                  backgroundColor: "#f5f5f5",
                  fontSize: window.innerWidth < 768 ? "14px" : "16px",
                }}
              >
                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={8}>
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
                  <Col xs={24} sm={8}>
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

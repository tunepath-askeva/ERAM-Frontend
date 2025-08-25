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
} from "@ant-design/icons";

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

  // Sample data - replace with your actual data
  const interviewsData = [
    {
      id: 1,
      candidateName: "John Doe",
      position: "Software Engineer",
      scheduledDate: "2024-08-26",
      scheduledTime: "10:00 AM",
      status: "Scheduled",
      interviewType: "Technical",
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      position: "UI/UX Designer",
      scheduledDate: "2024-08-27",
      scheduledTime: "2:00 PM",
      status: "In Progress",
      interviewType: "Design",
    },
    {
      id: 3,
      candidateName: "Mike Johnson",
      position: "Data Scientist",
      scheduledDate: "2024-08-28",
      scheduledTime: "11:30 AM",
      status: "Scheduled",
      interviewType: "Technical",
    },
    {
      id: 4,
      candidateName: "Sarah Wilson",
      position: "Frontend Developer",
      scheduledDate: "2024-08-29",
      scheduledTime: "3:00 PM",
      status: "Scheduled",
      interviewType: "Technical",
    },
    {
      id: 5,
      candidateName: "David Brown",
      position: "Product Manager",
      scheduledDate: "2024-08-30",
      scheduledTime: "1:00 PM",
      status: "In Progress",
      interviewType: "Managerial",
    },
  ];

  // Initialize filtered data
  useEffect(() => {
    setFilteredData(interviewsData);
  }, []);

  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchValue) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (searchValue.trim() === "") {
            setFilteredData(interviewsData);
          } else {
            const filtered = interviewsData.filter(
              (interview) =>
                interview.candidateName
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
                  .includes(searchValue.toLowerCase())
            );
            setFilteredData(filtered);
          }
        }, 2000); // 2 seconds debounce
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debounceSearch(value);
  };

  const columns = [

    {
      title: "Candidate",
      dataIndex: "candidateName",
      key: "candidateNameMobile",
      width: 150,
      responsive: ["xs", "sm", "md", "lg"],
      render: (text) => (
        <div>
          <Space>
            <UserOutlined style={{ color: "#da2c46" }} />
            <span style={{ wordBreak: "break-word", fontSize: "12px" }}>
              {text}
            </span>
          </Space>
        </div>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 180,
      render: (text) => <span style={{ wordBreak: "break-word" }}>{text}</span>,
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
      width: 120,
      render: (status) => {
        const color =
          status === "Scheduled"
            ? "blue"
            : status === "In Progress"
            ? "orange"
            : "green";
        return (
          <Tag color={color} style={{ fontSize: "10px" }}>
            {status}
          </Tag>
        );
      },
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
        />
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
      // Here you would typically make an API call to submit the interview result
      console.log("Interview Result:", {
        interviewId: selectedInterview.id,
        action: selectedAction,
        remarks: values.remarks,
        rating: values.rating,
      });

      message.success(`Interview marked as ${selectedAction} successfully!`);
      setModalVisible(false);
      setDrawerVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to submit interview result");
    }
  };

  const getActionButtonStyle = (action) => ({
    backgroundColor:
      action === "pass" ? "#52c41a" : action === "fail" ? "#ff4d4f" : "#faad14",
    borderColor:
      action === "pass" ? "#52c41a" : action === "fail" ? "#ff4d4f" : "#faad14",
  });

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
            textAlign:"left",
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
                placeholder="Search by candidate name, position, type, or status..."
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
            scroll={{ x: 800 }}
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
            loading={false}
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
              <Descriptions.Item label="Position">
                {selectedInterview.position}
              </Descriptions.Item>
              <Descriptions.Item label="Interview Type">
                {selectedInterview.interviewType}
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Date">
                {selectedInterview.scheduledDate}
              </Descriptions.Item>
              <Descriptions.Item label="Scheduled Time">
                {selectedInterview.scheduledTime}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedInterview.status === "Scheduled" ? "blue" : "orange"
                  }
                >
                  {selectedInterview.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

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

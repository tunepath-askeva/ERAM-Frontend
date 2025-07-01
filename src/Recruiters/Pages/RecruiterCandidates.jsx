import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Rate,
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
} from "@ant-design/icons";
import { useGetPipelineCompletedCandidatesQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;

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
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [addCandidateForm] = Form.useForm();

  const { data } = useGetPipelineCompletedCandidatesQuery();

  // Custom styles
  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  // Mock candidate data
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Frontend Developer",
      location: "San Francisco, CA",
      status: "interview",
      stage: "Technical Interview",
      rating: 4,
      experience: "5 years",
      skills: ["React", "TypeScript", "Node.js"],
      avatar: "https://via.placeholder.com/40x40/1890ff/ffffff?text=SC",
      appliedDate: "2024-06-10",
      lastActivity: "2 hours ago",
      starred: true,
      resumeUrl: "#",
      summary:
        "Experienced frontend developer with strong React expertise and leadership experience.",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      email: "marcus.j@email.com",
      phone: "+1 (555) 987-6543",
      position: "Product Manager",
      location: "New York, NY",
      status: "new",
      stage: "Application Review",
      rating: 0,
      experience: "8 years",
      skills: ["Product Strategy", "Analytics", "Agile"],
      avatar: "https://via.placeholder.com/40x40/52c41a/ffffff?text=MJ",
      appliedDate: "2024-06-15",
      lastActivity: "1 day ago",
      starred: false,
      resumeUrl: "#",
      summary:
        "Senior product manager with extensive experience in B2B SaaS products.",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      email: "emma.rodriguez@email.com",
      phone: "+1 (555) 456-7890",
      position: "UX Designer",
      location: "Austin, TX",
      status: "offer",
      stage: "Offer Extended",
      rating: 5,
      experience: "4 years",
      skills: ["Figma", "User Research", "Prototyping"],
      avatar: "https://via.placeholder.com/40x40/722ed1/ffffff?text=ER",
      appliedDate: "2024-06-05",
      lastActivity: "30 minutes ago",
      starred: true,
      resumeUrl: "#",
      summary:
        "Creative UX designer with strong user research background and design system experience.",
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 321-0987",
      position: "Backend Engineer",
      location: "Seattle, WA",
      status: "rejected",
      stage: "Not a Fit",
      rating: 2,
      experience: "3 years",
      skills: ["Python", "Django", "PostgreSQL"],
      avatar: "https://via.placeholder.com/40x40/fa8c16/ffffff?text=DK",
      appliedDate: "2024-06-08",
      lastActivity: "3 days ago",
      starred: false,
      resumeUrl: "#",
      summary:
        "Backend developer with Python expertise, though lacking senior-level experience.",
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.thompson@email.com",
      phone: "+1 (555) 654-3210",
      position: "Data Scientist",
      location: "Boston, MA",
      status: "screening",
      stage: "Phone Screening",
      rating: 3,
      experience: "6 years",
      skills: ["Python", "Machine Learning", "SQL"],
      avatar: "https://via.placeholder.com/40x40/eb2f96/ffffff?text=LT",
      appliedDate: "2024-06-12",
      lastActivity: "5 hours ago",
      starred: false,
      resumeUrl: "#",
      summary:
        "Data scientist with strong ML background and experience in healthcare analytics.",
    },
  ]);

  const statusConfig = {
    new: { color: "blue", label: "New" },
    screening: { color: "orange", label: "Screening" },
    interview: { color: "purple", label: "Interview" },
    offer: { color: "green", label: "Offer" },
    rejected: { color: "red", label: "Rejected" },
  };

  const filterCounts = {
    all: candidates.length,
    new: candidates.filter((c) => c.status === "new").length,
    screening: candidates.filter((c) => c.status === "screening").length,
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
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const toggleStar = (candidateId) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, starred: !candidate.starred }
          : candidate
      )
    );
    message.success("Candidate starred status updated!");
  };

  const updateCandidateStatus = (candidateId, newStatus, newStage) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus, stage: newStage }
          : candidate
      )
    );
    message.success(`Candidate status updated to ${newStatus}`);
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
    // Simulate download
    message.success(`Downloading ${candidate.name}'s resume...`);
  };

  const handleScheduleInterview = (values) => {
    updateCandidateStatus(
      selectedCandidate?.id,
      "interview",
      "Technical Interview"
    );
    setScheduleModalVisible(false);
    form.resetFields();
    message.success("Interview scheduled successfully!");
  };

  const handleSendMessageSubmit = (values) => {
    setMessageModalVisible(false);
    messageForm.resetFields();
    message.success(`Message sent to ${selectedCandidate?.name}!`);
  };

  const handleAddCandidate = (values) => {
    const newCandidate = {
      id: candidates.length + 1,
      name: values.name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      location: values.location,
      status: values.status || "new",
      stage: "Application Review",
      rating: 0,
      experience: values.experience,
      skills: values.skills || [],
      avatar: `https://via.placeholder.com/40x40/1890ff/ffffff?text=${values.name
        .split(" ")
        .map((n) => n[0])
        .join("")}`,
      appliedDate: new Date().toISOString().split("T")[0],
      lastActivity: "Just now",
      starred: false,
      resumeUrl: "#",
      summary: values.summary || "No summary provided.",
    };

    setCandidates([newCandidate, ...candidates]);
    setAddCandidateModalVisible(false);
    addCandidateForm.resetFields();
    message.success(`${values.name} has been added successfully!`);
  };

  const handleBulkUpload = (info) => {
    const { status } = info.file;

    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
      // Here you would typically process the uploaded file
      // For demo purposes, we'll just show a success message
      setBulkUploadModalVisible(false);
      message.info(
        "Bulk upload processing completed. Check your candidate list for new entries."
      );
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".csv,.xlsx,.xls",
    action: "/api/upload", // This would be your actual upload endpoint
    onChange: handleBulkUpload,
    beforeUpload: (file) => {
      const isValidType =
        file.type === "text/csv" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isValidType) {
        message.error("You can only upload CSV or Excel files!");
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File must smaller than 10MB!");
      }
      return isValidType && isLt10M;
    },
  };

  const getActionMenuItems = (candidate) => [
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
      label: "Download Resume",
      icon: <DownloadOutlined style={iconTextStyle} />,
      onClick: () => handleDownloadResume(candidate),
    },
    { type: "divider" },
    {
      key: "screening",
      label: "Move to Screening",
      onClick: () =>
        updateCandidateStatus(candidate.id, "screening", "Phone Screening"),
    },
    {
      key: "interview",
      label: "Schedule Interview",
      onClick: () => {
        setSelectedCandidate(candidate);
        setScheduleModalVisible(true);
      },
    },
    {
      key: "offer",
      label: "Make Offer",
      onClick: () =>
        updateCandidateStatus(candidate.id, "offer", "Offer Extended"),
    },
    { type: "divider" },
    {
      key: "reject",
      label: "Reject",
      danger: true,
      onClick: () =>
        updateCandidateStatus(candidate.id, "rejected", "Not a Fit"),
    },
  ];

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
              <Button
                type="text"
                size="small"
                icon={
                  record.starred ? (
                    <StarFilled style={{ color: "#faad14" }} />
                  ) : (
                    <StarOutlined />
                  )
                }
                onClick={() => toggleStar(record.id)}
              />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined style={iconTextStyle} /> {record.email}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <EnvironmentOutlined style={iconTextStyle} /> {record.location}
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
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.experience} experience
          </Text>
          <div style={{ marginTop: 8 }}>
            {record.skills.slice(0, 3).map((skill) => (
              <Tag key={skill} size="small" style={{ marginBottom: 4 }}>
                {skill}
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div>
          <Tag color={statusConfig[status].color}>
            {statusConfig[status].label}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.stage}
          </Text>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      responsive: ["lg"],
      render: (rating) => (
        <Rate disabled value={rating} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: "Applied",
      dataIndex: "appliedDate",
      key: "appliedDate",
      responsive: ["md"],
      render: (date, record) => (
        <div>
          <Text>{date}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.lastActivity}
          </Text>
        </div>
      ),
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
          <Tooltip title="Schedule Interview">
            <Button
              type="text"
              icon={<CalendarOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => {
                setSelectedCandidate(record);
                setScheduleModalVisible(true);
              }}
            />
          </Tooltip>
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
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
        <CalendarOutlined
          key="schedule"
          style={iconTextStyle}
          onClick={() => {
            setSelectedCandidate(candidate);
            setScheduleModalVisible(true);
          }}
        />,
        <Dropdown
          menu={{ items: getActionMenuItems(candidate) }}
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
            <Button
              type="text"
              size="small"
              icon={
                candidate.starred ? (
                  <StarFilled style={{ color: "#faad14" }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={() => toggleStar(candidate.id)}
            />
          </div>
          <Text style={{ display: "block", marginBottom: 4 }}>
            {candidate.position}
          </Text>
          <div style={{ marginBottom: 8 }}>
            <Tag color={statusConfig[candidate.status].color} size="small">
              {statusConfig[candidate.status].label}
            </Tag>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {candidate.skills.slice(0, 3).map((skill) => (
              <Tag key={skill} size="small">
                {skill}
              </Tag>
            ))}
          </div>
          <Rate
            disabled
            value={candidate.rating}
            style={{ fontSize: 12, marginTop: 8 }}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div
      style={{
        padding: "12px",
        minHeight: "100vh",
      }}
    >
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
              placeholder="Search candidates, positions, or skills..."
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
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} candidates`,
              responsive: true,
            }}
            scroll={{ x: 1200 }}
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
          onFinish={handleAddCandidate}
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
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Position"
                name="position"
                rules={[{ required: true, message: "Please enter position" }]}
              >
                <Input placeholder="Enter position/role" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Experience"
                name="experience"
                rules={[{ required: true, message: "Please enter experience" }]}
              >
                <Input placeholder="e.g., 5 years" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Skills" name="skills">
                <Select
                  mode="tags"
                  placeholder="Enter skills (press Enter to add)"
                  style={{ width: "100%" }}
                >
                  <Option value="React">React</Option>
                  <Option value="JavaScript">JavaScript</Option>
                  <Option value="Python">Python</Option>
                  <Option value="Node.js">Node.js</Option>
                  <Option value="SQL">SQL</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Status" name="status">
                <Select>
                  <Option value="new">New</Option>
                  <Option value="screening">Screening</Option>
                  <Option value="interview">Interview</Option>
                  <Option value="offer">Offer</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Summary" name="summary">
            <Input.TextArea
              rows={3}
              placeholder="Brief summary about the candidate..."
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setAddCandidateModalVisible(false);
                  addCandidateForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
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
        footer={[
          <Button key="cancel" onClick={() => setBulkUploadModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="download"
            onClick={() => {
              // Simulate template download
              message.success("Template downloaded successfully!");
            }}
          >
            Download Template
          </Button>,
        ]}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <div style={{ marginBottom: 20 }}>
          <Text>
            Upload a CSV or Excel file with candidate information. Make sure
            your file includes the following columns:
          </Text>
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 6,
            }}
          >
            <Text code>
              Name, Email, Phone, Position, Location, Experience, Skills,
              Summary
            </Text>
          </div>
        </div>

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: "#da2c46" }} />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single CSV or Excel file upload. Maximum file size:
            10MB.
          </p>
        </Dragger>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        title={`Schedule Interview with ${selectedCandidate?.name}`}
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleScheduleInterview}
          initialValues={{
            interviewType: "technical",
            duration: 60,
          }}
        >
          <Form.Item
            label="Interview Type"
            name="interviewType"
            rules={[
              { required: true, message: "Please select interview type" },
            ]}
          >
            <Select>
              <Option value="phone">Phone Screening</Option>
              <Option value="technical">Technical Interview</Option>
              <Option value="behavioral">Behavioral Interview</Option>
              <Option value="onsite">Onsite Interview</Option>
              <Option value="hr">HR Interview</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Interview Date & Time"
            name="interviewTime"
            rules={[{ required: true, message: "Please select date and time" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Duration (minutes)"
            name="duration"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <Input type="number" min={15} max={240} />
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
            <Select mode="multiple" placeholder="Select interviewers">
              <Option value="john@company.com">John Smith (Tech Lead)</Option>
              <Option value="sarah@company.com">
                Sarah Johnson (Engineering Manager)
              </Option>
              <Option value="mike@company.com">Mike Brown (HR)</Option>
              <Option value="lisa@company.com">
                Lisa Wong (Product Manager)
              </Option>
            </Select>
          </Form.Item>

          <Form.Item label="Meeting Link/Details" name="meetingDetails">
            <Input.TextArea
              rows={3}
              placeholder="Zoom link, Google Meet, or location details"
            />
          </Form.Item>

          <Form.Item label="Notes for Candidate" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Any special instructions for the candidate"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setScheduleModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Schedule Interview
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Send Message Modal */}
      <Modal
        title={`Message ${selectedCandidate?.name}`}
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <Form
          form={messageForm}
          layout="vertical"
          onFinish={handleSendMessageSubmit}
        >
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Enter message subject" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea rows={6} placeholder="Write your message here..." />
          </Form.Item>

          <Form.Item label="Attachment" name="attachment">
            <Upload>
              <Button icon={<UploadOutlined />}>Add Attachment</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setMessageModalVisible(false);
                  messageForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Send Message
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
            <Button
              type="primary"
              style={buttonStyle}
              icon={<CalendarOutlined />}
              onClick={() => {
                setCandidateDrawerVisible(false);
                setSelectedCandidate(selectedCandidate);
                setScheduleModalVisible(true);
              }}
            >
              Schedule
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
                  <Button
                    type="text"
                    icon={
                      selectedCandidate.starred ? (
                        <StarFilled style={{ color: "#faad14" }} />
                      ) : (
                        <StarOutlined />
                      )
                    }
                    onClick={() => toggleStar(selectedCandidate.id)}
                  />
                </Title>
                <Text type="secondary">{selectedCandidate.position}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusConfig[selectedCandidate.status].color}>
                    {statusConfig[selectedCandidate.status].label}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {selectedCandidate.stage}
                  </Text>
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
                    <Text>
                      <PhoneOutlined
                        style={{ marginRight: 8, ...iconTextStyle }}
                      />
                      {selectedCandidate.phone}
                    </Text>
                    <Text>
                      <EnvironmentOutlined
                        style={{ marginRight: 8, ...iconTextStyle }}
                      />
                      {selectedCandidate.location}
                    </Text>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Professional Details</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Experience</Text>
                      <br />
                      <Text>{selectedCandidate.experience}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Applied Date</Text>
                      <br />
                      <Text>{selectedCandidate.appliedDate}</Text>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 12 }}>
                    <Col span={24}>
                      <Text strong>Rating</Text>
                      <br />
                      <Rate disabled value={selectedCandidate.rating} />
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Skills</Title>
                  <Space size={[8, 8]} wrap>
                    {selectedCandidate.skills.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </Space>
                </div>

                <div>
                  <Title level={5}>Summary</Title>
                  <Text>{selectedCandidate.summary}</Text>
                </div>
              </TabPane>

              <TabPane tab="Activity" key="2">
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: "Application Submitted",
                      description: "Candidate applied for the position",
                      date: selectedCandidate.appliedDate,
                      icon: <UserOutlined />,
                    },
                    {
                      title: "Resume Reviewed",
                      description: "Resume was reviewed by the hiring team",
                      date: "2024-06-11",
                      icon: <EyeOutlined />,
                    },
                    {
                      title: "Initial Screening",
                      description: "Phone screening scheduled",
                      date: "2024-06-15",
                      icon: <PhoneOutlined />,
                    },
                  ]}
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
                <Card>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong>Resume.pdf</Text>
                    <Button
                      type="text"
                      icon={<DownloadOutlined style={iconTextStyle} />}
                      onClick={() => handleDownloadResume(selectedCandidate)}
                    />
                  </div>
                  <Divider />
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <Upload>
                      <Button icon={<UploadOutlined />}>
                        Upload Additional Documents
                      </Button>
                    </Upload>
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RecruiterCandidates;

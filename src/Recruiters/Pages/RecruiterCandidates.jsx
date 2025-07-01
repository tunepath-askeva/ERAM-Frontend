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
} from "@ant-design/icons";
import { useGetPipelineCompletedCandidatesQuery } from "../../Slices/Recruiter/RecruiterApis";

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
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [addCandidateForm] = Form.useForm();

  const { data: apiData, isLoading } = useGetPipelineCompletedCandidatesQuery();

  // Transform API data to match our component's expected format
  const candidates =
    apiData?.data?.map((candidate) => ({
      id: candidate._id,
      name: candidate.user.fullName,
      email: candidate.user.email,
      position: candidate.workOrder.title,
      jobCode: candidate.workOrder.jobCode,
      status: "completed", // or map based on candidate.status
      stageProgress: candidate.stageProgress,
      updatedAt: candidate.updatedAt,
      avatar: `https://via.placeholder.com/40x40/1890ff/ffffff?text=${candidate.user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")}`,
    })) || [];

  // Custom styles
  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  const statusConfig = {
    new: { color: "blue", label: "New" },
    screening: { color: "orange", label: "Screening" },
    interview: { color: "purple", label: "Interview" },
    offer: { color: "green", label: "Offer" },
    rejected: { color: "red", label: "Rejected" },
    completed: { color: "green", label: "Completed" },
  };

  const filterCounts = {
    all: candidates.length,
    new: candidates.filter((c) => c.status === "new").length,
    screening: candidates.filter((c) => c.status === "screening").length,
    interview: candidates.filter((c) => c.status === "interview").length,
    offer: candidates.filter((c) => c.status === "offer").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
    completed: candidates.filter((c) => c.status === "completed").length,
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

  const toggleStar = (candidateId) => {
    message.success("Candidate starred status updated!");
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
                icon={<StarOutlined />}
                onClick={() => toggleStar(record.id)}
              />
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
      render: (status, record) => (
        <div>
          <Tag color={statusConfig[status].color}>
            {statusConfig[status].label}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.stageProgress?.length || 0} stages completed
          </Text>
        </div>
      ),
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

  // Helper to render documents
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

        <Dragger>
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
    </div>
  );
};

export default RecruiterCandidates;

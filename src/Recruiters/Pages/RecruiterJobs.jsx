import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tooltip,
  Drawer,
  Divider,
  Row,
  Col,
  Typography,
  Badge,
  Avatar,
  Dropdown,
  message,
  Popconfirm,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  PoweroffOutlined,
  PlusOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useGetRecruiterJobsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RecruiterJobs = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data } = useGetRecruiterJobsQuery();

  // Mock data for jobs
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $150k",
      status: "active",
      applications: 24,
      pipeline: "Standard Tech Pipeline",
      stages: [
        "Application Review",
        "Phone Screen",
        "Technical Interview",
        "Final Interview",
        "Offer",
      ],
      postedDate: "2024-06-10",
      deadline: "2024-07-10",
      description:
        "We are looking for a Senior Frontend Developer to join our dynamic team...",
      requirements: [
        "5+ years React experience",
        "TypeScript proficiency",
        "GraphQL knowledge",
      ],
      assignedBy: "John Smith",
    },
    {
      id: 2,
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $130k",
      status: "active",
      applications: 18,
      pipeline: "Product Management Pipeline",
      stages: [
        "Resume Review",
        "Product Case Study",
        "Stakeholder Interview",
        "Final Decision",
      ],
      postedDate: "2024-06-08",
      deadline: "2024-07-15",
      description:
        "Join our product team to drive innovation and user experience...",
      requirements: [
        "3+ years PM experience",
        "Data-driven mindset",
        "Agile methodologies",
      ],
      assignedBy: "Sarah Johnson",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "CloudSolutions",
      location: "New York, NY",
      type: "Contract",
      salary: "$90k - $110k",
      status: "inactive",
      applications: 12,
      pipeline: "DevOps Pipeline",
      stages: [
        "Technical Screening",
        "System Design",
        "Culture Fit",
        "Reference Check",
      ],
      postedDate: "2024-06-05",
      deadline: "2024-06-30",
      description:
        "Looking for a DevOps Engineer to optimize our cloud infrastructure...",
      requirements: [
        "AWS expertise",
        "Kubernetes experience",
        "CI/CD pipelines",
      ],
      assignedBy: "Mike Davis",
    },
  ]);

  const [availablePipelines] = useState([
    "Standard Tech Pipeline",
    "Product Management Pipeline",
    "DevOps Pipeline",
    "Sales Pipeline",
    "Marketing Pipeline",
    "Executive Pipeline",
  ]);

  const primaryColor = "#da2c46";
  const gradientButton = "linear-gradient(135deg, #da2c46 70%, #a51632 100%)";

  const getStatusColor = (status) => {
    return status === "active" ? "#52c41a" : "#ff4d4f";
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewDrawerVisible(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    form.setFieldsValue({
      pipeline: job.pipeline,
      stages: job.stages,
    });
    setEditModalVisible(true);
  };

  const handleDeactivateJob = (job) => {
    setSelectedJob(job);
    setDeactivateModalVisible(true);
  };

  const handleActivateJob = (jobId) => {
    setJobs(
      jobs.map((job) => (job.id === jobId ? { ...job, status: "active" } : job))
    );
    message.success("Job activated successfully");
  };

  const handleSaveEdit = () => {
    if (!selectedJob?.pipeline || !selectedJob?.stages?.length) {
      message.error("Please select a pipeline and add stages");
      return;
    }

    setJobs(
      jobs.map((job) =>
        job.id === selectedJob.id
          ? {
              ...job,
              pipeline: selectedJob.pipeline,
              stages: selectedJob.stages,
            }
          : job
      )
    );
    setEditModalVisible(false);
    message.success("Job updated successfully");
  };

  const handleConfirmDeactivation = () => {
    // Simulate sending confirmation to admin
    message.info(
      `Deactivation request sent to ${selectedJob.assignedBy} for approval`
    );
    setDeactivateModalVisible(false);
  };

  const columns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: primaryColor, fontSize: "16px" }}>
            {text}
          </Text>
          <br />
          <Text type="secondary">{record.company}</Text>
        </div>
      ),
    },
    {
      title: "Details",
      key: "details",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>
            <EnvironmentOutlined /> {record.location}
          </Text>
          <Text>
            <DollarOutlined /> {record.salary}
          </Text>
          <Text>
            <CalendarOutlined /> {record.type}
          </Text>
        </Space>
      ),
    },
    {
      title: "Applications",
      dataIndex: "applications",
      key: "applications",
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: primaryColor }}>
          <Avatar icon={<TeamOutlined />} />
        </Badge>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          icon={
            status === "active" ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Pipeline",
      dataIndex: "pipeline",
      key: "pipeline",
      render: (pipeline) => (
        <Text style={{ color: primaryColor }}>{pipeline}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewJob(record)}
              style={{ color: primaryColor }}
            />
          </Tooltip>
          <Tooltip title="Edit Pipeline">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditJob(record)}
              style={{ color: primaryColor }}
            />
          </Tooltip>
          {record.status === "active" ? (
            <Tooltip title="Deactivate Job">
              <Button
                type="text"
                icon={<PoweroffOutlined />}
                onClick={() => handleDeactivateJob(record)}
                style={{ color: "#ff4d4f" }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Activate Job">
              <Popconfirm
                title="Activate this job?"
                onConfirm={() => handleActivateJob(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  style={{ color: "#52c41a" }}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "24px" }}
      >
        <Col>
          <Title level={2} style={{ margin: 0, color: primaryColor }}>
            My Job Assignments
          </Title>
          <Text type="secondary">
            Manage your assigned work orders and recruitment pipelines
          </Text>
        </Col>
        <Col>
          <Space>
            <Text type="secondary">Total Jobs: {jobs.length}</Text>
            <Text type="secondary">
              Active: {jobs.filter((j) => j.status === "active").length}
            </Text>
          </Space>
        </Col>
      </Row>

      {/* Jobs Table */}
      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} jobs`,
          }}
          style={{ marginTop: "16px" }}
        />
      </Card>

      {/* Job Details Drawer */}
      <Drawer
        title={
          <div style={{ color: primaryColor }}>
            <Text strong style={{ fontSize: "18px", color: primaryColor }}>
              {selectedJob?.title}
            </Text>
            <br />
            <Text type="secondary">{selectedJob?.company}</Text>
          </div>
        }
        width={600}
        onClose={() => setViewDrawerVisible(false)}
        open={viewDrawerVisible}
        extra={
          <Space>
            <Tag color={getStatusColor(selectedJob?.status)}>
              {selectedJob?.status?.toUpperCase()}
            </Tag>
          </Space>
        }
      >
        {selectedJob && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Text type="secondary">Location</Text>
                  <br />
                  <Text strong>{selectedJob.location}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Text type="secondary">Salary</Text>
                  <br />
                  <Text strong>{selectedJob.salary}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Text type="secondary">Applications</Text>
                  <br />
                  <Text strong>{selectedJob.applications}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Text type="secondary">Deadline</Text>
                  <br />
                  <Text strong>{selectedJob.deadline}</Text>
                </Card>
              </Col>
            </Row>

            <Divider />

            <div style={{ marginBottom: "20px" }}>
              <Title level={4} style={{ color: primaryColor }}>
                Job Description
              </Title>
              <Paragraph>{selectedJob.description}</Paragraph>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Title level={4} style={{ color: primaryColor }}>
                Requirements
              </Title>
              <ul>
                {selectedJob.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Title level={4} style={{ color: primaryColor }}>
                Recruitment Pipeline
              </Title>
              <Text strong>{selectedJob.pipeline}</Text>
              <div style={{ marginTop: "12px" }}>
                {selectedJob.stages?.map((stage, index) => (
                  <Tag
                    key={index}
                    style={{ margin: "4px", padding: "4px 8px" }}
                  >
                    {index + 1}. {stage}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <Text type="secondary">Assigned by: </Text>
              <Text strong>{selectedJob.assignedBy}</Text>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Pipeline Modal */}
      <Modal
        title={
          <Text style={{ color: primaryColor, fontSize: "18px" }}>
            Edit Pipeline - {selectedJob?.title}
          </Text>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            style={{
              background: gradientButton,
              border: "none",
              color: "white",
            }}
            onClick={() => form.submit()}
          >
            Save Changes
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: "20px 0" }}>
          <div style={{ marginBottom: "20px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Select Pipeline
            </Text>
            <Select
              placeholder="Choose a pipeline"
              style={{ width: "100%" }}
              value={selectedJob?.pipeline}
              onChange={(value) => {
                setSelectedJob((prev) => ({ ...prev, pipeline: value }));
              }}
            >
              {availablePipelines.map((pipeline) => (
                <Option key={pipeline} value={pipeline}>
                  {pipeline}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Pipeline Stages
            </Text>
            <Select
              mode="tags"
              placeholder="Add or modify stages"
              tokenSeparators={[","]}
              style={{ width: "100%" }}
              value={selectedJob?.stages}
              onChange={(value) => {
                setSelectedJob((prev) => ({ ...prev, stages: value }));
              }}
            >
              <Option value="Application Review">Application Review</Option>
              <Option value="Phone Screen">Phone Screen</Option>
              <Option value="Technical Interview">Technical Interview</Option>
              <Option value="Final Interview">Final Interview</Option>
              <Option value="Offer">Offer</Option>
              <Option value="Reference Check">Reference Check</Option>
              <Option value="Culture Fit">Culture Fit</Option>
            </Select>
          </div>

          <div
            style={{
              background: "#f6f6f6",
              padding: "12px",
              borderRadius: "6px",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              💡 Tip: You can add custom stages by typing and pressing Enter, or
              select from existing templates
            </Text>
          </div>
        </div>
      </Modal>

      {/* Deactivation Confirmation Modal */}
      <Modal
        title={
          <div style={{ color: "#ff4d4f" }}>
            <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
            Request Job Deactivation
          </div>
        }
        open={deactivateModalVisible}
        onCancel={() => setDeactivateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeactivateModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            onClick={handleConfirmDeactivation}
          >
            Send Request
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>
            Are you sure you want to request deactivation of{" "}
            <Text strong>"{selectedJob?.title}"</Text>?
          </Text>
          <br />
          <br />
          <Text type="secondary">
            A confirmation request will be sent to{" "}
            <Text strong>{selectedJob?.assignedBy}</Text> who assigned this job
            to you.
          </Text>

          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              padding: "12px",
              borderRadius: "6px",
              marginTop: "16px",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              ⚠️ This action will pause all recruitment activities for this
              position until approved.
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterJobs;

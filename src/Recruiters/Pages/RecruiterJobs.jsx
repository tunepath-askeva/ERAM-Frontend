import React, { useState, useMemo } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Drawer,
  Divider,
  Row,
  Col,
  Typography,
  Badge,
  Avatar,
  message,
  Popconfirm,
  Spin,
  Empty,
  Progress,
  Skeleton,
  Result
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
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useGetRecruiterJobsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const RecruiterJobs = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  const { data: apiData, isLoading, error } = useGetRecruiterJobsQuery();

  const primaryColor = "#da2c46";
  const gradientButton = "linear-gradient(135deg, #da2c46 70%, #a51632 100%)";

  // Transform API data to match component structure
  const jobs = useMemo(() => {
    if (!apiData?.jobs) return [];

    return apiData.jobs.map((job) => ({
      id: job._id,
      title: job.title,
      company: job.project?.name || "Company Name",
      location: job.officeLocation || job.workplace,
      type: job.EmploymentType,
      salary:
        job.salaryType === "annual"
          ? `$${parseInt(job.annualSalary).toLocaleString()}/year`
          : job.annualSalary,
      status: job.isActive,
      applications: job.numberOfCandidate || 0,
      pipeline: job.pipeline?.[0]?.name || "No Pipeline",
      stages: job.pipeline?.[0]?.stages?.map((stage) => stage.name) || [],
      postedDate: new Date(job.createdAt).toLocaleDateString(),
      deadline: new Date(job.deadlineDate).toLocaleDateString(),
      startDate: new Date(job.startDate).toLocaleDateString(),
      endDate: new Date(job.endDate).toLocaleDateString(),
      description: job.description,
      requirements:
        job.jobRequirements?.split("\n").filter((req) => req.trim()) || [],
      requiredSkills: job.requiredSkills || [],
      benefits: job.benefits || [],
      jobCode: job.jobCode,
      workplace: job.workplace,
      experience: job.Experience,
      education: job.Education,
      jobFunction: job.jobFunction,
      industry: job.companyIndustry,
      assignedBy: job.createdBy,
      customFields: job.customFields || [],
      pipelineData: job.pipeline || [],
    }));
  }, [apiData]);

  // Filter jobs based on search and status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchText.toLowerCase()) ||
        job.company.toLowerCase().includes(searchText.toLowerCase()) ||
        job.location.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || job.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchText, filterStatus]);

  const getStatusColor = (status) => {
    return status === "active" ? "#52c41a" : "#ff4d4f";
  };

  const getWorkplaceIcon = (workplace) => {
    switch (workplace) {
      case "remote":
        return "🏠";
      case "on-site":
        return "🏢";
      case "hybrid":
        return "🔄";
      default:
        return "📍";
    }
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
    // Here you would call your API to activate the job
    message.success("Job activation request sent");
  };

  const handleSaveEdit = () => {
    if (!selectedJob?.pipeline || !selectedJob?.stages?.length) {
      message.error("Please select a pipeline and add stages");
      return;
    }
    // Here you would call your API to update the job
    setEditModalVisible(false);
    message.success("Job updated successfully");
  };

  const handleConfirmDeactivation = () => {
    // Here you would call your API to deactivate the job
    message.info(`Deactivation request sent for approval`);
    setDeactivateModalVisible(false);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px", minHeight: "100vh" }}>
        <Result
          status="404"
          title="Failed to Load Jobs"
          subTitle={"Something went wrong while fetching jobs."}
          extra={[
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              key="retry"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Retry
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
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

      {/* Search and Filter Bar */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search jobs by title, company, or location..."
              allowClear
              size="large"
              prefix={<SearchOutlined style={{ color: primaryColor }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col>
            <Select
              placeholder="Filter by status"
              size="large"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={setFilterStatus}
              suffixIcon={<FilterOutlined style={{ color: primaryColor }} />}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Jobs List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredJobs.length === 0 ? (
          <Card style={{ borderRadius: "12px" }}>
            <Empty description="No jobs found matching your criteria" />
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card
              key={job.id}
              hoverable
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: `1px solid ${
                  job.status === "active" ? "#e6f7ff" : "#fff2f0"
                }`,
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <Row align="middle" justify="space-between">
                <Col flex="auto">
                  <Row gutter={[24, 16]}>
                    {/* Job Title and Company */}
                    <Col xs={24} sm={12} md={8}>
                      <div>
                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            color: primaryColor,
                            fontSize: "18px",
                            fontWeight: 600,
                          }}
                        >
                          {job.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {job.company}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Job Code: {job.jobCode}
                        </Text>
                      </div>
                    </Col>

                    {/* Job Details */}
                    <Col xs={24} sm={12} md={8}>
                      <Space direction="vertical" size="small">
                        <Text style={{ fontSize: "13px" }}>
                          <span style={{ marginRight: "8px" }}>
                            {getWorkplaceIcon(job.workplace)}
                          </span>
                          {job.location} • {job.workplace}
                        </Text>
                        <Text style={{ fontSize: "13px" }}>
                          <DollarOutlined
                            style={{ color: primaryColor, marginRight: "6px" }}
                          />
                          {job.salary}
                        </Text>
                        <Text style={{ fontSize: "13px" }}>
                          <CalendarOutlined
                            style={{ color: primaryColor, marginRight: "6px" }}
                          />
                          {job.type} • {job.experience} years exp
                        </Text>
                      </Space>
                    </Col>

                    {/* Pipeline and Applications */}
                    <Col xs={24} sm={12} md={8}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <Text
                            strong
                            style={{ color: primaryColor, fontSize: "13px" }}
                          >
                            {job.pipeline}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {job.stages.length} stages
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Badge
                            count={job.applications}
                            style={{ backgroundColor: primaryColor }}
                            size="small"
                          >
                            <Avatar size="small" icon={<TeamOutlined />} />
                          </Badge>
                          <Text style={{ fontSize: "12px" }}>
                            {job.applications} applications
                          </Text>
                        </div>
                      </Space>
                    </Col>
                  </Row>

                  {/* Job Meta Info */}
                  <Row style={{ marginTop: "12px" }} align="middle">
                    <Col flex="auto">
                      <Space size="small">
                        <Tag
                          color={getStatusColor(job.status)}
                          icon={
                            job.status === "active" ? (
                              <CheckCircleOutlined />
                            ) : (
                              <ClockCircleOutlined />
                            )
                          }
                          style={{ fontSize: "11px" }}
                        >
                          {job.status.toUpperCase()}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Posted: {job.postedDate}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Deadline: {job.deadline}
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Col>

                {/* Action Buttons */}
                <Col>
                  <Space>
                    <Tooltip title="View Details">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewJob(job)}
                        style={{ color: primaryColor }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit Pipeline">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditJob(job)}
                        style={{ color: primaryColor }}
                      />
                    </Tooltip>
                    {job.status === "active" ? (
                      <Tooltip title="Request Deactivation">
                        <Button
                          type="text"
                          icon={<PoweroffOutlined />}
                          onClick={() => handleDeactivateJob(job)}
                          style={{ color: "#ff4d4f" }}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Request Activation">
                        <Popconfirm
                          title="Request activation for this job?"
                          onConfirm={() => handleActivateJob(job.id)}
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
                </Col>
              </Row>
            </Card>
          ))
        )}
      </div>

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
        width={700}
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
            {/* Job Overview Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ background: "#fafafa", textAlign: "center" }}
                >
                  <Text type="secondary">Applications</Text>
                  <br />
                  <Text
                    strong
                    style={{ fontSize: "20px", color: primaryColor }}
                  >
                    {selectedJob.applications}
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ background: "#fafafa", textAlign: "center" }}
                >
                  <Text type="secondary">Experience Required</Text>
                  <br />
                  <Text
                    strong
                    style={{ fontSize: "20px", color: primaryColor }}
                  >
                    {selectedJob.experience} yrs
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ background: "#fafafa", textAlign: "center" }}
                >
                  <Text type="secondary">Education</Text>
                  <br />
                  <Text
                    strong
                    style={{ fontSize: "16px", color: primaryColor }}
                  >
                    {selectedJob.education}
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* Job Details Grid */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col span={12}>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Text type="secondary">Location & Type</Text>
                  <br />
                  <Text strong>{selectedJob.location}</Text>
                  <br />
                  <Text>
                    {selectedJob.workplace} • {selectedJob.type}
                  </Text>
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
                  <Text type="secondary">Duration</Text>
                  <br />
                  <Text strong>
                    {selectedJob.startDate} - {selectedJob.endDate}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: "#fafafa" }}>
                  <Text type="secondary">Application Deadline</Text>
                  <br />
                  <Text strong>{selectedJob.deadline}</Text>
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* Job Description */}
            <div style={{ marginBottom: "20px" }}>
              <Title level={4} style={{ color: primaryColor }}>
                Job Description
              </Title>
              <Paragraph>{selectedJob.description}</Paragraph>
            </div>

            {/* Requirements */}
            {selectedJob.requirements.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <Title level={4} style={{ color: primaryColor }}>
                  Requirements
                </Title>
                <ul>
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {selectedJob.requiredSkills.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <Title level={4} style={{ color: primaryColor }}>
                  Required Skills
                </Title>
                <Space wrap>
                  {selectedJob.requiredSkills.map((skill, index) => (
                    <Tag key={index} style={{ padding: "4px 8px" }}>
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Benefits */}
            {selectedJob.benefits.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <Title level={4} style={{ color: primaryColor }}>
                  Benefits
                </Title>
                <ul>
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pipeline Information */}
            <div style={{ marginBottom: "20px" }}>
              <Title level={4} style={{ color: primaryColor }}>
                Recruitment Pipeline
              </Title>
              <Text strong>{selectedJob.pipeline}</Text>
              <div style={{ marginTop: "12px" }}>
                {selectedJob.stages?.map((stage, index) => (
                  <Tag
                    key={index}
                    style={{
                      margin: "4px",
                      padding: "6px 12px",
                      borderRadius: "16px",
                    }}
                  >
                    {index + 1}. {stage}
                  </Tag>
                ))}
              </div>
            </div>

            {/* Job Meta Information */}
            <div
              style={{
                background: "#f6f6f6",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "20px",
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Job Function:</Text>
                  <br />
                  <Text strong>{selectedJob.jobFunction}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Industry:</Text>
                  <br />
                  <Text strong>{selectedJob.industry}</Text>
                </Col>
              </Row>
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
            onClick={handleSaveEdit}
          >
            Save Changes
          </Button>,
        ]}
        width={600}
      >
        <div style={{ padding: "20px 0" }}>
          <div style={{ marginBottom: "20px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Current Pipeline
            </Text>
            <Text>{selectedJob?.pipeline}</Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Current Stages
            </Text>
            <Space wrap>
              {selectedJob?.stages?.map((stage, index) => (
                <Tag key={index}>
                  {index + 1}. {stage}
                </Tag>
              ))}
            </Space>
          </div>

          <div
            style={{
              background: "#f6f6f6",
              padding: "12px",
              borderRadius: "6px",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              💡 Pipeline editing functionality will be implemented based on
              your backend API endpoints
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
            A confirmation request will be sent to the admin for approval.
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

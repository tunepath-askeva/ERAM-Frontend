import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Tag,
  Space,
  Avatar,
  Divider,
  Breadcrumb,
  Card,
  Descriptions,
  Tabs,
  Form,
  Input,
  Upload,
  message,
  Row,
  Col,
  Alert,
  Spin,
  Result,
  Skeleton,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BankOutlined,
  CalendarOutlined,
  BookOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  useGetJobsbyIdQuery,
  useSubmitJobApplicationMutation,
} from "../Slices/Users/UserApis"; // Add the mutation import

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState({}); // Track uploaded files for each field

  // RTK Query hooks
  const {
    data: job,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetJobsbyIdQuery(jobId, {
    skip: !jobId,
  });

  const [submitJobApplication, { isLoading: isSubmitting }] =
    useSubmitJobApplicationMutation();

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

  if (isError) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Result
          status="404"
          title="Failed to Load Job Details"
          subTitle={
            error?.data?.message ||
            "Something went wrong while fetching job details."
          }
          extra={[
            <Button
              type="primary"
              onClick={() => refetch()}
              key="retry"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Try Again
            </Button>,
            <Button key="back" onClick={() => navigate("/candidate-jobs")}>
              Back to Jobs
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Result
          status="404"
          title="Job Not Found"
          subTitle="The job you're looking for doesn't exist or has been removed."
          extra={
            <Button
              type="primary"
              onClick={() => navigate("/candidate-jobs")}
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Back to Jobs
            </Button>
          }
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "today";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const formatSalary = (salary, type) => {
    const amount = parseInt(salary);
    if (type === "annual") {
      return `$${amount.toLocaleString()} per year`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleSaveJob = () => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(job._id)) {
      newSavedJobs.delete(job._id);
      message.success("Job removed from saved jobs");
    } else {
      newSavedJobs.add(job._id);
      message.success("Job saved successfully");
    }
    setSavedJobs(newSavedJobs);
  };

  const handleShareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job opportunity: ${job?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("Job URL copied to clipboard!");
    }
  };

  const handleSubmitApplication = async (values) => {
    try {
      // Transform form values into the expected responses format
      const responses = [];

      // Process custom fields
      if (job.customFields) {
        for (const field of job.customFields) {
          const fieldId = field.id.toString();
          const fieldValue = values[fieldId];

          if (
            fieldValue !== undefined &&
            fieldValue !== null &&
            fieldValue !== ""
          ) {
            if (field.type === "file") {
              // Handle file uploads
              const files = fileList[field.id];
              if (files && files[0]?.originFileObj) {
                const base64Content = await fileToBase64(
                  files[0].originFileObj
                );
                responses.push({
                  fieldKey: fieldId,
                  value: base64Content,
                });
              }
            } else {
              // Handle regular form fields
              responses.push({
                fieldKey: fieldId,
                value: fieldValue,
              });
            }
          }
        }
      }

      const payload = {
        workOrderId: jobId,
        responses: responses,
      };

      console.log("Submitting payload:", payload); // For debugging

      // Submit the application
      await submitJobApplication(payload).unwrap();

      message.success("Application submitted successfully!");
      form.resetFields();
      setFileList({});
    } catch (error) {
      console.error("Submission error:", error);
      message.error(error?.data?.message || "Submission failed");
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data URL prefix
      reader.onerror = (error) => reject(error);
    });

  const handleGoBack = () => {
    navigate("/candidate-jobs");
  };

  const handleFileChange = (fieldId, info) => {
    setFileList((prev) => ({
      ...prev,
      [fieldId]: info.fileList,
    }));
  };

  const renderCustomField = (field) => {
    const commonProps = {
      key: field.id,
      name: field.id.toString(),
      label: field.label,
      rules: field.required
        ? [{ required: true, message: `${field.label} is required` }]
        : [],
    };

    switch (field.type) {
      case "text":
        return (
          <Form.Item {...commonProps}>
            <Input
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              prefix={<UserOutlined />}
            />
          </Form.Item>
        );

      case "email":
        return (
          <Form.Item
            {...commonProps}
            rules={[
              ...commonProps.rules,
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              prefix={<MailOutlined />}
            />
          </Form.Item>
        );

      case "file":
        return (
          <Form.Item
            name={field.id}
            label={field.label}
            rules={
              field.required
                ? [{ required: true, message: `${field.label} is required` }]
                : []
            }
            // Remove valuePropName and getValueFromEvent for file fields
          >
            <Upload
              beforeUpload={(file) => {
                const isValidType = [
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ].includes(file.type);

                if (!isValidType) {
                  message.error("Only images, PDFs, or Word docs allowed!");
                  return Upload.LIST_OFF;
                }
                return false; // Prevent auto upload
              }}
              maxCount={1}
              fileList={fileList[field.id] || []}
              onChange={(info) => handleFileChange(field.id, info)}
            >
              <Button icon={<UploadOutlined />}>Upload {field.label}</Button>
            </Upload>
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item {...commonProps}>
            <TextArea
              rows={4}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
            />
          </Form.Item>
        );

      default:
        return (
          <Form.Item {...commonProps}>
            <Input placeholder={`Enter your ${field.label.toLowerCase()}`} />
          </Form.Item>
        );
    }
  };

  const JobOverview = () => (
    <div>
      {/* Job Header */}
      <div style={{ display: "flex", marginBottom: "24px" }}>
        <Avatar
          size={80}
          style={{
            backgroundColor: "#f0f0f0",
            marginRight: "24px",
            flexShrink: 0,
          }}
          icon={<BankOutlined />}
        />
        <div style={{ flex: 1 }}>
          <Title level={2} style={{ margin: 0 }}>
            {job.title}
          </Title>
          <Text
            style={{
              fontSize: "18px",
              color: "#666",
              display: "block",
              margin: "8px 0 16px",
            }}
          >
            {job.companyIndustry}
          </Text>

          {job.jobCode && (
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: "16px" }}
            >
              Job Code: {job.jobCode}
            </Text>
          )}

          <Space wrap size="middle">
            <Tag
              icon={<EnvironmentOutlined />}
              color="blue"
              style={{ fontSize: "14px", padding: "6px 12px" }}
            >
              {job.officeLocation}
            </Tag>
            <Tag
              icon={
                job.workplace === "remote" ? <HomeOutlined /> : <BankOutlined />
              }
              color="green"
              style={{ fontSize: "14px", padding: "6px 12px" }}
            >
              {job.workplace}
            </Tag>
            <Tag
              color="orange"
              style={{ fontSize: "14px", padding: "6px 12px" }}
            >
              {job.EmploymentType}
            </Tag>
            <Tag
              color="purple"
              style={{ fontSize: "14px", padding: "6px 12px" }}
            >
              {job.Experience} years exp
            </Tag>
            {job.numberOfCandidate && (
              <Tag
                color="cyan"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {job.numberOfCandidate} positions
              </Tag>
            )}
          </Space>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            icon={savedJobs.has(job._id) ? <HeartFilled /> : <HeartOutlined />}
            onClick={handleSaveJob}
            style={{
              color: savedJobs.has(job._id) ? "#da2c46" : undefined,
              height: "40px",
              width: "40px",
            }}
          />
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleShareJob}
            style={{ height: "40px", width: "40px" }}
          />
        </div>
      </div>

      {/* Salary and Key Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "16px",
          background: "#f8f9fa",
          borderRadius: "8px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {job.annualSalary && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <DollarOutlined
              style={{
                color: "#da2c46",
                fontSize: "20px",
                marginRight: "12px",
              }}
            />
            <div>
              <Text strong style={{ display: "block", color: "#666" }}>
                Salary
              </Text>
              <Text strong style={{ color: "#da2c46", fontSize: "16px" }}>
                {formatSalary(job.annualSalary, job.salaryType)}
              </Text>
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined
            style={{
              color: "#666",
              fontSize: "20px",
              marginRight: "12px",
            }}
          />
          <div>
            <Text strong style={{ display: "block", color: "#666" }}>
              Posted
            </Text>
            <Text style={{ color: "#333", fontSize: "16px" }}>
              {formatDate(job.createdAt)}
            </Text>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <BookOutlined
            style={{
              color: "#666",
              fontSize: "20px",
              marginRight: "12px",
            }}
          />
          <div>
            <Text strong style={{ display: "block", color: "#666" }}>
              Function
            </Text>
            <Text style={{ color: "#333", fontSize: "16px" }}>
              {job.jobFunction}
            </Text>
          </div>
        </div>

        {job.deadlineDate && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{
                color: "#ff4d4f",
                fontSize: "20px",
                marginRight: "12px",
              }}
            />
            <div>
              <Text strong style={{ display: "block", color: "#666" }}>
                Deadline
              </Text>
              <Text style={{ color: "#ff4d4f", fontSize: "16px" }}>
                {new Date(job.deadlineDate).toLocaleDateString()}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={4} style={{ marginBottom: "16px" }}>
          Job Description
        </Title>
        <Paragraph
          style={{
            fontSize: "16px",
            lineHeight: "1.7",
            color: "#444",
          }}
        >
          {job.description}
        </Paragraph>
      </div>

      {/* Requirements */}
      {job.jobRequirements && (
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>
            Requirements
          </Title>
          <div
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "#444",
              whiteSpace: "pre-line",
            }}
          >
            {job.jobRequirements.split("\n\n").map((requirement, index) => (
              <div
                key={index}
                style={{ marginBottom: "12px", display: "flex" }}
              >
                <CheckCircleOutlined
                  style={{
                    color: "#52c41a",
                    marginRight: "8px",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
                <span>{requirement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>
            Required Skills
          </Title>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {job.requiredSkills.map((skill, index) => (
              <Tag
                key={index}
                style={{
                  fontSize: "14px",
                  padding: "6px 12px",
                  border: "1px solid #da2c46",
                  color: "#da2c46",
                  background: "#fff",
                  borderRadius: "20px",
                }}
              >
                {skill}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={4} style={{ marginBottom: "16px" }}>
          Additional Information
        </Title>
        <Descriptions column={2} bordered>
          {job.Education && (
            <Descriptions.Item label="Education">
              {job.Education}
            </Descriptions.Item>
          )}
          {job.startDate && (
            <Descriptions.Item label="Start Date">
              {new Date(job.startDate).toLocaleDateString()}
            </Descriptions.Item>
          )}
          {job.endDate && (
            <Descriptions.Item label="End Date">
              {new Date(job.endDate).toLocaleDateString()}
            </Descriptions.Item>
          )}
          {job.benefits && job.benefits.length > 0 && (
            <Descriptions.Item label="Responsibilities" span={2}>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {job.benefits.map((benefit, index) => (
                  <li key={index} style={{ marginBottom: "8px" }}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
    </div>
  );

  const ApplicationForm = () => (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitApplication}
        style={{ maxWidth: "600px" }}
      >
        {job.customFields &&
          job.customFields.map((field) => renderCustomField(field))}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            size="large"
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              border: "none",
              padding: "0 48px",
              height: "48px",
              fontWeight: 600,
              fontSize: "16px",
              width: "100%",
            }}
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: "24px" }}>
        <Breadcrumb.Item>
          <a href="/candidate-jobs">Jobs</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{job.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        style={{
          marginBottom: "16px",
        }}
        onClick={handleGoBack}
      >
        Back to Jobs
      </Button>

      {/* Main Job Card with Tabs */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Tabs defaultActiveKey="overview" size="large">
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Job Overview
              </span>
            }
            key="overview"
          >
            <JobOverview />
          </TabPane>
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Apply Now
              </span>
            }
            key="application"
          >
            <ApplicationForm />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default JobDetailsPage;

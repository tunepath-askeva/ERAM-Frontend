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
  Progress,
  Steps,
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
  SendOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useGetJobsbyIdQuery,
  useSubmitJobApplicationMutation,
} from "../Slices/Users/UserApis";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [reviewData, setReviewData] = useState(null);

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

  React.useEffect(() => {
    const values = form.getFieldsValue();
    const totalFields = job?.customFields?.length || 1;
    const filledFields = Object.values(values).filter(
      (value) => value !== undefined && value !== null && value !== ""
    ).length;
    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [form, job]);

  if (isLoading) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-container">
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
              className="primary-button"
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
      <div className="error-container">
        <Result
          status="404"
          title="Job Not Found"
          subTitle="The job you're looking for doesn't exist or has been removed."
          extra={
            <Button
              type="primary"
              onClick={() => navigate("/candidate-jobs")}
              className="primary-button"
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
      if (currentStep === 0) {
        setReviewData(values);
        setCurrentStep(1);
        return;
      }

      const formData = new FormData();
      formData.append("workOrderId", jobId);

      const responses = [];

      for (const field of job.customFields) {
        const fieldId = field.id.toString();
        const fieldValue = reviewData[fieldId];

        if (field.type === "file") {
          const files = fileList[field.id];
          if (files && files[0]?.originFileObj) {
            formData.append("files", files[0].originFileObj);
            responses.push({
              fieldKey: fieldId,
              value: files[0].name,
            });
          }
        } else if (
          fieldValue !== undefined &&
          fieldValue !== null &&
          fieldValue !== ""
        ) {
          responses.push({
            fieldKey: fieldId,
            value: fieldValue,
          });
        }
      }

      formData.append("responses", JSON.stringify(responses));

      await submitJobApplication(formData).unwrap();
      message.success("Application submitted successfully!");
      form.resetFields();
      setFileList({});
      setCurrentStep(2);
    } catch (error) {
      console.error("Submission error:", error);
      message.error(error?.data?.message || "Submission failed");
    }
  };

  const handleGoBack = () => {
    navigate("/candidate-jobs");
  };

  const handleFileChange = (fieldId, info) => {
    setFileList((prev) => ({
      ...prev,
      [fieldId]: info.fileList,
    }));
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case "email":
        return <MailOutlined />;
      case "file":
        return <UploadOutlined />;
      case "phone":
        return <PhoneOutlined />;
      case "url":
        return <LinkOutlined />;
      case "textarea":
        return <FileTextOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const renderCustomField = (field) => {
    const commonProps = {
      key: field.id,
      name: field.id.toString(),
      label: (
        <span className="form-label">
          {getFieldIcon(field.type)}
          <span style={{ marginLeft: 8 }}>{field.label}</span>
          {field.required && <span style={{ color: "#ff4d4f" }}> *</span>}
        </span>
      ),
      rules: field.required
        ? [{ required: true, message: `${field.label} is required` }]
        : [],
    };

    switch (field.type) {
      case "text":
        return (
          <Form.Item {...commonProps}>
            <Input
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className="modern-input"
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
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className="modern-input"
            />
          </Form.Item>
        );

      case "phone":
        return (
          <Form.Item {...commonProps}>
            <Input
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className="modern-input"
            />
          </Form.Item>
        );

      case "file":
        return (
          <Form.Item
            name={field.id}
            label={commonProps.label}
            rules={commonProps.rules}
          >
            <Upload.Dragger
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
                return false;
              }}
              maxCount={1}
              fileList={fileList[field.id] || []}
              onChange={(info) => handleFileChange(field.id, info)}
              className="upload-dragger"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ color: "#da2c46" }} />
              </p>
              <p className="ant-upload-text">
                Click or drag file to upload {field.label}
              </p>
              <p className="ant-upload-hint">
                Support for PDF, DOC, DOCX, JPG, PNG files
              </p>
            </Upload.Dragger>
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item {...commonProps}>
            <TextArea
              rows={4}
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className="modern-textarea"
            />
          </Form.Item>
        );

      default:
        return (
          <Form.Item {...commonProps}>
            <Input
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className="modern-input"
            />
          </Form.Item>
        );
    }
  };

  const JobOverview = () => (
    <div className="job-overview">
      {/* Job Header */}
      <div className="job-header">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={4} md={3}>
            <Avatar
              size={{ xs: 60, sm: 70, md: 80 }}
              className="company-avatar"
              icon={<BankOutlined />}
            />
          </Col>
          <Col xs={24} sm={14} md={17}>
            <div className="job-title-section">
              <Title level={2} className="job-title">
                {job.title}
              </Title>
              <Text className="company-name">{job.companyIndustry}</Text>
              {job.jobCode && (
                <Text type="secondary" className="job-code">
                  Job Code: {job.jobCode}
                </Text>
              )}
              <div className="job-tags">
                <Tag
                  icon={<EnvironmentOutlined />}
                  color="blue"
                  className="job-tag"
                >
                  {job.officeLocation}
                </Tag>
                <Tag
                  icon={
                    job.workplace === "remote" ? (
                      <HomeOutlined />
                    ) : (
                      <BankOutlined />
                    )
                  }
                  color="green"
                  className="job-tag"
                >
                  {job.workplace}
                </Tag>
                <Tag color="orange" className="job-tag">
                  {job.EmploymentType}
                </Tag>
                <Tag color="purple" className="job-tag">
                  {job.Experience} years exp
                </Tag>
                {job.numberOfCandidate && (
                  <Tag color="cyan" className="job-tag">
                    {job.numberOfCandidate} positions
                  </Tag>
                )}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <div className="action-buttons">
              <Button
                icon={
                  savedJobs.has(job._id) ? <HeartFilled /> : <HeartOutlined />
                }
                onClick={handleSaveJob}
                className={`action-btn ${
                  savedJobs.has(job._id) ? "saved" : ""
                }`}
                size="large"
              />
              <Button
                icon={<ShareAltOutlined />}
                onClick={handleShareJob}
                className="action-btn"
                size="large"
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Key Information Cards */}
      <Row gutter={[16, 16]} className="key-info-section">
        {job.annualSalary && (
          <Col xs={12} sm={12} md={6}>
            <Card className="info-card salary-card">
              <DollarOutlined className="info-icon" />
              <div className="info-content">
                <Text className="info-label">Salary</Text>
                <Text className="info-value">
                  {formatSalary(job.annualSalary, job.salaryType)}
                </Text>
              </div>
            </Card>
          </Col>
        )}

        <Col xs={12} sm={12} md={6}>
          <Card className="info-card">
            <CalendarOutlined className="info-icon" />
            <div className="info-content">
              <Text className="info-label">Posted</Text>
              <Text className="info-value">{formatDate(job.createdAt)}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6}>
          <Card className="info-card">
            <BookOutlined className="info-icon" />
            <div className="info-content">
              <Text className="info-label">Function</Text>
              <Text className="info-value">{job.jobFunction}</Text>
            </div>
          </Card>
        </Col>

        {job.deadlineDate && (
          <Col xs={12} sm={12} md={6}>
            <Card className="info-card deadline-card">
              <ClockCircleOutlined className="info-icon" />
              <div className="info-content">
                <Text className="info-label">Deadline</Text>
                <Text className="info-value">
                  {new Date(job.deadlineDate).toLocaleDateString()}
                </Text>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Job Description */}
      <Card className="content-card">
        <Title level={4} className="section-title">
          Job Description
        </Title>
        <Paragraph className="job-description">{job.description}</Paragraph>
      </Card>

      {/* Requirements */}
      {job.jobRequirements && (
        <Card className="content-card">
          <Title level={4} className="section-title">
            Requirements
          </Title>
          <div className="requirements-list">
            {job.jobRequirements.split("\n\n").map((requirement, index) => (
              <div key={index} className="requirement-item">
                <CheckCircleOutlined className="check-icon" />
                <span>{requirement}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <Card className="content-card">
          <Title level={4} className="section-title">
            Required Skills
          </Title>
          <div className="skills-container">
            {job.requiredSkills.map((skill, index) => (
              <Tag key={index} className="skill-tag">
                {skill}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <Card className="content-card">
        <Title level={4} className="section-title">
          Additional Information
        </Title>
        <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered>
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
              <ul className="benefits-list">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );

  const ApplicationForm = () => (
    <div className="application-form-container">
      {/* Application Progress */}
      <Card className="progress-card">
        <div className="progress-header">
          <Title level={4}>Application Progress</Title>
          <Text type="secondary">Complete all required fields</Text>
        </div>
        <Progress
          percent={formProgress}
          strokeColor={{
            "0%": "#da2c46",
            "100%": "#a51632",
          }}
          trailColor="#f0f0f0"
          className="application-progress"
        />
      </Card>

      {/* Application Steps */}
      <Card className="steps-card">
        <Steps
          current={currentStep}
          className="application-steps"
          items={[
            {
              title: "Fill Details",
              description: "Complete application form",
              icon: <UserOutlined style={{ color: "#da2c46" }} />,
            },
            {
              title: "Review",
              description: "Review your information",
              icon: <SafetyCertificateOutlined style={{ color: "#da2c46" }} />,
            },
            {
              title: "Submit",
              description: "Send your application",
              icon: <SendOutlined style={{ color: "#da2c46" }} />,
            },
          ]}
        />
      </Card>

      {currentStep === 0 && (
        <Card className="form-card">
          <div className="form-header">
            <Title level={4}>Apply for {job.title}</Title>
            <Text type="secondary">
              Fill out the form below to apply for this position
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitApplication}
            className="application-form"
            onValuesChange={() => {
              setTimeout(() => {
                const values = form.getFieldsValue();
                const totalFields = job?.customFields?.length || 1;
                const filledFields = Object.values(values).filter(
                  (value) =>
                    value !== undefined && value !== null && value !== ""
                ).length;
                setFormProgress(Math.round((filledFields / totalFields) * 100));
              }, 100);
            }}
          >
            <Row gutter={[24, 0]}>
              {job.customFields &&
                job.customFields.map((field, index) => (
                  <Col
                    xs={24}
                    sm={
                      field.type === "textarea" || field.type === "file"
                        ? 24
                        : 12
                    }
                    key={field.id}
                  >
                    {renderCustomField(field)}
                  </Col>
                ))}
            </Row>

            <Divider />

            <Row justify="end">
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                size="large"
                className="submit-button"
              >
                Continue to Review
              </Button>
            </Row>
          </Form>
        </Card>
      )}

      {currentStep === 1 && (
        <ReviewStep
          job={job}
          reviewData={reviewData}
          fileList={fileList}
          onEdit={() => setCurrentStep(0)}
        />
      )}

      {currentStep === 2 && (
        <Card className="success-card">
          <Result
            status="success"
            title="Application Submitted Successfully!"
            subTitle={`Your application for ${job.title} has been submitted. We'll review your application and get back to you soon.`}
            extra={[
              <Button
                type="primary"
                key="console"
                onClick={() => navigate("/candidate-jobs")}
                style={{
                  background:
                    "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                }}
              >
                Back to Jobs
              </Button>,
            ]}
          />
        </Card>
      )}
    </div>
  );

  const ReviewStep = ({ job, reviewData, fileList, onEdit }) => {
    const getFieldValue = (field, fieldId) => {
      if (field.type === "file") {
        const files = fileList[field.id];
        return files && files[0] ? files[0].name : "No file uploaded";
      }
      return reviewData[fieldId] || "Not provided";
    };

    return (
      <Card className="review-card">
        <Title level={4} style={{ marginBottom: 24 }}>
          Review Your Application
        </Title>
        <Descriptions column={1} bordered>
          {job.customFields &&
            job.customFields.map((field) => {
              const fieldId = field.id.toString();
              return (
                <Descriptions.Item key={fieldId} label={field.label}>
                  {getFieldValue(field, fieldId)}
                </Descriptions.Item>
              );
            })}
        </Descriptions>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => onEdit()}>Edit Application</Button>
          <Button
            type="primary"
            onClick={() => handleSubmitApplication()}
            icon={<SendOutlined />}
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            }}
          >
            Submit Application
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          padding: 24px;
        }

        .error-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .job-details-container {
          padding: 12px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .job-details-container {
            padding: 24px;
          }
        }

        .primary-button {
          background: linear-gradient(
            135deg,
            #da2c46 70%,
            #a51632 100%
          ) !important;
          border: none !important;
        }

        .job-overview {
          padding: 0;
        }

        .job-header {
          margin-bottom: 24px;
        }

        .company-avatar {
          background-color: #f0f2f5 !important;
          border: 2px solid #e6f7ff;
        }

        .job-title-section {
          width: 100%;
        }

        .job-title {
          margin: 0 !important;
          font-size: 24px !important;
          color: #262626 !important;
          font-weight: 600 !important;
        }

        @media (max-width: 768px) {
          .job-title {
            font-size: 20px !important;
          }
        }

        .company-name {
          font-size: 16px !important;
          color: #666 !important;
          display: block !important;
          margin: 8px 0 16px 0 !important;
        }

        .job-code {
          display: block !important;
          margin-bottom: 16px !important;
        }

        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .job-tag {
          font-size: 13px !important;
          padding: 4px 12px !important;
          border-radius: 16px !important;
          margin: 0 !important;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 576px) {
          .action-buttons {
            justify-content: center;
          }
        }

        .action-btn {
          border-radius: 50% !important;
        }

        .action-btn.saved {
          color: #da2c46 !important;
          border-color: #da2c46 !important;
        }

        .key-info-section {
          margin: 24px 0;
        }

        .info-card {
          border-radius: 12px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid #f0f0f0 !important;
          transition: all 0.3s ease !important;
          height: 100%;
        }

        .info-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-2px);
        }

        .info-card .ant-card-body {
          padding: 16px !important;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .info-icon {
          font-size: 20px !important;
          color: #666 !important;
          flex-shrink: 0;
        }

        .salary-card .info-icon {
          color: #da2c46 !important;
        }

        .deadline-card .info-icon {
          color: #ff4d4f !important;
        }

        .info-content {
          flex: 1;
        }

        .info-label {
          display: block !important;
          color: #666 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          display: block !important;
          color: #333 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          margin-top: 4px;
        }

        .salary-card .info-value {
          color: #da2c46 !important;
        }

        .deadline-card .info-value {
          color: #ff4d4f !important;
        }

        .content-card {
          margin-bottom: 24px;
          border-radius: 12px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid #f0f0f0 !important;
        }

        .section-title {
          color: #262626 !important;
          margin-bottom: 16px !important;
          font-weight: 600 !important;
        }

        .job-description {
          font-size: 15px !important;
          line-height: 1.7 !important;
          color: #444 !important;
          margin: 0 !important;
        }

        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .requirement-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 15px;
          line-height: 1.6;
          color: #444;
        }

        .check-icon {
          color: #52c41a !important;
          margin-top: 4px;
          flex-shrink: 0;
        }

        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          font-size: 13px !important;
          padding: 6px 12px !important;
          border: 1px solid #da2c46 !important;
          color: #da2c46 !important;
          background: #fff !important;
          border-radius: 20px !important;
          margin: 0 !important;
        }

        .benefits-list {
          margin: 0;
          padding-left: 20px;
        }

        .benefits-list li {
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .application-form-container {
          padding: 0;
        }

        .progress-card,
        .steps-card,
        .form-card {
          margin-bottom: 24px;
          border-radius: 12px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid #f0f0f0 !important;
        }

        .progress-header {
          margin-bottom: 16px;
        }

        .progress-header .ant-typography {
          margin: 0 !important;
        }

        .application-progress {
          margin: 0 !important;
        }

        .application-steps {
          margin: 0 !important;
        }

        .form-header {
          margin-bottom: 24px;
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .form-header .ant-typography {
          margin: 0 !important;
        }

        .form-header .ant-typography + .ant-typography {
          margin-top: 8px !important;
        }

        .application-form {
          margin: 0;
        }

        .form-label {
          display: flex;
          align-items: center;
          font-weight: 500 !important;
          color: #333 !important;
        }

        .modern-input,
        .modern-textarea {
          border-radius: 8px !important;
          border: 1.5px solid #e0e0e0 !important;
          transition: all 0.3s ease !important;
        }

        .modern-input:hover,
        .modern-textarea:hover {
          border-color: #da2c46 !important;
        }

        .modern-input:focus,
        .modern-textarea:focus {
          border-color: #da2c46 !important;
          box-shadow: 0 0 0 2px rgba(218, 44, 70, 0.1) !important;
        }

        .upload-dragger {
          border: 2px dashed #e0e0e0 !important;
          border-radius: 12px !important;
          background: #fafafa !important;
          transition: all 0.3s ease !important;
        }

        .upload-dragger:hover {
          border-color: #da2c46 !important;
        }

        .submit-button {
          background: linear-gradient(
            135deg,
            #da2c46 70%,
            #a51632 100%
          ) !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          height: auto !important;
          padding: 12px 24px !important;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(218, 44, 70, 0.2) !important;
        }
      `}</style>

      <div className="job-details-container">
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              title: (
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleGoBack}
                >
                  Jobs
                </Button>
              ),
            },
            {
              title: job.title,
            },
          ]}
        />

        <Tabs defaultActiveKey="1" className="job-tabs">
          <TabPane tab="Job Overview" key="1">
            <JobOverview />
          </TabPane>
          <TabPane tab="Apply Now" key="2">
            <ApplicationForm />
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default JobDetailsPage;

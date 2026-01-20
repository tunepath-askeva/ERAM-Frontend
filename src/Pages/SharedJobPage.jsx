import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import {
  Card,
  Typography,
  Button,
  Tag,
  Space,
  Divider,
  Descriptions,
  Form,
  Input,
  Upload,
  Row,
  Col,
  Alert,
  Spin,
  Result,
  Skeleton,
  Steps,
  Radio,
  Select,
  Checkbox,
  message,
  Tabs,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
  MailOutlined,
  FileTextOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  LinkOutlined,
  DownOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  useGetSharedJobQuery,
  useSubmitJobApplicationMutation,
} from "../Slices/Users/UserApis";
import BranchHeader from "../Global/BranchHeader";
import BranchFooter from "../Global/BranchFooter";
import { useBranch } from "../utils/useBranch";
import SkeletonLoader from "../Global/SkeletonLoader";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const SharedJobPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { branchCode, jobCode } = useParams();
  const navigate = useNavigate();
  const { candidateInfo } = useSelector((state) => state.userAuth);
  const { currentBranch } = useBranch();
  
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewData, setReviewData] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const {
    data: jobResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSharedJobQuery(
    { branchCode, jobCode },
    { skip: !branchCode || !jobCode }
  );

  const job = jobResponse?.job;

  const [submitJobApplication, { isLoading: isSubmitting }] =
    useSubmitJobApplicationMutation();

  // Define helper functions first
  const updateFavicon = (logoUrl) => {
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((favicon) => favicon.remove());

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = logoUrl;
    document.head.appendChild(link);

    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = logoUrl;
    document.head.appendChild(appleLink);
  };

  const updateMetaTags = (branch, jobData) => {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    
    const description = jobData 
      ? `${jobData.title} at ${branch.name} - ${jobData.description?.substring(0, 150) || 'Apply now'}`
      : branch.description || `Welcome to ${branch.name}`;
    
    metaDescription.content = description;

    const ogTags = [
      { property: "og:title", content: jobData ? `${jobData.title} - ${branch.name}` : branch.name },
      { property: "og:description", content: description },
      { property: "og:image", content: branch.brand_logo || "" },
      { property: "og:url", content: window.location.href },
    ];

    ogTags.forEach((tag) => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = tag.content || "";
    });
  };

  const updateBranchMetadata = React.useCallback((branch, jobData) => {
    // Update page title with job title and branch name
    if (jobData) {
      document.title = `${jobData.title} - ${branch.name}`;
    } else {
      document.title = branch.name;
    }

    if (branch.brand_logo) {
      updateFavicon(branch.brand_logo);
    }

    updateMetaTags(branch, jobData);
  }, []);

  // Update branch metadata (title and favicon)
  useEffect(() => {
    if (currentBranch && job) {
      updateBranchMetadata(currentBranch, job);
    }
  }, [currentBranch, job, updateBranchMetadata]);

  // Check authentication on mount and when job loads
  useEffect(() => {
    if (job && !candidateInfo) {
      setShowAuthPrompt(true);
    } else if (job && candidateInfo) {
      setShowAuthPrompt(false);
    }
  }, [job, candidateInfo]);

  // Redirect after login if user was trying to apply
  useEffect(() => {
    const redirectPath = sessionStorage.getItem("redirectAfterAuth");
    if (candidateInfo && redirectPath) {
      sessionStorage.removeItem("redirectAfterAuth");
      // User is now logged in, allow them to apply
      setShowAuthPrompt(false);
    }
  }, [candidateInfo]);

  const handleLogin = () => {
    // Store current path for redirect after login
    sessionStorage.setItem("redirectAfterAuth", `/${branchCode}/${jobCode}`);
    const pathPrefix = branchCode ? `/${encodeURIComponent(branchCode)}` : "";
    navigate(`${pathPrefix}/branch-login`);
  };

  const handleRegister = () => {
    // Store current path for redirect after register
    sessionStorage.setItem("redirectAfterAuth", `/${branchCode}/${jobCode}`);
    const pathPrefix = branchCode ? `/${encodeURIComponent(branchCode)}` : "";
    navigate(`${pathPrefix}/branch-register`);
  };

  const handleSubmitApplication = async (values) => {
    // Check authentication before submitting
    if (!candidateInfo) {
      setShowAuthPrompt(true);
      enqueueSnackbar("Please login or register to apply for this job", {
        variant: "warning",
      });
      return;
    }

    try {
      if (currentStep === 0) {
        setReviewData(values);
        setCurrentStep(1);
        return;
      }

      const formData = new FormData();
      formData.append("workOrderId", job._id);

      const responses = [];

      // Handle custom fields
      for (const field of job.customFields || []) {
        const fieldId = field.id.toString();
        const fieldValue = reviewData[fieldId];
        const fieldLabel = field.label;

        if (field.type === "file" || field.type === "document") {
          const files = fileList[field.id];
          if (files && files[0]?.originFileObj) {
            formData.append("files", files[0].originFileObj);
            responses.push({
              fieldKey: fieldId,
              label: fieldLabel,
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
            label: fieldLabel,
            value: fieldValue,
          });
        }
      }

      formData.append("responses", JSON.stringify(responses));

      await submitJobApplication(formData).unwrap();

      enqueueSnackbar("Application submitted successfully!", {
        variant: "success",
      });

      form.resetFields();
      setFileList({});
      setCurrentStep(2);
    } catch (error) {
      console.error("Submission error:", error);
      enqueueSnackbar(error?.data?.message || "Submission failed", {
        variant: "error",
      });
    }
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
      case "document":
        return <UploadOutlined />;
      case "phone":
        return <PhoneOutlined />;
      case "url":
        return <LinkOutlined />;
      case "textarea":
        return <FileTextOutlined />;
      case "radio":
        return <CheckCircleOutlined />;
      case "select":
        return <DownOutlined />;
      case "checkbox":
        return <CheckSquareOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const renderCustomField = (field) => {
    if (!field.label || field.label.trim() === "") {
      return null;
    }

    const commonProps = {
      key: field.id,
      name: field.id.toString(),
      label: (
        <span>
          {getFieldIcon(field.type)}
          <span style={{ marginLeft: 8 }}>{field.label}</span>
          {field.required && <span style={{ color: "#ff4d4f" }}> *</span>}
        </span>
      ),
      rules: field.required
        ? [{ required: true, message: `${field.label} is required` }]
        : [],
    };

    if (field.type === "document" || field.type === "file") {
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
            onChange={(info) => handleFileChange(field.id, info)}
            fileList={fileList[field.id] || []}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area</p>
            <p className="ant-upload-hint">
              Support for PDF, DOC, DOCX, JPG, PNG
            </p>
          </Upload.Dragger>
        </Form.Item>
      );
    }

    switch (field.type) {
      case "text":
        return (
          <Form.Item {...commonProps}>
            <Input
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
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
            />
          </Form.Item>
        );

      case "phone":
        return (
          <Form.Item {...commonProps}>
            <Input
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
            />
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

      case "select":
        return (
          <Form.Item {...commonProps}>
            <Select
              size="large"
              placeholder={`Select ${field.label.toLowerCase()}`}
              options={
                field.options
                  ? field.options.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))
                  : []
              }
            />
          </Form.Item>
        );

      case "radio":
        return (
          <Form.Item {...commonProps}>
            <Radio.Group>
              <Space direction="vertical">
                {field.options?.map((opt) => (
                  <Radio key={opt} value={opt}>
                    {opt}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        );

      case "checkbox":
        return (
          <Form.Item {...commonProps}>
            <Checkbox.Group>
              <Space direction="vertical">
                {field.options?.map((opt) => (
                  <Checkbox key={opt} value={opt}>
                    {opt}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        );

      default:
        return (
          <Form.Item {...commonProps}>
            <Input
              size="large"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
            />
          </Form.Item>
        );
    }
  };


  const formatSalary = (salaryMin, salaryMax, salaryType = "monthly") => {
    if (!salaryMin && !salaryMax) return "Salary not disclosed";

    const formatNumber = (num) => {
      return new Intl.NumberFormat("en-US").format(num);
    };

    const prefix = "SAR ";

    if (salaryMin && salaryMax) {
      return `${prefix}${formatNumber(salaryMin)} - ${formatNumber(
        salaryMax
      )} ${salaryType}`;
    } else if (salaryMin) {
      return `${prefix}${formatNumber(salaryMin)}+ ${salaryType}`;
    } else {
      return `Up to ${prefix}${formatNumber(salaryMax)} ${salaryType}`;
    }
  };

  if (isLoading) {
    return (
      <>
        <BranchHeader currentBranch={currentBranch} />
        <div style={{ padding: "40px 20px" }}>
          <SkeletonLoader />
        </div>
        <BranchFooter currentBranch={currentBranch} />
      </>
    );
  }

  if (isError || !job) {
    return (
      <>
        <BranchHeader currentBranch={currentBranch} />
        <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
          <Result
            status="404"
            title="Job Not Found"
            subTitle={
              error?.data?.message ||
              "The job you're looking for doesn't exist or has been removed."
            }
            extra={
              <Button
                type="primary"
                onClick={() => {
                  const pathPrefix = branchCode ? `/${encodeURIComponent(branchCode)}` : "";
                  navigate(`${pathPrefix}/home`);
                }}
              >
                Back to Jobs
              </Button>
            }
          />
        </div>
        <BranchFooter currentBranch={currentBranch} />
      </>
    );
  }

  // Helper function to split text into bullet points
  const splitIntoPoints = (text) => {
    if (!text || !text.trim()) return [];
    
    let points = [];
    
    // First, check for numbered lists (1. 2. 3.)
    if (text.match(/^\d+\./m)) {
      points = text.split(/(?=^\d+\.\s)/m)
        .map(item => item.trim().replace(/^\d+\.\s*/, ""))
        .filter(item => item.trim());
    }
    // Then check for double newlines (paragraphs)
    else if (text.includes("\n\n")) {
      points = text.split(/\n\n+/)
        .map(item => item.trim())
        .filter(item => item.trim());
    }
    // Then check for single newlines
    else if (text.includes("\n")) {
      points = text.split(/\n+/)
        .map(item => item.trim())
        .filter(item => item.trim());
    }
    // Finally, split by sentence boundaries (periods followed by space and capital letter)
    else {
      // Split by period followed by space and capital letter (new sentence)
      // But avoid splitting on abbreviations like "Dr.", "Mr.", "Inc.", etc.
      // Also avoid splitting on decimal numbers like "3.5"
      const sentencePattern = /(?<=[.!?])\s+(?=[A-Z][a-z])/;
      points = text.split(sentencePattern)
        .map(item => item.trim())
        .filter(item => item.trim() && item.length > 0);
      
      // If splitting didn't create meaningful points, try splitting by periods more generally
      if (points.length <= 1) {
        // Split by period-space pattern, but be more careful
        points = text.split(/(?<=[.!?])\s+/)
          .map(item => item.trim())
          .filter(item => item.trim() && item.length > 3); // Filter out very short fragments
      }
      
      // If still no good split, keep as single point
      if (points.length === 0) {
        points = [text.trim()];
      }
    }
    
    // Clean up each point: remove leading numbers, extra spaces, ensure it ends properly
    return points
      .map(item => {
        // Remove leading numbers and dots (e.g., "1. ", "2. ")
        item = item.replace(/^\d+\.\s*/, "");
        // Remove leading dashes or bullets
        item = item.replace(/^[-•]\s*/, "");
        // Trim whitespace
        item = item.trim();
        // Ensure it ends with a period if it's a complete sentence (and doesn't already end with punctuation)
        if (item && !item.match(/[.!?]$/) && item.length > 10) {
          item = item + ".";
        }
        return item;
      })
      .filter(item => item && item.length > 0);
  };

  // Render Job Overview
  const renderJobOverview = () => (
    <div style={{ padding: "0" }}>
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <Title
          level={3}
          style={{
            margin: "0 0 12px 0",
            color: "#da2c46",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          {job.title}
        </Title>
        {job.jobCode && (
          <Tag color="blue" style={{ fontSize: "12px", padding: "4px 10px" }}>
            {job.jobCode}
          </Tag>
        )}
      </div>

      <div
        style={{
          marginBottom: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {job.EmploymentType && (
          <Tag color="blue" style={{ fontSize: "12px", padding: "6px 10px" }}>
            <strong>Work Type:</strong> {job.EmploymentType}
          </Tag>
        )}
        {job.workplace && (
          <Tag color="green" style={{ fontSize: "12px", padding: "6px 10px" }}>
            <strong>Work Place:</strong> {job.workplace}
          </Tag>
        )}
        {job.officeLocation && (
          <Tag color="orange" style={{ fontSize: "12px", padding: "6px 10px" }}>
            <EnvironmentOutlined /> {job.officeLocation}
          </Tag>
        )}
        {(job.experienceMin || job.experienceMax) && (
          <Tag style={{ fontSize: "12px", padding: "6px 10px" }}>
            <strong>Experience:</strong> {job.experienceMin && job.experienceMax
              ? `${job.experienceMin} - ${job.experienceMax} years`
              : job.experienceMin
              ? `${job.experienceMin}+ years`
              : `Up to ${job.experienceMax} years`}
          </Tag>
        )}
        {job.Education && (
          <Tag style={{ fontSize: "12px", padding: "6px 10px" }}>
            <strong>Education:</strong> {job.Education}
          </Tag>
        )}
        {job.isSalaryVisible && (job.salaryMin || job.salaryMax) && (
          <Tag color="purple" style={{ fontSize: "12px", padding: "6px 10px" }}>
            <DollarOutlined /> {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
          </Tag>
        )}
      </div>

      {job.description && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            Job Description
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {splitIntoPoints(job.description).map((point, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#444",
                }}
              >
                <CheckCircleOutlined
                  style={{
                    color: "#52c41a",
                    marginTop: "4px",
                    flexShrink: 0,
                    fontSize: "16px",
                  }}
                />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {job.jobRequirements && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            Job Requirements
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {splitIntoPoints(job.jobRequirements).map((requirement, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#444",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      color: "#52c41a",
                      marginTop: "4px",
                      flexShrink: 0,
                      fontSize: "16px",
                    }}
                  />
                  <span>{requirement}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {job.keyResponsibilities && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            Key Responsibilities
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {splitIntoPoints(job.keyResponsibilities).map((responsibility, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#444",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      color: "#52c41a",
                      marginTop: "4px",
                      flexShrink: 0,
                      fontSize: "16px",
                    }}
                  />
                  <span>{responsibility}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {job.qualification && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            Qualification
          </Title>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {splitIntoPoints(job.qualification).map((qualification, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "#444",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      color: "#52c41a",
                      marginTop: "4px",
                      flexShrink: 0,
                      fontSize: "16px",
                    }}
                  />
                  <span>{qualification}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "8px" }}>
            Required Skills
          </Title>
          <Space wrap>
            {job.requiredSkills.map((skill, index) => (
              <Tag key={index} color="blue" style={{ fontSize: "12px", padding: "4px 8px" }}>
                {skill}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {job.languagesRequired && job.languagesRequired.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "8px" }}>
            Languages Required
          </Title>
          <Space wrap>
            {job.languagesRequired.map((lang, index) => (
              <Tag key={index} color="purple" style={{ fontSize: "12px", padding: "4px 8px" }}>
                {lang}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {job.benefits && job.benefits.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            Benefits
          </Title>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#444",
            }}
          >
            {job.benefits.map((benefit, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {job.deadlineDate && (
        <div style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "8px" }}>
            Application Deadline
          </Title>
          <Tag color="red" style={{ fontSize: "12px", padding: "4px 8px" }}>
            <CalendarOutlined /> {new Date(job.deadlineDate).toLocaleDateString()}
          </Tag>
        </div>
      )}
    </div>
  );

  return (
    <>
      <BranchHeader currentBranch={currentBranch} />
      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Authentication Prompt */}
        {showAuthPrompt && !candidateInfo && (
          <Alert
            message="Authentication Required"
            description={
              <div>
                <Text>
                  You need to login or register to apply for this job position.
                </Text>
                <div style={{ marginTop: "16px" }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<LoginOutlined />}
                      onClick={handleLogin}
                      style={{
                        background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                        border: "none",
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      icon={<UserAddOutlined />}
                      onClick={handleRegister}
                      style={{
                        borderColor: "#da2c46",
                        color: "#da2c46",
                      }}
                    >
                      Register
                    </Button>
                  </Space>
                </div>
              </div>
            }
            type="warning"
            showIcon
            closable
            onClose={() => setShowAuthPrompt(false)}
            style={{ marginBottom: "24px" }}
          />
        )}

        {/* Main Card with Tabs */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Tabs
            defaultActiveKey="overview"
            size="large"
            style={{
              "& .ant-tabs-tab": {
                fontSize: "16px",
              },
            }}
            items={[
              {
                key: "overview",
                label: "Overview",
                children: renderJobOverview(),
              },
              {
                key: "apply",
                label: "Apply",
                children: (
                  <div>
                    {job.customFields && job.customFields.length > 0 ? (
                      <>
                        <Steps
                          current={currentStep}
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
                          style={{ marginBottom: "32px" }}
                        />

                        {currentStep === 0 && (
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmitApplication}
                          >
                            <Row gutter={[24, 0]}>
                              {job.customFields.map((field) => (
                                <Col
                                  xs={24}
                                  sm={
                                    field.type === "textarea" || field.type === "file" || field.type === "document"
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
                                size="large"
                                icon={<SendOutlined />}
                                style={{
                                  background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                                  border: "none",
                                }}
                                disabled={!candidateInfo}
                              >
                                Continue to Review
                              </Button>
                            </Row>
                          </Form>
                        )}

                        {currentStep === 1 && (
                          <Card>
                            <Title level={4} style={{ marginBottom: 24 }}>
                              Review Your Application
                            </Title>
                            <Descriptions column={1} bordered>
                              {job.customFields.map((field) => {
                                const fieldId = field.id.toString();
                                const fieldValue = reviewData[fieldId];
                                let displayValue = fieldValue || "Not provided";

                                if (field.type === "file" || field.type === "document") {
                                  const files = fileList[field.id];
                                  displayValue = files && files[0] ? files[0].name : "Not provided";
                                }

                                return (
                                  <Descriptions.Item key={fieldId} label={field.label}>
                                    {displayValue}
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
                              <Button onClick={() => setCurrentStep(0)}>Edit Application</Button>
                              <Button
                                type="primary"
                                onClick={() => handleSubmitApplication()}
                                icon={<SendOutlined />}
                                style={{
                                  background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                                  border: "none",
                                }}
                                loading={isSubmitting}
                                disabled={!candidateInfo}
                              >
                                Submit Application
                              </Button>
                            </div>
                          </Card>
                        )}

                        {currentStep === 2 && (
                          <Result
                            status="success"
                            title="Application Submitted Successfully!"
                            subTitle="Your application has been received. We will review it and get back to you soon."
                            extra={[
                              <Button
                                type="primary"
                                key="back"
                                onClick={() => {
                                  const pathPrefix = branchCode ? `/${encodeURIComponent(branchCode)}` : "";
                                  navigate(`${pathPrefix}/home`);
                                }}
                              >
                                View More Jobs
                              </Button>,
                            ]}
                          />
                        )}
                      </>
                    ) : (
                      <Alert
                        message="No Application Form Available"
                        description="This job posting doesn't have a custom application form configured."
                        type="info"
                        showIcon
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
      <BranchFooter currentBranch={currentBranch} />
    </>
  );
};

export default SharedJobPage;


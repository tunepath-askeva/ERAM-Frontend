import React, { useState } from "react";
import {
  Card,
  Tabs,
  Typography,
  Space,
  Tag,
  Divider,
  Button,
  Form,
  Input,
  Upload,
  Select,
  InputNumber,
  message,
} from "antd";
import {
  DollarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BankOutlined,
  BookOutlined,
  ToolOutlined,
  GlobalOutlined,
  UploadOutlined,
  SendOutlined,
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MobileJobPreview = ({ formData = {}, mandatoryFields = {} }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [applicationForm] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock job data - in real app, this would come from form values
  const jobData = {
    title: formData.title || "Senior Software Engineer",
    company: "TechCorp Solutions",
    location: formData.officeLocation || "San Francisco, CA",
    workplace: formData.workplace || "hybrid",
    employmentType: formData.EmploymentType || "full-time",
    salary: formData.annualSalary || 120000,
    experience: formData.Experience || "3-5 years",
    description:
      formData.description ||
      "We are looking for a talented Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining high-quality software solutions.",
    requirements:
      formData.jobRequirements ||
      "• Bachelor's degree in Computer Science or related field\n• 3+ years of experience in software development\n• Proficiency in React, Node.js, and Python\n• Strong problem-solving skills",
    skills: formData.requiredSkills || [
      "React",
      "Node.js",
      "Python",
      "JavaScript",
      "SQL",
    ],
    benefits:
      formData.benefits ||
      "• Competitive salary and equity\n• Health, dental, and vision insurance\n• Flexible work arrangements\n• Professional development opportunities",
    jobFunction: formData.jobFunction || "Software Development",
    industry: formData.companyIndustry || "Technology",
    education: formData.Education || "Bachelor's Degree",
  };

  const handleApplicationSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      message.success("Application submitted successfully!");
      applicationForm.resetFields();
    } catch (error) {
      message.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const OverviewTab = () => (
    <div style={{ padding: "0 4px" }}>
      {/* Job Header */}
      <div style={{ marginBottom: "20px" }}>
        <Title level={4} style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
          {jobData.title}
        </Title>
        <Text style={{ fontSize: "14px", color: "#666" }}>
          {jobData.company}
        </Text>

        <div style={{ marginTop: "12px" }}>
          <Space size={8} wrap>
            <Tag color="blue" style={{ margin: "2px", fontSize: "11px" }}>
              <EnvironmentOutlined style={{ fontSize: "10px" }} />
              {jobData.location}
            </Tag>
            <Tag color="green" style={{ margin: "2px", fontSize: "11px" }}>
              <ClockCircleOutlined style={{ fontSize: "10px" }} />
              {jobData.workplace}
            </Tag>
            <Tag color="purple" style={{ margin: "2px", fontSize: "11px" }}>
              <UserOutlined style={{ fontSize: "10px" }} />
              {jobData.employmentType}
            </Tag>
          </Space>
        </div>
      </div>

      {/* Quick Info */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#666" }}>
            <DollarOutlined /> Salary
          </Text>
          <Text style={{ fontSize: "12px", fontWeight: "500" }}>
            {formData.salary?.from && formData.salary?.to
              ? `${
                  formData.salary.currency || "$"
                }${formData.salary.from.toLocaleString()} - ${formData.salary.to.toLocaleString()}`
              : formData.salary?.from
              ? `${
                  formData.salary.currency || "$"
                }${formData.salary.from.toLocaleString()}`
              : formData.salary?.to
              ? `${
                  formData.salary.currency || "$"
                }${formData.salary.to.toLocaleString()}`
              : "Negotiable"}
            {formData.salary?.type && ` (${formData.salary.type})`}
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <Text style={{ fontSize: "12px", color: "#666" }}>
            <BookOutlined /> Experience
          </Text>
          <Text style={{ fontSize: "12px", fontWeight: "500" }}>
            {jobData.experience}
          </Text>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text style={{ fontSize: "12px", color: "#666" }}>
            <BankOutlined /> Education
          </Text>
          <Text style={{ fontSize: "12px", fontWeight: "500" }}>
            {jobData.education}
          </Text>
        </div>
      </div>

      {/* Job Description */}
      <div style={{ marginBottom: "16px" }}>
        <Text
          strong
          style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}
        >
          Job Description
        </Text>
        <Paragraph style={{ fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
          {jobData.description}
        </Paragraph>
      </div>

      {/* Requirements */}
      <div style={{ marginBottom: "16px" }}>
        <Text
          strong
          style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}
        >
          Requirements
        </Text>
        <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
          {jobData.requirements.split("\n").map((req, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              {req}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: "16px" }}>
        <Text
          strong
          style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}
        >
          <ToolOutlined /> Required Skills
        </Text>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {jobData.skills?.map((skill, index) => (
            <Tag key={index} style={{ fontSize: "11px", margin: "2px" }}>
              {skill}
            </Tag>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ marginBottom: "20px" }}>
        <Text
          strong
          style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}
        >
          Benefits
        </Text>
        <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
          {jobData.benefits.split("\n").map((benefit, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <Button
        type="primary"
        size="large"
        block
        style={{
          background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
          border: "none",
          borderRadius: "8px",
          height: "44px",
          fontSize: "14px",
          fontWeight: "500",
        }}
        onClick={() => setActiveTab("apply")}
      >
        Apply for this Position
      </Button>
    </div>
  );

  const ApplyTab = () => (
    <div style={{ padding: "0 4px" }}>
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <Text strong style={{ fontSize: "16px" }}>
          Apply for {jobData.title}
        </Text>
      </div>

      <Form
        form={applicationForm}
        layout="vertical"
        onFinish={handleApplicationSubmit}
        size="small"
      >
        {/* Personal Information */}
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        {mandatoryFields.phone !== false && (
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              {
                required: mandatoryFields.phone,
                message: "Please enter your phone number",
              },
            ]}
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>
        )}

        {/* Resume Upload */}
        {mandatoryFields.resume !== false && (
          <Form.Item
            label="Resume"
            name="resume"
            rules={[
              {
                required: mandatoryFields.resume,
                message: "Please upload your resume",
              },
            ]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />} size="small" block>
                Upload Resume
              </Button>
            </Upload>
          </Form.Item>
        )}

        {/* Cover Letter */}
        {mandatoryFields.coverLetter && (
          <Form.Item
            label="Cover Letter"
            name="coverLetter"
            rules={[
              { required: true, message: "Please upload your cover letter" },
            ]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />} size="small" block>
                Upload Cover Letter
              </Button>
            </Upload>
          </Form.Item>
        )}

        {/* Portfolio */}
        {mandatoryFields.portfolio && (
          <Form.Item
            label="Portfolio"
            name="portfolio"
            rules={[
              { required: true, message: "Please provide your portfolio link" },
            ]}
          >
            <Input placeholder="Enter portfolio URL" />
          </Form.Item>
        )}

        {/* Experience */}
        {mandatoryFields.experience !== false && (
          <Form.Item
            label="Years of Experience"
            name="experience"
            rules={[
              {
                required: mandatoryFields.experience,
                message: "Please enter your experience",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter years of experience"
              min={0}
              max={50}
            />
          </Form.Item>
        )}

        {/* Education */}
        {mandatoryFields.education !== false && (
          <Form.Item
            label="Education"
            name="education"
            rules={[
              {
                required: mandatoryFields.education,
                message: "Please enter your education",
              },
            ]}
          >
            <Input placeholder="Enter your highest education" />
          </Form.Item>
        )}

        {/* Skills */}
        {mandatoryFields.skills !== false && (
          <Form.Item
            label="Skills"
            name="skills"
            rules={[
              {
                required: mandatoryFields.skills,
                message: "Please enter your skills",
              },
            ]}
          >
            <Select
              mode="tags"
              placeholder="Enter your skills"
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}

        {/* Salary Fields */}
        {mandatoryFields.currentSalary && (
          <Form.Item
            label="Current Salary"
            name="currentSalary"
            rules={[
              { required: true, message: "Please enter your current salary" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter current salary"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        )}

        {mandatoryFields.expectedSalary && (
          <Form.Item
            label="Expected Salary"
            name="expectedSalary"
            rules={[
              { required: true, message: "Please enter your expected salary" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter expected salary"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        )}

        {/* Notice Period */}
        {mandatoryFields.noticePeriod && (
          <Form.Item
            label="Notice Period"
            name="noticePeriod"
            rules={[
              { required: true, message: "Please select your notice period" },
            ]}
          >
            <Select placeholder="Select notice period">
              <Option value="immediate">Immediate</Option>
              <Option value="1-week">1 Week</Option>
              <Option value="2-weeks">2 Weeks</Option>
              <Option value="1-month">1 Month</Option>
              <Option value="2-months">2 Months</Option>
              <Option value="3-months">3 Months</Option>
            </Select>
          </Form.Item>
        )}

        {/* Social Profiles */}
        {mandatoryFields.linkedinProfile && (
          <Form.Item
            label="LinkedIn Profile"
            name="linkedinProfile"
            rules={[
              { required: true, message: "Please enter your LinkedIn profile" },
            ]}
          >
            <Input placeholder="Enter LinkedIn profile URL" />
          </Form.Item>
        )}

        {mandatoryFields.githubProfile && (
          <Form.Item
            label="GitHub Profile"
            name="githubProfile"
            rules={[
              { required: true, message: "Please enter your GitHub profile" },
            ]}
          >
            <Input placeholder="Enter GitHub profile URL" />
          </Form.Item>
        )}

        {/* References */}
        {mandatoryFields.references && (
          <Form.Item
            label="References"
            name="references"
            rules={[{ required: true, message: "Please provide references" }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter reference details (Name, Company, Contact)"
            />
          </Form.Item>
        )}

        {/* Custom Questions */}
        {formData.customApplicationQuestions && (
          <div>
            <Text
              strong
              style={{
                fontSize: "14px",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Additional Questions
            </Text>
            {formData.customApplicationQuestions
              .split("\n")
              .filter((q) => q.trim())
              .map((question, index) => (
                <Form.Item
                  key={index}
                  label={question.trim()}
                  name={`customQuestion_${index}`}
                  rules={[
                    { required: true, message: "Please answer this question" },
                  ]}
                >
                  <TextArea rows={2} placeholder="Enter your answer" />
                </Form.Item>
              ))}
          </div>
        )}

        {/* Application Instructions */}
        {formData.applicationInstructions && (
          <div
            style={{
              background: "#f0f7ff",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
              border: "1px solid #d6e4ff",
            }}
          >
            <Text style={{ fontSize: "12px", color: "#1890ff" }}>
              <strong>Application Instructions:</strong>
            </Text>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              {formData.applicationInstructions}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Form.Item style={{ marginTop: "24px" }}>
          <Button
            type="primary"
            size="large"
            block
            loading={isSubmitting}
            onClick={() => applicationForm.submit()}
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              border: "none",
              borderRadius: "8px",
              height: "44px",
              fontSize: "14px",
              fontWeight: "500",
            }}
            icon={<SendOutlined />}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Mobile Frame */}
      <div
        style={{
          width: "320px",
          height: "640px",
          backgroundColor: "#000",
          borderRadius: "20px",
          padding: "4px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mobile Status Bar */}
          <div
            style={{
              height: "24px",
              backgroundColor: "#000",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 12px",
              fontSize: "12px",
              color: "#fff",
            }}
          >
            <span>9:41</span>
            <span>●●●</span>
          </div>

          {/* App Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#fff",
            }}
          >
            <Text strong style={{ fontSize: "16px" }}>
              Job Application
            </Text>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#fff",
            }}
          >
            <button
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                backgroundColor:
                  activeTab === "overview" ? "#da2c46" : "transparent",
                color: activeTab === "overview" ? "#fff" : "#666",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onClick={() => setActiveTab("overview")}
            >
              <EyeOutlined style={{ marginRight: "4px" }} />
              Overview
            </button>
            <button
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                backgroundColor:
                  activeTab === "apply" ? "#da2c46" : "transparent",
                color: activeTab === "apply" ? "#fff" : "#666",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onClick={() => setActiveTab("apply")}
            >
              <FormOutlined style={{ marginRight: "4px" }} />
              Apply
            </button>
          </div>

          {/* Content Area */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "16px",
              backgroundColor: "#fff",
            }}
          >
            {activeTab === "overview" ? <OverviewTab /> : <ApplyTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileJobPreview;

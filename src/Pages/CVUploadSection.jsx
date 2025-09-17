import React, { useState, useEffect } from "react";
import {
  Card,
  Upload,
  Button,
  Typography,
  Space,
  message,
  Progress,
  List,
  Steps,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const CVUploadSection = ({ 
  currentBranch, 
  onApplicationSubmit, // Callback to parent component
  submissionStatus = null, // Prop to control the current state
  onResetApplication // Callback to reset the application state
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Determine current step based on submission status
  const currentStep = submissionStatus?.isSubmitted ? 1 : 0;

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.doc,.docx",
    beforeUpload: (file) => {
      const isValidType =
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isValidType) {
        message.error("You can only upload PDF, DOC, or DOCX files!");
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("File must be smaller than 5MB!");
        return false;
      }

      setUploading(true);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadedFiles([
            {
              uid: file.uid,
              name: file.name,
              size: file.size,
              type: file.type,
              status: "done",
            },
          ]);
          message.success(`${file.name} uploaded successfully.`);
        }
      }, 200);

      return false; // Prevent automatic upload
    },
    onRemove: (file) => {
      setUploadedFiles(uploadedFiles.filter((item) => item.uid !== file.uid));
    },
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      message.error("Please upload your CV first!");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        files: uploadedFiles,
        branchId: currentBranch?._id,
        branchName: currentBranch?.name,
        submittedAt: new Date().toISOString(),
      };

      // Call parent component's submit handler
      if (onApplicationSubmit) {
        await onApplicationSubmit(submissionData);
      }

      console.log("Application submitted:", submissionData);
      message.success("Application submitted successfully!");
      
      // Clear uploaded files after successful submission
      setUploadedFiles([]);
    } catch (error) {
      console.error("Submission failed:", error);
      message.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setUploadedFiles([]);
    if (onResetApplication) {
      onResetApplication();
    }
  };

  const SuccessStep = () => (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          backdropFilter: "blur(10px)",
          border: "3px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <CheckCircleOutlined style={{ fontSize: "36px", color: "white" }} />
      </div>

      <Title level={3} style={{ color: "white", marginBottom: "16px" }}>
        Application Submitted!
      </Title>

      <Paragraph
        style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "24px" }}
      >
        Thank you for your interest in joining {submissionStatus?.branchName || currentBranch?.name}. We'll
        review your application and get back to you within 5-7 business days.
      </Paragraph>

      <Space direction="vertical" size="middle">
        <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
          Reference ID: {submissionStatus?.referenceId || `CV-${Date.now().toString().slice(-6)}`}
        </Text>

        <Space>
          <Button
            type="default"
            onClick={handleReset}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Submit Another Application
          </Button>
          
          <Button
            type="default"
            onClick={() => onResetApplication && onResetApplication(false)} // Reset but keep showing form
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              borderRadius: "8px",
            }}
          >
            View Form
          </Button>
        </Space>
      </Space>
    </div>
  );

  if (currentStep === 1 && submissionStatus?.isSubmitted) {
    return <SuccessStep />;
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Title
          level={2}
          style={{
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Quick Apply
        </Title>

        <Text
          style={{
            fontSize: "16px",
            display: "block",
          }}
        >
          Submit your CV for entry-level positions
        </Text>
      </div>

      {/* Progress Steps */}
      <div style={{ marginBottom: "30px" }}>
        <Steps
          current={currentStep}
          size="small"
          items={[
            {
              title: "Upload CV",
              icon: <UploadOutlined />,
            },
            {
              title: "Complete",
              icon: <CheckCircleOutlined />,
            },
          ]}
          style={{
            "& .ant-steps-item-finish .ant-steps-item-icon": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "& .ant-steps-item-process .ant-steps-item-icon": {
              backgroundColor: "white",
              borderColor: "white",
            },
            "& .ant-steps-item-title": {
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "12px",
            },
          }}
        />
      </div>

      <Card
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <div>
          <Title
            level={4}
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#1e293b",
            }}
          >
            Upload Your Resume/CV
          </Title>

          <Dragger {...uploadProps} style={{ marginBottom: "20px" }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#da2c46", fontSize: "48px" }} />
            </p>
            <p
              style={{ fontSize: "16px", fontWeight: "500", color: "#1e293b" }}
            >
              Click or drag your CV to this area
            </p>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Support for PDF, DOC, DOCX files up to 5MB
            </p>
          </Dragger>

          {uploading && (
            <Progress
              percent={Math.floor(Math.random() * 100)}
              status="active"
              strokeColor="#da2c46"
              style={{ marginBottom: "20px" }}
            />
          )}

          {uploadedFiles.length > 0 && (
            <>
              <List
                size="small"
                dataSource={uploadedFiles}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => uploadProps.onRemove(item)}
                        style={{ color: "#dc2626" }}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{ color: "#da2c46" }} />}
                      title={item.name}
                      description={`${(item.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                  </List.Item>
                )}
                style={{ marginBottom: "20px" }}
              />

              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                block
                icon={<SendOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                  border: "none",
                  borderRadius: "8px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 4px 16px rgba(218, 44, 70, 0.3)",
                  marginBottom: "16px",
                }}
              >
                Submit Application
              </Button>
            </>
          )}

          <div style={{ textAlign: "center" }}>
            <Text
              style={{ color: "#64748b", fontSize: "13px", display: "block" }}
            >
              By uploading your CV, you agree to our privacy policy
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CVUploadSection;
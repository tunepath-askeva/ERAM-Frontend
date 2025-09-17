import React, { useState } from "react";
import { Card, Upload, Button, Typography, List, Progress } from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  FileTextOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import { useSubmitCVApplicationMutation } from "../Slices/Users/UserApis";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const CVUploadSection = ({ currentBranch }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [submitCV, { isLoading }] = useSubmitCVApplicationMutation();

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
        enqueueSnackbar("Only PDF, DOC, or DOCX files are allowed!", {
          variant: "error",
        });
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        enqueueSnackbar("File must be smaller than 5MB!", {
          variant: "error",
        });
        return false;
      }

      setUploading(true);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
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
              originFileObj: file,
            },
          ]);
          enqueueSnackbar(`${file.name} uploaded successfully.`, {
            variant: "success",
          });
        }
      }, 200);

      return false; 
    },
    onRemove: (file) => {
      setUploadedFiles(uploadedFiles.filter((item) => item.uid !== file.uid));
    },
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      enqueueSnackbar("Please upload your CV first!", { variant: "warning" });
      return;
    }

    const formData = new FormData();
    uploadedFiles.forEach((file, index) => {
      formData.append(`file_${index}`, file.originFileObj);
    });
    formData.append("branchId", currentBranch?._id);
    

    try {
      await submitCV(formData).unwrap();
      enqueueSnackbar("Application submitted successfully!", {
        variant: "success",
      });
      setUploadedFiles([]); // reset after success
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Submission failed! Please try again.",
        { variant: "error" }
      );
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Title
          level={2}
          style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "700" }}
        >
          Quick Apply
        </Title>
        <Text style={{ fontSize: "16px", display: "block" }}>
          Submit your CV for entry-level positions
        </Text>
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
        <Dragger {...uploadProps} style={{ marginBottom: "20px" }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ color: "#da2c46", fontSize: "48px" }} />
          </p>
          <p style={{ fontSize: "16px", fontWeight: "500", color: "#1e293b" }}>
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
              loading={isLoading}
              block
              icon={<SendOutlined />}
              style={{
                background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
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
      </Card>
    </div>
  );
};

export default CVUploadSection;

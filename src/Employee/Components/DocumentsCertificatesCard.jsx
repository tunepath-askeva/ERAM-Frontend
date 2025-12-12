import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Typography,
  Space,
  Tag,
  Upload,
  message,
  Modal,
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const DocumentsCertificatesCard = ({ employeeData, onCertificatesChange }) => {
  const [fileList, setFileList] = useState([]);

  const handleDownload = (fileUrl, fileName) => {
    window.open(fileUrl, "_blank");
  };

  const handleUpload = ({ file, fileList: newFileList }) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File must be smaller than 5MB!");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      message.error("Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed!");
      return;
    }

    setFileList(newFileList);

    // Pass the files to parent component
    if (onCertificatesChange) {
      onCertificatesChange(newFileList);
    }

    if (file.status === "done") {
      message.success(`${file.name} uploaded successfully`);
    }
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);

    if (onCertificatesChange) {
      onCertificatesChange(newFileList);
    }
  };

  const certificateList = employeeData?.certificates || [];

  return (
    <Card
      title={
        <span>
          <FileTextOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Documents & Certificates
        </span>
      }
      style={{ marginBottom: 24, borderRadius: "12px" }}
    >
      <div style={{ marginBottom: 16 }}>
        <Upload
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          fileList={fileList}
          beforeUpload={() => false} // Prevent auto upload
          onChange={handleUpload}
          onRemove={handleRemove}
          multiple
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            style={{ background: "#da2c46", border: "none" }}
          >
            Upload Document
          </Button>
        </Upload>
        <Text type="secondary" style={{ marginLeft: 8, fontSize: "12px" }}>
          Supports PDF, Word, Image files (Max 5MB)
        </Text>
      </div>

      {certificateList.length > 0 ? (
        <List
          dataSource={certificateList}
          renderItem={(certificate, index) => (
            <List.Item
              key={index}
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    handleDownload(certificate.fileUrl, certificate.fileName)
                  }
                >
                  View
                </Button>,
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    handleDownload(certificate.fileUrl, certificate.fileName)
                  }
                >
                  Download
                </Button>,
              
              ]}
            >
              <List.Item.Meta
                avatar={
                  <FileTextOutlined
                    style={{ fontSize: "24px", color: "#da2c46" }}
                  />
                }
                title={<Text strong>{certificate.fileName}</Text>}
                description={
                  <Space direction="vertical" size={2}>
                    <Text type="secondary">
                      Uploaded:{" "}
                      {new Date(certificate.uploadedAt).toLocaleDateString()}
                    </Text>
                    <Tag color="blue">Certificate</Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <FileTextOutlined
            style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: 16 }}
          />
          <Title level={5} type="secondary">
            No documents uploaded yet
          </Title>
          <Text type="secondary">
            Upload your certificates and documents here
          </Text>
        </div>
      )}
    </Card>
  );
};

export default DocumentsCertificatesCard;

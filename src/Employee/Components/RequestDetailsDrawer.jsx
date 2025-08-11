import React from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Typography,
  Avatar,
  Button,
  Popconfirm,
  Alert,
  Card,
  Space,
  List,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CommentOutlined,
  SolutionOutlined,
  CalendarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Paragraph, Title } = Typography;

const RequestDetailsDrawer = ({
  visible,
  onClose,
  request,

  mobileView,
}) => {
  if (!request) return null;

  const getRequestTypeIcon = (type) => {
    const typeMap = {
      "Travel Request": <CalendarOutlined />,
      "Exit Reentry": <SolutionOutlined />,
      "Vehicle Related Request": <FileTextOutlined />,
      "Payslip Request": <FileTextOutlined />,
      "General Request": <CommentOutlined />,
      "New/Other Request": <SolutionOutlined />,
    };
    return typeMap[type] || <FileTextOutlined />;
  };

  const getRequestTypeColor = (type) => {
    const colorMap = {
      "Travel Request": "blue",
      "Exit Reentry": "green",
      "Vehicle Related Request": "orange",
      "Payslip Request": "purple",
      "General Request": "cyan",
      "New/Other Request": "volcano",
    };
    return colorMap[type] || "default";
  };

  const handleDocumentDownload = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, "_blank");
    }
  };

  const renderDocuments = () => {
    if (!request.uploadedDocuments || request.uploadedDocuments.length === 0) {
      return (
        <Text type="secondary" style={{ fontStyle: "italic" }}>
          No documents attached
        </Text>
      );
    }

    return (
      <List
        size="small"
        dataSource={request.uploadedDocuments}
        renderItem={(doc) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDocumentDownload(doc)}
              >
                View
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FileTextOutlined style={{ color: "#1890ff" }} />}
              title={doc.documentName || "Document"}
              description={
                doc.uploadedAt
                  ? `Uploaded: ${dayjs(doc.uploadedAt).format(
                      "DD MMM YYYY, HH:mm"
                    )}`
                  : "Upload date not available"
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <Drawer
      title="Request Details"
      width={mobileView ? "90%" : "50%"}
      onClose={onClose}
      open={visible}
     
    >
      <Alert
        message={`Request ${request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}`}
        description={
          request.status === "approved"
            ? "Your request has been approved."
            : request.status === "rejected"
            ? "Your request has been rejected."
            : request.status === "cancelled"
            ? "Your request has been cancelled."
            : "Your request is pending approval."
        }
        type={
          request.status === "approved"
            ? "success"
            : request.status === "rejected"
            ? "error"
            : request.status === "cancelled"
            ? "warning"
            : "info"
        }
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Request Information" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Request Type">
            <Tag
              color={getRequestTypeColor(request.requestType)}
              icon={getRequestTypeIcon(request.requestType)}
            >
              {request.requestType}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {request.description}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Submitted On">
            {dayjs(request.createdAt || new Date()).format("DD MMM YYYY, HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Request ID">
            <Text code>{request._id}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Supporting Documents" style={{ marginBottom: 16 }}>
        {renderDocuments()}
      </Card>

      {(request.status === "approved" || request.status === "rejected") && (
        <Card title="Admin Response" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Action By">
              <Avatar
                icon={<UserOutlined />}
                size="small"
                style={{ marginRight: 8 }}
              />
              {request.approvedBy || request.rejectedBy || "Admin"}
            </Descriptions.Item>
            <Descriptions.Item label="Response Date">
              {request.responseDate
                ? dayjs(request.responseDate).format("DD MMM YYYY, HH:mm")
                : "N/A"}
            </Descriptions.Item>
            {request.adminComments && (
              <Descriptions.Item label="Comments">
                <Paragraph style={{ margin: 0 }}>
                  {request.adminComments}
                </Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      <Card title="Request Status" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CheckCircleOutlined
              style={{
                color: "#52c41a",
                marginRight: 8,
                fontSize: 16,
              }}
            />
            <Text>Request submitted successfully</Text>
          </div>

          {request.status === "pending" && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <ClockCircleOutlined
                style={{
                  color: "#faad14",
                  marginRight: 8,
                  fontSize: 16,
                }}
              />
              <Text>Waiting for admin approval</Text>
            </div>
          )}

          {request.status === "approved" && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <CheckCircleOutlined
                style={{
                  color: "#52c41a",
                  marginRight: 8,
                  fontSize: 16,
                }}
              />
              <Text>Request approved by admin</Text>
            </div>
          )}

          {request.status === "rejected" && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <CheckCircleOutlined
                style={{
                  color: "#ff4d4f",
                  marginRight: 8,
                  fontSize: 16,
                }}
              />
              <Text>Request rejected by admin</Text>
            </div>
          )}
        </Space>
      </Card>

      {request.status === "pending" && (
        <Card>
          <Alert
            message="Request Processing Time"
            description="Requests typically take 3-5 business days to process. You will receive email notifications for status updates."
            type="info"
            showIcon
          />
        </Card>
      )}
    </Drawer>
  );
};

export default RequestDetailsDrawer;
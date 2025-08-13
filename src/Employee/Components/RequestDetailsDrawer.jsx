import React, { useState } from "react";
import {
  Drawer,
  Descriptions,
  Tag,
  Typography,
  Avatar,
  Button,
  Alert,
  Card,
  Space,
  List,
  Divider,
  Radio,
  Row,
  Col,
  message,
  Spin,
  Badge,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CommentOutlined,
  SolutionOutlined,
  CalendarOutlined,
  DollarOutlined,
  SendOutlined,
  CheckOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Paragraph, Title } = Typography;

const RequestDetailsDrawer = ({
  visible,
  onClose,
  request,
  mobileView,
  onTicketSubmit,
}) => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleTicketSelection = (ticketId) => {
    setSelectedTicket(selectedTicket === ticketId ? null : ticketId);
  };

  const handleTicketSubmit = async () => {
    if (!selectedTicket) {
      message.warning("Please select a ticket to submit.");
      return;
    }

    setSubmitting(true);
    try {
      if (onTicketSubmit) {
        await onTicketSubmit(request._id, selectedTicket);
        message.success("Ticket submitted successfully!");
        setSelectedTicket(null);
      }
    } catch (error) {
      message.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
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

  const renderTicketSelection = () => {
    if (!request.ticketDetails || request.ticketDetails.length === 0) {
      return null;
    }

    // If request is approved and has a selected ticket, show that instead of selection UI
    if (request.status === "approved" && request.selectedTicket) {
      return (
        <Card title="Approved Ticket" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Date">
              {dayjs(request.selectedTicket.date).format("DD MMM YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <Text strong style={{ color: "#52c41a" }}>
                ₹{request.selectedTicket.ticketPrice.toLocaleString()}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <Paragraph style={{ margin: 0 }}>
                {request.selectedTicket.description}
              </Paragraph>
            </Descriptions.Item>
            {request.ticketApprovalNote && (
              <Descriptions.Item label="Approval Note" span={2}>
                <Paragraph style={{ margin: 0 }}>
                  {request.ticketApprovalNote}
                </Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      );
    }

    // If request is pending and has ticket details, show selection UI
    return (
      <Card title="Available Tickets" style={{ marginBottom: 16 }}>
        <List
          dataSource={request.ticketDetails}
          renderItem={(ticket) => (
            <List.Item
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
                marginBottom: "12px",
                padding: "16px",
                backgroundColor:
                  selectedTicket === ticket._id ? "#f6ffed" : "#fafafa",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Radio
                    checked={selectedTicket === ticket._id}
                    onChange={() => handleTicketSelection(ticket._id)}
                  />
                }
                title={
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12}>
                      <Space>
                        <CalendarOutlined style={{ color: "#1890ff" }} />
                        <Text strong>
                          {dayjs(ticket.date).format("DD MMM YYYY")}
                        </Text>
                      </Space>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Space>
                        <DollarOutlined style={{ color: "#52c41a" }} />
                        <Text strong style={{ color: "#52c41a" }}>
                          ₹{ticket.ticketPrice.toLocaleString()}
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    <Paragraph style={{ margin: 0, color: "#666" }}>
                      {ticket.description}
                    </Paragraph>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {request.status === "pending" && (
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleTicketSubmit}
            loading={submitting}
            disabled={!selectedTicket}
            block={mobileView}
            style={{
              backgroundColor: "#da2c46",
              borderColor: "#da2c46",
              marginTop: 16,
            }}
          >
            Submit Selected Ticket
          </Button>
        )}
      </Card>
    );
  };

  const renderTicketApprovalStatus = () => {
    if (!request.ticketDetails || request.ticketDetails.length === 0) {
      return null;
    }

    const statusMap = {
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Ticket Pending Approval",
      },
      approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Ticket Approved",
      },
      rejected: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Ticket Rejected",
      },
    };

    const statusInfo = statusMap[request.ticketApprovalStatus] || statusMap.pending;

    return (
      <Card title="Ticket Status" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Badge
            status={statusInfo.color}
            text={
              <Text strong style={{ color: `var(--ant-${statusInfo.color}-6)` }}>
                {statusInfo.text}
              </Text>
            }
          />
          {request.ticketApprovalNote && (
            <Paragraph style={{ margin: 0 }}>
              <Text type="secondary">{request.ticketApprovalNote}</Text>
            </Paragraph>
          )}
        </Space>
      </Card>
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
        message={`Request ${
          request.status?.charAt(0).toUpperCase() + request.status?.slice(1)
        }`}
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
            {dayjs(request.createdAt || new Date()).format(
              "DD MMM YYYY, HH:mm"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Supporting Documents" style={{ marginBottom: 16 }}>
        {renderDocuments()}
      </Card>

      {/* Render ticket details */}
      {renderTicketSelection()}

      {/* Render ticket approval status if applicable */}
      {request.ticketDetails && request.ticketDetails.length > 0 && renderTicketApprovalStatus()}

      {(request.status === "approved" || request.status === "rejected") && (
        <Card title="Admin Response" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Action By">
              <Avatar
                icon={<UserOutlined />}
                size="small"
                style={{ marginRight: 8 }}
              />
              {request.approvedBy || request.rejectedBy || "Employee Admin"}
            </Descriptions.Item>
            {request.adminComments && (
              <Descriptions.Item label="Comments">
                <Paragraph style={{ margin: 0 }}>
                  {request.adminComments}
                </Paragraph>
              </Descriptions.Item>
            )}
            {request.approvalNote && (
              <Descriptions.Item label="Approval Note">
                <Paragraph style={{ margin: 0 }}>
                  {request.approvalNote}
                </Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      <Card title="Request Status Timeline" style={{ marginBottom: 16 }}>
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
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {dayjs(request.createdAt).format("DD MMM, HH:mm")}
            </Text>
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
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {dayjs(request.updatedAt).format("DD MMM, HH:mm")}
              </Text>
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
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {dayjs(request.updatedAt).format("DD MMM, HH:mm")}
              </Text>
            </div>
          )}
        </Space>
      </Card>
    </Drawer>
  );
};

export default RequestDetailsDrawer;
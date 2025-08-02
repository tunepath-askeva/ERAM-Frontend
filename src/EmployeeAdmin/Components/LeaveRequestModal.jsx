import React from "react";
import {
  Modal,
  Card,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Space,
  Tag,
  Button,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useGetLeaveRequestByIdQuery } from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;

const LeaveRequestModal = ({ visible, onClose, leaveId, eramId  }) => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetLeaveRequestByIdQuery(leaveId, {
    skip: !leaveId || !visible, // Skip the query if no leaveId or modal is not visible
  });

  const leaveData = apiResponse?.leaves;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "processing";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const handleDocumentDownload = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
      message.success(`Opening ${doc.documentName}`);
    } else {
      message.error("Document URL not available");
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Show loading state
  if (isLoading) {
    return (
      <Modal
        title="Loading Leave Request Details"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={700}
        style={{ top: 20 }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>
            <Text>Loading leave request details...</Text>
          </div>
        </div>
      </Modal>
    );
  }

  // Show error state
  if (error) {
    return (
      <Modal
        title="Error"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={700}
        style={{ top: 20 }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Text type="danger">
            Failed to load leave request details. Please try again.
          </Text>
        </div>
      </Modal>
    );
  }

  // Don't render if no data
  if (!leaveData) {
    return null;
  }

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileTextOutlined />
          <span>Leave Request Details</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <UserOutlined />
                  {leaveData.employee?.fullName}
                </Title>
                <Space>
                  <Tag
                    color={getStatusColor(leaveData.status)}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {leaveData.status?.toUpperCase() || "PENDING"}
                  </Tag>
                  {leaveData.urgency && (
                    <Tag
                      color={getUrgencyColor(leaveData.urgency)}
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                    >
                      {leaveData.urgency} Priority
                    </Tag>
                  )}
                </Space>
              </div>
              <Divider />
            </Col>

            <Col span={12}>
              <Card
                size="small"
                title="Employee Information"
                style={{ height: "100%" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Email: </Text>
                    <Text>{leaveData.employee?.email}</Text>
                  </div>
                  <div>
                    <Text strong>Phone: </Text>
                    <Text>{leaveData.employee?.phone}</Text>
                  </div>
                  <div>
                    <Text strong>Employee ID: </Text>
                    <Text code>{eramId}</Text>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                size="small"
                title="Leave Information"
                style={{ height: "100%" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Leave Type: </Text>
                    <Tag color="blue">
                      {leaveData.leaveType?.charAt(0).toUpperCase() +
                        leaveData.leaveType?.slice(1)}
                    </Tag>
                  </div>
                  {leaveData.isHalfDay !== undefined && (
                    <div>
                      <Text strong>Half Day: </Text>
                      <Tag color={leaveData.isHalfDay ? "orange" : "default"}>
                        {leaveData.isHalfDay ? "Yes" : "No"}
                      </Tag>
                    </div>
                  )}
                  {leaveData.medicalCertificate !== undefined && (
                    <div>
                      <Text strong>Medical Certificate: </Text>
                      <Tag
                        color={
                          leaveData.medicalCertificate ? "green" : "default"
                        }
                      >
                        {leaveData.medicalCertificate
                          ? "Required"
                          : "Not Required"}
                      </Tag>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card
                size="small"
                title={
                  <>
                    <CalendarOutlined /> Duration
                  </>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Start Date: </Text>
                      <Text>{formatDate(leaveData.startDate)}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>End Date: </Text>
                      <Text>{formatDate(leaveData.endDate)}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Reason">
                <Text>{leaveData.reason || "No reason provided"}</Text>
              </Card>
            </Col>

            {leaveData.uploadedDocuments &&
              leaveData.uploadedDocuments.length > 0 && (
                <Col span={24}>
                  <Card size="small" title="Uploaded Documents">
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {leaveData.uploadedDocuments.map((doc, index) => (
                        <div
                          key={doc._id || index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px",
                            background: "#f5f5f5",
                            borderRadius: "4px",
                          }}
                        >
                          <div>
                            <Text strong>{doc.documentName}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            style={{ backgroundColor: "#da2c46" }}
                            onClick={() => handleDocumentDownload(doc)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              )}

            <Col span={24}>
              <Card size="small" title="Request Timeline">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Requested Date: </Text>
                      <Text>{formatDate(leaveData.createdAt)}</Text>
                    </div>
                  </Col>
                  {leaveData.decisionDate && (
                    <Col span={12}>
                      <div>
                        <Text strong>Decision Date: </Text>
                        <Text>{formatDate(leaveData.decisionDate)}</Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default LeaveRequestModal;

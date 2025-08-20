import React, { useState } from "react";
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
  Input,
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useGetLeaveRequestByIdQuery,
  useUpdateLeaveStatusMutation,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;
const { TextArea } = Input;

const LeaveRequestModal = ({ visible, onClose, leaveId, eramId, email }) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetLeaveRequestByIdQuery(leaveId, {
    skip: !leaveId || !visible,
  });

  const [updateLeaveStatus] = useUpdateLeaveStatusMutation();

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

  const handleActionClick = (action) => {
    setActionType(action);
    setConfirmModalVisible(true);
    setComments("");
  };

  const handleConfirmAction = async () => {
    if (!comments.trim()) {
      message.error("Please provide comments for your decision");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLeaveStatus({
        leaveId,
        status: actionType === "approve" ? "approved" : "rejected",
        comments: comments.trim(),
        email,
      }).unwrap();

      message.success(
        `Leave request ${
          actionType === "approve" ? "approved" : "rejected"
        } successfully`
      );

      setConfirmModalVisible(false);
      setComments("");
      setActionType(null);
      onClose(); // Close the main modal and refresh data
    } catch (error) {
      message.error(`Failed to ${actionType} leave request. Please try again.`);
      console.error("Error updating leave status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
    setComments("");
    setActionType(null);
  };

  const handleClose = () => {
    setConfirmModalVisible(false);
    setComments("");
    setActionType(null);
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
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileTextOutlined />
            <span>Leave Request Details</span>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={
          leaveData.status === "pending" ? (
            <div style={{ textAlign: "center" }}>
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="medium"
                  onClick={() => handleActionClick("approve")}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="medium"
                  onClick={() => handleActionClick("reject")}
                >
                  Reject
                </Button>
              </Space>
            </div>
          ) : null
        }
        width={700}
        style={{ top: 20 }}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
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
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <span
            style={{ color: actionType === "approve" ? "#52c41a" : "#ff4d4f" }}
          >
            {actionType === "approve" ? "Approve" : "Reject"} Leave Request
          </span>
        }
        open={confirmModalVisible}
        onOk={handleConfirmAction}
        onCancel={handleCancelConfirm}
        confirmLoading={isSubmitting}
        okText={actionType === "approve" ? "Approve" : "Reject"}
        okButtonProps={{
          style:
            actionType === "approve"
              ? { backgroundColor: "#52c41a", borderColor: "#52c41a" }
              : { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" },
        }}
        cancelText="Cancel"
        width={500}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text>
            Are you sure you want to{" "}
            <Text
              strong
              style={{
                color: actionType === "approve" ? "#52c41a" : "#ff4d4f",
              }}
            >
              {actionType}
            </Text>{" "}
            this leave request for{" "}
            <Text strong>{leaveData?.employee?.fullName}</Text>?
          </Text>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Comments <Text type="danger">*</Text>
          </Text>
          <TextArea
            rows={4}
            placeholder={`Please provide your comments for ${
              actionType === "approve" ? "approving" : "rejecting"
            } this leave request...`}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </>
  );
};

export default LeaveRequestModal;

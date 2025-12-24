import React from "react";
import {
  Modal,
  Spin,
  Descriptions,
  Tag,
  Timeline,
  Typography,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const AttritionHistoryDetailsModal = ({
  visible,
  onClose,
  attrition,
  isLoading,
}) => {
  if (!attrition) return null;

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return null;
    }
  };

  const getApprovalStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag color="orange">Pending</Tag>;
    }
  };

  const getStatusBanner = () => {
    if (attrition.status === "converted_to_candidate") {
      return (
        <div
          style={{
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          <Text style={{ color: "#52c41a" }}>
            <CheckCircleOutlined style={{ marginRight: "8px" }} />
            <strong>Completed:</strong> This employee was successfully converted
            back to candidate status on{" "}
            {new Date(attrition.convertedAt).toLocaleString()}
          </Text>
        </div>
      );
    }

    if (attrition.status === "cancelled") {
      return (
        <div
          style={{
            backgroundColor: "#fff7e6",
            border: "1px solid #ffd591",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          <Text style={{ color: "#faad14" }}>
            <CloseCircleOutlined style={{ marginRight: "8px" }} />
            <strong>Cancelled:</strong> This attrition process was cancelled on{" "}
            {new Date(attrition.cancelledAt).toLocaleString()}
          </Text>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HistoryOutlined style={{ color: "#da2c46" }} />
          <span style={{ color: "#da2c46" }}>Attrition History Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666" }}>Loading details...</p>
        </div>
      ) : (
        <div>
          {/* Status Banner */}
          {getStatusBanner()}

          {/* Employee Information */}
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "6px",
              marginBottom: "24px",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#da2c46" }}>
              Employee Information
            </h4>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Name">
                {attrition.employee?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {attrition.employee?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Unique Code">
                {attrition.employee?.uniqueCode || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Current Role">
                <Tag
                  color={
                    attrition.employee?.role === "candidate" ? "green" : "blue"
                  }
                >
                  {attrition.employee?.role?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Previous ERAM ID">
                {attrition.previousEramId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Current Status">
                <Tag
                  color={
                    attrition.employee?.accountStatus === "active"
                      ? "green"
                      : "red"
                  }
                >
                  {attrition.employee?.accountStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Attrition Information */}
          <Descriptions
            title="Attrition Information"
            column={1}
            bordered
            size="small"
            style={{ marginBottom: "24px" }}
          >
            <Descriptions.Item label="Attrition Type">
              <Tag color="blue">{attrition.attritionType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reason">
              {attrition.reason}
            </Descriptions.Item>
            <Descriptions.Item label="Last Working Date">
              {attrition.lastWorkingDate
                ? new Date(attrition.lastWorkingDate).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            {attrition.projectName && (
              <Descriptions.Item label="Project Name">
                {attrition.projectName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Notice Period Served">
              {attrition.noticePeriodServed || "N/A"}
            </Descriptions.Item>
            {attrition.hrRemarks && (
              <Descriptions.Item label="HR Remarks">
                {attrition.hrRemarks}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Initiated By">
              {attrition.initiatedBy?.fullName} ({attrition.initiatedBy?.email})
            </Descriptions.Item>
            <Descriptions.Item label="Initiated On">
              {new Date(attrition.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Final Status">
              {attrition.status === "converted_to_candidate" && (
                <Tag color="purple">Converted to Candidate</Tag>
              )}
              {attrition.status === "cancelled" && (
                <Tag color="orange">Cancelled</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Approval Timeline */}
          {attrition.approvers && attrition.approvers.length > 0 && (
            <>
              <Divider />
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ marginBottom: "12px", color: "#da2c46" }}>
                  Approval History
                </h4>
                <Timeline
                  items={attrition.approvers.map((approver) => ({
                    dot: getApprovalStatusIcon(approver.status),
                    children: (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {approver?.approver?.fullName || "Unknown"} (
                          {approver?.approver?.email || "N/A"}){" - "}
                          {getApprovalStatusTag(approver.status)}
                        </div>
                        {approver.status !== "pending" &&
                          approver.approvedAt && (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {approver.status === "approved"
                                ? "Approved"
                                : "Rejected"}{" "}
                              on:{" "}
                              {new Date(approver.approvedAt).toLocaleString()}
                            </div>
                          )}
                        {approver.remarks && (
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginTop: "4px",
                              backgroundColor: "#fafafa",
                              padding: "8px",
                              borderRadius: "4px",
                              borderLeft: "3px solid #1890ff",
                            }}
                          >
                            <strong>Remarks:</strong> {approver.remarks}
                          </div>
                        )}
                      </div>
                    ),
                  }))}
                />
              </div>
            </>
          )}

          {/* Completion Information */}
          <Divider />
          <div
            style={{
              backgroundColor: "#fafafa",
              padding: "16px",
              borderRadius: "6px",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#da2c46" }}>
              Completion Details
            </h4>
            <Descriptions column={2} size="small">
              {attrition.status === "converted_to_candidate" && (
                <>
                  <Descriptions.Item label="Converted On">
                    {attrition.convertedAt
                      ? new Date(attrition.convertedAt).toLocaleString()
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Converted By">
                    {attrition.convertedBy?.fullName} (
                    {attrition.convertedBy?.email})
                  </Descriptions.Item>
                </>
              )}
              {attrition.status === "cancelled" && (
                <>
                  <Descriptions.Item label="Cancelled On">
                    {attrition.cancelledAt
                      ? new Date(attrition.cancelledAt).toLocaleString()
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cancelled By">
                    {attrition.cancelledBy?.fullName} (
                    {attrition.cancelledBy?.email})
                  </Descriptions.Item>
                  {attrition.cancellationReason && (
                    <Descriptions.Item label="Cancellation Reason" span={2}>
                      <div
                        style={{
                          backgroundColor: "#fff7e6",
                          padding: "8px",
                          borderRadius: "4px",
                          borderLeft: "3px solid #faad14",
                        }}
                      >
                        {attrition.cancellationReason}
                      </div>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AttritionHistoryDetailsModal;

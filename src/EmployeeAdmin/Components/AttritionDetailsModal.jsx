import React from "react";
import {
  Modal,
  Spin,
  Descriptions,
  Tag,
  Space,
  Timeline,
  Button,
  Input,
  Form,
  Typography,
} from "antd";

const { Text: AntText } = Typography;
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useGetAttritionDetailsQuery,
  useApproveAttritionMutation,
  useRejectAttritionMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";

const { TextArea } = Input;

const AttritionDetailsModal = ({
  visible,
  employeeId,
  onClose,
  onRefresh,
  handleCancelAttrition,
  isCancelling,
  handleConvertToCandidate,
  isConverting,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const currentUser = useSelector((state) => state.userAuth.recruiterInfo);

  const { data, isLoading, error } = useGetAttritionDetailsQuery(employeeId, {
    skip: !employeeId || !visible,
  });

  const [approveAttrition, { isLoading: isApproving }] =
    useApproveAttritionMutation();
  const [rejectAttrition, { isLoading: isRejecting }] =
    useRejectAttritionMutation();

  const attrition = data?.attrition;
  const canConvert = data?.canConvert; // All approvals complete and user is initiator
  const isInitiator = data?.isInitiator; // Current user is the one who initiated

  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      const result = await approveAttrition({
        attritionId: attrition._id,
        remarks: values.remarks,
      }).unwrap();

      enqueueSnackbar(result.message || "Attrition approved successfully", {
        variant: "success",
      });

      form.resetFields();
      onRefresh();
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to approve attrition", {
        variant: "error",
      });
    }
  };

  const handleReject = async () => {
    try {
      const values = await form.validateFields();
      const result = await rejectAttrition({
        attritionId: attrition._id,
        remarks: values.remarks,
      }).unwrap();

      enqueueSnackbar(result.message || "Attrition rejected successfully", {
        variant: "success",
      });

      form.resetFields();
      onRefresh();
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to reject attrition", {
        variant: "error",
      });
    }
  };

  // Check if current user is an approver and hasn't approved yet
  const currentUserApproval = attrition?.approvers?.find(
    (app) => app.approver.email === currentUser?.email
  );

  const canApprove =
    currentUserApproval && currentUserApproval.status === "pending";

  // Check if any approvals are pending
  const hasPendingApprovals = attrition?.approvers?.some(
    (app) => app.status === "pending"
  );

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
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

  // Determine which footer buttons to show
  const getFooterButtons = () => {
    console.log("🔍 Getting footer buttons...");
    console.log("canApprove:", canApprove);
    console.log("isInitiator:", isInitiator);
    console.log("canConvert:", canConvert);
    console.log("currentUserApproval:", currentUserApproval);

    // If user can approve (is an approver with pending status)
    if (canApprove) {
      console.log("✅ Showing approve/reject buttons");
      return [
        <Button
          key="reject"
          danger
          onClick={handleReject}
          loading={isRejecting}
        >
          Reject
        </Button>,
        <Button
          key="approve"
          type="primary"
          onClick={handleApprove}
          loading={isApproving}
          style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
        >
          Approve
        </Button>,
      ];
    }

    // If user is initiator
    if (isInitiator) {
      console.log("✅ User is initiator");
      const buttons = [
        <Button
          key="cancel"
          danger
          onClick={handleCancelAttrition}
          loading={isCancelling}
        >
          Cancel Attrition
        </Button>,
      ];

      // Show convert button only if all approvals are complete
      if (canConvert) {
        console.log("✅ Adding Convert to Candidate button");
        buttons.push(
          <Button
            key="convert"
            type="primary"
            onClick={handleConvertToCandidate}
            loading={isConverting}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Convert to Candidate
          </Button>
        );
      } else {
        console.log("❌ canConvert is false, not showing convert button");
      }

      return buttons;
    }

    console.log("ℹ️ Showing only close button");
    // Default: just close button
    return [
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ];
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined style={{ color: "#da2c46" }} />
          <span style={{ color: "#da2c46" }}>Attrition Details</span>
        </Space>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      width={800}
      footer={getFooterButtons()}
    >
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666" }}>
            Loading attrition details...
          </p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "red" }}>Error loading attrition details</p>
        </div>
      )}

      {attrition && (
        <div>
          {/* Show info banner for initiator if approvals are pending */}
          {isInitiator && hasPendingApprovals && (
            <div
              style={{
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              <AntText style={{ color: "#faad14" }}>
                <ClockCircleOutlined style={{ marginRight: "8px" }} />
                <strong>Waiting for Approvals:</strong> This attrition request
                is pending approval from the selected approvers. You can cancel
                the request if needed.
              </AntText>
            </div>
          )}

          {/* Show info banner for initiator if all approved */}
          {isInitiator && canConvert && (
            <div
              style={{
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              <AntText style={{ color: "#52c41a" }}>
                <CheckCircleOutlined style={{ marginRight: "8px" }} />
                <strong>All Approvals Received:</strong> You can now convert
                this employee to a candidate or cancel the attrition process.
              </AntText>
            </div>
          )}

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
              <Descriptions.Item label="ERAM ID">
                {attrition.employee?.employmentDetails?.eramId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Previous ERAM ID">
                {attrition.previousEramId || "N/A"}
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
            <Descriptions.Item label="Status">
              {attrition.status === "exit_initiated" && (
                <Tag color="orange">Exit Initiated</Tag>
              )}
              {attrition.status === "exit_approved" && (
                <Tag color="green">Exit Approved</Tag>
              )}
              {attrition.status === "rejected" && (
                <Tag color="red">Rejected</Tag>
              )}
              {attrition.status === "converted_to_candidate" && (
                <Tag color="purple">Converted to Candidate</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* Approval Timeline */}
          {/* Approval Timeline */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ marginBottom: "12px", color: "#da2c46" }}>
              Approval Status
            </h4>
            <Timeline
              items={attrition.approvers?.map((approver, index) => ({
                dot: getApprovalStatusIcon(approver.status),
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {approver.approver?.fullName} ({approver.approver?.email})
                      {" - "}
                      {getApprovalStatusTag(approver.status)}
                    </div>
                    {approver.status !== "pending" && (
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {approver.status === "approved"
                          ? "Approved"
                          : "Rejected"}{" "}
                        on: {new Date(approver.approvedAt).toLocaleString()}
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

          {/* Approval Form (only show if current user can approve) */}
          {canApprove && (
            <div
              style={{
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
                padding: "16px",
                borderRadius: "6px",
              }}
            >
              <h4 style={{ marginBottom: "12px", color: "#da2c46" }}>
                Your Approval Required
              </h4>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="remarks"
                  label="Remarks (Optional)"
                  rules={[
                    {
                      max: 500,
                      message: "Remarks cannot exceed 500 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Add any comments or remarks for your approval/rejection"
                  />
                </Form.Item>
              </Form>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AttritionDetailsModal;

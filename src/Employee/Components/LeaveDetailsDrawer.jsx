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
} from "antd";
import {
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  HeartOutlined,
  TeamOutlined,
  GiftOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

const LeaveDetailsDrawer = ({
  visible,
  onClose,
  leave,
  onCancelLeave,
  mobileView,
}) => {
  const leaveTypes = [
    {
      value: "annual",
      label: "Annual Leave",
      color: "blue",
      icon: <CalendarOutlined />,
    },
    {
      value: "sick",
      label: "Sick Leave",
      color: "red",
      icon: <MedicineBoxOutlined />,
    },
    {
      value: "casual",
      label: "Casual Leave",
      color: "green",
      icon: <HomeOutlined />,
    },
    {
      value: "maternity",
      label: "Maternity Leave",
      color: "pink",
      icon: <HeartOutlined />,
    },
    {
      value: "paternity",
      label: "Paternity Leave",
      color: "cyan",
      icon: <TeamOutlined />,
    },
    {
      value: "compensatory",
      label: "Compensatory Off",
      color: "orange",
      icon: <GiftOutlined />,
    },
    {
      value: "emergency",
      label: "Emergency Leave",
      color: "volcano",
      icon: <WarningOutlined />,
    },
  ];

  if (!leave) return null;

  const leaveType = leaveTypes.find((t) => t.label === leave.type);

  return (
    <Drawer
      title="Leave Request Details"
      width={mobileView ? "90%" : "50%"}
      onClose={onClose}
      open={visible}
      extra={
        leave.status === "Pending" && (
          <Popconfirm
            title="Cancel this leave request?"
            onConfirm={() => onCancelLeave(leave.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Cancel Request
            </Button>
          </Popconfirm>
        )
      }
    >
      <Alert
        message={`Leave Request ${leave.status}`}
        description={
          leave.status === "Approved"
            ? "Your leave request has been approved."
            : leave.status === "Rejected"
            ? "Your leave request has been rejected."
            : "Your leave request is pending approval."
        }
        type={
          leave.status === "Approved"
            ? "success"
            : leave.status === "Rejected"
            ? "error"
            : "warning"
        }
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Request Information" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Leave Type">
            <Tag color={leaveType?.color} icon={leaveType?.icon}>
              {leave.leaveType}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {dayjs(leave.startDate).format("DD MMM YYYY")} -{" "}
            {dayjs(leave.endDate).format("DD MMM YYYY")}
            <br />
            <Text type="secondary">
              {leave.days} {leave.days === 1 ? "day" : "days"}
              {leave.isHalfDay && " (Half Day)"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Reason">
            <Paragraph style={{ margin: 0 }}>{leave.reason}</Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Applied On">
            {dayjs(leave.appliedDate).format("DD MMM YYYY, HH:mm")}
          </Descriptions.Item>
          {leave.urgency && (
            <Descriptions.Item label="Urgency">
              <Tag color={
                leave.urgency === "Critical" ? "red" :
                leave.urgency === "High" ? "orange" :
                leave.urgency === "Normal" ? "blue" : "green"
              }>
                {leave.urgency}
              </Tag>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {(leave.status === "Approved" || leave.status === "Rejected") && (
        <Card title="Approval Details" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Action By">
              <Avatar
                icon={<UserOutlined />}
                size="small"
                style={{ marginRight: 8 }}
              />
              {leave.approvedBy || "System"}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {leave.approvedDate 
                ? dayjs(leave.approvedDate).format("DD MMM YYYY, HH:mm")
                : "N/A"}
            </Descriptions.Item>
            {leave.comments && (
              <Descriptions.Item label="Comments">
                <Paragraph style={{ margin: 0 }}>{leave.comments}</Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      <Card title="Additional Information">
        <Space direction="vertical" size="middle">
          {leave.medicalCertificate && (
            <div>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              <Text>Medical certificate provided</Text>
            </div>
          )}
          {leave.isHalfDay && (
            <div>
              <ClockCircleOutlined
                style={{ color: "#faad14", marginRight: 8 }}
              />
              <Text>Half day leave</Text>
            </div>
          )}
          <div>
            <CalendarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
            <Text>Request ID: #{leave.id}</Text>
          </div>
        </Space>
      </Card>
    </Drawer>
  );
};

export default LeaveDetailsDrawer;
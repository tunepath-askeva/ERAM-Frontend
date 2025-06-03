// AdminViewModal.jsx
import React from "react";
import {
  Modal,
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Avatar,
  Divider,
  Button,
  Empty,
  Skeleton
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminViewModal = ({ open, onCancel, admin, loading }) => {
  if (loading) return <Skeleton active />;

  if (!admin) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getRoleColor = (role) => {
    return "blue";
  };

    const getRegionColor = (region) => {
    return "blue";
  };
  
  const formattedRole = admin.role ? 
    admin.role.charAt(0).toUpperCase() + admin.role.slice(1) : 
    "Admin";

  const adminName = admin.fullName || 
    `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || 
    "Unknown Admin";

    const adminPlace = admin.branch.location
    const adminRegion = adminPlace.state

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          Admin Details
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
    >
      {/* Admin Profile Header */}
      <Card style={{ marginBottom: 16, textAlign: "center" }}>
        <Space direction="vertical" size={16}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#722ed1",
              fontSize: "32px",
            }}
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {adminName}
            </Title>
            <Space wrap style={{ marginTop: 8 }}>
              <Tag
                color={getRoleColor(admin.role)}
                icon={<CheckCircleOutlined />}
                style={{ fontSize: "13px", padding: "4px 12px" }}
              >
                {formattedRole}
              </Tag>
              <Tag
  color={getStatusColor(admin.accountStatus)}
  style={{ fontSize: "13px", padding: "4px 12px" }}
>
  {admin.accountStatus?.toUpperCase() || "UNKNOWN"}
</Tag>
              <Tag
                color={getRegionColor(adminRegion)}
                style={{ fontSize: "13px", padding: "4px 12px" }}
              >
                {adminRegion.toUpperCase()}
              </Tag>
              
            </Space>
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        {/* Contact Information */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <MailOutlined />
                Contact Information
              </Space>
            }
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Email Address
                </Text>
                <br />
                <Text copyable style={{ fontSize: "14px" }}>
                  <MailOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  {admin.email || "N/A"}
                </Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Phone Number
                </Text>
                <br />
                <Text copyable style={{ fontSize: "14px" }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  {admin.phone || "N/A"}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Account Information */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                Account Information
              </Space>
            }
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Account Created
                </Text>
                <br />
                <Text style={{ fontSize: "14px" }}>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#722ed1" }}
                  />
                  {formatDate(admin.createdAt)}
                </Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Last Updated
                </Text>
                <br />
                <Text style={{ fontSize: "14px" }}>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#722ed1" }}
                  />
                  {formatDate(admin.updatedAt)}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>


      {/* Branch Assignment */}
      <Card
        title={
          <Space>
            <BankOutlined />
            Branch Assignment
          </Space>
        }
        size="small"
      >
        {admin.branch ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ fontSize: "14px" }}>
              Branch ID: {admin.branch?.branchCode}
            </Text>
            <Text strong style={{ fontSize: "14px" }}>
              Branch Name: {admin.branch?.name}
            </Text>
            
          </Space>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No branch assigned"
          />
        )}
      </Card>
    </Modal>
  );
};

export default AdminViewModal;
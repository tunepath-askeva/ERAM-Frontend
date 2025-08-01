import React from "react";
import { Row, Col, Typography, Button, Space } from "antd";
import { UserOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const EmployeeProfileHeader = ({ onRefresh, onSaveAll }) => (
  <div
    style={{
      background: "white",
      padding: "24px",
      borderRadius: "12px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <Row align="middle" justify="space-between">
      <Col>
        <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
          <UserOutlined style={{ marginRight: 12 }} />
          Employee Profile Settings
        </Title>
        <Text type="secondary">Manage your profile and security settings</Text>
      </Col>
      <Col>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ background: "#da2c46", border: "none" }}
            onClick={onSaveAll}
          >
            Save All Changes
          </Button>
        </Space>
      </Col>
    </Row>
  </div>
);

export default EmployeeProfileHeader;

import React, { useState } from "react";
import { Modal, Checkbox, Space, Button, Input } from "antd";
import {
  MailOutlined,
  WhatsAppOutlined,
  BellOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

export const NotificationModal = ({
  open,
  onClose,
  onSend,
  title = "Send Notification",
  candidateName = "candidate",
}) => {
  const [selectedMethods, setSelectedMethods] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  const handleSend = () => {
    if (selectedMethods.length === 0) {
      return; // Let parent handle validation message
    }
    if (onSend) {
      onSend(selectedMethods, customMessage);
    }
    // Reset on successful send
    setSelectedMethods([]);
    setCustomMessage("");
    onClose();
  };

  const handleCancel = () => {
    setSelectedMethods([]);
    setCustomMessage("");
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          onClick={handleSend}
          disabled={selectedMethods.length === 0}
        >
          Send Notification
        </Button>,
      ]}
    >
      <div style={{ padding: "10px 0" }}>

        <p style={{ marginBottom: "12px", fontWeight: 500 }}>
          Choose notification method(s):
        </p>
        <Checkbox.Group
          value={selectedMethods}
          onChange={setSelectedMethods}
          style={{ width: "100%" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Checkbox value="email" style={{ padding: "12px", width: "100%" }}>
              <Space>
                <MailOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
                <span>Send via Email</span>
              </Space>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                  marginLeft: "24px",
                }}
              >
                (Default email content will be sent to the candidate.)
              </div>
            </Checkbox>
            <Checkbox
              value="whatsapp"
              style={{ padding: "12px", width: "100%" }}
            >
              <Space>
                <WhatsAppOutlined
                  style={{ fontSize: "18px", color: "#25D366" }}
                />
                <span>Send via WhatsApp</span>
              </Space>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                  marginLeft: "24px",
                }}
              >
                (You can add a custom message below)
              </div>
            </Checkbox>
            <Checkbox
              value="profile"
              style={{ padding: "12px", width: "100%" }}
            >
              <Space>
                <BellOutlined style={{ fontSize: "18px", color: "#faad14" }} />
                <span>Send in Profile Notification</span>
              </Space>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                  marginLeft: "24px",
                }}
              >
                (The custom message you entered will be sent)
              </div>
            </Checkbox>
          </Space>
        </Checkbox.Group>

        {selectedMethods.includes("whatsapp") && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ marginBottom: "8px", fontWeight: 500 }}>
              Custom Message for WhatsApp:
            </p>
            <TextArea
              rows={4}
              placeholder="Enter your custom message for WhatsApp notification..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={1000}
              showCount
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

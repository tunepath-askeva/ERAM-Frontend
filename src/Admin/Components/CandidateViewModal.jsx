import React from "react";
import {
  Modal,
  Button,
  Descriptions,
  Tag,
  Divider,
  Typography,
  Spin,
  Alert,
  Grid,
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SafetyOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useGetCandidateByIdQuery } from "../../Slices/Admin/AdminApis.js";

const { Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const CandidateViewModal = ({ visible, onCancel, candidateId }) => {
  const screens = useBreakpoint();

  const { data, isLoading, isError, error } = useGetCandidateByIdQuery(
    candidateId,
    {
      skip: !candidateId || !visible,
    }
  );

  const candidate = data?.candidate;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModalWidth = () => {
    if (screens.xxl) return "70%";
    if (screens.xl) return "80%";
    if (screens.lg) return "90%";
    return "95%";
  };

  const getDescriptionColumn = () => {
    if (screens.lg) return 2;
    if (screens.md) return 1;
    return 1;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>Loading candidate details...</div>
        </div>
      );
    }

    if (isError) {
      return (
        <Alert
          message="Error"
          description={error?.message || "Failed to load candidate details"}
          type="error"
          showIcon
          style={{ margin: "20px 0" }}
        />
      );
    }

    if (!candidate) {
      return (
        <Alert
          message="No Data"
          description="Candidate details not found"
          type="info"
          showIcon
          style={{ margin: "20px 0" }}
        />
      );
    }

    return (
      <div>
        <Descriptions
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "600" }}>
                {candidate.fullName}
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Tag
                  color={candidate.accountStatus === "active" ? "green" : "red"}
                  icon={
                    candidate.accountStatus === "active" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <StopOutlined />
                    )
                  }
                  style={{ fontSize: "13px", padding: "4px 8px" }}
                >
                  {candidate.accountStatus?.toUpperCase()}
                </Tag>
                <Tag
                  color="blue"
                  icon={<SafetyOutlined />}
                  style={{ fontSize: "13px", padding: "4px 8px" }}
                >
                  {candidate.role?.toUpperCase()}
                </Tag>
              </div>
            </div>
          }
          bordered
          column={getDescriptionColumn()}
          size="middle"
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item
            label={
              <span>
                <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Full Name
              </span>
            }
          >
            <Text strong>{candidate.fullName}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <MailOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Email Address
              </span>
            }
          >
            <Text copyable>{candidate.email}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <PhoneOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Phone Number
              </span>
            }
          >
            <Text copyable>{candidate.phone}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <BankOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Current Company
              </span>
            }
          >
            <Text strong>{candidate.companyName || "Not specified"}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <BankOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Experience
              </span>
            }
          >
            <Text strong>
              {candidate.totalExperienceYears + " Years" || "Not specified"}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <TrophyOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Specialization
              </span>
            }
          >
            <Tag color="orange" style={{ fontSize: "12px" }}>
              {candidate.specialization || "Not specified"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <FileTextOutlined
                  style={{ marginRight: 8, color: "#da2c46" }}
                />
                Qualifications
              </span>
            }
          >
            <Text>{candidate.qualifications || "Not specified"}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" orientationMargin={0}>
          <CodeOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Technical Skills
        </Divider>
        <div style={{ marginBottom: 24, minHeight: "40px" }}>
          {candidate.skills && candidate.skills.length > 0 ? (
            candidate.skills.map((skill, index) => (
              <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                {skill}
              </Tag>
            ))
          ) : (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <Text type="secondary" style={{ fontStyle: "italic" }}>
                No technical skills specified yet
              </Text>
            </div>
          )}
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <FileTextOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Additional Information
        </Divider>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
          }}
        >
          {candidate.bio ? (
            <Paragraph style={{ whiteSpace: "pre-line", margin: 0 }}>
              {candidate.bio}
            </Paragraph>
          ) : (
            <Text type="secondary" style={{ fontStyle: "italic" }}>
              No additional information provided by the candidate.
            </Text>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <InfoCircleOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Candidate Profile Details
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={getModalWidth()}
      style={{ maxWidth: 1000 }}
      centered
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={onCancel}
          size="medium"
          style={{
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
          }}
        >
          Close
        </Button>,
      ]}
    >
      <div style={{ padding: screens.xs ? "8px 0" : "16px 0" }}>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default CandidateViewModal;

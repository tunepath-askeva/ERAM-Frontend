import { Card, Space, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Text } = Typography;

const EmploymentCard = ({ employee, screenSize }) => {
  const navigate = useNavigate();

  return (
    <Card
      title={
        <Space size="small">
          <FileTextOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "11px" : "16px" }}>
            Employment Details
          </Text>
        </Space>
      }
      hoverable
      onClick={() => navigate("/employee/profile-settings")}
      style={{
        cursor: "pointer",
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "8px" : "10px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%", flex: 1 }}>
        <div>
          <Text
            type="secondary"
            style={{
              fontSize: screenSize.isMobile ? "9px" : "10px",
              display: "block",
              color: "#8c8c8c",
            }}
          >
            Joining Date
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {employee?.employmentDetails?.dateOfJoining
              ? dayjs(employee.employmentDetails.dateOfJoining).format("DD MMM YYYY")
              : "N/A"}
          </Text>
        </div>
        <div>
          <Text
            type="secondary"
            style={{
              fontSize: screenSize.isMobile ? "9px" : "10px",
              display: "block",
              color: "#8c8c8c",
            }}
          >
            Designation
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
            ellipsis={{ tooltip: employee?.employmentDetails?.designation || employee?.employmentDetails?.assignedJobTitle || "N/A" }}
          >
            {employee?.employmentDetails?.designation ||
              employee?.employmentDetails?.assignedJobTitle ||
              "N/A"}
          </Text>
        </div>
        <div>
          <Text
            type="secondary"
            style={{
              fontSize: screenSize.isMobile ? "9px" : "10px",
              display: "block",
              color: "#8c8c8c",
            }}
          >
            Employment Type
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {typeof employee?.employmentDetails?.category === "object"
              ? employee?.employmentDetails?.category?.name || "N/A"
              : employee?.employmentDetails?.category || "N/A"}
          </Text>
        </div>
        <div>
          <Text
            type="secondary"
            style={{
              fontSize: screenSize.isMobile ? "9px" : "10px",
              display: "block",
              color: "#8c8c8c",
            }}
          >
            Official Email
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
            ellipsis={{ tooltip: employee?.employmentDetails?.officialEmail || "N/A" }}
          >
            {employee?.employmentDetails?.officialEmail || "N/A"}
          </Text>
        </div>
        <div>
          <Text
            type="secondary"
            style={{
              fontSize: screenSize.isMobile ? "9px" : "10px",
              display: "block",
              color: "#8c8c8c",
            }}
          >
            Project
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
            ellipsis={{ tooltip: typeof employee?.employmentDetails?.project === "object"
              ? employee?.employmentDetails?.project?.name || "N/A"
              : employee?.employmentDetails?.project || "N/A" }}
          >
            {typeof employee?.employmentDetails?.project === "object"
              ? employee?.employmentDetails?.project?.name || "N/A"
              : employee?.employmentDetails?.project || "N/A"}
          </Text>
        </div>
        <div>
          <Text
            type="secondary"
            style={{
              fontSize: screenSize.isMobile ? "9px" : "10px",
              display: "block",
              color: "#8c8c8c",
            }}
          >
            Reporting Manager
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
            ellipsis={{ tooltip: typeof employee?.employmentDetails?.reportingManager === "object"
              ? employee?.employmentDetails?.reportingManager?.name || "N/A"
              : employee?.employmentDetails?.reportingManager || "N/A" }}
          >
            {typeof employee?.employmentDetails?.reportingManager === "object"
              ? employee?.employmentDetails?.reportingManager?.name || "N/A"
              : employee?.employmentDetails?.reportingManager || "N/A"}
          </Text>
        </div>
        {employee?.employmentDetails?.visaCategory && (
          <div>
            <Text
              type="secondary"
              style={{
                fontSize: screenSize.isMobile ? "9px" : "10px",
                display: "block",
                color: "#8c8c8c",
              }}
            >
              Visa Category
            </Text>
            <Text
              style={{
                fontSize: screenSize.isMobile ? "11px" : "12px",
                display: "block",
                color: "#262626",
                fontWeight: 500,
              }}
            >
              {employee.employmentDetails.visaCategory}
            </Text>
          </div>
        )}

      </Space>
    </Card>
  );
};

export default EmploymentCard;
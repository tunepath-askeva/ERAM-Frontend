import { Card, Space, Typography } from "antd";
import { UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { phoneUtils } from "../../../utils/countryMobileLimits";

const { Text } = Typography;

const PersonalInfoCard = ({ employee, screenSize }) => {
  const navigate = useNavigate();

  return (
    <Card
      title={
        <Space size="small">
          <UserOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "11px" : "16px" }}>
            Personal Info
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
        padding: screenSize.isMobile ? "8px" : screenSize.isDesktop ? "10px" : "10px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : screenSize.isDesktop ? "8px 10px" : "10px 12px",
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
            Date of Birth
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {employee?.dateOfBirth 
              ? dayjs(employee.dateOfBirth).format("DD MMM YYYY") 
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
            Age
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {employee?.age ? `${employee.age} years` : "N/A"}
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
            Gender
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {employee?.gender || "N/A"}
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
            Nationality
          </Text>
          <Text
            style={{
              fontSize: screenSize.isMobile ? "11px" : "12px",
              display: "block",
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {employee?.nationality || "N/A"}
          </Text>
        </div>

        {employee?.passportNo && (
          <div>
            <Text
              type="secondary"
              style={{
                fontSize: screenSize.isMobile ? "9px" : "10px",
                display: "block",
                color: "#8c8c8c",
              }}
            >
              Passport No
            </Text>
            <Text
              style={{
                fontSize: screenSize.isMobile ? "11px" : "12px",
                display: "block",
                color: "#262626",
                fontWeight: 500,
              }}
            >
              {employee.passportNo}
            </Text>
          </div>
        )}
        {employee?.iqamaNo && (
          <div>
            <Text
              type="secondary"
              style={{
                fontSize: screenSize.isMobile ? "9px" : "10px",
                display: "block",
                color: "#8c8c8c",
              }}
            >
              Iqama No
            </Text>
            <Text
              style={{
                fontSize: screenSize.isMobile ? "11px" : "12px",
                display: "block",
                color: "#262626",
                fontWeight: 500,
              }}
            >
              {employee.iqamaNo}
            </Text>
          </div>
        )}
        {(employee?.emergencyContactNo || employee?.emergencyContactNoCountryCode) && (
          <div>
            <Text
              type="secondary"
              style={{
                fontSize: screenSize.isMobile ? "9px" : "10px",
                display: "block",
                color: "#8c8c8c",
              }}
            >
              Emergency Contact
            </Text>
            <Text
              style={{
                fontSize: screenSize.isMobile ? "11px" : "12px",
                display: "block",
                color: "#262626",
                fontWeight: 500,
              }}
            >
              <Space size="small">
                {employee?.emergencyContactNoCountryCode && employee?.emergencyContactNo
                  ? phoneUtils.formatWithCountryCode(
                      employee.emergencyContactNoCountryCode,
                      employee.emergencyContactNo
                    )
                  : employee?.emergencyContactNo || "N/A"}
              </Space>
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default PersonalInfoCard;
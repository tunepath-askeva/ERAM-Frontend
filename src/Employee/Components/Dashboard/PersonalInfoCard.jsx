import { Card, Typography,Space  } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { phoneUtils } from "../../../utils/countryMobileLimits";

const { Text } = Typography;

const PersonalInfoCard = ({ employee, screenSize }) => {
  const navigate = useNavigate();
  const width = screenSize?.width || 0;
  const isVeryLargeScreen = width >= 1200;
  const isLargeScreen = width >= 1024 && width < 1200;
  const isMediumScreen = width >= 768 && width < 1024;
  
  // Responsive font sizes - properly scaled for all screen sizes
  const getLabelFontSize = () => {
    if (screenSize.isMobile) return "10px";
    if (isVeryLargeScreen) return "13px";
    if (isLargeScreen) return "11px";
    if (isMediumScreen) return "10px";
    return "10px";
  };
  
  const getValueFontSize = () => {
    if (screenSize.isMobile) return "12px";
    if (isVeryLargeScreen) return "15px";
    if (isLargeScreen) return "13px";
    if (isMediumScreen) return "12px";
    return "12px";
  };
  
  const labelFontSize = getLabelFontSize();
  const valueFontSize = getValueFontSize();

  const renderField = (label, value, key) => {
    if (isVeryLargeScreen) {
      // Inline layout for large screens: "Label - Value"
      return (
        <div key={key} style={{ textAlign: "left", marginBottom: isVeryLargeScreen ? "8px" : "4px" }}>
          <Text
            type="secondary"
            style={{
              fontSize: labelFontSize,
              color: "#8c8c8c",
              marginRight: "8px",
            }}
          >
            {label} -
          </Text>
          <Text
            style={{
              fontSize: valueFontSize,
              color: "#262626",
              fontWeight: 500,
            }}
          >
            {value}
          </Text>
        </div>
      );
    } else {
      // Stacked layout for smaller screens
      return (
        <div key={key} style={{ textAlign: "center", marginBottom: "4px" }}>
          <Text
            type="secondary"
            style={{
              fontSize: labelFontSize,
              display: "block",
              color: "#8c8c8c",
              textAlign: "center",
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontSize: valueFontSize,
              display: "block",
              color: "#262626",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {value}
          </Text>
        </div>
      );
    }
  };

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
        padding: screenSize.isMobile ? "8px" : isVeryLargeScreen ? "14px 12px" : isLargeScreen ? "12px 10px" : "10px",
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : screenSize.isDesktop ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
    >
      <div style={{ 
        width: "100%", 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: isVeryLargeScreen ? "space-evenly" : "center",
        paddingTop: isVeryLargeScreen ? "4px" : "0px",
        paddingBottom: isVeryLargeScreen ? "4px" : "0px",
        overflow: "hidden",
      }}>
        {renderField(
          "Date of Birth",
          employee?.dateOfBirth 
            ? dayjs(employee.dateOfBirth).format("DD MMM YYYY") 
            : "N/A",
          "dob"
        )}
        {renderField(
          "Age",
          employee?.age ? `${employee.age} years` : "N/A",
          "age"
        )}
        {renderField(
          "Gender",
          employee?.gender || "N/A",
          "gender"
        )}
        {renderField(
          "Nationality",
          employee?.nationality || "N/A",
          "nationality"
        )}
        {employee?.passportNo && renderField(
          "Passport No",
          employee.passportNo,
          "passport"
        )}
        {employee?.iqamaNo && renderField(
          "Iqama No",
          employee.iqamaNo,
          "iqama"
        )}
        {(employee?.emergencyContactNo || employee?.emergencyContactNoCountryCode) && renderField(
          "Emergency Contact",
          employee?.emergencyContactNoCountryCode && employee?.emergencyContactNo
            ? phoneUtils.formatWithCountryCode(
                employee.emergencyContactNoCountryCode,
                employee.emergencyContactNo
              )
            : employee?.emergencyContactNo || "N/A",
          "emergency"
        )}
      </div>
    </Card>
  );
};

export default PersonalInfoCard;
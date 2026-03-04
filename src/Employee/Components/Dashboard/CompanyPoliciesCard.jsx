import { Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;

const CompanyPoliciesCard = ({ screenSize }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate("/employee/company-policy")}
      style={{
        cursor: "pointer",
        borderRadius: "12px",
        border: "1px solid #da2c46",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "14px" : screenSize.isDesktop ? "8px" : "14px",
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Title
        level={4}
        style={{
          margin: "0 0 2px 0",
          fontWeight: 600,
          fontSize: screenSize.isMobile ? "13px" : screenSize.isDesktop ? "12px" : "14px",
        }}
      >
        Company Policies
      </Title>
      <Text
        style={{
          display: "block",
          marginBottom: screenSize.isDesktop ? "2px" : "8px",
          fontSize: screenSize.isMobile ? "10px" : screenSize.isDesktop ? "10px" : "11px",
        }}
      >
        Review the procedures & policies
      </Text>
      <Link
        onClick={(e) => {
          e.stopPropagation();
          navigate("/employee/company-policy");
        }}
        style={{
          fontSize: screenSize.isMobile ? "10px" : screenSize.isDesktop ? "10px" : "11px",
          color: "#da2c46",
          fontWeight: 500,
        }}
      >
        Click Here to Know More
      </Link>
    </Card>
  );
};

export default CompanyPoliciesCard;
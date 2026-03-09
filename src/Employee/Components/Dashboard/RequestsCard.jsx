import { Card, Space, Typography, List, Empty, Spin, Tag, Button } from "antd";
import { SolutionOutlined, ClockCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getRequestTypeName, getRequestStatusColor } from "./utils";

dayjs.extend(relativeTime);

const { Text } = Typography;

const RequestsCard = ({ requests, requestsLoading, requestsError, screenSize }) => {
  const navigate = useNavigate();
  const width = screenSize?.width || 0;
  const isVeryLargeScreen = width >= 1200;
  const isLargeScreen = width >= 1024 && width < 1200;
  const isMediumScreen = width >= 768 && width < 1024;
  
  // Responsive font sizes - bigger for large screens, properly scaled
  const getTitleFontSize = () => {
    if (screenSize.isMobile) return "11px";
    if (isVeryLargeScreen) return "14px";
    if (isLargeScreen) return "13px";
    if (isMediumScreen) return "12px";
    return "12px";
  };
  
  const getDescriptionFontSize = () => {
    if (screenSize.isMobile) return "10px";
    if (isVeryLargeScreen) return "13px";
    if (isLargeScreen) return "12px";
    if (isMediumScreen) return "11px";
    return "11px";
  };
  
  const getTimeFontSize = () => {
    if (screenSize.isMobile) return "9px";
    if (isVeryLargeScreen) return "11px";
    if (isLargeScreen) return "10px";
    if (isMediumScreen) return "9px";
    return "9px";
  };
  
  const getTagFontSize = () => {
    if (screenSize.isMobile) return "8px";
    if (isVeryLargeScreen) return "10px";
    if (isLargeScreen) return "9px";
    if (isMediumScreen) return "8px";
    return "8px";
  };

  const handleCardClick = () => {
    // Navigate to raise request page by default
    navigate("/employee/raise-request");
  };

  const handleRequestClick = (request, e) => {
    e.stopPropagation();
    // Navigate to leave request page if it's a leave request, otherwise raise request page
    if (request.isLeaveRequest) {
      navigate("/employee/leave-request");
    } else {
      navigate("/employee/raise-request");
    }
  };

  return (
    <Card
      title={
        <Space size="small">
          <SolutionOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : isVeryLargeScreen ? "16px" : isLargeScreen ? "15px" : "14px" }}>
            Raised Requests
          </Text>
        </Space>
      }
      hoverable
      onClick={handleCardClick}
      style={{
        cursor: "pointer",
        borderRadius: "12px",
        border: "1px solid #e8e8e8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "10px" : isVeryLargeScreen ? "12px" : isLargeScreen ? "10px" : "10px",
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : screenSize.isDesktop ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
      extra={
        requests.length > 0 && (
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/employee/raise-request");
            }}
            style={{ padding: 0, fontSize: "10px" }}
          >
            View All <ArrowRightOutlined />
          </Button>
        )
      }
    >
      {requestsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Spin size="small" />
        </div>
      ) : requestsError ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                type="secondary"
                style={{
                  fontSize: screenSize.isMobile ? "10px" : "11px",
                }}
              >
                Unable to load requests
              </Text>
            }
            imageStyle={{ height: 30 }}
          />
        </div>
      ) : requests.length > 0 ? (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <List
            size="small"
            dataSource={requests.slice(0, 5)}
            style={{ flex: 1, overflow: "hidden" }}
            renderItem={(request) => (
              <List.Item
                style={{
                  padding: isVeryLargeScreen ? "6px 0" : isLargeScreen ? "5px 0" : "4px 0",
                  border: "none",
                  borderBottom:
                    requests.indexOf(request) < requests.slice(0, 5).length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={(e) => handleRequestClick(request, e)}
              >
              <Space style={{ width: "100%", alignItems: "flex-start" }} size="small">
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <Space size="small" style={{ marginBottom: isVeryLargeScreen ? "3px" : "2px", flexWrap: "wrap" }}>
                    <Text
                      strong
                      style={{
                        fontSize: getTitleFontSize(),
                        lineHeight: "1.3",
                        wordBreak: "break-word",
                      }}
                    >
                      {getRequestTypeName(request.requestType)}
                    </Text>
                    <Tag
                      color={getRequestStatusColor(request.status)}
                      style={{
                        fontSize: getTagFontSize(),
                        margin: 0,
                        padding: isVeryLargeScreen ? "0 6px" : isLargeScreen ? "0 5px" : "0 3px",
                        lineHeight: isVeryLargeScreen ? "18px" : isLargeScreen ? "16px" : "14px",
                        flexShrink: 0,
                      }}
                    >
                      {request.status}
                    </Tag>
                  </Space>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: getDescriptionFontSize(),
                      display: "block",
                      lineHeight: "1.3",
                      marginBottom: isVeryLargeScreen ? "3px" : "2px",
                      wordBreak: "break-word",
                    }}
                    ellipsis={{
                      tooltip: request.description || request.subject || "No description",
                      rows: 2,
                    }}
                  >
                    {request.description || request.subject || "No description"}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: getTimeFontSize(),
                      display: "block",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: "4px", fontSize: getTimeFontSize() }} />
                    {dayjs(request.createdAt).fromNow()}
                  </Text>
                </div>
                <ArrowRightOutlined style={{ color: "#d9d9d9", fontSize: "10px", flexShrink: 0, marginTop: "2px" }} />
              </Space>
            </List.Item>
          )}
          />
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                type="secondary"
                style={{
                  fontSize: screenSize.isMobile ? "10px" : "11px",
                }}
              >
                No requests
              </Text>
            }
            imageStyle={{ height: 30 }}
          />
        </div>
      )}
    </Card>
  );
};

export default RequestsCard;
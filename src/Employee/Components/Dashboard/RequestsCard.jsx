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

  return (
    <Card
      title={
        <Space size="small">
          <SolutionOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : "16px" }}>
            Raised Requests
          </Text>
        </Space>
      }
      hoverable
      onClick={() => navigate("/employee/raise-request")}
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
        padding: screenSize.isMobile ? "10px" : "12px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: 0,
        maxHeight: screenSize.isMobile ? "300px" : undefined,
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : "10px 12px",
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
        <Spin size="small" />
      ) : requestsError ? (
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
      ) : requests.length > 0 ? (
        <List
          size="small"
          dataSource={requests.slice(0, 5)}
          renderItem={(request) => (
            <List.Item
              style={{
                padding: "4px 0",
                border: "none",
                borderBottom:
                  requests.indexOf(request) < requests.slice(0, 5).length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
              }}
            >
              <Space style={{ width: "100%" }} align="start" size="small">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space size="small" style={{ marginBottom: "2px" }}>
                    <Text
                      strong
                      style={{
                        fontSize: screenSize.isMobile ? "10px" : "11px",
                      }}
                    >
                      {getRequestTypeName(request.requestType)}
                    </Text>
                    <Tag
                      color={getRequestStatusColor(request.status)}
                      style={{
                        fontSize: screenSize.isMobile ? "8px" : "9px",
                        margin: 0,
                        padding: "0 3px",
                        lineHeight: "16px",
                      }}
                    >
                      {request.status}
                    </Tag>
                  </Space>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: screenSize.isMobile ? "9px" : "10px",
                      display: "block",
                      lineHeight: "1.3",
                    }}
                    ellipsis={{
                      tooltip: request.description || request.subject || "No description",
                    }}
                  >
                    {request.description || request.subject || "No description"}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: screenSize.isMobile ? "8px" : "9px",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: "3px", fontSize: "9px" }} />
                    {dayjs(request.createdAt).fromNow()}
                  </Text>
                </div>
                <ArrowRightOutlined style={{ color: "#d9d9d9", fontSize: "10px" }} />
              </Space>
            </List.Item>
          )}
        />
      ) : (
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
      )}
    </Card>
  );
};

export default RequestsCard;
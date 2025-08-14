import { useGetFeedbacksQuery } from "../../Slices/Employee/EmployeeApis";
import { Card, List, Tag, Typography, Space, Divider } from "antd";
import {
  MessageOutlined,
  BulbOutlined,
  MailOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const EmployeeAdminFeedback = () => {
  const { data, isLoading } = useGetFeedbacksQuery();
  const feedbacks = data?.feedbacks || [];

  const getTypeTag = (type) => {
    if (type === "suggestion") {
      return (
        <Tag icon={<BulbOutlined />} color="blue">
          Suggestion
        </Tag>
      );
    } else if (type === "anonymous") {
      return (
        <Tag icon={<UserOutlined />} color="orange">
          Anonymous
        </Tag>
      );
    }
    return (
      <Tag icon={<MessageOutlined />} color="green">
        Feedback
      </Tag>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Employee Feedback & Suggestions</Title>
      <Text type="secondary">
        Review and manage employee feedback and suggestions
      </Text>
      <Divider />

      {isLoading ? (
        <Card loading style={{ marginTop: 16 }} />
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={feedbacks}
          renderItem={(item) => (
            <List.Item key={item._id}>
              <Card
                title={
                  <Space>
                    {getTypeTag(item.type)}
                    <Text strong>
                      {item.message.length > 50
                        ? `${item.message.substring(0, 50)}...`
                        : item.message}
                    </Text>
                  </Space>
                }
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text>{item.message}</Text>
                  <Divider style={{ margin: "8px 0" }} />
                  <Space wrap>
                    {item.type !== "anonymous" && item.email && (
                      <Text type="secondary">
                        <MailOutlined /> {item.email}
                      </Text>
                    )}
                    <Text type="secondary">
                      <ClockCircleOutlined />{" "}
                      {dayjs(item.createdAt).fromNow()} (
                      {dayjs(item.createdAt).format("MMM D, YYYY h:mm A")})
                    </Text>
                  </Space>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      {!isLoading && feedbacks.length === 0 && (
        <Card style={{ marginTop: 16 }}>
          <Text type="secondary">No feedbacks or suggestions available</Text>
        </Card>
      )}
    </div>
  );
};

export default EmployeeAdminFeedback;
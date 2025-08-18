import { useState } from "react";
import { useGetFeedbacksQuery } from "../../Slices/Employee/EmployeeApis";
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Divider,
  Select,
  Row,
  Col,
  Button,
  Modal,
} from "antd";
import {
  MessageOutlined,
  BulbOutlined,
  MailOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

const EmployeeAdminFeedback = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterType, setFilterType] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(filterType !== "all" && { type: filterType }),
  };

  const { data, isLoading } = useGetFeedbacksQuery(queryParams);

  const feedbacks = data?.feedbacks || [];
  const total = data?.total || 0;

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
    // Fallback for any other type
    return (
      <Tag icon={<MessageOutlined />} color="green">
        Other
      </Tag>
    );
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleFilterChange = (value) => {
    setFilterType(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleViewDetails = (record) => {
    setSelectedFeedback(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedFeedback(null);
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => getTypeTag(type),

    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: {
        showTitle: false,
      },
      render: (message) => (
        <Text style={{ wordBreak: "break-word" }}>
          {message.length > 100 ? `${message.substring(0, 100)}...` : message}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (email, record) => {
        if (record.type === "anonymous" || !email) {
          return <Text type="secondary">Anonymous</Text>;
        }
        return (
          <Space>
            <MailOutlined />
            <Text>{email}</Text>
          </Space>
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt) => (
        <Space direction="vertical" size={0}>
          <Text>
            <ClockCircleOutlined /> {dayjs(createdAt).fromNow()}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(createdAt).format("MMM D, YYYY h:mm A")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
          style={{color: "#da2c46", border: "1px solid #da2c46"}}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Employee Feedback & Suggestions</Title>
      <Text type="secondary">
        Review and manage employee feedback and suggestions
      </Text>
      <Divider />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Select
            placeholder="Filter by type"
            value={filterType}
            onChange={handleFilterChange}
            style={{ width: "100%" }}
          >
            <Option value="all">All Types</Option>
            <Option value="suggestion">Suggestion</Option>
            <Option value="anonymous">Anonymous</Option>
          </Select>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* View Details Modal */}
      <Modal
        title={
          <Space>
            {selectedFeedback && getTypeTag(selectedFeedback.type)}
            <Text strong>Feedback Details</Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedFeedback && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                Message:
              </Text>
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  backgroundColor: "#fafafa",
                  borderRadius: "6px",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Text>{selectedFeedback.message}</Text>
              </div>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            <Row gutter={24}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Type:</Text>
                  {getTypeTag(selectedFeedback.type)}
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Email:</Text>
                  {selectedFeedback.type === "anonymous" ||
                  !selectedFeedback.email ? (
                    <Text type="secondary">Anonymous submission</Text>
                  ) : (
                    <Space>
                      <MailOutlined />
                      <Text copyable>{selectedFeedback.email}</Text>
                    </Space>
                  )}
                </Space>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Submitted:</Text>
                  <Space direction="vertical" size={0}>
                    <Text>
                      <ClockCircleOutlined />{" "}
                      {dayjs(selectedFeedback.createdAt).fromNow()}
                    </Text>
                    <Text type="secondary">
                      {dayjs(selectedFeedback.createdAt).format(
                        "MMMM D, YYYY h:mm A"
                      )}
                    </Text>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>
      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAdminFeedback;

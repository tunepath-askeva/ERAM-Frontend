import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Typography,
  message,
  Badge,
  Row,
  Col,
  Spin,
  Modal,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useGetEmployeeRaisedRequestsQuery } from "../../Slices/Employee/EmployeeApis";

const { Title, Text, Paragraph } = Typography;

const EmployeeAdminOtherRequest = () => {
  const { data, isLoading, error, refetch } =
    useGetEmployeeRaisedRequestsQuery();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestData, setRequestData] = useState([]);

  React.useEffect(() => {
    if (data?.otherRequests) {
      const transformedData = data.otherRequests.map((request) => ({
        ...request,
        key: request._id,
      }));
      setRequestData(transformedData);
    }
  }, [data]);

  const handleViewRequest = (record) => {
    setSelectedRequest(record);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const handleDownloadDocument = (fileUrl, documentName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = documentName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "processing";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "processing";
    }
  };

  const getRequestTypeColor = (requestType) => {
    const colors = [
      "blue",
      "green",
      "orange",
      "purple",
      "cyan",
      "magenta",
      "volcano",
      "geekblue",
    ];
    const hash = requestType?.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: ["employee", "fullName"],
      key: "employee",
      align: "center",
      render: (text, record) => (
        <div>
          <div
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ marginRight: "4px", color: "#da2c46" }} />
            {text}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "2px",
            }}
          >
            <IdcardOutlined style={{ marginRight: "4px" }} />
            {record.employee?.employmentDetails?.eramId || "N/A"}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "2px",
            }}
          >
            <MailOutlined style={{ marginRight: "4px" }} />
            {record.employee?.email}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "2px",
            }}
          >
            <PhoneOutlined style={{ marginRight: "4px" }} />
            {record.employee?.phone}
          </div>
        </div>
      ),
    },
    {
      title: "Request Type",
      dataIndex: "requestType",
      key: "requestType",
      align: "center",
      render: (type) => <Tag color={getRequestTypeColor(type)}>{type}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (description) => (
        <Tooltip title={description}>
          <div
            style={{
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={
            status
              ? status.charAt(0).toUpperCase() + status.slice(1)
              : "Pending"
          }
        />
      ),
    },
    {
      title: "Documents",
      dataIndex: "uploadedDocuments",
      key: "documents",
      align: "center",
      render: (documents) => (
        <div>
          {documents && documents.length > 0 ? (
            <Tag color="blue" icon={<FileTextOutlined />}>
              {documents.length} file{documents.length > 1 ? "s" : ""}
            </Tag>
          ) : (
            <Tag color="default">No files</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewRequest(record)}
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const pendingCount = requestData.filter(
    (request) => !request.status || request.status === "pending"
  ).length;
  const approvedCount = requestData.filter(
    (request) => request.status === "approved"
  ).length;
  const rejectedCount = requestData.filter(
    (request) => request.status === "rejected"
  ).length;

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>Loading other requests...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="danger">
          Error loading other requests. Please try again.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Other Request Management</Title>
        <Row gutter={16} style={{ marginTop: "16px" }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                  {pendingCount}
                </Title>
                <Text>Pending Requests</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ color: "#52c41a", margin: 0 }}>
                  {approvedCount}
                </Title>
                <Text>Approved Requests</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ color: "#ff4d4f", margin: 0 }}>
                  {rejectedCount}
                </Title>
                <Text>Rejected Requests</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={requestData}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Request Details Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <FileTextOutlined
              style={{ marginRight: "8px", color: "#da2c46" }}
            />
            Request Details
          </div>
        }
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedRequest && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" title="Employee Information">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text strong>Name:</Text>
                      <br />
                      <Text>{selectedRequest.employee?.fullName}</Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>ERAM ID:</Text>
                      <br />
                      <Text>
                        {selectedRequest.employee?.employmentDetails?.eramId ||
                          "N/A"}
                      </Text>
                    </Col>

                    <Col span={8}>
                      <Text strong>Email:</Text>
                      <br />
                      <Text>{selectedRequest.employee?.email}</Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Phone:</Text>
                      <br />
                      <Text>{selectedRequest.employee?.phone}</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card size="small" title="Request Information">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Request Type:</Text>
                      <br />
                      <Tag
                        color={getRequestTypeColor(selectedRequest.requestType)}
                        style={{ marginTop: "4px" }}
                      >
                        {selectedRequest.requestType}
                      </Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong>Status:</Text>
                      <br />
                      <Badge
                        status={getStatusColor(selectedRequest.status)}
                        text={
                          selectedRequest.status
                            ? selectedRequest.status.charAt(0).toUpperCase() +
                              selectedRequest.status.slice(1)
                            : "Pending"
                        }
                        style={{ marginTop: "4px" }}
                      />
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: "16px" }}>
                    <Col span={24}>
                      <Text strong>Description:</Text>
                      <Paragraph
                        style={{
                          marginTop: "8px",
                          padding: "12px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                        }}
                      >
                        {selectedRequest.description}
                      </Paragraph>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {selectedRequest.uploadedDocuments &&
                selectedRequest.uploadedDocuments.length > 0 && (
                  <Col span={24}>
                    <Card size="small" title="Uploaded Documents">
                      <div>
                        {selectedRequest.uploadedDocuments.map((doc, index) => (
                          <div
                            key={doc._id || index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              backgroundColor: "#f9f9f9",
                              borderRadius: "4px",
                              marginBottom: "8px",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <FileTextOutlined
                                style={{ marginRight: "8px", color: "#1890ff" }}
                              />
                              <div>
                                <Text strong>{doc.documentName}</Text>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  Uploaded: {formatDate(doc.uploadedAt)}
                                </Text>
                              </div>
                            </div>
                            <Button
                              type="link"
                              icon={<DownloadOutlined />}
                              onClick={() =>
                                handleDownloadDocument(
                                  doc.fileUrl,
                                  doc.documentName
                                )
                              }
                            >
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )}
            </Row>
          </div>
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

export default EmployeeAdminOtherRequest;

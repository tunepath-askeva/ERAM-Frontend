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
  Form,
  DatePicker,
  Input,
  InputNumber,
  Divider,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  useGetEmployeeRaisedRequestsQuery,
  useGetEmployeeRaisedRequestByIdQuery,
  useSendTicketInfoMutation,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EmployeeAdminOtherRequest = () => {
  const { data, isLoading, error, refetch } =
    useGetEmployeeRaisedRequestsQuery();

  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestData, setRequestData] = useState([]);
  const [ticketDetailsForm] = Form.useForm();
  const [ticketDetails, setTicketDetails] = useState([
    { id: Date.now(), date: null, price: null, description: "" },
  ]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [viewingTickets, setViewingTickets] = useState(false);

  const {
    data: requestDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetEmployeeRaisedRequestByIdQuery(selectedRequestId, {
    skip: !selectedRequestId,
  });

  const [sendTicketInfo, { isLoading: isSendingTicketInfo }] =
    useSendTicketInfoMutation();

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
    setSelectedRequestId(record._id);
    setModalVisible(true);
    setShowTicketForm(false);
    setViewingTickets(false);
    setTicketDetails([
      { id: Date.now(), date: null, price: null, description: "" },
    ]);
    ticketDetailsForm.resetFields();
  };

  const handleViewTicketDetails = () => {
    setViewingTickets(true);
    setShowTicketForm(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequestId(null);
    setShowTicketForm(false);
    setTicketDetails([
      { id: Date.now(), date: null, price: null, description: "" },
    ]);
    ticketDetailsForm.resetFields();
  };

  const handleAddTicketDetail = () => {
    const newTicketDetail = {
      id: Date.now(),
      date: null,
      price: null,
      description: "",
    };
    setTicketDetails([...ticketDetails, newTicketDetail]);
  };

  const handleRemoveTicketDetail = (id) => {
    if (ticketDetails.length > 1) {
      setTicketDetails(ticketDetails.filter((detail) => detail.id !== id));
    }
  };

  const handleTicketDetailChange = (id, field, value) => {
    setTicketDetails((prevDetails) =>
      prevDetails.map((detail) =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    );
  };

  const handleSendTicketInfo = async () => {
    try {
      const isValid = ticketDetails.every(
        (detail) => detail.date && detail.price && detail.description.trim()
      );

      if (!isValid) {
        message.error("Please fill all ticket detail fields");
        return;
      }

      const ticketData = ticketDetails.map((detail) => ({
        date: detail.date.format("YYYY-MM-DD"),
        ticketPrice: detail.price,
        description: detail.description,
      }));

      await sendTicketInfo({
        requestId: selectedRequestId,
        ticketDetails: ticketData,
      }).unwrap();

      message.success("Ticket information sent successfully!");
      setShowTicketForm(false);
      setTicketDetails([
        { id: Date.now(), date: null, price: null, description: "" },
      ]);
      ticketDetailsForm.resetFields();
    } catch (error) {
      message.error("Failed to send ticket information. Please try again.");
      console.error("Error sending ticket info:", error);
    }
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

  const isTravelRequest = requestDetails?.otherRequests?.requestType
    ?.toLowerCase()
    .includes("travel");

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
          ...(isTravelRequest &&
          !showTicketForm &&
          !viewingTickets &&
          requestDetails?.otherRequests?.ticketDetails?.length > 0
            ? [
                <Button
                  key="viewTickets"
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handleViewTicketDetails}
                  style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
                >
                  View Tickets
                </Button>,
              ]
            : []),
          ...(isTravelRequest && !showTicketForm && !viewingTickets
            ? [
                <Button
                  key="addTicket"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowTicketForm(true)}
                  style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
                >
                  Add Tickets
                </Button>,
              ]
            : []),
          ...(showTicketForm || viewingTickets
            ? [
                <Button
                  key="cancel"
                  onClick={() => {
                    setShowTicketForm(false);
                    setViewingTickets(false);
                    setTicketDetails([
                      {
                        id: Date.now(),
                        date: null,
                        price: null,
                        description: "",
                      },
                    ]);
                    ticketDetailsForm.resetFields();
                  }}
                >
                  Back
                </Button>,
              ]
            : []),
          ...(showTicketForm
            ? [
                <Button
                  key="send"
                  type="primary"
                  icon={<SendOutlined />}
                  loading={isSendingTicketInfo}
                  onClick={handleSendTicketInfo}
                  style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
                >
                  Send Ticket Info
                </Button>,
              ]
            : []),
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {isLoadingDetails ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Loading request details...</Text>
            </div>
          </div>
        ) : detailsError ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="danger">
              Error loading request details. Please try again.
            </Text>
          </div>
        ) : requestDetails?.otherRequests ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" title="Employee Information">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Name:</Text>
                      <br />
                      <Text>
                        {requestDetails.otherRequests.employee?.fullName}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>ERAM ID:</Text>
                      <br />
                      <Text>
                        {requestDetails.otherRequests.employee
                          ?.employmentDetails?.eramId || "N/A"}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Email:</Text>
                      <br />
                      <Text>
                        {requestDetails.otherRequests.employee?.email}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Phone:</Text>
                      <br />
                      <Text>
                        {requestDetails.otherRequests.employee?.phone}
                      </Text>
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
                        color={getRequestTypeColor(
                          requestDetails.otherRequests.requestType
                        )}
                        style={{ marginTop: "4px" }}
                      >
                        {requestDetails.otherRequests.requestType}
                      </Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong>Status:</Text>
                      <br />
                      <Badge
                        status={getStatusColor(
                          requestDetails.otherRequests.status
                        )}
                        text={
                          requestDetails.otherRequests.status
                            ? requestDetails.otherRequests.status
                                .charAt(0)
                                .toUpperCase() +
                              requestDetails.otherRequests.status.slice(1)
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
                          minHeight: "60px",
                        }}
                      >
                        {requestDetails.otherRequests.description ||
                          "No description provided"}
                      </Paragraph>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {showTicketForm && isTravelRequest && (
                <Col span={24}>
                  <Card size="small" title="Ticket Details">
                    <Form form={ticketDetailsForm} layout="vertical">
                      {ticketDetails.map((detail, index) => (
                        <div key={detail.id}>
                          <Row gutter={16} align="middle">
                            <Col span={6}>
                              <Form.Item
                                label={index === 0 ? "Date" : ""}
                                style={{
                                  marginBottom:
                                    index === ticketDetails.length - 1
                                      ? "24px"
                                      : "8px",
                                }}
                              >
                                <DatePicker
                                  style={{ width: "100%" }}
                                  placeholder="Select date"
                                  value={detail.date}
                                  onChange={(date) =>
                                    handleTicketDetailChange(
                                      detail.id,
                                      "date",
                                      date
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label={index === 0 ? "Ticket Price" : ""}
                                style={{
                                  marginBottom:
                                    index === ticketDetails.length - 1
                                      ? "24px"
                                      : "8px",
                                }}
                              >
                                <InputNumber
                                  style={{ width: "100%" }}
                                  placeholder="Enter price"
                                  min={0}
                                  precision={2}
                                  value={detail.price}
                                  onChange={(value) =>
                                    handleTicketDetailChange(
                                      detail.id,
                                      "price",
                                      value
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                label={index === 0 ? "Description" : ""}
                                style={{
                                  marginBottom:
                                    index === ticketDetails.length - 1
                                      ? "24px"
                                      : "8px",
                                }}
                              >
                                <TextArea
                                  rows={1}
                                  placeholder="Enter ticket details"
                                  value={detail.description}
                                  onChange={(e) =>
                                    handleTicketDetailChange(
                                      detail.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item
                                label={index === 0 ? " " : ""}
                                style={{
                                  marginBottom:
                                    index === ticketDetails.length - 1
                                      ? "24px"
                                      : "8px",
                                }}
                              >
                                {ticketDetails.length > 1 && (
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleRemoveTicketDetail(detail.id)
                                    }
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                          {index < ticketDetails.length - 1 && (
                            <Divider style={{ margin: "8px 0" }} />
                          )}
                        </div>
                      ))}

                      <Button
                        type="dashed"
                        onClick={handleAddTicketDetail}
                        icon={<PlusOutlined />}
                        style={{ width: "100%", marginTop: "8px" }}
                      >
                        Add Another Ticket Detail
                      </Button>
                    </Form>
                  </Card>
                </Col>
              )}

              {requestDetails.otherRequests.uploadedDocuments &&
                requestDetails.otherRequests.uploadedDocuments.length > 0 && (
                  <Col span={24}>
                    <Card
                      size="small"
                      title={`Uploaded Documents (${requestDetails.otherRequests.uploadedDocuments.length})`}
                    >
                      <div>
                        {requestDetails.otherRequests.uploadedDocuments.map(
                          (doc, index) => (
                            <div
                              key={doc._id || index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                                backgroundColor: "#f9f9f9",
                                borderRadius: "6px",
                                marginBottom: "12px",
                                border: "1px solid #e8e8e8",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  flex: 1,
                                }}
                              >
                                <FileTextOutlined
                                  style={{
                                    marginRight: "12px",
                                    color: "#1890ff",
                                    fontSize: "16px",
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <Text
                                    strong
                                    style={{
                                      display: "block",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    {doc.documentName}
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Uploaded: {formatDate(doc.uploadedAt)}
                                  </Text>
                                </div>
                              </div>
                              <Button
                                type="primary"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() =>
                                  handleDownloadDocument(
                                    doc.fileUrl,
                                    doc.documentName
                                  )
                                }
                                style={{
                                  backgroundColor: "#da2c46",
                                  borderColor: "#da2c46",
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </Card>
                  </Col>
                )}

              {(!requestDetails.otherRequests.uploadedDocuments ||
                requestDetails.otherRequests.uploadedDocuments.length ===
                  0) && (
                <Col span={24}>
                  <Card size="small" title="Documents">
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#999",
                      }}
                    >
                      <FileTextOutlined
                        style={{ fontSize: "24px", marginBottom: "8px" }}
                      />
                      <div>No documents uploaded for this request</div>
                    </div>
                  </Card>
                </Col>
              )}

              {viewingTickets &&
                isTravelRequest &&
                requestDetails?.otherRequests?.ticketDetails?.length > 0 && (
                  <Col span={24}>
                    <Card size="small" title="Existing Ticket Details">
                      {requestDetails.otherRequests.ticketDetails.map(
                        (ticket, index) => (
                          <div key={ticket._id || index}>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                              <Col span={6}>
                                <Text strong>Date:</Text>
                                <br />
                                <Text>{formatDate(ticket.date)}</Text>
                              </Col>
                              <Col span={6}>
                                <Text strong>Ticket Price:</Text>
                                <br />
                                <Text>{ticket.ticketPrice}</Text>
                              </Col>
                              <Col span={12}>
                                <Text strong>Description:</Text>
                                <br />
                                <Text>{ticket.description}</Text>
                              </Col>
                            </Row>
                            {index <
                              requestDetails.otherRequests.ticketDetails
                                .length -
                                1 && <Divider />}
                          </div>
                        )
                      )}
                    </Card>
                  </Col>
                )}
            </Row>
          </div>
        ) : null}
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

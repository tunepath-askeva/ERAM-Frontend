import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  Button,
  Typography,
  Space,
  Row,
  Badge,
  Tooltip,
  Modal,
  Tag,
  Spin,
  Input,
  Pagination,
  Empty,
  Form,
  Select,
  Card,
  Col,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ContactsOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  useAddClientMutation,
  useGetClientsQuery,
  useUpdateClientMutation, // Add this import
} from "../../Slices/Admin/AdminApis";

const { Title, Text } = Typography;
const { Option } = Select;

const ClientsManagement = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [addClient] = useAddClientMutation();
  const [updateClient] = useUpdateClientMutation(); // Add this hook

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingClient, setEditingClient] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: clientData,
    isLoading: isLoadingClients,
    refetch: refetchClients,
    error: clientsError,
  } = useGetClientsQuery({
    searchTerm: debouncedSearchTerm,
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const showCreateModal = () => {
    setModalMode("create");
    setEditingClient(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const showEditModal = (client) => {
    setModalMode("edit");
    setEditingClient(client);
    form.setFieldsValue({
      name: client.fullName,
      code: client.ClientCode,
      email: client.email,
      contactNo: client.phone,
      contactPersonNumber: client.contactPersonMobile,
      sapCode: client.sapCode,
      type: client.clientType,
    });
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (modalMode === "create") {
        await addClient(values).unwrap();
        enqueueSnackbar("Client created successfully", { variant: "success" });
      } else {
        await updateClient({
          clientId: editingClient._id,
          ...values,
        }).unwrap();
        enqueueSnackbar("Client updated successfully", { variant: "success" });
      }
      setIsFormModalVisible(false);
      form.resetFields();
      refetchClients(); // Refresh the client list
    } catch (error) {
      enqueueSnackbar(
        error.data?.message || error.message || "An error occurred",
        { variant: "error" }
      );
    }
  };

  const showDeleteModal = (client) => {
    setClientToDelete(client);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    // await deleteClient(clientToDelete._id).unwrap();
    enqueueSnackbar("Client deleted successfully", { variant: "success" });
    setDeleteModalVisible(false);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setViewModalVisible(true);
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize: pageSize,
    });
  };

  return (
    <>
      <div className="client-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined
              style={{ marginRight: "8px", color: "#2c3e50", fontSize: "20px" }}
            />
            <Title
              level={2}
              className="client-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}
            >
              Clients Management
            </Title>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flex: 1,
              justifyContent: "flex-end",
              minWidth: "300px",
            }}
          >
            <Input.Search
              placeholder="Search Clients"
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                maxWidth: "300px",
                width: "100%",
                borderRadius: "8px",
                height: "35px",
              }}
              size="large"
              className="custom-search-input"
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
              className="client-button"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                height: "48px",
                minWidth: "180px",
              }}
            >
              Add New Client
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoadingClients && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      )}

      {/* Client List */}
      {!isLoadingClients && (
        <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
          {clientData?.clients?.length === 0 ? (
            <Col span={24}>
              <Empty
                description={
                  searchTerm
                    ? "No clients found matching your search"
                    : "No clients found"
                }
                style={{ padding: "40px 0" }}
              />
            </Col>
          ) : (
            clientData?.clients?.map((client) => (
              <Col
                key={client._id}
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={8}
                xxl={6}
              >
                <Card
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "16px",
                          wordBreak: "break-word",
                          flex: 1,
                          minWidth: "0",
                        }}
                      >
                        {client.fullName}
                      </Text>
                      <Tag
                        color={
                          client.accountStatus === "active" ? "green" : "red"
                        }
                        style={{ margin: 0 }}
                      >
                        {client.accountStatus}
                      </Tag>
                    </div>
                  }
                  extra={
                    <Space size="small">
                      <Tooltip title="View Details">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewClient(client)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit Client">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => showEditModal(client)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete Client">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteModal(client)}
                        />
                      </Tooltip>
                    </Space>
                  }
                  style={{
                    height: "100%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                  }}
                  bodyStyle={{ padding: "16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ContactsOutlined
                        style={{ color: "#8c8c8c", fontSize: "14px" }}
                      />
                      <Text
                        style={{
                          fontSize: "14px",
                          wordBreak: "break-word",
                          flex: 1,
                        }}
                      >
                        {client.contactPersonMobile}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <MailOutlined
                        style={{ color: "#8c8c8c", fontSize: "14px" }}
                      />
                      <Text
                        style={{
                          fontSize: "14px",
                          wordBreak: "break-all",
                          flex: 1,
                        }}
                      >
                        {client.email}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <PhoneOutlined
                        style={{ color: "#8c8c8c", fontSize: "14px" }}
                      />
                      <Text style={{ fontSize: "14px" }}>{client.phone}</Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <TagOutlined
                        style={{ color: "#8c8c8c", fontSize: "14px" }}
                      />
                      <Tag
                        color={
                          client.clientType === "Customer"
                            ? "blue"
                            : client.clientType === "Supplier"
                            ? "orange"
                            : "purple"
                        }
                        style={{ margin: 0 }}
                      >
                        {client.clientType}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Pagination */}
      {!isLoadingClients && clientData?.clients?.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={clientData?.total || 0}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} clients`
            }
            pageSizeOptions={["12", "24", "48", "96"]}
          />
        </div>
      )}

      {/* Client Form Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            {modalMode === "create" ? "Add New Client" : "Edit Client"}
          </div>
        }
        open={isFormModalVisible}
        onCancel={() => {
          setIsFormModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsFormModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ background: "#da2c46" }}
            onClick={() => form.submit()}
          >
            {modalMode === "create" ? "Create Client" : "Update Client"}
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "700px" }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Client Name"
                rules={[
                  { required: true, message: "Please enter client name" },
                ]}
              >
                <Input placeholder="Enter client name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Client Code"
                rules={[
                  { required: true, message: "Please enter client code" },
                ]}
              >
                <Input placeholder="Enter client code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email" prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactNo"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Please enter valid phone number",
                  },
                ]}
              >
                <Input
                  placeholder="Enter phone number"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactPersonNumber"
                label="Contact Person"
                rules={[
                  { required: true, message: "Please enter contact person" },
                ]}
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="sapCode"
                label="SAP Code"
                rules={[{ required: true, message: "Please enter SAP code" }]}
              >
                <Input placeholder="Enter SAP code" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="Client Type"
            rules={[{ required: true, message: "Please select client type" }]}
          >
            <Select placeholder="Select client type">
              <Option value="Customer">Customer</Option>
              <Option value="Supplier">Supplier</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Client Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Client Details
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setViewModalVisible(false)}
            style={{ background: "#da2c46" }}
          >
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "700px" }}
      >
        {selectedClient && (
          <div style={{ padding: "16px 0" }}>
            <div style={{ marginBottom: "24px" }}>
              <Title level={4} style={{ marginBottom: "8px" }}>
                {selectedClient.fullName}
              </Title>
              <Tag
                color={
                  selectedClient.accountStatus === "active" ? "green" : "red"
                }
              >
                {selectedClient.accountStatus}
              </Tag>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Client Code:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.ClientCode}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Email:</Text>
                  <Text
                    style={{
                      display: "block",
                      marginTop: "4px",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedClient.email}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Phone Number:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.phone}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Contact Person:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.contactPersonMobile}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>SAP Code:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.sapCode}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Client Type:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.clientType}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}
          >
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            Delete Client
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "500px" }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>Are you sure you want to delete this client?</Text>
          {clientToDelete && (
            <div style={{ marginTop: "16px" }}>
              <Text strong>{clientToDelete.fullName}</Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ClientsManagement;

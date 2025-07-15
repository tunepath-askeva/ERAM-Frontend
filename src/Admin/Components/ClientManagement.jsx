import React, { useState } from "react";
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

const { Title, Text } = Typography;
const { Option } = Select;

const ClientsManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingClient, setEditingClient] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();

  const [clients, setClients] = useState([
    {
      id: 1,
      name: "ABC Corporation",
      code: "ABC001",
      email: "abc@example.com",
      contactNo: "1234567890",
      contactPerson: "John Doe",
      sapCode: "SAP001",
      type: "Customer",
      status: "active",
    },
    {
      id: 2,
      name: "XYZ Ltd",
      code: "XYZ002",
      email: "xyz@example.com",
      contactNo: "0987654321",
      contactPerson: "Jane Smith",
      sapCode: "SAP002",
      type: "Supplier",
      status: "active",
    },
    {
      id: 3,
      name: "Tech Solutions Inc",
      code: "TSI003",
      email: "tech@example.com",
      contactNo: "1122334455",
      contactPerson: "Mike Johnson",
      sapCode: "SAP003",
      type: "Both",
      status: "inactive",
    },
  ]);

  const showCreateModal = () => {
    setModalMode("create");
    setEditingClient(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const showEditModal = (client) => {
    setModalMode("edit");
    setEditingClient(client);
    form.setFieldsValue(client);
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = (values) => {
    if (modalMode === "create") {
      // Add new client
      setClients([...clients, { ...values, id: clients.length + 1 }]);
      enqueueSnackbar("Client created successfully", { variant: "success" });
    } else {
      // Update client
      setClients(
        clients.map((c) =>
          c.id === editingClient.id ? { ...c, ...values } : c
        )
      );
      enqueueSnackbar("Client updated successfully", { variant: "success" });
    }
    setIsFormModalVisible(false);
  };

  const showDeleteModal = (client) => {
    setClientToDelete(client);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    setClients(clients.filter((c) => c.id !== clientToDelete.id));
    enqueueSnackbar("Client deleted successfully", { variant: "success" });
    setDeleteModalVisible(false);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setViewModalVisible(true);
  };

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Client List */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        {filteredClients.length === 0 ? (
          <Col span={24}>
            <Empty 
              description="No clients found" 
              style={{ padding: "40px 0" }}
            />
          </Col>
        ) : (
          filteredClients.map((client) => (
            <Col 
              key={client.id} 
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
                      gap: "8px"
                    }}
                  >
                    <Text 
                      strong 
                      style={{ 
                        fontSize: "16px",
                        wordBreak: "break-word",
                        flex: 1,
                        minWidth: "0"
                      }}
                    >
                      {client.name}
                    </Text>
                    <Tag 
                      color={client.status === "active" ? "green" : "red"}
                      style={{ margin: 0 }}
                    >
                      {client.status}
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
                  borderRadius: "8px"
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ContactsOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
                    <Text 
                      style={{ 
                        fontSize: "14px",
                        wordBreak: "break-word",
                        flex: 1
                      }}
                    >
                      {client.contactPerson}
                    </Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MailOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
                    <Text 
                      style={{ 
                        fontSize: "14px",
                        wordBreak: "break-all",
                        flex: 1
                      }}
                    >
                      {client.email}
                    </Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <PhoneOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
                    <Text style={{ fontSize: "14px" }}>{client.contactNo}</Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <TagOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
                    <Tag 
                      color={
                        client.type === "Customer" ? "blue" : 
                        client.type === "Supplier" ? "orange" : "purple"
                      }
                      style={{ margin: 0 }}
                    >
                      {client.type}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Client Form Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            {modalMode === "create" ? "Add New Client" : "Edit Client"}
          </div>
        }
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsFormModalVisible(false)}>
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={editingClient || {}}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Client Name"
                rules={[{ required: true, message: "Please enter client name" }]}
              >
                <Input placeholder="Enter client name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Client Code"
                rules={[{ required: true, message: "Please enter client code" }]}
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
                label="Contact Number"
                rules={[
                  { required: true, message: "Please enter contact number" },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Please enter valid contact number",
                  },
                ]}
              >
                <Input
                  placeholder="Enter contact number"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: "Please enter contact person" }]}
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="sapCode"
                label="Client Code From SAP"
                rules={[
                  { required: true, message: "Please enter SAP client code" },
                ]}
              >
                <Input placeholder="Enter SAP client code" />
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
              <Option value="Both">Both</Option>
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
                {selectedClient.name}
              </Title>
              <Tag color={selectedClient.status === "active" ? "green" : "red"}>
                {selectedClient.status}
              </Tag>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Client Code:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.code}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Email:</Text>
                  <Text style={{ display: "block", marginTop: "4px", wordBreak: "break-all" }}>
                    {selectedClient.email}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Contact Number:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.contactNo}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Contact Person:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.contactPerson}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>SAP Client Code:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.sapCode}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Client Type:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedClient.type}
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
              <Text strong>{clientToDelete.name}</Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ClientsManagement;
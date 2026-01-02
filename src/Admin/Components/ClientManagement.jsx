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
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  useAddClientMutation,
  useGetClientsQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useDisableClientMutation,
} from "../../Slices/Admin/AdminApis";
import SkeletonLoader from "../../Global/SkeletonLoader";
import PhoneInput from "../../Global/PhoneInput";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Title, Text } = Typography;
const { Option } = Select;

const ClientsManagement = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [addClient] = useAddClientMutation();
  const [updateClient] = useUpdateClientMutation();

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingClient, setEditingClient] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [clientToDisable, setClientToDisable] = useState(null);
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

  const [deleteClient] = useDeleteClientMutation();
  const [disableClient] = useDisableClientMutation();

  const showCreateModal = () => {
    setModalMode("create");
    setEditingClient(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const showEditModal = (client) => {
    setModalMode("edit");
    setEditingClient(client);

    console.log("Client data:", client);
    console.log("Client Code:", client.clientCode);

    // Use stored country code if available, otherwise extract
    let contactNo = client.phone || "";
    let contactNoCountryCode = client.phoneCountryCode || "";
    
    if (contactNo && !contactNoCountryCode) {
      // Only extract if country code is not stored
      let phoneWithoutPlus = contactNo.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      
      const parsed = phoneUtils.parsePhoneNumber(phoneWithoutPlus);
      if (parsed.countryCode && parsed.phoneNumber) {
        contactNoCountryCode = parsed.countryCode;
        contactNo = parsed.phoneNumber;
      } else {
        contactNoCountryCode = "91"; // Default
      }
    } else if (contactNo && contactNoCountryCode) {
      // If we have stored country code, remove it from phone if present
      let phoneWithoutPlus = contactNo.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
      if (cleanPhone.startsWith(contactNoCountryCode)) {
        contactNo = cleanPhone.slice(contactNoCountryCode.length);
      } else {
        contactNo = cleanPhone;
      }
    }

    form.setFieldsValue({
      name: client.fullName,
      code: client.clientCode || client.code,
      email: client.email,
      contactNo: contactNo,
      contactNoCountryCode: contactNoCountryCode || "91",
      contactPersonNumber: client.contactPersonMobile,
      sapCode: client.sapCode,
      type: client.clientType,
    });
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      // Clean phone number - remove + prefix if present
      const phoneNumber = values.contactNo ? values.contactNo.replace(/^\+/, "").replace(/\D/g, "") : "";
      const countryCode = values.contactNoCountryCode || "91";

      if (modalMode === "create") {
        const payload = {
          name: values.name,
          code: values.code,
          email: values.email,
          contactNo: phoneNumber, // Phone number without country code
          contactNoCountryCode: countryCode, // Country code sent separately
          contactPersonNumber: values.contactPersonNumber,
          sapCode: values.sapCode,
          type: values.type,
        };
        await addClient(payload).unwrap();
        enqueueSnackbar("Client created successfully", { variant: "success" });
      } else {
        const payload = {
          name: values.name,
          code: values.code,
          email: values.email,
          contactNo: phoneNumber, // Phone number without country code
          contactNoCountryCode: countryCode, // Country code sent separately
          contactPersonNumber: values.contactPersonNumber,
          sapCode: values.sapCode,
          type: values.type,
        };
        await updateClient({
          clientId: editingClient._id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Client updated successfully", { variant: "success" });
      }
      setIsFormModalVisible(false);
      form.resetFields();
      refetchClients();
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

  const handleDeleteConfirm = async () => {
    try {
      await deleteClient(clientToDelete._id).unwrap();
      enqueueSnackbar("Client deleted successfully", { variant: "success" });
      setDeleteModalVisible(false);
      refetchClients();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || error?.message || "Failed to delete client",
        { variant: "error" }
      );
    }
  };

  const showDisableModal = (client) => {
    setClientToDisable(client);
    setDisableModalVisible(true);
  };

  const handleDisableConfirm = async () => {
    try {
      await disableClient(clientToDisable._id).unwrap();
      enqueueSnackbar(
        `Client ${
          clientToDisable.accountStatus === "active" ? "disabled" : "enabled"
        } successfully`,
        { variant: "success" }
      );
      setDisableModalVisible(false);
      refetchClients();
    } catch (error) {
      enqueueSnackbar(
        error.data?.message || error.message || "An error occurred",
        { variant: "error" }
      );
    }
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
        <div>
          <SkeletonLoader />
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
                      <Tooltip
                        title={
                          client.accountStatus === "active"
                            ? "Disable Client"
                            : "Enable Client"
                        }
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={
                            client.accountStatus === "active" ? (
                              <StopOutlined />
                            ) : (
                              <CheckOutlined />
                            )
                          }
                          onClick={() => showDisableModal(client)}
                          style={{
                            color:
                              client.accountStatus === "active"
                                ? "#faad14"
                                : "#52c41a",
                          }}
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

                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "12px" }}
                      >
                        <TagOutlined style={{ marginRight: 4 }} />
                        Created By:
                      </Text>
                      <div style={{ marginTop: 6 }}>
                        <Tag color="blue">
                          {client?.createdBy?.fullName
                            ? `${client.createdBy.fullName} (${client.createdBy.email})`
                            : client?.createdBy?.email}
                        </Tag>
                      </div>
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
              <PhoneInput
                form={form}
                name="contactNo"
                label="Phone Number"
                required={true}
              />
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
                    {selectedClient.clientCode}
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

      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#faad14" }}
          >
            <WarningOutlined style={{ marginRight: 8 }} />
            {clientToDisable?.accountStatus === "active"
              ? "Disable Client"
              : "Enable Client"}
          </div>
        }
        open={disableModalVisible}
        onCancel={() => setDisableModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDisableModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="disable"
            type="primary"
            danger={clientToDisable?.accountStatus === "active"}
            onClick={handleDisableConfirm}
          >
            {clientToDisable?.accountStatus === "active" ? "Disable" : "Enable"}
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "500px" }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>
            Are you sure you want to{" "}
            {clientToDisable?.accountStatus === "active" ? "disable" : "enable"}{" "}
            this client?
          </Text>
          {clientToDisable && (
            <div style={{ marginTop: "16px" }}>
              <Text strong>{clientToDisable.fullName}</Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ClientsManagement;

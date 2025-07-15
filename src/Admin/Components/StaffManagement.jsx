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
  SolutionOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useAddStaffMutation } from "../../Slices/Admin/AdminApis";

const { Title, Text } = Typography;
const { Option } = Select;

const StaffManagement = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [addStaff] = useAddStaffMutation();

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();

  // Mock data - replace with your actual API calls
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "John Smith",
      staffType: "Project Manager",
      email: "john.smith@example.com",
      contactNo: "9876543210",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      staffType: "Driver",
      email: "sarah.johnson@example.com",
      contactNo: "8765432109",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Davis",
      staffType: "Outside Co-ordinator",
      email: "mike.davis@example.com",
      contactNo: "7654321098",
      status: "inactive",
    },
    {
      id: 4,
      name: "Lisa Brown",
      staffType: "Camp Admin",
      email: "lisa.brown@example.com",
      contactNo: "6543210987",
      status: "active",
    },
    {
      id: 5,
      name: "Tom Wilson",
      staffType: "Pro",
      email: "tom.wilson@example.com",
      contactNo: "5432109876",
      status: "active",
    },
  ]);

  const showCreateModal = () => {
    setModalMode("create");
    setEditingStaff(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const showEditModal = (staffMember) => {
    setModalMode("edit");
    setEditingStaff(staffMember);
    form.setFieldsValue(staffMember);
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (modalMode === "create") {
        const payload = {
        ...values,
        role: "staff" // Static role value
      };
        await addStaff(payload).unwrap();
        enqueueSnackbar("Staff member added successfully", {
          variant: "success",
        });
      } else {
        await updateStaff({ id: editingStaff.id, ...values }).unwrap();
        enqueueSnackbar("Staff member updated successfully", {
          variant: "success",
        });
      }
      setIsFormModalVisible(false);
    } catch (error) {
      enqueueSnackbar(error.data?.message || "An error occurred", {
        variant: "error",
      });
    }
  };

  const showDeleteModal = (staffMember) => {
    setStaffToDelete(staffMember);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    setStaff(staff.filter((s) => s.id !== staffToDelete.id));
    enqueueSnackbar("Staff member deleted successfully", {
      variant: "success",
    });
    setDeleteModalVisible(false);
  };

  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setViewModalVisible(true);
  };

  // Filter staff based on search term
  const filteredStaff = staff.filter(
    (staffMember) =>
      staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.staffType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (staffType) => {
    switch (staffType) {
      case "Driver":
        return "blue";
      case "Outside Co-ordinator":
        return "orange";
      case "Camp Admin":
        return "green";
      case "Pro":
        return "purple";
      case "Project Manager":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <>
      <div className="staff-header">
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
            <SolutionOutlined
              style={{ marginRight: "8px", color: "#2c3e50", fontSize: "20px" }}
            />
            <Title
              level={2}
              className="staff-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}
            >
              Staff Management
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
              placeholder="Search Staff"
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
              className="staff-button"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                height: "48px",
                minWidth: "180px",
              }}
            >
              Add New Staff
            </Button>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        {filteredStaff.length === 0 ? (
          <Col span={24}>
            <Empty
              description="No staff members found"
              style={{ padding: "40px 0" }}
            />
          </Col>
        ) : (
          filteredStaff.map((staffMember) => (
            <Col
              key={staffMember.id}
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
                      {staffMember.name}
                    </Text>
                    <Tag
                      color={staffMember.status === "active" ? "green" : "red"}
                      style={{ margin: 0 }}
                    >
                      {staffMember.status}
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
                        onClick={() => handleViewStaff(staffMember)}
                      />
                    </Tooltip>
                    <Tooltip title="Edit Staff">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(staffMember)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete Staff">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteModal(staffMember)}
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
                    <SolutionOutlined
                      style={{ color: "#8c8c8c", fontSize: "14px" }}
                    />
                    <Tag
                      color={getRoleColor(staffMember.staffType)}
                      style={{ margin: 0 }}
                    >
                      {staffMember.staffType}
                    </Tag>
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
                      {staffMember.email}
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
                    <Text style={{ fontSize: "14px" }}>
                      {staffMember.contactNo}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Staff Form Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            {modalMode === "create" ? "Add New Staff" : "Edit Staff"}
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
            {modalMode === "create" ? "Add Staff" : "Update Staff"}
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
          initialValues={editingStaff || {}}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Staff Name"
                rules={[{ required: true, message: "Please enter staff name" }]}
              >
                <Input placeholder="Enter staff name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="staffType"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  <Option value="Driver">Driver</Option>
                  <Option value="Outside Co-ordinator">
                    Outside Co-ordinator
                  </Option>
                  <Option value="Camp Admin">Camp Admin</Option>
                  <Option value="Pro">Pro</Option>
                  <Option value="Project Manager">Project Manager</Option>
                </Select>
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
        </Form>
      </Modal>

      {/* View Staff Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Staff Details
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
        {selectedStaff && (
          <div style={{ padding: "16px 0" }}>
            <div style={{ marginBottom: "24px" }}>
              <Title level={4} style={{ marginBottom: "8px" }}>
                {selectedStaff.name}
              </Title>
              <Tag color={selectedStaff.status === "active" ? "green" : "red"}>
                {selectedStaff.status}
              </Tag>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Role:</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Tag color={getRoleColor(selectedStaff.staffType)}>
                      {selectedStaff.staffType}
                    </Tag>
                  </div>
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
                    {selectedStaff.email}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Contact Number:</Text>
                  <Text style={{ display: "block", marginTop: "4px" }}>
                    {selectedStaff.contactNo}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Status:</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Tag
                      color={
                        selectedStaff.status === "active" ? "green" : "red"
                      }
                    >
                      {selectedStaff.status}
                    </Tag>
                  </div>
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
            Delete Staff
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
          <Text>Are you sure you want to delete this staff member?</Text>
          {staffToDelete && (
            <div style={{ marginTop: "16px" }}>
              <Text strong>{staffToDelete.name}</Text>
              <br />
              <Text type="secondary">{staffToDelete.staffType}</Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default StaffManagement;

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
  SolutionOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  StopOutlined,
  TagOutlined
} from "@ant-design/icons";
import {
  useAddStaffMutation,
  useGetStaffsQuery,
  useEditStaffMutation,
  useDeleteStaffMutation,
  useDisableStaffMutation,
} from "../../Slices/Admin/AdminApis";
import SkeletonLoader from "../../Global/SkeletonLoader";
import PhoneInput from "../../Global/PhoneInput";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Title, Text } = Typography;
const { Option } = Select;

const StaffManagement = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [addStaff] = useAddStaffMutation();
  const [editStaff] = useEditStaffMutation();

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [staffToDisable, setStaffToDisable] = useState(null);
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
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: staffsData,
    isLoading: isLoadingStaffs,
    refetch: refetchStaffs,
    error: staffsError,
  } = useGetStaffsQuery({
    searchTerm: debouncedSearchTerm,
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const [deleteStaff] = useDeleteStaffMutation();
  const [disableStaff] = useDisableStaffMutation();

  const staffs = staffsData?.staffs || [];

  const showCreateModal = () => {
    setModalMode("create");
    setEditingStaff(null);
    form.resetFields();
    setIsFormModalVisible(true);
  };

  const showEditModal = (staffMember) => {
    setModalMode("edit");
    setEditingStaff(staffMember);
    
    // Extract country code from phone number if present
    let contactNo = staffMember.phone || "";
    let contactNoCountryCode = "";
    
    if (contactNo) {
      // Remove + prefix if present
      let phoneWithoutPlus = contactNo.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      
      // Use phoneUtils to extract country code
      const parsed = phoneUtils.parsePhoneNumber(phoneWithoutPlus);
      if (parsed.countryCode && parsed.phoneNumber) {
        contactNoCountryCode = parsed.countryCode;
        contactNo = parsed.phoneNumber;
      }
    }
    
    const formValues = {
      name: staffMember.fullName,
      staffType: staffMember.staffType,
      email: staffMember.email,
      contactNo: contactNo,
      contactNoCountryCode: contactNoCountryCode || "91", // Default to 91 if not extracted
    };
    form.setFieldsValue(formValues);
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      const countryCode = values.contactNoCountryCode || "91";
      const phoneNumber = values.contactNo || "";
      // Remove any + prefix if present and save without it
      const cleanPhoneNumber = phoneNumber.replace(/^\+/, "").replace(/\D/g, "");
      const fullPhoneNumber = `${countryCode}${cleanPhoneNumber}`;

      if (modalMode === "create") {
        const payload = {
          name: values.name,
          staffType: values.staffType,
          email: values.email,
          contactNo: fullPhoneNumber, // Country code + phone number without + prefix
          role: "staff",
        };
        await addStaff(payload).unwrap();
        enqueueSnackbar("Staff member added successfully", {
          variant: "success",
        });
      } else {
        const payload = {
          name: values.name,
          staffType: values.staffType,
          email: values.email,
          contactNo: fullPhoneNumber, // Country code + phone number without + prefix
        };
        await editStaff({
          staffId: editingStaff._id,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Staff member updated successfully", {
          variant: "success",
        });
      }
      setIsFormModalVisible(false);
      refetchStaffs();
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

  const handleDeleteConfirm = async () => {
    try {
      await deleteStaff(staffToDelete._id).unwrap();
      enqueueSnackbar("Staff member deleted successfully", {
        variant: "success",
      });
      setDeleteModalVisible(false);
      refetchStaffs();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || error?.message || "Failed to delete staff member",
        { variant: "error" }
      );
    }
  };

  const showDisableModal = (staff) => {
    setStaffToDisable(staff);
    setDisableModalVisible(true);
  };

  const handleDisableConfirm = async () => {
    try {
      await disableStaff(staffToDisable._id).unwrap();
      enqueueSnackbar(
        `Staff ${
          staffToDisable.accountStatus === "active" ? "disabled" : "enabled"
        } successfully`,
        { variant: "success" }
      );
      setDisableModalVisible(false);
      refetchStaffs();
    } catch (error) {
      enqueueSnackbar(
        error.data?.message || error.message || "An error occurred",
        { variant: "error" }
      );
    }
  };

  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setViewModalVisible(true);
  };

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

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize: pageSize,
    });
  };

  if (isLoadingStaffs) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  if (staffsError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Text type="danger">Error loading staff data</Text>
      </div>
    );
  }

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
              loading={isLoadingStaffs}
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
        {staffs.length === 0 ? (
          <Col span={24}>
            <Empty
              description="No staff members found"
              style={{ padding: "40px 0" }}
            />
          </Col>
        ) : (
          staffs.map((staffMember) => (
            <Col
              key={staffMember._id}
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
                      {staffMember.fullName}
                    </Text>
                    <Tag
                      color={
                        staffMember.accountStatus === "active" ? "green" : "red"
                      }
                      style={{ margin: 0 }}
                    >
                      {staffMember.accountStatus}
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
                    <Tooltip
                      title={
                        staffMember.accountStatus === "active"
                          ? "Disable Staff"
                          : "Enable Staff"
                      }
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={
                          staffMember.accountStatus === "active" ? (
                            <StopOutlined />
                          ) : (
                            <CheckOutlined />
                          )
                        }
                        onClick={() => showDisableModal(staffMember)}
                        style={{
                          color:
                            staffMember.accountStatus === "active"
                              ? "#faad14"
                              : "#52c41a",
                        }}
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
                      {staffMember.phone}
                    </Text>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ color: "#2c3e50", fontSize: "12px" }}>
                      <TagOutlined style={{ marginRight: 4 }} />
                      Created By:
                    </Text>
                    <div style={{ marginTop: 6 }}>
                      <Tag color="blue">
                        {staffMember?.createdBy?.fullName
                          ? `${staffMember.createdBy.fullName} (${staffMember.createdBy.email})`
                          : staffMember?.createdBy?.email || "N/A"}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Pagination */}
      {staffs.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "24px",
          }}
        >
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={staffsData?.total || staffs.length}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>
      )}

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
              <PhoneInput
                form={form}
                name="contactNo"
                label="Contact Number"
                required={true}
              />
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
                {selectedStaff.fullName}
              </Title>
              <Tag
                color={
                  selectedStaff.accountStatus === "active" ? "green" : "red"
                }
              >
                {selectedStaff.accountStatus}
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
                    {selectedStaff.phone}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong>Status:</Text>
                  <div style={{ marginTop: "4px" }}>
                    <Tag
                      color={
                        selectedStaff.accountStatus === "active"
                          ? "green"
                          : "red"
                      }
                    >
                      {selectedStaff.accountStatus}
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
              <Text strong>{staffToDelete.fullName}</Text>
              <br />
              <Text type="secondary">{staffToDelete.staffType}</Text>
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
            {staffToDisable?.accountStatus === "active"
              ? "Disable Staff"
              : "Enable Staff"}
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
            danger={staffToDisable?.accountStatus === "active"}
            onClick={handleDisableConfirm}
          >
            {staffToDisable?.accountStatus === "active" ? "Disable" : "Enable"}
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "500px" }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>
            Are you sure you want to{" "}
            {staffToDisable?.accountStatus === "active" ? "disable" : "enable"}{" "}
            this staff member?
          </Text>
          {staffToDisable && (
            <div style={{ marginTop: "16px" }}>
              <Text strong>{staffToDisable.fullName}</Text>
              <br />
              <Text type="secondary">{staffToDisable.staffType}</Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default StaffManagement;

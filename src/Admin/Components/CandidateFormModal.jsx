import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TrophyOutlined,
  TeamOutlined,
  LockOutlined,
  BookOutlined,
  StarOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  useAddCandidateMutation,
  useEditCandidateMutation,
  useGetClientsQuery,
} from "../../Slices/Admin/AdminApis.js";
import { useSnackbar } from "notistack";

const { Option } = Select;
const { TextArea } = Input;

const CandidateFormModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  editingCandidate,
}) => {
  const [addCandidate, { isLoading: isAdding }] = useAddCandidateMutation();
  const [editCandidate, { isLoading: isEditing }] = useEditCandidateMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: clientsData } = useGetClientsQuery({
    includePagination: false,
  });

  const activeSuppliers =
    clientsData?.clients?.filter(
      (client) =>
        client.accountStatus === "active" && client.clientType === "Supplier"
    ) || [];

  const isEditMode = !!editingCandidate;
  const isLoading = isAdding || isEditing;

  useEffect(() => {
    if (visible) {
      if (isEditMode && editingCandidate) {
        // Pre-populate form with existing candidate data
        const [firstName, ...lastNameParts] =
          editingCandidate.fullName.split(" ");
        const lastName = lastNameParts.join(" ");

        form.setFieldsValue({
          firstName: firstName || "",
          lastName: lastName || "",
          email: editingCandidate.email || "",
          phone: editingCandidate.phone || "",
          companyName: editingCandidate.companyName || "",
          specialization: editingCandidate.specialization || "",
          experience: editingCandidate.experience || "",
          qualifications: editingCandidate.qualifications || "",
          supplierId: editingCandidate.supplierId || undefined, // Add supplierId
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, form, isEditMode, editingCandidate]);

  const handleSubmit = async (values) => {
    try {
      const { confirmPassword, firstName, lastName, ...payload } = values;

      const fullName = `${firstName} ${lastName}`.trim();

      if (isEditMode) {
        const editPayload = {
          ...payload,
          fullName,
        };

        if (!payload.password) {
          delete editPayload.password;
        }

        await editCandidate({
          id: editingCandidate._id,
          candidateData: editPayload,
        }).unwrap();

        enqueueSnackbar("Candidate updated successfully!", {
          variant: "success",
        });
      } else {
        const createPayload = {
          ...payload,
          fullName,
          role: "candidate",
        };

        await addCandidate(createPayload).unwrap();
        enqueueSnackbar("Candidate created successfully!", {
          variant: "success",
        });
      }

      if (onSubmit) {
        onSubmit(values);
      }

      onCancel();
      form.resetFields();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} candidate:`,
        error
      );
      enqueueSnackbar(
        error?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } candidate. Please try again.`,
        { variant: "error" }
      );
    }
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");

    if (isEditMode && !password && !value) {
      return Promise.resolve();
    }

    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match!"));
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            {isEditMode ? "Edit Candidate" : "Add New Candidate"}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width="90%"
      style={{ maxWidth: 800 }}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel} size="large">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          size="large"
          loading={isLoading}
          style={{
            background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          {isEditMode ? "Update Candidate" : "Create Candidate"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ padding: "16px 0" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email address"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter phone number"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="Enter current/previous company"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Specialization"
              name="specialization"
              rules={[
                { required: true, message: "Please enter specialization" },
              ]}
            >
              <Input
                prefix={<StarOutlined />}
                placeholder="e.g., React.js, Node.js, Python"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Input placeholder="Enter work experience." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Qualifications"
              name="qualifications"
              rules={[
                { required: true, message: "Please enter qualifications" },
              ]}
            >
              <Input
                rows={3}
                placeholder="Enter educational qualifications, certifications, degrees, etc."
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Add Supplier Field */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Supplier (Optional)"
              name="supplierId"
              help="Select a supplier if this candidate is associated with one"
            >
              <Select
                placeholder={
                  clientsData ? "Select a supplier" : "Loading suppliers..."
                }
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={!clientsData}
                notFoundContent={
                  activeSuppliers.length === 0
                    ? "No active suppliers available"
                    : null
                }
              >
                {activeSuppliers.map((supplier) => (
                  <Option
                    key={supplier._id}
                    value={supplier._id}
                    title={supplier.fullName || supplier.companyName}
                  >
                    {supplier.fullName ||
                      supplier.companyName ||
                      `Supplier (ID: ${supplier._id})`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={isEditMode ? "New Password (Optional)" : "Password"}
              name="password"
              rules={[
                {
                  required: !isEditMode,
                  message: "Please enter password",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={
                  isEditMode
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={isEditMode ? "Confirm New Password" : "Confirm Password"}
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: !isEditMode && form.getFieldValue("password"),
                  message: "Please confirm password",
                },
                { validator: validateConfirmPassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CandidateFormModal;

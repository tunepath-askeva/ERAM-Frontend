import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Table,
  Space,
  Tag,
  message,
  Divider,
  InputNumber,
  Modal,
  Spin,
} from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetClientsQuery,
  useSubmitRequisitionMutation,
  useGetProjectsQuery,
  useGetAllRecruitersQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const { TextArea } = Input;
const { Option } = Select;

const AddRequisition = ({ onNavigateBack }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [requisitions, setRequisitions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [commonFields, setCommonFields] = useState({
    client: null,
    project: null,
    requisitionNo: "",
    referenceNo: "",
    assignedRecruiters: [],
    approvalRecruiter: [],
  });

  const { data: clientData } = useGetClientsQuery();
  const { data: projectData } = useGetProjectsQuery();
  const { data: recruiterData } = useGetAllRecruitersQuery();

  const [createRequisition] = useSubmitRequisitionMutation();

  const projects =
    projectData?.projects?.map((proj) => ({
      id: proj._id,
      name: proj.projectName || proj.name,
    })) || [];

  const clients =
    clientData?.clients?.map((client) => ({
      id: client._id,
      name: client.fullName,
      email: client.email,
    })) || [];

  const recruiters = recruiterData?.otherRecruiters || [];

  useEffect(() => {
    form.setFieldsValue(commonFields);
  }, [commonFields, form]);

  const handleCommonFieldChange = (field, value) => {
    setCommonFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRequisition = async () => {
    try {
      const values = await form.validateFields();

      const newRequisition = {
        ...values,
        key: editingIndex !== null ? editingIndex : Date.now(),
        id: editingIndex !== null ? requisitions[editingIndex].id : Date.now(),
        startDate: values.startDate
          ? dayjs(values.startDate).toISOString()
          : null,
        endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
        deadlineDate: values.deadlineDate
          ? dayjs(values.deadlineDate).toISOString()
          : null,
        alertDate: values.alertDate
          ? dayjs(values.alertDate).toISOString()
          : null,
      };

      if (editingIndex !== null) {
        const updatedRequisitions = [...requisitions];
        updatedRequisitions[editingIndex] = newRequisition;
        setRequisitions(updatedRequisitions);
        setEditingIndex(null);
        message.success("Requisition updated successfully");
      } else {
        setRequisitions((prev) => [...prev, newRequisition]);
        message.success("Requisition added to batch");
      }

      form.resetFields();
      form.setFieldsValue(commonFields);
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Please fill all required fields before adding",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const handleNavigateBack = () => {
    navigate("/recruiter/requisition");
  };

  const handleEditRequisition = (index) => {
    const requisition = requisitions[index];
    form.setFieldsValue({
      ...requisition,
      startDate: requisition.startDate ? dayjs(requisition.startDate) : null,
      endDate: requisition.endDate ? dayjs(requisition.endDate) : null,
      deadlineDate: requisition.deadlineDate
        ? dayjs(requisition.deadlineDate)
        : null,
      alertDate: requisition.alertDate ? dayjs(requisition.alertDate) : null,
    });
    setEditingIndex(index);
  };

  const handleDeleteRequisition = (index) => {
    setDeleteIndex(index);
    setIsDeleteModalVisible(true);
  };

  const confirmDeleteRequisition = () => {
    const updatedRequisitions = requisitions.filter(
      (_, i) => i !== deleteIndex
    );
    setRequisitions(updatedRequisitions);
    message.success("Requisition removed from batch");

    if (editingIndex === deleteIndex) {
      form.resetFields();
      form.setFieldsValue(commonFields);
      setEditingIndex(null);
    }

    setDeleteIndex(null);
    setIsDeleteModalVisible(false);
  };

  const cancelDeleteRequisition = () => {
    setDeleteIndex(null);
    setIsDeleteModalVisible(false);
  };

  const handleFinalSubmit = async () => {
    if (requisitions.length === 0) {
      message.error("Please add at least one requisition before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const requisitionsData = requisitions.map((req) => ({
        ...req,
        startDate: req.startDate ? dayjs(req.startDate).toISOString() : null,
        endDate: req.endDate ? dayjs(req.endDate).toISOString() : null,
        deadlineDate: req.deadlineDate
          ? dayjs(req.deadlineDate).toISOString()
          : null,
        alertDate: req.alertDate ? dayjs(req.alertDate).toISOString() : null,
      }));

      await createRequisition({ requisition: requisitionsData }).unwrap();

      message.success(
        `${requisitions.length} requisitions created successfully`
      );
      handleNavigateBack();
    } catch (error) {
      console.error("Error creating requisitions:", error);
      message.error("Failed to create requisitions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Employment Type",
      dataIndex: "EmploymentType",
      key: "EmploymentType",
      width: 120,
      render: (type) => (
        <Tag
          color={
            type === "full-time"
              ? "green"
              : type === "part-time"
              ? "blue"
              : "orange"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Experience",
      key: "experience",
      render: (_, record) =>
        `${record.experienceMin || 0} - ${record.experienceMax || 0} years`,
      width: 120,
    },
    {
      title: "Salary",
      key: "salary",
      render: (_, record) => {
        if (!record.salaryMin && !record.salaryMax) return "N/A";
        const currency = record.salaryType === "annual" ? "SAR " : "";
        const suffix =
          {
            hourly: "/hr",
            daily: "/day",
            weekly: "/wk",
            monthly: "/mo",
            annual: "/yr",
          }[record.salaryType] || "";
        return `${currency}${record.salaryMin || 0} - ${
          record.salaryMax || 0
        }${suffix}`;
      },
      width: 150,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      width: 120,
    },
    {
      title: "Assigned Recruiter",
      dataIndex: "assignedRecruiters",
      key: "assignedRecruiters",
      render: (recruiterIds) => {
        if (!Array.isArray(recruiterIds) || recruiterIds.length === 0)
          return "N/A";
        return recruiterIds
          .map((recruiterId) => {
            const recruiter = recruiters.find((r) => r._id === recruiterId);
            return recruiter ? recruiter.fullName : "Unknown";
          })
          .join(", ");
      },
      width: 150,
    },
    {
      title: "Approval Recruiter",
      dataIndex: "approvalRecruiter",
      key: "approvalRecruiter",
      render: (recruiterIds) => {
        if (!Array.isArray(recruiterIds) || recruiterIds.length === 0)
          return "N/A";
        return recruiterIds
          .map((recruiterId) => {
            const recruiter = recruiters.find((r) => r._id === recruiterId);
            return recruiter ? recruiter.fullName : "Unknown";
          })
          .join(", ");
      },
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleEditRequisition(index)}
            icon={<EditOutlined />}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteRequisition(index)}
            icon={<DeleteOutlined />}
            size="small"
          />
        </Space>
      ),
      width: 120,
      fixed: "right",
    },
  ];

  const customStyles = `
    .ant-btn-primary {
      background-color: #da2c46 !important;
      border-color: #da2c46 !important;
    }
    .ant-btn-primary:hover {
      background-color: #c2253d !important;
      border-color: #c2253d !important;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ padding: "8px 16px" }}>
        <Card
          title={
            <Space>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={handleNavigateBack}
              >
                Back
              </Button>
              Add New Requisitions
            </Space>
          }
        >
          <Form form={form} layout="vertical">
            {/* Common Fields Section */}
            <Card title="Common Information" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Client"
                    name="client"
                    rules={[
                      { required: true, message: "Please select a client" },
                    ]}
                  >
                    <Select
                      placeholder="Select Client"
                      onChange={(value) =>
                        handleCommonFieldChange("client", value)
                      }
                    >
                      {clients.map((client) => (
                        <Option key={client.id} value={client.id}>
                          {client.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Project" name="project">
                    <Select
                      placeholder="Select Project"
                      onChange={(value) =>
                        handleCommonFieldChange("project", value)
                      }
                      value={commonFields.project}
                    >
                      {projects.map((project) => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Requisition Number"
                    name="requisitionNo"
                    rules={[
                      {
                        required: true,
                        message: "Please enter requisition number",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter Requisition Number"
                      onChange={(e) =>
                        handleCommonFieldChange("requisitionNo", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Reference Number"
                    name="referenceNo"
                    rules={[
                      {
                        required: true,
                        message: "Please enter reference number",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter Reference Number"
                      onChange={(e) =>
                        handleCommonFieldChange("referenceNo", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Recruiter Assignment Section */}
            <Card
              type="inner"
              title="Recruiter Assignment"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="assignedRecruiters"
                    label="Assigned Recruiter"
                    rules={[
                      {
                        required: true,
                        message: "Please select an assigned recruiter",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select assigned recruiter"
                      onChange={(value) =>
                        handleCommonFieldChange("assignedRecruiters", value)
                      }
                    >
                      {recruiters.map((recruiter) => (
                        <Option key={recruiter._id} value={recruiter._id}>
                          {recruiter.fullName} ({recruiter.email})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="approvalRecruiter"
                    label="Approval Recruiter"
                    rules={[
                      {
                        required: true,
                        message: "Please select an approval recruiter",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select approval recruiter"
                      onChange={(value) =>
                        handleCommonFieldChange("approvalRecruiter", value)
                      }
                    >
                      {recruiters.map((recruiter) => (
                        <Option key={recruiter._id} value={recruiter._id}>
                          {recruiter.fullName} ({recruiter.email})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider />

            {/* Requisition Details Section */}
            <Card
              title="Requisition Details"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Job Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter job title" },
                    ]}
                  >
                    <Input placeholder="Enter Job Title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Employment Type"
                    name="EmploymentType"
                    rules={[
                      {
                        required: true,
                        message: "Please select employment type",
                      },
                    ]}
                    initialValue="full-time"
                  >
                    <Select
                      placeholder="Select Employment Type"
                      defaultValue="full-time"
                    >
                      <Option value="full-time">Full Time</Option>
                      <Option value="part-time">Part Time</Option>
                      <Option value="contract">Contract</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Workplace"
                    name="workplace"
                    initialValue="on-site"
                  >
                    <Select
                      placeholder="Select Workplace"
                      defaultValue="on-site"
                    >
                      <Option value="on-site">Onsite</Option>
                      <Option value="offshore">Offshore</Option>
                      <Option value="remote">Remote</Option>
                      <Option value="hybrid">Hybrid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Office Location" name="officeLocation">
                    <Input placeholder="Enter Office Location" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Job Function" name="jobFunction">
                    <Input placeholder="Enter Job Function" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Industry" name="companyIndustry">
                    <Input placeholder="Enter Industry" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Min Experience (Years)"
                    name="experienceMin"
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Max Experience (Years)"
                    name="experienceMax"
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="Education" label="Education Requirement">
                    <Select placeholder="Select education level">
                      <Option value="high-school">High School</Option>
                      <Option value="associate">Associate Degree</Option>
                      <Option value="bachelor">Bachelor's Degree</Option>
                      <Option value="master">Master's Degree</Option>
                      <Option value="phd">PhD</Option>
                      <Option value="none">None</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Salary Type"
                    name="salaryType"
                    initialValue="monthly"
                  >
                    <Select
                      placeholder="Select Salary Type"
                      defaultValue="monthly"
                    >
                      <Option value="hourly">Hourly</Option>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="annual">Annual</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Min Salary" name="salaryMin">
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Max Salary" name="salaryMax">
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Number of Candidates"
                    name="numberOfCandidate"
                  >
                    <InputNumber
                      min={1}
                      placeholder="1"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Start Date" name="startDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="End Date" name="endDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Application Deadline" name="deadlineDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Alert Date" name="alertDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Required Skills" name="requiredSkills">
                    <Select mode="tags" placeholder="Enter Skills"></Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Languages Required"
                    name="languagesRequired"
                  >
                    <Select mode="tags" placeholder="Enter Languages"></Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Nationality"
                    name="nationality"
                    rules={[
                      { required: true, message: "Please enter nationality" },
                    ]}
                  >
                    <Input placeholder="Enter Nationality" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="visacategory" label="Visa Category">
                    <Input placeholder="Enter Visa Category" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="visacategorytype"
                    label="Visa Category Type"
                    rules={[
                      {
                        required: true,
                        message: "Please select visa category type",
                      },
                    ]}
                    initialValue="any"
                  >
                    <Select
                      placeholder="Select visa category type"
                      defaultValue="any"
                    >
                      <Option value="any">Any</Option>
                      <Option value="relative">Relative</Option>
                      <Option value="same">Same</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Job Description" name="description">
                    <TextArea rows={3} placeholder="Enter Job Description" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Key Responsibilities"
                    name="keyResponsibilities"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Enter Key Responsibilities"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Qualifications" name="qualification">
                    <TextArea rows={3} placeholder="Enter Qualifications" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Job Requirements" name="jobRequirements">
                    <TextArea rows={3} placeholder="Enter Job Requirements" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Benefits" name="benefits">
                    <TextArea rows={2} placeholder="Enter Benefits" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Status" name="isActive">
                    <Select placeholder="Select Status">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="draft">Draft</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={handleAddRequisition}
                icon={<PlusOutlined />}
                size="large"
              >
                {editingIndex !== null ? "Update Requisition" : "Add to Batch"}
              </Button>
            </div>
          </Form>

          {/* Requisitions Table */}
          {requisitions.length > 0 && (
            <Card
              title={`Added Requisitions (${requisitions.length})`}
              size="small"
              style={{ marginTop: 16 }}
            >
              <Table
                columns={columns}
                dataSource={requisitions}
                rowKey="key"
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
              />

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button
                  type="primary"
                  onClick={handleFinalSubmit}
                  loading={isSubmitting}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Submit All Requisitions ({requisitions.length})
                </Button>
              </div>
            </Card>
          )}
        </Card>

        <Modal
          title="Are you sure?"
          open={isDeleteModalVisible}
          onOk={confirmDeleteRequisition}
          onCancel={cancelDeleteRequisition}
          okText="Yes, Delete"
          cancelText="Cancel"
        >
          <p>Do you want to remove this requisition from the batch?</p>
        </Modal>
      </div>
    </>
  );
};

export default AddRequisition;

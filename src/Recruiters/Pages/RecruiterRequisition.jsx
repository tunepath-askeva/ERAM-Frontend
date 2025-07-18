import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  message,
  Tag,
  DatePicker,
  InputNumber,
  Table,
  Modal,
  Spin,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  UserOutlined,
  LoadingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useSubmitRequisitionMutation,
  useGetClientsQuery,
  useGetRequisitionsQuery,
  useEditRequisitionMutation,
  useDeleteRequisitionMutation,
} from "../../Slices/Recruiter/RecruiterApis";

const { TextArea } = Input;
const { Option } = Select;

const RecruiterRequisition = () => {
  const [form] = Form.useForm();
  const [requisitions, setRequisitions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingRequisition, setEditingRequisition] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [requisitionToDelete, setRequisitionToDelete] = useState(null);

  const { data: clientData, isLoading: clientsLoading } = useGetClientsQuery();
  const {
    data: requisitionData,
    isLoading: requisitionsLoading,
    refetch,
  } = useGetRequisitionsQuery();

  const [submitRequisition] = useSubmitRequisitionMutation();
  const [editRequisition] = useEditRequisitionMutation();
  const [deleteRequisition, { isLoading: isDeleting }] =
    useDeleteRequisitionMutation();

  const clients =
    clientData?.clients?.map((client) => ({
      id: client._id,
      name: client.fullName,
      email: client.email,
    })) || [];

  // Update local state when API data changes
  useEffect(() => {
    if (requisitionData?.requisition) {
      const formattedRequisitions = requisitionData.requisition.map(
        (req, index) => ({
          ...req,
          key: req._id || index,
          status: req.isActive || "draft",
        })
      );
      setRequisitions(formattedRequisitions);
    }
  }, [requisitionData]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const clientObj = clients.find((c) => c.id === selectedClient);
      const formattedValues = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
        alertDate: values.alertDate?.format("YYYY-MM-DD"),
        client: selectedClient,
        clientName: clientObj?.name,
        clientEmail: clientObj?.email,
        isActive: values.isActive || "inactive",
        numberOfCandidate: values.numberOfCandidate || 1,
      };

      // Check if editing or creating
      if (editingRequisition) {
        await editRequisition({
          id: editingRequisition._id,
          ...formattedValues,
        }).unwrap();
        message.success("Requisition updated successfully");
      } else {
        await submitRequisition(formattedValues).unwrap();
        message.success("Requisition created successfully");
      }

      // Refetch data to get updated list
      refetch();

      form.resetFields();
      setSelectedClient(null);
      setEditingRequisition(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error submitting requisition:", error);
      if (error.status === 401) {
        message.error("Authentication failed. Please log in again.");
      } else if (error.status === 403) {
        message.error("You don't have permission to submit requisitions.");
      } else if (error.status === 400) {
        message.error("Invalid requisition data. Please check the form.");
      } else if (error.data?.message) {
        message.error(`Submission failed: ${error.data.message}`);
      } else {
        message.error("Failed to submit requisition. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRequisition(record);
    setSelectedClient(record.client);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      deadlineDate: record.deadlineDate ? dayjs(record.deadlineDate) : null,
      alertDate: record.alertDate ? dayjs(record.alertDate) : null,
      client: record.client,
      isActive: record.isActive,
      numberOfCandidate: record.numberOfCandidate,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRequisition(id).unwrap();
      message.success("Requisition deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting requisition:", error);
      if (error.status === 401) {
        message.error("Authentication failed. Please log in again.");
      } else if (error.status === 403) {
        message.error("You don't have permission to delete requisitions.");
      } else if (error.data?.message) {
        message.error(`Deletion failed: ${error.data.message}`);
      } else {
        message.error("Failed to delete requisition. Please try again.");
      }
    } finally {
      setIsDeleteModalVisible(false);
      setRequisitionToDelete(null);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRequisition(record);
    setIsDetailModalVisible(true);
  };

  const formatSalary = (record) => {
    if (
      !record.salaryMin &&
      record.salaryMin !== 0 &&
      !record.salaryMax &&
      record.salaryMax !== 0
    )
      return "N/A";
    const currency = record.salaryType === "annual" ? "SAR " : "";
    const suffix =
      {
        hourly: "/hr",
        weekly: "/wk",
        monthly: "/mo",
        annual: "/yr",
      }[record.salaryType] || "";

    return `${currency}${record.salaryMin || 0} - ${
      record.salaryMax || 0
    }${suffix}`;
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => {
        const clientObj = clients.find((c) => c.id === client);
        return clientObj?.name || "N/A";
      },
      width: 150,
    },
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
      render: (_, record) => formatSalary(record),
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
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "green"
              : status === "inactive"
              ? "red"
              : "default"
          }
        >
          {status || "Draft"}
        </Tag>
      ),
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleViewDetails(record)}
            icon={<EyeOutlined />}
            size="small"
          >
            View
          </Button>
          <Button type="link" onClick={() => handleEdit(record)} size="small">
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              setRequisitionToDelete(record._id);
              setIsDeleteModalVisible(true);
            }}
            icon={<DeleteOutlined />}
            size="small"
          />
        </Space>
      ),
      width: 150,
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
    .ant-btn-primary:focus {
      background-color: #c2253d !important;
      border-color: #c2253d !important;
    }
    .ant-btn-primary:active {
      background-color: #aa1f34 !important;
      border-color: #aa1f34 !important;
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ padding: "8px 16px" }}>
        <Card
          title="Client Requisitions"
          extra={
            <Button
              type="primary"
              onClick={() => setIsModalVisible(true)}
              icon={<PlusOutlined />}
              size="small"
            >
              Create New
            </Button>
          }
          size="small"
        >
          <Table
            columns={columns}
            dataSource={requisitions}
            loading={requisitionsLoading}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              responsive: true,
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        </Card>

        {/* Detail View Modal */}
        <Modal
          title={`Requisition Details - ${selectedRequisition?.title || "N/A"}`}
          visible={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
              Close
            </Button>,
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                setIsDetailModalVisible(false);
                handleEdit(selectedRequisition);
              }}
            >
              Edit
            </Button>,
          ]}
          width={800}
        >
          {selectedRequisition && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Client" span={2}>
                {clients.find((c) => c.id === selectedRequisition.client)
                  ?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Title">
                {selectedRequisition.title}
              </Descriptions.Item>
              <Descriptions.Item label="Employment Type">
                <Tag
                  color={
                    selectedRequisition.EmploymentType === "full-time"
                      ? "green"
                      : "blue"
                  }
                >
                  {selectedRequisition.EmploymentType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Workplace">
                {selectedRequisition.workplace}
              </Descriptions.Item>
              <Descriptions.Item label="Office Location">
                {selectedRequisition.officeLocation || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Function">
                {selectedRequisition.jobFunction}
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                {selectedRequisition.companyIndustry}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selectedRequisition.experienceMin} -{" "}
                {selectedRequisition.experienceMax} years
              </Descriptions.Item>
              <Descriptions.Item label="Salary">
                {formatSalary(selectedRequisition)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedRequisition.isActive === "active" ? "green" : "red"
                  }
                >
                  {selectedRequisition.isActive}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Number of Candidates">
                {selectedRequisition.numberOfCandidate}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {selectedRequisition.startDate
                  ? dayjs(selectedRequisition.startDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {selectedRequisition.endDate
                  ? dayjs(selectedRequisition.endDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Application Deadline">
                {selectedRequisition.deadlineDate
                  ? dayjs(selectedRequisition.deadlineDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Alert Date">
                {selectedRequisition.alertDate
                  ? dayjs(selectedRequisition.alertDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedRequisition.description}
              </Descriptions.Item>
              <Descriptions.Item label="Key Responsibilities" span={2}>
                {selectedRequisition.keyResponsibilities}
              </Descriptions.Item>
              <Descriptions.Item label="Qualifications" span={2}>
                {selectedRequisition.qualification}
              </Descriptions.Item>
              <Descriptions.Item label="Requirements" span={2}>
                {selectedRequisition.jobRequirements}
              </Descriptions.Item>
              <Descriptions.Item label="Required Skills" span={2}>
                {selectedRequisition.requiredSkills?.map((skill) => (
                  <Tag key={skill} color="blue">
                    {skill}
                  </Tag>
                )) || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Languages" span={2}>
                {selectedRequisition.languagesRequired?.map((lang) => (
                  <Tag key={lang} color="green">
                    {lang}
                  </Tag>
                )) || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Benefits" span={2}>
                {Array.isArray(selectedRequisition.benefits)
                  ? selectedRequisition.benefits.join(", ")
                  : selectedRequisition.benefits}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Create/Edit Modal */}
        <Modal
          title={
            editingRequisition ? "Edit Requisition" : "Create New Requisition"
          }
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setSelectedClient(null);
            setEditingRequisition(null);
          }}
          footer={null}
          width="90%"
          style={{
            maxWidth: 1200,
            height: "100vh",
            top: 20,
          }}
          bodyStyle={{
            height: "calc(100vh - 110px)",
            overflowY: "auto",
            padding: "16px",
          }}
        >
          <Spin spinning={isSubmitting}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                EmploymentType: "full-time",
                workplace: "remote",
                salaryType: "annual",
                isActive: "inactive",
                numberOfCandidate: 1,
              }}
              size="small"
            >
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    label="Client"
                    name="client"
                    rules={[
                      { required: true, message: "Please select a client" },
                    ]}
                  >
                    <Select
                      placeholder="Select client"
                      value={selectedClient}
                      onChange={setSelectedClient}
                      showSearch
                      optionFilterProp="children"
                      loading={clientsLoading}
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {clients.map((client) => (
                        <Option key={client.id} value={client.id}>
                          {client.name} ({client.email})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="title"
                    label="Job Title"
                    rules={[
                      { required: true, message: "Please enter job title" },
                    ]}
                  >
                    <Input placeholder="e.g. Senior Software Engineer" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="EmploymentType"
                    label="Employment Type"
                    rules={[
                      {
                        required: true,
                        message: "Please select employment type",
                      },
                    ]}
                  >
                    <Select placeholder="Select employment type">
                      <Option value="full-time">Full-time</Option>
                      <Option value="part-time">Part-time</Option>
                      <Option value="contract">Contract</Option>
                      <Option value="internship">Internship</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="workplace"
                    label="Workplace Type"
                    rules={[
                      {
                        required: true,
                        message: "Please select workplace type",
                      },
                    ]}
                  >
                    <Select placeholder="Select workplace type">
                      <Option value="remote">Remote</Option>
                      <Option value="hybrid">Hybrid</Option>
                      <Option value="on-site">On-site</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="officeLocation" label="Office Location">
                    <Input placeholder="e.g. City, Country" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="companyIndustry"
                    label="Industry"
                    rules={[
                      { required: true, message: "Please enter industry" },
                    ]}
                  >
                    <Input placeholder="e.g. Technology, Finance" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="jobFunction"
                    label="Job Function"
                    rules={[
                      { required: true, message: "Please enter job function" },
                    ]}
                  >
                    <Input placeholder="e.g. Software Development" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="experienceMin"
                    label="Minimum Experience (years)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter minimum experience",
                      },
                    ]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="experienceMax"
                    label="Maximum Experience (years)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter maximum experience",
                      },
                    ]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="numberOfCandidate"
                    label="Number of Candidates"
                    rules={[
                      {
                        required: true,
                        message: "Please enter number of candidates",
                      },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="salaryType"
                    label="Salary Type"
                    rules={[
                      { required: true, message: "Please select salary type" },
                    ]}
                  >
                    <Select placeholder="Select salary type">
                      <Option value="hourly">Hourly</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="annual">Annual</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="salaryMin" label="Minimum Salary">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="salaryMax" label="Maximum Salary">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="startDate" label="Start Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="endDate" label="End Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="deadlineDate" label="Application Deadline">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="alertDate" label="Alert Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="isActive" label="Status">
                    <Select placeholder="Select status">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="Job Description"
                    rules={[
                      {
                        required: true,
                        message: "Please enter job description",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Detailed job description..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="keyResponsibilities"
                    label="Key Responsibilities"
                    rules={[
                      {
                        required: true,
                        message: "Please enter key responsibilities",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="List of key responsibilities..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="jobRequirements"
                    label="Job Requirements"
                    rules={[
                      {
                        required: true,
                        message: "Please enter job requirements",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="List of job requirements..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="qualification"
                    label="Qualifications"
                    rules={[
                      {
                        required: true,
                        message: "Please enter qualifications",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Required qualifications..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item name="requiredSkills" label="Required Skills">
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Add skills"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item
                    name="languagesRequired"
                    label="Languages Required"
                  >
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Add languages"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Form.Item name="benefits" label="Benefits">
                    <TextArea rows={4} placeholder="Benefits..." />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: "16px 0" }} />

              <Form.Item>
                <Space>
                  <Button
                    onClick={() => {
                      setIsModalVisible(false);
                      form.resetFields();
                      setSelectedClient(null);
                      setEditingRequisition(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    {editingRequisition ? "Update" : "Add"} Requisition
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>

        <Modal
          title="Confirm Delete"
          visible={isDeleteModalVisible}
          onOk={() => handleDelete(requisitionToDelete)}
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setRequisitionToDelete(null);
          }}
          confirmLoading={isDeleting}
        >
          <p>Are you sure you want to delete this requisition?</p>
          <p>This action cannot be undone.</p>
        </Modal>
      </div>
    </>
  );
};

export default RecruiterRequisition;

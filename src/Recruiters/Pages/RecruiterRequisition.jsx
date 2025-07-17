import React, { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const RecruiterRequisition = () => {
  const [form] = Form.useForm();
  const [requisitions, setRequisitions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingRequisition, setEditingRequisition] = useState(null);

  // Mock clients data - replace with your actual data
  const clients = [
    { id: 1, name: "Client A", email: "clienta@example.com" },
    { id: 2, name: "Client B", email: "clientb@example.com" },
    { id: 3, name: "Client C", email: "clientc@example.com" },
  ];

  const handleSubmit = (values) => {
    const clientObj = clients.find(c => c.id === selectedClient);
    const formattedValues = {
      ...values,
      startDate: values.startDate?.format("YYYY-MM-DD"),
      endDate: values.endDate?.format("YYYY-MM-DD"),
      deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
      alertDate: values.alertDate?.format("YYYY-MM-DD"),
      client: clientObj,
    };

    if (editingRequisition) {
      // Update existing requisition
      setRequisitions(
        requisitions.map((req) =>
          req.key === editingRequisition.key ? formattedValues : req
        )
      );
      message.success("Requisition updated successfully");
    } else {
      // Add new requisition
      setRequisitions([
        ...requisitions,
        {
          ...formattedValues,
          key: Date.now(),
        },
      ]);
      message.success("Requisition added successfully");
    }

    form.resetFields();
    setSelectedClient(null);
    setEditingRequisition(null);
    setIsModalVisible(false);
  };

  const handleEdit = (record) => {
    setEditingRequisition(record);
    setSelectedClient(record.client?.id);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      deadlineDate: record.deadlineDate ? dayjs(record.deadlineDate) : null,
      alertDate: record.alertDate ? dayjs(record.alertDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (key) => {
    setRequisitions(requisitions.filter((req) => req.key !== key));
    message.success("Requisition deleted successfully");
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => client?.name || "N/A",
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
        return `${record.salaryType === "annual" ? "SAR- " : " "}${
          record.salaryMin
        } - ${record.salaryMax}${
          record.salaryType === "hourly"
            ? "/hr"
            : record.salaryType === "weekly"
            ? "/wk"
            : record.salaryType === "monthly"
            ? "/mo"
            : record.salaryType === "annual"
            ? "/yr"
            : ""
        }`;
      },
      width: 150,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.key)}
            icon={<DeleteOutlined />}
          />
        </Space>
      ),
      width: 120,
      fixed: 'right',
    },
  ];

  const submitAllRequisitions = () => {
    if (requisitions.length === 0) {
      message.warning("No requisitions to submit");
      return;
    }
    // Here you would typically send the requisitions to your backend
    console.log("Submitting all requisitions:", requisitions);
    message.success(`${requisitions.length} requisitions submitted successfully`);
    setRequisitions([]);
  };

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
            <Space wrap>
              <Button
                type="primary"
                onClick={() => setIsModalVisible(true)}
                icon={<PlusOutlined />}
                size="small"
              >
                Create New
              </Button>
              <Button
                type="primary"
                onClick={submitAllRequisitions}
                disabled={requisitions.length === 0}
                size="small"
              >
                Submit All
              </Button>
            </Space>
          }
          size="small"
        >
          <Table
            columns={columns}
            dataSource={requisitions}
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

        <Modal
          title={
            editingRequisition
              ? "Edit Requisition"
              : "Create New Requisition"
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
            height: '100vh',
            top: 20,
          }}
          bodyStyle={{
            height: 'calc(100vh - 110px)',
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              EmploymentType: "full-time",
              workplace: "remote",
              salaryType: "annual",
            }}
            size="small"
          >
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Form.Item
                  label="Client"
                  rules={[{ required: true, message: "Please select a client" }]}
                >
                  <Select
                    placeholder="Select client"
                    value={selectedClient}
                    onChange={setSelectedClient}
                    showSearch
                    optionFilterProp="children"
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
                    { required: true, message: "Please select workplace type" },
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
                  <Input placeholder="e.g. San Francisco, CA" />
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
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="companyIndustry"
                  label="Company Industry"
                  rules={[
                    {
                      required: true,
                      message: "Please enter company industry",
                    },
                  ]}
                >
                  <Input placeholder="e.g. Information Technology" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="experienceMin"
                  label="Min Experience (years)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter minimum experience",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: "100%" }}
                    placeholder="e.g. 3"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="experienceMax"
                  label="Max Experience (years)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter maximum experience",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: "100%" }}
                    placeholder="e.g. 5"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  name="salaryType"
                  label="Salary Type"
                  rules={[
                    { required: true, message: "Please select salary type" },
                  ]}
                >
                  <Select placeholder="Select salary type">
                    <Option value="annual">Annual</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="hourly">Hourly</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  name="salaryMin"
                  label="Min Salary"
                  rules={[
                    { required: true, message: "Please enter minimum salary" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="e.g. 50000"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Form.Item
                  name="salaryMax"
                  label="Max Salary"
                  rules={[
                    { required: true, message: "Please enter maximum salary" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="e.g. 80000"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="description"
                  label="Job Description"
                  rules={[
                    { required: true, message: "Please enter job description" },
                  ]}
                >
                  <TextArea rows={3} placeholder="Enter detailed job description" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
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
                  <TextArea rows={3} placeholder="Enter key responsibilities" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="qualification"
                  label="Qualifications"
                  rules={[
                    { required: true, message: "Please enter qualifications" },
                  ]}
                >
                  <TextArea rows={3} placeholder="Enter required qualifications" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="jobRequirements"
                  label="Additional Requirements"
                  rules={[
                    { required: true, message: "Please enter job requirements" },
                  ]}
                >
                  <TextArea rows={3} placeholder="Enter any additional requirements" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="requiredSkills"
                  label="Required Skills"
                  rules={[
                    { required: true, message: "Please add at least one skill" },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder="Add skills (type and press enter)"
                    tokenSeparators={[","]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="languagesRequired" label="Languages Required">
                  <Select
                    mode="tags"
                    placeholder="Add languages (type and press enter)"
                    tokenSeparators={[","]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Form.Item
                  name="benefits"
                  label="Benefits"
                  rules={[{ required: true, message: "Please add benefits" }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="Enter benefits offered"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[{ required: true, message: "Please select end date" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="deadlineDate"
                  label="Application Deadline"
                  rules={[
                    { required: true, message: "Please select deadline date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="alertDate"
                  label="Alert Date"
                  help="Set a date for reminders"
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

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
                <Button type="primary" htmlType="submit">
                  {editingRequisition ? "Update" : "Add"} Requisition
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default RecruiterRequisition;
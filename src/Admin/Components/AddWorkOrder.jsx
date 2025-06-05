import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Card,
  message,
  Switch,
  Divider,
  Typography,
  Space,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarOutlined,
  BookOutlined,
  ToolOutlined,
  CodeOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  useCreateWorkOrderMutation,
  useGetPipelinesQuery,
} from "../../Slices/Admin/AdminApis";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddWorkOrder = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [createWorkOrder, { isLoading }] = useCreateWorkOrderMutation();
  const {
    data: pipelines,
    isLoading: isPipelinesLoading,
    error: pipelinesError,
  } = useGetPipelinesQuery();

  const onFinish = async (values) => {
    try {
      // Format dates
      const formattedValues = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
      };

      const result = await createWorkOrder(formattedValues).unwrap();

      message.success("Work order created successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Error creating work order:", error);
      message.error(error?.data?.message || "Failed to create work order");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please check all required fields");
  };

  // Show error message if pipelines failed to load
  React.useEffect(() => {
    if (pipelinesError) {
      message.error("Failed to load pipelines. Please refresh the page.");
    }
  }, [pipelinesError]);

  const tabItems = [
    {
      key: "1",
      label: "Job Details",
      children: (
        <>
          {/* Basic Information */}
          <Divider orientation="left">Basic Information</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Job Title"
                name="title"
                rules={[{ required: true, message: "Please input job title!" }]}
              >
                <Input placeholder="Enter job title" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Job Code"
                name="jobCode"
                rules={[{ required: true, message: "Please input job code!" }]}
              >
                <Input placeholder="Enter job code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Workplace"
                name="workplace"
                rules={[
                  { required: true, message: "Please select workplace!" },
                ]}
              >
                <Select placeholder="Select workplace">
                  <Option value="remote">Remote</Option>
                  <Option value="onsite">On-site</Option>
                  <Option value="hybrid">Hybrid</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Office Location"
                name="officeLocation"
                rules={[
                  { required: true, message: "Please input office location!" },
                ]}
              >
                <Input placeholder="Enter office location" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Job Description"
            name="description"
            rules={[
              { required: true, message: "Please input job description!" },
            ]}
          >
            <TextArea rows={4} placeholder="Enter detailed job description" />
          </Form.Item>
        </>
      ),
    },
    {
      key: "2",
      label: "Requirements",
      children: (
        <>
          {/* Job Details */}
          <Divider orientation="left">Job Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Job Function"
                name="jobFunction"
                rules={[
                  { required: true, message: "Please input job function!" },
                ]}
              >
                <Input placeholder="e.g., Software Development" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Company Industry"
                name="companyIndustry"
                rules={[
                  { required: true, message: "Please input company industry!" },
                ]}
              >
                <Input placeholder="e.g., Technology" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Employment Type"
                name="EmploymentType"
                rules={[
                  { required: true, message: "Please select employment type!" },
                ]}
              >
                <Select placeholder="Select employment type">
                  <Option value="full-time">Full Time</Option>
                  <Option value="part-time">Part Time</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="internship">Internship</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Experience Required"
                name="Experience"
                rules={[
                  {
                    required: true,
                    message: "Please input experience requirement!",
                  },
                ]}
              >
                <Input placeholder="e.g., 2-5 years" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Education"
                name="Education"
                rules={[
                  {
                    required: true,
                    message: "Please input education requirement!",
                  },
                ]}
              >
                <Input placeholder="e.g., Bachelor's Degree" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: "Please select priority!" }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Required Skills"
            name="requiredSkills"
            rules={[
              { required: true, message: "Please input required skills!" },
            ]}
          >
            <Select
              mode="tags"
              placeholder="Enter required skills (press Enter to add)"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Languages Required" name="languagesRequired">
            <Select
              mode="tags"
              placeholder="Enter required languages (press Enter to add)"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Job Requirements"
            name="jobRequirements"
            rules={[
              { required: true, message: "Please input job requirements!" },
            ]}
          >
            <TextArea rows={3} placeholder="Enter detailed job requirements" />
          </Form.Item>
        </>
      ),
    },
    {
      key: "3",
      label: "Compensation & Timeline",
      children: (
        <>
          <Divider orientation="left">Compensation & Timeline</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Annual Salary"
                name="annualSalary"
                rules={[
                  { required: true, message: "Please input annual salary!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter annual salary"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Pipeline"
                name="pipeline"
                rules={[
                  { required: true, message: "Please select a pipeline!" },
                ]}
              >
                <Select
                  placeholder="Select pipeline"
                  loading={isPipelinesLoading}
                  notFoundContent={
                    isPipelinesLoading ? "Loading..." : "No pipelines found"
                  }
                >
                  {pipelines?.allPipelines?.map((pipeline) => (
                    <Option key={pipeline._id} value={pipeline._id}>
                      {pipeline.name}
                    </Option>
                  )) || []}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Number of Candidates"
                name="numberOfCandidate"
                rules={[
                  {
                    required: true,
                    message: "Please input number of candidates!",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter number of candidates"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Start Date"
                name="startDate"
                rules={[
                  { required: true, message: "Please select start date!" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="End Date"
                name="endDate"
                rules={[{ required: true, message: "Please select end date!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Deadline Date"
                name="deadlineDate"
                rules={[
                  { required: true, message: "Please select deadline date!" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Benefits" name="benefits">
            <TextArea rows={3} placeholder="Enter job benefits" />
          </Form.Item>
        </>
      ),
    },
    {
      key: "4",
      label: "Assignment",
      children: (
        <>
          <Divider orientation="left">Assignment & Requirements</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Assigned Recruiter ID"
                name="assignedId"
                rules={[
                  {
                    required: true,
                    message: "Please input assigned recruiter ID!",
                  },
                ]}
              >
                <Input placeholder="Enter recruiter ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Branch ID"
                name="branchId"
                rules={[{ required: true, message: "Please input branch ID!" }]}
              >
                <Input placeholder="Enter branch ID" />
              </Form.Item>
            </Col>
          </Row>

          {/* Settings */}
          <Divider orientation="left">Settings</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Is Archived"
                name="isArchived"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Is Common"
                name="isCommon"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
          Add New Work Order
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Create and configure your new work order
        </Text>
      </div>

      <Form
        form={form}
        name="addWorkOrder"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        size="large"
      >
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            tabBarStyle={{
              marginBottom: 24,
              borderBottom: "1px solid #f0f0f0",
            }}
          />
        </Card>

        <div style={{ textAlign: "center", paddingTop: "24px" }}>
          <Space size="large">
            <Button
              size="large"
              onClick={() => navigate("/admin/workorder")}
              disabled={isLoading}
              style={{ width: "120px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              style={{
                background:
                  "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                width: "100%",
                height: "44px",
              }}
              icon={<SaveOutlined />}
            >
              {isLoading ? "Creating..." : "Create Work Order"}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default AddWorkOrder;

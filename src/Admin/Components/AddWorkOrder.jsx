import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  message,
  Tag,
  Steps,
  Tabs,
  Checkbox,
  Radio,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  FormOutlined,
  MobileOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  useGetRecruitersQuery,
  useGetPipelinesQuery,
  useGetProjectsQuery,
  useCreateWorkOrderMutation,
} from "../../Slices/Admin/AdminApis";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "file", label: "File Upload" },
];

const AddWorkOrder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [jobForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [applicationFields, setApplicationFields] = useState([]);
  const [previewTab, setPreviewTab] = useState("overview");

  const { data: recruiters } = useGetRecruitersQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: pipeline } = useGetPipelinesQuery();
  const [createWorkOrder] = useCreateWorkOrderMutation();

  // Handle project selection and update job code prefix
  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    const project = projects?.allProjects?.find((p) => p._id === projectId);
    if (project && project.prefix) {
      const currentJobCode = jobForm.getFieldValue("jobCode") || "";
      const codeWithoutPrefix = currentJobCode.replace(/^[A-Z]+-/, "");
      jobForm.setFieldsValue({
        jobCode: `${project.prefix}-${codeWithoutPrefix}`,
      });
    }
  };

  const handleNextStep = () => {
    jobForm
      .validateFields()
      .then((values) => {
        const formattedData = {
          ...values,
          startDate: values.startDate?.format("YYYY-MM-DD"),
          endDate: values.endDate?.format("YYYY-MM-DD"),
          deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
          alertDate: values.alertDate?.format("YYYY-MM-DD"),
        };
        setJobData(formattedData);
        setCurrentStep(1);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
        message.error("Please fill all required fields");
      });
  };

  const handlePreviousStep = () => {
    setCurrentStep(0);
  };

  const addApplicationField = () => {
    const newField = {
      id: Date.now(),
      label: "",
      type: "text",
      required: false,
      options: [],
    };
    setApplicationFields([...applicationFields, newField]);
  };

  const updateApplicationField = (id, updates) => {
    setApplicationFields((fields) =>
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeApplicationField = (id) => {
    setApplicationFields((fields) => fields.filter((field) => field.id !== id));
  };

  const addFieldOption = (fieldId) => {
    updateApplicationField(fieldId, {
      options: [
        ...(applicationFields.find((f) => f.id === fieldId)?.options || []),
        "",
      ],
    });
  };

  const updateFieldOption = (fieldId, optionIndex, value) => {
    const field = applicationFields.find((f) => f.id === fieldId);
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateApplicationField(fieldId, { options: newOptions });
  };

  const removeFieldOption = (fieldId, optionIndex) => {
    const field = applicationFields.find((f) => f.id === fieldId);
    const newOptions = field.options.filter(
      (_, index) => index !== optionIndex
    );
    updateApplicationField(fieldId, { options: newOptions });
  };

  const handleSubmit = async (status = "draft") => {
    setLoading(true);
    try {
      const workOrderData = {
        ...jobData,
        customFields: applicationFields,
        WorkorderStatus: status,
      };

      console.log("Submitting work order:", workOrderData);

      // Replace with your actual API call
      const result = await createWorkOrder(workOrderData).unwrap();

      message.success(
        `Work order ${
          status === "published" ? "published" : "saved as draft"
        } successfully!`
      );

      // Reset forms
      jobForm.resetFields();
      setSelectedProject(null);
      setJobData(null);
      setApplicationFields([]);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error creating work order:", error);
      message.error("Failed to create work order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    jobForm.resetFields();
    setSelectedProject(null);
    setJobData(null);
    setApplicationFields([]);
    setCurrentStep(0);
    message.info("Form cancelled");
  };

  const renderJobPreview = () => (
    <div className="job-preview">
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", color: "#1890ff" }}>
          {jobData?.title}
        </h2>

        <div style={{ marginBottom: "12px" }}>
          <Tag color="blue">{jobData?.EmploymentType}</Tag>
          <Tag color="green">{jobData?.workplace}</Tag>
          {jobData?.officeLocation && <Tag>{jobData.officeLocation}</Tag>}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <h4>Job Description</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{jobData?.description}</p>
        </div>

        <Row gutter={16} style={{ marginBottom: "16px" }}>
          <Col span={12}>
            <h4>Experience Required</h4>
            <p>{jobData?.Experience || "Not specified"} years</p>
          </Col>
          <Col span={12}>
            <h4>Education</h4>
            <p>{jobData?.Education || "Not specified"}</p>
          </Col>
        </Row>

        {jobData?.annualSalary && (
          <div style={{ marginBottom: "16px" }}>
            <h4>Annual Salary</h4>
            <p>${jobData.annualSalary.toLocaleString()}</p>
          </div>
        )}

        {jobData?.requiredSkills?.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h4>Required Skills</h4>
            <div>
              {jobData.requiredSkills.map((skill, index) => (
                <Tag key={index} color="purple">
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {jobData?.jobRequirements && (
          <div style={{ marginBottom: "16px" }}>
            <h4>Requirements</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>{jobData.jobRequirements}</p>
          </div>
        )}

        {jobData?.benefits && (
          <div style={{ marginBottom: "16px" }}>
            <h4>Benefits</h4>
            <p style={{ whiteSpace: "pre-wrap" }}>{jobData.benefits}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplicationField = (field) => {
    const commonProps = {
      placeholder: `Enter ${field.label.toLowerCase()}`,
      style: { width: "100%" },
    };

    switch (field.type) {
      case "textarea":
        return <TextArea rows={3} {...commonProps} />;
      case "select":
        return (
          <Select
            {...commonProps}
            placeholder={`Select ${field.label.toLowerCase()}`}
          >
            {field.options?.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox.Group>
            {field.options?.map((option, index) => (
              <Checkbox key={index} value={option}>
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group>
            {field.options?.map((option, index) => (
              <Radio key={index} value={option}>
                {option}
              </Radio>
            ))}
          </Radio.Group>
        );
      case "number":
        return <InputNumber {...commonProps} />;
      case "email":
        return <Input type="email" {...commonProps} />;
      case "phone":
        return <Input type="tel" {...commonProps} />;
      case "date":
        return <DatePicker {...commonProps} />;
      case "file":
        return <Input type="file" {...commonProps} />;
      default:
        return <Input {...commonProps} />;
    }
  };

  const renderApplicationForm = () => (
    <div className="application-form-preview">
      <h3 style={{ marginBottom: "16px" }}>Application Form</h3>
      <Form layout="vertical">
        {applicationFields.map((field) => (
          <Form.Item
            key={field.id}
            label={
              <span>
                {field.label}
                {field.required && <span style={{ color: "red" }}> *</span>}
              </span>
            }
            required={field.required}
          >
            {renderApplicationField(field)}
          </Form.Item>
        ))}
        {applicationFields.length === 0 && (
          <div style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            No application fields added yet. Add fields using the form builder.
          </div>
        )}
        <Form.Item>
          <Button type="primary" size="large" block>
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const renderMobilePreview = () => (
    <div
      style={{
        width: "320px",
        height: "600px",
        border: "2px solid #d9d9d9",
        borderRadius: "20px",
        padding: "20px 16px",
        backgroundColor: "#fff",
        overflow: "auto",
        position: "sticky",
        top: "20px",
      }}
    >
      <Tabs
        activeKey={previewTab}
        onChange={setPreviewTab}
        size="small"
        style={{ height: "100%" }}
      >
        <TabPane tab="Overview" key="overview">
          {renderJobPreview()}
        </TabPane>
        <TabPane tab="Apply" key="apply">
          {renderApplicationForm()}
        </TabPane>
      </Tabs>
    </div>
  );

  const renderFieldBuilder = (field, index) => (
    <Card
      key={field.id}
      size="small"
      style={{ marginBottom: "16px" }}
      title={`Field ${index + 1}`}
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeApplicationField(field.id)}
        />
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Field Label" style={{ marginBottom: "12px" }}>
            <Input
              value={field.label}
              onChange={(e) =>
                updateApplicationField(field.id, { label: e.target.value })
              }
              placeholder="Enter field label"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Field Type" style={{ marginBottom: "12px" }}>
            <Select
              value={field.type}
              onChange={(value) =>
                updateApplicationField(field.id, { type: value, options: [] })
              }
            >
              {fieldTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item style={{ marginBottom: "12px" }}>
            <Checkbox
              checked={field.required}
              onChange={(e) =>
                updateApplicationField(field.id, { required: e.target.checked })
              }
            >
              Required Field
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>

      {["select", "checkbox", "radio"].includes(field.type) && (
        <div>
          <h4>Options:</h4>
          {field.options?.map((option, optionIndex) => (
            <div
              key={optionIndex}
              style={{
                display: "flex",
                marginBottom: "8px",
                alignItems: "center",
              }}
            >
              <Input
                value={option}
                onChange={(e) =>
                  updateFieldOption(field.id, optionIndex, e.target.value)
                }
                placeholder={`Option ${optionIndex + 1}`}
                style={{ marginRight: "8px" }}
              />
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => removeFieldOption(field.id, optionIndex)}
              />
            </div>
          ))}
          <Button
            type="dashed"
            onClick={() => addFieldOption(field.id)}
            icon={<PlusOutlined />}
            size="small"
          >
            Add Option
          </Button>
        </div>
      )}
    </Card>
  );

  if (currentStep === 0) {
    // Step 1: Job Details Form
    return (
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Steps current={currentStep} style={{ marginBottom: "24px" }}>
          <Steps.Step title="Job Details" icon={<FormOutlined />} />
          <Steps.Step title="Application Form" icon={<MobileOutlined />} />
        </Steps>

        <Card
          title="Create New Work Order - Job Details"
          style={{ marginBottom: "24px" }}
        >
          <Form
            form={jobForm}
            layout="vertical"
            initialValues={{
              isCommon: false,
            }}
          >
            {/* Job Title and Project Assignment */}
            <Card
              type="inner"
              title="Job Information & Project Assignment"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="Job Title"
                    rules={[
                      { required: true, message: "Please enter job title" },
                    ]}
                  >
                    <Input placeholder="Enter job title" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="project"
                    label="Assign Project"
                    rules={[
                      { required: true, message: "Please select a project" },
                    ]}
                  >
                    <Select
                      placeholder="Select project"
                      onChange={handleProjectChange}
                    >
                      {projects?.allProjects?.map((project) => (
                        <Option key={project._id} value={project._id}>
                          {project.name}{" "}
                          {project.prefix && `(${project.prefix})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="jobCode"
                    label="Job Code"
                    rules={[
                      { required: true, message: "Please enter job code" },
                    ]}
                  >
                    <Input placeholder="Enter job code" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Assignment & Pipeline */}
            <Card
              type="inner"
              title="Assignment & Pipeline"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="assignedRecruiters"
                    label="Assigned Recruiters"
                    rules={[
                      {
                        required: true,
                        message: "Please assign at least one recruiter",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select recruiters"
                      optionLabelProp="label"
                    >
                      {recruiters?.recruiters?.map((recruiter) => (
                        <Option
                          key={recruiter._id}
                          value={recruiter._id}
                          label={recruiter.fullName}
                        >
                          {recruiter.fullName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="pipeline"
                    label="Pipeline"
                    rules={[
                      { required: true, message: "Please select a pipeline" },
                    ]}
                  >
                    <Select placeholder="Select pipeline">
                      {pipeline?.allPipelines?.map((pipeline) => (
                        <Option key={pipeline._id} value={pipeline._id}>
                          {pipeline.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Form.Item name="startDate" label="Start Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="endDate" label="End Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="deadlineDate" label="Deadline Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="alertDate" label="Alert Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Basic Information */}
            <Card
              type="inner"
              title="Basic Information"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="workplace"
                    label="Workplace"
                    rules={[
                      {
                        required: true,
                        message: "Please select workplace type",
                      },
                    ]}
                  >
                    <Select placeholder="Select workplace type">
                      <Option value="remote">Remote</Option>
                      <Option value="on-site">On-site</Option>
                      <Option value="hybrid">Hybrid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="officeLocation" label="Office Location">
                    <Input placeholder="Enter office location" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Job Description"
                rules={[
                  { required: true, message: "Please enter job description" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter detailed job description"
                />
              </Form.Item>
            </Card>

            {/* Job Details */}
            <Card
              type="inner"
              title="Job Details"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="jobFunction"
                    label="Job Function"
                    rules={[
                      { required: true, message: "Please enter job function" },
                    ]}
                  >
                    <Input placeholder="e.g., Software Development" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="companyIndustry" label="Company Industry">
                    <Input placeholder="e.g., Technology" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
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
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="Experience"
                    label="Required Experience (years)"
                  >
                    <InputNumber
                      min={0}
                      max={50}
                      placeholder="Years of experience"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="Education" label="Education Requirement">
                    <Select placeholder="Select education level">
                      <Option value="high-school">High School</Option>
                      <Option value="associate">Associate Degree</Option>
                      <Option value="bachelor">Bachelor's Degree</Option>
                      <Option value="master">Master's Degree</Option>
                      <Option value="phd">PhD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="annualSalary" label="Annual Salary">
                    <InputNumber
                      min={0}
                      placeholder="Enter annual salary"
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="numberOfCandidate"
                    label="Number of Candidates Needed"
                    rules={[
                      {
                        required: true,
                        message: "Please enter number of candidates",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      placeholder="Number of candidates"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Skills & Requirements */}
            <Card
              type="inner"
              title="Skills & Requirements"
              style={{ marginBottom: "16px" }}
            >
              <Form.Item name="requiredSkills" label="Required Skills">
                <Select
                  mode="tags"
                  placeholder="Enter or select required skills"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item name="jobRequirements" label="Job Requirements">
                <TextArea
                  rows={3}
                  placeholder="Enter specific job requirements"
                />
              </Form.Item>

              <Form.Item name="languagesRequired" label="Languages Required">
                <Select
                  mode="tags"
                  placeholder="Enter required languages"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item name="benefits" label="Benefits">
                <TextArea rows={3} placeholder="Enter job benefits and perks" />
              </Form.Item>
            </Card>

            {/* Settings */}
            <Card
              type="inner"
              title="Settings"
              style={{ marginBottom: "24px" }}
            >
              <Row gutter={32}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="isCommon"
                    label="Common Template"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Action Buttons */}
            <Form.Item>
              <Space size="middle">
                <Button size="large" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNextStep}
                  icon={<ArrowRightOutlined />}
                >
                  Next: Application Form
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  // Step 2: Application Form Builder with Mobile Preview
  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Steps current={currentStep} style={{ marginBottom: "24px" }}>
        <Steps.Step title="Job Details" icon={<FormOutlined />} />
        <Steps.Step title="Application Form" icon={<MobileOutlined />} />
      </Steps>

      <Row gutter={24}>
        {/* Form Builder */}
        <Col xs={24} lg={14}>
          <Card
            title="Application Form Builder"
            style={{ marginBottom: "24px" }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addApplicationField}
                size="large"
              >
                Add Form Field
              </Button>
            </div>

            <div
              style={{
                maxHeight: "600px",
                overflowY: "auto",
                paddingRight: "8px",
              }}
            >
              {applicationFields.map((field, index) =>
                renderFieldBuilder(field, index)
              )}

              {applicationFields.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    padding: "60px 20px",
                    border: "2px dashed #d9d9d9",
                    borderRadius: "8px",
                  }}
                >
                  <FormOutlined
                    style={{ fontSize: "48px", marginBottom: "16px" }}
                  />
                  <h3>No Application Fields Added</h3>
                  <p>
                    Click "Add Form Field" to start building your application
                    form
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Mobile Preview */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <MobileOutlined />
                Mobile Preview
              </Space>
            }
            style={{ position: "sticky", top: "24px" }}
          >
            {renderMobilePreview()}
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Card>
        <Space
          size="middle"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Button size="large" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            size="large"
            onClick={handlePreviousStep}
            icon={<ArrowLeftOutlined />}
          >
            Previous: Job Details
          </Button>
          <Button
            type="default"
            size="large"
            loading={loading}
            onClick={() => handleSubmit("draft")}
          >
            Save as Draft
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={() => handleSubmit("published")}
          >
            Publish Job
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default AddWorkOrder;

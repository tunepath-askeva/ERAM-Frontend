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
  Steps,
  Tabs,
  Checkbox,
  Radio,
  Spin,
  Modal,
  Skeleton,
  Typography,
  DatePicker,
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
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useUpdateRecruiterJobMutation } from "../../Slices/Recruiter/RecruiterApis";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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

const RecruiterEditJob = () => {
  const location = useLocation();
  const { id } = useParams();
  const { state } = location;
  const jobDataFromProps = state?.jobData;
  const [currentStep, setCurrentStep] = useState(0);
  const [jobForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [applicationFields, setApplicationFields] = useState([]);
  const [previewTab, setPreviewTab] = useState("overview");
  const [selectedPipelines, setSelectedPipelines] = useState([]);
  const [pipelineDatesModalVisible, setPipelineDatesModalVisible] =
    useState(false);
  const [currentPipelineForDates, setCurrentPipelineForDates] = useState(null);
  const [pipelineStageDates, setPipelineStageDates] = useState({});
  const [customStages, setCustomStages] = useState({});
  const navigate = useNavigate();

  const [updateJob] = useUpdateRecruiterJobMutation();

  useEffect(() => {
    if (jobDataFromProps) {
      try {
        // Initialize form data
        const formData = {
          ...jobDataFromProps,
          pipeline: Array.isArray(jobDataFromProps.pipeline)
            ? jobDataFromProps.pipeline.map((p) => p._id || p)
            : [jobDataFromProps.pipeline],
        };

        jobForm.setFieldsValue(formData);
        setJobData(formData);
        setSelectedPipelines(formData.pipeline);
        setApplicationFields(jobDataFromProps.customFields || []);

        // Initialize pipeline stage dates if available
        if (jobDataFromProps.pipelineStageTimeline) {
          const initialDates = {};
          jobDataFromProps.pipelineStageTimeline.forEach((timeline) => {
            if (!initialDates[timeline.pipelineId]) {
              initialDates[timeline.pipelineId] = [];
            }
            initialDates[timeline.pipelineId].push({
              stageId: timeline.stageId,
              startDate: timeline.startDate,
              endDate: timeline.endDate,
            });
          });
          setPipelineStageDates(initialDates);
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        message.error("Error loading job data");
      }
    }
  }, [jobDataFromProps, jobForm]);

  const handleNextStep = () => {
    jobForm
      .validateFields()
      .then((values) => {
        setJobData(values);
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

  const showPipelineDatesModal = (pipelineId) => {
    setCurrentPipelineForDates(pipelineId);
    setPipelineDatesModalVisible(true);
  };

  const handleStageDateChange = (pipelineId, stageId, field, value) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };
      if (!newDates[pipelineId]) {
        newDates[pipelineId] = [];
      }

      const stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );
      if (stageIndex === -1) {
        newDates[pipelineId].push({
          stageId,
          startDate: null,
          endDate: null,
          [field]: value ? value.format("YYYY-MM-DD") : null,
        });
      } else {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          [field]: value ? value.format("YYYY-MM-DD") : null,
        };
      }

      return newDates;
    });
  };

  const addApplicationField = () => {
    const newField = {
      id: `field_${Date.now()}`,
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = jobForm.getFieldsValue();

      const pipelineStageTimeline = selectedPipelines.flatMap((pipeId) => {
        return (
          pipelineStageDates[pipeId]?.map((dateEntry) => ({
            pipelineId: pipeId,
            stageId: dateEntry.stageId,
            startDate: dateEntry.startDate,
            endDate: dateEntry.endDate,
          })) || []
        );
      });

      const updatePayload = {
        pipeline: values.pipeline,
        customFields: applicationFields,
        pipelineStageTimeline,
      };

      const result = await updateJob({
        id: jobDataFromProps._id,
        ...updatePayload,
      }).unwrap();
      message.success("Job updated successfully!");
      navigate("/recruiter/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      message.error(
        error?.data?.message || "Failed to update job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/recruiter/jobs");
  };

  const renderJobPreview = () => {
    const displayData = jobData || jobForm.getFieldsValue();

    return (
      <div style={{ padding: "0", fontSize: "14px", lineHeight: "1.4" }}>
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          <Title level={4} style={{ marginBottom: "8px" }}>
            {displayData?.title || "Job Title"}
          </Title>

          <div style={{ marginBottom: "12px" }}>
            <Text strong>Company:</Text> {displayData?.project?.name || "N/A"}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text strong>Description:</Text>
            <p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0 0" }}>
              {displayData?.description || "No description available"}
            </p>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text strong>Requirements:</Text>
            <p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0 0" }}>
              {displayData?.jobRequirements || "No requirements specified"}
            </p>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <Text strong>Skills:</Text>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              {displayData?.requiredSkills?.map((skill, index) => (
                <Tag key={index} color="blue">
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApplicationForm = () => (
    <div style={{ padding: "0", fontSize: "12px" }}>
      <h4 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
        Application Form
      </h4>
      <Form layout="vertical" size="small">
        {applicationFields.map((field) => (
          <Form.Item
            key={field.id}
            label={
              <span style={{ fontSize: "12px", fontWeight: "500" }}>
                {field.label}
                {field.required && <span style={{ color: "red" }}> *</span>}
              </span>
            }
            required={field.required}
            style={{ marginBottom: "12px" }}
          >
            {renderApplicationField(field)}
          </Form.Item>
        ))}
        {applicationFields.length === 0 && (
          <div
            style={{ textAlign: "center", color: "#999", padding: "20px 8px" }}
          >
            No application fields added yet.
          </div>
        )}
      </Form>
    </div>
  );

  const renderApplicationField = (field) => {
    const commonProps = {
      placeholder: `Enter ${field.label.toLowerCase()}`,
      style: { width: "100%" },
      size: "small",
    };

    switch (field.type) {
      case "textarea":
        return <TextArea rows={2} {...commonProps} />;
      case "select":
        return (
          <Select {...commonProps}>
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
              <div key={index} style={{ marginBottom: "4px" }}>
                <Checkbox value={option}>{option}</Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group>
            {field.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: "4px" }}>
                <Radio value={option}>{option}</Radio>
              </div>
            ))}
          </Radio.Group>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

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
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={12}>
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
        <Col xs={24} sm={12}>
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
        <Col xs={24} sm={12}>
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
              style={{ display: "flex", marginBottom: "8px", gap: "8px" }}
            >
              <Input
                value={option}
                onChange={(e) =>
                  updateApplicationField(field.id, {
                    options: field.options.map((o, i) =>
                      i === optionIndex ? e.target.value : o
                    ),
                  })
                }
                placeholder={`Option ${optionIndex + 1}`}
                style={{ flex: 1 }}
              />
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() =>
                  updateApplicationField(field.id, {
                    options: field.options.filter((_, i) => i !== optionIndex),
                  })
                }
              />
            </div>
          ))}
          <Button
            type="dashed"
            onClick={() =>
              updateApplicationField(field.id, {
                options: [...(field.options || []), ""],
              })
            }
            icon={<PlusOutlined />}
            size="small"
          >
            Add Option
          </Button>
        </div>
      )}
    </Card>
  );

  const renderPipelineDatesModal = () => {
    if (!currentPipelineForDates) return null;

    return (
      <Modal
        title="Set Stage Dates"
        visible={pipelineDatesModalVisible}
        onCancel={() => setPipelineDatesModalVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setPipelineDatesModalVisible(false)}
          >
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => setPipelineDatesModalVisible(false)}
          >
            Save Dates
          </Button>,
        ]}
        width={600}
      >
        {pipelineStageDates[currentPipelineForDates]?.map(
          (dateEntry, index) => (
            <Card
              key={index}
              title={`Stage ${index + 1}`}
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Start Date">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={
                        dateEntry.startDate ? dayjs(dateEntry.startDate) : null
                      }
                      onChange={(date) =>
                        handleStageDateChange(
                          currentPipelineForDates,
                          dateEntry.stageId,
                          "startDate",
                          date
                        )
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="End Date">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={
                        dateEntry.endDate ? dayjs(dateEntry.endDate) : null
                      }
                      onChange={(date) =>
                        handleStageDateChange(
                          currentPipelineForDates,
                          dateEntry.stageId,
                          "endDate",
                          date
                        )
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )
        )}
      </Modal>
    );
  };

  // Loading state if no job data is passed
  if (!jobDataFromProps) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
        <Steps current={currentStep} style={{ marginBottom: "24px" }}>
          <Steps.Step title="Pipeline Configuration" />
          <Steps.Step title="Application Form" />
        </Steps>

        <Card title="Edit Job - Pipeline Configuration">
          <Form form={jobForm} layout="vertical">
            <Card
              type="inner"
              title="Pipeline Selection"
              style={{ marginBottom: "16px" }}
            >
              <Form.Item
                name="pipeline"
                label="Select Pipeline"
                rules={[
                  { required: true, message: "Please select a pipeline" },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select pipeline"
                  onChange={setSelectedPipelines}
                >
                  {jobDataFromProps.availablePipelines?.map((pipeline) => (
                    <Option key={pipeline._id} value={pipeline._id}>
                      {pipeline.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div style={{ marginTop: "16px" }}>
                <Text strong>Selected Pipelines:</Text>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {selectedPipelines.map((pipelineId) => {
                    const pipeline = jobDataFromProps.availablePipelines?.find(
                      (p) => p._id === pipelineId
                    );
                    if (!pipeline) return null;

                    return (
                      <Tag
                        key={pipelineId}
                        color="blue"
                        style={{ cursor: "pointer" }}
                        onClick={() => showPipelineDatesModal(pipelineId)}
                      >
                        {pipeline.name}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div style={{ textAlign: "right", marginTop: "16px" }}>
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" onClick={handleNextStep}>
                  Next <ArrowRightOutlined />
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
        {renderPipelineDatesModal()}
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", maxWidth: "1400px", margin: "0 auto" }}>
      <Steps current={currentStep} style={{ marginBottom: "24px" }}>
        <Steps.Step title="Pipeline Configuration" />
        <Steps.Step title="Application Form" />
      </Steps>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Application Form Builder"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addApplicationField}
              >
                Add Field
              </Button>
            }
          >
            {applicationFields.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addApplicationField}
                >
                  Add Your First Field
                </Button>
              </div>
            ) : (
              <div>
                {applicationFields.map((field, index) =>
                  renderFieldBuilder(field, index)
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Preview">
            <Tabs activeKey={previewTab} onChange={setPreviewTab}>
              <TabPane tab="Job Overview" key="overview">
                {renderJobPreview()}
              </TabPane>
              <TabPane tab="Application Form" key="apply">
                {renderApplicationForm()}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: "24px", textAlign: "right" }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handlePreviousStep}>
            Back
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            Save Changes
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default RecruiterEditJob;

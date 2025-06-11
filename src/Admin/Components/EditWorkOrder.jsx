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
  Spin,
   Modal
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
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  useGetRecruitersQuery,
  useGetPipelinesQuery,
  useGetProjectsQuery,
  useEditWorkOrderMutation,
  useGetAdminBranchQuery,
  useGetWorkOrderByIdQuery,
} from "../../Slices/Admin/AdminApis";
import { useNavigate, useParams } from "react-router-dom";

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

const EditWorkOrder = () => {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [jobForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [applicationFields, setApplicationFields] = useState([]);
  const [previewTab, setPreviewTab] = useState("overview");
  const [selectedPipelines, setSelectedPipelines] = useState([]);
  const [pipelineDatesModalVisible, setPipelineDatesModalVisible] =
    useState(false);
  const [currentPipelineForDates, setCurrentPipelineForDates] = useState(null);
  const [pipelineStageDates, setPipelineStageDates] = useState({});
  const navigate = useNavigate();

  const { data: Branch } = useGetAdminBranchQuery();
  const { data: recruiters } = useGetRecruitersQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: pipeline } = useGetPipelinesQuery();
  const {
    data: workOrderData,
    isLoading: isLoadingWorkOrder,
    error,
    refetch,
  } = useGetWorkOrderByIdQuery(id, {
    skip: !id,
  });
  const [editWorkOrder] = useEditWorkOrderMutation();

  const activeRecruiters =
    recruiters?.recruiters?.filter(
      (recruiter) => recruiter.accountStatus === "active"
    ) || [];

  const activePipelines =
    pipeline?.allPipelines?.filter(
      (pipeline) => pipeline.pipelineStatus === "active"
    ) || [];

  const activeProjects =
    projects?.allProjects?.filter((project) => project.status === "active") ||
    [];

  const branchId = Branch?.branch?._id;

  useEffect(() => {
    console.log("Work Order ID:", id);
    console.log("Work Order Data:", workOrderData);
    console.log("Loading:", isLoadingWorkOrder);
    console.log("Error:", error);
  }, [id, workOrderData, isLoadingWorkOrder, error]);

  useEffect(() => {
    if (workOrderData?.workOrder) {
      const workOrder = workOrderData?.workOrder;
      try {
        const formatDate = (dateString) => {
          if (!dateString) return null;
          try {
            return dayjs(dateString);
          } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return null;
          }
        };

        const formData = {
          ...workOrder,
          numberOfCandidate: workOrder.numberOfCandidate,
          startDate: formatDate(workOrder.startDate),
          endDate: formatDate(workOrder.endDate),
          deadlineDate: formatDate(workOrder.deadlineDate),
          alertDate: formatDate(workOrder.alertDate),
          // Ensure assigned recruiters are still active
          assignedRecruiters: Array.isArray(workOrder.assignedRecruiters)
            ? workOrder.assignedRecruiters
                .map((recruiter) =>
                  typeof recruiter === "object" ? recruiter._id : recruiter
                )
                .filter((id) => activeRecruiters.some((r) => r._id === id))
            : activeRecruiters.some(
                (r) => r._id === workOrder.assignedRecruiters
              )
            ? [workOrder.assignedRecruiters]
            : [],
          // Ensure pipelines are still active
          pipeline: Array.isArray(workOrder.pipeline)
            ? workOrder.pipeline
                .map((p) => (typeof p === "object" ? p._id : p))
                .filter((id) => activePipelines.some((p) => p._id === id))
            : activePipelines.some((p) => p._id === workOrder.pipeline)
            ? [workOrder.pipeline]
            : [],
          // Ensure project is still active
          project: activeProjects.some(
            (p) =>
              p._id ===
              (typeof workOrder.project === "object"
                ? workOrder.project._id
                : workOrder.project)
          )
            ? typeof workOrder.project === "object"
              ? workOrder.project._id
              : workOrder.project
            : null,
          requiredSkills: Array.isArray(workOrder.requiredSkills)
            ? workOrder.requiredSkills
            : [],
          isCommon: workOrder.isCommon || false,
        };

        if (workOrder.pipelineStageTimeline) {
          const initialDates = {};
          workOrder.pipelineStageTimeline.forEach((timeline) => {
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

        // Initialize selected pipelines
        const pipelineIds = Array.isArray(workOrder.pipeline)
          ? workOrder.pipeline.map((p) => (typeof p === "object" ? p._id : p))
          : [workOrder.pipeline];
        setSelectedPipelines(pipelineIds);

        jobForm.setFieldsValue(formData);
        setSelectedProject(formData.project);
        setJobData(formData);
        setApplicationFields(
          workOrder.customFields?.map((field) => ({
            ...field,
            id:
              field.id ||
              `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })) || []
        );
      } catch (error) {
        console.error("Error initializing form:", error);
        message.error("Error loading work order data");
      }
    }
  }, [workOrderData, jobForm]);

  useEffect(() => {
    if (id && refetch) {
      refetch();
    }
  }, [id, refetch]);

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    const project = activeProjects.find((p) => p._id === projectId);
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
          branch: branchId,
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

  const handlePipelineChange = (selectedPipelineIds) => {
    setSelectedPipelines(selectedPipelineIds);

    const newStageDates = { ...pipelineStageDates };
    selectedPipelineIds.forEach((pipeId) => {
      if (!newStageDates[pipeId]) {
        const pipeline = activePipelines.find((p) => p._id === pipeId);
        if (pipeline) {
          newStageDates[pipeId] = pipeline.stages.map((stage) => ({
            stageId: stage._id,
            startDate: null,
            endDate: null,
          }));
        }
      }
    });

    Object.keys(newStageDates).forEach((pipeId) => {
      if (!selectedPipelineIds.includes(pipeId)) {
        delete newStageDates[pipeId];
      }
    });

    setPipelineStageDates(newStageDates);
  };

  const showPipelineDatesModal = (pipelineId) => {
    const pipeline = activePipelines.find((p) => p._id === pipelineId);
    if (pipeline) {
      setCurrentPipelineForDates(pipeline);
      setPipelineDatesModalVisible(true);
    }
  };

  const handleStageDateChange = (pipelineId, stageId, field, value) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };
      const stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );
      if (stageIndex >= 0) {
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
      const values = jobForm.getFieldsValue();

      const pipelineStageTimeline = selectedPipelines.flatMap((pipeId) => {
        return (
          pipelineStageDates[pipeId]?.map((stage) => ({
            pipelineId: pipeId,
            stageId: stage.stageId,
            startDate: stage.startDate,
            endDate: stage.endDate,
          })) || []
        );
      });

      const workOrderPayload = {
        ...jobData,
        ...values,
        customFields: applicationFields,
        workOrderStatus: status,
        isActive: values.isActive ? "active" : "inactive",
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
        alertDate: values.alertDate?.format("YYYY-MM-DD"),
        pipelineStageTimeline,
      };

      const result = await editWorkOrder({ id, ...workOrderPayload }).unwrap();
      message.success(
        `Work order updated and ${
          status === "published" ? "published" : "saved as draft"
        } successfully!`
      );
      navigate("/admin/workorder");
    } catch (error) {
      console.error("Error updating work order:", error);
      message.error(
        error?.data?.message || "Failed to update work order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/workorder");
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
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              color: "#1890ff",
              fontSize: "16px",
              fontWeight: "600",
              wordBreak: "break-word",
              lineHeight: "1.3",
            }}
          >
            {displayData?.title || "Job Title"}
          </h3>

          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            <Tag color="blue" style={{ fontSize: "11px", margin: "0" }}>
              {displayData?.EmploymentType || "Full-time"}
            </Tag>
            <Tag color="green" style={{ fontSize: "11px", margin: "0" }}>
              {displayData?.workplace || "Remote"}
            </Tag>
            {displayData?.officeLocation && (
              <Tag style={{ fontSize: "11px", margin: "0" }}>
                {displayData.officeLocation}
              </Tag>
            )}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Job Description
            </h4>
            <p
              style={{
                whiteSpace: "pre-wrap",
                margin: "0",
                fontSize: "12px",
                wordBreak: "break-word",
                lineHeight: "1.4",
              }}
            >
              {displayData?.description ||
                "Job description will appear here..."}
            </p>
          </div>

          <Row gutter={8} style={{ marginBottom: "12px" }}>
            <Col span={12}>
              <h4
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Experience
              </h4>
              <p style={{ margin: "0", fontSize: "12px" }}>
                {displayData?.Experience || "0"} years
              </p>
            </Col>
            <Col span={12}>
              <h4
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Education
              </h4>
              <p style={{ margin: "0", fontSize: "12px" }}>
                {displayData?.Education || "Not specified"}
              </p>
            </Col>
          </Row>

          {displayData?.annualSalary && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Annual Salary
              </h4>
              <p style={{ margin: "0", fontSize: "12px" }}>
                ${displayData.annualSalary.toLocaleString()}
              </p>
            </div>
          )}

          {displayData?.requiredSkills?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Required Skills
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                {displayData.requiredSkills.map((skill, index) => (
                  <Tag
                    key={index}
                    color="purple"
                    style={{
                      fontSize: "10px",
                      margin: "0",
                      padding: "2px 6px",
                    }}
                  >
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {displayData?.jobRequirements && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Requirements
              </h4>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "0",
                  fontSize: "12px",
                  wordBreak: "break-word",
                }}
              >
                {displayData.jobRequirements}
              </p>
            </div>
          )}

          {displayData?.benefits && (
            <div style={{ marginBottom: "0" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Benefits
              </h4>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "0",
                  fontSize: "12px",
                  wordBreak: "break-word",
                }}
              >
                {displayData.benefits}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          <Checkbox.Group style={{ fontSize: "12px" }}>
            {field.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: "4px" }}>
                <Checkbox value={option} style={{ fontSize: "12px" }}>
                  <span style={{ fontSize: "12px" }}>{option}</span>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group style={{ fontSize: "12px" }}>
            {field.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: "4px" }}>
                <Radio value={option} style={{ fontSize: "12px" }}>
                  <span style={{ fontSize: "12px" }}>{option}</span>
                </Radio>
              </div>
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
            style={{
              textAlign: "center",
              color: "#999",
              padding: "20px 8px",
              fontSize: "12px",
            }}
          >
            No application fields added yet. Add fields using the form builder.
          </div>
        )}
        <Form.Item style={{ marginTop: "16px", marginBottom: "0" }}>
          <Button
            type="primary"
            size="small"
            block
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const renderMobilePreview = () => (
    <div
      style={{
        width: "100%",
        maxWidth: "320px",
        height: "580px",
        margin: "0 auto",
        position: "relative",
        background: "linear-gradient(145deg, #2c3e50 0%, #34495e 100%)",
        borderRadius: "25px",
        padding: "4px",
        boxShadow:
          "0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
          borderRadius: "22px",
          padding: "2px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120px",
            height: "20px",
            backgroundColor: "#000",
            borderRadius: "10px",
            zIndex: 10,
          }}
        />

        {/* Screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Status Bar */}
          <div
            style={{
              height: "28px",
              backgroundColor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#333",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            <span>9:41</span>
            <span>●●●●●</span>
            <span>100%</span>
          </div>

          {/* Content Area */}
          <div
            style={{
              height: "calc(100% - 28px)",
              overflow: "auto",
              padding: "12px",
              backgroundColor: "#fff",
            }}
          >
            <Tabs
              activeKey={previewTab}
              onChange={setPreviewTab}
              size="small"
              style={{
                height: "100%",
                "& .ant-tabs-content-holder": {
                  height: "calc(100% - 40px)",
                  overflow: "auto",
                },
              }}
              tabBarStyle={{
                marginBottom: "8px",
                fontSize: "11px",
              }}
            >
              <TabPane
                tab={<span style={{ fontSize: "11px" }}>Overview</span>}
                key="overview"
              >
                <div style={{ height: "100%", overflow: "auto" }}>
                  {renderJobPreview()}
                </div>
              </TabPane>
              <TabPane
                tab={<span style={{ fontSize: "11px" }}>Apply</span>}
                key="apply"
              >
                <div style={{ height: "100%", overflow: "auto" }}>
                  {renderApplicationForm()}
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
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
              style={{
                display: "flex",
                marginBottom: "8px",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Input
                value={option}
                onChange={(e) =>
                  updateFieldOption(field.id, optionIndex, e.target.value)
                }
                placeholder={`Option ${optionIndex + 1}`}
                style={{ flex: 1 }}
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

  const renderPipelineDatesModal = () => (
    <Modal
      title={`Set Stage Dates for ${
        currentPipelineForDates?.name || "Pipeline"
      }`}
      visible={pipelineDatesModalVisible}
      onCancel={() => setPipelineDatesModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => setPipelineDatesModalVisible(false)}>
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
      width={800}
    >
      {currentPipelineForDates?.stages?.map((stage, index) => (
        <Card
          key={stage._id}
          title={`Stage ${index + 1}: ${stage.name}`}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Start Date">
                <DatePicker
                  style={{ width: "100%" }}
                  value={
                    pipelineStageDates[currentPipelineForDates._id]?.[index]
                      ?.startDate
                      ? dayjs(
                          pipelineStageDates[currentPipelineForDates._id][index]
                            .startDate
                        )
                      : null
                  }
                  onChange={(date) =>
                    handleStageDateChange(
                      currentPipelineForDates._id,
                      stage._id,
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
                    pipelineStageDates[currentPipelineForDates._id]?.[index]
                      ?.endDate
                      ? dayjs(
                          pipelineStageDates[currentPipelineForDates._id][index]
                            .endDate
                        )
                      : null
                  }
                  onChange={(date) =>
                    handleStageDateChange(
                      currentPipelineForDates._id,
                      stage._id,
                      "endDate",
                      date
                    )
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}
    </Modal>
  );

  // Loading state
  if (isLoadingWorkOrder) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spin size="large" indicator={<LoadingOutlined spin />} />
        <div style={{ marginLeft: "16px" }}>Loading work order data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Work order fetch error:", error);
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3>Error Loading Work Order</h3>
          <p>
            {error?.data?.message ||
              error?.message ||
              "Failed to load work order data"}
          </p>
          <Space>
            <Button onClick={() => refetch()}>Retry</Button>
            <Button onClick={() => navigate("/admin/workorder")}>
              Back to Work Orders
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  // No data state
  if (!isLoadingWorkOrder && !workOrderData?.workOrder) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3>Work Order Not Found</h3>
          <p>The work order with ID {id} could not be found.</p>
          <Button onClick={() => navigate("/admin/workorder")}>
            Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div
        style={{ padding: "16px 8px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <Steps
          current={currentStep}
          style={{ marginBottom: "24px" }}
          size="small"
          responsive={false}
        >
          <Steps.Step
            title={<span style={{ fontSize: "12px" }}>Job Details</span>}
            icon={<FormOutlined style={{ color: "#ff4d4f" }} />}
          />
          <Steps.Step
            title={<span style={{ fontSize: "12px" }}>Application Form</span>}
            icon={<MobileOutlined style={{ color: "#ff4d4f" }} />}
          />
        </Steps>

        <Card
          title="Edit Work Order - Job Details"
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
              <Row gutter={[16, 8]}>
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
                      {activeProjects.map((project) => (
                        <Option key={project._id} value={project._id}>
                          {project.name}{" "}
                          {project.prefix && `(${project.prefix})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
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
              <Row gutter={[16, 8]}>
                <Col xs={24} md={12} lg={8}>
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
                      {activeRecruiters.map((recruiter) => (
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
                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    name="pipeline"
                    label="Pipeline"
                    rules={[
                      { required: true, message: "Please select a pipeline" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select pipeline"
                      onChange={handlePipelineChange}
                      onSelect={(value) => showPipelineDatesModal(value)}
                    >
                      {activePipelines.map((pipeline) => (
                        <Option key={pipeline._id} value={pipeline._id}>
                          {pipeline.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="deadlineDate" label="Deadline Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="startDate" label="Start Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="endDate" label="End Date">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
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
              <Row gutter={[16, 8]}>
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
              <Row gutter={[16, 8]}>
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

              <Row gutter={[16, 8]}>
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
                      <Option value="none">None</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="annualSalary" label="Salary ($)">
                    <InputNumber
                      min={0}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="salaryType"
                    label="Salary Type"
                    rules={[
                      {
                        required: true,
                        message: "Please select salary type",
                      },
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

                <Col xs={24} md={8}>
                  <Form.Item
                    name="numberOfCandidate"
                    label="Candidates Required"
                  >
                    <InputNumber
                      min={0}
                      max={50}
                      placeholder="No of Candidates Required"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="isActive"
                    label="Common Work Order"
                    valuePropName="checked"
                  >
                    <Switch
                      checked={workOrderData?.workOrder?.isActive === "active"}
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
              <Form.Item
                name="requiredSkills"
                label="Required Skills (comma separated)"
              >
                <Select
                  mode="tags"
                  tokenSeparators={[","]}
                  placeholder="e.g., JavaScript, React, Node.js"
                />
              </Form.Item>

              <Form.Item
                name="jobRequirements"
                label="Job Requirements"
                rules={[
                  { required: true, message: "Please enter job requirements" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter detailed job requirements"
                />
              </Form.Item>

              <Form.Item name="benefits" label="Benefits">
                <TextArea rows={4} placeholder="Enter job benefits" />
              </Form.Item>
            </Card>

            <div
              style={{
                textAlign: "right",
                paddingTop: "16px",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button
                  type="primary"
                  onClick={handleNextStep}
                  style={{
                    background:
                      "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                    border: "none",
                  }}
                >
                  Next Step <ArrowRightOutlined />
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
        {renderPipelineDatesModal()}
      </div>
    );
  }

  // Step 2: Application Form Builder
  return (
    <div style={{ padding: "16px 8px", maxWidth: "1400px", margin: "0 auto" }}>
      <Steps
        current={currentStep}
        style={{ marginBottom: "24px" }}
        size="small"
        responsive={false}
      >
        <Steps.Step
          title={<span style={{ fontSize: "12px" }}>Job Details</span>}
          icon={<FormOutlined style={{ color: "#52c41a" }} />}
        />
        <Steps.Step
          title={<span style={{ fontSize: "12px" }}>Application Form</span>}
          icon={<MobileOutlined style={{ color: "#ff4d4f" }} />}
        />
      </Steps>

      <Row gutter={[16, 16]}>
        {/* Form Builder */}
        <Col xs={24} lg={14}>
          <Card
            title="Application Form Builder"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addApplicationField}
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  border: "none",
                }}
              >
                Add Field
              </Button>
            }
          >
            {applicationFields.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ color: "#999", marginBottom: "16px" }}>
                  No application fields added yet
                </div>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addApplicationField}
                >
                  Add Your First Field
                </Button>
              </div>
            ) : (
              applicationFields.map((field, index) =>
                renderFieldBuilder(field, index)
              )
            )}
          </Card>
        </Col>

        {/* Mobile Preview */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <EyeOutlined style={{ marginRight: "8px" }} />
                Mobile Preview
              </span>
            }
            style={{ position: "sticky", top: "20px" }}
          >
            {renderMobilePreview()}
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Card style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Button icon={<ArrowLeftOutlined />} onClick={handlePreviousStep}>
            Previous Step
          </Button>

          <Space wrap>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={() => handleSubmit("draft")} loading={loading}>
              Save as Draft
            </Button>
            <Button
              type="primary"
              onClick={() => handleSubmit("published")}
              loading={loading}
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                border: "none",
              }}
            >
              Update & Publish
            </Button>
          </Space>
        </div>
      </Card>
      {renderPipelineDatesModal()}
    </div>
  );
};

export default EditWorkOrder;

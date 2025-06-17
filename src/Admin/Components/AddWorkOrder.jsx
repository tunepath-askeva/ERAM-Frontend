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
  Modal,
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
import dayjs from "dayjs";
import {
  useGetRecruitersQuery,
  useGetPipelinesQuery,
  useGetProjectsQuery,
  useCreateWorkOrderMutation,
  useGetAdminBranchQuery,
} from "../../Slices/Admin/AdminApis.js";
import CreatePipelineModal from "../Components/CreatePipelineModal.jsx";
import { useNavigate } from "react-router-dom";

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
  const [selectedPipelines, setSelectedPipelines] = useState([]);
  const [pipelineDatesModalVisible, setPipelineDatesModalVisible] =
    useState(false);
  const [currentPipelineForDates, setCurrentPipelineForDates] = useState(null);
  const [pipelineStageDates, setPipelineStageDates] = useState({});
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [customStages, setCustomStages] = useState({});
  const [draggedStage, setDraggedStage] = useState(null);
  const [stageApprovers, setStageApprovers] = useState({});
  const navigate = useNavigate();

  const { data: Branch } = useGetAdminBranchQuery();
  const { data: recruiters } = useGetRecruitersQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: pipeline, refetch } = useGetPipelinesQuery();
  const [createWorkOrder] = useCreateWorkOrderMutation();

  const branchId = Branch?.branch?._id;

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

  const handleApproverChange = (pipelineId, stageId, approvers) => {
    setStageApprovers((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: approvers,
      },
    }));
  };

  const handlePipelineChange = (selectedPipelineIds) => {
    setSelectedPipelines(selectedPipelineIds);

    jobForm.setFieldsValue({ pipeline: selectedPipelineIds });

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

      if (!customStages[pipelineId]) {
        setCustomStages((prev) => ({
          ...prev,
          [pipelineId]: [...pipeline.stages],
        }));
      }

      if (!pipelineStageDates[pipelineId]) {
        setPipelineStageDates((prev) => ({
          ...prev,
          [pipelineId]: (customStages[pipelineId] || pipeline.stages).map(
            (stage) => ({
              stageId: stage._id || stage.id || `temp-${Date.now()}`,
              startDate: null,
              endDate: null,
            })
          ),
        }));
      }
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

  const addCustomStage = (pipelineId) => {
    const newStage = {
      id: `temp-${Date.now()}`,
      name: `New Stage`,
      description: "",
      isCustom: true,
    };

    setCustomStages((prev) => ({
      ...prev,
      [pipelineId]: [...(prev[pipelineId] || []), newStage],
    }));

    setPipelineStageDates((prev) => ({
      ...prev,
      [pipelineId]: [
        ...(prev[pipelineId] || []),
        {
          stageId: newStage.id,
          startDate: null,
          endDate: null,
        },
      ],
    }));
  };

  const updateCustomStage = (pipelineId, stageId, updates) => {
    setCustomStages((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId].map((stage) =>
        (stage._id || stage.id) === stageId ? { ...stage, ...updates } : stage
      ),
    }));
  };

  const removeCustomStage = (pipelineId, stageId) => {
    setCustomStages((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId].filter(
        (stage) => (stage._id || stage.id) !== stageId
      ),
    }));

    setPipelineStageDates((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId].filter(
        (stage) => stage.stageId !== stageId
      ),
    }));
  };

  const handleDragStart = (e, stage) => {
    setDraggedStage(stage);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetStage, pipelineId) => {
    e.preventDefault();
    if (!draggedStage) return;

    const stages = customStages[pipelineId] || [];
    const draggedIndex = stages.findIndex(
      (s) => (s._id || s.id) === (draggedStage._id || draggedStage.id)
    );
    const targetIndex = stages.findIndex(
      (s) => (s._id || s.id) === (targetStage._id || targetStage.id)
    );

    if (draggedIndex !== targetIndex) {
      const newStages = [...stages];
      const [draggedItem] = newStages.splice(draggedIndex, 1);
      newStages.splice(targetIndex, 0, draggedItem);

      setCustomStages((prev) => ({
        ...prev,
        [pipelineId]: newStages,
      }));

      // Reorder the dates array to match
      const dates = pipelineStageDates[pipelineId] || [];
      const newDates = newStages.map(
        (stage) =>
          dates.find((d) => d.stageId === (stage._id || stage.id)) || {
            stageId: stage._id || stage.id,
            startDate: null,
            endDate: null,
          }
      );

      setPipelineStageDates((prev) => ({
        ...prev,
        [pipelineId]: newDates,
      }));
    }

    setDraggedStage(null);
  };

  const handleNextStep = () => {
    jobForm
      .validateFields()
      .then((values) => {
        console.log("Form values:", values); // Debug log
        console.log("Selected pipelines:", selectedPipelines); // Debug log

        const formattedData = {
          ...values,
          startDate: values.startDate?.format("YYYY-MM-DD"),
          endDate: values.endDate?.format("YYYY-MM-DD"),
          deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
          alertDate: values.alertDate?.format("YYYY-MM-DD"),
          branchId: branchId,
        };

        console.log("Formatted data:", formattedData); // Debug log
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
      const pipelineStageTimeline = selectedPipelines.flatMap((pipeId) => {
        const stages =
          customStages[pipeId] ||
          activePipelines.find((p) => p._id === pipeId)?.stages ||
          [];
        return (
          pipelineStageDates[pipeId]?.map((dateEntry, index) => ({
            pipelineId: pipeId,
            stageId: dateEntry.stageId,
            stageName: stages.find((s) => (s._id || s.id) === dateEntry.stageId)
              ?.name,
            stageOrder: index,
            startDate: dateEntry.startDate,
            endDate: dateEntry.endDate,
            isCustomStage:
              stages.find((s) => (s._id || s.id) === dateEntry.stageId)
                ?.isCustom || false,
          })) || []
        );
      });

      const workOrderData = {
        ...jobData,
        customFields: applicationFields,
        WorkorderStatus: status,
        isActive: status === "published" ? "active" : "inactive",
        pipelineStageTimeline,
        stageApprovers: stageApprovers,
      };

      console.log("Submitting work order with approvals:", workOrderData);

      const result = await createWorkOrder(workOrderData).unwrap();

      message.success(
        `Work order ${
          status === "published" ? "published" : "saved as draft"
        } successfully with approval settings!`
      );

      jobForm.resetFields();
      setSelectedProject(null);
      setJobData(null);
      setApplicationFields([]);
      setCustomStages({});
      setStageApprovers({});
      setCurrentStep(0);
      navigate("/admin/workorder");
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
    navigate("/admin/workorder");
  };

  const renderJobPreview = () => (
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
          {jobData?.title || "Job Title"}
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
            {jobData?.EmploymentType || "Full-time"}
          </Tag>
          <Tag color="green" style={{ fontSize: "11px", margin: "0" }}>
            {jobData?.workplace || "Remote"}
          </Tag>
          {jobData?.officeLocation && (
            <Tag style={{ fontSize: "11px", margin: "0" }}>
              {jobData.officeLocation}
            </Tag>
          )}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <h4
            style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600" }}
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
            {jobData?.description || "Job description will appear here..."}
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
              {jobData?.Experience || "0"} years
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
              {jobData?.Education || "Not specified"}
            </p>
          </Col>
        </Row>

        {jobData?.annualSalary && (
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
              ${jobData.annualSalary.toLocaleString()}
            </p>
          </div>
        )}

        {jobData?.requiredSkills?.length > 0 && (
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
              {jobData.requiredSkills.map((skill, index) => (
                <Tag
                  key={index}
                  color="purple"
                  style={{ fontSize: "10px", margin: "0", padding: "2px 6px" }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {jobData?.jobRequirements && (
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
              {jobData.jobRequirements}
            </p>
          </div>
        )}

        {jobData?.benefits && (
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
              {jobData.benefits}
            </p>
          </div>
        )}
      </div>
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
                {field.required && <span style={{ color: "red" }}> </span>}
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
      {/* Phone Frame */}
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

  const renderPipelineDatesModal = () => {
    // Static approval levels
    const approvalLevels = [
      { id: "level1", name: "Level 1 - Initial Approval" },
      { id: "level2", name: "Level 2 - Manager Approval" },
      { id: "level3", name: "Level 3 - Final Approval" },
    ];

    return (
      <Modal
        title={`Set Stage Dates & Approvals for ${
          currentPipelineForDates?.name || "Pipeline"
        }`}
        visible={pipelineDatesModalVisible}
        onCancel={() => setPipelineDatesModalVisible(false)}
        footer={[
          <Button
            key="add"
            icon={<PlusOutlined />}
            onClick={() => addCustomStage(currentPipelineForDates._id)}
          >
            Add Stage
          </Button>,
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
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            }}
          >
            Save Dates & Approvals
          </Button>,
        ]}
        width={800}
      >
        {(
          customStages[currentPipelineForDates?._id] ||
          currentPipelineForDates?.stages ||
          []
        ).map((stage, index) => {
          const stageId = stage._id || stage.id;
          const dateEntry = pipelineStageDates[
            currentPipelineForDates._id
          ]?.find((d) => d.stageId === stageId);

          return (
            <Card
              key={stageId}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ cursor: "grab" }}>⋮⋮</span>
                    <Input
                      value={stage.name}
                      onChange={(e) =>
                        updateCustomStage(
                          currentPipelineForDates._id,
                          stageId,
                          {
                            name: e.target.value,
                          }
                        )
                      }
                      style={{ maxWidth: "200px" }}
                      size="small"
                    />
                    {stage.isCustom && (
                      <Tag color="orange" size="small">
                        Custom
                      </Tag>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {stage.isCustom && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          removeCustomStage(
                            currentPipelineForDates._id,
                            stageId
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              }
              style={{
                marginBottom: 16,
                cursor: "move",
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, stage)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage, currentPipelineForDates._id)}
            >
              <Row gutter={16} align="bottom">
                {/* Date Section */}
                <Col span={16}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item
                        label="Start Date"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 24 }} // Full width label
                        wrapperCol={{ span: 24 }} // Full width field
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          size="small"
                          value={
                            dateEntry?.startDate
                              ? dayjs(dateEntry.startDate)
                              : null
                          }
                          onChange={(date) =>
                            handleStageDateChange(
                              currentPipelineForDates._id,
                              stageId,
                              "startDate",
                              date
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="End Date"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          size="small"
                          value={
                            dateEntry?.endDate ? dayjs(dateEntry.endDate) : null
                          }
                          onChange={(date) =>
                            handleStageDateChange(
                              currentPipelineForDates._id,
                              stageId,
                              "endDate",
                              date
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                {/* Approval Section */}
                <Col span={8}>
                  <Form.Item
                    label="Required Approval"
                    style={{ marginBottom: 0 }}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Select
                      placeholder="Select approval level"
                      style={{ width: "100%" }}
                      size="small"
                    >
                      {approvalLevels.map((level) => (
                        <Option key={level.id} value={level.id}>
                          {level.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Stage Summary */}
              {(dateEntry?.startDate || dateEntry?.endDate) && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    backgroundColor: "#f6ffed",
                    borderRadius: "4px",
                    border: "1px solid #d9f7be",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#389e0d" }}>
                    <strong>Stage Configuration:</strong>
                    {dateEntry?.startDate && (
                      <span style={{ marginLeft: "8px" }}>
                        📅 Start:{" "}
                        {dayjs(dateEntry.startDate).format("MMM DD, YYYY")}
                      </span>
                    )}
                    {dateEntry?.endDate && (
                      <span style={{ marginLeft: "8px" }}>
                        📅 End:{" "}
                        {dayjs(dateEntry.endDate).format("MMM DD, YYYY")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Global Actions */}
        <Card
          style={{
            marginTop: "16px",
            backgroundColor: "#fafafa",
            border: "1px dashed #d9d9d9",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h4 style={{ color: "#666", marginBottom: "12px" }}>
              Quick Configuration
            </h4>
            <Space wrap>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addCustomStage(currentPipelineForDates._id)}
                type="dashed"
              >
                Add Custom Stage
              </Button>
            </Space>
          </div>
        </Card>
      </Modal>
    );
  };

  const renderSelectedPipelines = () => (
    <div style={{ marginBottom: "16px" }}>
      <h4 style={{ marginBottom: "8px" }}>Selected Pipelines</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {selectedPipelines.map((pipelineId) => {
          const pipeline = activePipelines.find((p) => p._id === pipelineId);
          if (!pipeline) return null;

          return (
            <Tag
              key={pipelineId}
              color="blue"
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              onClick={() => showPipelineDatesModal(pipelineId)}
            >
              {pipeline.name}
              {pipelineStageDates[pipelineId]?.some(
                (stage) => stage.startDate || stage.endDate
              ) && <span style={{ marginLeft: "4px" }}>(Dates set)</span>}
              <EditOutlined
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPipeline(pipeline);
                  setPipelineModalVisible(true);
                }}
              />
            </Tag>
          );
        })}
      </div>
    </div>
  );

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

              <Row gutter={[16, 8]}>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    name="pipeline"
                    label="Pipeline"
                    rules={[
                      { required: true, message: "Please select a pipeline" },
                    ]}
                  >
                    <Space.Compact style={{ width: "100%" }}>
                      <Select
                        mode="multiple"
                        placeholder="Select pipeline"
                        onChange={handlePipelineChange}
                        style={{ width: "calc(100% - 120px)" }}
                      >
                        {activePipelines.map((pipeline) => (
                          <Option key={pipeline._id} value={pipeline._id}>
                            {pipeline.name}
                          </Option>
                        ))}
                      </Select>
                      <Button
                        type="primary"
                        onClick={() => {
                          setEditingPipeline(null);
                          setPipelineModalVisible(true);
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                          width: "120px",
                        }}
                      >
                        + New Pipeline
                      </Button>
                    </Space.Compact>
                  </Form.Item>
                  {selectedPipelines.length > 0 && renderSelectedPipelines()}
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    name="assignedId"
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
                    name="isCommon"
                    label="Common Work Order"
                    valuePropName="checked"
                  >
                    <Switch />
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

            <Row justify="end" gutter={16}>
              <Col>
                <Button onClick={handleCancel}>Cancel</Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={handleNextStep}
                  style={{
                    background:
                      "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                  }}
                >
                  Next
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {renderPipelineDatesModal()}

        <CreatePipelineModal
          visible={pipelineModalVisible}
          onClose={() => setPipelineModalVisible(false)}
          editingPipeline={editingPipeline}
          onSuccess={() => {
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 8px", maxWidth: "1200px", margin: "0 auto" }}>
      <Steps
        current={currentStep}
        style={{ marginBottom: "24px" }}
        size="small"
      >
        <Steps.Step
          title={<span style={{ fontSize: "12px" }}>Job Details</span>}
          icon={<FormOutlined style={{ color: "#da2c46 " }} />}
        />
        <Steps.Step
          title={<span style={{ fontSize: "12px" }}>Application Form</span>}
          icon={<MobileOutlined style={{ color: "#da2c46 " }} />}
        />
      </Steps>

      <Row gutter={[24, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Application Form Builder"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={addApplicationField}
                style={{
                  background:
                    "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                }}
              >
                Add Field
              </Button>
            }
            style={{ marginBottom: "16px" }}
          >
            {applicationFields.length > 0 ? (
              applicationFields.map((field, index) =>
                renderFieldBuilder(field, index)
              )
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  padding: "40px 16px",
                }}
              >
                <p>No fields added yet</p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addApplicationField}
                  style={{
                    background:
                      "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                  }}
                >
                  Add First Field
                </Button>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Mobile Preview"
            extra={
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewTab("overview")}
                >
                  Overview
                </Button>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setPreviewTab("apply")}
                >
                  Apply
                </Button>
              </div>
            }
          >
            {renderMobilePreview()}
          </Card>
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: "24px" }}>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={handlePreviousStep}>
            Previous
          </Button>
        </Col>
        <Col>
          <Space>
            <Button
              type="default"
              loading={loading}
              onClick={() => handleSubmit("draft")}
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => handleSubmit("published")}
              style={{
                background:
                  "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
              }}
            >
              Publish
            </Button>
          </Space>
        </Col>
      </Row>
      {renderPipelineDatesModal()}
    </div>
  );
};

export default AddWorkOrder;

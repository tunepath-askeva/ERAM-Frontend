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
  DatePicker,
  InputNumber,
  Switch,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUpdateRecruiterJobMutation,
  useGetRecruiterJobIdQuery,
  useGetPipelinesQuery,
} from "../../Slices/Recruiter/RecruiterApis";

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

const RecruiterEditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [draggedStage, setDraggedStage] = useState(null);
  const [stageApprovers, setStageApprovers] = useState({});

  const {
    data: fetchedJobData,
    isLoading,
    error,
    refetch,
  } = useGetRecruiterJobIdQuery(id);
  const { data: pipelineData } = useGetPipelinesQuery();
  const [updateJob] = useUpdateRecruiterJobMutation();

  const activePipelines = pipelineData?.pipelines || [];

  useEffect(() => {
    if (fetchedJobData?.workOrder) {
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

        const job = fetchedJobData.workOrder;

        // Initialize pipeline stage dates
        const initialStageDates = {};
        if (job.pipelineStageTimeline) {
          job.pipelineStageTimeline.forEach((timeline) => {
            const pipelineId = job.pipeline[0]?._id;

            if (!initialStageDates[pipelineId]) {
              initialStageDates[pipelineId] = [];
            }

            initialStageDates[pipelineId].push({
              stageId: timeline.stageId,
              startDate: timeline.startDate,
              endDate: timeline.endDate,
              dependencyType: timeline.dependencyType || "independent",
            });
          });
        }

        setPipelineStageDates(initialStageDates);

        // Set selected pipelines
        const selectedPipeIds = job.pipeline?.map((p) => p._id) || [];
        setSelectedPipelines(selectedPipeIds);

        // Prepare form data
        const formData = {
          title: job.title,
          jobCode: job.jobCode,
          workplace: job.workplace,
          officeLocation: job.officeLocation,
          description: job.description,
          jobFunction: job.jobFunction,
          companyIndustry: job.companyIndustry,
          EmploymentType: job.EmploymentType,
          Experience: job.Experience,
          Education: job.Education,
          salaryType: job.salaryType,
          annualSalary: job.annualSalary,
          startDate: formatDate(job.startDate),
          endDate: formatDate(job.endDate),
          deadlineDate: formatDate(job.deadlineDate),
          alertDate: formatDate(job.alertDate),
          requiredSkills: job.requiredSkills || [],
          jobRequirements: job.jobRequirements,
          numberOfCandidate: job.numberOfCandidate,
          benefits: job.benefits || [],
          languagesRequired: job.languagesRequired || [],
          pipeline: selectedPipeIds,
          isActive: job.isActive === "active",
        };

        jobForm.setFieldsValue(formData);
        setJobData(formData);

        // Initialize custom fields
        setApplicationFields(
          job.customFields?.map((field) => ({
            ...field,
            id:
              field.id ||
              `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })) || []
        );
      } catch (error) {
        console.error("Error initializing form:", error);
        message.error("Error loading job data");
      }
    }
  }, [fetchedJobData, jobForm]);

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

      if (!pipelineStageDates[pipelineId]) {
        const initialDates = [];

        if (fetchedJobData?.pipelineStageTimeline) {
          fetchedJobData.pipelineStageTimeline
            .filter((t) => t.pipelineId === pipelineId)
            .forEach((timeline) => {
              initialDates.push({
                stageId: timeline.stageId,
                startDate: timeline.startDate,
                endDate: timeline.endDate,
                dependencyType: timeline.dependencyType || "independent",
              });
            });
        }

        pipeline.stages.forEach((stage) => {
          if (!initialDates.some((d) => d.stageId === stage._id)) {
            initialDates.push({
              stageId: stage._id,
              startDate: null,
              endDate: null,
              dependencyType: "independent",
            });
          }
        });

        if (customStages[pipelineId]) {
          customStages[pipelineId].forEach((customStage) => {
            if (!initialDates.some((d) => d.stageId === customStage.id)) {
              initialDates.push({
                stageId: customStage.id,
                startDate: null,
                endDate: null,
                dependencyType: "independent",
              });
            }
          });
        }

        setPipelineStageDates((prev) => ({
          ...prev,
          [pipelineId]: initialDates,
        }));
      }

      setPipelineDatesModalVisible(true);
    }
  };

  const handleStageDateChange = (pipelineId, stageId, field, value) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };

      if (!newDates[pipelineId]) {
        newDates[pipelineId] = [];
      }

      let stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );

      if (stageIndex === -1) {
        stageIndex = newDates[pipelineId].length;
        newDates[pipelineId].push({
          stageId,
          startDate: null,
          endDate: null,
          dependencyType: "independent",
        });
      }

      newDates[pipelineId][stageIndex] = {
        ...newDates[pipelineId][stageIndex],
        [field]: value ? value.format("YYYY-MM-DD") : null,
      };

      return newDates;
    });
  };

  const handleDependencyTypeChange = (pipelineId, stageId, value) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };

      if (!newDates[pipelineId]) {
        newDates[pipelineId] = [];
      }

      let stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );

      if (stageIndex === -1) {
        stageIndex = newDates[pipelineId].length;
        newDates[pipelineId].push({
          stageId,
          startDate: null,
          endDate: null,
          dependencyType: value,
        });
      } else {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          dependencyType: value,
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
    const allStages = [
      ...(customStages[pipelineId] || []),
      ...(currentPipelineForDates?.stages || []),
    ];

    const draggedIndex = allStages.findIndex(
      (s) => (s._id || s.id) === (draggedStage._id || draggedStage.id)
    );
    const targetIndex = allStages.findIndex(
      (s) => (s._id || s.id) === (targetStage._id || targetStage.id)
    );

    if (draggedIndex !== targetIndex) {
      const newStages = [...allStages];
      const [draggedItem] = newStages.splice(draggedIndex, 1);
      newStages.splice(targetIndex, 0, draggedItem);

      const newCustomStages = newStages.filter((s) => s.isCustom);
      const newExistingStages = newStages.filter((s) => !s.isCustom);

      setCustomStages((prev) => ({
        ...prev,
        [pipelineId]: newCustomStages,
      }));
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

  const handleApproverChange = (pipelineId, stageId, approvers) => {
    setStageApprovers((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: approvers,
      },
    }));
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = jobForm.getFieldsValue();

      const pipelineStageTimeline = selectedPipelines.flatMap((pipeId) => {
        const pipeline = activePipelines.find((p) => p._id === pipeId);
        const stages = [
          ...(customStages[pipeId] || []),
          ...(pipeline?.stages || []),
        ];

        return (
          pipelineStageDates[pipeId]?.map((dateEntry, index) => ({
            pipelineId: pipeId,
            stageId: dateEntry.stageId,
            stageName: stages.find((s) => (s._id || s.id) === dateEntry.stageId)
              ?.name,
            stageOrder: index,
            startDate: dateEntry.startDate,
            endDate: dateEntry.endDate,
            dependencyType: dateEntry.dependencyType || "independent",
            isCustomStage: !!stages.find(
              (s) => (s._id || s.id) === dateEntry.stageId
            )?.isCustom,
          })) || []
        );
      });

      const updatePayload = {
        ...jobData,
        ...values,
        customFields: applicationFields,
        pipelineStageTimeline,
        stageApprovers,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
        alertDate: values.alertDate?.format("YYYY-MM-DD"),
        isActive: values.isActive ? "active" : "inactive",
      };

      const result = await updateJob({
        id: id,
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

  const renderPipelineDatesModal = () => {
    const approvalLevels = [
      { id: "level1", name: "Level 1 - Initial Approval" },
      { id: "level2", name: "Level 2 - Manager Approval" },
      { id: "level3", name: "Level 3 - Final Approval" },
    ];
    const dependencyTypes = [
      { id: "independent", name: "Independent" },
      { id: "dependent", name: "Dependent" },
    ];

    if (!currentPipelineForDates) return null;

    const allStages = [
      ...(customStages[currentPipelineForDates._id] || []),
      ...(currentPipelineForDates.stages || []),
    ];

    const sortedStages = allStages.sort((a, b) => {
      const aIndex = pipelineStageDates[currentPipelineForDates._id]?.findIndex(
        (d) => d.stageId === (a._id || a.id)
      );
      const bIndex = pipelineStageDates[currentPipelineForDates._id]?.findIndex(
        (d) => d.stageId === (b._id || b.id)
      );
      return (aIndex || 0) - (bIndex || 0);
    });

    return (
      <Modal
        title={`Set Stage Dates & Approvals for ${
          currentPipelineForDates?.name || "Pipeline"
        }`}
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
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            }}
          >
            Save Dates & Approvals
          </Button>,
        ]}
        width={800}
      >
        {sortedStages.map((stage) => {
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
                    {stage.isCustom ? (
                      <Input
                        value={stage.name}
                        onChange={(e) =>
                          updateCustomStage(
                            currentPipelineForDates._id,
                            stageId,
                            { name: e.target.value }
                          )
                        }
                        style={{ maxWidth: "200px" }}
                        size="small"
                      />
                    ) : (
                      <span>{stage.name}</span>
                    )}
                    {stage.isCustom && (
                      <Tag color="orange" size="small">
                        Custom
                      </Tag>
                    )}
                    {dateEntry?.dependencyType && (
                      <Tag color="green" size="small">
                        {dateEntry.dependencyType}
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
                cursor: stage.isCustom ? "move" : "default",
              }}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, stage)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage, currentPipelineForDates._id)}
            >
              <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item
                    label="Start Date"
                    style={{ marginBottom: 0 }}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      size="small"
                      value={
                        dateEntry?.startDate ? dayjs(dateEntry.startDate) : null
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

                <Col xs={24} sm={12} md={12} lg={8}>
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

                <Col xs={24} sm={12} md={12} lg={8}>
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

                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item
                    label="Dependency Type"
                    style={{ marginBottom: 0 }}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Select
                      value={dateEntry?.dependencyType || "independent"}
                      onChange={(value) =>
                        handleDependencyTypeChange(
                          currentPipelineForDates._id,
                          stageId,
                          value
                        )
                      }
                      style={{ width: "100%" }}
                      size="small"
                    >
                      {dependencyTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                          {type.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          );
        })}
        <Button
          type="dashed"
          onClick={() => addCustomStage(currentPipelineForDates._id)}
          icon={<PlusOutlined />}
          style={{ width: "100%" }}
        >
          Add Custom Stage
        </Button>
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

          const hasDates =
            pipelineStageDates[pipelineId]?.some(
              (stage) => stage.startDate || stage.endDate
            ) ||
            fetchedJobData?.workOrder?.pipelineStageTimeline?.some(
              (timeline) => timeline.pipelineId === pipelineId
            );

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
              {hasDates && (
                <span style={{ marginLeft: "4px" }}>(Dates set)</span>
              )}
            </Tag>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (error) {
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
          <h3>Error Loading Job</h3>
          <p>
            {error?.data?.message ||
              error?.message ||
              "Failed to load job data"}
          </p>
          <Space>
            <Button onClick={() => refetch()}>Retry</Button>
            <Button onClick={() => navigate("/recruiter/jobs")}>
              Back to Jobs
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  if (!isLoading && !fetchedJobData?.workOrder) {
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
          <h3>Job Not Found</h3>
          <p>The job with ID {id} could not be found.</p>
          <Button onClick={() => navigate("/recruiter/jobs")}>
            Back to Jobs
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

        <Card title="Edit Job - Job Details" style={{ marginBottom: "24px" }}>
          <Form
            form={jobForm}
            layout="vertical"
            initialValues={{
              isActive: true,
            }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="title"
                  label="Job Title"
                  rules={[
                    {
                      required: true,
                      message: "Please enter job title",
                    },
                  ]}
                >
                  <Input placeholder="e.g. Senior Software Engineer" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="jobCode"
                  label="Job Code"
                  rules={[
                    {
                      required: true,
                      message: "Please enter job code",
                    },
                  ]}
                >
                  <Input placeholder="e.g. AWINC-1-1112" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={12}>
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

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item name="officeLocation" label="Office Location">
                  <Input placeholder="e.g. San Francisco, CA" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="jobFunction"
                  label="Job Function"
                  rules={[
                    {
                      required: true,
                      message: "Please enter job function",
                    },
                  ]}
                >
                  <Input placeholder="e.g. Software Development" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={12}>
                <Form.Item
                  name="Experience"
                  label="Required Experience (years)"
                  rules={[
                    {
                      required: true,
                      message: "Please enter required experience",
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
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="Education"
                  label="Required Education"
                  rules={[
                    {
                      required: true,
                      message: "Please select education level",
                    },
                  ]}
                >
                  <Select placeholder="Select education level">
                    <Option value="High School">High School</Option>
                    <Option value="Associate Degree">Associate Degree</Option>
                    <Option value="Bachelor's Degree">Bachelor's Degree</Option>
                    <Option value="Master's Degree">Master's Degree</Option>
                    <Option value="PhD">PhD</Option>
                    <Option value="None">None</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
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
                    <Option value="hourly">Hourly</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="annualSalary"
                  label="Salary Amount"
                  rules={[
                    {
                      required: true,
                      message: "Please enter salary amount",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="e.g. 80000"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
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
                    style={{ width: "100%" }}
                    placeholder="e.g. 5"
                  />
                </Form.Item>
              </Col>
            </Row>

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
              <TextArea rows={6} placeholder="Enter detailed job description" />
            </Form.Item>

            <Form.Item
              name="requiredSkills"
              label="Required Skills"
              rules={[
                {
                  required: true,
                  message: "Please add at least one skill",
                },
              ]}
            >
              <Select
                mode="tags"
                placeholder="Add skills (type and press enter)"
                tokenSeparators={[","]}
              />
            </Form.Item>

            <Form.Item
              name="jobRequirements"
              label="Additional Requirements"
              rules={[
                {
                  required: true,
                  message: "Please enter job requirements",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter any additional requirements"
              />
            </Form.Item>

            <Form.Item
              name="benefits"
              label="Benefits"
              rules={[
                {
                  required: true,
                  message: "Please add at least one benefit",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Add benefits (type and press enter)"
              />
            </Form.Item>

            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    {
                      required: true,
                      message: "Please select start date",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[
                    {
                      required: true,
                      message: "Please select end date",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="deadlineDate"
                  label="Application Deadline"
                  rules={[
                    {
                      required: true,
                      message: "Please select deadline date",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="alertDate"
              label="Alert Date (optional)"
              help="Set a date to receive reminders about this job posting"
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Card
              type="inner"
              title="Hiring Pipeline"
              style={{ marginBottom: "16px" }}
            >
              <Form.Item
                name="pipeline"
                label="Pipeline"
                rules={[
                  { required: true, message: "Please select a pipeline" },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select hiring pipelines"
                  onChange={handlePipelineChange}
                  value={selectedPipelines}
                  optionFilterProp="label"
                  showSearch
                >
                  {activePipelines.map((pipeline) => (
                    <Option
                      key={pipeline._id}
                      value={pipeline._id}
                      label={pipeline.name}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{pipeline.name}</span>
                        <Button
                          type="link"
                          size="small"
                          icon={<FormOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showPipelineDatesModal(pipeline._id);
                          }}
                        />
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedPipelines.length > 0 && renderSelectedPipelines()}
            </Card>

            <Form.Item
              name="isActive"
              label="Job Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

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
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                border: "none",
              }}
            >
              Update Job
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default RecruiterEditJob;

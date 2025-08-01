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
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {
  useUpdateRecruiterJobMutation,
  useGetRecruiterJobIdQuery,
  useGetPipelinesQuery,
  useGetAllRecruitersQuery,
  useGetAllLevelsQuery,
  useGetAllStaffsQuery,
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
  const [stageCustomFields, setStageCustomFields] = useState({});
  const [stageRequiredDocuments, setStageRequiredDocuments] = useState({});
  const [stageStaffAssignments, setStageStaffAssignments] = useState({});
  const [stageRecruiterAssignments, setStageRecruiterAssignments] = useState(
    {}
  );

  const {
    data: fetchedJobData,
    isLoading,
    error,
    refetch,
  } = useGetRecruiterJobIdQuery(id);
  const { data: pipelineData } = useGetPipelinesQuery();
  const { data: recruiterData } = useGetAllRecruitersQuery();
  const { data: staffData } = useGetAllStaffsQuery();
  const { data: levelData } = useGetAllLevelsQuery();
  // const { data: clientsData } = useGetClientsQuery();
  const [updateJob] = useUpdateRecruiterJobMutation();

  const activePipelines = pipelineData?.pipelines || [];
  // const clients = clientsData?.clients || [];
  const recruiters = recruiterData?.otherRecruiters || [];
  const staffs = staffData?.otherRecruiters || [];
  const levelGroups = levelData?.otherRecruiters || [];
  useEffect(() => {
    if (fetchedJobData?.workOrder) {
      try {
        const formatDate = (dateString) => {
          if (!dateString) return null;
          try {
            const datePart = dateString.split("T")[0];
            return dayjs(datePart);
          } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return null;
          }
        };

        const job = fetchedJobData.workOrder;

        const initialStageDates = {};
        const initialCustomStages = {};
        const initialStageCustomFields = {};
        const initialStageRequiredDocuments = {};
        const initialStageStaffAssignments = {};
        const initialStageRecruiterAssignments = {};

        if (job.pipelineStageTimeline) {
          job.pipelineStageTimeline.forEach((timeline) => {
            const pipelineId = timeline.pipelineId._id;
            const stageId = timeline.stageId;
            if (!initialStageDates[pipelineId]) {
              initialStageDates[pipelineId] = [];
            }

            initialStageDates[pipelineId].push({
              stageId: timeline.stageId,
              startDate: timeline.startDate,
              endDate: timeline.endDate,
              dependencyType: timeline.dependencyType || "independent",
              approvalId: timeline.approvalId?._id || undefined,
            });

            if (timeline.isCustomStage) {
              if (!initialCustomStages[pipelineId]) {
                initialCustomStages[pipelineId] = [];
              }

              const existingCustomStage = initialCustomStages[pipelineId].find(
                (s) => (s._id || s.id) === timeline.stageId
              );

              if (!existingCustomStage) {
                initialCustomStages[pipelineId].push({
                  id: timeline.stageId,
                  _id: timeline.stageId,
                  name: timeline.stageName,
                  description: "",
                  isCustom: true,
                });
              }
            }

            if (timeline.approvalId) {
              handleLevelChange(
                pipelineId,
                timeline.stageId,
                timeline.approvalId._id
              );
            }

            if (!initialStageCustomFields[pipelineId]) {
              initialStageCustomFields[pipelineId] = {};
            }
            if (!initialStageRequiredDocuments[pipelineId]) {
              initialStageRequiredDocuments[pipelineId] = {};
            }
            if (!initialStageStaffAssignments[pipelineId]) {
              initialStageStaffAssignments[pipelineId] = {};
            }
            if (!initialStageRecruiterAssignments[pipelineId]) {
              initialStageRecruiterAssignments[pipelineId] = {};
            }

            initialStageCustomFields[pipelineId][timeline.stageId] =
              timeline.customFields?.map((field) => ({
                ...field,
                id:
                  field._id ||
                  `field_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
              })) || [];

            initialStageRequiredDocuments[pipelineId][timeline.stageId] =
              timeline.requiredDocuments?.map((doc) => ({
                ...doc,
                id:
                  doc._id ||
                  `doc_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
              })) || [];

            initialStageStaffAssignments[pipelineId][timeline.stageId] =
              timeline.staffIds?.map((staff) => staff._id) || [];

            initialStageRecruiterAssignments[pipelineId][timeline.stageId] =
              timeline.recruiterIds?.map((recruiter) => recruiter._id) || [];
          });
        }

        setPipelineStageDates(initialStageDates);
        setCustomStages(initialCustomStages);
        setStageStaffAssignments(initialStageStaffAssignments);
        setStageRecruiterAssignments(initialStageRecruiterAssignments);

        const selectedPipeIds = job.pipeline?.map((p) => p._id) || [];
        setSelectedPipelines(selectedPipeIds);

        setApplicationFields(
          job.customFields?.map((field) => ({
            ...field,
            id:
              field._id ||
              `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })) || []
        );

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
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          experienceMin: job.experienceMin,
          experienceMax: job.experienceMax,
          startDate: formatDate(job.startDate),
          endDate: formatDate(job.endDate),
          deadlineDate: formatDate(job.deadlineDate),
          alertDate: formatDate(job.alertDate),
          requiredSkills: job.requiredSkills || [],
          jobRequirements: job.jobRequirements,
          keyResponsibilities: job.keyResponsibilities,
          qualification: job.qualification,
          numberOfCandidate: job.numberOfCandidate,
          benefits: job.benefits || [],
          languagesRequired: job.languagesRequired || [],
          client: job.client?._id,
          pipeline: selectedPipeIds,
          isActive: job.isActive === "active",
        };

        jobForm.setFieldsValue(formData);
        setJobData(formData);
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
        const existingStageIds = new Set();

        if (fetchedJobData?.workOrder?.pipelineStageTimeline) {
          fetchedJobData.workOrder.pipelineStageTimeline
            .filter((t) => t.pipelineId === pipelineId)
            .forEach((timeline) => {
              if (!existingStageIds.has(timeline.stageId)) {
                initialDates.push({
                  stageId: timeline.stageId,
                  startDate: timeline.startDate,
                  endDate: timeline.endDate,
                  dependencyType: timeline.dependencyType || "independent",
                });
                existingStageIds.add(timeline.stageId);
              }
            });
        }

        pipeline.stages.forEach((stage) => {
          if (!existingStageIds.has(stage._id)) {
            initialDates.push({
              stageId: stage._id,
              startDate: null,
              endDate: null,
              dependencyType: "independent",
            });
            existingStageIds.add(stage._id);
          }
        });

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

  const addStageCustomField = (pipelineId, stageId) => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
    };

    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: [...(prev[pipelineId]?.[stageId] || []), newField],
      },
    }));
  };

  const addStageRequiredDocument = (pipelineId, stageId) => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: "New Document",
    };

    setStageRequiredDocuments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: [...(prev[pipelineId]?.[stageId] || []), newDoc],
      },
    }));
  };

  const updateStageCustomField = (pipelineId, stageId, fieldId, updates) => {
    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      },
    }));
  };

  const removeStageCustomField = (pipelineId, stageId, fieldId) => {
    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).filter(
          (field) => field.id !== fieldId
        ),
      },
    }));
  };

  const updateStageRequiredDocument = (pipelineId, stageId, docId, updates) => {
    setStageRequiredDocuments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).map((doc) =>
          doc.id === docId ? { ...doc, ...updates } : doc
        ),
      },
    }));
  };

  const removeStageRequiredDocument = (pipelineId, stageId, docId) => {
    setStageRequiredDocuments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).filter(
          (doc) => doc.id !== docId
        ),
      },
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
          pipelineStageDates[pipeId]?.map((dateEntry, index) => {
            const originalStage =
              fetchedJobData?.workOrder?.pipelineStageTimeline?.find(
                (timeline) =>
                  timeline.pipelineId === pipeId &&
                  timeline.stageId === dateEntry.stageId
              );

            const stage = stages.find(
              (s) => (s._id || s.id) === dateEntry.stageId
            );
            const isCustom = !pipeline?.stages?.some(
              (s) => s._id === dateEntry.stageId
            );
            const customFields =
              stageCustomFields[pipeId]?.[dateEntry.stageId] || [];

            const requiredDocuments =
              stageRequiredDocuments[pipeId]?.[dateEntry.stageId] || [];

            const staffIds =
              stageStaffAssignments[pipeId]?.[dateEntry.stageId] || [];
            const recruiterIds =
              stageRecruiterAssignments[pipeId]?.[dateEntry.stageId] || [];

            return {
              pipelineId: pipeId,
              stageId: dateEntry.stageId,
              stageName: stages.find(
                (s) => (s._id || s.id) === dateEntry.stageId
              )?.name,
              stageOrder: index,
              startDate: dateEntry.startDate,
              endDate: dateEntry.endDate,
              dependencyType: dateEntry.dependencyType || "independent",
              isCustomStage: isCustom,
              recruiterIds: recruiterIds.map((id) => ({ _id: id })),
              staffIds: staffIds.map((id) => ({ _id: id })),
              approvalId: dateEntry.approvalId || null,
              customFields: customFields.map((field) => ({
                _id: field._id,
                label: field.label,
                type: field.type,
                required: field.required,
                options: field.options || [],
                ...(field.type === "file" && {
                  maxFileSize: field.maxFileSize,
                  acceptedFormats: field.acceptedFormats,
                }),
                ...(field.type === "text" && {
                  minLength: field.minLength,
                  maxLength: field.maxLength,
                }),
                ...(field.type === "textarea" && {
                  minLength: field.minLength,
                  maxLength: field.maxLength,
                  rows: field.rows,
                }),
                ...(field.type === "number" && {
                  minValue: field.minValue,
                  maxValue: field.maxValue,
                }),
                ...(field.type === "date" && {
                  allowPastDates: field.allowPastDates,
                  allowFutureDates: field.allowFutureDates,
                }),
              })),
              requiredDocuments: requiredDocuments.map((doc) => ({
                _id: doc._id,
                title: doc.title,
              })),
            };
          }) || []
        );
      });

      const updatePayload = {
        ...jobData,
        ...values,
        customFields: applicationFields,
        pipelineStageTimeline,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
        alertDate: values.alertDate?.format("YYYY-MM-DD"),
        isActive: "active",
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

  const handleStaffAssignmentChange = (pipelineId, stageId, staffIds) => {
    setStageStaffAssignments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: staffIds,
      },
    }));
  };

  const handleLevelChange = (pipelineId, stageId, levelId) => {
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
          approvalId: levelId,
          startDate: null,
          endDate: null,
          dependencyType: "independent",
        });
      } else {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          approvalId: levelId,
        };
      }

      return newDates;
    });
  };

  const handleRecruiterAssignmentChange = (
    pipelineId,
    stageId,
    recruiterIds
  ) => {
    setStageRecruiterAssignments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: recruiterIds,
      },
    }));
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

          {/* Experience Range */}
          <div style={{ marginBottom: "12px" }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Experience Required
            </h4>
            <p style={{ margin: "0", fontSize: "12px" }}>
              {displayData?.experienceMin || "0"} -{" "}
              {displayData?.experienceMax || "0"} years
            </p>
          </div>

          {/* Salary Range */}
          {displayData?.salaryMin && displayData?.salaryMax && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Salary Range
              </h4>
              <p style={{ margin: "0", fontSize: "12px" }}>
                {displayData.salaryType === "annual" && "$"}
                {displayData.salaryMin.toLocaleString()} -{" "}
                {displayData.salaryMax.toLocaleString()}
                {displayData.salaryType === "hourly" && " per hour"}
                {displayData.salaryType === "weekly" && " per week"}
                {displayData.salaryType === "monthly" && " per month"}
                {displayData.salaryType === "annual" && " per year"}
              </p>
            </div>
          )}

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

          {/* Key Responsibilities */}
          {displayData?.keyResponsibilities && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Key Responsibilities
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
                {displayData.keyResponsibilities}
              </p>
            </div>
          )}

          {/* Qualifications */}
          {displayData?.qualification && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Qualifications
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
                {displayData.qualification}
              </p>
            </div>
          )}

          {/* Required Languages */}
          {displayData?.languagesRequired?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Required Languages
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                {displayData.languagesRequired.map((language, index) => (
                  <Tag
                    key={index}
                    color="blue"
                    style={{
                      fontSize: "10px",
                      margin: "0",
                      padding: "2px 6px",
                    }}
                  >
                    {language}
                  </Tag>
                ))}
              </div>
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
    if (!currentPipelineForDates) return null;

    const pipelineId = currentPipelineForDates._id;
    const pipelineStages = currentPipelineForDates.stages || [];
    const pipelineCustomStages = customStages[pipelineId] || [];
    const allStages = [
      ...pipelineStages.map((stage) => ({ ...stage, isCustom: false })),
      ...pipelineCustomStages.map((stage) => ({ ...stage, isCustom: true })),
    ];

    const sortedStages = allStages.sort((a, b) => {
      const aIndex = pipelineStageDates[pipelineId]?.findIndex(
        (d) => d.stageId === (a._id || a.id)
      );
      const bIndex = pipelineStageDates[pipelineId]?.findIndex(
        (d) => d.stageId === (b._id || b.id)
      );
      return (aIndex || 0) - (bIndex || 0);
    });

    // Get assigned recruiters from work order
    const assignedRecruiters =
      fetchedJobData?.workOrder?.assignedRecruiters || [];
    // Get staff members (you may need to fetch this from your API)
    const staffMembers = [
      {
        _id: "68763ddd529fd3206aead692",
        fullName: "dhoni parvez",
        email: "rohithdhoniparvez@gmail.com",
      },
      // Add more staff members as needed
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
        width={900}
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px 24px",
        }}
      >
        {sortedStages.map((stage) => {
          const stageId = stage._id || stage.id;
          const dateEntry = pipelineStageDates[pipelineId]?.find(
            (d) => d.stageId === stageId
          );
          const stageDetails =
            fetchedJobData?.workOrder?.pipelineStageTimeline?.find(
              (timeline) =>
                timeline.pipelineId._id === pipelineId &&
                timeline.stageId === stageId
            );

          const stageFields = stageCustomFields[pipelineId]?.[stageId] || [];
          const stageDocs = stageRequiredDocuments[pipelineId]?.[stageId] || [];
          const assignedStaff =
            stageStaffAssignments[pipelineId]?.[stageId] || [];
          const assignedRecruitersForStage =
            stageRecruiterAssignments[pipelineId]?.[stageId] || [];

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
                          updateCustomStage(pipelineId, stageId, {
                            name: e.target.value,
                          })
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
                        onClick={() => removeCustomStage(pipelineId, stageId)}
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
              onDrop={(e) => handleDrop(e, stage, pipelineId)}
            >
              <Row gutter={[16, 16]} align="bottom">
                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item label="Start Date" style={{ marginBottom: 0 }}>
                    <DatePicker
                      style={{ width: "100%" }}
                      size="small"
                      value={
                        dateEntry?.startDate ? dayjs(dateEntry.startDate) : null
                      }
                      onChange={(date) =>
                        handleStageDateChange(
                          pipelineId,
                          stageId,
                          "startDate",
                          date
                        )
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item label="End Date" style={{ marginBottom: 0 }}>
                    <DatePicker
                      style={{ width: "100%" }}
                      size="small"
                      value={
                        dateEntry?.endDate ? dayjs(dateEntry.endDate) : null
                      }
                      onChange={(date) =>
                        handleStageDateChange(
                          pipelineId,
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
                    label="Dependency Type"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      value={dateEntry?.dependencyType || "independent"}
                      onChange={(value) =>
                        handleDependencyTypeChange(pipelineId, stageId, value)
                      }
                      style={{ width: "100%" }}
                      size="small"
                    >
                      <Option value="independent">Independent</Option>
                      <Option value="dependent">Dependent</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item
                    label="Assigned Recruiters"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      mode="multiple"
                      value={assignedRecruitersForStage}
                      onChange={(value) =>
                        handleRecruiterAssignmentChange(
                          pipelineId,
                          stageId,
                          value
                        )
                      }
                      style={{ width: "100%" }}
                      size="small"
                      placeholder="Select recruiters"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {recruiters.map((recruiter) => (
                        <Option key={recruiter._id} value={recruiter._id}>
                          {recruiter.fullName || recruiter.email}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item label="Assigned Staff" style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      value={assignedStaff}
                      onChange={(value) =>
                        handleStaffAssignmentChange(pipelineId, stageId, value)
                      }
                      style={{ width: "100%" }}
                      size="small"
                      placeholder="Select staff"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {staffs.map((staff) => (
                        <Option key={staff._id} value={staff._id}>
                          {staff.fullName || staff.email}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={8}>
                  <Form.Item label="Approval Level" style={{ marginBottom: 0 }}>
                    <Select
                      style={{ width: "100%" }}
                      size="small"
                      placeholder="Select approval level"
                      value={dateEntry?.approvalId || undefined}
                      onChange={(value) =>
                        handleLevelChange(pipelineId, stageId, value)
                      }
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {levelGroups.map((group) => (
                        <Option key={group._id} value={group._id}>
                          {group.groupName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" plain style={{ margin: "16px 0" }}>
                Stage Requirements
              </Divider>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => addStageCustomField(pipelineId, stageId)}
                  >
                    Add Custom Field
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    block
                    onClick={() =>
                      addStageRequiredDocument(pipelineId, stageId)
                    }
                  >
                    Add Required Document
                  </Button>
                </Col>
              </Row>

              {stageFields.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4>Custom Fields:</h4>
                  {stageFields.map((field) => (
                    <Card
                      key={field.id}
                      size="small"
                      style={{ marginBottom: 8 }}
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() =>
                            removeStageCustomField(
                              pipelineId,
                              stageId,
                              field.id
                            )
                          }
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateStageCustomField(
                                pipelineId,
                                stageId,
                                field.id,
                                { label: e.target.value }
                              )
                            }
                            placeholder="Field Label"
                          />
                        </Col>
                        <Col span={12}>
                          <Select
                            value={field.type}
                            onChange={(value) =>
                              updateStageCustomField(
                                pipelineId,
                                stageId,
                                field.id,
                                { type: value }
                              )
                            }
                            style={{ width: "100%" }}
                          >
                            {fieldTypes.map((type) => (
                              <Option key={type.value} value={type.value}>
                                {type.label}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                      <Checkbox
                        checked={field.required}
                        onChange={(e) =>
                          updateStageCustomField(
                            pipelineId,
                            stageId,
                            field.id,
                            { required: e.target.checked }
                          )
                        }
                        style={{ marginTop: 8 }}
                      >
                        Required
                      </Checkbox>
                      {renderFieldTypeControls(field, pipelineId, stageId)}
                    </Card>
                  ))}
                </div>
              )}

              {stageDocs.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4>Required Documents:</h4>
                  {stageDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      size="small"
                      style={{ marginBottom: 8 }}
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() =>
                            removeStageRequiredDocument(
                              pipelineId,
                              stageId,
                              doc.id
                            )
                          }
                        />
                      }
                    >
                      <Input
                        value={doc.title}
                        onChange={(e) =>
                          updateStageRequiredDocument(
                            pipelineId,
                            stageId,
                            doc.id,
                            { title: e.target.value }
                          )
                        }
                        placeholder="Document Title"
                      />
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
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

          const pipelineStages =
            fetchedJobData?.workOrder?.pipelineStageTimeline?.filter(
              (timeline) => timeline.pipelineId._id === pipelineId
            ) || [];

          const hasDates = pipelineStages.some(
            (stage) => stage.startDate || stage.endDate
          );

          const hasApprovals = pipelineStages.some((stage) => stage.approvalId);

          const hasRecruiters = pipelineStages.some(
            (stage) => stage.recruiterId
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
                <span style={{ marginLeft: "4px" }}>
                  <CalendarOutlined />
                </span>
              )}
              {hasApprovals && (
                <span style={{ marginLeft: "4px" }}>
                  <SafetyCertificateOutlined />
                </span>
              )}
              {hasRecruiters && (
                <span style={{ marginLeft: "4px" }}>
                  <UserOutlined />
                </span>
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
          <Form form={jobForm} layout="vertical">
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="title"
                  label="Job Title"
                  rules={[
                    { required: true, message: "Please enter job title" },
                  ]}
                >
                  <Input placeholder="e.g. Senior Software Engineer" disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="jobCode"
                  label="Job Code"
                  rules={[{ required: true, message: "Please enter job code" }]}
                >
                  <Input placeholder="e.g. AWINC-1-1112" disabled />
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
                    { required: true, message: "Please enter job function" },
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
                <Form.Item name="client" label="Client">
                  <Select
                    placeholder="Select client"
                    showSearch
                    disabled
                    value={fetchedJobData?.workOrder?.client?._id}
                  >
                    {fetchedJobData?.workOrder?.client && (
                      <Option
                        key={fetchedJobData.workOrder.client._id}
                        value={fetchedJobData.workOrder.client._id}
                      >
                        {fetchedJobData.workOrder.client.fullName ||
                          fetchedJobData.workOrder.client.email}
                      </Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Experience Range */}
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
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
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: "100%" }}
                    placeholder="e.g. 3"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
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
                  <InputNumber
                    min={0}
                    max={50}
                    style={{ width: "100%" }}
                    placeholder="e.g. 5"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Salary Range */}
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={6}>
                <Form.Item
                  name="salaryMin"
                  label="Minimum Salary"
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
              <Col xs={24} sm={6}>
                <Form.Item
                  name="salaryMax"
                  label="Maximum Salary"
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

            <Form.Item
              name="description"
              label="Job Description"
              rules={[
                { required: true, message: "Please enter job description" },
              ]}
            >
              <TextArea rows={6} placeholder="Enter detailed job description" />
            </Form.Item>

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
              <TextArea rows={4} placeholder="Enter key responsibilities" />
            </Form.Item>

            <Form.Item
              name="qualification"
              label="Qualifications"
              rules={[
                { required: true, message: "Please enter qualifications" },
              ]}
            >
              <TextArea rows={4} placeholder="Enter required qualifications" />
            </Form.Item>

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

            <Form.Item name="languagesRequired" label="Languages Required">
              <Select
                mode="tags"
                placeholder="Add languages (type and press enter)"
                tokenSeparators={[","]}
              />
            </Form.Item>

            <Form.Item
              name="jobRequirements"
              label="Additional Requirements"
              rules={[
                { required: true, message: "Please enter job requirements" },
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
                { required: true, message: "Please add at least one benefit" },
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
                    { required: true, message: "Please select start date" },
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
                    { required: true, message: "Please select end date" },
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
                    { required: true, message: "Please select deadline date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} disabled />
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
            style={{
              height: "680px",
              display: "flex",
              flexDirection: "column",
            }}
            bodyStyle={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {applicationFields.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
              <div
                style={{
                  overflowY: "auto",
                  flex: 1,
                  paddingRight: "8px",
                }}
              >
                {applicationFields.map((field, index) =>
                  renderFieldBuilder(field, index)
                )}
              </div>
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

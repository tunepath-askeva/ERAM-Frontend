import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
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
  Modal,
  Skeleton,
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
import CreatePipelineModal from "./CreatePipelineModal.jsx";
import { ObjectId } from "bson";
import {
  useGetRecruitersQuery,
  useGetPipelinesQuery,
  useGetProjectsQuery,
  useEditWorkOrderMutation,
  useGetAdminBranchQuery,
  useGetWorkOrderByIdQuery,
  useGetApprovalQuery,
  useGetClientsQuery,
  useGetStaffsQuery,
  useGetRecruitersNameQuery,
} from "../../Slices/Admin/AdminApis.js";
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
  const { enqueueSnackbar } = useSnackbar();
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
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [customStages, setCustomStages] = useState({});
  const [draggedStage, setDraggedStage] = useState(null);
  const [stageApprovers, setStageApprovers] = useState({});
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  const { data: approvalData, isLoading: isLoadingApprovals } =
    useGetApprovalQuery({
      includePagination: false,
    });
  const { data: Branch } = useGetAdminBranchQuery();
  // const { data: recruiters } = useGetRecruitersQuery();
  const { data: recruiters } = useGetRecruitersNameQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: pipeline, refetch: refetchPipeline } = useGetPipelinesQuery();
  const {
    data: workOrderData,
    isLoading: isLoadingWorkOrder,
    error,
    refetch,
  } = useGetWorkOrderByIdQuery(id, {
    skip: !id,
  });
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery(
    {
      includePagination: false,
    }
  );
  const { data: staffsData, isLoading: isLoadingStaffs } = useGetStaffsQuery({
    includePagination: false,
  });
  const [editWorkOrder] = useEditWorkOrderMutation();

  const branchId = Branch?.branch?._id;

  const activeRecruiters =
    recruiters?.recruitername?.filter(
      (recruiter) => recruiter.accountStatus === "active"
    ) || [];

  const activePipelines =
    pipeline?.allPipelines?.filter(
      (pipeline) => pipeline.pipelineStatus === "active"
    ) || [];

  const activeProjects =
    projects?.allProjects?.filter((project) => project.status === "active") ||
    [];

  const activeClients =
    clientsData?.clients?.filter(
      (client) =>
        client.clientType === "Customer" && client.accountStatus === "active"
    ) || [];

  const activeStaffs =
    staffsData?.staffs?.filter((staff) => staff.accountStatus === "active") ||
    [];

  useEffect(() => {
    console.log("Edit WorkOrder - Clients Data:", clientsData);
    console.log("Edit WorkOrder - Active Clients:", activeClients);
    console.log("Edit WorkOrder - Staffs Data:", staffsData);
    console.log("Edit WorkOrder - Active Staffs:", activeStaffs);
  }, [clientsData, staffsData]);

  useEffect(() => {
    if (workOrderData?.workOrder) {
      const workOrder = workOrderData.workOrder;
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

        // Initialize pipeline stage dates from API response
        const initialStageDates = {};
        const initialCustomStages = {};

        if (workOrder.pipelineStageTimeline) {
          workOrder.pipelineStageTimeline.forEach((timeline) => {
            const pipelineId = timeline.pipelineId._id;

            if (!initialStageDates[pipelineId]) {
              initialStageDates[pipelineId] = [];
            }

            if (timeline.isCustomStage) {
              if (!initialCustomStages[pipelineId]) {
                initialCustomStages[pipelineId] = [];
              }

              initialCustomStages[pipelineId].push({
                id: timeline.stageId,
                name: timeline.stageName,
                isCustom: true,
              });
            }

            initialStageDates[pipelineId].push({
              stageId: timeline.stageId,
              stageName: timeline.stageName,
              startDate: timeline.startDate,
              endDate: timeline.endDate,
              dependencyType: timeline.dependencyType || "independent",
              approvalId: timeline.approvalId?._id || null,
              recruiterIds: timeline.recruiterIds?.map((r) => r._id) || [],
              staffIds: timeline.staffIds?.map((s) => s._id) || [],
              isCustomStage: timeline.isCustomStage || false,
            });
          });
        }

        setCustomStages(initialCustomStages);
        setPipelineStageDates(initialStageDates);
        setSelectedPipelines(
          Array.isArray(workOrder.pipeline)
            ? workOrder.pipeline.map((p) => p._id)
            : [workOrder.pipeline._id]
        );

        // Handle benefits - ensure it's always an array
        const benefits = Array.isArray(workOrder.benefits)
          ? workOrder.benefits.join("\n")
          : workOrder.benefits || "";

        const formData = {
          ...workOrder,
          pipeline: Array.isArray(workOrder.pipeline)
            ? workOrder.pipeline.map((p) => p._id)
            : [workOrder.pipeline._id],
          numberOfCandidates: workOrder.numberOfCandidate,
          startDate: formatDate(workOrder.startDate),
          endDate: formatDate(workOrder.endDate),
          deadlineDate: formatDate(workOrder.deadlineDate),
          alertDate: formatDate(workOrder.alertDate),
          assignedRecruiters:
            workOrder.assignedRecruiters?.map((r) => r._id) || [],
          client: workOrder.client?._id || null, // Handle null client
          languagesRequired: Array.isArray(workOrder.languagesRequired)
            ? workOrder.languagesRequired
            : (workOrder.languagesRequired || "")
                .split(",")
                .filter((lang) => lang.trim()),
          project: workOrder.project._id,
          requiredSkills: workOrder.requiredSkills || [],
          qualification: workOrder.qualification || "Qualification",
          keyResponsibilities:
            workOrder.keyResponsibilities || "Responsibilities",
          isCommon: workOrder.isCommon || false,
          isActive: workOrder.isActive === "active",
          benefits: benefits,
        };

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
        setDocuments(
          workOrder.documents?.map((doc) => ({
            id: doc._id || Date.now() + Math.random().toString(36).substr(2, 9),
            name: doc.name,
            description: doc.description,
            isMandatory: doc.isMandatory !== false, // Default to true if not specified
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

      const initialDates =
        workOrderData?.workOrder?.pipelineStageTimeline
          ?.filter((t) => t.pipelineId._id === pipelineId)
          ?.map((timeline) => ({
            stageId: timeline.stageId,
            stageName: timeline.stageName,
            startDate: timeline.startDate,
            endDate: timeline.endDate,
            dependencyType: timeline.dependencyType || "independent",
            approvalId: timeline.approvalId?._id || null,
            recruiterIds: timeline.recruiterIds?.map((r) => r._id) || [],
            staffIds: timeline.staffIds?.map((s) => s._id) || [],
            isCustomStage: timeline.isCustomStage || false,
          })) || [];

      setPipelineStageDates((prev) => ({
        ...prev,
        [pipelineId]: initialDates,
      }));
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

      if (field === "startDate" || field === "endDate") {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          [field]: value ? dayjs(value).format("YYYY-MM-DD") : null,
        };
      } else {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          [field]: value,
        };
      }

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
      id: new ObjectId().toString(),
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

  const addDocument = () => {
    const newDocument = {
      id: Date.now(),
      name: "",
      description: "",
      isMandatory: true,
    };
    setDocuments([...documents, newDocument]);
  };

  const updateDocument = (id, updates) => {
    setDocuments((docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const removeDocument = (id) => {
    setDocuments((docs) => docs.filter((doc) => doc.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = jobForm.getFieldsValue();

      const pipelineStageTimeline = selectedPipelines.flatMap((pipeId) => {
        const stages = [
          ...(customStages[pipeId] || []),
          ...(activePipelines.find((p) => p._id === pipeId)?.stages || []),
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
            approvalId: dateEntry.approvalId || null,
            recruiterIds: dateEntry.recruiterIds || [],
            staffIds: dateEntry.staffIds || [],
            isCustomStage: !!stages.find(
              (s) => (s._id || s.id) === dateEntry.stageId
            )?.isCustom,
          })) || []
        );
      });

      const workOrderPayload = {
        ...values,
        ...jobData,

        pipeline: selectedPipelines,
        customFields: applicationFields,
        workOrderStatus: "published",
        pipelineStageTimeline,
        documents: documents.map((doc) => ({
          name: doc.name,
          description: doc.description,
          isMandatory: doc.isMandatory,
        })),
        client: values.client || jobData.client,
        languagesRequired:
          values.languagesRequired || jobData.languagesRequired || [],
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
        alertDate: values.alertDate?.format("YYYY-MM-DD"),
        isActive: "active",
        numberOfCandidate: values.numberOfCandidates,
      };

      console.log("Final payload:", workOrderPayload); // Debug log
      const result = await editWorkOrder({ id, ...workOrderPayload }).unwrap();

      enqueueSnackbar("Work order updated and published successfully!", {
        variant: "success",
      });

      navigate("/admin/workorder");
    } catch (error) {
      console.error("Error updating work order:", error);

      enqueueSnackbar(
        error?.data?.message ||
          "Failed to update work order. Please try again.",
        {
          variant: "error",
        }
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
              color: "#da2c46",
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
              marginBottom: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              background: "#fafafa",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            <Tag color="blue" style={{ fontSize: "12px", padding: "6px 10px" }}>
              <strong>Work Type:</strong>{" "}
              {displayData?.EmploymentType || "Full-time"}
            </Tag>

            <Tag
              color="green"
              style={{ fontSize: "12px", padding: "6px 10px" }}
            >
              <strong>Work Place:</strong> {displayData?.workplace || "Remote"}
            </Tag>

            {displayData?.officeLocation && (
              <Tag
                color="geekblue"
                style={{ fontSize: "12px", padding: "6px 10px" }}
              >
                <strong>Job Location:</strong> {displayData.officeLocation}
              </Tag>
            )}

            {displayData?.nationality && (
              <Tag
                color="volcano"
                style={{ fontSize: "12px", padding: "6px 10px" }}
              >
                <strong>Nationality:</strong> {displayData.nationality}
              </Tag>
            )}

            {displayData?.visacategory && (
              <Tag
                color="purple"
                style={{ fontSize: "12px", padding: "6px 10px" }}
              >
                <strong>Visa Category:</strong> {displayData.visacategory}
              </Tag>
            )}

            {displayData?.visacategorytype && (
              <Tag
                color="gold"
                style={{ fontSize: "12px", padding: "6px 10px" }}
              >
                <strong>Visa Category Type:</strong>{" "}
                {displayData.visacategorytype}
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

          {displayData?.keyResponsibilities && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Key Responsibilities
              </h4>
              <p style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                {displayData.keyResponsibilities}
              </p>
            </div>
          )}

          <Row gutter={8} style={{ marginBottom: "12px" }}>
            <Col span={12}>
              {displayData?.experienceMin !== undefined &&
                displayData?.experienceMax !== undefined && (
                  <div style={{ marginBottom: "12px" }}>
                    <h4
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Experience
                    </h4>
                    <p style={{ margin: 0, fontSize: "12px" }}>
                      {displayData.experienceMin} - {displayData.experienceMax}{" "}
                      years
                    </p>
                  </div>
                )}
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

          {displayData?.salaryMin !== undefined &&
            displayData?.salaryMax !== undefined && (
              <div style={{ marginBottom: "12px" }}>
                <h4
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Salary Range
                </h4>
                <p style={{ margin: 0, fontSize: "12px" }}>
                  SAR {displayData.salaryMin?.toLocaleString()} - SAR{" "}
                  {displayData.salaryMax?.toLocaleString()}
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

          {documents?.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Required Documents
              </h4>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <span style={{ marginRight: "4px" }}>
                      {doc.isMandatory ? "•" : "◦"}
                    </span>
                    <span style={{ fontSize: "12px" }}>
                      <strong>{doc.name}</strong>
                      {doc.description && ` - ${doc.description}`}
                    </span>
                  </div>
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

          {displayData?.qualification && (
            <div style={{ marginBottom: "12px" }}>
              <h4
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Qualification
              </h4>
              <p style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                {displayData.qualification}
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
    const approvalLevels =
      approvalData?.approvals?.map((approval) => ({
        id: approval._id,
        name: approval.groupName,
      })) || [];
    const dependencyTypes = [
      { id: "independent", name: "Independent" },
      { id: "dependent", name: "Dependent" },
    ];

    if (!currentPipelineForDates) return null;

    // Combine existing stages with custom stages
    const allStages = [
      ...(currentPipelineForDates.stages || []),
      ...(customStages[currentPipelineForDates._id] || []),
    ];

    // Get all approval levels already selected in this pipeline
    const usedApprovalLevels = new Set(
      pipelineStageDates[currentPipelineForDates._id]
        ?.filter((stage) => stage.approvalId)
        .map((stage) => stage.approvalId)
    );

    // Get timeline data for the current pipeline from API response
    const pipelineTimeline =
      workOrderData?.workOrder?.pipelineStageTimeline?.filter(
        (timeline) => timeline.pipelineId._id === currentPipelineForDates._id
      ) || [];

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
        bodyStyle={{
          maxHeight: "70vh",
          overflowY: "auto",
          padding: "0 24px",
        }}
      >
        <div style={{ padding: "16px 0" }}>
          {allStages.map((stage, index) => {
            const stageId = stage._id || stage.id;
            // Find timeline data for this stage
            const timelineData = pipelineTimeline.find(
              (t) => t.stageId === stageId
            );

            // Get date entry from local state or fallback to API data
            const dateEntry =
              pipelineStageDates[currentPipelineForDates._id]?.find(
                (d) => d.stageId === stageId
              ) ||
              (timelineData
                ? {
                    stageId: timelineData.stageId,
                    startDate: timelineData.startDate,
                    endDate: timelineData.endDate,
                    dependencyType: timelineData.dependencyType,
                    approvalId: timelineData.approvalId?._id,
                    recruiterId: timelineData.recruiterId?._id,
                  }
                : null);

            const availableApprovalLevels = approvalLevels;

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
                      <span
                        style={{ cursor: stage.isCustom ? "grab" : "default" }}
                      >
                        ⋮⋮
                      </span>
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
                draggable={stage.isCustom}
                onDragStart={(e) => stage.isCustom && handleDragStart(e, stage)}
                onDragOver={handleDragOver}
                onDrop={(e) =>
                  stage.isCustom &&
                  handleDrop(e, stage, currentPipelineForDates._id)
                }
              >
                <Row gutter={[16, 16]} align="bottom">
                  {/* Date Section */}
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

                  {/* Recruiter Assignment */}
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Assigned Recruiters"
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select recruiters"
                        value={dateEntry?.recruiterIds || []}
                        onChange={(value) =>
                          handleStageDateChange(
                            currentPipelineForDates._id,
                            stageId,
                            "recruiterIds",
                            value
                          )
                        }
                        style={{ width: "100%" }}
                        size="small"
                      >
                        {activeRecruiters.map((recruiter) => (
                          <Option key={recruiter._id} value={recruiter._id}>
                            {recruiter.fullName} - {recruiter.email}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Approval Level */}
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Required Approval"
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Select
                        placeholder="Select approval level"
                        value={dateEntry?.approvalId || undefined}
                        onChange={(value) =>
                          handleStageDateChange(
                            currentPipelineForDates._id,
                            stageId,
                            "approvalId",
                            value
                          )
                        }
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
                      label="Assigned Staff"
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select staff"
                        value={dateEntry?.staffIds || []}
                        onChange={(value) =>
                          handleStageDateChange(
                            currentPipelineForDates._id,
                            stageId,
                            "staffIds",
                            value
                          )
                        }
                        style={{ width: "100%" }}
                        size="small"
                      >
                        {activeStaffs.map((staff) => (
                          <Option key={staff._id} value={staff._id}>
                            {staff.fullName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Dependency Type */}
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Dependency Type"
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Select
                        placeholder="Select dependency type"
                        style={{ width: "100%" }}
                        size="small"
                        value={dateEntry?.dependencyType || "independent"}
                        onChange={(value) =>
                          handleDependencyTypeChange(
                            currentPipelineForDates._id,
                            stageId,
                            value
                          )
                        }
                      >
                        {dependencyTypes.map((level) => (
                          <Option key={level.id} value={level.id}>
                            {level.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
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
        </div>
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
            workOrderData?.workOrder?.pipelineStageTimeline?.some(
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
        <Skeleton />={" "}
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
                <Col xs={24} md={12}>
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
                      value={selectedPipelines}
                    >
                      {activePipelines.map((pipeline) => (
                        <Option key={pipeline._id} value={pipeline._id}>
                          {pipeline.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {selectedPipelines.length > 0 && renderSelectedPipelines()}
                </Col>
                <Col xs={24} md={12}>
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
                      {activeRecruiters?.map((recruiter) => (
                        <Option
                          key={recruiter._id}
                          value={recruiter._id}
                          label={recruiter.fullName}
                        >
                          {recruiter.fullName} - {recruiter.email}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 8]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="client"
                    label="Assign Client"
                    rules={[
                      { required: false, message: "Please select a client" },
                    ]} // Make client optional
                  >
                    <Select placeholder="Select client" allowClear>
                      {activeClients.map((client) => (
                        <Option key={client._id} value={client._id}>
                          {client.fullName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="languagesRequired"
                    label="Languages Required"
                    rules={[
                      {
                        required: true,
                        message: "Please enter at least one language",
                      },
                    ]}
                  >
                    <Select
                      mode="tags"
                      tokenSeparators={[","]}
                      placeholder="e.g., English, Arabic, French"
                      style={{ width: "100%" }}
                    />
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

              <Form.Item
                name="keyResponsibilities"
                label="Key Responsibilities"
              >
                <TextArea
                  rows={4}
                  placeholder="Describe key responsibilities..."
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
                    name="experienceMin"
                    label="Minimum Experience (Years)"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="Enter min experience"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="experienceMax"
                    label="Maximum Experience (Years)"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="Enter max experience"
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
                  <Form.Item
                    name="salaryMin"
                    label="Minimum Salary (SAR)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter minimum salary",
                      },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null) {
                            return Promise.resolve();
                          }
                          if (typeof value !== "number" || isNaN(value)) {
                            return Promise.reject(
                              "Only numeric values are allowed"
                            );
                          }
                          if (value < 0) {
                            return Promise.reject(
                              "Salary must be 0 or greater"
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="Enter minimum salary"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="salaryMax"
                    label="Maximum Salary (SAR)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter maximum salary",
                      },
                      {
                        validator: (_, value) => {
                          if (value === undefined || value === null) {
                            return Promise.resolve();
                          }
                          if (typeof value !== "number" || isNaN(value)) {
                            return Promise.reject(
                              "Only numeric values are allowed"
                            );
                          }
                          if (value <= 0) {
                            return Promise.reject(
                              "Salary must be greater than 0"
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      placeholder="Enter maximum salary"
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
                    name="numberOfCandidates"
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
                <Col xs={24} md={8}>
                  <Form.Item name="visacategory" label="Visa Category">
                    <Input />
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
                  >
                    <Select
                      placeholder="Select visa category type"
                      defaultValue="any"
                    >
                      <Option value="any">Any</Option>
                      <Option value="relative">Relative</Option>
                      <Option value="all">All</Option>
                      <Option value="same">Same</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="nationality" label="Nationality">
                    <Input placeholder="e.g., Saudi" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="isActive"
                    label="Active Status"
                    valuePropName="checked"
                  >
                    <Switch
                      checked={workOrderData?.workOrder?.isActive === "active"}
                      onChange={(checked) => {
                        jobForm.setFieldsValue({
                          isActive: checked ? "active" : "inactive",
                        });
                      }}
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

              <Form.Item name="qualification" label="Qualification">
                <TextArea
                  rows={3}
                  placeholder="List required qualifications..."
                />
              </Form.Item>

              <Form.Item name="benefits" label="Benefits">
                <TextArea
                  rows={4}
                  placeholder="Enter job benefits (one per line)"
                  onChange={(e) => {
                    const lines = e.target.value.split("\n");
                    jobForm.setFieldsValue({ benefits: lines });
                  }}
                />
              </Form.Item>
            </Card>

            <Card
              type="inner"
              title="Required Documents"
              style={{ marginBottom: "16px" }}
            >
              <div style={{ marginBottom: "16px" }}>
                {documents.map((doc, index) => (
                  <Card
                    key={doc.id}
                    size="small"
                    style={{ marginBottom: "12px" }}
                    title={`Document ${index + 1}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeDocument(doc.id)}
                      />
                    }
                  >
                    <Row gutter={[16, 8]}>
                      <Col span={24}>
                        <Form.Item label="Document Name">
                          <Input
                            value={doc.name}
                            onChange={(e) =>
                              updateDocument(doc.id, { name: e.target.value })
                            }
                            placeholder="e.g., Resume, Cover Letter, ID Proof"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label="Description">
                          <Input.TextArea
                            value={doc.description}
                            onChange={(e) =>
                              updateDocument(doc.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter document description or instructions"
                            rows={2}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item>
                          <Checkbox
                            checked={doc.isMandatory}
                            onChange={(e) =>
                              updateDocument(doc.id, {
                                isMandatory: e.target.checked,
                              })
                            }
                          >
                            Mandatory Document
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={addDocument}
                  icon={<PlusOutlined />}
                  block
                >
                  Add Required Document
                </Button>
              </div>
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
        <CreatePipelineModal
          visible={pipelineModalVisible}
          onClose={() => setPipelineModalVisible(false)}
          editingPipeline={editingPipeline}
          onSuccess={() => {
            refetchPipeline();
          }}
        />
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
              padding: "16px",
            }}
          >
            {applicationFields.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#999",
                  padding: "20px",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
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
                  paddingRight: "8px", // Prevent scrollbar overlap
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
              Update & Publish
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default EditWorkOrder;

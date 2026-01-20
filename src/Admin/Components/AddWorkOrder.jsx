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
  Modal,
  Breadcrumb,
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
  LeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ObjectId } from "bson";
import {
  useGetRecruitersQuery,
  useGetPipelinesQuery,
  useGetProjectsQuery,
  useCreateWorkOrderMutation,
  useGetAdminBranchQuery,
  useGetApprovalQuery,
  useGetClientsQuery,
  useGetStaffsQuery,
  useGetRecruitersNameQuery,
  useLazyGetJobCodesByProjectQuery,
} from "../../Slices/Admin/AdminApis.js";
import CreatePipelineModal from "../Components/CreatePipelineModal.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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
  const { enqueueSnackbar } = useSnackbar();
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
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [clientSelectLoading, setClientSelectLoading] = useState(false);
  const [staffSelectLoading, setStaffSelectLoading] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [hasLoadedRequisition, setHasLoadedRequisition] = useState(false);
  const [defaultRecruiters, setDefaultRecruiters] = useState([]);
  const [universalDates, setUniversalDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [isRequisitionBased, setIsRequisitionBased] = useState(false);
  const [standardDocuments, setStandardDocuments] = useState([
    { id: "visa", name: "Visa", isMandatory: false },
    { id: "passport", name: "Passport", isMandatory: false },
    { id: "iqma", name: "IQMA Certificate", isMandatory: false },
    { id: "cv", name: "CV", isMandatory: false },
    { id: "national-id", name: "National ID", isMandatory: false },
    { id: "driving-license", name: "Driving License", isMandatory: false },
    { id: "experience-letter", name: "Experience Letter", isMandatory: false },
    {
      id: "education-certificate",
      name: "Education Certificates",
      isMandatory: false,
    },
    {
      id: "professional-certificates",
      name: "Professional Certifications",
      isMandatory: false,
    },
    { id: "police-clearance", name: "Police Clearance", isMandatory: false },
  ]);

  const adminInfo = useSelector((state) => state.userAuth.adminInfo);

  const ShowButton = adminInfo?.roles;

  const [requisitionData, setRequisitionData] = useState({
    requisitionNo: null,
    referenceNo: null,
    requisitionId: null,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const { data: approvalData, isLoading: isLoadingApprovals } =
    useGetApprovalQuery({
      page: 1,
      pageSize: 100000,
    });
  const { data: Branch } = useGetAdminBranchQuery();
  // const { data: recruiters } = useGetRecruitersQuery();
  const { data: recruiters } = useGetRecruitersNameQuery();
  const { data: projects } = useGetProjectsQuery({
    page: 1,
    pageSize: 100000,
  });
  const { data: pipeline, refetch } = useGetPipelinesQuery({
    page: 1,
    pageSize: 100000,
  });
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery(
    {
      page: 1,
      pageSize: 100000,
    }
  );
  const { data: staffsData, isLoading: isLoadingStaffs } = useGetStaffsQuery({
    page: 1,
    pageSize: 100000,
  });
  const [getJobCodes] = useLazyGetJobCodesByProjectQuery();

  const [createWorkOrder] = useCreateWorkOrderMutation();

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

  const disablePastDates = (current) =>
    current && current < dayjs().startOf("day");

  const generateJobCode = async (projectId) => {
    const project = activeProjects.find((p) => p._id === projectId);
    if (!project || !project.prefix) return null;

    try {
      const { latestNumber, latestJobCode } = await getJobCodes(
        project.prefix
      ).unwrap();

      if (latestNumber && latestJobCode) {
        const nextNumber = latestNumber + 1;
        const formattedNumber = nextNumber.toString().padStart(5, "0");
        return `${project.prefix}-${formattedNumber}`;
      } else {
        return `${project.prefix}-00001`;
      }
    } catch (error) {
      console.error("Error generating job code:", error);
      return `${project.prefix}-00001`;
    }
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    const project = activeProjects.find((p) => p._id === projectId);

    if (project && project.prefix) {
      // Auto-generate job code
      const autoGeneratedCode = await generateJobCode(projectId);
      if (autoGeneratedCode) {
        jobForm.setFieldsValue({
          jobCode: autoGeneratedCode,
        });
      }
    }
  };

  useEffect(() => {
    const loadRequisitionData = async () => {
      if (
        location.state?.requisitionData &&
        !hasLoadedRequisition &&
        activeProjects.length > 0
      ) {
        const reqData = location.state.requisitionData;
        setIsPrefilled(true);
        setIsRequisitionBased(true);
        setRequisitionData({
          requisitionId: reqData._id,
          requisitionNo: reqData.requisitionNo,
          referenceNo: reqData.referenceNo,
        });

        // Parse dates properly
        const startDate = reqData.startDate
          ? dayjs(reqData.startDate)
          : dayjs();
        const endDate = reqData.endDate
          ? dayjs(reqData.endDate)
          : startDate.add(30, "day");
        const alertDate = reqData.alertDate
          ? dayjs(reqData.alertDate)
          : startDate.add(7, "day");
        const deadlineDate = reqData.deadlineDate
          ? dayjs(reqData.deadlineDate)
          : startDate.add(14, "day");

        // Verify the project still exists in active projects
        const project = activeProjects.find(
          (p) => p._id === reqData.project._id
        );

        if (!project) {
          console.warn("Project from requisition not found in active projects");
          enqueueSnackbar("Project from requisition is no longer active", {
            variant: "warning",
          });
          return;
        }

        setSelectedProject(reqData.project._id);

        // Generate sequential job code from API
        let finalJobCode = reqData.requisitionNo || "";
        if (project && project.prefix) {
          try {
            const generatedCode = await generateJobCode(project._id);
            if (generatedCode) finalJobCode = generatedCode;
          } catch (error) {
            console.error(
              "Failed to generate job code, falling back to requisitionNo",
              error
            );
            finalJobCode = `${project.prefix}-${finalJobCode}`;
          }
        }

        // Set form values with all available data from API response
        jobForm.setFieldsValue({
          title: reqData.title,
          description: reqData.description,
          companyIndustry: reqData.companyIndustry,
          officeLocation: reqData.officeLocation,
          EmploymentType: reqData.EmploymentType,
          experienceMin: reqData.experienceMin,
          experienceMax: reqData.experienceMax,
          salaryMin: reqData.salaryMin,
          salaryMax: reqData.salaryMax,
          workplace: reqData.workplace,
          requiredSkills: reqData.requiredSkills || [],
          numberOfCandidate: reqData.numberOfCandidate,
          nationality: reqData.nationality,
          startDate: startDate,
          endDate: endDate,
          alertDate: alertDate,
          deadlineDate: deadlineDate,
          keyResponsibilities: reqData.keyResponsibilities,
          jobRequirements: reqData.jobRequirements,
          qualification: reqData.qualification,
          benefits: Array.isArray(reqData.benefits)
            ? reqData.benefits.join("\n")
            : reqData.benefits,
          client:
            typeof reqData.client === "object"
              ? reqData.client._id
              : reqData.client,
          project: reqData.project._id,
          jobFunction: reqData.jobFunction,
          salaryType: reqData.salaryType || "monthly",
          visacategorytype: reqData.visacategorytype || "any",
          visacategory: reqData.visacategory,
          Education: reqData.Education,
          languagesRequired: reqData.languagesRequired || [],
          jobCode: finalJobCode, // Use generated code here
          assignedId: Array.isArray(reqData.assignedRecruiters)
            ? reqData.assignedRecruiters.map((r) =>
                typeof r === "object" ? r._id : r
              )
            : Array.isArray(reqData.recruiters)
            ? reqData.recruiters.map((r) => (typeof r === "object" ? r._id : r))
            : Array.isArray(reqData.assignedId)
            ? reqData.assignedId.map((r) => (typeof r === "object" ? r._id : r))
            : [],
        });

        // Handle required documents if available
        if (reqData.requiredDocuments && reqData.requiredDocuments.length > 0) {
          const documentsWithIds = reqData.requiredDocuments.map(
            (doc, index) => ({
              ...doc,
              id: doc.id || `req_doc_${Date.now()}_${index}`,
            })
          );
          setRequiredDocuments(documentsWithIds);
        }

        setHasLoadedRequisition(true);
      }
    };

    loadRequisitionData();
  }, [
    location.state?.requisitionData,
    activeProjects.length,
    hasLoadedRequisition,
    jobForm,
    enqueueSnackbar,
  ]);

  // useEffect(() => {
  //   if (location.state?.requisitionData?.clientId && clientsData?.clients) {
  //     const clientExists = clientsData.clients.some(
  //       (client) => client._id === location.state.requisitionData.clientId._id
  //     );

  //     if (!clientExists) {
  //       enqueueSnackbar("Client from requisition not found", {
  //         variant: "warning",
  //       });
  //     }
  //   }
  // }, [clientsData, location.state, enqueueSnackbar]);

  const handleApproverChange = (pipelineId, stageId, recruiterId) => {
    handleStageDateChange(pipelineId, stageId, "recruiterId", recruiterId);
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

  const handleDefaultRecruitersChange = (recruiterIds) => {
    setDefaultRecruiters(recruiterIds);

    if (currentPipelineForDates && recruiterIds.length > 0) {
      const pipelineId = currentPipelineForDates._id;
      const allStages = [
        ...(currentPipelineForDates.stages || []),
        ...(customStages[pipelineId] || []),
      ];

      allStages.forEach((stage) => {
        const stageId = stage._id || stage.id;
        handleStageDateChange(
          pipelineId,
          stageId,
          "recruiterIds",
          recruiterIds
        );
      });
    }
  };

  const handleSavePipelineDates = () => {
    if (!currentPipelineForDates) return;

    const pipelineId = currentPipelineForDates._id;
    const stageData = pipelineStageDates[pipelineId] || [];

    // Validate that stages have required data
    const invalidStages = [];
    const allStages = [
      ...(currentPipelineForDates.stages || []),
      ...(customStages[pipelineId] || []),
    ];

    allStages.forEach((stage) => {
      const stageId = stage._id || stage.id;
      const dateEntry = stageData.find((d) => d.stageId === stageId);

      if (!dateEntry || !dateEntry.startDate || !dateEntry.endDate) {
        invalidStages.push(stage.name || `Stage ${stageId}`);
      }
    });

    if (invalidStages.length > 0) {
      message.error(`Please set dates for: ${invalidStages.join(", ")}`);
      return;
    }

    // Save success
    message.success(`Pipeline dates saved for ${currentPipelineForDates.name}`);
    setPipelineDatesModalVisible(false);
    setDefaultRecruiters && setDefaultRecruiters([]);
  };

  const showPipelineDatesModal = (pipelineId) => {
    const pipeline = activePipelines.find((p) => p._id === pipelineId);
    if (pipeline) {
      setCurrentPipelineForDates(pipeline);
      setPipelineDatesModalVisible(true);

      if (!customStages[pipelineId]) {
        setCustomStages((prev) => ({
          ...prev,
          [pipelineId]: [],
        }));
      }

      if (!pipelineStageDates[pipelineId]) {
        setPipelineStageDates((prev) => ({
          ...prev,
          [pipelineId]: [
            ...(pipeline.stages || []).map((stage) => ({
              stageId: stage._id,
              startDate: null,
              endDate: null,
            })),
            ...(customStages[pipelineId] || []).map((stage) => ({
              stageId: stage.id,
              startDate: null,
              endDate: null,
            })),
          ],
        }));
      }
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
          approvalId: null,
          recruiterIds: [],
          staffIds: [],
        });
      }

      if ((field === "startDate" || field === "endDate") && value) {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          [field]: dayjs(value).format("YYYY-MM-DD"),
        };
      } else if (field === "approvalId") {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          approvalId: value,
        };
      } else if (field === "recruiterIds") {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          recruiterIds: value,
        };
      } else if (field === "staffIds") {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          staffIds: value,
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
      id: new ObjectId().toString(), // Generate a valid ObjectId string
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

  const handleStandardDocumentChange = (id, isMandatory) => {
    setStandardDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isMandatory } : doc))
    );

    // Also update the main documents array
    const docName = standardDocuments.find((d) => d.id === id)?.name;
    if (docName) {
      const existingDocIndex = requiredDocuments.findIndex(
        (d) => d.name === docName
      );
      if (existingDocIndex !== -1) {
        // Update existing document
        const updatedDocs = [...requiredDocuments];
        updatedDocs[existingDocIndex] = {
          ...updatedDocs[existingDocIndex],
          isMandatory,
        };
        setRequiredDocuments(updatedDocs);
      } else if (isMandatory) {
        // Add new document if it's being marked as mandatory
        setRequiredDocuments([
          ...requiredDocuments,
          {
            id: Date.now(),
            name: docName,
            description: "",
            isMandatory: true,
          },
        ]);
      }
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
          branchId: branchId,
        };

        setJobData(formattedData);
        setCurrentStep(1);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
        const missingFields = errorInfo.errorFields.map(
          (field) => field.name[0]
        );
        const fieldLabels = {
          title: "Job Title",
          project: "Project",
          jobCode: "Job Code",
          pipeline: "Pipeline",
          assignedId: "Assigned Members",
          client: "Client",
          workplace: "Workplace",
          EmploymentType: "Employment Type",
          jobFunction: "Job Function",
          description: "Job Description",
          jobRequirements: "Job Requirements",
          visacategorytype: "Visa Category Type",
          salaryType: "Salary Type",
          languagesRequired: "Languages Required",
          officeLocation: "Office Location",
        };

        const missingFieldNames = missingFields
          .map((field) => fieldLabels[field] || field)
          .join(", ");

        enqueueSnackbar(
          `Please fill the following required fields: ${missingFieldNames}`,
          {
            variant: "error",
            autoHideDuration: 5000,
          }
        );
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

  const addDocument = () => {
    const newDocument = {
      id: Date.now(),
      name: "",
      description: "",
      isMandatory: true,
    };
    setRequiredDocuments([...requiredDocuments, newDocument]);
  };

  const updateDocument = (id, updates) => {
    setRequiredDocuments((docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const removeDocument = (id) => {
    setRequiredDocuments((docs) => docs.filter((doc) => doc.id !== id));
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
      // Validate that at least one application field is added
      if (!applicationFields || applicationFields.length === 0) {
        enqueueSnackbar(
          "Please add at least one application field before submitting the work order.",
          {
            variant: "error",
            autoHideDuration: 4000,
          }
        );
        setLoading(false);
        // Navigate to the application fields step if not already there
        if (currentStep < 1) {
          setCurrentStep(1);
        }
        return;
      }

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

      const allDocuments = [
        ...standardDocuments
          .filter((doc) => doc.isMandatory)
          .map((doc) => ({
            name: doc.name,
            description: "",
            isMandatory: true,
          })),
        ...requiredDocuments
          .filter(
            (doc) =>
              !standardDocuments.some(
                (stdDoc) => stdDoc.name.toLowerCase() === doc.name.toLowerCase()
              )
          )
          .map((doc) => ({
            name: doc.name,
            description: doc.description || "",
            isMandatory: doc.isMandatory !== false,
          })),
      ];

      const workOrderData = {
        ...jobData,
        customFields: applicationFields,
        WorkorderStatus: status,
        isActive: status === "published" ? "active" : "inactive",
        pipelineStageTimeline,
        requiredDocuments: allDocuments,
        client: jobForm.getFieldValue("client"),
        languagesRequired: jobForm.getFieldValue("languagesRequired") || [],
        isRequisition: isRequisitionBased,
        ...(isRequisitionBased && {
          requisitionNo: requisitionData.requisitionNo,
          referenceNo: requisitionData.referenceNo,
          requisitionId: requisitionData.requisitionId,
        }),
      };

      const result = await createWorkOrder(workOrderData).unwrap();
      enqueueSnackbar(
        `Work order ${
          status === "published" ? "published" : "saved as draft"
        } successfully with approval settings!`,
        {
          variant: "success",
        }
      );

      jobForm.resetFields();
      setSelectedProject(null);
      setJobData(null);
      setApplicationFields([]);
      setCustomStages({});
      setStageApprovers({});
      setCurrentStep(0);
      setIsRequisitionBased(false);
      setRequisitionData({
        requisitionNo: null,
        referenceNo: null,
        requisitionId: null,
      });

      if (ShowButton === "admin") {
        navigate("/admin/workorder");
      } else {
        navigate("/recruiter/jobs");
      }
    } catch (error) {
      console.error("Error creating work order:", error);
      enqueueSnackbar("Failed to create work order. Please try again.", {
        variant: "error",
      });
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
    setIsRequisitionBased(false);
    setRequisitionData({
      requisitionNo: null,
      referenceNo: null,
      requisitionId: null,
    });
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
            color: "#da2c46",
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
            marginBottom: "16px",
            display: "grid",
            gap: "12px", // Space between tags
            background: "#fafafa",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <Tag color="blue" style={{ fontSize: "12px", padding: "6px 10px" }}>
            Employement Type : {jobData?.EmploymentType || "Full-time"}
          </Tag>

          <Tag color="green" style={{ fontSize: "12px", padding: "6px 10px" }}>
            Workplace : {jobData?.workplace || "Workplace"}
          </Tag>

          {jobData?.officeLocation && (
            <Tag
              color="geekblue"
              style={{ fontSize: "12px", padding: "6px 10px" }}
            >
              Job Location : {jobData.officeLocation}
            </Tag>
          )}

          <Tag
            color="volcano"
            style={{ fontSize: "12px", padding: "6px 10px" }}
          >
            Nationality : {jobData?.nationality || "Indian"}
          </Tag>

          <Tag color="purple" style={{ fontSize: "12px", padding: "6px 10px" }}>
            Visa Category : {jobData?.visacategory || "Demo"}
          </Tag>

          {jobData?.visacategorytype && (
            <Tag color="gold" style={{ fontSize: "12px", padding: "6px 10px" }}>
              Visa Category Type : {jobData.visacategorytype || "Any"}
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

        {jobData?.keyResponsibilities && (
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
            <p style={{ fontSize: "12px" }}>{jobData.keyResponsibilities}</p>
          </div>
        )}

        <Row gutter={8} style={{ marginBottom: "12px" }}>
          <Col span={12}>
            <p style={{ margin: "0", fontSize: "12px" }}>
              {jobData?.experienceMin !== undefined &&
                jobData?.experienceMax !== undefined && (
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
                      {jobData.experienceMin} - {jobData.experienceMax} years
                    </p>
                  </div>
                )}
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

        {jobData?.salaryMin !== undefined &&
          jobData?.salaryMax !== undefined && (
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
                SAR {jobData.salaryMin?.toLocaleString()} - SAR{" "}
                {jobData.salaryMax?.toLocaleString()}
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

        {(standardDocuments.filter((doc) => doc.isMandatory).length > 0 ||
          requiredDocuments.filter(
            (doc) =>
              !standardDocuments.some(
                (stdDoc) => stdDoc.name.toLowerCase() === doc.name.toLowerCase()
              )
          ).length > 0) && (
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
              {/* Standard documents */}
              {standardDocuments
                .filter((doc) => doc.isMandatory)
                .map((doc, index) => (
                  <div
                    key={`std-${doc.id}`}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <span style={{ marginRight: "4px" }}>•</span>
                    <span style={{ fontSize: "12px" }}>
                      <strong>{doc.name}</strong>
                    </span>
                  </div>
                ))}

              {/* Custom documents */}
              {requiredDocuments
                .filter(
                  (doc) =>
                    !standardDocuments.some((std) => std.name === doc.name)
                )
                .map((doc, index) => (
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

        {jobData?.qualification && (
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
            <p style={{ fontSize: "12px" }}>{jobData.qualification}</p>
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

    const allStages = [
      ...(currentPipelineForDates.stages || []),
      ...(customStages[currentPipelineForDates._id] || []),
    ];

    const usedApprovalLevels = new Set(
      pipelineStageDates[currentPipelineForDates._id]
        ?.filter((stage) => stage.approvalId)
        .map((stage) => stage.approvalId)
    );

    return (
      <Modal
        title={`Set Stage Dates & Approvals for ${
          currentPipelineForDates?.name || "Pipeline"
        }`}
        visible={pipelineDatesModalVisible}
        onCancel={() => {
          setPipelineDatesModalVisible(false);
          setDefaultRecruiters([]);
          setUniversalDates({ startDate: null, endDate: null });
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setDefaultRecruiters([]);
              setPipelineDatesModalVisible(false);
              setUniversalDates({ startDate: null, endDate: null });
            }}
          >
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSavePipelineDates}
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
        <div
          style={{
            marginBottom: "24px",
            padding: "12px",
            backgroundColor: "#f0f8ff",
            borderRadius: "6px",
            border: "1px solid #d6f2ff",
          }}
        >
          <Form.Item
            label="Default members (will be assigned to all stages)"
            style={{ marginBottom: 0 }}
          >
            <Select
              mode="multiple"
              placeholder="Select default members for all stages"
              value={defaultRecruiters}
              onChange={handleDefaultRecruitersChange}
              style={{ width: "100%" }}
              size="small"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString()?.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
            >
              {activeRecruiters.map((recruiter) => (
                <Option key={recruiter._id} value={recruiter._id}>
                  {recruiter.fullName} - {recruiter.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Universal Start Date (apply to all stages)"
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="small"
                  value={universalDates.startDate}
                  onChange={(date) => {
                    setUniversalDates((prev) => ({ ...prev, startDate: date }));
                    // Apply to all stages
                    setPipelineStageDates((prev) => {
                      const newDates = { ...prev };
                      const pipelineId = currentPipelineForDates._id;
                      if (newDates[pipelineId]) {
                        newDates[pipelineId] = newDates[pipelineId].map(
                          (stage) => ({
                            ...stage,
                            startDate: date
                              ? dayjs(date).format("YYYY-MM-DD")
                              : null,
                          })
                        );
                      }
                      return newDates;
                    });
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Universal End Date (apply to all stages)"
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="small"
                  value={universalDates.endDate}
                  onChange={(date) => {
                    setUniversalDates((prev) => ({ ...prev, endDate: date }));
                    // Apply to all stages
                    setPipelineStageDates((prev) => {
                      const newDates = { ...prev };
                      const pipelineId = currentPipelineForDates._id;
                      if (newDates[pipelineId]) {
                        newDates[pipelineId] = newDates[pipelineId].map(
                          (stage) => ({
                            ...stage,
                            endDate: date
                              ? dayjs(date).format("YYYY-MM-DD")
                              : null,
                          })
                        );
                      }
                      return newDates;
                    });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ padding: "16px 0" }}>
          {allStages.map((stage, index) => {
            const stageId = stage._id || stage.id;
            const dateEntry = pipelineStageDates[
              currentPipelineForDates._id
            ]?.find((d) => d.stageId === stageId);

            const availableApprovalLevels = approvalLevels;

            return (
              <>
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
                          style={{
                            cursor: stage.isCustom ? "grab" : "default",
                          }}
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
                  onDragStart={(e) =>
                    stage.isCustom && handleDragStart(e, stage)
                  }
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
                        label="Assigned Members"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select members"
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
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (
                              option?.children?.toString()?.toLowerCase() ?? ""
                            ).includes(input.toLowerCase())
                          }
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
                          allowClear
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
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (
                              option?.children?.toString()?.toLowerCase() ?? ""
                            ).includes(input.toLowerCase())
                          }
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
                          loading={isLoadingStaffs || staffSelectLoading}
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
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (
                              option?.children?.toString()?.toLowerCase() ?? ""
                            ).includes(input.toLowerCase())
                          }
                        >
                          {activeStaffs.map((staff) => (
                            <Option key={staff._id} value={staff._id}>
                              {staff.fullName} (
                              {staff.designation || staff.role})
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
                          value={
                            dateEntry?.dependencyType ||
                            stage.dependencyType ||
                            "independent"
                          }
                          onChange={(value) =>
                            handleDependencyTypeChange(
                              currentPipelineForDates._id,
                              stageId,
                              value
                            )
                          }
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (
                              option?.children?.toString()?.toLowerCase() ?? ""
                            ).includes(input.toLowerCase())
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
                  {/* Required Documents Display */}
                  <Col xs={24} style={{ marginTop: "8px" }}>
                    <Form.Item
                      label="Stage Required Documents"
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "4px",
                          border: "1px solid #e8e8e8",
                        }}
                      >
                        {stage.requiredDocuments?.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                            }}
                          >
                            {stage.requiredDocuments.map((doc, index) => (
                              <Tag key={index} color="blue" size="small">
                                {doc}
                              </Tag>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#999" }}>
                            No documents required for this stage
                          </span>
                        )}
                      </div>
                    </Form.Item>
                  </Col>
                </Card>
              </>
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
        <div style={{ marginBottom: 15 }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Button
                type="link"
                onClick={() => navigate(-1)}
                icon={<LeftOutlined />}
                style={{
                  paddingLeft: 0,
                  color: "#da2c46",
                }}
              >
                Back to Jobs
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

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
              isSalaryVisible: false,
              workplace: "on-site",
              EmploymentType: "full-time",
              salaryType: "monthly",
              visacategorytype: "any",
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
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (
                          option?.children?.toString()?.toLowerCase() ?? ""
                        ).includes(input.toLowerCase())
                      }
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
                    <Input
                      placeholder="Auto-generated"
                      readOnly
                      style={{ cursor: "not-allowed" }}
                    />
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
                  <Form.Item
                    name="deadlineDate"
                    label="Deadline Date"
                    rules={[
                      { required: true, message: "Please select deadline date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={disablePastDates}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[
                      { required: true, message: "Please select start date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={disablePastDates}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[
                      { required: true, message: "Please select end date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={disablePastDates}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="alertDate" label="Alert Date">
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={disablePastDates}
                    />
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
                    <Space.Compact style={{ width: "100%" }}>
                      <Select
                        mode="multiple"
                        placeholder="Select pipeline"
                        onChange={handlePipelineChange}
                        value={selectedPipelines}
                        style={{ width: "calc(100% - 120px)" }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (
                            option?.children?.toString()?.toLowerCase() ?? ""
                          ).includes(input.toLowerCase())
                        }
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
                <Col xs={24} md={12}>
                  <Form.Item
                    name="assignedId"
                    label="Assigned Members"
                    rules={[
                      {
                        required: true,
                        message: "Please assign at least one member",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select members"
                      optionLabelProp="label"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (
                          option?.children?.toString()?.toLowerCase() ?? ""
                        ).includes(input.toLowerCase())
                      }
                    >
                      {activeRecruiters.map((recruiter) => (
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
                      { required: true, message: "Please select a client" },
                    ]}
                  >
                    <Select
                      placeholder="Select client"
                      loading={isLoadingClients || clientSelectLoading}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (
                          option?.children?.toString()?.toLowerCase() ?? ""
                        ).includes(input.toLowerCase())
                      }
                    >
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
                    label="Languages Required (comma separated)"
                    initialValue={["English", "Arabic"]}
                  >
                    <Select
                      mode="tags"
                      tokenSeparators={[","]}
                      placeholder="e.g., English, Arabic, French"
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
                    <Select
                      placeholder="Select workplace type"
                      defaultValue="on-site"
                    >
                      <Option value="remote">Remote</Option>
                      <Option value="on-site">On-site</Option>
                      <Option value="hybrid">Hybrid</Option>
                      <Option value="offshore">OffShore</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="officeLocation"
                    label="Office Location"
                    rules={[
                      {
                        required: true,
                        message: "Please enter office location.",
                      },
                    ]}
                  >
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
                    <Select
                      placeholder="Select employment type"
                      defaultValue="full-time"
                    >
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
                    rules={[
                      { required: true, message: "Please enter minimum experience" },
                    ]}
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
                    rules={[
                      { required: true, message: "Please enter maximum experience" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      placeholder="Enter max experience"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="Education"
                    label="Education"
                    rules={[
                      { required: true, message: "Please select education requirement" },
                    ]}
                  >
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
                    <Select
                      placeholder="Select salary type"
                      defaultValue="monthly"
                    >
                      <Option value="hourly">Hourly</Option>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="annual">Annual</Option>
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

                <Col xs={24} md={8}>
                  <Form.Item
                    name="isCommon"
                    label="Common Work Order"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="isSalaryVisible"
                    label="Show salary"
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

              <Form.Item
                name="qualification"
                label="Qualification"
                rules={[
                  { required: true, message: "Please enter qualification" },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="List required qualifications..."
                />
              </Form.Item>

              <Form.Item name="benefits" label="Benefits">
                <TextArea rows={4} placeholder="Enter job benefits" />
              </Form.Item>
            </Card>

            <Card
              type="inner"
              title="Required Documents"
              style={{ marginBottom: "16px" }}
            >
              <div style={{ marginBottom: "16px" }}>
                <h4>Standard Documents</h4>
                <Row gutter={[16, 8]}>
                  {standardDocuments.map((doc) => (
                    <Col xs={24} sm={8} key={doc.id}>
                      <Checkbox
                        checked={doc.isMandatory}
                        onChange={(e) =>
                          handleStandardDocumentChange(doc.id, e.target.checked)
                        }
                      >
                        {doc.name}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>

              <Divider />

              <h4>Additional Documents</h4>
              <div style={{ marginBottom: "16px" }}>
                {requiredDocuments
                  .filter(
                    (doc) =>
                      !standardDocuments.some(
                        (stdDoc) =>
                          stdDoc.name.toLowerCase() === doc.name.toLowerCase()
                      )
                  )
                  .map((doc, index) => (
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
                  Add Additional Document
                </Button>
              </div>
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
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  border: "none",
                }}
              >
                Add Field
              </Button>
            }
            style={{
              height: "680px", // Match mobile preview height
              display: "flex",
              flexDirection: "column",
              marginBottom: "16px",
            }}
            bodyStyle={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "16px",
            }}
          >
            {applicationFields.length > 0 ? (
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
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#999",
                  padding: "16px",
                }}
              >
                <p style={{ marginBottom: "16px" }}>No fields added yet</p>
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
            {ShowButton === "admin" && (
              <Button
                type="default"
                loading={loading}
                onClick={() => handleSubmit("draft")}
              >
                Save as Draft
              </Button>
            )}
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

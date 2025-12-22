import { useState, useMemo, useEffect } from "react";
import {
  Card,
  Spin,
  Alert,
  Typography,
  Row,
  Col,
  Empty,
  Button,
  Space,
  Input,
  Select,
  Divider,
  Collapse,
  Badge,
  Modal,
  Descriptions,
  Tag,
  message,
  DatePicker,
  TimePicker,
  Form,
  Skeleton,
  Steps,
  Pagination,
  Avatar,
  Checkbox,
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  FormOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useUpdateCandidateStatusMutation,
  useGetRecruiterStagesQuery,
  useMoveToPipelineMutation,
  useGetScreeningCandidatesQuery,
  useGetPipelinesQuery,
  useGetAllRecruitersQuery,
  useGetAllLevelsQuery,
  useGetAllStaffsQuery,
  useMoveCandidateStatusMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Step } = Steps;

const fieldTypes = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
  { label: "Time", value: "time" },
  { label: "Date & Time", value: "datetime" },
  { label: "Dropdown", value: "select" },
  { label: "Multi-select", value: "multi_select" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio Buttons", value: "radio" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "File Upload", value: "file" },
  { label: "URL", value: "url" },
  { label: "Currency", value: "currency" },
  { label: "Boolean Switch", value: "switch" },
  { label: "Rating (1–5)", value: "rating" },
  { label: "Slider", value: "slider" },
  { label: "Password", value: "password" },
  { label: "Color Picker", value: "color" },
];

const typesWithOptions = ["select", "multi_select", "checkbox", "radio"];

const ScreeningCandidates = ({ jobId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [pipelineStageDates, setPipelineStageDates] = useState({});
  const [stageApprovers, setStageApprovers] = useState({});
  const [stageCustomFields, setStageCustomFields] = useState({});
  const [stageRequiredDocuments, setStageRequiredDocuments] = useState({});
  const [stageStaffAssignments, setStageStaffAssignments] = useState({});
  const [stageRecruiterAssignments, setStageRecruiterAssignments] = useState(
    {}
  );
  const [isPipelineModalVisible, setIsPipelineModalVisible] = useState(false);
  const [selectedPipelineForUpdate, setSelectedPipelineForUpdate] =
    useState(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [customStages, setCustomStages] = useState({});

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [form] = Form.useForm();

  const { data: pipelineData } = useGetPipelinesQuery();
  const activePipelines = pipelineData?.pipelines || [];

  const { data: recruiterData } = useGetAllRecruitersQuery();
  const recruiters = recruiterData?.otherRecruiters;
  const { data: staffData } = useGetAllStaffsQuery();
  const staffs = staffData?.otherRecruiters;
  const { data: levelData } = useGetAllLevelsQuery();
  const levels = levelData?.otherRecruiters;

  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const [statusChange, { isLoading: isStatusChange }] =
    useMoveCandidateStatusMutation();

  const {
    data: screeningData,
    isLoading,
    error,
    refetch,
  } = useGetScreeningCandidatesQuery({
    jobId,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const [moveToPipeline, { isLoading: isMovingToPipeline }] =
    useMoveToPipelineMutation();

  const [filters, setFilters] = useState({
    skills: [],
    education: [],
    location: "",
    screeningStatus: [],
  });

  const { data: recruiterStages, isLoading: recruiterStagesLoading } =
    useGetRecruiterStagesQuery(jobId);

  useEffect(() => {
    if (screeningData) {
      setPagination((prev) => ({
        ...prev,
        total:
          screeningData.total ||
          screeningData.customFieldResponses?.length ||
          0,
      }));
    }
  }, [screeningData]);

  useEffect(() => {
    if (!selectedPipeline) return;

    const pipelineId = selectedPipeline._id;
    if (!pipelineStageDates[pipelineId]) {
      const initialDates = selectedPipeline.stages.map((stage) => ({
        stageId: stage._id,
        startDate: null,
        endDate: null,
        dependencyType: "independent",
      }));

      setPipelineStageDates((prev) => ({
        ...prev,
        [pipelineId]: initialDates,
      }));
    }
  }, [selectedPipeline]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize,
      total: pagination.total,
    });
  };

  const allCandidates = useMemo(() => {
    return (
      screeningData?.customFieldResponses?.map((response) => ({
        ...response.user,
        id: response._id,
        candidateStatus: response.status,
        applicationId: response._id,
        responses: response.responses,
        image: response.user?.image,
        workOrder: response.workOrder,
        interviewDetails: response.interviewDetails,
        tagPipelineId: response.tagPipelineId,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      })) || []
    );
  }, [screeningData]);

  const screeningCount = useMemo(() => {
    return allCandidates.length;
  }, [allCandidates]);

  const filterOptions = useMemo(() => {
    const allSkills = new Set();
    const allEducation = new Set();
    const allLocations = new Set();

    allCandidates.forEach((user) => {
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach((skill) => allSkills.add(skill.toLowerCase()));
      }

      if (user.education && Array.isArray(user.education)) {
        user.education.forEach((edu) => {
          if (edu.degree) allEducation.add(edu.degree);
          if (edu.field) allEducation.add(edu.field);
        });
      }

      if (user.location) {
        allLocations.add(user.location);
      }
    });

    return {
      skills: Array.from(allSkills).sort(),
      education: Array.from(allEducation).sort(),
      locations: Array.from(allLocations).sort(),
    };
  }, [allCandidates]);

  const filteredCandidates = useMemo(() => {
    let candidates = allCandidates;

    if (searchTerm) {
      candidates = candidates.filter(
        (candidate) =>
          candidate.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.phone?.includes(searchTerm)
      );
    }

    if (filters.skills.length > 0) {
      candidates = candidates.filter((candidate) => {
        const candidateSkills =
          candidate.skills?.map((skill) => skill.toLowerCase()) || [];
        return filters.skills.some((filterSkill) =>
          candidateSkills.includes(filterSkill.toLowerCase())
        );
      });
    }

    if (filters.education.length > 0) {
      candidates = candidates.filter((candidate) => {
        const candidateEducation = candidate.education || [];
        return candidateEducation.some((edu) =>
          filters.education.some(
            (filterEdu) =>
              edu.degree?.toLowerCase().includes(filterEdu.toLowerCase()) ||
              edu.field?.toLowerCase().includes(filterEdu.toLowerCase())
          )
        );
      });
    }

    if (filters.location) {
      candidates = candidates.filter((candidate) =>
        candidate.location
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    return candidates;
  }, [allCandidates, searchTerm, filters]);

  const clearAllFilters = () => {
    setFilters({
      skills: [],
      education: [],
      location: "",
      screeningStatus: [],
    });
    setSearchTerm("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.skills.length > 0) count++;
    if (filters.education.length > 0) count++;
    if (filters.location) count++;
    if (filters.screeningStatus.length > 0) count++;
    return count;
  }, [filters]);

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const getScreeningStatusColor = (status) => {
    const colors = {
      screening: "blue",
      interview: "orange",
      shortlisted: "green",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      if (!selectedCandidate) return;

      // Show pipeline selection modal for interview status
      if (newStatus === "interview") {
        setPendingStatusUpdate(newStatus);
        setSelectedPipelineForUpdate(
          selectedCandidate.tagPipelineId?._id ||
            selectedCandidate.tagPipelineId ||
            null
        );
        setIsPipelineModalVisible(true);
        return;
      }

      await updateStatusWithPipeline(selectedCandidate, newStatus, null);
    } catch (error) {
      console.error("Failed to change status:", error);
      message.error(error.data?.message || "Failed to change candidate status");
    }
  };

  const handlePipelineUpdateConfirm = async () => {
    if (!selectedCandidate || !pendingStatusUpdate) return;

    setIsPipelineModalVisible(false);
    await updateStatusWithPipeline(
      selectedCandidate,
      pendingStatusUpdate,
      selectedPipelineForUpdate
    );
    setPendingStatusUpdate(null);
    setSelectedPipelineForUpdate(null);
  };

  const updateStatusWithPipeline = async (candidate, newStatus, pipelineId) => {
    try {
      await statusChange({
        id: candidate.applicationId,
        status: newStatus,
        pipelineId: pipelineId === null ? "" : pipelineId,
      }).unwrap();

      enqueueSnackbar(`Candidate status changed to ${newStatus}`, {
        variant: "success",
        autoHideDuration: 3000,
      });
      refetch();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to change status:", error);
      enqueueSnackbar(
        error.data?.message || "Failed to change candidate status",
        { variant: "error", autoHideDuration: 3000 }
      );
    }
  };

  // const handleMoveToPipeline = async () => {
  //   try {
  //     if (!selectedCandidate) return;

  //     await moveToPipeline({
  //       applicationId: selectedCandidate.applicationId,
  //       jobId: jobId,
  //       userId: selectedCandidate._id,
  //       pipelineId: selectedCandidate.tagPipelineId?._id || null,
  //     }).unwrap();

  //     message.success("Candidate moved to pipeline successfully");
  //     refetch();
  //     setIsModalVisible(false);
  //   } catch (error) {
  //     console.error("Failed to move candidate to pipeline:", error);
  //     message.error(
  //       error.data?.message || "Failed to move candidate to pipeline"
  //     );
  //   }
  // };

  // const handleMoveToSelectedPipeline = async () => {
  //   try {
  //     if (!selectedCandidate || !selectedPipeline) return;

  //     const pipelineId = selectedPipeline._id;
  //     const defaultStages = selectedPipeline.stages || [];
  //     const customStagesList = customStages[pipelineId] || [];

  //     const allStages = [...defaultStages, ...customStagesList];

  //     const formattedStages = allStages.map((stage, index) => {
  //       const stageId = stage._id || stage.id;
  //       const isCustomStage = stage.isCustom || false;

  //       const stageDate =
  //         (pipelineStageDates[pipelineId] || []).find(
  //           (d) => d.stageId === stageId
  //         ) || {};

  //       return {
  //         pipelineId,
  //         stageId,
  //         stageName: stage.name,
  //         stageOrder: index,
  //         startDate: stageDate.startDate,
  //         endDate: stageDate.endDate,
  //         dependencyType: stageDate.dependencyType || "independent",
  //         approvalId: stageDate.approvalId || null,
  //         recruiterIds:
  //           (stageRecruiterAssignments[pipelineId] || {})[stageId] || [],
  //         staffIds: (stageStaffAssignments[pipelineId] || {})[stageId] || [],
  //         isCustomStage,
  //         _id: stageId,
  //         customFields: (stageCustomFields[pipelineId] || {})[stageId] || [],
  //         requiredDocuments:
  //           (stageRequiredDocuments[pipelineId] || {})[stageId] || [],
  //       };
  //     });

  //     const pipelineData = {
  //       _id: selectedPipeline._id,
  //       name: selectedPipeline.name,
  //       description: selectedPipeline.description,
  //       stages: formattedStages,
  //     };

  //     await moveToPipeline({
  //       jobId,
  //       userId: selectedCandidate._id,
  //       pipelineData,
  //       isPipeline: true,
  //     }).unwrap();

  //     message.success(
  //       `Candidate moved to ${selectedPipeline.name} successfully`
  //     );
  //     refetch();
  //     setIsModalVisible(false);
  //   } catch (error) {
  //     console.error("Failed to move candidate to selected pipeline:", error);
  //     message.error(
  //       error.data?.message || "Failed to move candidate to pipeline"
  //     );
  //   }
  // };

  const handleBulkChangeStatus = async (newStatus) => {
    if (selectedCandidates.length === 0) {
      enqueueSnackbar("Please select at least one candidate", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }

    // Show pipeline selection modal for interview status
    if (newStatus === "interview") {
      setPendingStatusUpdate(newStatus);
      setSelectedPipelineForUpdate(null); // Start with no pipeline selected
      setIsPipelineModalVisible(true);
      return;
    }

    setIsBulkMoving(true);
    try {
      const promises = selectedCandidates.map((candidateId) => {
        const candidate = allCandidates.find((c) => c._id === candidateId);
        if (!candidate) {
          console.error(`Candidate not found for ID: ${candidateId}`);
          return Promise.resolve(); // Skip if candidate not found
        }

        return statusChange({
          id: candidate.applicationId, // ✓ This is correct
          status: newStatus,
          pipelineId: "", // Add this if not selecting pipeline
        }).unwrap();
      });

      await Promise.all(promises);

      enqueueSnackbar(
        `Updated status to "${newStatus}" for ${selectedCandidates.length} candidate(s)`,
        { variant: "success", autoHideDuration: 3000 }
      );

      setSelectedCandidates([]);
      refetch();
    } catch (error) {
      console.error("Failed to change status for candidates:", error);

      enqueueSnackbar(error?.data?.message || "Bulk status update failed", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleBulkPipelineUpdateConfirm = async () => {
    if (!pendingStatusUpdate || selectedCandidates.length === 0) return;

    setIsPipelineModalVisible(false);
    setIsBulkMoving(true);

    try {
      const promises = selectedCandidates.map((candidateId) => {
        const candidate = allCandidates.find((c) => c._id === candidateId);
        if (!candidate) {
          console.error(`Candidate not found for ID: ${candidateId}`);
          return Promise.resolve();
        }

        return statusChange({
          id: candidate.applicationId,
          status: pendingStatusUpdate,
          pipelineId:
            selectedPipelineForUpdate === null ? "" : selectedPipelineForUpdate,
        }).unwrap();
      });

      await Promise.all(promises);

      enqueueSnackbar(
        `Successfully moved ${selectedCandidates.length} candidates to ${pendingStatusUpdate}`,
        { variant: "success", autoHideDuration: 3000 }
      );

      setSelectedCandidates([]);
      refetch();
      setPendingStatusUpdate(null);
      setSelectedPipelineForUpdate(null);
    } catch (error) {
      console.error("Failed to move candidates:", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to move some candidates",
        { variant: "error", autoHideDuration: 3000 }
      );
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleSelectCandidate = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (e) => {
    const currentPageCandidates = filteredCandidates
      .slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
      .map((candidate) => candidate._id);

    if (e.target.checked) {
      setSelectedCandidates((prev) => [
        ...new Set([...prev, ...currentPageCandidates]),
      ]);
    } else {
      setSelectedCandidates((prev) =>
        prev.filter((id) => !currentPageCandidates.includes(id))
      );
    }
  };

  // const showPipelineModal = (pipelineId) => {
  //   const pipeline = activePipelines.find((p) => p._id === pipelineId);
  //   if (pipeline) {
  //     setSelectedPipeline(pipeline);

  //     // Initialize stage dates if not already set
  //     if (!pipelineStageDates[pipelineId]) {
  //       const initialDates = pipeline.stages.map((stage) => ({
  //         stageId: stage._id,
  //         startDate: null,
  //         endDate: null,
  //         dependencyType: "independent",
  //       }));

  //       setPipelineStageDates((prev) => ({
  //         ...prev,
  //         [pipelineId]: initialDates,
  //       }));
  //     }

  //     setPipelineModalVisible(true);
  //   }
  // };

  // const handleStageDateChange = (stageId, field, value) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setPipelineStageDates((prev) => {
  //     const newDates = { ...prev };

  //     if (!newDates[pipelineId]) {
  //       newDates[pipelineId] = [];
  //     }

  //     const stageIndex = newDates[pipelineId].findIndex(
  //       (s) => s.stageId === stageId
  //     );

  //     if (stageIndex === -1) {
  //       newDates[pipelineId].push({
  //         stageId,
  //         startDate: null,
  //         endDate: null,
  //         dependencyType: "independent",
  //       });
  //     } else {
  //       newDates[pipelineId][stageIndex] = {
  //         ...newDates[pipelineId][stageIndex],
  //         [field]: value ? value.format("YYYY-MM-DD") : null,
  //       };
  //     }

  //     return newDates;
  //   });
  // };

  // const addCustomStage = () => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;
  //   const newStage = {
  //     id: `temp-${Date.now()}`,
  //     name: "New Stage",
  //     description: "",
  //     isCustom: true,
  //   };

  //   setCustomStages((prev) => ({
  //     ...prev,
  //     [pipelineId]: [...(prev[pipelineId] || []), newStage],
  //   }));

  //   setPipelineStageDates((prev) => ({
  //     ...prev,
  //     [pipelineId]: [
  //       ...(prev[pipelineId] || []),
  //       {
  //         stageId: newStage.id,
  //         startDate: null,
  //         endDate: null,
  //         dependencyType: "independent",
  //       },
  //     ],
  //   }));
  // };

  // const updateCustomStage = (stageId, updates) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setCustomStages((prev) => ({
  //     ...prev,
  //     [pipelineId]: prev[pipelineId].map((stage) =>
  //       (stage._id || stage.id) === stageId ? { ...stage, ...updates } : stage
  //     ),
  //   }));
  // };

  // const removeCustomStage = (stageId) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setCustomStages((prev) => ({
  //     ...prev,
  //     [pipelineId]: prev[pipelineId].filter(
  //       (stage) => (stage._id || stage.id) !== stageId
  //     ),
  //   }));

  //   setPipelineStageDates((prev) => ({
  //     ...prev,
  //     [pipelineId]: prev[pipelineId].filter(
  //       (stage) => stage.stageId !== stageId
  //     ),
  //   }));
  // };

  // const addStageCustomField = (stageId) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;
  //   const newField = {
  //     id: `field_${Date.now()}`,
  //     label: "New Field",
  //     type: "text",
  //     required: false,
  //   };

  //   setStageCustomFields((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: [...(prev[pipelineId]?.[stageId] || []), newField],
  //     },
  //   }));
  // };

  // const addStageRequiredDocument = (stageId) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;
  //   const newDoc = {
  //     id: `doc_${Date.now()}`,
  //     title: "New Document",
  //   };

  //   setStageRequiredDocuments((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: [...(prev[pipelineId]?.[stageId] || []), newDoc],
  //     },
  //   }));
  // };

  // const updateStageCustomField = (stageId, fieldId, updates) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setStageCustomFields((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: (prev[pipelineId]?.[stageId] || []).map((field) =>
  //         field.id === fieldId ? { ...field, ...updates } : field
  //       ),
  //     },
  //   }));
  // };

  // const removeStageCustomField = (stageId, fieldId) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setStageCustomFields((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: (prev[pipelineId]?.[stageId] || []).filter(
  //         (field) => field.id !== fieldId
  //       ),
  //     },
  //   }));
  // };

  // const updateStageRequiredDocument = (stageId, docId, updates) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setStageRequiredDocuments((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: (prev[pipelineId]?.[stageId] || []).map((doc) =>
  //         doc.id === docId ? { ...doc, ...updates } : doc
  //       ),
  //     },
  //   }));
  // };

  // const removeStageRequiredDocument = (stageId, docId) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setStageRequiredDocuments((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: (prev[pipelineId]?.[stageId] || []).filter(
  //         (doc) => doc.id !== docId
  //       ),
  //     },
  //   }));
  // };

  // const handleStaffAssignmentChange = (stageId, staffIds) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setStageStaffAssignments((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: staffIds,
  //     },
  //   }));
  // };

  // const handleRecruiterAssignmentChange = (stageId, recruiterIds) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setStageRecruiterAssignments((prev) => ({
  //     ...prev,
  //     [pipelineId]: {
  //       ...prev[pipelineId],
  //       [stageId]: recruiterIds,
  //     },
  //   }));
  // };

  // const handleLevelChange = (stageId, levelId) => {
  //   if (!selectedPipeline) return;

  //   const pipelineId = selectedPipeline._id;

  //   setPipelineStageDates((prev) => {
  //     const newDates = { ...prev };

  //     if (!newDates[pipelineId]) {
  //       newDates[pipelineId] = [];
  //     }

  //     const stageIndex = newDates[pipelineId].findIndex(
  //       (s) => s.stageId === stageId
  //     );

  //     if (stageIndex === -1) {
  //       newDates[pipelineId].push({
  //         stageId,
  //         approvalId: levelId,
  //         startDate: null,
  //         endDate: null,
  //         dependencyType: "independent",
  //       });
  //     } else {
  //       newDates[pipelineId][stageIndex] = {
  //         ...newDates[pipelineId][stageIndex],
  //         approvalId: levelId,
  //       };
  //     }

  //     return newDates;
  //   });
  // };

  // const renderPipelineModal = () => {
  //   if (!selectedPipeline) return null;

  //   const pipelineId = selectedPipeline._id;
  //   const pipelineStages = selectedPipeline.stages || [];
  //   const pipelineCustomStages = customStages[pipelineId] || [];
  //   const allStages = [
  //     ...pipelineStages.map((stage) => ({ ...stage, isCustom: false })),
  //     ...pipelineCustomStages.map((stage) => ({ ...stage, isCustom: true })),
  //   ];

  //   return (
  //     <Modal
  //       title={`Configure Pipeline Stages for ${selectedPipeline.name}`}
  //       visible={pipelineModalVisible}
  //       onCancel={() => setPipelineModalVisible(false)}
  //       width={900}
  //       footer={[
  //         <Button key="back" onClick={() => setPipelineModalVisible(false)}>
  //           Cancel
  //         </Button>,
  //         <Button
  //           key="submit"
  //           type="primary"
  //           onClick={() => setPipelineModalVisible(false)}
  //           style={{
  //             background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
  //           }}
  //         >
  //           Save Configuration
  //         </Button>,
  //       ]}
  //       bodyStyle={{
  //         maxHeight: "calc(100vh - 200px)",
  //         overflowY: "auto",
  //       }}
  //     >
  //       {allStages.map((stage) => {
  //         const stageId = stage._id || stage.id;
  //         const dateEntry = pipelineStageDates[pipelineId]?.find(
  //           (d) => d.stageId === stageId
  //         );

  //         const stageFields = stageCustomFields[pipelineId]?.[stageId] || [];
  //         const stageDocs = stageRequiredDocuments[pipelineId]?.[stageId] || [];
  //         const assignedStaff =
  //           stageStaffAssignments[pipelineId]?.[stageId] || [];
  //         const assignedRecruiters =
  //           stageRecruiterAssignments[pipelineId]?.[stageId] || [];

  //         return (
  //           <Card
  //             key={stageId}
  //             title={
  //               <div
  //                 style={{ display: "flex", alignItems: "center", gap: "8px" }}
  //               >
  //                 {stage.isCustom ? (
  //                   <Input
  //                     value={stage.name}
  //                     onChange={(e) =>
  //                       updateCustomStage(stageId, { name: e.target.value })
  //                     }
  //                     style={{ maxWidth: "200px" }}
  //                   />
  //                 ) : (
  //                   <span>{stage.name}</span>
  //                 )}
  //                 {stage.isCustom && <Tag color="orange">Custom</Tag>}
  //                 {dateEntry?.dependencyType && (
  //                   <Tag color="green">{dateEntry.dependencyType}</Tag>
  //                 )}
  //                 {stage.isCustom && (
  //                   <Button
  //                     type="text"
  //                     danger
  //                     icon={<DeleteOutlined />}
  //                     onClick={() => removeCustomStage(stageId)}
  //                   />
  //                 )}
  //               </div>
  //             }
  //             style={{ marginBottom: 16 }}
  //           >
  //             <Row gutter={[16, 16]} align="bottom">
  //               <Col xs={24} sm={12} md={8}>
  //                 <Form.Item label="Start Date">
  //                   <DatePicker
  //                     style={{ width: "100%" }}
  //                     value={
  //                       dateEntry?.startDate ? dayjs(dateEntry.startDate) : null
  //                     }
  //                     onChange={(date) =>
  //                       handleStageDateChange(stageId, "startDate", date)
  //                     }
  //                   />
  //                 </Form.Item>
  //               </Col>

  //               <Col xs={24} sm={12} md={8}>
  //                 <Form.Item label="End Date">
  //                   <DatePicker
  //                     style={{ width: "100%" }}
  //                     value={
  //                       dateEntry?.endDate ? dayjs(dateEntry.endDate) : null
  //                     }
  //                     onChange={(date) =>
  //                       handleStageDateChange(stageId, "endDate", date)
  //                     }
  //                   />
  //                 </Form.Item>
  //               </Col>

  //               <Col xs={24} sm={12} md={8}>
  //                 <Form.Item label="Dependency Type">
  //                   <Select
  //                     value={dateEntry?.dependencyType || "independent"}
  //                     onChange={(value) => {
  //                       setPipelineStageDates((prev) => {
  //                         const newDates = { ...prev };
  //                         if (!newDates[pipelineId]) {
  //                           newDates[pipelineId] = [];
  //                         }

  //                         const stageIndex = newDates[pipelineId].findIndex(
  //                           (s) => s.stageId === stageId
  //                         );

  //                         if (stageIndex === -1) {
  //                           newDates[pipelineId].push({
  //                             stageId,
  //                             dependencyType: value,
  //                             startDate: null,
  //                             endDate: null,
  //                           });
  //                         } else {
  //                           newDates[pipelineId][stageIndex] = {
  //                             ...newDates[pipelineId][stageIndex],
  //                             dependencyType: value,
  //                           };
  //                         }

  //                         return newDates;
  //                       });
  //                     }}
  //                     style={{ width: "100%" }}
  //                   >
  //                     <Option value="independent">Independent</Option>
  //                     <Option value="dependent">Dependent</Option>
  //                   </Select>
  //                 </Form.Item>
  //               </Col>

  //               <Col xs={24} sm={12} md={8}>
  //                 <Form.Item label="Assigned Recruiters">
  //                   <Select
  //                     mode="multiple"
  //                     value={assignedRecruiters}
  //                     onChange={(value) =>
  //                       handleRecruiterAssignmentChange(stageId, value)
  //                     }
  //                     style={{ width: "100%" }}
  //                     placeholder="Select recruiters"
  //                   >
  //                     {recruiters.map((recruiter) => (
  //                       <Option key={recruiter._id} value={recruiter._id}>
  //                         {recruiter.fullName || recruiter.email}
  //                       </Option>
  //                     ))}
  //                   </Select>
  //                 </Form.Item>
  //               </Col>

  //               <Col xs={24} sm={12} md={8}>
  //                 <Form.Item label="Assigned Staff">
  //                   <Select
  //                     mode="multiple"
  //                     value={assignedStaff}
  //                     onChange={(value) =>
  //                       handleStaffAssignmentChange(stageId, value)
  //                     }
  //                     style={{ width: "100%" }}
  //                     placeholder="Select staff"
  //                   >
  //                     {staffs.map((staff) => (
  //                       <Option key={staff._id} value={staff._id}>
  //                         {staff.fullName || staff.email}
  //                       </Option>
  //                     ))}
  //                   </Select>
  //                 </Form.Item>
  //               </Col>

  //               <Col xs={24} sm={12} md={8}>
  //                 <Form.Item label="Approval Level">
  //                   <Select
  //                     style={{ width: "100%" }}
  //                     placeholder="Select approval level"
  //                     value={dateEntry?.approvalId || undefined}
  //                     onChange={(value) => handleLevelChange(stageId, value)}
  //                   >
  //                     {levels.map((group) => (
  //                       <Option key={group._id} value={group._id}>
  //                         {group.groupName}
  //                       </Option>
  //                     ))}
  //                   </Select>
  //                 </Form.Item>
  //               </Col>
  //             </Row>

  //             <Divider orientation="left" plain style={{ margin: "16px 0" }}>
  //               Stage Requirements
  //             </Divider>

  //             <Row gutter={16} style={{ marginBottom: 16 }}>
  //               <Col span={12}>
  //                 <Button
  //                   type="dashed"
  //                   icon={<PlusOutlined />}
  //                   block
  //                   onClick={() => addStageCustomField(stageId)}
  //                 >
  //                   Add Custom Field
  //                 </Button>
  //               </Col>
  //               <Col span={12}>
  //                 <Button
  //                   type="dashed"
  //                   icon={<PlusOutlined />}
  //                   block
  //                   onClick={() => addStageRequiredDocument(stageId)}
  //                 >
  //                   Add Required Document
  //                 </Button>
  //               </Col>
  //             </Row>

  //             {stageFields.length > 0 && (
  //               <div style={{ marginBottom: 16 }}>
  //                 <h4>Custom Fields:</h4>
  //                 {stageFields.map((field) => (
  //                   <Card
  //                     key={field.id}
  //                     size="small"
  //                     style={{ marginBottom: 8 }}
  //                     extra={
  //                       <Button
  //                         type="text"
  //                         danger
  //                         icon={<DeleteOutlined />}
  //                         size="small"
  //                         onClick={() =>
  //                           removeStageCustomField(stageId, field.id)
  //                         }
  //                       />
  //                     }
  //                   >
  //                     <Row gutter={16}>
  //                       <Col span={12}>
  //                         <Input
  //                           value={field.label}
  //                           onChange={(e) =>
  //                             updateStageCustomField(stageId, field.id, {
  //                               label: e.target.value,
  //                             })
  //                           }
  //                           placeholder="Field Label"
  //                         />
  //                       </Col>
  //                       <Col span={12}>
  //                         <Select
  //                           value={field.type}
  //                           onChange={(value) => {
  //                             const shouldHaveOptions =
  //                               typesWithOptions.includes(value);
  //                             updateStageCustomField(stageId, field.id, {
  //                               type: value,
  //                               options: shouldHaveOptions
  //                                 ? field.options?.length
  //                                   ? field.options
  //                                   : [""]
  //                                 : [],
  //                             });
  //                           }}
  //                           style={{ width: "100%" }}
  //                         >
  //                           {fieldTypes.map((type) => (
  //                             <Option key={type.value} value={type.value}>
  //                               {type.label}
  //                             </Option>
  //                           ))}
  //                         </Select>
  //                       </Col>
  //                     </Row>
  //                     <Checkbox
  //                       checked={field.required}
  //                       onChange={(e) =>
  //                         updateStageCustomField(stageId, field.id, {
  //                           required: e.target.checked,
  //                         })
  //                       }
  //                     >
  //                       Required
  //                     </Checkbox>

  //                     {typesWithOptions.includes(field.type) && (
  //                       <div style={{ marginTop: 12 }}>
  //                         <strong style={{ fontSize: "12px" }}>Options:</strong>

  //                         {(field.options || []).map((option, idx) => (
  //                           <Input
  //                             key={idx}
  //                             value={option}
  //                             size="small"
  //                             placeholder={`Option ${idx + 1}`}
  //                             style={{ marginBottom: 8 }}
  //                             onChange={(e) => {
  //                               const newOptions = [...field.options];
  //                               newOptions[idx] = e.target.value;
  //                               updateStageCustomField(stageId, field.id, {
  //                                 options: newOptions,
  //                               });
  //                             }}
  //                           />
  //                         ))}

  //                         <Button
  //                           size="small"
  //                           icon={<PlusOutlined />}
  //                           onClick={() =>
  //                             updateStageCustomField(stageId, field.id, {
  //                               options: [...(field.options || []), ""],
  //                             })
  //                           }
  //                         >
  //                           Add Option
  //                         </Button>
  //                       </div>
  //                     )}
  //                   </Card>
  //                 ))}
  //               </div>
  //             )}

  //             {stageDocs.length > 0 && (
  //               <div style={{ marginBottom: 16 }}>
  //                 <h4>Required Documents:</h4>
  //                 {stageDocs.map((doc) => (
  //                   <Card
  //                     key={doc.id}
  //                     size="small"
  //                     style={{ marginBottom: 8 }}
  //                     extra={
  //                       <Button
  //                         type="text"
  //                         danger
  //                         icon={<DeleteOutlined />}
  //                         size="small"
  //                         onClick={() =>
  //                           removeStageRequiredDocument(stageId, doc.id)
  //                         }
  //                       />
  //                     }
  //                   >
  //                     <Input
  //                       value={doc.title}
  //                       onChange={(e) =>
  //                         updateStageRequiredDocument(stageId, doc.id, {
  //                           title: e.target.value,
  //                         })
  //                       }
  //                       placeholder="Document Title"
  //                     />
  //                   </Card>
  //                 ))}
  //               </div>
  //             )}
  //           </Card>
  //         );
  //       })}

  //       <Button
  //         type="dashed"
  //         onClick={addCustomStage}
  //         icon={<PlusOutlined />}
  //         block
  //       >
  //         Add Custom Stage
  //       </Button>
  //     </Modal>
  //   );
  // };

  if (isLoading || recruiterStagesLoading) {
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

  return (
    <div style={{ padding: "0", fontSize: "14px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={4}
              style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#da2c46",
              }}
            >
              Screening Candidates ({screeningCount})
            </Title>
          </Col>
          <Col>
            {selectedCandidates.length > 0 && (
              <Space style={{ marginBottom: 16 }}>
                <Button
                  type="default"
                  icon={<CheckOutlined />}
                  loading={isBulkMoving}
                  onClick={() => handleBulkChangeStatus("interview")}
                >
                  Move to interview
                </Button>

                <Button
                  type="default"
                  danger
                  icon={<CloseOutlined />}
                  loading={isBulkMoving}
                  onClick={() => handleBulkChangeStatus("rejected")}
                >
                  Reject
                </Button>
              </Space>
            )}
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div>
        {filteredCandidates.length > 0 ? (
          <>
            <Card size="small" style={{ marginBottom: "16px" }}>
              <Checkbox
                onChange={handleSelectAll}
                checked={filteredCandidates
                  .slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                  )
                  .every((candidate) =>
                    selectedCandidates.includes(candidate._id)
                  )}
                indeterminate={
                  filteredCandidates
                    .slice(
                      (pagination.current - 1) * pagination.pageSize,
                      pagination.current * pagination.pageSize
                    )
                    .some((candidate) =>
                      selectedCandidates.includes(candidate._id)
                    ) &&
                  !filteredCandidates
                    .slice(
                      (pagination.current - 1) * pagination.pageSize,
                      pagination.current * pagination.pageSize
                    )
                    .every((candidate) =>
                      selectedCandidates.includes(candidate._id)
                    )
                }
              >
                Select all candidates on this page
              </Checkbox>
            </Card>
            {filteredCandidates
              .slice(
                (pagination.current - 1) * pagination.pageSize,
                pagination.current * pagination.pageSize
              )
              .map((candidate, index) => (
                <CandidateCard
                  key={candidate._id || index}
                  candidate={candidate}
                  index={index}
                  onViewProfile={handleViewProfile}
                  showExperience={true}
                  showSkills={true}
                  maxSkills={5}
                  onSelectCandidate={handleSelectCandidate}
                  isSelected={selectedCandidates.includes(candidate._id)}
                  isSelectable={true}
                />
              ))}
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePaginationChange}
                showSizeChanger
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>

            {/* {renderPipelineModal()} */}
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                {searchTerm || activeFiltersCount > 0
                  ? "No candidates match your search criteria"
                  : "No screening candidates found"}
              </span>
            }
          />
        )}
      </div>

      {/* Candidate Details Modal */}
      <Modal
        title="Candidate Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        {selectedCandidate && (
          <>
            <Descriptions
              bordered
              column={window.innerWidth < 768 ? 1 : 2}
              size="small"
            >
              <Descriptions.Item label="Full Name" span={2}>
                {selectedCandidate.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedCandidate.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedCandidate.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={getScreeningStatusColor(
                    selectedCandidate.candidateStatus
                  )}
                >
                  {selectedCandidate.candidateStatus?.toUpperCase() ||
                    "SCREENING"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedCandidate.location}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedCandidate.title}
              </Descriptions.Item>
              <Descriptions.Item label="Work Order">
                {selectedCandidate.workOrder?.title || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Skills" span={2}>
                <Space wrap>
                  {selectedCandidate.skills?.map((skill, index) => (
                    <Tag key={index}>{skill}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Education" span={2}>
                {selectedCandidate.education?.length > 0 ? (
                  selectedCandidate.education.map((edu, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Text strong>
                        {edu.degree} in {edu.field}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {edu.institution} ({edu.year})
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No education information</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Work Experience" span={2}>
                {selectedCandidate.workExperience?.length > 0 ? (
                  selectedCandidate.workExperience.map((exp, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Text strong>
                        {exp.title} at {exp.company}
                      </Text>
                      <br />
                      <Text type="secondary">{exp.duration}</Text>
                      <br />
                      <Text>{exp.description}</Text>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No work experience</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {selectedCandidate.workOrder?.documents?.length > 0 && (
              <>
                <Divider orientation="left" style={{ margin: "16px 0" }}>
                  Work Order Documents
                </Divider>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <SafetyCertificateOutlined
                            style={{ color: "#da2c46" }}
                          />
                          <Text strong>Required Documents</Text>
                        </Space>
                      }
                    >
                      {selectedCandidate?.workOrder?.documents.map(
                        (doc, index) => {
                          // Find if this document was uploaded by the candidate
                          const uploadedDoc =
                            screeningData?.customFieldResponses
                              ?.find(
                                (resp) =>
                                  resp._id === selectedCandidate.applicationId
                              )
                              ?.workOrderuploadedDocuments?.find(
                                (uploaded) =>
                                  uploaded.documentName === doc.name ||
                                  uploaded.documentName?.toLowerCase() ===
                                    doc.name?.toLowerCase()
                              );

                          return (
                            <div
                              key={doc._id || index}
                              style={{
                                padding: "12px",
                                border: `2px solid ${
                                  uploadedDoc ? "#52c41a" : "#d9d9d9"
                                }`,
                                borderRadius: "8px",
                                backgroundColor: uploadedDoc
                                  ? "#f6ffed"
                                  : "#fafafa",
                                marginBottom: "12px",
                              }}
                            >
                              <Row justify="space-between" align="middle">
                                <Col>
                                  <Space direction="vertical" size={4}>
                                    <Space>
                                      <SafetyCertificateOutlined
                                        style={{
                                          color: uploadedDoc
                                            ? "#52c41a"
                                            : "#8c8c8c",
                                          fontSize: "16px",
                                        }}
                                      />
                                      <Text strong>{doc.name}</Text>
                                      {doc.isMandatory && (
                                        <Tag color="red" size="small">
                                          Mandatory
                                        </Tag>
                                      )}
                                    </Space>
                                    {doc.description && (
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {doc.description}
                                      </Text>
                                    )}
                                    {uploadedDoc && (
                                      <>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: "12px" }}
                                        >
                                          File: {uploadedDoc.fileName}
                                        </Text>
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: "12px" }}
                                        >
                                          Uploaded:{" "}
                                          {new Date(
                                            uploadedDoc.uploadedAt
                                          ).toLocaleString()}
                                        </Text>
                                      </>
                                    )}
                                  </Space>
                                </Col>
                                <Col>
                                  {uploadedDoc ? (
                                    <Space>
                                      <Tag
                                        color="success"
                                        icon={<CheckOutlined />}
                                      >
                                        Uploaded
                                      </Tag>
                                      <Button
                                        type="primary"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                          window.open(
                                            uploadedDoc.fileUrl,
                                            "_blank"
                                          )
                                        }
                                        style={{
                                          backgroundColor: "#52c41a",
                                          borderColor: "#52c41a",
                                        }}
                                      >
                                        View
                                      </Button>
                                    </Space>
                                  ) : (
                                    <Tag color="warning">Not Uploaded</Tag>
                                  )}
                                </Col>
                              </Row>
                            </div>
                          );
                        }
                      )}
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            <Divider orientation="left" style={{ margin: "16px 0" }}>
              Pipeline Configuration
            </Divider>
            {selectedCandidate?.tagPipelineId ? (
              <div>
                <Descriptions
                  bordered
                  column={window.innerWidth < 768 ? 1 : 2}
                  size="small"
                >
                  <Descriptions.Item label="Tagged Pipeline">
                    <Tag color="blue">
                      {selectedCandidate.tagPipelineId.name}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                {/* <Button
                  type="primary"
                  icon={<FormOutlined />}
                  onClick={() =>
                    showPipelineModal(selectedCandidate.tagPipelineId._id)
                  }
                  style={{ marginTop: 16, background: "#da2c46" }}
                >
                  Configure Pipeline Stages
                </Button> */}
              </div>
            ) : (
              <div>
                <Text type="secondary">
                  No seperate pipeline tagged for this candidate
                </Text>
                {/* <Select
                  placeholder="Select a pipeline"
                  style={{ width: "100%", marginTop: 16 }}
                  onChange={(value) => {
                    const pipeline = activePipelines.find(
                      (p) => p._id === value
                    );
                    setSelectedPipeline(pipeline);
                  }}
                >
                  {activePipelines.map((pipeline) => (
                    <Option key={pipeline._id} value={pipeline._id}>
                      {pipeline.name}
                    </Option>
                  ))}
                </Select>

                {selectedPipeline && (
                  <Button
                    type="primary"
                    icon={<FormOutlined />}
                    onClick={() => showPipelineModal(selectedPipeline._id)}
                    style={{ marginTop: 16, background: "#da2c46" }}
                  >
                    Configure Pipeline Stages
                  </Button>
                )} */}
              </div>
            )}

            <Divider orientation="left" style={{ margin: "16px 0" }}>
              Candidate Actions
            </Divider>
            <div style={{ marginBottom: "16px", display: "flex", gap: 8 }}>
              {/* <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={handleMoveToPipeline}
                loading={isMovingToPipeline}
                style={{ background: "#da2c46" }}
              >
                Move to Work Order Pipeline
              </Button> */}

              {/* {selectedPipeline && (
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={handleMoveToSelectedPipeline}
                  loading={isMovingToPipeline}
                  style={{ background: "#da2c46" }}
                >
                  Move to Selected Pipeline
                </Button>
              )} */}

              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() => handleChangeStatus("interview")}
                loading={isStatusChange}
                style={{ background: "#da2c46" }}
              >
                Move to Interview
              </Button>
            </div>
            <Divider />
            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth < 768 ? "column" : "row",
                gap: "8px",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <Button onClick={() => setIsModalVisible(false)}>Close</Button>
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: "8px",
                }}
              >
                <Button danger onClick={() => handleChangeStatus("rejected")}>
                  <CloseOutlined /> Reject
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        title="Select or Update Pipeline"
        open={isPipelineModalVisible}
        onCancel={() => {
          setIsPipelineModalVisible(false);
          setPendingStatusUpdate(null);
          setSelectedPipelineForUpdate(null);
          setSelectedCandidates([]);
        }}
        onOk={
          selectedCandidates.length > 0
            ? handleBulkPipelineUpdateConfirm
            : handlePipelineUpdateConfirm
        }
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
      >
        <Form layout="vertical">
          <Form.Item label="Pipeline">
            <Select
              placeholder="Select a pipeline"
              value={selectedPipelineForUpdate}
              onChange={setSelectedPipelineForUpdate}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString()?.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
            >
              {activePipelines.map((pipeline) => (
                <Option key={pipeline._id} value={pipeline._id}>
                  {pipeline.name}
                </Option>
              ))}
            </Select>
            {selectedCandidate?.tagPipelineId && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Current pipeline:{" "}
                {typeof selectedCandidate.tagPipelineId === "object"
                  ? selectedCandidate.tagPipelineId.name
                  : selectedCandidate.tagPipelineId}
              </Text>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScreeningCandidates;

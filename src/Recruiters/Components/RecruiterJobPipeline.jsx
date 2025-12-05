import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPipelineJobsByIdQuery,
  useMoveToNextStageMutation,
  useStagedCandidateNotifyMutation,
  useUpdateStageDatesMutation,
  useUpdateStageRecruitersMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useGetRecruitersNameQuery } from "../../Slices/Admin/AdminApis";
import {
  Card,
  Typography,
  Tag,
  Space,
  Badge,
  List,
  Spin,
  Avatar,
  Button,
  Tabs,
  Modal,
  message,
  Tooltip,
  Select,
  Input,
  Empty,
  Collapse,
  Divider,
  Row,
  Col,
  Grid,
  Form,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  LeftOutlined,
  CalendarOutlined,
  FileOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  CommentOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { NotificationModal } from "../../Components/NotificationModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const approvalScrollbarStyles = `
  /* For Webkit browsers (Chrome, Safari) */
  div[style*="overflowY: auto"]::-webkit-scrollbar {
    width: 8px;
  }
  
  div[style*="overflowY: auto"]::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }
  
  div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 4px;
  }
  
  div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
    background: #bfbfbf;
  }
`;

const RecruiterJobPipeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeStage, setActiveStage] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [targetStage, setTargetStage] = useState(null);
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [processedJobData, setProcessedJobData] = useState(null);
  const [reviewerComments, setReviewerComments] = useState("");
  const [isNotifyModalVisible, setIsNotifyModalVisible] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [isDateConfirmModalVisible, setIsDateConfirmModalVisible] =
    useState(false);
  const [isRecruiterConfirmModalVisible, setIsRecruiterConfirmModalVisible] =
    useState(false);
  const [tempRecruiters, setTempRecruiters] = useState([]);
  const [isEditingRecruiters, setIsEditingRecruiters] = useState(false);
  const [availableNextStages, setAvailableNextStages] = useState([]);
  const [selectedNextStage, setSelectedNextStage] = useState(null);
  const [isStageOrderChanged, setIsStageOrderChanged] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const screens = useBreakpoint();

  const primaryColor = "#da2c46";

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetPipelineJobsByIdQuery(id);
  const [moveToNextStage, { isLoading: isMoving }] =
    useMoveToNextStageMutation();
  const [remainder] = useStagedCandidateNotifyMutation();
  const [updateStageDates, { isLoading: isUpdatingDates }] =
    useUpdateStageDatesMutation();
  const [updateStageRecruiters, { isLoading: isUpdatingRecruiters }] =
    useUpdateStageRecruitersMutation();

  const { data: recMembers } = useGetRecruitersNameQuery();

  const activeRecruiters =
    recMembers?.recruitername?.filter(
      (recruiter) => recruiter.accountStatus === "active"
    ) || [];

  useEffect(() => {
    if (apiData?.data) {
      const pipelineData = apiData.data;
      const workOrder = pipelineData.workOrder;
      const user = pipelineData.user;
      const stageProgress = pipelineData.stageProgress || [];

      const fullPipeline = pipelineData.tagPipelineId
        ? pipelineData.fullPipeline ||
          stageProgress[0]?.pipelineId || { stages: [] }
        : stageProgress[0]?.pipelineId || { stages: [] };

      const currentStageProgress =
        stageProgress.find((stage) => stage.stageStatus !== "approved") ||
        stageProgress[stageProgress.length - 1];

      const processedCandidate = {
        _id: pipelineData._id,
        pipelineCandidateId: pipelineData._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        skills: user.skills || [],
        avatar: null,
        status: pipelineData.status === "pipeline" ? "Active" : "Inactive",
        currentStage: currentStageProgress?.stageId || null,
        currentStageId: currentStageProgress?.stageId || null,
        currentStageName: currentStageProgress?.stageName || "Unknown",
        stageStatus: currentStageProgress?.stageStatus || "pending",
        appliedDate: pipelineData.createdAt,
        stageProgress: stageProgress,
        isSourced: pipelineData.isSourced === "true",
        responses: pipelineData.responses || [],
        uploadedDocuments: currentStageProgress?.uploadedDocuments || [],
        recruiterReviews: currentStageProgress?.recruiterReviews || [],
        requiredDocuments:
          fullPipeline.stages?.find(
            (s) => s._id === currentStageProgress?.stageId
          )?.requiredDocuments || [],
        userId: user._id,
        workOrderId: workOrder._id,
        tagPipelineId: pipelineData.tagPipelineId,
        pendingPipelineStages: pipelineData.pendingPipelineStages || [],
      };

      const jobData = {
        _id: workOrder._id,
        title: workOrder.title,
        company: workOrder.companyIndustry || "Company",
        location: workOrder.officeLocation,
        jobCode: workOrder.jobCode,
        description: workOrder.description,
        startDate: workOrder.startDate,
        endDate: workOrder.endDate,
        isActive: pipelineData.status === "pipeline",
        workOrder: workOrder,
        pipeline: {
          _id: fullPipeline._id,
          name: fullPipeline.name,
          stages: fullPipeline.stages || [],
        },
        candidates: [processedCandidate],
        workOrderStages: workOrder.pipelineStageTimeline || [],
        deadline: workOrder.endDate,
      };

      setProcessedJobData(jobData);
    }
  }, [apiData, id]);

  const formatIST = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (processedJobData) {
      const currentCandidate = processedJobData.candidates[0];

      if (currentCandidate?.currentStageId || currentCandidate?.currentStage) {
        setActiveStage(
          currentCandidate.currentStageId || currentCandidate.currentStage
        );
      } else if (currentCandidate?.stageProgress?.length > 0) {
        setActiveStage(currentCandidate.stageProgress[0].stageId);
      } else if (
        processedJobData.workOrder?.pipelineStageTimeline?.length > 0
      ) {
        setActiveStage(
          processedJobData.workOrder.pipelineStageTimeline[0].stageId
        );
      }
    }
  }, [processedJobData]);

  const handleEditRecruitersClick = () => {
    const currentCandidate = processedJobData?.candidates?.[0];
    if (!currentCandidate) return;

    const reviews =
      currentCandidate.stageProgress?.find((sp) => sp.stageId === activeStage)
        ?.recruiterReviews || [];

    const currentRecruiterIds = [
      ...new Set(reviews.map((review) => review.recruiterId)),
    ];

    setTempRecruiters(currentRecruiterIds);
    setIsEditingRecruiters(true);
  };

  const getNextStageId = (currentStageId) => {
    if (!processedJobData || !currentStageId) return null;

    const currentCandidate = processedJobData.candidates[0];
    const isTagged = !!currentCandidate?.tagPipelineId;

    // Get ALL stages using the same logic as renderPipelineTabs
    let allStages = [];

    if (isTagged) {
      // For tagged pipelines, use the same logic as renderPipelineTabs
      const allStagesMap = new Map();

      // 1. Get stages from stageProgress
      if (currentCandidate?.stageProgress) {
        currentCandidate.stageProgress.forEach((progress, index) => {
          if (progress.stageId) {
            allStagesMap.set(progress.stageId, {
              stageId: progress.stageId,
              order: index,
              source: "stageProgress",
            });
          }
        });
      }

      // 2. Get stages from pipeline.stages (if exists)
      if (processedJobData.pipeline?.stages) {
        processedJobData.pipeline.stages.forEach((stage, index) => {
          if (stage._id && !allStagesMap.has(stage._id)) {
            allStagesMap.set(stage._id, {
              stageId: stage._id,
              order: allStagesMap.size + index,
              source: "pipeline",
            });
          }
        });
      }

      // 3. Get stages from pendingPipelineStages (if exists)
      if (currentCandidate.pendingPipelineStages) {
        currentCandidate.pendingPipelineStages.forEach((stage, index) => {
          if (stage.stageId && !allStagesMap.has(stage.stageId)) {
            allStagesMap.set(stage.stageId, {
              stageId: stage.stageId,
              order: allStagesMap.size + index,
              source: "pending",
            });
          }
        });
      }

      // Convert to array and sort by order
      allStages = Array.from(allStagesMap.values())
        .sort((a, b) => a.order - b.order)
        .map((item) => item.stageId);
    } else {
      // For work order stages
      allStages =
        processedJobData.workOrder?.pipelineStageTimeline?.map(
          (stage) => stage.stageId
        ) || [];
    }

    console.log("DEBUG getNextStageId:", {
      currentStageId,
      allStages,
      currentIndex: allStages.indexOf(currentStageId),
      totalStages: allStages.length,
      isTagged,
    });

    // Find current stage index
    const currentIndex = allStages.indexOf(currentStageId);

    // If current stage found and there's a next stage
    if (currentIndex >= 0 && currentIndex < allStages.length - 1) {
      return allStages[currentIndex + 1];
    }

    // No next stage found
    return null;
  };

  const getAllNextStages = (currentStageId) => {
    console.log("DEBUG getAllNextStages called with:", currentStageId);

    if (!processedJobData || !currentStageId) {
      console.log("DEBUG: No processedJobData or currentStageId");
      return [];
    }

    const currentCandidate = processedJobData.candidates[0];
    const isTagged = !!currentCandidate?.tagPipelineId;

    console.log("DEBUG getAllNextStages:", {
      isTagged,
      hasStageProgress: !!currentCandidate?.stageProgress,
      stageProgressLength: currentCandidate?.stageProgress?.length,
    });

    let allStages = [];

    if (isTagged) {
      // For tagged/separate pipelines - get ALL stages from multiple sources
      const allStagesMap = new Map();
      let orderCounter = 0;

      // 1. FIRST: Get all stages from stageProgress (includes current/completed stages)
      if (currentCandidate?.stageProgress) {
        console.log("DEBUG: Adding stages from stageProgress");
        currentCandidate.stageProgress.forEach((progress) => {
          if (progress.stageId) {
            allStagesMap.set(progress.stageId, {
              stageId: progress.stageId,
              stageName:
                progress.stageName ||
                progress.fullStage?.name ||
                "Unknown Stage",
              order: orderCounter++,
              source: "stageProgress",
            });
          }
        });
      }

      // 2. THEN: Add stages from fullPipeline.stages (future/pending stages)
      if (processedJobData.pipeline?.stages) {
        console.log("DEBUG: Adding stages from fullPipeline.stages");
        processedJobData.pipeline.stages.forEach((stage) => {
          if (stage._id && !allStagesMap.has(stage._id)) {
            allStagesMap.set(stage._id, {
              stageId: stage._id,
              stageName: stage.name || stage.stageName || "Unknown Stage",
              order: orderCounter++,
              source: "fullPipeline",
            });
          }
        });
      }

      // 3. ALSO: Check pendingPipelineStages
      if (currentCandidate.pendingPipelineStages) {
        console.log("DEBUG: Adding stages from pendingPipelineStages");
        currentCandidate.pendingPipelineStages.forEach((stage) => {
          if (stage.stageId && !allStagesMap.has(stage.stageId)) {
            allStagesMap.set(stage.stageId, {
              stageId: stage.stageId,
              stageName: stage.stageName || "Unknown Stage",
              order: orderCounter++,
              source: "pendingStages",
            });
          }
        });
      }

      // 4. FINALLY: Check workOrder.pipelineStageTimeline for any missing stages
      if (processedJobData.workOrder?.pipelineStageTimeline) {
        console.log(
          "DEBUG: Adding stages from workOrder.pipelineStageTimeline"
        );
        processedJobData.workOrder.pipelineStageTimeline.forEach((stage) => {
          if (stage.stageId && !allStagesMap.has(stage.stageId)) {
            allStagesMap.set(stage.stageId, {
              stageId: stage.stageId,
              stageName: stage.stageName || "Unknown Stage",
              order: orderCounter++,
              source: "workOrder",
            });
          }
        });
      }

      // Convert to array (already in order due to orderCounter)
      allStages = Array.from(allStagesMap.values());

      console.log("DEBUG: allStages for tagged pipeline:", {
        total: allStages.length,
        stages: allStages.map((s) => ({
          id: s.stageId,
          name: s.stageName,
          source: s.source,
        })),
      });
    } else {
      // FOR WORK ORDER PIPELINE: Get stageIds that are present in stageProgress
      const stageProgressIds =
        currentCandidate.stageProgress?.map((sp) => sp.stageId) || [];

      console.log("DEBUG: Stage Progress IDs:", stageProgressIds);

      // Get all stages from pipelineStageTimeline
      const allPipelineStages =
        processedJobData.workOrder?.pipelineStageTimeline || [];

      console.log(
        "DEBUG: All Pipeline Stages:",
        allPipelineStages.map((s) => ({
          stageId: s.stageId,
          stageName: s.stageName,
          stageOrder: s.stageOrder,
        }))
      );

      // Filter: Include stages that are NOT in stageProgress
      // (These are the pending stages that haven't been started yet)
      allStages = allPipelineStages
        .filter((stage) => !stageProgressIds.includes(stage.stageId))
        .map((stage, index) => ({
          stageId: stage.stageId,
          stageName: stage.stageName,
          stageOrder: stage.stageOrder !== undefined ? stage.stageOrder : index,
          order: index,
        }));

      console.log(
        "DEBUG: Filtered stages for work order (excluding stages in progress):",
        {
          total: allStages.length,
          stages: allStages.map((s) => ({
            stageId: s.stageId,
            stageName: s.stageName,
            stageOrder: s.stageOrder,
          })),
        }
      );
    }

    // Find current stage position in the full list
    const currentIndex = allStages.findIndex(
      (stage) => stage.stageId === currentStageId
    );

    console.log("DEBUG getAllNextStages result:", {
      currentStageId,
      currentIndex,
      totalStages: allStages.length,
      allStageIds: allStages.map((s) => s.stageId),
    });

    // Return ALL stages after current stage
    if (currentIndex >= 0 && currentIndex < allStages.length - 1) {
      const nextStages = allStages.slice(currentIndex + 1);
      console.log("DEBUG: Returning next stages:", nextStages);
      // Remove temporary properties
      return nextStages.map(({ source, order, ...stage }) => stage);
    }

    // For work order pipeline, if currentIndex is -1 (stage not in filtered list),
    // it means current stage is in progress, so return all pending stages
    if (!isTagged && currentIndex === -1) {
      console.log(
        "DEBUG: Current stage not in filtered list, returning all pending stages"
      );
      return allStages.map(({ source, order, ...stage }) => stage);
    }

    console.log(
      "DEBUG: No next stages found (currentIndex:",
      currentIndex,
      ")"
    );
    return [];
  };

  const getReviewerIdForStage = (stageId) => {
    if (!processedJobData) {
      console.log("DEBUG getReviewerIdForStage: No processedJobData");
      return null;
    }

    const currentCandidate = processedJobData.candidates[0];
    const isTagged = !!currentCandidate?.tagPipelineId;

    console.log("DEBUG getReviewerIdForStage START:", {
      stageId,
      isTagged,
      candidateName: currentCandidate?.name,
      stageProgressCount: currentCandidate?.stageProgress?.length,
    });

    // ALWAYS check stageProgress first (works for both tagged and work order)
    const stageProgress = currentCandidate.stageProgress?.find(
      (progress) => progress.stageId === stageId
    );

    console.log(
      "DEBUG getReviewerIdForStage - stageProgress found:",
      stageProgress
    );

    if (stageProgress?.recruiterId) {
      console.log(
        "DEBUG getReviewerIdForStage - Found recruiterId in stageProgress:",
        stageProgress.recruiterId
      );
      return stageProgress.recruiterId;
    }

    // If not in stageProgress, check pipelineStageTimeline (for work order only)
    if (!isTagged) {
      const stageTimeline =
        processedJobData.workOrder?.pipelineStageTimeline?.find(
          (timeline) => timeline.stageId === stageId
        );

      console.log("DEBUG getReviewerIdForStage - stageTimeline found:", {
        found: !!stageTimeline,
        recruiterIds: stageTimeline?.recruiterIds,
      });

      if (
        stageTimeline?.recruiterIds &&
        stageTimeline.recruiterIds.length > 0
      ) {
        console.log(
          "DEBUG getReviewerIdForStage - Found recruiterId in stageTimeline:",
          stageTimeline.recruiterIds[0]
        );
        return stageTimeline.recruiterIds[0];
      }
    }

    console.log(
      "DEBUG getReviewerIdForStage - No recruiterId found, returning null"
    );
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;

    return date.toLocaleDateString();
  };

  const getStageName = (stageId) => {
    if (!processedJobData) return "";

    const currentCandidate = processedJobData.candidates[0];

    // 1. Check in stageProgress[0].pipelineId.stages
    if (currentCandidate?.stageProgress?.[0]?.pipelineId?.stages) {
      const stage = currentCandidate.stageProgress[0].pipelineId.stages.find(
        (s) => s._id === stageId
      );
      if (stage?.name) return stage.name;
    }

    // 2. Check in individual stageProgress items
    const stageProgress = currentCandidate.stageProgress?.find(
      (sp) => sp.stageId === stageId
    );
    if (stageProgress?.stageName) return stageProgress.stageName;
    if (stageProgress?.fullStage?.name) return stageProgress.fullStage.name;

    // 3. Check in fullPipeline.stages
    const pipelineStage = processedJobData.pipeline?.stages?.find(
      (s) => s._id === stageId
    );
    if (pipelineStage?.name) return pipelineStage.name;

    // 4. Check in workOrder.pipelineStageTimeline
    const workOrderStage =
      processedJobData.workOrder?.pipelineStageTimeline?.find(
        (s) => s.stageId === stageId
      );
    if (workOrderStage?.stageName) return workOrderStage.stageName;

    // 5. Check in pendingPipelineStages
    const pendingStage = currentCandidate.pendingPipelineStages?.find(
      (stage) => stage.stageId === stageId
    );
    if (pendingStage?.stageName) return pendingStage.stageName;

    // 6. Check if stageId matches currentStage in stageProgress
    const currentStageProgress = currentCandidate.stageProgress?.find(
      (sp) => sp.currentStage === stageId
    );
    if (currentStageProgress?.stageName) return currentStageProgress.stageName;

    return "Unknown Stage";
  };

  const getStageDates = (stageId) => {
    if (!processedJobData) return { startDate: null, endDate: null };

    const currentCandidate = processedJobData.candidates[0];

    // ALWAYS use stageProgress since it's common in both API responses
    const stageProgress = currentCandidate.stageProgress?.find(
      (progress) => progress.stageId === stageId
    );

    return {
      startDate: stageProgress?.startDate || null,
      endDate: stageProgress?.endDate || null,
    };
  };

  const getCandidatesInStage = (stageId) => {
    if (!processedJobData || !processedJobData.candidates) return [];

    return processedJobData.candidates.filter((candidate) => {
      if (
        candidate.currentStageId === stageId ||
        candidate.currentStage === stageId
      ) {
        return true;
      }

      const stageProgress = candidate.stageProgress?.find(
        (progress) => progress.stageId === stageId
      );
      if (stageProgress) {
        return true;
      }

      if (candidate.pendingPipelineStages) {
        return candidate.pendingPipelineStages.some(
          (stage) => stage.stageId === stageId
        );
      }

      return false;
    });
  };

  const handleMoveCandidate = (candidate, e) => {
    e?.stopPropagation();
    setSelectedCandidate(candidate);
    setReviewerComments("");
    form.resetFields();
    setSelectedNextStage(null);
    setIsStageOrderChanged(false);

    const currentStageId = candidate.currentStageId || candidate.currentStage;

    console.log("DEBUG handleMoveCandidate:", {
      candidate,
      currentStageId,
      isTagged: !!candidate.tagPipelineId,
      stageProgress: candidate.stageProgress,
      pipelineStages: candidate.stageProgress?.[0]?.pipelineId?.stages,
    });

    const nextStageId = getNextStageId(currentStageId);
    setTargetStage(nextStageId);
    setSelectedNextStage(nextStageId);

    const nextStages = getAllNextStages(currentStageId);

    console.log("DEBUG nextStages result:", {
      nextStages,
      nextStagesLength: nextStages.length,
    });

    setAvailableNextStages(nextStages);

    setIsMoveModalVisible(true);
  };

  const confirmMoveCandidate = async () => {
    console.log("=== CONFIRM MOVE CANDIDATE STARTED ===");

    try {
      console.log("Step 1: Validating form fields...");
      const values = await form.validateFields();
      console.log("Step 1: Form validation successful:", values);

      if (!selectedCandidate) {
        console.error("Step 2: FAILED - No candidate selected");
        message.error("No candidate selected");
        return;
      }
      console.log("Step 2: Selected candidate:", selectedCandidate);

      const currentStageId =
        selectedCandidate.currentStageId || selectedCandidate.currentStage;

      if (!currentStageId) {
        console.error("Step 3: FAILED - Cannot determine current stage");
        message.error("Cannot determine current stage for candidate");
        return;
      }
      console.log("Step 3: Current stage ID:", currentStageId);

      const isTagged = !!selectedCandidate.tagPipelineId;
      console.log("Step 4: Is tagged pipeline?", isTagged);

      // 1. Get the selected next stage from the form/dropdown
      const selectedNextStageId = values.nextStageId;
      console.log("Step 5: Selected next stage ID:", selectedNextStageId);

      // *** FIX: Allow null for last stage (finish process) ***
      const isLastStage = !selectedNextStageId;
      console.log("Step 5a: Is last stage (finish)?", isLastStage);

      // 2. Check if stage order is changed (only if not last stage)
      let isStageOrderChanged = false;
      if (!isLastStage) {
        const defaultNextStageId = getNextStageId(currentStageId);
        isStageOrderChanged = selectedNextStageId !== defaultNextStageId;
        console.log("Step 6: Stage order check:", {
          defaultNextStageId,
          selectedNextStageId,
          isStageOrderChanged,
        });
      }

      const currentStageProgress = selectedCandidate.stageProgress.find(
        (stage) => stage.stageId === currentStageId
      );

      if (!currentStageProgress) {
        console.error("Step 7: FAILED - Cannot find stage progress");
        message.error("Cannot find stage progress for current stage");
        return;
      }
      console.log(
        "Step 7: Current stage progress found:",
        currentStageProgress
      );

      // Check if stage requires approval
      const hasApprovalLevels =
        currentStageProgress?.approvalDetails?.levels?.length > 0;
      console.log("Step 8: Has approval levels?", hasApprovalLevels);

      if (hasApprovalLevels) {
        const isStageApproved =
          currentStageProgress.approval?.isApproved === true;
        console.log("Step 8a: Is stage approved?", isStageApproved);
        if (!isStageApproved) {
          console.error("Step 8a: FAILED - Stage not approved");
          message.warning(
            "Cannot move candidate until current stage is approved"
          );
          return;
        }
      }

      // Check if any recruiter has already approved
      const reviewerComments = currentStageProgress?.recruiterReviews || [];
      const hasAnyRecruiterApproved = reviewerComments.some(
        (review) => review.status === "approved"
      );
      console.log(
        "Step 9: Has any recruiter approved?",
        hasAnyRecruiterApproved
      );

      if (hasAnyRecruiterApproved) {
        console.error("Step 9: FAILED - Already approved by recruiter");
        message.warning(
          "This candidate has already been approved by a recruiter"
        );
        return;
      }

      // For non-approval stages, check documents
      if (!hasApprovalLevels) {
        console.log("Step 10: Checking documents for non-approval stage...");

        const currentStage = processedJobData.pipeline?.stages?.find(
          (stage) => stage._id === currentStageId
        );

        const stageTimeline =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (timeline) => timeline.stageId === currentStageId
          );

        const allRequiredDocuments = [
          ...(currentStage?.requiredDocuments || []),
          ...(stageTimeline?.requiredDocuments?.map((doc) => doc.title) || []),
        ];

        const uniqueRequiredDocuments = [...new Set(allRequiredDocuments)];
        console.log("Step 10a: Required documents:", uniqueRequiredDocuments);

        if (uniqueRequiredDocuments.length > 0) {
          const uploadedDocuments =
            currentStageProgress?.uploadedDocuments || [];
          console.log(
            "Step 10b: Uploaded documents count:",
            uploadedDocuments.length
          );

          if (uploadedDocuments.length === 0) {
            console.error("Step 10b: FAILED - No documents uploaded");
            message.warning(
              "Cannot move candidate until required documents are uploaded"
            );
            return;
          }
        }
      }

      // Get reviewer ID
      const currentStageRecruiterId = getReviewerIdForStage(currentStageId);
      console.log(
        "Step 11: Current stage recruiter ID:",
        currentStageRecruiterId
      );

      if (!currentStageRecruiterId) {
        console.error("Step 11: FAILED - No recruiter assigned");
        message.error("No recruiter assigned to the current stage");
        return;
      }

      console.log("Step 12: Building payload...");

      // Prepare base payload
      const payload = {
        userId: selectedCandidate.userId,
        workOrderId: selectedCandidate.workOrderId,
        stageId: currentStageId,
        reviewerId: currentStageRecruiterId,
        reviewerComments:
          values.reviewerComments ||
          (isLastStage ? "Process completed" : "Moved to next stage"),
        isStageOrderChange: isStageOrderChanged,
      };

      // *** FIX: Only add nextStageId if not last stage ***
      if (!isLastStage) {
        payload.nextStageId = selectedNextStageId;
      }

      console.log("Step 12a: Base payload created:", payload);

      // For work order pipeline, add stageOrder
      if (!isTagged && !isLastStage) {
        console.log("Step 13: Work order pipeline - finding stage order...");

        const selectedStage =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (stage) => stage.stageId === selectedNextStageId
          );

        console.log("Step 13a: Selected stage from timeline:", selectedStage);

        if (selectedStage && selectedStage.stageOrder !== undefined) {
          payload.stageOrder = selectedStage.stageOrder;
          console.log(
            "Step 13b: Added stageOrder to payload:",
            selectedStage.stageOrder
          );
        } else {
          console.warn("Step 13b: WARNING - Could not find stageOrder");
          console.log(
            "Available stages in timeline:",
            processedJobData.workOrder?.pipelineStageTimeline?.map((s) => ({
              stageId: s.stageId,
              stageName: s.stageName,
              stageOrder: s.stageOrder,
            }))
          );
        }
      } else if (isTagged) {
        console.log("Step 13: Tagged pipeline - adding tag fields...");
        payload.tagPipelineId = selectedCandidate.tagPipelineId;
        payload.pipelineCandidateId =
          selectedCandidate.pipelineCandidateId || selectedCandidate._id;
        console.log("Step 13a: Added tag fields:", {
          tagPipelineId: payload.tagPipelineId,
          pipelineCandidateId: payload.pipelineCandidateId,
        });
      }

      console.log("=== FINAL PAYLOAD ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("===================");

      console.log("Step 14: Calling API...");
      const result = await moveToNextStage(payload).unwrap();

      console.log("Step 15: API call successful!");
      console.log("API Response:", result);

      message.success(
        isLastStage
          ? "Candidate process completed successfully"
          : "Candidate moved to next stage successfully"
      );

      // Reset and refresh
      setIsMoveModalVisible(false);
      setSelectedCandidate(null);
      setReviewerComments("");
      setSelectedNextStage(null);
      setAvailableNextStages([]);
      form.resetFields();

      console.log("Step 16: Refetching data...");
      await refetch();
      console.log("Step 16: Refetch complete");

      console.log("=== CONFIRM MOVE CANDIDATE COMPLETED SUCCESSFULLY ===");
    } catch (error) {
      console.error("=== ERROR IN CONFIRM MOVE CANDIDATE ===");
      console.error("Error object:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", Object.keys(error));

      // Handle form validation errors
      if (error.errorFields) {
        console.error("Form validation errors:", error.errorFields);
        return;
      }

      // Extract error message
      let errorMessage = "Failed to move candidate to next stage";

      if (error?.data) {
        console.error("Error data:", error.data);
        if (error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (error?.message) {
        console.error("Error message:", error.message);
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      console.error("Final error message:", errorMessage);
      message.error(errorMessage);
      console.error("=== END ERROR ===");
    }
  };

  const handleViewDocument = (fileUrl, fileName) => {
    window.open(fileUrl, "_blank");
  };

  const handleNotify = () => {
    setIsNotifyModalVisible(true);
  };

  const handleUpdateStageDates = async () => {
    try {
      if (!activeStage) {
        message.error("No active stage selected");
        return;
      }

      const payload = {
        id,
        stageId: activeStage,
        startDate: tempStartDate,
        endDate: tempEndDate,
      };

      await updateStageDates(payload).unwrap();

      message.success("Stage dates updated successfully");
      setIsDateConfirmModalVisible(false);
      setIsEditingDates(false);
      setTempStartDate(null);
      setTempEndDate(null);
      refetch();
    } catch (error) {
      console.error("Error updating stage dates:", error);
      message.error(error?.data?.message || "Failed to update stage dates");
    }
  };

  const handleUpdateStageRecruiters = async () => {
    try {
      if (!activeStage) {
        message.error("No active stage selected");
        return;
      }

      if (tempRecruiters.length === 0) {
        message.warning("Please select at least one recruiter");
        return;
      }

      const payload = {
        stageId: activeStage,
        recruiterIds: tempRecruiters,
      };

      console.log("Updating stage recruiters:", {
        id,
        stageId: activeStage,
        recruiterIds: tempRecruiters,
      });

      await updateStageRecruiters({
        id, // This goes in the URL params
        ...payload, // This goes in the request body
      }).unwrap();

      message.success("Recruiters updated successfully");
      setIsRecruiterConfirmModalVisible(false);
      setIsEditingRecruiters(false);
      setTempRecruiters([]);
      refetch();
    } catch (error) {
      console.error("Error updating stage recruiters:", error);
      message.error(error?.data?.message || "Failed to update recruiters");
    }
  };

  const handleSendNotification = async (methods, remarks) => {
    const workOrderId = apiData?.data?.workOrder?._id;
    const userId = apiData?.data?.user?._id;
    const candidateEmail = apiData?.data?.user?.email;
    const candidateName = apiData?.data?.user?.fullName;

    if (!workOrderId || !userId) {
      message.warning("Missing work order or user ID");
      return;
    }

    if (methods.length === 0) {
      message.warning("Please select at least one notification method.");
      return;
    }

    try {
      const notificationData = {
        workOrderId,
        userId,
        email: candidateEmail,
        title: "Pipeline Stage Update - Action Required",
      };

      // Send notifications for each selected method
      for (const method of methods) {
        const dataWithMethod = { ...notificationData, method };

        switch (method) {
          case "email":
            // await sendEmailNotification(dataWithMethod).unwrap();
            enqueueSnackbar(`Email notification sent to ${candidateName}`, {
              variant: "success",
              autoHideDuration: 3000,
            });
            break;
          case "whatsapp":
            // await sendWhatsAppNotification(dataWithMethod).unwrap();
            enqueueSnackbar(`WhatsApp notification sent to ${candidateName}`, {
              variant: "success",
              autoHideDuration: 3000,
            });
            break;
          case "profile":
            await remainder(dataWithMethod);
            enqueueSnackbar(`Profile notification sent to ${candidateName}`, {
              variant: "success",
              autoHideDuration: 3000,
            });
            break;
          default:
            break;
        }
      }

      setIsNotifyModalVisible(false);
    } catch (error) {
      console.error("Error sending notification:", error);
      enqueueSnackbar("Error sending notification", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const renderDocuments = (candidate, stageId) => {
    if (!processedJobData) return null;

    const stageProgress = candidate.stageProgress.find(
      (sp) => sp.stageId === stageId
    );

    const uploadedDocs = stageProgress?.uploadedDocuments || [];

    // Get required documents from fullStage in stageProgress
    const requiredDocuments = stageProgress?.fullStage?.requiredDocuments || [];

    return (
      <div style={{ marginTop: "16px" }}>
        {/* SHOW REQUIRED DOCUMENTS FIRST - PROMINENT DISPLAY */}
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Title level={5} style={{ marginBottom: "12px", color: "#1890ff" }}>
            <FileOutlined style={{ marginRight: "8px" }} />
            Required Documents for this Stage
          </Title>
          {requiredDocuments.length > 0 ? (
            <div>
              {requiredDocuments.map((doc, index) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{
                    margin: "4px",
                    fontSize: "14px",
                    padding: "4px 12px",
                  }}
                >
                  {doc}
                </Tag>
              ))}
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {uploadedDocs.length > 0
                    ? `✅ ${uploadedDocs.length} document(s) uploaded`
                    : "⚠️ No documents uploaded yet"}
                </Text>
              </div>
            </div>
          ) : (
            <Text type="secondary">No documents required for this stage</Text>
          )}
        </div>

        {/* THEN SHOW UPLOADED DOCUMENTS */}
        <Title level={5} style={{ marginBottom: "12px" }}>
          <FileOutlined style={{ marginRight: "8px" }} />
          Uploaded Documents ({uploadedDocs.length})
        </Title>

        {uploadedDocs.length === 0 ? (
          <Empty
            description="No documents uploaded yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: "20px 0" }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {uploadedDocs.map((doc, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={doc._id || index}>
                <Card
                  size="small"
                  hoverable
                  style={{ borderRadius: "8px", border: "1px solid #f0f0f0" }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        handleViewDocument(doc.fileUrl, doc.fileName)
                      }
                      style={{ color: primaryColor }}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <FileOutlined
                        style={{ fontSize: "24px", color: primaryColor }}
                      />
                    }
                    title={
                      <Tooltip title={doc.fileName}>
                        <Text style={{ fontSize: "12px" }} ellipsis>
                          {doc.fileName}
                        </Text>
                      </Tooltip>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: "11px" }}>
                        Uploaded: {formatDate(doc.uploadedAt)}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };

  const renderApprovalSection = (candidate, stageId = null) => {
    const targetStageId = stageId || candidate.currentStageId;

    const currentStageProgress = candidate.stageProgress.find(
      (progress) => progress.stageId === targetStageId
    );

    if (!currentStageProgress) return null;

    const hasApprovalLevels =
      currentStageProgress?.approvalDetails?.levels?.length > 0;

    const isStageApproved = hasApprovalLevels
      ? currentStageProgress.approval.isApproved === true
      : true;

    const currentStageRecruiterId = getReviewerIdForStage(targetStageId);
    const reviewerComments = currentStageProgress?.recruiterReviews || [];
    const hasAnyRecruiterApproved = reviewerComments.some(
      (review) => review.status === "approved"
    );

    const stages = processedJobData.workOrder.pipelineStageTimeline;
    const currentIndex = stages.findIndex(
      (stage) => stage.stageId === targetStageId
    );
    const isLastStage = currentIndex === stages.length - 1;
    const isCurrentStage = candidate.currentStageId === targetStageId;

    const checkApprovalCompleted = () => {
      // Check if stage has approval object
      const approval = currentStageProgress?.approval;
      const approvalLevels = currentStageProgress?.approvalDetails?.levels;
      // If no approval object, no approval is needed - return true
      if (!approvalLevels || approvalLevels.length === 0) return true;

      // Approval required → must be explicitly approved
      if (approval && approval.isApproved === true) return true;

      return false;
    };

    const checkDocumentsUploaded = () => {
      // Get required documents from fullStage in stageProgress
      const requiredDocuments =
        currentStageProgress?.fullStage?.requiredDocuments || [];

      // If no required documents, return true
      if (requiredDocuments.length === 0) {
        return true;
      }

      // Check if documents are uploaded
      const uploadedDocuments = currentStageProgress?.uploadedDocuments || [];
      return uploadedDocuments.length > 0;
    };

    const areDocumentsUploaded = checkDocumentsUploaded();

    const shouldHideButton = hasAnyRecruiterApproved || !isCurrentStage;

    const canMoveCandidate = (() => {
      // 1. Don't allow if already approved by a recruiter
      if (hasAnyRecruiterApproved) {
        return false;
      }

      // 2. Don't allow if this is not the current stage
      if (!isCurrentStage) {
        return false;
      }

      // 3. Check approval status (from approval.isApproved)
      const approvalCompleted = checkApprovalCompleted();

      // 4. Check if required documents are uploaded
      const documentsUploaded = areDocumentsUploaded;

      // Both conditions must be met
      return approvalCompleted && documentsUploaded;
    })();

    const renderApprovalDetails = (approvalDetails) => {
      if (!approvalDetails || !approvalDetails.levels) return null;

      return (
        <div style={{ marginTop: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            <CheckCircleOutlined
              style={{ marginRight: "8px", color: "#52c41a" }}
            />
            Approval Workflow
          </Title>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "8px",
              scrollbarWidth: "thin",
              scrollbarColor: "#d9d9d9 #f0f0f0",
            }}
          >
            <Collapse
              ghost
              defaultActiveKey={approvalDetails.levels.map(
                (level, index) => index
              )}
            >
              {approvalDetails.levels.map((level, index) => (
                <Panel
                  header={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: screens.xs ? "column" : "row",
                        alignItems: screens.xs ? "flex-start" : "center",
                        gap: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{ fontSize: screens.xs ? "13px" : "14px" }}
                      >
                        Level {level.levelOrder}: {level.levelName}
                      </Text>
                      <Tag
                        color={
                          level.assignedRecruiters.every(
                            (r) => r.status === "approved"
                          )
                            ? "success"
                            : "processing"
                        }
                      >
                        {level.assignedRecruiters.every(
                          (r) => r.status === "approved"
                        )
                          ? "Approved"
                          : `${
                              level.assignedRecruiters.filter(
                                (r) => r.status === "approved"
                              ).length
                            }/${level.assignedRecruiters.length} Approved`}
                      </Tag>
                    </div>
                  }
                  key={index}
                >
                  <div style={{ padding: "8px 0" }}>
                    {level.assignedRecruiters.map((recruiter, idx) => (
                      <Card
                        key={idx}
                        size="small"
                        style={{
                          marginBottom: "8px",
                          borderLeft: `4px solid ${
                            recruiter.status === "approved"
                              ? "#52c41a"
                              : "#faad14"
                          }`,
                          backgroundColor:
                            recruiter.status === "approved"
                              ? "#f6ffed"
                              : "#fff7e6",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: screens.xs ? "column" : "row",
                            justifyContent: "space-between",
                            alignItems: screens.xs
                              ? "flex-start"
                              : "flex-start",
                            gap: screens.xs ? "8px" : "0",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <Text
                              strong
                              style={{ fontSize: screens.xs ? "13px" : "14px" }}
                            >
                              <UserOutlined style={{ marginRight: "8px" }} />
                              {recruiter.recruiterInfo?.fullName ||
                                "Unknown Recruiter"}
                            </Text>
                            <br />
                            <Text
                              type="secondary"
                              style={{ fontSize: screens.xs ? "13px" : "14px" }}
                            >
                              {recruiter.recruiterInfo?.email}
                            </Text>
                            {recruiter.comments && (
                              <>
                                <br />
                                <Text
                                  style={{
                                    fontSize: screens.xs ? "11px" : "12px",
                                    marginTop: "4px",
                                    display: "block",
                                  }}
                                >
                                  <CommentOutlined
                                    style={{ marginRight: "4px" }}
                                  />
                                  {recruiter.comments}
                                </Text>
                              </>
                            )}
                          </div>
                          <div
                            style={{
                              minWidth: screens.xs ? "100%" : "auto",
                              textAlign: screens.xs ? "left" : "right",
                            }}
                          >
                            <Tag
                              color={
                                recruiter.status === "approved"
                                  ? "success"
                                  : "warning"
                              }
                              icon={
                                recruiter.status === "approved" ? (
                                  <CheckCircleOutlined />
                                ) : (
                                  <ClockCircleOutlined />
                                )
                              }
                              style={{
                                fontSize: screens.xs ? "11px" : "12px",
                                padding: screens.xs ? "2px 8px" : "4px 12px",
                              }}
                            >
                              {recruiter.status === "approved"
                                ? "Approved"
                                : "Pending"}
                            </Tag>
                            {recruiter.reviewedAt &&
                              recruiter.status === "approved" && (
                                <div style={{ marginTop: "4px" }}>
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: screens.xs ? "10px" : "11px",
                                    }}
                                  >
                                    {formatIST(recruiter.reviewedAt)}
                                  </Text>
                                </div>
                              )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      );
    };

    const getStageStatusTag = () => {
      if (!hasApprovalLevels) {
        return null; // No approval tag needed for non-approval stages
      }

      if (isStageApproved) {
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Stage Approved
          </Tag>
        );
      } else {
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Stage Pending Approval
          </Tag>
        );
      }
    };

    const getReviewStatusTag = () => {
      if (hasAnyRecruiterApproved) {
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {isCurrentStage ? "Ready for Next Stage" : "Completed"}
          </Tag>
        );
      }

      if (isCurrentStage) {
        if (hasApprovalLevels) {
          // Stage with approval levels
          if (!isStageApproved) {
            return (
              <Tag icon={<ClockCircleOutlined />} color="warning">
                Awaiting Stage Approval
              </Tag>
            );
          } else if (!areDocumentsUploaded) {
            return (
              <Tag icon={<ClockCircleOutlined />} color="orange">
                Awaiting Document Upload
              </Tag>
            );
          } else {
            return (
              <Tag icon={<ClockCircleOutlined />} color="blue">
                Ready - Awaiting Recruiter Action
              </Tag>
            );
          }
        } else {
          // Stage without approval levels
          if (!areDocumentsUploaded) {
            return (
              <Tag icon={<ClockCircleOutlined />} color="orange">
                Awaiting Document Upload
              </Tag>
            );
          } else {
            return (
              <Tag icon={<ClockCircleOutlined />} color="blue">
                Ready - Awaiting Recruiter Action
              </Tag>
            );
          }
        }
      }

      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          Not Current Stage
        </Tag>
      );
    };

    const getStatusMessage = () => {
      if (!isCurrentStage && currentStageProgress.stageStatus === "approved") {
        return "✅ This stage has been completed.";
      }

      if (!isCurrentStage) {
        return "ℹ️ This stage is not currently active for this candidate.";
      }

      if (hasAnyRecruiterApproved) {
        return "✅ A recruiter has already reviewed and approved this candidate. They are ready for the next stage.";
      }

      // Get approval status
      const approvalCompleted = checkApprovalCompleted();
      const documentsUploaded = areDocumentsUploaded;
      const hasRequiredDocs =
        (currentStageProgress?.fullStage?.requiredDocuments || []).length > 0;
      const hasApproval = currentStageProgress?.approval?.approvalId
        ? true
        : false;

      // Build message based on conditions
      if (hasApproval && hasRequiredDocs) {
        if (!approvalCompleted && !documentsUploaded) {
          return "⚠️ This stage requires approval AND document upload. Both are pending.";
        } else if (!approvalCompleted) {
          return "⚠️ Approval is required before moving this candidate to the next stage.";
        } else if (!documentsUploaded) {
          return "⚠️ Required documents must be uploaded before moving this candidate.";
        } else {
          return "✅ Approval completed and documents uploaded. You can move this candidate to the next stage.";
        }
      } else if (hasApproval) {
        if (!approvalCompleted) {
          return "⚠️ Approval is required before moving this candidate to the next stage.";
        } else {
          return "✅ Approval completed. You can move this candidate to the next stage.";
        }
      } else if (hasRequiredDocs) {
        if (!documentsUploaded) {
          return "⚠️ Required documents must be uploaded before moving this candidate.";
        } else {
          return "✅ Documents uploaded. You can move this candidate to the next stage.";
        }
      } else {
        return "✅ No requirements for this stage. You can move this candidate to the next stage.";
      }
    };

    return (
      <div
        style={{
          marginBottom: "20px",
          padding: screens.xs ? "12px" : "16px",
          borderRadius: "8px",
          border: `1px solid ${isCurrentStage ? "#e6f7ff" : "#f0f0f0"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: screens.xs ? "column" : "row",
            justifyContent: "space-between",
            alignItems: screens.xs ? "flex-start" : "center",
            gap: screens.xs ? "12px" : "0",
            paddingBottom: "12px",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: screens.xs ? "13px" : "14px" }}>
              {hasApprovalLevels
                ? "Approval & Document Status:"
                : "Review Status:"}
            </Text>
            <div
              style={{
                marginTop: "4px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {getStageStatusTag() && getStageStatusTag()}
              {getReviewStatusTag()}
            </div>
          </div>

          {!shouldHideButton && (
            <Space
              direction={screens.xs ? "vertical" : "horizontal"}
              style={{ width: screens.xs ? "100%" : "auto" }}
            >
              <Tooltip
                title={
                  !canMoveCandidate
                    ? hasApprovalLevels && !isStageApproved
                      ? "Stage approval required"
                      : !areDocumentsUploaded
                      ? "Documents must be uploaded"
                      : "Requirements not met"
                    : ""
                }
              >
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  disabled={!canMoveCandidate}
                  onClick={(e) => handleMoveCandidate(candidate, e)}
                  loading={isMoving}
                  style={{
                    backgroundColor: canMoveCandidate
                      ? primaryColor
                      : "#d9d9d9",
                    borderColor: canMoveCandidate ? primaryColor : "#d9d9d9",
                    width: screens.xs ? "100%" : "auto",
                  }}
                  block={screens.xs}
                >
                  {isLastStage ? "Finish Process" : "Move to Next Stage"}
                </Button>
              </Tooltip>
            </Space>
          )}
        </div>

        <div>
          <Text
            type={canMoveCandidate ? "success" : "secondary"}
            style={{ fontSize: screens.xs ? "12px" : "13px" }}
          >
            {getStatusMessage()}
          </Text>

          {hasApprovalLevels && (
            <div style={{ marginTop: "16px" }}>
              {renderApprovalDetails(currentStageProgress.approvalDetails)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCustomFields = (candidate) => {
    if (
      !processedJobData ||
      !processedJobData.pipeline ||
      !processedJobData.pipeline.stages
    ) {
      return null;
    }

    const currentStage = processedJobData.pipeline.stages.find(
      (stage) => stage._id === candidate.currentStage
    );

    const stageTimeline =
      processedJobData.workOrder?.pipelineStageTimeline?.find(
        (timeline) => timeline.stageId === candidate.currentStage
      );

    if (
      !stageTimeline?.customFields ||
      stageTimeline.customFields.length === 0
    ) {
      return null;
    }

    return (
      <div style={{ marginTop: "16px" }}>
        <Title level={5} style={{ marginBottom: "12px" }}>
          Custom Fields
        </Title>

        {stageTimeline.customFields.map((field, index) => (
          <div key={index} style={{ marginBottom: "12px" }}>
            <Text strong>{field.label}:</Text>
            {field.type === "select" ? (
              <Select
                style={{ width: "100%", marginTop: "8px" }}
                placeholder={`Select ${field.label}`}
                options={field.options.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            ) : (
              <Input
                style={{ width: "100%", marginTop: "8px" }}
                placeholder={`Enter ${field.label}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPipelineTabs = () => {
    if (!processedJobData) return null;

    const currentCandidate = processedJobData.candidates[0];
    const isTaggedPipeline = !!currentCandidate.tagPipelineId;

    let stagesToShow = [];

    if (isTaggedPipeline) {
      // For tagged pipelines, collect ALL stages from ALL sources
      const allStagesMap = new Map(); // Use Map to avoid duplicates by stageId

      // 1. Get stages from stageProgress[0].pipelineId.stages (if exists)
      if (currentCandidate?.stageProgress?.[0]?.pipelineId?.stages) {
        currentCandidate.stageProgress[0].pipelineId.stages.forEach((stage) => {
          if (stage._id) {
            allStagesMap.set(stage._id, {
              stageId: stage._id,
              stageName: stage.name || "Unknown Stage",
              source: "pipelineStages",
            });
          }
        });
      }

      // 2. Get stages from fullPipeline.stages (if exists)
      if (processedJobData.pipeline?.stages) {
        processedJobData.pipeline.stages.forEach((stage) => {
          if (stage._id && !allStagesMap.has(stage._id)) {
            allStagesMap.set(stage._id, {
              stageId: stage._id,
              stageName: stage.name || stage.stageName || "Unknown Stage",
              source: "fullPipeline",
            });
          }
        });
      }

      // 3. Get stages from stageProgress items (each stageProgress entry)
      const stageProgressStages = currentCandidate.stageProgress || [];
      stageProgressStages.forEach((progress, index) => {
        if (progress.stageId && !allStagesMap.has(progress.stageId)) {
          allStagesMap.set(progress.stageId, {
            stageId: progress.stageId,
            stageName:
              progress.stageName || progress.fullStage?.name || "Unknown Stage",
            source: "stageProgressItem",
            order: index, // Store original order for sorting
          });
        }
      });

      // 4. Get stages from workOrder.pipelineStageTimeline (if exists)
      if (processedJobData.workOrder?.pipelineStageTimeline) {
        processedJobData.workOrder.pipelineStageTimeline.forEach(
          (stage, index) => {
            if (stage.stageId && !allStagesMap.has(stage.stageId)) {
              allStagesMap.set(stage.stageId, {
                stageId: stage.stageId,
                stageName: stage.stageName || "Unknown Stage",
                source: "workOrder",
                order: index,
              });
            }
          }
        );
      }

      // 5. Get stages from pendingPipelineStages (if exists)
      if (currentCandidate.pendingPipelineStages) {
        currentCandidate.pendingPipelineStages.forEach((stage, index) => {
          if (stage.stageId && !allStagesMap.has(stage.stageId)) {
            allStagesMap.set(stage.stageId, {
              stageId: stage.stageId,
              stageName: stage.stageName || "Unknown Stage",
              source: "pendingStages",
              order: index,
            });
          }
        });
      }

      // Convert Map to array
      let allStagesArray = Array.from(allStagesMap.values());

      // Sort stages intelligently
      stagesToShow = allStagesArray.sort((a, b) => {
        // First, try to sort by stageProgress order (most reliable)
        const progressIndexA = stageProgressStages.findIndex(
          (sp) => sp.stageId === a.stageId
        );
        const progressIndexB = stageProgressStages.findIndex(
          (sp) => sp.stageId === b.stageId
        );

        if (progressIndexA !== -1 && progressIndexB !== -1) {
          return progressIndexA - progressIndexB;
        }
        if (progressIndexA !== -1) return -1;
        if (progressIndexB !== -1) return 1;

        // Then try to maintain order from workOrder.pipelineStageTimeline
        const woIndexA =
          processedJobData.workOrder?.pipelineStageTimeline?.findIndex(
            (s) => s.stageId === a.stageId
          );
        const woIndexB =
          processedJobData.workOrder?.pipelineStageTimeline?.findIndex(
            (s) => s.stageId === b.stageId
          );

        if (woIndexA !== -1 && woIndexB !== -1) {
          return woIndexA - woIndexB;
        }
        if (woIndexA !== -1) return -1;
        if (woIndexB !== -1) return 1;

        // Finally, use the order stored from original arrays
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }

        // Fallback: sort by stageId
        return a.stageId.localeCompare(b.stageId);
      });

      // Remove temporary properties
      stagesToShow = stagesToShow.map(({ source, order, ...stage }) => stage);
    } else {
      // For non-tagged pipelines (work order stages)
      stagesToShow =
        processedJobData.workOrder?.pipelineStageTimeline?.map((stage) => ({
          stageId: stage.stageId,
          stageName: stage.stageName,
        })) || [];
    }

    return (
      <Tabs
        activeKey={activeStage}
        onChange={setActiveStage}
        tabPosition="top"
        type={screens.xs ? "line" : "card"}
        style={{
          minWidth: screens.xs ? "100%" : "max-content",
          width: screens.xs ? "100%" : "auto",
        }}
      >
        {stagesToShow.map((stage) => {
          const stageId = stage.stageId;
          const stageName = stage.stageName;

          const isCurrentStage =
            currentCandidate.currentStage === stageId ||
            currentCandidate.currentStageId === stageId ||
            currentCandidate.stageProgress?.some(
              (sp) => sp.stageId === stageId
            ) ||
            currentCandidate.pendingPipelineStages?.some(
              (pps) => pps.stageId === stageId
            );

          return (
            <TabPane
              key={stageId}
              tab={
                <Badge
                  count={getCandidatesInStage(stageId).length}
                  offset={[8, -3]}
                  style={{
                    backgroundColor: isCurrentStage ? primaryColor : "#d9d9d9",
                  }}
                >
                  <span
                    style={{
                      padding: screens.xs ? "0 4px" : "0 8px",
                      fontSize: screens.xs ? "12px" : "14px",
                      fontWeight: isCurrentStage ? "bold" : "normal",
                      color: isCurrentStage ? primaryColor : undefined,
                    }}
                  >
                    {stageName}
                  </span>
                </Badge>
              }
            />
          );
        })}
      </Tabs>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" tip="Loading job pipeline..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Card>
          <Empty
            description={
              <div>
                <Text type="danger">Failed to load job pipeline</Text>
                <br />
                <Text type="secondary">Please try refreshing the page</Text>
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              style={{ background: primaryColor, border: "none" }}
            >
              Refresh Page
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  if (!processedJobData) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Empty description={<Text>No job data found</Text>} />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: screens.xs ? "8px" : "16px",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate("/recruiter/staged-candidates")}
          style={{ color: primaryColor }}
        >
          Back to Jobs
        </Button>
      </div>
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: screens.xs ? "column" : "row",
              justifyContent: "space-between",
              alignItems: screens.xs ? "flex-start" : "flex-start",
              gap: screens.xs ? "8px" : "0",
            }}
          >
            <div>
              <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
                {processedJobData.title}
              </Title>
              <Text strong style={{ display: "block", marginTop: "4px" }}>
                {processedJobData.company} • {processedJobData.location}
              </Text>
              {processedJobData.jobCode && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: "2px" }}
                >
                  Code: {processedJobData.jobCode}
                </Text>
              )}
              {processedJobData.description && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginTop: "4px",
                    fontSize: screens.xs ? "12px" : "14px",
                  }}
                >
                  {processedJobData.description}
                </Text>
              )}
            </div>
            <Tag
              color={processedJobData.isActive ? "green" : "red"}
              style={{ marginTop: screens.xs ? "8px" : "0" }}
            >
              {processedJobData.isActive ? "Active" : "Inactive"}
            </Tag>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {processedJobData.startDate && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: screens.xs ? "12px" : "14px",
                }}
              >
                <CalendarOutlined /> Start:{" "}
                {new Date(processedJobData.startDate).toLocaleDateString()}
              </Text>
            )}
            {processedJobData.endDate && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: screens.xs ? "12px" : "14px",
                }}
              >
                <CalendarOutlined /> End:{" "}
                {new Date(processedJobData.endDate).toLocaleDateString()}
              </Text>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Pipeline:</Text>
            <Tag color="blue">
              {" "}
              {apiData?.data?.pipelineName || processedJobData.pipeline.name}
            </Tag>
          </div>
        </div>
      </Card>
      <div
        style={{
          overflowX: "auto",
          marginBottom: "16px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {renderPipelineTabs()}
      </div>
      {activeStage && (
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Title level={4} style={{ marginBottom: "16px" }}>
              {getStageName(activeStage)} Candidates (
              {getCandidatesInStage(activeStage).length})
            </Title>

            {/* <div>{getStageDates(activeStage)}</div> */}

            {hasPermission("notify-candidate") && (
              <Button
                type="primary"
                style={{ background: "#da2c46" }}
                onClick={() => handleNotify()}
              >
                Notify
              </Button>
            )}
          </div>
          {getCandidatesInStage(activeStage).length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={getCandidatesInStage(activeStage)}
              renderItem={(candidate) => (
                <List.Item
                  style={{
                    padding: screens.xs ? "12px" : "20px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>{renderApprovalSection(candidate, activeStage)}</div>
                  <Divider />
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={candidate.avatar}
                        icon={<UserOutlined />}
                        size={screens.xs ? "default" : "large"}
                      />
                    }
                    title={
                      <div style={{ width: "100%" }}>
                        <div style={{ marginBottom: "16px" }}>
                          <Text
                            strong
                            style={{
                              fontSize: screens.xs ? "16px" : "18px",
                              lineHeight: screens.xs ? "1.2" : "1.5",
                            }}
                          >
                            {candidate.name}
                          </Text>

                          <div
                            style={{
                              marginTop: "4px",
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            {candidate.isSourced && (
                              <Tag color="orange">Sourced</Tag>
                            )}
                            <Tag
                              color={
                                candidate.stageStatus === "approved"
                                  ? "green"
                                  : candidate.stageStatus === "rejected"
                                  ? "red"
                                  : "blue"
                              }
                            >
                              {candidate.stageStatus}
                            </Tag>
                          </div>

                          <Space
                            direction="vertical"
                            size={2}
                            style={{ marginTop: "6px" }}
                          >
                            <Text type="secondary">
                              {candidate.email} • {candidate.phone}
                            </Text>
                            <Text type="secondary">
                              Applied: {formatDate(candidate.appliedDate)}
                            </Text>
                          </Space>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            marginTop: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <Text strong style={{ fontSize: "16px" }}>
                              Stage Timeline
                            </Text>
                            {!isEditingDates ? (
                              <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                  const { startDate, endDate } =
                                    getStageDates(activeStage);
                                  setTempStartDate(startDate);
                                  setTempEndDate(endDate);
                                  setIsEditingDates(true);
                                }}
                                style={{ padding: 0 }}
                              >
                                Edit
                              </Button>
                            ) : (
                              <Space>
                                <Button
                                  size="small"
                                  onClick={() => {
                                    setIsEditingDates(false);
                                    setTempStartDate(null);
                                    setTempEndDate(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={() =>
                                    setIsDateConfirmModalVisible(true)
                                  }
                                  disabled={!tempStartDate && !tempEndDate}
                                  style={{
                                    background: primaryColor,
                                    borderColor: primaryColor,
                                  }}
                                >
                                  Save
                                </Button>
                              </Space>
                            )}
                          </div>
                          {(() => {
                            const { startDate, endDate } =
                              getStageDates(activeStage);
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "12px",
                                  marginTop: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <CalendarOutlined />
                                  <Text strong style={{ fontSize: "13px" }}>
                                    Start:
                                  </Text>
                                  {isEditingDates ? (
                                    <DatePicker
                                      value={
                                        tempStartDate
                                          ? dayjs(tempStartDate)
                                          : null
                                      }
                                      onChange={(date) =>
                                        setTempStartDate(
                                          date
                                            ? date.format(
                                                "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                                              )
                                            : null
                                        )
                                      }
                                      format="YYYY-MM-DD"
                                      style={{ width: "150px" }}
                                      placeholder="Select start date"
                                    />
                                  ) : (
                                    <Text type="secondary">
                                      {startDate
                                        ? dayjs(startDate).format(
                                            "MMM DD, YYYY"
                                          )
                                        : "No date set"}
                                    </Text>
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <CalendarOutlined />
                                  <Text strong style={{ fontSize: "13px" }}>
                                    End:
                                  </Text>
                                  {isEditingDates ? (
                                    <DatePicker
                                      value={
                                        tempEndDate ? dayjs(tempEndDate) : null
                                      }
                                      onChange={(date) =>
                                        setTempEndDate(
                                          date
                                            ? date.format(
                                                "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
                                              )
                                            : null
                                        )
                                      }
                                      format="YYYY-MM-DD"
                                      style={{ width: "150px" }}
                                      placeholder="Select end date"
                                      disabledDate={(current) => {
                                        // Disable dates before start date if start date is selected
                                        if (tempStartDate) {
                                          return (
                                            current &&
                                            current <
                                              dayjs(tempStartDate).startOf(
                                                "day"
                                              )
                                          );
                                        }
                                        return false;
                                      }}
                                    />
                                  ) : (
                                    <Text type="secondary">
                                      {endDate
                                        ? dayjs(endDate).format("MMM DD, YYYY")
                                        : "No date set"}
                                    </Text>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* RECRUITER DETAILS (BELOW) */}
                        <div
                          style={{
                            width: "100%",
                            background: "#fafafa",
                            padding: "12px",
                            borderRadius: "8px",
                            marginTop: "10px",
                          }}
                        >
                          <Text strong style={{ fontSize: "16px" }}>
                            Recruiter Details
                          </Text>

                          {candidate.stageProgress?.find(
                            (sp) => sp.stageId === activeStage
                          )?.recruiterInfo && (
                            <div style={{ marginTop: "8px" }}>
                              <Text strong>Main Recruiter:</Text>
                              <div style={{ marginTop: "4px" }}>
                                <Text>
                                  <UserOutlined />{" "}
                                  {
                                    candidate.stageProgress.find(
                                      (sp) => sp.stageId === activeStage
                                    ).recruiterInfo.fullName
                                  }
                                </Text>
                                <br />
                                <Text type="secondary">
                                  {
                                    candidate.stageProgress.find(
                                      (sp) => sp.stageId === activeStage
                                    ).recruiterInfo.email
                                  }
                                </Text>
                                <br />
                                <Text type="secondary">
                                  {
                                    candidate.stageProgress.find(
                                      (sp) => sp.stageId === activeStage
                                    ).recruiterInfo.phone
                                  }
                                </Text>
                              </div>
                            </div>
                          )}

                          <div style={{ marginTop: "10px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <Text strong style={{ fontSize: "14px" }}>
                                Reviews:
                              </Text>

                              {!isEditingRecruiters && (
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={handleEditRecruitersClick}
                                  style={{ padding: 0, fontSize: "12px" }}
                                >
                                  Edit Recruiters
                                </Button>
                              )}
                            </div>

                            {isEditingRecruiters ? (
                              <div style={{ marginBottom: "16px" }}>
                                <Select
                                  mode="multiple"
                                  style={{ width: "100%" }}
                                  placeholder="Select recruiters to review"
                                  value={tempRecruiters}
                                  onChange={setTempRecruiters}
                                  options={activeRecruiters.map((rec) => ({
                                    value: rec._id,
                                    label: rec.fullName,
                                  }))}
                                />
                                <Space style={{ marginTop: "8px" }}>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setIsEditingRecruiters(false);
                                      setTempRecruiters([]);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={() =>
                                      setIsRecruiterConfirmModalVisible(true)
                                    }
                                    disabled={tempRecruiters.length === 0}
                                    style={{
                                      background: primaryColor,
                                      borderColor: primaryColor,
                                    }}
                                  >
                                    Save Recruiters
                                  </Button>
                                </Space>
                              </div>
                            ) : null}

                            {/* Display existing reviews */}
                            {candidate.stageProgress?.find(
                              (sp) => sp.stageId === activeStage
                            )?.recruiterReviews?.length > 0 ? (
                              candidate.stageProgress
                                .find((sp) => sp.stageId === activeStage)
                                .recruiterReviews.map((review) => (
                                  <Card
                                    key={review._id}
                                    size="small"
                                    style={{
                                      marginTop: "8px",
                                      borderRadius: "8px",
                                      background: "#ffffff",
                                    }}
                                  >
                                    <Text strong>
                                      <UserOutlined />{" "}
                                      {review.recruiterInfo?.fullName}
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                      {review.recruiterInfo?.email}
                                    </Text>
                                    <br />
                                    <Text
                                      style={{
                                        fontSize: "12px",
                                        marginTop: "4px",
                                      }}
                                    >
                                      {review.reviewComments}
                                    </Text>
                                    <br />
                                    <Tag
                                      color={
                                        review.status === "approved"
                                          ? "green"
                                          : "orange"
                                      }
                                      style={{ marginTop: "4px" }}
                                    >
                                      {review.status} &nbsp;{" "}
                                      {formatIST(review.reviewedAt)}
                                    </Tag>
                                  </Card>
                                ))
                            ) : (
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                No reviews yet
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                  />

                  <Divider />

                  {/* Candidate Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      <Text strong>Skills:</Text>
                      <div style={{ marginTop: "8px" }}>
                        {candidate.skills.map((skill, index) => (
                          <Tag key={index}>{skill}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {renderCustomFields(candidate)}

                  {renderDocuments(candidate, activeStage)}
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="No candidates in this stage"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ margin: "40px 0" }}
            />
          )}
        </Card>
      )}
      <Modal
        title={
          !getNextStageId(selectedCandidate?.currentStage)
            ? "Finish Candidate Process"
            : "Move Candidate to Next Stage"
        }
        visible={isMoveModalVisible}
        onOk={confirmMoveCandidate}
        onCancel={() => {
          setIsMoveModalVisible(false);
          form.resetFields();
          setSelectedNextStage(null);
          setAvailableNextStages([]);
        }}
        okText={
          !getNextStageId(selectedCandidate?.currentStage)
            ? "Confirm Finish"
            : "Confirm Move"
        }
        cancelText="Cancel"
        confirmLoading={isMoving}
        okButtonProps={{
          style: { backgroundColor: primaryColor, borderColor: primaryColor },
        }}
      >
        {selectedCandidate && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ reviewerComments }}
          >
            <Form.Item label="Candidate">
              <Input value={selectedCandidate.name} disabled />
            </Form.Item>
            <Form.Item label="Current Stage">
              <Input
                value={getStageName(selectedCandidate.currentStage)}
                disabled
              />
            </Form.Item>

            {!getNextStageId(selectedCandidate.currentStage) ? (
              <Form.Item label="Action">
                <Input value="Finish Process" disabled />
              </Form.Item>
            ) : (
              <Form.Item label="Next Stage">
                <Input value={getStageName(targetStage)} disabled />
              </Form.Item>
            )}

            {availableNextStages.length > 0 && (
              <Form.Item
                label="Select Next Stage"
                name="nextStageId"
                initialValue={getNextStageId(selectedCandidate.currentStage)}
                rules={[
                  {
                    required: availableNextStages.length > 0, // Only required if there are next stages
                    message: "Please select next stage",
                  },
                ]}
              >
                <Select
                  placeholder="Select stage to move to"
                  onChange={(value) => setSelectedNextStage(value)}
                >
                  {availableNextStages.map((stage) => (
                    <Option key={stage.stageId} value={stage.stageId}>
                      {stage.stageName}
                      {stage.stageOrder !== undefined &&
                        ` (Order: ${stage.stageOrder})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              label={
                !getNextStageId(selectedCandidate.currentStage)
                  ? "Completion Comments"
                  : "Move Comments"
              }
              name="reviewerComments"
              rules={[
                {
                  required: true,
                  message: !getNextStageId(selectedCandidate.currentStage)
                    ? "Please enter completion comments"
                    : "Please enter comments for the move",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={
                  !getNextStageId(selectedCandidate.currentStage)
                    ? "Enter any final comments about this candidate"
                    : "Enter any comments for the next stage reviewer"
                }
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <NotificationModal
        open={isNotifyModalVisible}
        onClose={() => setIsNotifyModalVisible(false)}
        onSend={handleSendNotification}
        title={`Notify ${apiData?.data?.user?.fullName || "Candidate"}`}
        candidateName={apiData?.data?.user?.fullName}
      />

      <Modal
        title="Confirm Date Update"
        visible={isDateConfirmModalVisible}
        onOk={handleUpdateStageDates}
        onCancel={() => setIsDateConfirmModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: primaryColor, borderColor: primaryColor },
          loading: isUpdatingDates,
        }}
      >
        <p>Are you sure you want to update the stage dates?</p>
        <div style={{ marginTop: "16px" }}>
          <Text strong>Start Date: </Text>
          <Text>
            {tempStartDate
              ? dayjs(tempStartDate).format("MMM DD, YYYY")
              : "No date set"}
          </Text>
        </div>
        <div style={{ marginTop: "8px" }}>
          <Text strong>End Date: </Text>
          <Text>
            {tempEndDate
              ? dayjs(tempEndDate).format("MMM DD, YYYY")
              : "No date set"}
          </Text>
        </div>
      </Modal>

      <Modal
        title="Confirm Recruiter Update"
        visible={isRecruiterConfirmModalVisible}
        onOk={handleUpdateStageRecruiters}
        onCancel={() => {
          setIsRecruiterConfirmModalVisible(false);
          setIsEditingRecruiters(false);
          setTempRecruiters([]);
        }}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: primaryColor, borderColor: primaryColor },
          loading: isUpdatingRecruiters,
        }}
      >
        <p>Are you sure you want to update the recruiters for this stage?</p>

        <div style={{ marginTop: "16px" }}>
          <Text strong>Stage: </Text>
          <Text>{getStageName(activeStage)}</Text>
        </div>

        <div style={{ marginTop: "12px" }}>
          <Text strong>Selected Recruiters ({tempRecruiters.length}):</Text>
          <div style={{ marginTop: "8px" }}>
            {tempRecruiters.length > 0 ? (
              tempRecruiters.map((recruiterId) => {
                const recruiter = activeRecruiters.find(
                  (r) => r._id === recruiterId
                );
                return (
                  <Tag key={recruiterId} color="blue" style={{ margin: "4px" }}>
                    <UserOutlined />{" "}
                    {recruiter?.fullName || "Unknown Recruiter"}
                  </Tag>
                );
              })
            ) : (
              <Text
                type="secondary"
                style={{ display: "block", marginTop: "4px" }}
              >
                No recruiters selected
              </Text>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterJobPipeline;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPipelineJobsByIdQuery,
  useMoveToNextStageMutation,
  useStagedCandidateNotifyMutation,
  useUpdateStageDatesMutation,
  useUpdateStageRecruitersMutation,
  useAddNewStageDocumentMutation,
  useDeleteStageDocumentMutation,
  useUndoStageMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useGetRecruitersNameQuery } from "../../Slices/Admin/AdminApis";
import {
  Card,
  Typography,
  Tag,
  Space,
  Spin,
  Empty,
  Button,
  message,
} from "antd";
import dayjs from "dayjs";
import { LeftOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import PipelineHeader from "./JobPipelineComponents/PipelineHeader";
import CandidateStageView from "./JobPipelineComponents/CandidateStageView";
import StageModals from "./JobPipelineComponents/StageModals";

const { Title, Text } = Typography;

const RecruiterJobPipeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
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
  const [isDocumentModalVisible, setIsDocumentModalVisible] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [uploadedDocumentFile, setUploadedDocumentFile] = useState(null);

  const [isDeleteDocumentModalVisible, setIsDeleteDocumentModalVisible] =
    useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isUndoModalVisible, setIsUndoModalVisible] = useState(false);
  const [stageToUndo, setStageToUndo] = useState(null);

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
  } = useGetPipelineJobsByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
    pollingInterval: 0, // Add this
    skip: false,
  });
  const [moveToNextStage, { isLoading: isMoving }] =
    useMoveToNextStageMutation();
  const [remainder] = useStagedCandidateNotifyMutation();
  const [updateStageDates, { isLoading: isUpdatingDates }] =
    useUpdateStageDatesMutation();
  const [updateStageRecruiters, { isLoading: isUpdatingRecruiters }] =
    useUpdateStageRecruitersMutation();
  const [addStageDocument, { isLoading: isAddingDocument }] =
    useAddNewStageDocumentMutation();
  const [deleteStageDocument, { isLoading: isDeletingDocument }] =
    useDeleteStageDocumentMutation();
  const [undoStage, { isLoading: isUndoingStage }] = useUndoStageMutation();

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
      console.log("Data refreshed at:", new Date().toISOString());
    }
  }, [apiData, id]);

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

  const refreshData = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleUndoStageClick = (candidateId, stageId) => {
    setStageToUndo(stageId);
    setIsUndoModalVisible(true);
  };

  const handleMoveCandidate = (candidate, e) => {
    e?.stopPropagation();
    setSelectedCandidate(candidate);
    setReviewerComments("");
    setSelectedNextStage(null);
    setIsStageOrderChanged(false);

    const currentStageId = candidate.currentStageId || candidate.currentStage;
    const nextStageId = getNextStageId(currentStageId);
    setTargetStage(nextStageId);
    setSelectedNextStage(nextStageId);

    const nextStages = getAllNextStages(currentStageId);
    setAvailableNextStages(nextStages);
    setIsMoveModalVisible(true);
  };

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

  const handleUndoStage = async () => {
    try {
      if (!stageToUndo) {
        message.error("No stage selected for undo");
        return;
      }

      const payload = {
        id,
        stageId: stageToUndo,
      };

      console.log("Sending payload:", payload);

      await undoStage(payload).unwrap();

      message.success("Stage move undone successfully");
      setIsUndoModalVisible(false);
      setStageToUndo(null);

      await refetch();
      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error undoing stage move:", error);
      message.error(error?.data?.message || "Failed to undo stage move");
    }
  };

  const getNextStageId = (currentStageId) => {
    if (!processedJobData || !currentStageId) return null;

    const currentCandidate = processedJobData.candidates[0];
    const isTagged = !!currentCandidate?.tagPipelineId;

    let allStages = [];

    if (isTagged) {
      const allStagesMap = new Map();

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

      allStages = Array.from(allStagesMap.values())
        .sort((a, b) => a.order - b.order)
        .map((item) => item.stageId);
    } else {
      allStages =
        processedJobData.workOrder?.pipelineStageTimeline?.map(
          (stage) => stage.stageId
        ) || [];
    }

    const currentIndex = allStages.indexOf(currentStageId);
    if (currentIndex >= 0 && currentIndex < allStages.length - 1) {
      return allStages[currentIndex + 1];
    }

    return null;
  };

const getAllNextStages = (currentStageId) => {
  if (!processedJobData || !currentStageId) return [];

  const currentCandidate = processedJobData.candidates[0];
  const isTagged = !!currentCandidate?.tagPipelineId;
  let allStages = [];

  if (isTagged) {
    const allStagesMap = new Map();
    let orderCounter = 0;

    if (currentCandidate?.stageProgress) {
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
            isCompleted: progress.stageStatus === "approved" // Add this flag
          });
        }
      });
    }

    if (processedJobData.pipeline?.stages) {
      processedJobData.pipeline.stages.forEach((stage) => {
        if (stage._id && !allStagesMap.has(stage._id)) {
          allStagesMap.set(stage._id, {
            stageId: stage._id,
            stageName: stage.name || stage.stageName || "Unknown Stage",
            order: orderCounter++,
            source: "fullPipeline",
            isCompleted: false
          });
        }
      });
    }

    if (currentCandidate.pendingPipelineStages) {
      currentCandidate.pendingPipelineStages.forEach((stage) => {
        if (stage.stageId && !allStagesMap.has(stage.stageId)) {
          allStagesMap.set(stage.stageId, {
            stageId: stage.stageId,
            stageName: stage.stageName || "Unknown Stage",
            order: orderCounter++,
            source: "pendingStages",
            isCompleted: false
          });
        }
      });
    }

    if (processedJobData.workOrder?.pipelineStageTimeline) {
      processedJobData.workOrder.pipelineStageTimeline.forEach((stage) => {
        if (stage.stageId && !allStagesMap.has(stage.stageId)) {
          allStagesMap.set(stage.stageId, {
            stageId: stage.stageId,
            stageName: stage.stageName || "Unknown Stage",
            order: orderCounter++,
            source: "workOrder",
            isCompleted: false
          });
        }
      });
    }

    allStages = Array.from(allStagesMap.values());
  } else {
    const stageProgressIds =
      currentCandidate.stageProgress?.map((sp) => sp.stageId) || [];

    const allPipelineStages =
      processedJobData.workOrder?.pipelineStageTimeline || [];

    allStages = allPipelineStages
      .filter((stage) => !stageProgressIds.includes(stage.stageId))
      .map((stage, index) => ({
        stageId: stage.stageId,
        stageName: stage.stageName,
        stageOrder: stage.stageOrder !== undefined ? stage.stageOrder : index,
        order: index,
        isCompleted: false
      }));
  }

  const currentIndex = allStages.findIndex(
    (stage) => stage.stageId === currentStageId
  );

  if (currentIndex >= 0 && currentIndex < allStages.length - 1) {
    // Filter out completed stages from next stages
    const nextStages = allStages
      .slice(currentIndex + 1)
      .filter(stage => !stage.isCompleted); // Only return non-completed stages
    
    return nextStages.map(({ source, order, isCompleted, ...stage }) => stage);
  }

  // If this is the last stage or no incomplete stages remain, return empty array
  return [];
};

  const getReviewerIdForStage = (stageId) => {
    if (!processedJobData) return null;

    const currentCandidate = processedJobData.candidates[0];
    const stageProgress = currentCandidate.stageProgress?.find(
      (progress) => progress.stageId === stageId
    );

    if (stageProgress?.recruiterId) {
      return stageProgress.recruiterId;
    }

    if (!currentCandidate.tagPipelineId) {
      const stageTimeline =
        processedJobData.workOrder?.pipelineStageTimeline?.find(
          (timeline) => timeline.stageId === stageId
        );

      if (
        stageTimeline?.recruiterIds &&
        stageTimeline.recruiterIds.length > 0
      ) {
        return stageTimeline.recruiterIds[0];
      }
    }

    return null;
  };

  const getStageName = (stageId) => {
    if (!processedJobData) return "";

    const currentCandidate = processedJobData.candidates[0];

    if (currentCandidate?.stageProgress?.[0]?.pipelineId?.stages) {
      const stage = currentCandidate.stageProgress[0].pipelineId.stages.find(
        (s) => s._id === stageId
      );
      if (stage?.name) return stage.name;
    }

    const stageProgress = currentCandidate.stageProgress?.find(
      (sp) => sp.stageId === stageId
    );
    if (stageProgress?.stageName) return stageProgress.stageName;
    if (stageProgress?.fullStage?.name) return stageProgress.fullStage.name;

    const pipelineStage = processedJobData.pipeline?.stages?.find(
      (s) => s._id === stageId
    );
    if (pipelineStage?.name) return pipelineStage.name;

    const workOrderStage =
      processedJobData.workOrder?.pipelineStageTimeline?.find(
        (s) => s.stageId === stageId
      );
    if (workOrderStage?.stageName) return workOrderStage.stageName;

    const pendingStage = currentCandidate.pendingPipelineStages?.find(
      (stage) => stage.stageId === stageId
    );
    if (pendingStage?.stageName) return pendingStage.stageName;

    const currentStageProgress = currentCandidate.stageProgress?.find(
      (sp) => sp.currentStage === stageId
    );
    if (currentStageProgress?.stageName) return currentStageProgress.stageName;

    return "Unknown Stage";
  };

  const getStageDates = (stageId) => {
    if (!processedJobData) return { startDate: null, endDate: null };

    const currentCandidate = processedJobData.candidates[0];
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

      for (const method of methods) {
        const dataWithMethod = { ...notificationData, method };

        switch (method) {
          case "email":
            enqueueSnackbar(`Email notification sent to ${candidateName}`, {
              variant: "success",
              autoHideDuration: 3000,
            });
            break;
          case "whatsapp":
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

      <PipelineHeader
        processedJobData={processedJobData}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
        getCandidatesInStage={getCandidatesInStage}
        getStageName={getStageName}
        primaryColor={primaryColor}
        apiData={apiData}
        hasPermission={hasPermission}
        handleNotify={() => setIsNotifyModalVisible(true)}
      />

      <CandidateStageView
        processedJobData={processedJobData}
        activeStage={activeStage}
        getCandidatesInStage={getCandidatesInStage}
        getStageName={getStageName}
        getStageDates={getStageDates}
        getReviewerIdForStage={getReviewerIdForStage}
        primaryColor={primaryColor}
        hasPermission={hasPermission}
        handleMoveCandidate={handleMoveCandidate}
        handleEditRecruitersClick={handleEditRecruitersClick}
        isEditingDates={isEditingDates}
        setIsEditingDates={setIsEditingDates}
        tempStartDate={tempStartDate}
        setTempStartDate={setTempStartDate}
        tempEndDate={tempEndDate}
        setTempEndDate={setTempEndDate}
        setIsDateConfirmModalVisible={setIsDateConfirmModalVisible}
        isEditingRecruiters={isEditingRecruiters}
        setIsEditingRecruiters={setIsEditingRecruiters}
        tempRecruiters={tempRecruiters}
        setTempRecruiters={setTempRecruiters}
        setIsRecruiterConfirmModalVisible={setIsRecruiterConfirmModalVisible}
        activeRecruiters={activeRecruiters}
        isMoving={isMoving}
        setIsDocumentModalVisible={setIsDocumentModalVisible}
        refreshData={refreshData}
        setActiveStage={setActiveStage}
        setIsDeleteDocumentModalVisible={setIsDeleteDocumentModalVisible}
        setDocumentToDelete={setDocumentToDelete}
        handleUndoStageClick={handleUndoStageClick}
        isUndoingStage={isUndoingStage}
      />

      <StageModals
        isMoveModalVisible={isMoveModalVisible}
        setIsMoveModalVisible={setIsMoveModalVisible}
        selectedCandidate={selectedCandidate}
        getStageName={getStageName}
        getNextStageId={getNextStageId}
        availableNextStages={availableNextStages}
        primaryColor={primaryColor}
        isMoving={isMoving}
        moveToNextStage={moveToNextStage}
        refetch={refetch}
        isNotifyModalVisible={isNotifyModalVisible}
        setIsNotifyModalVisible={setIsNotifyModalVisible}
        handleSendNotification={handleSendNotification}
        apiData={apiData}
        isDateConfirmModalVisible={isDateConfirmModalVisible}
        setIsDateConfirmModalVisible={setIsDateConfirmModalVisible}
        updateStageDates={updateStageDates}
        id={id}
        activeStage={activeStage}
        tempStartDate={tempStartDate}
        tempEndDate={tempEndDate}
        isUpdatingDates={isUpdatingDates}
        isRecruiterConfirmModalVisible={isRecruiterConfirmModalVisible}
        setIsRecruiterConfirmModalVisible={setIsRecruiterConfirmModalVisible}
        updateStageRecruiters={updateStageRecruiters}
        tempRecruiters={tempRecruiters}
        setTempRecruiters={setTempRecruiters}
        setIsEditingRecruiters={setIsEditingRecruiters}
        activeRecruiters={activeRecruiters}
        isUpdatingRecruiters={isUpdatingRecruiters}
        isDocumentModalVisible={isDocumentModalVisible}
        setIsDocumentModalVisible={setIsDocumentModalVisible}
        addStageDocument={addStageDocument}
        newDocumentName={newDocumentName}
        setNewDocumentName={setNewDocumentName}
        uploadedDocumentFile={uploadedDocumentFile} 
        setUploadedDocumentFile={setUploadedDocumentFile}
        isAddingDocument={isAddingDocument}
        processedJobData={processedJobData}
        getReviewerIdForStage={getReviewerIdForStage}
        reviewerComments={reviewerComments}
        setReviewerComments={setReviewerComments}
        selectedNextStage={selectedNextStage}
        setSelectedNextStage={setSelectedNextStage}
        targetStage={targetStage}
        refreshData={refreshData}
        setActiveStage={setActiveStage}
        setSelectedCandidate={setSelectedCandidate}
        setAvailableNextStages={setAvailableNextStages}
        setTempStartDate={setTempStartDate}
        setTempEndDate={setTempEndDate}
        setIsEditingDates={setIsEditingDates}
        isDeleteDocumentModalVisible={isDeleteDocumentModalVisible}
        setIsDeleteDocumentModalVisible={setIsDeleteDocumentModalVisible}
        documentToDelete={documentToDelete}
        setDocumentToDelete={setDocumentToDelete}
        deleteStageDocument={deleteStageDocument}
        isDeletingDocument={isDeletingDocument}
        isUndoModalVisible={isUndoModalVisible}
        setIsUndoModalVisible={setIsUndoModalVisible}
        stageToUndo={stageToUndo}
        setStageToUndo={setStageToUndo}
        undoStage={undoStage}
        isUndoingStage={isUndoingStage}
        handleUndoStage={handleUndoStage}
      />
    </div>
  );
};

export default RecruiterJobPipeline;

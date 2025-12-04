import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPipelineJobsByIdQuery,
  useMoveToNextStageMutation,
  useStagedCandidateNotifyMutation,
  useUpdateStageDatesMutation,
} from "../../Slices/Recruiter/RecruiterApis";
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
  TeamOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  UserOutlined,
  LeftOutlined,
  DollarOutlined,
  CalendarOutlined,
  BankOutlined,
  FileOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
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

  const getReviewerIdForStage = (stageId) => {
    if (!processedJobData) return null;

    const currentCandidate = processedJobData.candidates[0];
    const isTagged = !!currentCandidate?.tagPipelineId;

    if (isTagged) {
      return (
        currentCandidate.stageProgress?.find(
          (progress) => progress.stageId === stageId
        )?.recruiterId || null
      );
    } else {
      const stageTimeline =
        processedJobData.workOrder?.pipelineStageTimeline?.find(
          (timeline) => timeline.stageId === stageId
        );
      return stageTimeline?.recruiterIds?.[0] || null;
    }
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

    const currentStageId = candidate.currentStageId || candidate.currentStage;
    const nextStageId = getNextStageId(currentStageId);
    setTargetStage(nextStageId);

    setIsMoveModalVisible(true);
  };

  const confirmMoveCandidate = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedCandidate) {
        message.error("No candidate selected");
        return;
      }

      const currentStageId =
        selectedCandidate.currentStageId || selectedCandidate.currentStage;

      if (!currentStageId) {
        message.error("Cannot determine current stage for candidate");
        return;
      }

      const isTagged = !!selectedCandidate.tagPipelineId;

      // Get next stage ID
      const nextStageId = getNextStageId(currentStageId);
      const isLastStage = !nextStageId;

      console.log("DEBUG confirmMoveCandidate:", {
        currentStageId,
        nextStageId,
        isLastStage,
        isTagged,
        currentStageName: getStageName(currentStageId),
        nextStageName: nextStageId ? getStageName(nextStageId) : "N/A",
        candidateId: selectedCandidate._id,
      });

      const currentStageProgress = selectedCandidate.stageProgress.find(
        (stage) => stage.stageId === currentStageId
      );

      if (!currentStageProgress) {
        message.error("Cannot find stage progress for current stage");
        return;
      }

      // Check if stage requires approval
      const hasApprovalLevels =
        currentStageProgress.approval &&
        currentStageProgress.approval.approvalId;

      if (hasApprovalLevels) {
        const isStageApproved =
          currentStageProgress.approval?.isApproved === true;
        if (!isStageApproved) {
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

      if (hasAnyRecruiterApproved) {
        message.warning(
          "This candidate has already been approved by a recruiter"
        );
        return;
      }

      // For non-approval stages, check documents
      if (!hasApprovalLevels) {
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

        if (uniqueRequiredDocuments.length > 0) {
          const uploadedDocuments =
            currentStageProgress?.uploadedDocuments || [];
          if (uploadedDocuments.length === 0) {
            message.warning(
              "Cannot move candidate until required documents are uploaded"
            );
            return;
          }
        }
      }

      // Get reviewer ID
      const currentStageRecruiterId = getReviewerIdForStage(currentStageId);

      if (!currentStageRecruiterId) {
        message.error("No recruiter assigned to the current stage");
        return;
      }

      // Prepare payload for API call
      const payload = {
        userId: selectedCandidate.userId,
        workOrderId: selectedCandidate.workOrderId,
        stageId: currentStageId,
        reviewerId: currentStageRecruiterId,
        reviewerComments:
          values.reviewerComments ||
          (isLastStage ? "Process completed" : "Moved to next stage"),
        isFinished: isLastStage,
        nextStageId: isLastStage ? null : nextStageId,
        // Add pipeline-specific fields for tagged pipelines
        ...(isTagged && {
          tagPipelineId: selectedCandidate.tagPipelineId,
          pipelineCandidateId:
            selectedCandidate.pipelineCandidateId || selectedCandidate._id,
        }),
      };

      console.log("Sending API payload:", payload);

      // Make the API call
      const result = await moveToNextStage(payload).unwrap();

      console.log("API response:", result);

      message.success(
        isLastStage
          ? `Successfully completed process for ${selectedCandidate.name}`
          : `Successfully moved ${selectedCandidate.name} to ${getStageName(
              nextStageId
            )}`
      );

      // Reset and refresh
      setIsMoveModalVisible(false);
      setSelectedCandidate(null);
      setReviewerComments("");
      form.resetFields();

      // Refetch the data
      await refetch();
    } catch (error) {
      console.error("Error in confirmMoveCandidate:", error);

      // Handle form validation errors
      if (error.errorFields) {
        return;
      }

      // Extract error message
      let errorMessage = "Failed to move candidate to next stage";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      message.error(errorMessage);
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

    const isTagged = !!candidate?.tagPipelineId;

    const stageTimeline = isTagged
      ? processedJobData.pipeline.stages.find((s) => s._id === stageId)
      : processedJobData.workOrder.pipelineStageTimeline.find(
          (s) => s.stageId === stageId
        );

    const stageProgress = candidate.stageProgress.find(
      (sp) => sp.stageId === stageId
    );

    const uploadedDocs = stageProgress?.uploadedDocuments || [];

    const allRequiredDocs = [...(stageTimeline?.requiredDocuments || [])];

    const uniqueRequiredDocuments = [
      ...new Set(
        allRequiredDocs.map((doc) =>
          typeof doc === "string" ? doc : doc.title
        )
      ),
    ];

    if (uploadedDocs.length === 0) {
      return (
        <Empty
          description="No documents uploaded"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "20px 0" }}
        />
      );
    }

    return (
      <div style={{ marginTop: "16px" }}>
        <Title level={5} style={{ marginBottom: "12px" }}>
          <FileOutlined style={{ marginRight: "8px" }} />
          Uploaded Documents ({uploadedDocs.length})
        </Title>

        <div style={{ marginBottom: "16px" }}>
          <Text strong>Required Documents: </Text>
          {uniqueRequiredDocuments.length > 0 ? (
            uniqueRequiredDocuments.map((doc, index) => (
              <Tag key={index} color="blue" style={{ margin: "2px" }}>
                {doc}
              </Tag>
            ))
          ) : (
            <Text type="secondary">None specified</Text>
          )}
        </div>

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
      currentStageProgress.approval &&
      currentStageProgress.approval.hasOwnProperty("isApproved");

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

    const checkDocumentsUploaded = () => {
      const isTagged = !!candidate.tagPipelineId;

      // Get required documents based on pipeline type
      let allRequiredDocuments = [];

      if (isTagged) {
        // For tagged/separate pipelines, check fullStage in stageProgress
        const requiredDocs =
          currentStageProgress?.fullStage?.requiredDocuments || [];
        allRequiredDocuments = [...requiredDocs];
      } else {
        // For work order pipelines
        const currentStage = processedJobData.pipeline?.stages?.find(
          (stage) => stage._id === targetStageId
        );

        const stageTimeline =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (timeline) => timeline.stageId === targetStageId
          );

        allRequiredDocuments = [
          ...(currentStage?.requiredDocuments || []),
          ...(stageTimeline?.requiredDocuments?.map((doc) => doc.title) || []),
        ];
      }

      const uniqueRequiredDocuments = [...new Set(allRequiredDocuments)];

      // If no required documents, return true
      if (uniqueRequiredDocuments.length === 0) {
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

      // 3. Check based on whether stage has approval levels
      if (hasApprovalLevels) {
        // Stage HAS approval levels
        return isStageApproved && areDocumentsUploaded;
      } else {
        // Stage has NO approval levels
        return areDocumentsUploaded;
      }
    })();

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

      // Current stage logic
      if (hasApprovalLevels) {
        // Stage WITH approval levels
        if (!isStageApproved && !areDocumentsUploaded) {
          return "⚠️ Stage approval is required AND documents must be uploaded before moving this candidate.";
        } else if (!isStageApproved) {
          return "⚠️ Stage approval is required before this candidate can be moved to the next stage.";
        } else if (!areDocumentsUploaded) {
          return "⚠️ Required documents must be uploaded before moving this candidate to the next stage.";
        } else {
          return "✅ Stage is approved and documents are uploaded. You can move this candidate to the next stage.";
        }
      } else {
        // Stage WITHOUT approval levels
        if (!areDocumentsUploaded) {
          return "⚠️ Required documents must be uploaded before moving this candidate to the next stage.";
        } else {
          return "✅ All requirements met. You can move this candidate to the next stage.";
        }
      }
    };

    return (
      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          borderRadius: "8px",
          border: `1px solid ${isCurrentStage ? "#e6f7ff" : "#f0f0f0"}`,
          backgroundColor: isCurrentStage ? "#f6ffed" : "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: screens.xs ? "column" : "row",
            justifyContent: "space-between",
            alignItems: screens.xs ? "flex-start" : "center",
            gap: screens.xs ? "12px" : "0",
          }}
        >
          <div>
            <Text strong>
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

        <div style={{ marginTop: "12px" }}>
          <Text
            type={canMoveCandidate ? "success" : "secondary"}
            style={{ fontSize: "13px" }}
          >
            {getStatusMessage()}
          </Text>
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
                  offset={[10, -5]}
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

                          {/* REVIEWS BELOW */}
                          <div style={{ marginTop: "10px" }}>
                            <Text strong style={{ fontSize: "14px" }}>
                              Reviews:
                            </Text>

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
    </div>
  );
};

export default RecruiterJobPipeline;

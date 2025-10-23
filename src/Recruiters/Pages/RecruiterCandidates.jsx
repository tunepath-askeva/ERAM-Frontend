import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  Tabs,
  Badge,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  message,
  Drawer,
  List,
  Divider,
  Upload,
  Collapse,
  Popconfirm,
  Descriptions,
  Empty,
  Checkbox,
  Radio,
  Skeleton,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MessageOutlined,
  PlusOutlined,
  DownloadOutlined,
  CloseOutlined,
  UploadOutlined,
  InboxOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  FileOutlined,
  ArrowRightOutlined,
  GiftOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useGetPipelineCompletedCandidatesQuery,
  useMoveCandidateStatusMutation,
  useGetAllRecruitersQuery,
  useAddInterviewDetailsMutation,
  useChangeInterviewStatusMutation,
  useConvertEmployeeMutation,
  useGetAllLevelsQuery,
  useGetAllStaffsQuery,
  useMoveToPipelineMutation,
  useGetPipelineCompletedCandidateByIdQuery,
  useOfferInfoMutation,
  useUpdateTaggedPipelineMutation,
  useGetPipelinesQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;
const { Panel } = Collapse;

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

const RecruiterCandidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("interview");
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDrawerVisible, setCandidateDrawerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [interviewToReschedule, setInterviewToReschedule] = useState(null);
  const [scheduleInterviewModalVisible, setScheduleInterviewModalVisible] =
    useState(false);
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
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
  const [changePipelineModalVisible, setChangePipelineModalVisible] =
    useState(false);
  const [selectedNewPipeline, setSelectedNewPipeline] = useState(null);
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [convertForm] = Form.useForm();
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerAction, setOfferAction] = useState("new"); // "new" or "revise"
  const [offerForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useGetPipelineCompletedCandidatesQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });
  const [moveToNextStage, { isLoading: isMovingStage }] =
    useMoveCandidateStatusMutation();
  const [addInterviewDetails, { isLoading: isSchedulingInterview }] =
    useAddInterviewDetailsMutation();
  const [changeInterviewStatus, { isLoading: isChangingStatus }] =
    useChangeInterviewStatusMutation();
  const [convertEmployee, { isLoading: isAddingEmployee }] =
    useConvertEmployeeMutation();
  const [moveToPipeline, { isLoading: isMovingPipeline }] =
    useMoveToPipelineMutation();
  const { data: pipelineData } = useGetPipelinesQuery();
  const activePipelines = pipelineData?.pipelines || [];
  const [updateTaggedPipeline, { isLoading: isUpdatingPipeline }] =
    useUpdateTaggedPipelineMutation();

  const [offerInfo, { isLoading: isSubmittingOffer }] = useOfferInfoMutation();

  const {
    data: candidateDetails,
    isLoading: isCandidateDetailsLoading,
    isFetching: isCandidateDetailsFetching,
    refetch: refetchCandidateDetails,
  } = useGetPipelineCompletedCandidateByIdQuery(selectedCandidate?._id, {
    skip: !selectedCandidate?._id,
  });

  const candidate = candidateDetails?.data;

  const { data: allRecruiters } = useGetAllRecruitersQuery();
  const { data: levelData } = useGetAllLevelsQuery();
  const { data: staffData } = useGetAllStaffsQuery();
  const levelGroups = levelData?.otherRecruiters || [];
  const staffs = staffData?.otherRecruiters || [];

  useEffect(() => {
    if (apiData?.total) {
      setPagination((prev) => ({
        ...prev,
        total: apiData.total,
      }));
    }
  }, [apiData]);

  const tablePagination = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total} candidates`,
    responsive: true,
    onChange: (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
      }));
    },
    onShowSizeChange: (current, size) => {
      setPagination((prev) => ({
        ...prev,
        current: 1,
        pageSize: size,
      }));
    },
  };

  const candidates =
    apiData?.data?.map((candidate) => ({
      id: candidate._id,
      _id: candidate._id,
      candidateId: candidate.user._id,
      name: candidate.user.fullName,
      email: candidate.user.email,
      position: candidate.workOrder.title,
      jobCode: candidate.workOrder.jobCode,
      workOrder: candidate.workOrder,
      tagPipeline: candidate.tagPipeline,
      status: candidate.status,
      stageProgress: candidate.stageProgress,
      updatedAt: candidate.updatedAt,
      avatar: candidate.user.image || null,
      interviewDetails: candidate.interviewDetails || [],
    })) || [];

  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const recruiterOptionStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  const mobileButtonGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    "& > button": {
      width: "100%",
    },
  };

  const statusConfig = {
    interview: { color: "purple", label: "Interview" },
    offer_pending: {
      label: "Offer Accept Waiting",
      color: "orange",
    },
    offer_revised: {
      label: "Offer Revised",
      color: "blue",
    },
    offer: { color: "green", label: "Offer" },
    rejected: { color: "red", label: "Rejected" },
    completed: { color: "green", label: "Completed" },
    default: { color: "gray", label: "Unknown" },
  };

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const recruiterInfo = JSON.parse(
    localStorage.getItem("recruiterInfo") || "{}"
  );

  const filterCounts = {
    all: candidates.length,
    completed: candidates.filter((c) => c.status === "completed").length,
    interview: candidates.filter((c) => c.status === "interview").length,
    offer_pending: candidates.filter((c) => c.status === "offer_pending")
      .length,
    offer_revised: candidates.filter((c) => c.status === "offer_revised")
      .length,
    offer: candidates.filter((c) => c.status === "offer").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesFilter =
      selectedStatus === "all" || candidate.status === selectedStatus;
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.jobCode &&
        candidate.jobCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleMoveToInterview = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "interview",
      }).unwrap();

      message.success(
        `${candidate.name} moved to interview stage successfully!`
      );
      refetch();
    } catch (error) {
      message.error(
        `Failed to move ${candidate.name} to interview stage. Please try again.`
      );
      console.error("Move to interview error:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleMakeOffer = (candidate) => {
    setSelectedCandidate(candidate);
    setOfferModalVisible(true);
    offerForm.resetFields();
  };

  const handleChangePipeline = () => {
    setChangePipelineModalVisible(true);
    setSelectedNewPipeline(selectedCandidate?.tagPipeline?._id || null);
  };

  const handleUpdatePipeline = async () => {
    if (!selectedNewPipeline) {
      message.error("Please select a pipeline");
      return;
    }

    try {
      await updateTaggedPipeline({
        id: selectedCandidate._id, 
        pipelineId: selectedNewPipeline, 
      }).unwrap();

      message.success("Pipeline updated successfully!");
      setChangePipelineModalVisible(false);

      // Refetch both queries
      await refetch();
      await refetchCandidateDetails();
    } catch (error) {
      message.error("Failed to update pipeline");
      console.error("Update pipeline error:", error);
    }
  };

  const handleMoveToOffer = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "offer",
      }).unwrap();

      message.success(`${candidate.name} moved to offer stage successfully!`);
      refetch();
    } catch (error) {
      message.error(
        `Failed to move ${candidate.name} to offer stage. Please try again.`
      );
      console.error("Move to offer error:", error);
    }
  };

  const handleOfferSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("status", "offer_pending");
      formData.append("description", values.description);

      if (values.file?.file?.originFileObj) {
        formData.append("attachment", values.file.file.originFileObj);
      } else if (values.file?.fileList?.[0]?.originFileObj) {
        formData.append("attachment", values.file.fileList[0].originFileObj);
      }

      await offerInfo({ id: selectedCandidate._id, formData }).unwrap();

      message.success("Offer created successfully!");
      setOfferModalVisible(false);
      offerForm.resetFields();
      refetch();
      refetchCandidateDetails();
    } catch (err) {
      message.error("Failed to send offer");
    }
  };

  const handleReviseOffer = async (values) => {
    try {
      const formData = new FormData();
      formData.append("status", "offer_revised");
      formData.append("description", values.description);

      if (values.file?.file?.originFileObj) {
        formData.append("attachment", values.file.file.originFileObj);
      } else if (values.file?.fileList?.[0]?.originFileObj) {
        formData.append("attachment", values.file.fileList[0].originFileObj);
      }

      await offerInfo({ id: selectedCandidate._id, formData }).unwrap();

      message.success("Offer revised successfully!");
      setOfferModalVisible(false);
      offerForm.resetFields();
      refetch();
      refetchCandidateDetails();
    } catch (err) {
      message.error("Failed to revise offer");
    }
  };

  const handleFinalizeOffer = async () => {
    try {
      const formData = new FormData();
      formData.append("status", "offer"); // final

      await offerInfo({ id: selectedCandidate._id, formData }).unwrap();

      message.success("Offer finalized!");
      refetch();
      refetchCandidateDetails();
    } catch (err) {
      message.error("Failed to finalize offer");
    }
  };

  const handleRejectCandidate = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "rejected",
      }).unwrap();

      message.success(`${candidate.name} has been rejected.`);
      refetch();
    } catch (error) {
      message.error(`Failed to reject ${candidate.name}. Please try again.`);
      console.error("Reject candidate error:", error);
    }
  };

  const getActiveInterview = (candidate) => {
    if (!candidate?.interviewDetails?.length) return null;

    return (
      candidate.interviewDetails.find(
        (interview) => !["completed", "cancelled"].includes(interview.status)
      ) || candidate.interviewDetails[candidate.interviewDetails.length - 1]
    );
  };

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    const activeInterview = getActiveInterview(candidate);

    form.resetFields();

    if (activeInterview) {
      form.setFieldsValue({
        title: activeInterview.title,
        type: activeInterview.mode,
        meetingLink: activeInterview.meetingLink,
        location: activeInterview.location,
        datetime: dayjs(activeInterview.date),
        interviewers: activeInterview.interviewerIds,
        notes: activeInterview.notes,
      });
    }

    setScheduleInterviewModalVisible(true);
  };

  const handleChangeInterviewStatus = async (status, interviewId) => {
    if (!selectedCandidate || !interviewId) return;

    try {
      await changeInterviewStatus({
        id: selectedCandidate._id,
        _id: interviewId,
        status,
      }).unwrap();

      message.success(`Interview ${status.replace("_", " ")} successfully!`);

      await refetch();
      await refetchCandidateDetails();

      setCandidateDrawerVisible(false);

      setSelectedCandidate(null);

      setScheduleInterviewModalVisible(false);
    } catch (error) {
      message.error(`Failed to update interview status: ${error.message}`);
      console.error("Interview status change error:", error);
    }
  };

  const handleRescheduleInterview = (interview) => {
    form.resetFields();
    form.setFieldsValue({
      title: interview.title,
      type: interview.mode,
      meetingLink: interview.meetingLink,
      location: interview.location,
      datetime: dayjs(interview.date),
      interviewers: interview.interviewerIds,
      notes: interview.notes,
    });
    setInterviewToReschedule(interview._id);
    setScheduleInterviewModalVisible(true);
  };

  const handleConvertToEmployee = (candidate) => {
    setCandidateToConvert(candidate);
    convertForm.setFieldsValue({ fullName: candidate.name });
    setConvertModalVisible(true);
  };

  const handleScheduleInterviewSubmit = async (values) => {
    try {
      const payload = {
        title: values.title,
        scheduledAt: values.datetime.format(),
        mode: values.type,
        status: "scheduled",
        interviewerIds: values.interviewers,
        notes: values.notes,
      };

      if (values.type === "online") {
        payload.meetingLink = values.meetingLink;
      } else if (values.type === "in-person") {
        payload.location = values.location;
      }

      if (interviewToReschedule) {
        payload.id = interviewToReschedule;
      }

      await addInterviewDetails({
        id: selectedCandidate._id,
        payload,
      }).unwrap();

      message.success(
        interviewToReschedule
          ? "Interview rescheduled successfully!"
          : "Interview scheduled successfully!"
      );

      setScheduleInterviewModalVisible(false);
      form.resetFields();
      setInterviewToReschedule(null);
      await refetch();
      await refetchCandidateDetails();
    } catch (error) {
      message.error("Failed to schedule interview");
      console.error("Error:", error);
    }
  };

  const getAvailableActions = (candidate) => {
    const actions = [];

    switch (candidate.status) {
      case "interview":
        if ((candidate.interviewDetails?.length || 0) === 0) {
          if (hasPermission("schedule-interview")) {
            actions.push({
              key: "schedule",
              label: "Schedule Interview",
              icon: <CalendarOutlined style={iconTextStyle} />,
              onClick: () => handleScheduleInterview(candidate),
              style: { color: "#722ed1" },
            });
          }
        } else if (hasPermission("view-interviews")) {
          actions.push({
            key: "view-interviews",
            label: "View Interviews",
            icon: <EyeOutlined style={iconTextStyle} />,
            onClick: () => handleViewProfile(candidate),
            style: { color: "#722ed1" },
          });
        }
        if (hasPermission("make-offer")) {
          actions.push({
            key: "offer",
            label: "Make Offer",
            icon: <GiftOutlined style={iconTextStyle} />,
            onClick: () => {
              setSelectedCandidate(candidate);
              setOfferAction("new"); // 👈 set to new offer
              setOfferModalVisible(true);
              offerForm.resetFields();
            },
            style: { color: "#52c41a" },
          });
        }
        if (hasPermission("reject-candidate")) {
          actions.push({
            key: "reject",
            label: "Reject",
            icon: <StopOutlined style={iconTextStyle} />,
            onClick: () => handleRejectCandidate(candidate),
            style: { color: "#f5222d" },
            confirm: true,
            confirmTitle: `Are you sure you want to reject ${candidate.name}?`,
            confirmDescription: "This action cannot be undone.",
          });
        }
        break;
      case "offer_pending":
        if (hasPermission("move-to-offer")) {
          actions.push({
            key: "move-to-offer",
            label: "Move to Offer",
            icon: <CheckOutlined style={iconTextStyle} />,
            onClick: () => handleMoveToOffer(candidate),
            style: { color: "#52c41a" },
          });
        }

        if (hasPermission("reject-candidate")) {
          actions.push({
            key: "reject",
            label: "Reject",
            icon: <StopOutlined style={iconTextStyle} />,
            onClick: () => handleRejectCandidate(candidate),
            style: { color: "#f5222d" },
            confirm: true,
            confirmTitle: `Are you sure you want to reject ${candidate.name}?`,
            confirmDescription: "This action cannot be undone.",
          });
        }
        break;
      case "offer_revised":
        if (hasPermission("move-to-offer")) {
          actions.push({
            key: "move-to-offer",
            label: "Move to Offer",
            icon: <CheckOutlined style={iconTextStyle} />,
            onClick: () => handleMoveToOffer(candidate),
            style: { color: "#52c41a" },
          });
        }

        if (hasPermission("reject-candidate")) {
          actions.push({
            key: "reject",
            label: "Reject",
            icon: <StopOutlined style={iconTextStyle} />,
            onClick: () => handleRejectCandidate(candidate),
            style: { color: "#f5222d" },
            confirm: true,
            confirmTitle: `Are you sure you want to reject ${candidate.name}?`,
            confirmDescription: "This action cannot be undone.",
          });
        }
        break;

      case "offer":
        if (hasPermission("move-to-pipeline")) {
          actions.push({
            key: "move",
            label: "Move to Pipeline",
            icon: <ArrowRightOutlined style={iconTextStyle} />,
            onClick: () => handleMoveToPipeline(candidate),
            style: { color: "#52c41a" },
          });
        }

        if (hasPermission("reject-candidate")) {
          actions.push({
            key: "reject",
            label: "Reject",
            icon: <StopOutlined style={iconTextStyle} />,
            onClick: () => handleRejectCandidate(candidate),
            style: { color: "#f5222d" },
            confirm: true,
            confirmTitle: `Are you sure you want to reject ${candidate.name}?`,
            confirmDescription: "This action cannot be undone.",
          });
        }
        break;

      default:
        break;
    }

    // if (
    //   candidate.status !== "rejected" &&
    //   candidate.status !== "offer" &&
    //   hasPermission("reject-candidate")
    // ) {
    //   actions.push({
    //     key: "reject",
    //     label: "Reject",
    //     icon: <StopOutlined style={iconTextStyle} />,
    //     onClick: () => handleRejectCandidate(candidate),
    //     style: { color: "#f5222d" },
    //     confirm: true,
    //     confirmTitle: `Are you sure you want to reject ${candidate.name}?`,
    //     confirmDescription: "This action cannot be undone.",
    //   });
    // }

    // if (hasPermission("move-to-pipeline")) {
    //   actions.push({
    //     key: "move",
    //     label: "Move to Pipeline",
    //     icon: <CheckOutlined style={iconTextStyle} />,
    //     onClick: () => handleMoveToPipeline(candidate),
    //     style: { color: "#52c41a" },
    //   });
    // }

    return actions;
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDrawerVisible(true);
  };

  const handleMoveToPipeline = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDrawerVisible(true);
  };

  const handleMoveCandidateToPipeline = async (candidate) => {
    try {
      const jobId = candidate.workOrder._id;
      const userId = candidate.candidateId;

      const payload = {
        jobId,
        userId,
        isPipeline: false,
      };

      await moveToPipeline(payload).unwrap();
      message.success(
        `${candidate.name} moved to Work Order pipeline successfully!`
      );
      setCandidateDrawerVisible(false);
      refetch();
    } catch (error) {
      console.error("Failed to move to work order pipeline:", error);
      message.error(`Failed to move ${candidate.name} to work order pipeline.`);
    }
  };

  const handleMoveToSeparatePipeline = async () => {
    try {
      if (!selectedCandidate || !selectedCandidate.tagPipeline) {
        message.warning("No tagged pipeline found for this candidate");
        return;
      }

      const pipelineId = selectedCandidate.tagPipeline._id; // Use tagPipeline ID
      const jobId = selectedCandidate.workOrder._id;
      const userId = selectedCandidate.candidateId;

      const defaultStages = selectedCandidate.tagPipeline.stages || [];
      const customStagesList = customStages[pipelineId] || [];
      const allStages = [...defaultStages, ...customStagesList];

      const formattedStages = allStages.map((stage, index) => {
        const stageId = stage._id || stage.id;
        const isCustomStage = stage.isCustom || false;

        const stageDate =
          (pipelineStageDates[pipelineId] || []).find(
            (d) => d.stageId === stageId
          ) || {};

        return {
          pipelineId,
          stageId,
          stageName: stage.name,
          stageOrder: index,
          startDate: stageDate.startDate,
          endDate: stageDate.endDate,
          dependencyType: stageDate.dependencyType || "independent",
          approvalId: stageDate.approvalId || null,
          recruiterIds: stageRecruiterAssignments[pipelineId]?.[stageId] || [],
          staffIds: stageStaffAssignments[pipelineId]?.[stageId] || [],
          isCustomStage,
          _id: stageId,
          customFields: stageCustomFields[pipelineId]?.[stageId] || [],
          requiredDocuments:
            stageRequiredDocuments[pipelineId]?.[stageId] || [],
        };
      });

      const pipelineData = {
        _id: pipelineId,
        name: selectedCandidate.tagPipeline.name,
        description: selectedCandidate.tagPipeline.description || "",
        stages: formattedStages,
      };

      await moveToPipeline({
        jobId,
        userId,
        pipelineData,
        isPipeline: true,
      }).unwrap();

      message.success(
        `${selectedCandidate.name} moved to ${selectedCandidate.tagPipeline.name} successfully`
      );
      refetch();
      setCandidateDrawerVisible(false);
      setPipelineModalVisible(false);
    } catch (error) {
      console.error("Failed to move candidate to tagged pipeline:", error);
      message.error(
        error.data?.message || "Failed to move candidate to tagged pipeline"
      );
    }
  };

  const handleTagPipelineClick = (tagPipeline) => {
    setSelectedPipeline(tagPipeline);

    if (!pipelineStageDates[tagPipeline._id]) {
      setPipelineStageDates((prev) => ({
        ...prev,
        [tagPipeline._id]: tagPipeline.stages.map((stage) => ({
          stageId: stage._id,
          startDate: null,
          endDate: null,
          dependencyType: "independent",
        })),
      }));
    }

    setPipelineModalVisible(true);
  };

  const handleSendMessage = (candidate) => {
    setSelectedCandidate(candidate);
    setMessageModalVisible(true);
  };

  const handleDownloadResume = (candidate) => {
    if (candidate.stageProgress?.length > 0) {
      const firstStage = candidate.stageProgress[0];
      if (firstStage.uploadedDocuments?.length > 0) {
        const document = firstStage.uploadedDocuments[0];
        window.open(document?.fileUrl, "_blank");
        message.success(`Downloading ${document.fileName}...`);
        return;
      }
    }
    message.warning("No documents available for download");
  };

  const renderStageActions = (candidate) => {
    const actions = getAvailableActions(candidate);

    if (actions.length === 0) return null;

    return (
      <Space size="small" wrap>
        {actions.map((action) => {
          if (action.confirm) {
            return (
              <Popconfirm
                key={action.key}
                title={action.confirmTitle}
                description={action.confirmDescription}
                onConfirm={action.onClick}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: action.key === "reject" }}
              >
                <Button
                  size="small"
                  icon={action.icon}
                  style={action.style}
                  loading={isMovingStage}
                >
                  {action.label}
                </Button>
              </Popconfirm>
            );
          }

          return (
            <Button
              key={action.key}
              size="small"
              icon={action.icon}
              onClick={action.onClick}
              style={action.style}
              loading={isMovingStage}
            >
              {action.label}
            </Button>
          );
        })}
      </Space>
    );
  };

  // Add these functions to the component
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
          dependencyType: "independent",
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
      ...(selectedPipeline?.stages || []),
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
            dependencyType: "independent",
          }
      );

      setPipelineStageDates((prev) => ({
        ...prev,
        [pipelineId]: newDates,
      }));
    }

    setDraggedStage(null);
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

  const handleStaffAssignmentChange = (pipelineId, stageId, staffIds) => {
    setStageStaffAssignments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: staffIds,
      },
    }));
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

  const addStageCustomField = (pipelineId, stageId) => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      options: [],
    };

    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: [...(prev[pipelineId]?.[stageId] || []), newField],
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

  const addFieldOption = (pipelineId, stageId, fieldId) => {
    setStageCustomFields((prev) => {
      const current = prev[pipelineId]?.[stageId] || [];
      return {
        ...prev,
        [pipelineId]: {
          ...prev[pipelineId],
          [stageId]: current.map((field) =>
            field.id === fieldId
              ? { ...field, options: [...(field.options || []), ""] }
              : field
          ),
        },
      };
    });
  };

  const updateFieldOption = (
    pipelineId,
    stageId,
    fieldId,
    optionIndex,
    value
  ) => {
    setStageCustomFields((prev) => {
      const current = prev[pipelineId]?.[stageId] || [];
      return {
        ...prev,
        [pipelineId]: {
          ...prev[pipelineId],
          [stageId]: current.map((field) => {
            if (field.id !== fieldId) return field;
            const newOptions = [...(field.options || [])];
            newOptions[optionIndex] = value;
            return { ...field, options: newOptions };
          }),
        },
      };
    });
  };

  const removeFieldOption = (pipelineId, stageId, fieldId, optionIndex) => {
    setStageCustomFields((prev) => {
      const current = prev[pipelineId]?.[stageId] || [];
      return {
        ...prev,
        [pipelineId]: {
          ...prev[pipelineId],
          [stageId]: current.map((field) => {
            if (field.id !== fieldId) return field;
            const newOptions = (field.options || []).filter(
              (_, i) => i !== optionIndex
            );
            return { ...field, options: newOptions };
          }),
        },
      };
    });
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: "name",
      key: "name",
      responsive: ["md"],
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size={40}>
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong>{record.name}</Text>
              <Button type="text" size="small" />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined style={iconTextStyle} /> {record.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      responsive: ["lg"],
      render: (text, record) => (
        <div>
          <Text strong>{record.position}</Text>
          {record.jobCode && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.jobCode}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const statusInfo = statusConfig[status] || statusConfig.default;
        return (
          <div>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </div>
        );
      },
    },

    // {
    //   title: "Last Updated",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   responsive: ["md"],
    //   render: (date) => <Text>{new Date(date).toLocaleDateString()}</Text>,
    // },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          {hasPermission("view-profile") && (
            <Tooltip title="View Profile">
              <Button
                type="text"
                icon={<EyeOutlined style={iconTextStyle} />}
                size="small"
                onClick={() => handleViewProfile(record)}
              />
            </Tooltip>
          )}
          {/* {hasPermission("send-messages") && (
            <Tooltip title="Send Message">
              <Button
                type="text"
                icon={<MessageOutlined style={iconTextStyle} />}
                size="small"
                onClick={() => handleSendMessage(record)}
              />
            </Tooltip>
          )} */}
          {(hasPermission("download-documents") ||
            getAvailableActions(record).length > 0) && (
            <Dropdown
              menu={{
                items: [
                  hasPermission("view-profile") && {
                    key: "view",
                    label: "View Profile",
                    icon: <EyeOutlined style={iconTextStyle} />,
                    onClick: () => handleViewProfile(record),
                  },
                  // hasPermission("send-messages") && {
                  //   key: "message",
                  //   label: "Send Message",
                  //   icon: <MessageOutlined style={iconTextStyle} />,
                  //   onClick: () => handleSendMessage(record),
                  // },
                  // hasPermission("download-documents") && {
                  //   key: "download",
                  //   label: "Download Documents",
                  //   icon: <DownloadOutlined style={iconTextStyle} />,
                  //   onClick: () => handleDownloadResume(record),
                  // },
                  ...(getAvailableActions(record).length > 0
                    ? [
                        {
                          type: "divider",
                        },
                      ]
                    : []),
                  ...getAvailableActions(record).map((action) => ({
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    onClick: action.onClick,
                    style: action.style,
                  })),
                ].filter(Boolean),
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined style={iconTextStyle} />}
                size="small"
              />
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  const tabLabels = {
    interview: "Interview",
    offer_pending: "Offer Accept Waiting",
    offer_revised: "Offer Revised",
    offer: "Offer",
    rejected: "Rejected",
  };

  const tabItems = [
    "interview",
    "offer_pending",
    "offer_revised",
    "offer",
    "rejected",
  ]
     .filter((status) => hasPermission(`view-${status}-tab`))
    .map((status) => ({
      key: status,
      label: (
        <Badge count={filterCounts[status]} size="small" offset={[10, 0]}>
          {tabLabels[status]}
        </Badge>
      ),
    }));

  const CandidateCard = ({ candidate }) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      actions={[
        <EyeOutlined
          key="view"
          style={iconTextStyle}
          onClick={() => handleViewProfile(candidate)}
        />,
        <MessageOutlined
          key="message"
          style={iconTextStyle}
          onClick={() => handleSendMessage(candidate)}
        />,
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "View Profile",
                icon: <EyeOutlined style={iconTextStyle} />,
                onClick: () => handleViewProfile(candidate),
              },
              {
                key: "message",
                label: "Send Message",
                icon: <MessageOutlined style={iconTextStyle} />,
                onClick: () => handleSendMessage(candidate),
              },
              {
                key: "download",
                label: "Download Documents",
                icon: <DownloadOutlined style={iconTextStyle} />,
                onClick: () => handleDownloadResume(candidate),
              },
              {
                type: "divider",
              },
              ...getAvailableActions(candidate).map((action) => ({
                key: action.key,
                label: action.label,
                icon: action.icon,
                onClick: action.onClick,
                style: action.style,
              })),
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <MoreOutlined style={iconTextStyle} />
        </Dropdown>,
      ]}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar src={candidate.avatar} size={48}>
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text strong>{candidate.name}</Text>
          </div>
          <Text style={{ display: "block", marginBottom: 4 }}>
            {candidate.position}
          </Text>
          {candidate.jobCode && (
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 4 }}
            >
              {candidate.jobCode}
            </Text>
          )}
          <div style={{ marginBottom: 8 }}>
            <Tag color={statusConfig[candidate.status]?.color} size="small">
              {statusConfig[candidate.status]?.label}
            </Tag>
          </div>

          {/* Stage Actions for Mobile */}
          <div style={{ marginBottom: 8 }}>{renderStageActions(candidate)}</div>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Last updated: {new Date(candidate.updatedAt).toLocaleDateString()}
          </Text>
        </div>
      </div>
    </Card>
  );

  const renderStageReviews = (stage) => {
    return (
      <Collapse>
        {stage.recruiterReviews?.map((review, index) => (
          <Panel
            header={`Review by ${review.reviewerName}`}
            key={`review-${index}`}
            extra={
              <Tag
                color={review.status === "approved" ? "green" : "orange"}
                icon={
                  review.status === "approved" ? (
                    <CheckOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  )
                }
              >
                {review.status}
              </Tag>
            }
          >
            <Text strong>Comments:</Text>
            <Text style={{ display: "block", marginBottom: 8 }}>
              {review.reviewComments}
            </Text>
            <Text type="secondary">
              Reviewed at: {new Date(review.reviewedAt).toLocaleString()}
            </Text>
          </Panel>
        ))}
      </Collapse>
    );
  };

  const renderActivityTimeline = (stageProgress) => {
    return stageProgress?.map((stage) => ({
      title: stage.stageName,
      description:
        stage.recruiterReviews?.[0]?.reviewComments || "Stage completed",
      date: new Date(
        stage.stageCompletedAt || stage.recruiterReviews?.[0]?.reviewedAt
      ).toLocaleString(),
      icon: <CheckOutlined />,
      stage,
    }));
  };

  const renderDocuments = (stageProgress) => {
    const allDocuments = [];
    stageProgress?.forEach((stage) => {
      if (stage.uploadedDocuments?.length) {
        allDocuments.push({
          stageName: stage.stageName,
          documents: stage.uploadedDocuments,
        });
      }
    });

    return (
      <div>
        {allDocuments.length > 0 ? (
          allDocuments.map((docGroup, index) => (
            <div key={`doc-group-${index}`} style={{ marginBottom: 16 }}>
              <Text strong>{docGroup.stageName}</Text>
              <List
                dataSource={docGroup.documents}
                renderItem={(doc) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileOutlined />}
                      title={
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {doc.fileName}
                        </a>
                      }
                      description={`Uploaded at: ${new Date(
                        doc.uploadedAt
                      ).toLocaleString()}`}
                    />
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    />
                  </List.Item>
                )}
              />
            </div>
          ))
        ) : (
          <Text type="secondary">No documents uploaded yet.</Text>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div style={{ padding: "12px", minHeight: "100vh" }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Title
              level={2}
              style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}
            >
              Interview Candidates
            </Title>
            <Text type="secondary">
              Manage and track your interview candidates in pipeline
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Input
              placeholder="Search candidates, positions, or job codes..."
              prefix={<SearchOutlined style={iconTextStyle} />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
              allowClear
              onPressEnter={(e) => handleSearch(e.target.value)}
            />
          </Col>
        </Row>

        {/* Status Filter Tabs */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Tabs
            activeKey={selectedStatus}
            onChange={handleStatusChange}
            items={tabItems}
            size="small"
            tabBarStyle={{ margin: 0 }}
          />
        </div>
      </Card>

      <Card>
        <div
          className="desktop-view"
          style={{ display: window.innerWidth >= 768 ? "block" : "none" }}
        >
          <Table
            columns={columns}
            dataSource={candidates}
            rowKey="id"
            loading={isLoading}
            pagination={tablePagination}
            scroll={{ x: 1400 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <UserOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <Title level={4} type="secondary">
                    No candidates found
                  </Title>
                  <Text type="secondary">
                    Try adjusting your search or filters to find candidates.
                  </Text>
                </div>
              ),
            }}
          />
        </div>

        {/* Mobile Card View */}
        <div
          className="mobile-view"
          style={{ display: window.innerWidth < 768 ? "block" : "none" }}
        >
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <UserOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} type="secondary">
                No candidates found
              </Title>
              <Text type="secondary">
                Try adjusting your search or filters to find candidates.
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* Candidate Profile Drawer */}
      <Drawer
        title={candidate?.user?.fullName || "Candidate Details"}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 600}
        onClose={() => setCandidateDrawerVisible(false)}
        open={candidateDrawerVisible}
        // extra={
        //   <Space>
        //     <Button
        //       icon={<MessageOutlined />}
        //       onClick={() => {
        //         setCandidateDrawerVisible(false);
        //         handleSendMessage(selectedCandidate);
        //       }}
        //     >
        //       Message
        //     </Button>
        //   </Space>
        // }
      >
        {isCandidateDetailsLoading || isCandidateDetailsFetching ? (
          <Skeleton tip="Loading candidate details..." />
        ) : candidate ? (
          <>
            {selectedCandidate && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <Avatar src={selectedCandidate.avatar} size={64}>
                    {selectedCandidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                  <div style={{ marginLeft: 16 }}>
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {selectedCandidate.name}
                    </Title>
                    <Text type="secondary">{selectedCandidate.position}</Text>
                    {selectedCandidate.jobCode && (
                      <Text type="secondary" style={{ display: "block" }}>
                        {selectedCandidate.jobCode}
                      </Text>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Tag color={statusConfig[selectedCandidate.status].color}>
                        {statusConfig[selectedCandidate.status].label}
                      </Tag>
                    </div>
                  </div>
                </div>

                <Tabs defaultActiveKey="1">
                  {hasPermission("view-interviews") && (
                    <TabPane
                      tab={
                        <span>
                          Interviews{" "}
                          <Badge
                            count={candidate.interviewDetails?.length || 0}
                          />
                        </span>
                      }
                      key="1"
                    >
                      {candidate.status === "interview" && (
                        <div style={{ marginBottom: 16 }}>
                          <Button
                            type="primary"
                            style={{ background: "#da2c46" }}
                            onClick={() => {
                              form.resetFields();
                              setScheduleInterviewModalVisible(true);
                            }}
                            icon={<PlusOutlined />}
                          >
                            Schedule New Interview
                          </Button>
                        </div>
                      )}
                      {candidate.interviewDetails?.length > 0 ? (
                        <Collapse accordion>
                          {candidate.interviewDetails.map((interview) => (
                            <Panel
                              header={`${interview.title} (${interview.status})`}
                              key={interview._id}
                              extra={
                                <Space>
                                  <Tag
                                    color={
                                      interview.status === "scheduled"
                                        ? "blue"
                                        : interview.status ===
                                          "interview_completed"
                                        ? "green"
                                        : interview.status === "interview_hold"
                                        ? "orange"
                                        : "red"
                                    }
                                  >
                                    {interview.status}
                                  </Tag>
                                  <Button
                                    size="small"
                                    disabled={
                                      interview.status !== "scheduled" &&
                                      interview.status !== "interview_hold"
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRescheduleInterview(interview);
                                    }}
                                  >
                                    Reschedule
                                  </Button>
                                </Space>
                              }
                            >
                              <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Date & Time">
                                  {new Date(interview.date).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mode">
                                  {interview.mode === "online"
                                    ? "Online"
                                    : "In-Person"}
                                </Descriptions.Item>
                                {interview.mode === "online" && (
                                  <Descriptions.Item label="Meeting Link">
                                    <a
                                      href={interview.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Join Meeting
                                    </a>
                                  </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Interviewers">
                                  {allRecruiters ? (
                                    <List
                                      size="small"
                                      dataSource={interview?.interviewerIds?.map(
                                        (id) =>
                                          allRecruiters.otherRecruiters.find(
                                            (r) => r._id === id
                                          )
                                      )}
                                      renderItem={(recruiter) => (
                                        <List.Item>
                                          <List.Item.Meta
                                            avatar={
                                              <Avatar
                                                src={recruiter?.image}
                                                size="small"
                                              />
                                            }
                                            title={
                                              recruiter?.fullName || "Unknown"
                                            }
                                            description={
                                              recruiter?.specialization
                                            }
                                          />
                                        </List.Item>
                                      )}
                                    />
                                  ) : (
                                    <Text>Loading interviewers...</Text>
                                  )}
                                </Descriptions.Item>
                                {interview.notes && (
                                  <Descriptions.Item label="Notes">
                                    {interview.notes}
                                  </Descriptions.Item>
                                )}
                                {interview.remarks && (
                                  <Descriptions.Item label="Remarks">
                                    {interview.remarks}
                                  </Descriptions.Item>
                                )}
                              </Descriptions>

                              <div
                                style={{
                                  marginTop: 16,
                                  display: "flex",
                                  gap: 8,
                                }}
                              >
                                {/* Show Cancel only before interview is taken */}
                                {interview.status === "scheduled" && (
                                  <Button
                                    danger
                                    onClick={() =>
                                      handleChangeInterviewStatus(
                                        "interview_cancelled",
                                        interview._id
                                      )
                                    }
                                    loading={isChangingStatus}
                                  >
                                    Cancel
                                  </Button>
                                )}

                                {/* After interviewer gives result */}
                                {interview.status === "pass" && (
                                  <Button
                                    type="primary"
                                    style={{ background: "#da2c46" }}
                                    onClick={() =>
                                      handleChangeInterviewStatus(
                                        "interview_completed",
                                        interview._id
                                      )
                                    }
                                    loading={isChangingStatus}
                                  >
                                    Mark as Completed
                                  </Button>
                                )}

                                {interview.status === "fail" && (
                                  <Button
                                    danger
                                    onClick={() =>
                                      handleChangeInterviewStatus(
                                        "interview_rejected",
                                        interview._id
                                      )
                                    }
                                    loading={isChangingStatus}
                                  >
                                    Reject
                                  </Button>
                                )}

                                {interview.status === "interview_hold" && (
                                  <Tag color="orange">
                                    Waiting for interviewer’s final decision
                                  </Tag>
                                )}
                              </div>
                            </Panel>
                          ))}
                        </Collapse>
                      ) : (
                        <Empty
                          description={
                            selectedCandidate.status === "interview"
                              ? "No interviews scheduled yet"
                              : "No interviews were scheduled for this candidate"
                          }
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                          {selectedCandidate.status === "interview" && (
                            <Button
                              type="primary"
                              onClick={() =>
                                setScheduleInterviewModalVisible(true)
                              }
                            >
                              Schedule Interview
                            </Button>
                          )}
                        </Empty>
                      )}
                    </TabPane>
                  )}

                  {hasPermission("view-offer-details") && (candidate.status === "offer_pending" ||
                    candidate.status === "offer_revised" ||
                    candidate.status === "offer") && (
                    <TabPane tab="Offer Details" key="offer">
                      <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Status">
                          <Tag
                            color={
                              candidate.status === "offer_pending"
                                ? "orange"
                                : candidate.status === "offer"
                                ? "green"
                                : candidate.status === "offer_revised"
                                ? "blue"
                                : "default"
                            }
                          >
                            {candidate.status}
                          </Tag>
                        </Descriptions.Item>

                        {candidate.offerDetails?.[0]?.currentStatus && (
                          <Descriptions.Item label="Candidate Response">
                            <Tag
                              color={
                                candidate.offerDetails[0].currentStatus ===
                                "offer-accepted"
                                  ? "green"
                                  : candidate.offerDetails[0].currentStatus ===
                                    "offer-rejected"
                                  ? "red"
                                  : candidate.offerDetails[0].currentStatus ===
                                    "offer-revised"
                                  ? "blue"
                                  : "default"
                              }
                            >
                              {candidate.offerDetails[0].currentStatus}
                            </Tag>
                          </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Description">
                          {candidate.offerDetails?.[0]?.description || "N/A"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Offer Letter">
                          {candidate.offerDetails?.[0]?.offerDocument
                            ?.fileUrl ? (
                            <a
                              href={
                                candidate?.offerDetails[0]?.offerDocument
                                  ?.fileUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              {candidate?.offerDetails[0]?.offerDocument
                                ?.fileName || "Download Offer Letter"}
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </Descriptions.Item>

                        <Descriptions.Item label="Signed Offer Letter">
                          {candidate.offerDetails?.[0]?.offerDocument
                            ?.fileUrl ? (
                            <a
                              href={
                                candidate?.offerDetails[0]?.signedOfferDocument
                                  ?.fileUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              {candidate?.offerDetails[0]?.signedOfferDocument
                                ?.fileName || "Download Offer Letter"}
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </Descriptions.Item>

                        {candidate.offerDetails?.[0]?.statusHistory?.length >
                          0 && (
                          <Descriptions.Item label="Status History">
                            <Collapse>
                              {candidate.offerDetails[0].statusHistory.map(
                                (history, index) => (
                                  <Panel
                                    header={`${history.status} - ${new Date(
                                      history.changedAt
                                    ).toLocaleString()}`}
                                    key={index}
                                  >
                                    <Text strong>Status: </Text>
                                    <Tag
                                      color={
                                        history.status === "offer-accepted"
                                          ? "green"
                                          : history.status === "offer-rejected"
                                          ? "red"
                                          : history.status === "offer-revised"
                                          ? "blue"
                                          : "default"
                                      }
                                    >
                                      {history.status}
                                    </Tag>
                                    <br />
                                    <Text strong>Description: </Text>
                                    <Text>{history.description}</Text>
                                    <br />
                                    <Text strong>Changed at: </Text>
                                    <Text>
                                      {new Date(
                                        history.changedAt
                                      ).toLocaleString()}
                                    </Text>
                                  </Panel>
                                )
                              )}
                            </Collapse>
                          </Descriptions.Item>
                        )}
                      </Descriptions>

                      <div style={{ marginTop: 16 }}>
                        {(candidate.status === "offer_pending" ||
                          candidate.status === "offer_revised") && (
                          <>
                            <Button
                              onClick={() => {
                                setOfferAction("revise");
                                setOfferModalVisible(true);
                                offerForm.setFieldsValue({
                                  description:
                                    candidate.offerDetails?.[0]?.description,
                                });
                              }}
                              style={{ marginRight: 8 }}
                            >
                              Revise Offer
                            </Button>

                            <Button
                              type="primary"
                              style={{ marginRight: 8 }}
                              onClick={() => handleMoveToOffer(candidate)}
                            >
                              Move to Offer
                            </Button>

                            <Button
                              danger
                              onClick={() => handleRejectCandidate(candidate)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {candidate.status === "offer" && <></>}
                      </div>
                    </TabPane>
                  )}

                  { hasPermission("view-pipeline") && selectedCandidate.status === "offer" && (
                    <TabPane tab="Pipeline" key="2">
                      <div style={{ padding: 16 }}>
                        <Title level={4}>Pipeline Information</Title>

                        {/* Pipeline Details */}
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>Work Order Pipeline: </Text>
                          <Text>
                            {selectedCandidate.workOrder?.pipelineName ||
                              "Not assigned"}
                          </Text>
                          <br />

                          <Card
                            size="small"
                            style={{
                              marginTop: 8,
                              background: "#f9f9f9",
                              border: "1px dashed #1890ff",
                              borderRadius: 8,
                            }}
                          >
                            {candidate?.tagPipelineId ? (
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <Text strong>Tagged Pipeline:</Text>
                                    <br />
                                    <Text>
                                      {activePipelines.find(
                                        (p) => p._id === candidate.tagPipelineId
                                      )?.name || "Loading..."}
                                    </Text>
                                  </div>
                                  <Button
                                    type="default"
                                    size="small"
                                    onClick={handleChangePipeline}
                                  >
                                    Change Pipeline
                                  </Button>
                                </div>
                                {activePipelines.find(
                                  (p) => p._id === candidate.tagPipelineId
                                ) && (
                                  <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() =>
                                      handleTagPipelineClick(
                                        activePipelines.find(
                                          (p) =>
                                            p._id === candidate.tagPipelineId
                                        )
                                      )
                                    }
                                  >
                                    Configure Pipeline Details
                                  </Button>
                                )}
                              </Space>
                            ) : (
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                              >
                                <Text type="secondary">
                                  No separate pipeline tagged.
                                </Text>
                                {/* <Button
                                  type="primary"
                                  size="small"
                                  onClick={handleChangePipeline}
                                >
                                  Tag a Pipeline
                                </Button> */}
                              </Space>
                            )}
                          </Card>
                        </div>

                        {activePipelines.find(
                          (p) => p._id === candidate.tagPipelineId
                        )?.stages && (
                          <div style={{ marginBottom: 16 }}>
                            <Title level={5}>Pipeline Stages</Title>
                            <List
                              dataSource={
                                activePipelines.find(
                                  (p) => p._id === candidate.tagPipelineId
                                )?.stages || []
                              }
                              renderItem={(stage, index) => (
                                <List.Item>
                                  <List.Item.Meta
                                    title={`${index + 1}. ${stage.name}`}
                                    description={
                                      <>
                                        {stage.description && (
                                          <div>{stage.description}</div>
                                        )}
                                        {stage.requiredDocuments?.length >
                                          0 && (
                                          <div style={{ marginTop: 8 }}>
                                            <Text strong>
                                              Required Documents:{" "}
                                            </Text>
                                            {stage.requiredDocuments.map(
                                              (doc, docIndex) => (
                                                <Tag
                                                  key={docIndex}
                                                  size="small"
                                                >
                                                  {doc}
                                                </Tag>
                                              )
                                            )}
                                          </div>
                                        )}
                                        <div style={{ marginTop: 4 }}>
                                          <Text type="secondary">
                                            Dependency: {stage.dependencyType}
                                          </Text>
                                        </div>
                                      </>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          </div>
                        )}

                        <Divider />

                        <Title level={5}>Move to Pipeline</Title>
                        <Text
                          type="secondary"
                          style={{ marginBottom: 16, display: "block" }}
                        >
                          Move this candidate to the pipeline stage to complete
                          all required stages before converting to employee.
                        </Text>

                        {/* Pipeline Action Buttons */}
                        <Space>
                          {candidate?.tagPipelineId ? (
                            <>
                              <Button
                                type="primary"
                                style={{ background: "#da2c46" }}
                                icon={<ArrowRightOutlined />}
                                onClick={handleMoveToSeparatePipeline}
                              >
                                Move to Tagged Pipeline
                              </Button>
                              <Button
                                type="primary"
                                style={{ background: "#da2c46" }}
                                icon={<ArrowRightOutlined />}
                                onClick={() =>
                                  handleMoveCandidateToPipeline(
                                    selectedCandidate
                                  )
                                }
                              >
                                Move to Work Order Pipeline
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="primary"
                              style={{ background: "#da2c46" }}
                              icon={<ArrowRightOutlined />}
                              onClick={() =>
                                handleMoveCandidateToPipeline(selectedCandidate)
                              }
                            >
                              Move to Work Order Pipeline
                            </Button>
                          )}
                        </Space>
                      </div>
                    </TabPane>
                  )}
                </Tabs>
              </div>
            )}
          </>
        ) : (
          <Empty description="No candidate details found" />
        )}
      </Drawer>

      {/* Message Modal */}
      <Modal
        title={`Message ${selectedCandidate?.name}`}
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={messageForm}
          layout="vertical"
          initialValues={{
            subject: `Regarding your application for ${selectedCandidate?.position}`,
          }}
        >
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter a subject" }]}
          >
            <Input placeholder="Enter subject" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea rows={6} placeholder="Type your message here" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setMessageModalVisible(false);
                  messageForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={buttonStyle}
                onClick={() => {
                  messageForm
                    .validateFields()
                    .then((values) => {
                      // Handle message sending
                      message.success("Message sent successfully!");
                      setMessageModalVisible(false);
                      messageForm.resetFields();
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
              >
                Send Message
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        title={`${
          interviewToReschedule ? "Reschedule" : "Schedule New"
        } Interview`}
        open={scheduleInterviewModalVisible}
        onCancel={() => {
          setScheduleInterviewModalVisible(false);
          form.resetFields();
          setInterviewToReschedule(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setScheduleInterviewModalVisible(false);
              form.resetFields();
              setInterviewToReschedule(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={buttonStyle}
            onClick={() => form.submit()}
            loading={isSchedulingInterview}
          >
            {interviewToReschedule ? "Reschedule" : "Schedule"} Interview
          </Button>,
        ]}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: "online",
          }}
          onFinish={async (values) => {
            await handleScheduleInterviewSubmit(values, selectedCandidate._id);
          }}
        >
          <Form.Item
            label="Interview Title"
            name="title"
            rules={[
              { required: true, message: "Please enter interview title" },
            ]}
          >
            <Input placeholder="e.g. Technical Interview, HR Round, etc." />
          </Form.Item>
          <Form.Item
            label="Interview Type"
            name="type"
            rules={[
              { required: true, message: "Please select interview type" },
            ]}
          >
            <Select placeholder="Select interview type">
              <Option value="online">Online (Video Call)</Option>
              <Option value="telephonic">Telephonic</Option>
              <Option value="in-person">In Person</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "online" ? (
                <Form.Item
                  label="Meeting Link"
                  name="meetingLink"
                  rules={[
                    {
                      type: "url",
                      message: "Please enter a valid URL",
                    },
                  ]}
                >
                  <Input placeholder="Enter Google Meet or Zoom link" />
                </Form.Item>
              ) : getFieldValue("type") === "in-person" ? (
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[
                    {
                      required: true,
                      message: "Please enter interview location",
                    },
                  ]}
                >
                  <Input placeholder="Enter office address or location" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            label="Interview Date & Time"
            name="datetime"
            rules={[{ required: true, message: "Please select date and time" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            label="Interviewers"
            name="interviewers"
            rules={[
              {
                required: true,
                message: "Please select at least one interviewer",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select interviewers"
              loading={!allRecruiters}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {allRecruiters?.otherRecruiters?.map((recruiter) => (
                <Option
                  key={recruiter._id}
                  value={recruiter._id}
                  label={`${recruiter.fullName || ""} (${
                    recruiter.specialization || ""
                  })`}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      size="small"
                      style={{ marginRight: 8, backgroundColor: "#f56a00" }}
                    >
                      {recruiter.fullName?.charAt(0) || "?"}
                    </Avatar>
                    <div>
                      <Text strong>{recruiter.fullName || "Unknown"}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {recruiter.specialization || "No specialization"} •{" "}
                        {recruiter.email || "No email"}
                      </Text>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Additional Notes" name="notes">
            <Input.TextArea
              rows={4}
              placeholder="Add any additional notes or instructions"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Pipeline Details - ${selectedPipeline?.name || ""}`}
        open={pipelineModalVisible}
        onCancel={() => {
          setPipelineModalVisible(false);
          setSelectedPipeline(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setPipelineModalVisible(false);
              setSelectedPipeline(null);
            }}
          >
            Close
          </Button>,
          <Button
            key="setStages"
            type="primary"
            style={{ background: "#da2c46" }}
            onClick={() => {
              message.success("Pipeline details saved successfully");
              setPipelineModalVisible(false);
              setSelectedPipeline(null);
            }}
          >
            Save Changes
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
        {selectedPipeline && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Title level={4}>{selectedPipeline.name}</Title>
              <Tag
                color={
                  selectedPipeline.pipelineStatus === "active" ? "green" : "red"
                }
              >
                {selectedPipeline.pipelineStatus}
              </Tag>
            </div>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => addCustomStage(selectedPipeline._id)}
              style={{ marginBottom: 16 }}
            >
              Add Custom Stage
            </Button>

            <List
              dataSource={[
                ...(selectedPipeline.stages || []).map((s) => ({
                  ...s,
                  isCustom: false,
                })),
                ...(customStages[selectedPipeline._id] || []).map((s) => ({
                  ...s,
                  isCustom: true,
                })),
              ]}
              renderItem={(stage, index) => {
                const stageId = stage._id || stage.id;
                const dateEntry = pipelineStageDates[
                  selectedPipeline._id
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
                                  selectedPipeline._id,
                                  stageId,
                                  {
                                    name: e.target.value,
                                  }
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
                        {stage.isCustom && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              removeCustomStage(selectedPipeline._id, stageId)
                            }
                          />
                        )}
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
                      handleDrop(e, stage, selectedPipeline._id)
                    }
                  >
                    <Row gutter={[16, 16]} align="bottom">
                      <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item
                          label="Start Date"
                          style={{ marginBottom: 0 }}
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
                                selectedPipeline._id,
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
                              dateEntry?.endDate
                                ? dayjs(dateEntry.endDate)
                                : null
                            }
                            onChange={(date) =>
                              handleStageDateChange(
                                selectedPipeline._id,
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
                              handleDependencyTypeChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
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
                            value={
                              stageRecruiterAssignments[selectedPipeline._id]?.[
                                stageId
                              ] || []
                            }
                            onChange={(value) =>
                              handleRecruiterAssignmentChange(
                                selectedPipeline._id,
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
                            {allRecruiters?.otherRecruiters?.map(
                              (recruiter) => (
                                <Option
                                  key={recruiter._id}
                                  value={recruiter._id}
                                >
                                  {recruiter.fullName || recruiter.email}
                                </Option>
                              )
                            )}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item
                          label="Assigned Staff"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            mode="multiple"
                            value={
                              stageStaffAssignments[selectedPipeline._id]?.[
                                stageId
                              ] || []
                            }
                            onChange={(value) =>
                              handleStaffAssignmentChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
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
                        <Form.Item
                          label="Approval Level"
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            style={{ width: "100%" }}
                            size="small"
                            placeholder="Select approval level"
                            value={dateEntry?.approvalId || undefined}
                            onChange={(value) =>
                              handleLevelChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
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

                    <Divider
                      orientation="left"
                      plain
                      style={{ margin: "16px 0" }}
                    >
                      Stage Requirements
                    </Divider>

                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={12}>
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          block
                          onClick={() =>
                            addStageCustomField(selectedPipeline._id, stageId)
                          }
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
                            addStageRequiredDocument(
                              selectedPipeline._id,
                              stageId
                            )
                          }
                        >
                          Add Required Document
                        </Button>
                      </Col>
                    </Row>

                    {stageCustomFields[selectedPipeline._id]?.[stageId]
                      ?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h4>Custom Fields:</h4>
                        {stageCustomFields[selectedPipeline._id][stageId].map(
                          (field) => (
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
                                      selectedPipeline._id,
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
                                        selectedPipeline._id,
                                        stageId,
                                        field.id,
                                        {
                                          label: e.target.value,
                                        }
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
                                        selectedPipeline._id,
                                        stageId,
                                        field.id,
                                        {
                                          type: value,
                                          options: [
                                            "select",
                                            "checkbox",
                                            "radio",
                                          ].includes(value)
                                            ? field.options || [""]
                                            : [],
                                        }
                                      )
                                    }
                                    style={{ width: "100%" }}
                                  >
                                    {fieldTypes.map((type) => (
                                      <Option
                                        key={type.value}
                                        value={type.value}
                                      >
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
                                    selectedPipeline._id,
                                    stageId,
                                    field.id,
                                    {
                                      required: e.target.checked,
                                    }
                                  )
                                }
                                style={{ marginTop: 8 }}
                              >
                                Required
                              </Checkbox>

                              {/* --- OPTIONS BLOCK FOR DROPDOWN / CHECKBOX / RADIO --- */}
                              {["select", "checkbox", "radio"].includes(
                                field.type
                              ) && (
                                <div style={{ marginTop: 12 }}>
                                  <strong>Options:</strong>
                                  {field.options?.map((option, index) => (
                                    <Space
                                      key={index}
                                      style={{
                                        display: "flex",
                                        marginBottom: 8,
                                      }}
                                      align="start"
                                    >
                                      <Input
                                        size="small"
                                        value={option}
                                        onChange={(e) =>
                                          updateFieldOption(
                                            selectedPipeline._id,
                                            stageId,
                                            field.id,
                                            index,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Option ${index + 1}`}
                                      />
                                      <Button
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                          removeFieldOption(
                                            selectedPipeline._id,
                                            stageId,
                                            field.id,
                                            index
                                          )
                                        }
                                      />
                                    </Space>
                                  ))}

                                  <Button
                                    size="small"
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                      addFieldOption(
                                        selectedPipeline._id,
                                        stageId,
                                        field.id
                                      )
                                    }
                                  >
                                    Add Option
                                  </Button>
                                </div>
                              )}
                            </Card>
                          )
                        )}
                      </div>
                    )}

                    {stageRequiredDocuments[selectedPipeline._id]?.[stageId]
                      ?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h4>Required Documents:</h4>
                        {stageRequiredDocuments[selectedPipeline._id][
                          stageId
                        ].map((doc) => (
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
                                    selectedPipeline._id,
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
                                  selectedPipeline._id,
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
              }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title={`${offerAction === "revise" ? "Revise" : "Make"} Offer for ${
          selectedCandidate?.name
        }`}
        open={offerModalVisible}
        onCancel={() => {
          setOfferModalVisible(false);
          offerForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setOfferModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmittingOffer}
            onClick={() => offerForm.submit()}
          >
            {offerAction === "revise" ? "Revise Offer" : "Send Offer"}
          </Button>,
        ]}
      >
        <Form
          form={offerForm}
          layout="vertical"
          onFinish={
            offerAction === "revise" ? handleReviseOffer : handleOfferSubmit
          }
        >
          <Form.Item
            name="description"
            label="Offer Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter offer details" />
          </Form.Item>
          <Form.Item
            label="Offer Letter"
            name="file"
            rules={
              offerAction === "new"
                ? [{ required: true, message: "Please upload offer letter" }]
                : []
            }
          >
            <Upload
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                if (!isPDF) {
                  message.error("You can only upload PDF files!");
                }
                return false;
              }}
              accept=".pdf"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Click to Upload PDF</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Tagged Pipeline"
        open={changePipelineModalVisible}
        onCancel={() => {
          setChangePipelineModalVisible(false);
          setSelectedNewPipeline(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setChangePipelineModalVisible(false);
              setSelectedNewPipeline(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={buttonStyle}
            loading={isUpdatingPipeline}
            onClick={handleUpdatePipeline}
          >
            Update Pipeline
          </Button>,
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Select a new pipeline to tag for {selectedCandidate?.name}
          </Text>
        </div>

        <Form layout="vertical">
          <Form.Item label="Select Pipeline" required>
            <Select
              value={selectedNewPipeline}
              onChange={setSelectedNewPipeline}
              placeholder="Select a pipeline"
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {activePipelines
                .filter((pipeline) => pipeline.pipelineStatus === "active")
                .map((pipeline) => (
                  <Option key={pipeline._id} value={pipeline._id}>
                    <div>
                      <Text strong>{pipeline.name}</Text>
                      {pipeline.description && (
                        <>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {pipeline.description}
                          </Text>
                        </>
                      )}
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {selectedNewPipeline && (
            <Card size="small" style={{ background: "#f9f9f9" }}>
              <Text strong>Pipeline Stages:</Text>
              <List
                size="small"
                dataSource={
                  activePipelines.find((p) => p._id === selectedNewPipeline)
                    ?.stages || []
                }
                renderItem={(stage, index) => (
                  <List.Item>
                    <Text>
                      {index + 1}. {stage.name}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Form>
      </Modal>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default RecruiterCandidates;

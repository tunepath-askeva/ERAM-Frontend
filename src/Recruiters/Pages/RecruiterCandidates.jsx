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
  Alert,
} from "antd";
import { ObjectId } from "bson";
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
  SettingOutlined,
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
  useAcceptOfferOnBehalfOfCandidateMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import SkeletonLoader from "../../Global/SkeletonLoader";
import CandidateModals from "../Components/CandidateModals";
import CandidateDetailsTabs from "../Components/CandidateDetailsTabs";
import CandidatesTable from "../Components/CandidatesTable";

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
  const { enqueueSnackbar } = useSnackbar();
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
  const [universalRecruiterIds, setUniversalRecruiterIds] = useState([]);
  const [applyToAllStages, setApplyToAllStages] = useState(false);
  const [universalStartDate, setUniversalStartDate] = useState(null);
  const [universalEndDate, setUniversalEndDate] = useState(null);
  const [applyDatesToAllStages, setApplyDatesToAllStages] = useState(false);
  const [pipelineAlert, setPipelineAlert] = useState(null);
  const [selectedNewPipeline, setSelectedNewPipeline] = useState(null);
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [convertForm] = Form.useForm();
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerAction, setOfferAction] = useState("new"); // "new" or "revise"
  const [offerForm] = Form.useForm();
  const [acceptOfferModalVisible, setAcceptOfferModalVisible] = useState(false);
  const [acceptOfferForm] = Form.useForm();
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
  const [acceptOfferOnBehalf, { isLoading: isAcceptingOffer }] =
    useAcceptOfferOnBehalfOfCandidateMutation();

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

      enqueueSnackbar(
        `${candidate.name} moved to interview stage successfully!`,
        { variant: "success" }
      );
      refetch();
    } catch (error) {
      enqueueSnackbar(`Failed to move ${candidate.name} to interview stage.`, {
        variant: "error",
      });
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
      enqueueSnackbar("Please Select a pipeline!", { variant: "error" });
      return;
    }

    try {
      await updateTaggedPipeline({
        id: selectedCandidate._id,
        pipelineId: selectedNewPipeline,
      }).unwrap();

      enqueueSnackbar("Pipeline updated successfully!", { variant: "success" });
      setChangePipelineModalVisible(false);

      const newPipeline = activePipelines.find(
        (p) => p._id === selectedNewPipeline
      );

      setSelectedCandidate((prev) => ({
        ...prev,
        tagPipeline: newPipeline,
      }));

      // Refetch both queries
      await refetch();
      await refetchCandidateDetails();
    } catch (error) {
      enqueueSnackbar("Failed to update pipeline", { variant: "error" });
      console.error("Update pipeline error:", error);
    }
  };

  // Helper function to check if signed offer document exists
  const canMoveToOffer = (candidate) => {
    const latestOffer = candidate?.offerDetails?.[0];
    
    // Check if signed offer document exists OR if offer is already accepted
    if (!latestOffer?.signedOfferDocument || !latestOffer.signedOfferDocument.fileUrl) {
      // Also check if offer is already accepted (currentStatus)
      if (latestOffer?.currentStatus === "offer-accepted") {
        return { canMove: true, reason: "" };
      }
      return {
        canMove: false,
        reason: "The candidate has not uploaded the signed offer document yet.",
      };
    }

    return { canMove: true, reason: "" };
  };

  const handleAcceptOfferOnBehalf = async (values) => {
    try {
      if (!selectedCandidate || !candidate) {
        enqueueSnackbar("No candidate selected", { variant: "error" });
        return;
      }

      console.log("📝 Form values received:", {
        hasDescription: !!values.description,
        hasSignedOffer: !!values.signedOffer,
        hasSignedAdditionalDocuments: !!values.signedAdditionalDocuments,
        signedAdditionalDocumentsType: typeof values.signedAdditionalDocuments,
        isArray: Array.isArray(values.signedAdditionalDocuments),
        hasFileList: !!values.signedAdditionalDocuments?.fileList,
      });

      const formData = new FormData();
      formData.append("customFieldId", selectedCandidate._id);
      formData.append("workorderId", candidate.workOrder?._id || selectedCandidate.workOrder?._id);
      formData.append("description", values.description || "");

      // Append the uploaded signed offer file
      if (values.signedOffer) {
        const signedOfferFile = values.signedOffer.originFileObj || values.signedOffer;
        if (signedOfferFile) {
          formData.append("signedOffer", signedOfferFile);
          console.log("Signed offer file appended to FormData");
        } else {
          console.warn("Signed offer file is missing originFileObj");
        }
      }

      // Handle signed additional documents
      // The form uses valuePropName="fileList" so values.signedAdditionalDocuments should be the fileList array
      // But we also handle the case where it might be stored as an object with fileList property
      let fileList = [];
      
      // Try multiple ways to get the fileList
      if (values.signedAdditionalDocuments) {
        if (Array.isArray(values.signedAdditionalDocuments)) {
          // Direct array (expected case with valuePropName="fileList")
          fileList = values.signedAdditionalDocuments;
        } else if (values.signedAdditionalDocuments.fileList && Array.isArray(values.signedAdditionalDocuments.fileList)) {
          // Object with fileList property
          fileList = values.signedAdditionalDocuments.fileList;
        }
      }
      
      // Fallback: Try to get from form field directly if not found in values
      if (!fileList || fileList.length === 0) {
        const formFieldValue = acceptOfferForm.getFieldValue("signedAdditionalDocuments");
        if (formFieldValue) {
          if (Array.isArray(formFieldValue)) {
            fileList = formFieldValue;
          } else if (formFieldValue.fileList && Array.isArray(formFieldValue.fileList)) {
            fileList = formFieldValue.fileList;
          }
        }
        console.log("🔄 Using fallback to get fileList from form field:", {
          hasFormFieldValue: !!formFieldValue,
          formFieldValueType: typeof formFieldValue,
          isArray: Array.isArray(formFieldValue),
          hasFileList: !!formFieldValue?.fileList,
          fileListLength: fileList.length,
        });
      }
      
      console.log("📋 Final fileList extracted:", {
        fileListLength: fileList.length,
        fileList: fileList.map((f, i) => ({
          index: i,
          name: f?.name,
          hasOriginFileObj: !!f?.originFileObj,
          originFileObjType: f?.originFileObj?.constructor?.name,
        })),
      });
      
      if (fileList && fileList.length > 0) {
        const latestOffer = candidate?.offerDetails?.[0];
        console.log(`📋 Processing ${fileList.length} signed additional document(s)`);
        console.log("📄 Latest offer additional documents:", latestOffer?.additionalDocuments);
        console.log("📦 File list details:", fileList.map((f, i) => ({
          index: i,
          name: f.name,
          hasOriginFileObj: !!f.originFileObj,
          hasFile: !!f,
          type: f.type,
          uid: f.uid,
        })));
        
        if (latestOffer?.additionalDocuments && latestOffer.additionalDocuments.length > 0) {
          let appendedCount = 0;
          fileList.forEach((file, index) => {
            console.log(`🔍 Processing file at index ${index}:`, {
              file: file,
              fileType: typeof file,
              hasOriginFileObj: !!file?.originFileObj,
              originFileObjType: file?.originFileObj?.constructor?.name,
              isFile: file instanceof File,
              fileKeys: file ? Object.keys(file) : [],
            });
            
            // Get the actual file object - check multiple possible locations
            // This matches the candidate side implementation
            let fileObj = null;
            
            // Primary: Check originFileObj (most common case when beforeUpload returns false)
            if (file?.originFileObj) {
              if (file.originFileObj instanceof File) {
                fileObj = file.originFileObj;
                console.log(`  ✅ Found file in originFileObj: ${fileObj.name}`);
              } else {
                console.warn(`  ⚠️ originFileObj exists but is not a File:`, file.originFileObj);
              }
            } 
            // Fallback: Check if file itself is a File
            else if (file instanceof File) {
              fileObj = file;
              console.log(`  ✅ File itself is a File: ${fileObj.name}`);
            } 
            // Fallback: Check nested file property
            else if (file?.file && file.file instanceof File) {
              fileObj = file.file;
              console.log(`  ✅ Found file in file.file: ${fileObj.name}`);
            }
            // Additional fallback: Check if file has a raw property
            else if (file?.raw && file.raw instanceof File) {
              fileObj = file.raw;
              console.log(`  ✅ Found file in file.raw: ${fileObj.name}`);
            }
            
            // Only process if we have a valid File object and a corresponding original document
            if (fileObj instanceof File && latestOffer.additionalDocuments[index]) {
              const originalDoc = latestOffer.additionalDocuments[index];
              const originalDocName = originalDoc.documentName || originalDoc.fileName || `Document${index + 1}`;
              // Clean the document name to use as field name (replace special chars with underscore)
              const cleanDocName = originalDocName.replace(/[^a-zA-Z0-9]/g, '_');
              
              // Append file to FormData with proper field name (matching candidate side)
              formData.append(`signedAdditionalDoc_${cleanDocName}`, fileObj);
              appendedCount++;
              console.log(`✅ Appended signed additional document ${index + 1}:`, {
                fieldName: `signedAdditionalDoc_${cleanDocName}`,
                originalName: originalDocName,
                fileName: fileObj.name,
                fileSize: fileObj.size,
                fileType: fileObj.type,
              });
            } else {
              console.warn(`❌ Skipping file at index ${index}:`, {
                hasFileObj: !!fileObj,
                isFileInstance: fileObj instanceof File,
                hasOriginalDoc: !!latestOffer.additionalDocuments[index],
                fileDetails: {
                  hasOriginFileObj: !!file?.originFileObj,
                  originFileObjType: file?.originFileObj?.constructor?.name,
                  isFile: file instanceof File,
                  hasFile: !!file?.file,
                  hasRaw: !!file?.raw,
                  fileType: typeof file,
                  fileKeys: file ? Object.keys(file) : [],
                },
              });
            }
          });
          console.log(`📤 Successfully appended ${appendedCount} out of ${fileList.length} signed additional document(s) to FormData`);
          
          // Log FormData contents for debugging
          const formDataEntries = Array.from(formData.entries());
          console.log("📋 FormData entries:", formDataEntries.map(([key, value]) => ({
            key,
            valueType: value instanceof File ? `File: ${value.name} (${value.size} bytes, ${value.type})` : String(value).substring(0, 50),
          })));
          console.log(`📊 Total FormData entries: ${formDataEntries.length}`);
        } else {
          console.warn("⚠️ No additional documents found in offer details to match signed documents against");
        }
      } else {
        console.log("ℹ️ No signed additional documents to process", {
          hasValue: !!values.signedAdditionalDocuments,
          valueType: typeof values.signedAdditionalDocuments,
          isArray: Array.isArray(values.signedAdditionalDocuments),
          hasFileList: !!values.signedAdditionalDocuments?.fileList,
          fileListLength: values.signedAdditionalDocuments?.fileList?.length,
        });
      }

      await acceptOfferOnBehalf(formData).unwrap();

      // Get candidate name with fallback
      const candidateName = candidate?.name || selectedCandidate?.name || "Candidate";

      enqueueSnackbar(`Offer accepted successfully on behalf of ${candidateName}!`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      setAcceptOfferModalVisible(false);
      acceptOfferForm.resetFields();
      
      // Refetch data to get updated candidate information
      await refetch();
      await refetchCandidateDetails();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Failed to accept offer on behalf of candidate",
        { variant: "error" }
      );
      console.error("Accept offer error:", error);
    }
  };

  const handleMoveToOffer = async (candidate) => {
    try {
      // Validate signed document before proceeding
      const validation = canMoveToOffer(candidate);
      
      if (!validation.canMove) {
        enqueueSnackbar(
          `Cannot move to offer status. ${validation.reason} Please wait for the candidate to upload the signed offer document.`,
          {
            variant: "error",
            autoHideDuration: 5000,
          }
        );
        return;
      }

      // Get candidate name with fallback
      const candidateName = candidate?.name || selectedCandidate?.name || "Candidate";

      const response = await moveToNextStage({
        id: candidate._id,
        status: "offer",
      }).unwrap();

      // Show success message
      enqueueSnackbar(`${candidateName} moved to offer stage successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });

      // Refetch data to get updated candidate information
      await refetch();
      await refetchCandidateDetails();

      // Close the drawer to ensure fresh data is loaded when reopened
      // This allows the user to see the updated status in the list
      setCandidateDrawerVisible(false);
    } catch (error) {
      const candidateName = candidate?.name || selectedCandidate?.name || "Candidate";
      enqueueSnackbar(
        error?.data?.message || `Failed to move ${candidateName} to offer stage.`,
        {
          variant: "error",
          autoHideDuration: 5000,
        }
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

      // Handle additional documents
      if (values.additionalDocuments?.fileList) {
        values.additionalDocuments.fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("additionalDocuments", file.originFileObj);
          }
        });
      }

      await offerInfo({ id: selectedCandidate._id, formData }).unwrap();

      enqueueSnackbar("Offer sent successfully!", { variant: "success" });
      setOfferModalVisible(false);
      offerForm.resetFields();
      await Promise.all([refetch(), refetchCandidateDetails()]);
    } catch (err) {
      console.error("Offer submission error:", err);
      enqueueSnackbar(err?.data?.message || "Failed to send offer", {
        variant: "error",
      });
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

      // Handle additional documents
      if (values.additionalDocuments?.fileList) {
        values.additionalDocuments.fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("additionalDocuments", file.originFileObj);
          }
        });
      }

      await offerInfo({ id: selectedCandidate._id, formData }).unwrap();

      enqueueSnackbar("Offer revised successfully!", { variant: "success" });
      setOfferModalVisible(false);
      offerForm.resetFields();
      await Promise.all([refetch(), refetchCandidateDetails()]);
    } catch (err) {
      enqueueSnackbar(err?.data?.message || "Failed to revise offer", {
        variant: "error",
      });
    }
  };

  const handleFinalizeOffer = async () => {
    try {
      const formData = new FormData();
      formData.append("status", "offer"); // final

      await offerInfo({ id: selectedCandidate._id, formData }).unwrap();

      enqueueSnackbar("Offer finalized!", { variant: "success" });
      await refetch();
      await refetchCandidateDetails();
    } catch (err) {
      enqueueSnackbar("Failed to finalize offer", { variant: "error" });
    }
  };

  const handleRejectCandidate = async (candidate) => {
    try {
      const response = await moveToNextStage({
        id: candidate._id,
        status: "rejected",
      }).unwrap();

      enqueueSnackbar(`${candidate.name} has been rejected.`, {
        variant: "success",
      });
      await refetch();
    } catch (error) {
      enqueueSnackbar(`Failed to reject ${candidate.name}.`, {
        variant: "error",
      });
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

      enqueueSnackbar(`Interview ${status.replace("_", " ")} successfully!`, {
        variant: "success",
      });
      await refetch();
      await refetchCandidateDetails();

      setCandidateDrawerVisible(false);

      setSelectedCandidate(null);

      setScheduleInterviewModalVisible(false);
    } catch (error) {
      enqueueSnackbar(`Failed to update interview status: ${error.message}`, {
        variant: "error",
      });
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

      enqueueSnackbar(
        interviewToReschedule
          ? "Interview rescheduled successfully!"
          : "Interview scheduled successfully!",
        { variant: "success" }
      );

      setScheduleInterviewModalVisible(false);
      form.resetFields();
      setInterviewToReschedule(null);
      await refetch();
      await refetchCandidateDetails();
    } catch (error) {
      enqueueSnackbar("Failed to schedule interview", { variant: "error" });
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
          const validation = canMoveToOffer(candidate);
          actions.push({
            key: "move-to-offer",
            label: validation.canMove
              ? "Move to Offer"
              : `Move to Offer (${validation.reason})`,
            icon: <CheckOutlined style={iconTextStyle} />,
            onClick: () => handleMoveToOffer(candidate),
            style: validation.canMove ? { color: "#52c41a" } : { color: "#8c8c8c" },
            disabled: !validation.canMove,
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
          const validation = canMoveToOffer(candidate);
          actions.push({
            key: "move-to-offer",
            label: validation.canMove
              ? "Move to Offer"
              : `Move to Offer (${validation.reason})`,
            icon: <CheckOutlined style={iconTextStyle} />,
            onClick: () => handleMoveToOffer(candidate),
            style: validation.canMove ? { color: "#52c41a" } : { color: "#8c8c8c" },
            disabled: !validation.canMove,
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
      enqueueSnackbar(
        `${candidate.name} moved to Work Order pipeline successfully!`,
        { variant: "success" }
      );
      setCandidateDrawerVisible(false);
      refetch();
    } catch (error) {
      console.error("Failed to move to work order pipeline:", error);
      enqueueSnackbar(
        `Failed to move ${candidate.name} to work order pipeline.`,
        { variant: "error" }
      );
    }
  };

  const handleMoveToSeparatePipeline = async () => {
    try {
      if (!selectedCandidate || !selectedCandidate.tagPipeline) {
        message.warning("No tagged pipeline found for this candidate");
        return;
      }

      const pipelineId = selectedCandidate.tagPipeline._id;
      const jobId = selectedCandidate.workOrder._id;
      const userId = selectedCandidate.candidateId;

      const defaultStages = selectedCandidate.tagPipeline.stages || [];
      const customStagesList = customStages[pipelineId] || [];
      const allStages = [...defaultStages, ...customStagesList];

      const isConfigured = allStages.some((stage) => {
        const stageDate =
          (pipelineStageDates[pipelineId] || []).find(
            (d) => d.stageId === (stage._id || stage.id)
          ) || {};
        return stageDate.startDate || stageDate.endDate;
      });

      if (!isConfigured) {
        setPipelineAlert({
          type: "warning",
          message:
            "Please configure the pipeline details before moving the candidate.",
        });
        return;
      }

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

      enqueueSnackbar(
        `${selectedCandidate.name} moved to ${selectedCandidate.tagPipeline.name} successfully`,
        { variant: "success" }
      );
      refetch();
      setCandidateDrawerVisible(false);
      setPipelineModalVisible(false);
    } catch (error) {
      console.error("Failed to move candidate to tagged pipeline:", error);
      enqueueSnackbar(
        error.data?.message || "Failed to move candidate to tagged pipeline",
        { variant: "error" }
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
    enqueueSnackbar("Message sent successfully!", { variant: "success" });
  };

  const handleDownloadResume = (candidate) => {
    if (candidate.stageProgress?.length > 0) {
      const firstStage = candidate.stageProgress[0];
      if (firstStage.uploadedDocuments?.length > 0) {
        const document = firstStage.uploadedDocuments[0];
        window.open(document?.fileUrl, "_blank");
        enqueueSnackbar(`Downloading ${document.fileName}...`, {
          variant: "info",
        });
        return;
      }
    }
    enqueueSnackbar("No documents available for download", {
      variant: "warning",
    });
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

  const handleUniversalRecruiterChange = (recruiterIds) => {
    setUniversalRecruiterIds(recruiterIds);
  };

  const handleApplyToAllStagesChange = (e) => {
    setApplyToAllStages(e.target.checked);
  };

  const handleApplyUniversalRecruiters = () => {
    if (!selectedPipeline) return;

    const allStages = [
      ...(selectedPipeline.stages || []),
      ...(customStages[selectedPipeline._id] || []),
    ];

    allStages.forEach((stage) => {
      const stageId = stage._id || stage.id;
      handleRecruiterAssignmentChange(
        selectedPipeline._id,
        stageId,
        universalRecruiterIds
      );
    });

    enqueueSnackbar(
      `Applied ${universalRecruiterIds.length} recruiter(s) to all ${allStages.length} stages`,
      { variant: "success" }
    );
  };

  const handleApplyUniversalDates = () => {
    if (!selectedPipeline) return;

    const allStages = [
      ...(selectedPipeline.stages || []),
      ...(customStages[selectedPipeline._id] || []),
    ];

    allStages.forEach((stage) => {
      const stageId = stage._id || stage.id;
      if (universalStartDate) {
        handleStageDateChange(
          selectedPipeline._id,
          stageId,
          "startDate",
          universalStartDate
        );
      }
      if (universalEndDate) {
        handleStageDateChange(
          selectedPipeline._id,
          stageId,
          "endDate",
          universalEndDate
        );
      }
    });

    enqueueSnackbar(`Applied dates to all ${allStages.length} stages`, {
      variant: "success",
    });
  };

  // Add these functions to the component
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
      id: new ObjectId().toString(),
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
      <CandidatesTable
        candidates={candidates}
        filteredCandidates={filteredCandidates}
        isLoading={isLoading}
        tablePagination={tablePagination}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        selectedStatus={selectedStatus}
        handleStatusChange={handleStatusChange}
        filterCounts={filterCounts}
        hasPermission={hasPermission}
        statusConfig={statusConfig}
        iconTextStyle={iconTextStyle}
        columns={columns}
        tabItems={tabItems}
        getAvailableActions={getAvailableActions}
        handleViewProfile={handleViewProfile}
        handleSendMessage={handleSendMessage}
        handleDownloadResume={handleDownloadResume}
        CandidateCard={CandidateCard}
      />

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

                <CandidateDetailsTabs
                  candidate={candidate}
                  selectedCandidate={selectedCandidate}
                  hasPermission={hasPermission}
                  allRecruiters={allRecruiters}
                  isChangingStatus={isChangingStatus}
                  handleChangeInterviewStatus={handleChangeInterviewStatus}
                  handleRescheduleInterview={handleRescheduleInterview}
                  setScheduleInterviewModalVisible={setScheduleInterviewModalVisible}
                  interviewForm={form}
                  canMoveToOffer={canMoveToOffer}
                  handleMoveToOffer={handleMoveToOffer}
                  handleRejectCandidate={handleRejectCandidate}
                  setOfferAction={setOfferAction}
                  setOfferModalVisible={setOfferModalVisible}
                  offerForm={offerForm}
                  setAcceptOfferModalVisible={setAcceptOfferModalVisible}
                  acceptOfferForm={acceptOfferForm}
                  pipelineAlert={pipelineAlert}
                  setPipelineAlert={setPipelineAlert}
                  activePipelines={activePipelines}
                  handleChangePipeline={handleChangePipeline}
                  handleTagPipelineClick={handleTagPipelineClick}
                  handleMoveToSeparatePipeline={handleMoveToSeparatePipeline}
                  handleMoveCandidateToPipeline={handleMoveCandidateToPipeline}
                  levelGroups={levelGroups}
                  staffs={staffs}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description="No candidate details found" />
        )}
      </Drawer>

      {/* All Modals */}
      <CandidateModals
        messageModalVisible={messageModalVisible}
        setMessageModalVisible={setMessageModalVisible}
        messageForm={messageForm}
        buttonStyle={buttonStyle}
        selectedCandidate={selectedCandidate}
        scheduleInterviewModalVisible={scheduleInterviewModalVisible}
        setScheduleInterviewModalVisible={setScheduleInterviewModalVisible}
        interviewForm={form}
        interviewToReschedule={interviewToReschedule}
        setInterviewToReschedule={setInterviewToReschedule}
        handleScheduleInterviewSubmit={handleScheduleInterviewSubmit}
        isSchedulingInterview={isSchedulingInterview}
        allRecruiters={allRecruiters}
        selectedCandidateForInterview={selectedCandidate}
        pipelineModalVisible={pipelineModalVisible}
        setPipelineModalVisible={setPipelineModalVisible}
        selectedPipeline={selectedPipeline}
        setSelectedPipeline={setSelectedPipeline}
        enqueueSnackbar={enqueueSnackbar}
        universalRecruiterIds={universalRecruiterIds}
        setUniversalRecruiterIds={setUniversalRecruiterIds}
        universalStartDate={universalStartDate}
        setUniversalStartDate={setUniversalStartDate}
        universalEndDate={universalEndDate}
        setUniversalEndDate={setUniversalEndDate}
        applyDatesToAllStages={applyDatesToAllStages}
        setApplyDatesToAllStages={setApplyDatesToAllStages}
        handleUniversalRecruiterChange={handleUniversalRecruiterChange}
        handleApplyUniversalRecruiters={handleApplyUniversalRecruiters}
        handleApplyUniversalDates={handleApplyUniversalDates}
        customStages={customStages}
        pipelineStageDates={pipelineStageDates}
        stageApprovers={stageApprovers}
        stageCustomFields={stageCustomFields}
        stageRequiredDocuments={stageRequiredDocuments}
        stageStaffAssignments={stageStaffAssignments}
        stageRecruiterAssignments={stageRecruiterAssignments}
        allRecruitersForPipeline={allRecruiters}
        levelGroups={levelGroups}
        staffs={staffs}
        addCustomStage={addCustomStage}
        removeCustomStage={removeCustomStage}
        updateCustomStage={updateCustomStage}
        handleStageDateChange={handleStageDateChange}
        handleDependencyTypeChange={handleDependencyTypeChange}
        handleRecruiterAssignmentChange={handleRecruiterAssignmentChange}
        handleStaffAssignmentChange={handleStaffAssignmentChange}
        handleLevelChange={handleLevelChange}
        addStageCustomField={addStageCustomField}
        removeStageCustomField={removeStageCustomField}
        updateStageCustomField={updateStageCustomField}
        addStageRequiredDocument={addStageRequiredDocument}
        removeStageRequiredDocument={removeStageRequiredDocument}
        updateStageRequiredDocument={updateStageRequiredDocument}
        addFieldOption={addFieldOption}
        updateFieldOption={updateFieldOption}
        removeFieldOption={removeFieldOption}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        offerModalVisible={offerModalVisible}
        setOfferModalVisible={setOfferModalVisible}
        offerAction={offerAction}
        offerForm={offerForm}
        handleOfferSubmit={handleOfferSubmit}
        handleReviseOffer={handleReviseOffer}
        isSubmittingOffer={isSubmittingOffer}
        acceptOfferModalVisible={acceptOfferModalVisible}
        setAcceptOfferModalVisible={setAcceptOfferModalVisible}
        acceptOfferForm={acceptOfferForm}
        handleAcceptOfferOnBehalf={handleAcceptOfferOnBehalf}
        isAcceptingOffer={isAcceptingOffer}
        candidate={candidate}
        changePipelineModalVisible={changePipelineModalVisible}
        setChangePipelineModalVisible={setChangePipelineModalVisible}
        selectedNewPipeline={selectedNewPipeline}
        setSelectedNewPipeline={setSelectedNewPipeline}
        handleUpdatePipeline={handleUpdatePipeline}
        isUpdatingPipeline={isUpdatingPipeline}
        activePipelines={activePipelines}
      />

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
        .ant-table-tbody > tr:hover > td {
          background-color: #fff5f5 !important;
        }
        .ant-card-head-title {
          font-weight: 600 !important;
        }
        .ant-tag {
          margin-right: 8px;
        }
        @media (max-width: 768px) {
          .ant-table {
            font-size: 12px;
          }
          .ant-card {
            margin-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default RecruiterCandidates;

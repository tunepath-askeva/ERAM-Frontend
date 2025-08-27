import { useState, useMemo, useEffect, useCallback } from "react";
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
  InputNumber,
  Badge,
  Tabs,
  Modal,
  Descriptions,
  Tag,
  message,
  Skeleton,
  Pagination,
  AutoComplete,
  Slider,
  Checkbox,
  Form,
  Collapse,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CheckOutlined,
  EyeOutlined,
  CloseOutlined,
  FilterOutlined,
  ClearOutlined,
  EnvironmentOutlined,
  BankOutlined,
  DollarOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
  useGetSourcedCandidateQuery,
  useGetExactMatchCandidatesQuery,
  useGetPipelinesQuery,
  useGetCurrentWorkOrderDetailsForFilteringQuery,
  useCurrentWorkorderDetailsFilteringMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import CandidateProfilePage from "./CandidateProfilePage";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const initialFilters = {
  keywords: "",
  experience: [0, 20],
  qualifications: [],
  skills: [],
  location: "",
  company: "",
  salary: [0, 2000000],
  jobRoles: [],
  industries: [],
  gender: null,
  nationality: null,
  ageRange: [18, 70],
  noticePeriod: null,
  profileUpdated: null,
  visaStatus: null,
  languages: [],
};

const locationOptions = [
  { value: "Dubai" },
  { value: "Abu Dhabi" },
  { value: "Sharjah" },
  { value: "Riyadh" },
  { value: "Jeddah" },
  { value: "Doha" },
  { value: "Manama" },
  { value: "Kuwait City" },
  { value: "Muscat" },
];

const industryOptions = [
  { value: "IT", label: "Information Technology" },
  { value: "Banking", label: "Banking & Finance" },
  { value: "Construction", label: "Construction" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Retail", label: "Retail" },
  { value: "Oil & Gas", label: "Oil & Gas" },
];

const jobRoleOptions = [
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Accountant", label: "Accountant" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Sales Executive", label: "Sales Executive" },
  { value: "Marketing Manager", label: "Marketing Manager" },
];

const qualificationOptions = [
  { value: "B.Tech", label: "Bachelor of Technology" },
  { value: "MBA", label: "Master of Business Administration" },
  { value: "B.Com", label: "Bachelor of Commerce" },
  { value: "M.Tech", label: "Master of Technology" },
  { value: "PhD", label: "Doctor of Philosophy" },
];

const nationalityOptions = [
  { value: "Indian", label: "Indian" },
  { value: "Pakistani", label: "Pakistani" },
  { value: "Bangladeshi", label: "Bangladeshi" },
  { value: "Filipino", label: "Filipino" },
  { value: "Emirati", label: "Emirati" },
  { value: "Saudi", label: "Saudi" },
];

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Urdu", label: "Urdu" },
  { value: "Malayalam", label: "Malayalam" },
  { value: "Tagalog", label: "Tagalog" },
];

const CommentModal = ({
  visible,
  onCancel,
  onOk,
  comment,
  setComment,
  pipelines = [],
  selectedPipeline,
  setSelectedPipeline,
  candidateType,
  setCandidateType,
}) => {
  const [candidateTypeInput, setCandidateTypeInput] = useState("");

  return (
    <Modal
      title="Add Comment and Select Pipeline"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Confirm"
      cancelText="Cancel"
      okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
    >
      <Form layout="vertical">
        <Form.Item label="Candidate Type (Optional)" name="candidateType">
          <Select
            showSearch
            allowClear
            placeholder="Select or type candidate type"
            value={candidateType}
            onSearch={(val) => setCandidateTypeInput(val)}
            onChange={(value) => {
              setCandidateType(value);
            }}
            onBlur={() => {
              if (!candidateType && candidateTypeInput) {
                setCandidateType(candidateTypeInput);
              }
            }}
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {[
              "General",
              "Supplier",
              "Own",
              "SponserTransfer",
              "Khafalath",
              "Others",
            ].map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Pipeline (Optional)">
          <Select
            placeholder="Select a pipeline"
            value={selectedPipeline}
            onChange={setSelectedPipeline}
            allowClear
          >
            {pipelines.map((pipeline) => (
              <Option key={pipeline._id} value={pipeline._id}>
                {pipeline.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Comment">
          <Input.TextArea
            rows={4}
            placeholder="Enter your comments for this candidate..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const SourcedCandidates = ({ jobId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [candidateToUpdate, setCandidateToUpdate] = useState(null);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isWorkOrderModalVisible, setIsWorkOrderModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState({ ...initialFilters });
  const [shouldFetch, setShouldFetch] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [queryParams, setQueryParams] = useState("");
  
  const {
    data: workOrderDetails,
    isLoading: isWorkOrderLoading,
    error: workOrderError,
  } = useGetCurrentWorkOrderDetailsForFilteringQuery(jobId, {
    skip: !isWorkOrderModalVisible,
  });

  const [CurrentWorkorderFiltering] = useCurrentWorkorderDetailsFilteringMutation()
  const { data: pipelineData } = useGetPipelinesQuery();
  const activePipelines = pipelineData?.pipelines || [];
  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    const hasFilters =
      filters.keywords.trim() ||
      filters.skills.length > 0 ||
      filters.location.trim() ||
      filters.company.trim() ||
      filters.qualifications.length > 0 ||
      filters.jobRoles.length > 0 ||
      filters.industries.length > 0 ||
      filters.languages.length > 0 ||
      filters.experience[0] > 0 ||
      filters.experience[1] < 20 ||
      filters.salary[0] > 0 ||
      filters.salary[1] < 2000000 ||
      filters.ageRange[0] > 18 ||
      filters.ageRange[1] < 70 ||
      filters.gender ||
      filters.nationality ||
      filters.noticePeriod ||
      filters.profileUpdated ||
      filters.visaStatus;

    if (!hasFilters) {
      return "";
    }

    params.append("page", pagination.current.toString());
    params.append("limit", pagination.pageSize.toString());

    if (filters.keywords) {
      params.append("keywords", filters.keywords);
    }
    if (filters.experience[0] > 0 || filters.experience[1] < 30) {
      params.append("minExperience", filters.experience[0].toString());
      params.append("maxExperience", filters.experience[1].toString());
    }
    if (filters.qualifications?.length > 0) {
      params.append("qualifications", filters.qualifications.join(","));
    }
    if (filters.skills?.length > 0) {
      params.append("skills", filters.skills.join(","));
    }
    if (filters.location) {
      params.append("location", filters.location);
    }
    if (filters.company) {
      params.append("company", filters.company);
    }
    if (filters.jobRoles?.length > 0) {
      params.append("jobRoles", filters.jobRoles.join(","));
    }
    if (filters.industries?.length > 0) {
      params.append("industries", filters.industries.join(","));
    }
    if (filters.salary[0] > 0 || filters.salary[1] < 2000000) {
      params.append("minSalary", filters.salary[0].toString());
      params.append("maxSalary", filters.salary[1].toString());
    }
    if (filters.gender) {
      params.append("gender", filters.gender);
    }
    if (filters.nationality) {
      params.append("nationality", filters.nationality);
    }
    if (filters.ageRange[0] > 18 || filters.ageRange[1] < 70) {
      params.append("minAge", filters.ageRange[0].toString());
      params.append("maxAge", filters.ageRange[1].toString());
    }
    if (filters.noticePeriod) {
      params.append("noticePeriod", filters.noticePeriod);
    }
    if (filters.profileUpdated) {
      params.append("profileUpdated", filters.profileUpdated);
    }
    if (filters.visaStatus) {
      params.append("visaStatus", filters.visaStatus);
    }
    if (filters.languages?.length > 0) {
      params.append("languages", filters.languages.join(","));
    }

    return params.toString();
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (shouldFetch) {
      const params = buildQueryParams();
      setQueryParams(params);
    }
  }, [buildQueryParams, shouldFetch]);

  const {
    data: sourcedCandidatesData,
    isLoading: isSourcedLoading,
    error: sourcedError,
    refetch: refetchSourced,
  } = useGetSourcedCandidateQuery(queryParams, {
    skip: !shouldFetch || !queryParams || queryParams === "",
  });

  const {
    data: exactMatchData,
    isLoading: isExactMatchLoading,
    error: exactMatchError,
    refetch: refetchExactMatch,
  } = useGetExactMatchCandidatesQuery(jobId, {
    skip: !isExactMatch,
  });

  const {
    data: jobApplications,
    isLoading: jobLoading,
    error: jobError,
    refetch: jobRefetch,
  } = useGetJobApplicationsQuery(jobId);

  useEffect(() => {
    if (sourcedCandidatesData) {
      setPagination((prev) => ({
        ...prev,
        total:
          sourcedCandidatesData.total ||
          sourcedCandidatesData.users?.length ||
          0,
      }));
    }
  }, [sourcedCandidatesData]);

  const allCandidates = useMemo(() => {
    const jobAppCandidates =
      jobApplications?.formResponses?.map((response) => ({
        ...response.user,
        status: response.status,
        applicationId: response._id,
        responses: response.responses,
        isApplied: true,
      })) || [];

    const candidateSource = isExactMatch
      ? exactMatchData
      : sourcedCandidatesData;

    const sourcedCandidates =
      candidateSource?.users?.map((user) => ({
        ...user,
        status: user.status || "sourced",
        applicationId: user._id,
        isApplied: false,
        isSourced: true,
        isExactMatch: isExactMatch,
        currentCompany:
          user.workExperience?.[0]?.company || user.currentCompany,
        totalExperienceYears: user.totalExperienceYears || 0,
      })) || [];

    const merged = [...sourcedCandidates];
    jobAppCandidates.forEach((jobCandidate) => {
      const existingIndex = merged.findIndex((c) => c._id === jobCandidate._id);
      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...jobCandidate,
          isApplied: true,
        };
      } else {
        merged.push(jobCandidate);
      }
    });

    return merged;
  }, [jobApplications, sourcedCandidatesData, exactMatchData, isExactMatch]);

const handleSubmit = async () => {
  try {
    const values = await form.validateFields(); 
    const payload = {
      ...values,
      requiredSkills: values.requiredSkills
        ? values.requiredSkills.split(",").map((s) => s.trim())
        : [],
      languagesRequired: values.languagesRequired
        ? values.languagesRequired.split(",").map((l) => l.trim())
        : [],
    };

    await CurrentWorkorderFiltering({  body: payload }).unwrap();
    message.success("Work order details submitted successfully!");
    setIsWorkOrderModalVisible(false);
  } catch (error) {
    console.error(error);
    message.error("Please fix the errors in the form");
  }
};


  const sourcedCandidates = useMemo(() => {
    if (!shouldFetch && !isExactMatch) {
      return [];
    }

    return allCandidates.filter((candidate) => {
      const status = candidate.status;
      return (
        status !== "selected" &&
        (status === "sourced" || status === "applied" || !status)
      );
    });
  }, [allCandidates, shouldFetch, isExactMatch]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.keywords.trim() ||
      filters.skills.length > 0 ||
      filters.location.trim() ||
      filters.company.trim() ||
      filters.qualifications.length > 0 ||
      filters.jobRoles.length > 0 ||
      filters.industries.length > 0 ||
      filters.languages.length > 0 ||
      filters.experience[0] > 0 ||
      filters.experience[1] < 20 ||
      filters.salary[0] > 0 ||
      filters.salary[1] < 2000000 ||
      filters.ageRange[0] > 18 ||
      filters.ageRange[1] < 70 ||
      filters.gender ||
      filters.nationality ||
      filters.noticePeriod ||
      filters.profileUpdated ||
      filters.visaStatus ||
      isExactMatch
    );
  }, [filters, isExactMatch]);

  const handleExactMatch = async () => {
    try {
      setIsExactMatch(true);
      setShouldFetch(false);
      setFilters(initialFilters);
      setTempFilters(initialFilters);
      setPagination((prev) => ({ ...prev, current: 1 }));

      message.info("Fetching suggestion match candidates...");
    } catch (error) {
      console.error("Failed to fetch suggestion match candidates:", error);
      message.error("Failed to fetch suggestion match candidates");
    }
  };

  const showFilterModal = () => {
    setTempFilters({ ...filters });
    setIsFilterModalVisible(true);
  };

  const handleFilterModalOk = () => {
    const hasFilters =
      tempFilters.keywords.trim() ||
      tempFilters.skills.length > 0 ||
      tempFilters.location.trim() ||
      tempFilters.company.trim() ||
      tempFilters.qualifications.length > 0 ||
      tempFilters.jobRoles.length > 0 ||
      tempFilters.industries.length > 0 ||
      tempFilters.languages.length > 0 ||
      tempFilters.experience[0] > 0 ||
      tempFilters.experience[1] < 20 ||
      tempFilters.salary[0] > 0 ||
      tempFilters.salary[1] < 2000000 ||
      tempFilters.ageRange[0] > 18 ||
      tempFilters.ageRange[1] < 70 ||
      tempFilters.gender ||
      tempFilters.nationality ||
      tempFilters.noticePeriod ||
      tempFilters.profileUpdated ||
      tempFilters.visaStatus;

    if (!hasFilters) {
      enqueueSnackbar(
        "Please apply at least one filter to search for candidates",
        {
          variant: "warning",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
      return;
    }

    setFilters({ ...tempFilters });
    setShouldFetch(true);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setIsFilterModalVisible(false);
  };

  const handleFilterModalCancel = () => {
    setIsFilterModalVisible(false);
  };

  const handleClearSearch = () => {
    setFilters(initialFilters);
    setTempFilters(initialFilters);
    setSkillInput("");

    setShouldFetch(false);
    setIsExactMatch(false);
    setQueryParams("");

    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: 0,
    }));

    setSelectedCandidates([]);
    setSelectAll(false);
    message.success("All filters cleared successfully");
  };

  const handleClearSpecificFilter = (filterType) => {
    const clearedFilters = { ...filters };

    switch (filterType) {
      case "skills":
        clearedFilters.skills = [];
        break;
      case "location":
        clearedFilters.location = "";
        break;
      case "company":
        clearedFilters.company = "";
        break;
      case "experience":
        clearedFilters.experience = [0, 20];
        break;
      case "salary":
        clearedFilters.salary = [0, 2000000];
        break;
      case "qualifications":
        clearedFilters.qualifications = [];
        break;
      case "jobRoles":
        clearedFilters.jobRoles = [];
        break;
      case "industries":
        clearedFilters.industries = [];
        break;
      case "suggestionMatch":
        setIsExactMatch(false);
        setShouldFetch(false);
        return;
      default:
        break;
    }

    setFilters(clearedFilters);
    if (shouldFetch) {
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
  };

  const handleSkillAdd = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !tempFilters.skills.includes(trimmedSkill)) {
      setTempFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setTempFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleCandidateSelect = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const currentPageIds = sourcedCandidates.map((c) => c._id);
    setSelectedCandidates((prev) =>
      checked
        ? [...new Set([...prev, ...currentPageIds])]
        : prev.filter((id) => !currentPageIds.includes(id))
    );
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedCandidates.length === 0) return;

    try {
      const updatePromises = selectedCandidates.map((candidateId) => {
        const candidate = allCandidates.find((c) => c._id === candidateId);
        if (!candidate) return Promise.resolve();

        return updateCandidateStatus({
          applicationId: candidate.applicationId,
          Id: candidate._id,
          status: newStatus,
          jobId: jobId,
          isSourced: true,
          comment: "",
        }).unwrap();
      });

      await Promise.all(updatePromises);

      message.success(
        `Successfully moved ${selectedCandidates.length} candidates to ${newStatus}`
      );

      setSelectedCandidates([]);
      setSelectAll(false);

      if (
        selectedCandidates.some((id) => {
          const candidate = allCandidates.find((c) => c._id === id);
          return candidate?.isSourced;
        })
      ) {
        refetchSourced();
      }
      jobRefetch();
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error("Failed to update some candidate statuses");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedCandidate) return;

    if (newStatus === "selected") {
      setCandidateToUpdate(selectedCandidate);
      setIsCommentModalVisible(true);
      return;
    }

    await updateStatusWithComment(selectedCandidate, newStatus, "");
  };

  const updateStatusWithComment = async (candidate, newStatus, commentText) => {
    try {
      await updateCandidateStatus({
        applicationId: candidate.applicationId,
        Id: candidate._id,
        status: newStatus,
        jobId: jobId,
        isSourced: candidate.isSourced,
        comment: commentText,
        pipelineId: selectedPipeline,
        candidateType: candidate.candidateType,
      }).unwrap();

      message.success(`Candidate moved to ${newStatus} successfully`);

      if (candidate.isSourced) {
        refetchSourced();
      }
      jobRefetch();

      setIsModalVisible(false);
      setSelectedCandidate(null);
      setSelectedPipeline(null);
      setComment("");

      if (newStatus === "selected") {
        setSelectedCandidates((prev) =>
          prev.filter((id) => id !== candidate._id)
        );
      }
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error(error.data?.message || "Failed to update candidate status");
    }
  };

  const handleCommentConfirm = async () => {
    setIsCommentModalVisible(false);
    if (candidateToUpdate) {
      await updateStatusWithComment(candidateToUpdate, "selected", comment);
      setComment("");
      setCandidateToUpdate(null);
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
    setSelectAll(false);
  };

  const getModalButtonText = () => {
    if (!selectedCandidate) return "Update Status";
    const currentStatus = selectedCandidate.status;

    if (
      !currentStatus ||
      currentStatus === "sourced" ||
      currentStatus === "applied"
    ) {
      return "Move to Selected";
    } else if (currentStatus === "selected") {
      return "Move to Screening";
    }
    return "Move to Selected";
  };

  const getNextStatus = () => {
    if (!selectedCandidate) return "selected";
    const currentStatus = selectedCandidate.status;

    if (
      !currentStatus ||
      currentStatus === "sourced" ||
      currentStatus === "applied"
    ) {
      return "selected";
    } else if (currentStatus === "selected") {
      return "screening";
    }
    return "selected";
  };

  const getCandidateStatusTag = (status, isApplied) => {
    if (!status || status === "sourced") {
      return isApplied ? (
        <Tag color="blue">Applied</Tag>
      ) : (
        <Tag color="default">Sourced</Tag>
      );
    }

    const statusColors = {
      applied: "blue",
      selected: "green",
      screening: "orange",
      hired: "purple",
      rejected: "red",
    };

    return (
      <Tag color={statusColors[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  if (jobLoading) {
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

  if (jobError) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Failed to load candidates"
          description="Unable to fetch candidates data"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: window.innerWidth < 768 ? "8px" : "0",
        fontSize: "14px",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Title
          level={4}
          style={{
            margin: "0 0 8px 0",
            fontSize: window.innerWidth < 768 ? "16px" : "18px",
            fontWeight: "600",
            color: "#da2c46",
          }}
        >
          Candidates Management
        </Title>
      </div>

      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <Space wrap>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={showFilterModal}
              style={{ backgroundColor: "#da2c46" }}
            >
              Advanced Filters
              {hasActiveFilters && !isExactMatch && (
                <Badge
                  count={
                    Object.values(filters).filter((val) =>
                      Array.isArray(val)
                        ? val.length > 0
                        : typeof val === "string"
                        ? val.trim()
                        : typeof val === "number"
                        ? false
                        : val !== null
                    ).length
                  }
                  size="small"
                />
              )}
            </Button>

            <Button
              type={isExactMatch ? "primary" : "default"}
              onClick={handleExactMatch}
              loading={isExactMatchLoading}
              style={{
                backgroundColor: isExactMatch ? "#722ed1" : undefined,
                borderColor: isExactMatch ? "#722ed1" : "#d9d9d9",
              }}
            >
              Suggestion Match
            </Button>
            <Button
              type="default"
              onClick={() => setIsWorkOrderModalVisible(true)}
              style={{ backgroundColor: "#1890ff", color: "#fff" }}
            >
              Current Work Order Filter
            </Button>

            {(hasActiveFilters || isExactMatch) && (
              <Card size="small" style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Space wrap size={[8, 8]}>
                      <Text strong style={{ color: "#666", fontSize: "13px" }}>
                        Active Filters:
                      </Text>

                      {isExactMatch && (
                        <Tag
                          color="purple"
                          closable
                          onClose={() =>
                            handleClearSpecificFilter("suggestionMatch")
                          }
                        >
                          Suggestion Match
                        </Tag>
                      )}

                      {filters.keywords && (
                        <Tag
                          color="blue"
                          closable
                          onClose={() =>
                            setFilters((prev) => ({ ...prev, keywords: "" }))
                          }
                        >
                          Keywords: {filters.keywords}
                        </Tag>
                      )}

                      {filters.skills.map((skill) => (
                        <Tag
                          key={skill}
                          color="blue"
                          closable
                          onClose={() =>
                            setFilters((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((s) => s !== skill),
                            }))
                          }
                        >
                          {skill}
                        </Tag>
                      ))}

                      {filters.location && (
                        <Tag
                          color="green"
                          closable
                          onClose={() =>
                            setFilters((prev) => ({ ...prev, location: "" }))
                          }
                        >
                          <EnvironmentOutlined /> {filters.location}
                        </Tag>
                      )}

                      {filters.company && (
                        <Tag
                          color="orange"
                          closable
                          onClose={() =>
                            setFilters((prev) => ({ ...prev, company: "" }))
                          }
                        >
                          <BankOutlined /> {filters.company}
                        </Tag>
                      )}

                      {filters.qualifications.length > 0 && (
                        <Tag
                          color="purple"
                          closable
                          onClose={() =>
                            handleClearSpecificFilter("qualifications")
                          }
                        >
                          Education: {filters.qualifications.join(", ")}
                        </Tag>
                      )}

                      {filters.jobRoles.length > 0 && (
                        <Tag
                          color="cyan"
                          closable
                          onClose={() => handleClearSpecificFilter("jobRoles")}
                        >
                          <ToolOutlined /> {filters.jobRoles.join(", ")}
                        </Tag>
                      )}

                      {(filters.experience[0] > 0 ||
                        filters.experience[1] < 20) && (
                        <Tag
                          color="red"
                          closable
                          onClose={() =>
                            handleClearSpecificFilter("experience")
                          }
                        >
                          Exp: {filters.experience[0]}-{filters.experience[1]}{" "}
                          years
                        </Tag>
                      )}

                      {(filters.salary[0] > 0 ||
                        filters.salary[1] < 2000000) && (
                        <Tag
                          color="gold"
                          closable
                          onClose={() => handleClearSpecificFilter("salary")}
                        >
                          <DollarOutlined /> ₹
                          {(filters.salary[0] / 100000).toFixed(1)}L-₹
                          {(filters.salary[1] / 100000).toFixed(1)}L
                        </Tag>
                      )}

                      {filters.industries.length > 0 && (
                        <Tag
                          color="geekblue"
                          closable
                          onClose={() =>
                            handleClearSpecificFilter("industries")
                          }
                        >
                          Industry: {filters.industries.join(", ")}
                        </Tag>
                      )}

                      {filters.gender && (
                        <Tag
                          color="magenta"
                          closable
                          onClose={() =>
                            setFilters((prev) => ({ ...prev, gender: null }))
                          }
                        >
                          Gender: {filters.gender}
                        </Tag>
                      )}

                      {filters.nationality && (
                        <Tag
                          color="volcano"
                          closable
                          onClose={() =>
                            setFilters((prev) => ({
                              ...prev,
                              nationality: null,
                            }))
                          }
                        >
                          Nationality: {filters.nationality}
                        </Tag>
                      )}
                    </Space>
                  </div>

                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<ClearOutlined />}
                    onClick={handleClearSearch}
                    style={{ flexShrink: 0 }}
                  >
                    Clear All
                  </Button>
                </div>
              </Card>
            )}
          </Space>
        </Col>
        <Col>
          <Space>
            <Text type="secondary">
              {selectedCandidates.length} selected of {sourcedCandidates.length}{" "}
              candidates
            </Text>
            {selectedCandidates.length > 0 && (
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: "#da2c46" }}
                onClick={() => handleBulkStatusUpdate("selected")}
                loading={isUpdatingStatus}
              >
                Move Selected to Pipeline
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {(shouldFetch || isExactMatch) && sourcedCandidates.length > 0 && (
        <Card
          size="small"
          style={{ marginBottom: "16px", backgroundColor: "#f6ffed" }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong style={{ color: "#52c41a" }}>
                  Found {sourcedCandidates.length} candidates
                </Text>
                {isExactMatch && <Text type="secondary">(Exact Match)</Text>}
                {hasActiveFilters && !isExactMatch && (
                  <Text type="secondary">
                    (
                    {
                      Object.values(filters).filter((val) =>
                        Array.isArray(val)
                          ? val.length > 0
                          : typeof val === "string"
                          ? val.trim()
                          : val !== null
                      ).length
                    }{" "}
                    filters applied)
                  </Text>
                )}
              </Space>
            </Col>
            <Col>
              <Checkbox
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select all on page
              </Checkbox>
            </Col>
          </Row>
        </Card>
      )}

      <Divider
        style={{ margin: window.innerWidth < 768 ? "8px 0" : "12px 0" }}
      />

      <div>
        {!shouldFetch && !isExactMatch ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                Use the advanced filters or suggestion match to find candidates
              </span>
            }
          />
        ) : isSourcedLoading || isExactMatchLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        ) : sourcedError || exactMatchError ? (
          <Alert
            message={`Failed to load ${
              isExactMatch ? "suggestion match" : "sourced"
            } candidates`}
            description={`Unable to fetch ${
              isExactMatch ? "suggestion match" : "sourced"
            } candidates data`}
            type="error"
            showIcon
          />
        ) : sourcedCandidates.length > 0 ? (
          <>
            {sourcedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                onViewProfile={handleViewProfile}
                showExperience={true}
                showSkills={true}
                maxSkills={5}
                onSelectCandidate={handleCandidateSelect}
                isSelected={selectedCandidates.includes(candidate._id)}
                isSelectable={true}
              />
            ))}

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePaginationChange}
                showSizeChanger={true}
                showQuickJumper={true}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} candidates`
                }
                pageSizeOptions={["10", "20", "50"]}
                simple={window.innerWidth < 768}
                size={window.innerWidth < 768 ? "small" : "default"}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                {isExactMatch
                  ? "No suggestion match candidates found for this job"
                  : "No candidates found matching your search criteria"}
              </span>
            }
          />
        )}
      </div>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Advanced Candidate Filters</span>
            {hasActiveFilters && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  setTempFilters(initialFilters);
                  setSkillInput("");
                }}
              >
                Reset All Filters
              </Button>
            )}
          </div>
        }
        open={isFilterModalVisible}
        onOk={handleFilterModalOk}
        onCancel={handleFilterModalCancel}
        width={800}
        okText="Apply Filters"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
      >
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Keywords">
                <Input
                  placeholder="Job title, skills, companies, etc."
                  value={tempFilters.keywords}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      keywords: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Current Location">
                <AutoComplete
                  options={locationOptions}
                  placeholder="Search location"
                  value={tempFilters.location}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                  filterOption={(inputValue, option) =>
                    option.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Skills">
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Add skills (e.g., JavaScript, React)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onPressEnter={handleSkillAdd}
              />
              <Button
                type="primary"
                onClick={handleSkillAdd}
                style={{ backgroundColor: "#da2c46" }}
              >
                Add
              </Button>
            </Space.Compact>
            <div style={{ marginTop: 8 }}>
              {tempFilters.skills.map((skill) => (
                <Tag
                  key={skill}
                  closable
                  onClose={() => handleSkillRemove(skill)}
                  style={{ marginBottom: 4 }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Experience (Years)">
                <Slider
                  range
                  min={0}
                  max={30}
                  value={tempFilters.experience}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, experience: value }))
                  }
                  marks={{
                    0: "0",
                    5: "5",
                    10: "10",
                    15: "15",
                    20: "20",
                    25: "25",
                    30: "30+",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Annual Salary Range (₹)"
                extra="Annual salary in rupees (L = lakhs)"
              >
                <Slider
                  range
                  min={0}
                  max={2000000}
                  step={50000}
                  value={tempFilters.salary}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, salary: value }))
                  }
                  marks={{
                    0: "0",
                    500000: "5L",
                    1000000: "10L",
                    1500000: "15L",
                    2000000: "20L+",
                  }}
                  tipFormatter={(value) => `${value / 100000}L`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Current Company">
                <Input
                  placeholder="Current or past companies"
                  value={tempFilters.company}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Industry">
                <Select
                  mode="tags"
                  placeholder="Select industries"
                  value={tempFilters.industries}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      industries: value,
                    }))
                  }
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                >
                  {industryOptions.map((industry) => (
                    <Option key={industry.value} value={industry.value}>
                      {industry.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Job Role">
                <Select
                  mode="tags"
                  placeholder="Select job roles"
                  value={tempFilters.jobRoles}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      jobRoles: value,
                    }))
                  }
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                >
                  {jobRoleOptions.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Qualification">
                <Select
                  mode="tags"
                  placeholder="Select qualifications"
                  value={tempFilters.qualifications}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      qualifications: value,
                    }))
                  }
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                >
                  {qualificationOptions.map((qual) => (
                    <Option key={qual.value} value={qual.value}>
                      {qual.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* <Col span={8}>
              <Form.Item label="Gender">
                <Select
                  placeholder="Select gender"
                  value={tempFilters.gender}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      gender: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col> */}
            <Col span={8}>
              <Form.Item label="Nationality">
                <Select
                  placeholder="Select nationality"
                  value={tempFilters.nationality}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      nationality: value,
                    }))
                  }
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                >
                  {nationalityOptions.map((country) => (
                    <Option key={country.value} value={country.value}>
                      {country.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Age Range">
                <Slider
                  range
                  min={18}
                  max={70}
                  value={tempFilters.ageRange}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, ageRange: value }))
                  }
                  marks={{
                    18: "18",
                    25: "25",
                    35: "35",
                    45: "45",
                    55: "55",
                    70: "70+",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item label="Notice Period">
                <Select
                  placeholder="Select notice period"
                  value={tempFilters.noticePeriod}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      noticePeriod: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="immediate">Immediate</Option>
                  <Option value="1">1 month</Option>
                  <Option value="2">2 months</Option>
                  <Option value="3">3 months</Option>
                  <Option value="3+">More than 3 months</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Profile Updated">
                <Select
                  placeholder="When profile was updated"
                  value={tempFilters.profileUpdated}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      profileUpdated: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="7">Last 7 days</Option>
                  <Option value="15">Last 15 days</Option>
                  <Option value="30">Last 30 days</Option>
                  <Option value="60">Last 60 days</Option>
                  <Option value="90">Last 90 days</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Visa Status">
                <Select
                  placeholder="Select visa status"
                  value={tempFilters.visaStatus}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      visaStatus: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="visit">Visit Visa</Option>
                  <Option value="employment">Employment Visa</Option>
                  <Option value="resident">Residence Visa</Option>
                  <Option value="citizen">Citizen</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Languages Known">
            <Select
              mode="tags"
              placeholder="Select languages"
              value={tempFilters.languages}
              onChange={(value) =>
                setTempFilters((prev) => ({
                  ...prev,
                  languages: value,
                }))
              }
              tokenSeparators={[","]}
              style={{ width: "100%" }}
            >
              {languageOptions.map((lang) => (
                <Option key={lang.value} value={lang.value}>
                  {lang.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Candidate Profile"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="status"
            type="primary"
            loading={isUpdatingStatus}
            onClick={() => handleStatusUpdate(getNextStatus())}
            style={{ backgroundColor: "#da2c46" }}
          >
            {getModalButtonText()}
          </Button>,
        ]}
      >
        {selectedCandidate && (
          <CandidateProfilePage candidate={selectedCandidate} />
        )}
      </Modal>

      <Modal
        title="Current Work Order Details To Filter"
        open={isWorkOrderModalVisible}
        onCancel={() => setIsWorkOrderModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setIsWorkOrderModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ backgroundColor: "#da2c46" }}

            onClick={handleSubmit}
          >
            Apply Filters
          </Button>,
        ]}
      >
        {isWorkOrderLoading ? (
          <Spin tip="Loading work order details..." />
        ) : workOrderError ? (
          <Alert message="Failed to load work order details" type="error" />
        ) : workOrderDetails ? (
          <Form
            layout="vertical"
            form={form}
            initialValues={{
              officeLocation: workOrderDetails.officeLocation,
              companyIndustry: workOrderDetails.companyIndustry,
              EmploymentType: workOrderDetails.EmploymentType,
              qualification: workOrderDetails.qualification,
              experienceMin: workOrderDetails.experienceMin,
              experienceMax: workOrderDetails.experienceMax,
              salaryMin: workOrderDetails.salaryMin,
              salaryMax: workOrderDetails.salaryMax,
              requiredSkills: workOrderDetails.requiredSkills?.join(", "),
              languagesRequired: workOrderDetails.languagesRequired?.join(", "),
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Office Location" name="officeLocation">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Industry" name="companyIndustry">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Employment Type" name="EmploymentType">
                  <Select allowClear>
                    <Option value="full-time">Full-time</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="internship">Internship</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Qualification" name="qualification">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Experience Min" name="experienceMin">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Experience Max" name="experienceMax">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Salary Min (LPA)" name="salaryMin">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Salary Max (LPA)" name="salaryMax">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Required Skills (comma separated)"
              name="requiredSkills"
            >
              <Input placeholder="e.g., JavaScript, React, Node.js" />
            </Form.Item>

            <Form.Item
              label="Languages Required (comma separated)"
              name="languagesRequired"
            >
              <Input placeholder="e.g., English, Arabic" />
            </Form.Item>
          </Form>
        ) : (
          <Empty description="No work order details found" />
        )}
      </Modal>

      <CommentModal
        visible={isCommentModalVisible}
        onCancel={() => {
          setIsCommentModalVisible(false);
          setSelectedPipeline(null);
        }}
        onOk={handleCommentConfirm}
        comment={comment}
        setComment={setComment}
        pipelines={activePipelines}
        selectedPipeline={selectedPipeline}
        setSelectedPipeline={setSelectedPipeline}
        candidateType={candidateToUpdate?.candidateType}
        setCandidateType={(type) => {
          setCandidateToUpdate((prev) => ({ ...prev, candidateType: type }));
        }}
      />
    </div>
  );
};

export default SourcedCandidates;

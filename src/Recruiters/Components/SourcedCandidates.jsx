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
  useGetWorkOrderBasedSourcedCandidatesQuery,
  useFilterAllCandidatesMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import CandidateProfilePage from "./CandidateProfilePage";
import AdvancedFiltersModal from "./AdvancedFiltersModal";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const initialFilters = {
  keywords: "",
  experience: ["", ""],
  qualifications: [],
  skills: [],
  location: "",
  company: "",
  salary: ["", ""],
  jobRoles: [],
  industries: [],
  gender: null,
  nationality: null,
  ageRange: ["", ""],
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
  { value: "Information Technology", label: "Information Technology" },
  { value: "Banking & Finance", label: "Banking & Finance" },
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
  const [queryParams, setQueryParams] = useState({});
  const [workOrderFilters, setWorkOrderFilters] = useState(null);
  const [candidateType, setCandidateType] = useState("");
  const [workOrderCandidates, setWorkOrderCandidates] = useState([]);
  const [isWorkOrderFiltered, setIsWorkOrderFiltered] = useState(false);

  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [isAdvancedFilterApplied, setIsAdvancedFilterApplied] = useState(false);

  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [primaryFiltersApplied, setPrimaryFiltersApplied] = useState(false);

  const {
    data: workOrderDetails,
    isLoading: isWorkOrderLoadingOne,
    error: workOrderErrorOne,
  } = useGetCurrentWorkOrderDetailsForFilteringQuery(jobId, {
    skip: !isFilterModalVisible,
  });

  const [CurrentWorkorderFiltering] =
    useCurrentWorkorderDetailsFilteringMutation();
  const { data: pipelineData } = useGetPipelinesQuery();
  const activePipelines = pipelineData?.pipelines || [];
  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const [filterCandidates, { data: filterData, isLoading: filterLoading }] =
    useFilterAllCandidatesMutation();

  const filterOptions = filterData?.filterOptions || {
    skills: [],
    locations: [],
    industries: [],
    agency: "",
  };

  const {
    data: exactMatchData,
    isLoading: isExactMatchLoading,
    error: exactMatchError,
    refetch: refetchExactMatch,
  } = useGetExactMatchCandidatesQuery(jobId, {
    page: pagination.current,
    limit: pagination.pageSize,

    skip: !isExactMatch,
  });

  const {
    data: jobApplications,
    isLoading: jobLoading,
    error: jobError,
    refetch: jobRefetch,
  } = useGetJobApplicationsQuery(jobId);

  const {
    data: workOrderBasedSourced,
    isLoading: isWorkOrderLoading,
    error: workOrderError,
    refetch: refetchWorkOrderBased,
  } = useGetWorkOrderBasedSourcedCandidatesQuery({
    jobId,
    page: pagination.current,
    limit: pagination.pageSize,
    ...queryParams, // Spread the query parameters here
  });

  useEffect(() => {
    if (workOrderBasedSourced) {
      // Handle the workOrderBasedSourced structure which has 'candidates' array
      const candidatesArray = Array.isArray(workOrderBasedSourced.candidates)
        ? workOrderBasedSourced.candidates
        : [];

      setPagination((prev) => ({
        ...prev,
        total: workOrderBasedSourced.total || candidatesArray.length,
        current: workOrderBasedSourced.page || 1,
      }));
    }
  }, [workOrderBasedSourced]);

  useEffect(() => {
    if (exactMatchData) {
      setPagination((prev) => ({
        ...prev,
        total: exactMatchData.total || exactMatchData.users?.length || 0,
        current: exactMatchData.page || 1,
      }));
    }
  }, [exactMatchData]);

  useEffect(() => {
    if (primaryFiltersApplied && filteredCandidates.length > 0) {
      setPagination((prev) => ({
        ...prev,
        total: filteredTotal,
      }));
    }
  }, [primaryFiltersApplied, filteredCandidates, filteredTotal]);

  const allCandidates = useMemo(() => {
    const jobAppCandidates =
      jobApplications?.formResponses?.map((response) => ({
        ...response.user,
        status: response.status,
        applicationId: response._id,
        responses: response.responses,
        isApplied: true,
      })) || [];

    let candidatesArray = [];
    if (primaryFiltersApplied) {
      candidatesArray = Array.isArray(filteredCandidates)
        ? filteredCandidates
        : [];
    } else if (isWorkOrderFiltered) {
      candidatesArray = Array.isArray(workOrderCandidates)
        ? workOrderCandidates
        : [];
    } else if (isExactMatch) {
      candidatesArray = Array.isArray(exactMatchData?.users)
        ? exactMatchData.users
        : [];
    } else {
      // Always use workOrderBasedSourced for default and filtered cases
      candidatesArray = Array.isArray(workOrderBasedSourced?.candidates)
        ? workOrderBasedSourced.candidates
        : [];
    }

    // Apply client-side filtering when shouldFetch is true
    if (
      shouldFetch &&
      !primaryFiltersApplied &&
      !isWorkOrderFiltered &&
      !isExactMatch
    ) {
      candidatesArray = candidatesArray.filter((candidate) => {
        // Keywords filter
        if (filters.keywords.trim()) {
          const keywords = filters.keywords.toLowerCase();
          const searchableText = [
            candidate.firstName,
            candidate.lastName,
            candidate.email,
            candidate.currentCompany,
            ...(candidate.skills || []),
            ...(candidate.workExperience?.map((exp) => exp.company) || []),
            ...(candidate.workExperience?.map((exp) => exp.jobTitle) || []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(keywords)) return false;
        }

        // Experience filter
        if (filters.experience[0].trim() || filters.experience[1].trim()) {
          const experience = candidate.totalExperienceYears || 0;
          const minExp = filters.experience[0].trim()
            ? parseFloat(filters.experience[0])
            : 0;
          const maxExp = filters.experience[1].trim()
            ? parseFloat(filters.experience[1])
            : Infinity;

          if (experience < minExp || experience > maxExp) {
            return false;
          }
        }

        // Location filter
        if (filters.location.trim()) {
          const candidateLocation =
            candidate.currentLocation || candidate.location || "";
          if (
            !candidateLocation
              .toLowerCase()
              .includes(filters.location.toLowerCase())
          ) {
            return false;
          }
        }

        // Company filter
        if (filters.company.trim()) {
          const currentCompany =
            candidate.currentCompany ||
            candidate.workExperience?.[0]?.company ||
            "";
          if (
            !currentCompany
              .toLowerCase()
              .includes(filters.company.toLowerCase())
          ) {
            return false;
          }
        }

        // Skills filter
        if (filters.skills.length > 0) {
          const candidateSkills = (candidate.skills || []).map((skill) =>
            skill.toLowerCase()
          );
          const hasRequiredSkills = filters.skills.some((skill) =>
            candidateSkills.includes(skill.toLowerCase())
          );
          if (!hasRequiredSkills) return false;
        }

        // Qualifications filter
        if (filters.qualifications.length > 0) {
          const candidateQualifications = (candidate.qualifications || []).map(
            (q) => q.toLowerCase()
          );
          const hasRequiredQual = filters.qualifications.some((qual) =>
            candidateQualifications.includes(qual.toLowerCase())
          );
          if (!hasRequiredQual) return false;
        }

        // Job roles filter
        if (filters.jobRoles.length > 0) {
          const candidateRoles = [
            candidate.currentJobTitle,
            ...(candidate.workExperience?.map((exp) => exp.jobTitle) || []),
          ]
            .filter(Boolean)
            .map((role) => role.toLowerCase());

          const hasRequiredRole = filters.jobRoles.some((role) =>
            candidateRoles.some((candidateRole) =>
              candidateRole.includes(role.toLowerCase())
            )
          );
          if (!hasRequiredRole) return false;
        }

        // Industries filter
        if (filters.industries.length > 0) {
          const candidateIndustries = [
            candidate.industry,
            ...(candidate.workExperience?.map((exp) => exp.industry) || []),
          ]
            .filter(Boolean)
            .map((ind) => ind.toLowerCase());

          const hasRequiredIndustry = filters.industries.some((industry) =>
            candidateIndustries.includes(industry.toLowerCase())
          );
          if (!hasRequiredIndustry) return false;
        }

        // Salary filter
        if (filters.salary[0].trim() || filters.salary[1].trim()) {
          const candidateSalary =
            candidate.expectedSalary || candidate.currentSalary || 0;
          const minSalary = filters.salary[0].trim()
            ? parseFloat(filters.salary[0])
            : 0;
          const maxSalary = filters.salary[1].trim()
            ? parseFloat(filters.salary[1])
            : Infinity;

          if (candidateSalary < minSalary || candidateSalary > maxSalary) {
            return false;
          }
        }

        // Gender filter
        if (filters.gender && candidate.gender !== filters.gender) {
          return false;
        }

        // Nationality filter
        if (
          filters.nationality &&
          candidate.nationality !== filters.nationality
        ) {
          return false;
        }

        // Age filter
        if (filters.ageRange[0].trim() || filters.ageRange[1].trim()) {
          if (candidate.age) {
            const minAge = filters.ageRange[0].trim()
              ? parseFloat(filters.ageRange[0])
              : 0;
            const maxAge = filters.ageRange[1].trim()
              ? parseFloat(filters.ageRange[1])
              : Infinity;

            if (candidate.age < minAge || candidate.age > maxAge) {
              return false;
            }
          }
        }

        // Languages filter
        if (filters.languages.length > 0) {
          const candidateLanguages = (candidate.languages || []).map((lang) =>
            lang.toLowerCase()
          );
          const hasRequiredLanguage = filters.languages.some((lang) =>
            candidateLanguages.includes(lang.toLowerCase())
          );
          if (!hasRequiredLanguage) return false;
        }

        return true;
      });
    }

    const sourcedCandidates = candidatesArray.map((user) => ({
      ...user,
      status: user.status || "sourced",
      applicationId: user._id,
      isApplied: false,
      isSourced: true,
      isExactMatch: isExactMatch,
      currentCompany: user.workExperience?.[0]?.company || user.currentCompany,
      totalExperienceYears: user.totalExperienceYears || 0,
    }));

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
  }, [
    jobApplications,
    exactMatchData,
    isExactMatch,
    workOrderCandidates,
    isWorkOrderFiltered,
    workOrderBasedSourced,
    shouldFetch,
    filters,
    filteredCandidates,
    primaryFiltersApplied,
  ]);

  const handleApplyFilters = async (appliedFilters) => {
    try {
      console.log("Applying filters:", appliedFilters);

      setAdvancedFilters(appliedFilters);
      setPrimaryFiltersApplied(true);

      const response = await filterCandidates({
        ...appliedFilters,
        page: 1,
        limit: pagination.pageSize,
      }).unwrap();

      console.log("Filter response:", response);

      const candidates = response?.candidates || response?.users || [];

      // Handle the pagination data structure from your API
      const total = response?.total || 0;
      const currentPage = response?.page || 1;
      const totalPages = response?.pages || 1;

      console.log("Filtered candidates:", candidates);
      console.log("Pagination info:", { total, currentPage, totalPages });

      setFilteredCandidates(candidates);
      setFilteredTotal(total);

      // Update pagination state with correct values
      setPagination((prev) => ({
        ...prev,
        current: currentPage,
        total: total,
        pageSize: prev.pageSize,
      }));

      message.success(`Found ${total} candidates matching your criteria`);
    } catch (error) {
      console.error("Filter error:", error);
      message.error("Failed to apply filters. Please try again.");
    }
  };

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

      const response = await CurrentWorkorderFiltering({
        body: payload,
      }).unwrap();

      setWorkOrderCandidates(response.data || []);
      setIsWorkOrderFiltered(true);

      // Clear other search states
      setShouldFetch(false);
      setIsExactMatch(false);
      message.success("Work order details submitted successfully!");
      setIsWorkOrderModalVisible(false);
    } catch (error) {
      console.error(error);
      message.error("Please fix the errors in the form");
    }
  };
  const sourcedCandidates = useMemo(() => {
    // Use the correct candidates array based on active filters
    let candidatesToFilter = [];

    if (primaryFiltersApplied) {
      candidatesToFilter = allCandidates; // This should contain filteredCandidates
    } else if (!shouldFetch && !isExactMatch && !isWorkOrderFiltered) {
      // Default case - workOrderBasedSourced with 'candidates' array
      const defaultCandidates = Array.isArray(workOrderBasedSourced?.candidates)
        ? workOrderBasedSourced.candidates
        : [];
      candidatesToFilter = defaultCandidates.map((user) => ({
        ...user,
        status: user.status || "sourced",
        applicationId: user._id,
        isApplied: false,
        isSourced: true,
        currentCompany:
          user.workExperience?.[0]?.company || user.currentCompany,
        totalExperienceYears: user.totalExperienceYears || 0,
      }));
    } else {
      candidatesToFilter = allCandidates;
    }

    return candidatesToFilter.filter((candidate) => {
      const status = candidate.status;
      return (
        status !== "selected" &&
        (status === "sourced" || status === "applied" || !status)
      );
    });
  }, [
    allCandidates,
    shouldFetch,
    isExactMatch,
    isWorkOrderFiltered,
    workOrderBasedSourced,
    primaryFiltersApplied,
  ]);

  const hasActiveFilters = useMemo(() => {
    return (
      primaryFiltersApplied ||
      filters.keywords.trim() ||
      filters.skills.length > 0 ||
      filters.location.trim() ||
      filters.company.trim() ||
      filters.qualifications.length > 0 ||
      filters.jobRoles.length > 0 ||
      filters.industries.length > 0 ||
      filters.languages.length > 0 ||
      filters.experience[0].trim() ||
      filters.experience[1].trim() ||
      filters.salary[0].trim() ||
      filters.salary[1].trim() ||
      filters.ageRange[0].trim() ||
      filters.ageRange[1].trim() ||
      filters.gender ||
      filters.nationality ||
      filters.noticePeriod ||
      filters.profileUpdated ||
      filters.visaStatus ||
      isExactMatch ||
      isWorkOrderFiltered
    );
  }, [filters, isExactMatch, isWorkOrderFiltered, primaryFiltersApplied]);

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

    // Convert filters to query parameters
    const params = {};

    // Basic text filters
    if (tempFilters.keywords.trim())
      params.keywords = tempFilters.keywords.trim();
    if (tempFilters.location.trim())
      params.location = tempFilters.location.trim();
    if (tempFilters.company.trim()) params.company = tempFilters.company.trim();

    // Array filters - join with commas
    if (tempFilters.skills.length > 0)
      params.skills = tempFilters.skills.join(",");
    if (tempFilters.qualifications.length > 0)
      params.qualifications = tempFilters.qualifications.join(",");
    if (tempFilters.jobRoles.length > 0)
      params.jobRoles = tempFilters.jobRoles.join(",");
    if (tempFilters.industries.length > 0)
      params.industries = tempFilters.industries.join(",");
    if (tempFilters.languages.length > 0)
      params.languages = tempFilters.languages.join(",");

    // Range filters - send min and max separately
    if (tempFilters.experience[0]?.toString().trim())
      params.experienceMin = tempFilters.experience[0];
    if (tempFilters.experience[1]?.toString().trim())
      params.experienceMax = tempFilters.experience[1];

    if (tempFilters.salary[0]?.toString().trim())
      params.salaryMin = tempFilters.salary[0];
    if (tempFilters.salary[1]?.toString().trim())
      params.salaryMax = tempFilters.salary[1];

    if (tempFilters.ageRange[0]?.toString().trim())
      params.ageMin = tempFilters.ageRange[0];
    if (tempFilters.ageRange[1]?.toString().trim())
      params.ageMax = tempFilters.ageRange[1];

    // Single value filters
    if (tempFilters.gender) params.gender = tempFilters.gender;
    if (tempFilters.nationality) params.nationality = tempFilters.nationality;
    if (tempFilters.noticePeriod)
      params.noticePeriod = tempFilters.noticePeriod;
    if (tempFilters.profileUpdated)
      params.profileUpdated = tempFilters.profileUpdated;
    if (tempFilters.visaStatus) params.visaStatus = tempFilters.visaStatus;

    console.log("Query parameters being sent:", params); // For debugging

    setQueryParams(params);
    setFilters({ ...tempFilters });
    setShouldFetch(false); // Set to false since we're using server-side filtering
    setIsExactMatch(false);
    setIsWorkOrderFiltered(false);
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
    setQueryParams({}); // Clear query parameters object

    setAdvancedFilters({});
    setFilteredCandidates([]);
    setFilteredTotal(0);
    setPrimaryFiltersApplied(false);

    setShouldFetch(false);
    setIsExactMatch(false);
    setIsWorkOrderFiltered(false);
    setWorkOrderCandidates([]);

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
        clearedFilters.experience = ["", ""];
        break;
      case "salary":
        clearedFilters.salary = ["", ""];
        break;
      case "ageRange":
        clearedFilters.ageRange = ["", ""];
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
        refetchWorkOrderBased();
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
        refetchWorkOrderBased();
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

  const handlePaginationChange = async (page, pageSize) => {
    if (primaryFiltersApplied) {
      // Handle primary filter pagination
      try {
        const response = await filterCandidates({
          ...advancedFilters,
          page: page,
          limit: pageSize,
        }).unwrap();

        const candidates = response?.candidates || response?.users || [];
        const total = response?.total || 0;
        const currentPage = response?.page || page;
        const totalPages = response?.pages || 1;

        setFilteredCandidates(candidates);
        setFilteredTotal(total);

        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: pageSize,
          total: total,
        }));

        console.log("Pagination updated:", { currentPage, total, pageSize });
      } catch (error) {
        message.error("Failed to load more candidates");
        console.error("Pagination error:", error);
      }
    } else {
      // Existing pagination logic for other filters
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize,
      }));
      setSelectAll(false);
    }
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

  const SuggestionMatchInfo = () => {
    return (
      <Alert
        message="Suggestion Match Criteria"
        description={
          <div>
            <Text>Candidates are matched based on the following criteria:</Text>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Work order description and candidate profile summary</li>
              <li>Required skills matching candidate skills</li>
              <li>
                Work order company industry and candidate industry experience
              </li>
              <li>Work order job function and candidate job title/role</li>
            </ul>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              The system analyzes these factors to find the most relevant
              candidates for your position.
            </Text>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: "16px" }}
        closable
      />
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
              Candidate Filters
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
            {/* <Button
              type="default"
              onClick={() => setIsWorkOrderModalVisible(true)}
              style={{ backgroundColor: "#1890ff", color: "#fff" }}
            >
              Current Work Order Filter
            </Button> */}

            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setAdvancedFiltersVisible(true)}
              style={{ backgroundColor: "#da2c46" }}
            >
              Advanced Primary Filter
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
                      {primaryFiltersApplied && (
                        <Tag
                          color="red"
                          closable
                          onClose={() => {
                            setPrimaryFiltersApplied(false);
                            setFilteredCandidates([]);
                            setFilteredTotal(0);
                            setAdvancedFilters({});
                          }}
                        >
                          Primary Filters Active
                        </Tag>
                      )}

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
                      {isWorkOrderFiltered && (
                        <Tag
                          color="blue"
                          closable
                          onClose={() => {
                            setIsWorkOrderFiltered(false);
                            setWorkOrderCandidates([]);
                          }}
                        >
                          Work Order Filter
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
                      {((filters.experience[0] &&
                        filters.experience[0].toString().trim()) ||
                        (filters.experience[1] &&
                          filters.experience[1].toString().trim())) && (
                        <Tag
                          color="red"
                          closable
                          onClose={() =>
                            handleClearSpecificFilter("experience")
                          }
                        >
                          Exp: {filters.experience[0] || "0"}-
                          {filters.experience[1] || "∞"} years
                        </Tag>
                      )}
                      {((filters.salary[0] &&
                        filters.salary[0].toString().trim()) ||
                        (filters.salary[1] &&
                          filters.salary[1].toString().trim())) && (
                        <Tag
                          color="gold"
                          closable
                          onClose={() => handleClearSpecificFilter("salary")}
                        >
                          <DollarOutlined /> SAR {filters.salary[0] || "0"} -
                          SAR {filters.salary[1] || "∞"}
                        </Tag>
                      )}

                      {((filters.ageRange[0] &&
                        filters.ageRange[0].toString().trim()) ||
                        (filters.ageRange[1] &&
                          filters.ageRange[1].toString().trim())) && (
                        <Tag
                          color="cyan"
                          closable
                          onClose={() => handleClearSpecificFilter("ageRange")}
                        >
                          Age: {filters.ageRange[0] || "0"} -{" "}
                          {filters.ageRange[1] || "∞"}
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
              {selectedCandidates.length} selected of{" "}
              {Array.isArray(sourcedCandidates) ? sourcedCandidates.length : 0}{" "}
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
      {isExactMatch && !isExactMatchLoading && <SuggestionMatchInfo />}

      {(shouldFetch ||
        isExactMatch ||
        isWorkOrderFiltered ||
        primaryFiltersApplied) &&
        sourcedCandidates.length >= 0 && (
          <Card
            size="small"
            style={{
              marginBottom: "16px",
              backgroundColor: isExactMatch ? "#f0f9ff" : "#f6ffed",
              borderColor: isExactMatch ? "#1890ff" : "#52c41a",
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={4}>
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
        {!shouldFetch &&
        !isExactMatch &&
        !isWorkOrderFiltered &&
        !primaryFiltersApplied &&
        (!workOrderBasedSourced?.candidates ||
          workOrderBasedSourced.candidates.length === 0) ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                Use the advanced filters or suggestion match to find candidates
              </span>
            }
          />
        ) : isWorkOrderLoading ||
          isExactMatchLoading ||
          isUpdatingStatus ||
          filterLoading ||
          (!shouldFetch &&
            !isExactMatch &&
            !isWorkOrderFiltered &&
            !primaryFiltersApplied &&
            !workOrderBasedSourced) ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        ) : workOrderError || exactMatchError ? (
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
                current={
                  primaryFiltersApplied
                    ? pagination.current
                    : pagination.current
                }
                pageSize={pagination.pageSize}
                total={primaryFiltersApplied ? filteredTotal : pagination.total}
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
            <span> Candidate Filters</span>
            {hasActiveFilters ||
              (workOrderDetails && (
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={() => {
                    setTempFilters(initialFilters);
                    setSkillInput("");
                  }}
                  style={{ marginRight: 10 }}
                >
                  Reset All Filters
                </Button>
              ))}
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
        <Button
          type="primary"
          style={{ marginBottom: 16, backgroundColor: "#da2c46" }}
          loading={isWorkOrderLoadingOne}
          onClick={() => {
            if (workOrderDetails) {
              setTempFilters((prev) => ({
                ...prev,
                experience: [
                  workOrderDetails.experienceMin || "",
                  workOrderDetails.experienceMax || "",
                ],
                salary: [
                  workOrderDetails.salaryMin || "",
                  workOrderDetails.salaryMax || "",
                ],
                qualifications: workOrderDetails.Education
                  ? [workOrderDetails.Education]
                  : [],
                skills: workOrderDetails.requiredSkills || [],
                languages: workOrderDetails.languagesRequired || [],
                industries: workOrderDetails.companyIndustry
                  ? [workOrderDetails.companyIndustry]
                  : [],
                nationality: workOrderDetails.nationality || "",
              }));
            }
          }}
        >
          Get Work Order Details
        </Button>

        <Form layout="vertical">
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
              <Form.Item label="Experience Range (Years)">
                <Input.Group compact>
                  <Input
                    style={{ width: "45%" }}
                    placeholder="Min"
                    value={tempFilters.experience[0]}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        experience: [e.target.value, prev.experience[1]],
                      }))
                    }
                  />
                  <Input
                    style={{
                      width: "10%",
                      textAlign: "center",
                      pointerEvents: "none",
                      backgroundColor: "#fafafa",
                    }}
                    placeholder="~"
                    disabled
                  />
                  <Input
                    style={{ width: "45%" }}
                    placeholder="Max"
                    value={tempFilters.experience[1]}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        experience: [prev.experience[0], e.target.value],
                      }))
                    }
                  />
                </Input.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Annual Salary Range (SAR)"
                extra="Annual salary"
              >
                <Input.Group compact>
                  <Input
                    style={{ width: "45%" }}
                    placeholder="Min"
                    value={tempFilters.salary[0]}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        salary: [e.target.value, prev.salary[1]],
                      }))
                    }
                  />
                  <Input
                    style={{
                      width: "10%",
                      textAlign: "center",
                      pointerEvents: "none",
                      backgroundColor: "#fafafa",
                    }}
                    placeholder="~"
                    disabled
                  />
                  <Input
                    style={{ width: "45%" }}
                    placeholder="Max"
                    value={tempFilters.salary[1]}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        salary: [prev.salary[0], e.target.value],
                      }))
                    }
                  />
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
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

          <Row gutter={[16, 16]}></Row>

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
                <Input.Group compact>
                  <Input
                    style={{ width: "45%" }}
                    placeholder="Min"
                    value={tempFilters.ageRange[0]}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        ageRange: [e.target.value, prev.ageRange[1]],
                      }))
                    }
                  />
                  <Input
                    style={{
                      width: "10%",
                      textAlign: "center",
                      pointerEvents: "none",
                      backgroundColor: "#fafafa",
                    }}
                    placeholder="~"
                    disabled
                  />
                  <Input
                    style={{ width: "45%" }}
                    placeholder="Max"
                    value={tempFilters.ageRange[1]}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        ageRange: [prev.ageRange[0], e.target.value],
                      }))
                    }
                  />
                </Input.Group>
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
        {isWorkOrderLoadingOne ? (
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

      <AdvancedFiltersModal
        visible={advancedFiltersVisible}
        onCancel={() => setAdvancedFiltersVisible(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={advancedFilters}
        filterOptions={filterOptions}
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

export default SourcedCandidates;

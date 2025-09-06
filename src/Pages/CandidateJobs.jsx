import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Space,
  Badge,
  Modal,
  message,
  Divider,
  Descriptions,
  List,
  Spin,
  Input,
  Form,
  Select,
  Dropdown,
  Avatar,
  Pagination,
  Result,
  Skeleton,
  Drawer,
  AutoComplete,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BulbOutlined,
  TeamOutlined,
  EyeOutlined,
  BankOutlined,
  CalendarOutlined,
  GlobalOutlined,
  BookOutlined,
  FilterOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetJobsByBranchQuery,
  useLazySearchJobsQuery,
  useLazyFilterJobsQuery,
  useGetJobSuggestionsQuery,
} from "../Slices/Users/UserApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const CandidateJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailVisible, setJobDetailVisible] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [jobs, setJobs] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false); // Add this state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [postedDateFilter, setPostedDateFilter] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [showingFilterResults, setShowingFilterResults] = useState(false);

  const navigate = useNavigate();

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const debouncedLocationFilter = useDebounce(locationFilter, 500);

  const {
    data: apiData,
    isLoading: initialLoading,
    error: initialError,
  } = useGetJobsByBranchQuery();

  const [
    searchJobs,
    { data: searchData, isLoading: searchLoading, error: searchError },
  ] = useLazySearchJobsQuery();

  const {
    data: suggestionsData,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useGetJobSuggestionsQuery(
    { searchQuery: debouncedSearchKeyword, fetchLocation: false },
    {
      skip:
        !shouldFetchSuggestions ||
        !debouncedSearchKeyword ||
        debouncedSearchKeyword.length < 2,
    }
  );

  const {
    data: locationSuggestionsData,
    isLoading: locationSuggestionsLoading,
  } = useGetJobSuggestionsQuery(
    { searchQuery: debouncedLocationFilter, fetchLocation: true },
    {
      skip:
        !shouldFetchSuggestions ||
        !debouncedLocationFilter ||
        debouncedLocationFilter.length < 2,
    }
  );

  const [
    filterJobs,
    { data: filterData, isLoading: filterLoading, error: filterError },
  ] = useLazyFilterJobsQuery();

  useEffect(() => {
    if (debouncedSearchKeyword && debouncedSearchKeyword.length >= 2) {
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchKeyword]);

  useEffect(() => {
    if (debouncedSearchKeyword && debouncedSearchKeyword.length >= 2) {
      setShouldFetchSuggestions(true);
      setShowSuggestions(true);
    } else {
      setShouldFetchSuggestions(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchKeyword]);

  useEffect(() => {
    if (suggestionsData && Array.isArray(suggestionsData)) {
      const formattedSuggestions = suggestionsData.map((item) => ({
        value: item.title,
        label: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{item.title}</span>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {item.officeLocation}
            </Text>
          </div>
        ),
        title: item.title,
        location: item.officeLocation,
      }));
      setSuggestions(formattedSuggestions);
    }
  }, [suggestionsData]);

  useEffect(() => {
    if (locationSuggestionsData && Array.isArray(locationSuggestionsData)) {
      setLocationSuggestions(
        locationSuggestionsData.map((item) => ({
          value: item.officeLocation,
          label: item.officeLocation,
        }))
      );
    }
  }, [locationSuggestionsData]);

  useEffect(() => {
    if (apiData?.workorders && !showingSearchResults && !showingFilterResults) {
      const transformedJobs = transformJobData(apiData.workorders);
      setFilteredJobs(transformedJobs);
    }
  }, [apiData, showingSearchResults, showingFilterResults]);

  useEffect(() => {
    if (searchData?.jobs && showingSearchResults) {
      const transformedJobs = transformJobData(searchData.jobs);
      setFilteredJobs(transformedJobs);
    }
  }, [searchData, showingSearchResults]);

  useEffect(() => {
    if (filterData?.jobs && showingFilterResults) {
      const transformedJobs = transformJobData(filterData.jobs);
      setFilteredJobs(transformedJobs);
    }
  }, [filterData, showingFilterResults]);

  const transformJobData = (jobs) => {
    if (!jobs || !Array.isArray(jobs)) return [];

    return jobs
      .filter((job) => job.isActive === "active")
      .map((job) => ({
        _id: job._id || "",
        title: job.title || "No title",
        company: "Company Name",
        companyLogo: "https://via.placeholder.com/40",
        location: job.officeLocation || "Location not specified",
        workType:
          job.workplace === "on-site"
            ? "On-site"
            : job.workplace === "remote"
            ? "Remote"
            : "Hybrid",
        employmentType:
          job.EmploymentType === "full-time"
            ? "Full-time"
            : job.EmploymentType === "part-time"
            ? "Part-time"
            : job.EmploymentType === "contract"
            ? "Contract"
            : job.EmploymentType === "internship"
            ? "Internship"
            : "Full-time",
        experience: job.Experience
          ? `${job.Experience}+ years`
          : "Not specified",
        salary:
          job.salaryType === "annual" && job.annualSalary
            ? `₹${(job.annualSalary / 100000).toFixed(1)} LPA`
            : job.salaryType === "monthly" && job.monthlySalary
            ? `₹${job.monthlySalary}/month`
            : "Salary not disclosed",
        postedDate: job.createdAt,
        skills: job.requiredSkills || [],
        description: job.description || "No description available",
        requirements: job.jobRequirements ? [job.jobRequirements] : [],
        isRemote: job.workplace === "remote",
        isSaved: false,
        jobCode: job.jobCode,
        startDate: job.startDate,
        endDate: job.endDate,
        deadlineDate: job.deadlineDate,
        numberOfCandidate: job.numberOfCandidate,
        benefits: job.benefits || [],
        education: job.Education,
        companyIndustry: job.companyIndustry,
        workOrderStatus: job.workOrderStatus,
        isActive: job.isActive,
      }));
  };

  const handleFilterJobs = async () => {
    // If no filters are applied, show all jobs
    if (
      !workTypeFilter &&
      !employmentTypeFilter &&
      !experienceFilter &&
      !postedDateFilter &&
      !locationFilter
    ) {
      setShowingFilterResults(false);
      setShowingSearchResults(false);
      return;
    }

    setIsFiltering(true);
    try {
      const filterParams = {};

      if (locationFilter) filterParams.location = locationFilter;

      if (workTypeFilter) {
        const workTypeMap = {
          Remote: "remote",
          "On-site": "on-site",
          Hybrid: "hybrid",
        };
        filterParams.workplace = workTypeMap[workTypeFilter] || workTypeFilter;
      }

      if (employmentTypeFilter) {
        const employmentTypeMap = {
          "Full-time": "full-time",
          "Part-time": "part-time",
          Contract: "contract",
          Internship: "internship",
        };
        filterParams.employmentType =
          employmentTypeMap[employmentTypeFilter] || employmentTypeFilter;
      }

      if (experienceFilter) {
        const expValue =
          experienceFilter === "0" ? 0 : parseInt(experienceFilter);
        filterParams.experience = expValue;
      }

      if (postedDateFilter) {
        const postedDateMap = {
          "1day": "today",
          "1week": "week",
          "1month": "month",
          "1year": "year",
        };
        filterParams.postedWithin =
          postedDateMap[postedDateFilter] || postedDateFilter;
      }

      await filterJobs(filterParams);
      setShowingFilterResults(true);
      setShowingSearchResults(false);
      setCurrentPage(1);
    } catch (error) {
      message.error("Failed to filter jobs. Please try again.");
      console.error("Filter error:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim() && !locationFilter.trim()) {
      setShowingSearchResults(false);
      setShowingFilterResults(false);
      setCurrentPage(1);
      return;
    }

    setIsSearching(true);
    try {
      await searchJobs({
        title: searchKeyword.trim() || "",
        location: locationFilter.trim() || "",
      });
      setShowingSearchResults(true);
      setShowingFilterResults(false);
      setCurrentPage(1);
    } catch (error) {
      message.error("Failed to search jobs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setLocationFilter("");
    setShowingSearchResults(false);
    setShowingFilterResults(false);
    clearFilters();
  };

  const clearFilters = () => {
    setWorkTypeFilter("");
    setEmploymentTypeFilter("");
    setExperienceFilter("");
    setPostedDateFilter("");
    setShowingFilterResults(false);
  };

  const handleJobClick = (job) => {
    navigate(`/candidate-jobs/${job._id}`);
  };

  const handleSaveJob = (job) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(job._id)) {
      newSavedJobs.delete(job._id);
      message.success("Job removed from saved jobs");
    } else {
      newSavedJobs.add(job._id);
      message.success("Job saved successfully");
    }
    setSavedJobs(newSavedJobs);
    setFilteredJobs((prevJobs) =>
      prevJobs.map((j) => ({
        ...j,
        isSaved: j._id === job._id ? !j.isSaved : j.isSaved,
      }))
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "today";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getCurrentPageJobs = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredJobs.slice(startIndex, endIndex);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (workTypeFilter) count++;
    if (employmentTypeFilter) count++;
    if (experienceFilter) count++;
    if (postedDateFilter) count++;
    return count;
  };

  const FilterForm = ({ isDrawer = false }) => (
    <div
      style={{
        padding: isDrawer ? "0" : "16px",
        minWidth: isDrawer ? "auto" : "280px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {!isDrawer && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <Text strong style={{ fontSize: "16px", color: "#da2c46" }}>
              Filter Jobs
            </Text>
            <Button type="link" onClick={clearFilters} size="small">
              Clear All
            </Button>
          </div>
        )}

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Work Type
          </Text>
          <Select
            placeholder="Select work type"
            style={{ width: "100%" }}
            value={workTypeFilter}
            onChange={setWorkTypeFilter}
            allowClear
          >
            <Option value="Remote">Remote</Option>
            <Option value="On-site">On-site</Option>
            <Option value="Hybrid">Hybrid</Option>
          </Select>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Employment Type
          </Text>
          <Select
            placeholder="Select employment type"
            style={{ width: "100%" }}
            value={employmentTypeFilter}
            onChange={setEmploymentTypeFilter}
            allowClear
          >
            <Option value="Full-time">Full-time</Option>
            <Option value="Part-time">Part-time</Option>
            <Option value="Contract">Contract</Option>
            <Option value="Internship">Internship</Option>
          </Select>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Experience Level
          </Text>
          <Select
            placeholder="Select experience"
            style={{ width: "100%" }}
            value={experienceFilter}
            onChange={setExperienceFilter}
            allowClear
          >
            <Option value="0">Fresher (0-2 years)</Option>
            <Option value="3">Mid (3-5 years)</Option>
            <Option value="6">Senior (6-10 years)</Option>
            <Option value="11">Executive (10+ years)</Option>
          </Select>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Posted Date
          </Text>
          <Select
            placeholder="Select time period"
            style={{ width: "100%" }}
            value={postedDateFilter}
            onChange={setPostedDateFilter}
            allowClear
          >
            <Option value="1day">Last 24 hours</Option>
            <Option value="1week">Last week</Option>
            <Option value="1month">Last month</Option>
            <Option value="1year">Last year</Option>
          </Select>
        </div>

        {!isDrawer && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Button type="link" onClick={clearFilters} style={{ flex: 1 }}>
              Clear All
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleFilterJobs();
                setMobileFiltersVisible(false);
              }}
              style={{
                flex: 1,
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                border: "none",
              }}
              loading={isFiltering}
            >
              Apply Filters
            </Button>
          </div>
        )}

        {isDrawer && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Button type="link" onClick={clearFilters} style={{ flex: 1 }}>
              Clear All
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleFilterJobs();
                setMobileFiltersVisible(false);
              }}
              style={{
                flex: 1,
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                border: "none",
              }}
              loading={isFiltering}
            >
              Apply Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const filterDropdownMenu = {
    items: [
      {
        key: "filters",
        label: <FilterForm />,
      },
    ],
  };

  const isLoading =
    initialLoading ||
    (isSearching && searchLoading) ||
    (isFiltering && filterLoading);

  const error =
    initialError ||
    (showingSearchResults && searchError) ||
    (showingFilterResults && filterError);

  if (isLoading) {
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

  if (error) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <Result
          status="404"
          title="There are no jobs available for now!!!"
          extra={[
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              key="retry"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Retry
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#2c3e50",
              fontSize: "clamp(20px, 4vw, 28px)",
              lineHeight: "1.2",
            }}
          >
            <BulbOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Your Perfect Job Awaits
          </Title>
          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 8,
              fontSize: "clamp(12px, 2.5vw, 14px)",
              padding: "0 16px",
            }}
          >
            Browse opportunities that reflect your abilities and aspirations.
          </Text>
        </div>

        <Card
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="desktop-search" style={{ display: "block" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                <AutoComplete
                  size="large"
                  placeholder="Job title or keyword"
                  value={searchKeyword}
                  options={showSuggestions ? suggestions : []}
                  onChange={(value) => {
                    setSearchKeyword(value);
                    if (value.length < 2) {
                      setShouldFetchSuggestions(false);
                    }
                  }}
                  onSelect={(value, option) => {
                    setSearchKeyword(option.title);
                    if (option.location) {
                      setLocationFilter(option.location);
                    }
                    setShowSuggestions(false);
                    setShouldFetchSuggestions(false);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  onFocus={() => {
                    if (searchKeyword && searchKeyword.length >= 2) {
                      setShowSuggestions(true);
                      setShouldFetchSuggestions(true);
                    }
                  }}
                  dropdownClassName="job-suggestions-dropdown"
                  notFoundContent={
                    suggestionsLoading ? (
                      <div style={{ padding: "8px", textAlign: "center" }}>
                        <Spin size="small" /> Loading suggestions...
                      </div>
                    ) : shouldFetchSuggestions && searchKeyword.length >= 2 ? (
                      "No suggestions found"
                    ) : null
                  }
                  style={{ width: "100%" }}
                >
                  <Input
                    size="large"
                    allowClear
                    prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
                    onPressEnter={handleSearch}
                  />
                </AutoComplete>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <AutoComplete
                  size="large"
                  placeholder="City or country"
                  value={locationFilter}
                  options={showSuggestions ? locationSuggestions : []}
                  onChange={(value) => {
                    setLocationFilter(value);
                    if (value.length < 2) {
                      setShouldFetchSuggestions(false);
                    } else {
                      setShouldFetchSuggestions(true);
                    }
                  }}
                  onSelect={(value) => {
                    setLocationFilter(value);
                    setShowSuggestions(false);
                    setShouldFetchSuggestions(false);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  notFoundContent={
                    locationSuggestionsLoading ? (
                      <div style={{ padding: "8px", textAlign: "center" }}>
                        <Spin size="small" /> Loading locations...
                      </div>
                    ) : shouldFetchSuggestions && locationFilter.length >= 2 ? (
                      "No location suggestions found"
                    ) : null
                  }
                  style={{ width: "100%" }}
                >
                  <Input
                    size="large"
                    allowClear
                    prefix={
                      <EnvironmentOutlined style={{ color: "#da2c46" }} />
                    }
                    onPressEnter={handleSearch}
                  />
                </AutoComplete>
              </Col>

              <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                <div className="desktop-filter" style={{ display: "none" }}>
                  <Dropdown
                    menu={filterDropdownMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      size="large"
                      style={{ width: "100%", position: "relative" }}
                      loading={isFiltering}
                    >
                      <FilterOutlined />
                      Filters
                      <DownOutlined
                        style={{ fontSize: "10px", marginLeft: "4px" }}
                      />
                      {getActiveFiltersCount() > 0 && (
                        <Badge
                          count={getActiveFiltersCount()}
                          size="small"
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            backgroundColor: "#da2c46",
                          }}
                        />
                      )}
                    </Button>
                  </Dropdown>
                </div>
                <div className="mobile-filter" style={{ display: "block" }}>
                  <Button
                    size="large"
                    style={{ width: "100%", position: "relative" }}
                    onClick={() => setMobileFiltersVisible(true)}
                    loading={isFiltering}
                  >
                    <FilterOutlined />
                    <span style={{ display: "none" }}>Filters</span>
                    {getActiveFiltersCount() > 0 && (
                      <Badge
                        count={getActiveFiltersCount()}
                        size="small"
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          backgroundColor: "#da2c46",
                        }}
                      />
                    )}
                  </Button>
                </div>
              </Col>
              <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  loading={isSearching}
                  style={{
                    width: "100%",
                    background:
                      "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                    border: "none",
                  }}
                  onClick={handleSearch}
                >
                  <span className="search-text" style={{ display: "inline" }}>
                    Search
                  </span>
                </Button>
              </Col>
            </Row>
          </div>
        </Card>

        {showingSearchResults && (
          <Card style={{ marginBottom: "16px", borderRadius: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text style={{ fontWeight: 500, fontSize: "14px" }}>
                  Search results for:
                </Text>
                {searchKeyword && (
                  <Tag color="blue" style={{ fontSize: "12px" }}>
                    "{searchKeyword}"
                  </Tag>
                )}
                {locationFilter && (
                  <Tag color="green" style={{ fontSize: "12px" }}>
                    <EnvironmentOutlined /> {locationFilter}
                  </Tag>
                )}
              </div>
              <Button type="link" size="small" onClick={clearSearch}>
                <CloseOutlined /> Clear Search
              </Button>
            </div>
          </Card>
        )}

        <Drawer
          title="Filter Jobs"
          placement="bottom"
          closable={true}
          onClose={() => setMobileFiltersVisible(false)}
          open={mobileFiltersVisible}
          height="auto"
          style={{ maxHeight: "80vh" }}
        >
          <FilterForm isDrawer={true} />
        </Drawer>

        {getActiveFiltersCount() > 0 && (
          <Card style={{ marginBottom: "16px", borderRadius: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Text style={{ fontWeight: 500, fontSize: "14px" }}>
                Active Filters:
              </Text>
              {workTypeFilter && (
                <Tag
                  closable
                  onClose={() => setWorkTypeFilter("")}
                  color="blue"
                  style={{ fontSize: "12px" }}
                >
                  Work: {workTypeFilter}
                </Tag>
              )}
              {employmentTypeFilter && (
                <Tag
                  closable
                  onClose={() => setEmploymentTypeFilter("")}
                  color="green"
                  style={{ fontSize: "12px" }}
                >
                  Employment: {employmentTypeFilter}
                </Tag>
              )}
              {experienceFilter && (
                <Tag
                  closable
                  onClose={() => setExperienceFilter("")}
                  color="orange"
                  style={{ fontSize: "12px" }}
                >
                  Exp: {experienceFilter}
                </Tag>
              )}
              {postedDateFilter && (
                <Tag
                  closable
                  onClose={() => setPostedDateFilter("")}
                  color="purple"
                  style={{ fontSize: "12px" }}
                >
                  Posted:{" "}
                  {postedDateFilter === "1day"
                    ? "Last 24h"
                    : postedDateFilter === "1week"
                    ? "Last week"
                    : postedDateFilter === "1month"
                    ? "Last month"
                    : "Last year"}
                </Tag>
              )}
              <Button type="link" size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </Card>
        )}

        <div style={{ marginBottom: "16px" }}>
          <Text
            style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: 500,
              color: "#374151",
            }}
          >
            {filteredJobs.length} jobs found
            {showingSearchResults && " (from search results)"}
            {showingFilterResults && " (filtered results)"}
          </Text>
        </div>

        {filteredJobs.length > 0 ? (
          <>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              }}
            >
              {getCurrentPageJobs().map((job, index) => (
                <div
                  key={job._id}
                  style={{
                    padding: "16px",
                    borderBottom:
                      index === getCurrentPageJobs().length - 1
                        ? "none"
                        : "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleJobClick(job)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div className="mobile-job-card" style={{ display: "block" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Avatar
                          src={job.companyLogo}
                          size={40}
                          style={{ backgroundColor: "#f0f0f0", flexShrink: 0 }}
                          icon={<BankOutlined />}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                              fontSize: "clamp(16px, 3vw, 18px)",
                              lineHeight: "1.3",
                              color: "#1a1a1a",
                            }}
                          >
                            {job.title}
                          </Title>
                          <Text
                            style={{
                              fontSize: "clamp(12px, 2.5vw, 14px)",
                              color: "#666",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            {job.companyIndustry || job.company}
                          </Text>
                          {job.jobCode && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "11px",
                                display: "block",
                                marginTop: "2px",
                              }}
                            >
                              Code: {job.jobCode}
                            </Text>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <Button
                          type="text"
                          icon={
                            savedJobs.has(job._id) ? (
                              <HeartFilled style={{ color: "#da2c46" }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job);
                          }}
                        />
                        <Tag
                          color={
                            job.workType === "Remote"
                              ? "green"
                              : job.workType === "Hybrid"
                              ? "blue"
                              : "orange"
                          }
                          style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            fontWeight: 500,
                          }}
                        >
                          {job.workType}
                        </Tag>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <EnvironmentOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          {job.location}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <DollarOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          {job.salary}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ClockCircleOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          {job.experience}
                        </Text>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                        marginBottom: "12px",
                      }}
                    >
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <Tag
                          key={index}
                          style={{
                            fontSize: "10px",
                            padding: "0 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {skill}
                        </Tag>
                      ))}
                      {job.skills.length > 3 && (
                        <Tooltip
                          title={job.skills.slice(3).join(", ")}
                          placement="top"
                        >
                          <Tag
                            style={{
                              fontSize: "10px",
                              padding: "0 6px",
                              borderRadius: "4px",
                            }}
                          >
                            +{job.skills.length - 3} more
                          </Tag>
                        </Tooltip>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CalendarOutlined />
                        Posted {formatDate(job.postedDate)}
                      </Text>
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          background:
                            "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                          border: "none",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "24px",
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredJobs.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                itemRender={(current, type, originalElement) => {
                  if (type === "prev") {
                    return (
                      <Button
                        style={{
                          background: "#fff",
                          color: "#da2c46",
                          borderColor: "#d9d9d9",
                        }}
                      >
                        Previous
                      </Button>
                    );
                  }
                  if (type === "next") {
                    return (
                      <Button
                        style={{
                          background: "#fff",
                          color: "#da2c46",
                          borderColor: "#d9d9d9",
                        }}
                      >
                        Next
                      </Button>
                    );
                  }
                  if (type === "page") {
                    return (
                      <Button
                        style={{
                          background:
                            current === currentPage ? "#da2c46" : "#fff",
                          color: current === currentPage ? "#fff" : "#da2c46",
                          borderColor: "#d9d9d9",
                        }}
                      >
                        {current}
                      </Button>
                    );
                  }
                  return originalElement;
                }}
              />
            </div>
          </>
        ) : (
          <Card
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
              borderRadius: "12px",
            }}
          >
            <Empty
              description={
                <Text
                  style={{
                    fontSize: "clamp(14px, 2.5vw, 16px)",
                    color: "#666",
                  }}
                >
                  {showingSearchResults || showingFilterResults
                    ? "No jobs match your search criteria"
                    : "No jobs available at the moment"}
                </Text>
              }
            >
              {showingSearchResults || showingFilterResults ? (
                <Button
                  type="primary"
                  onClick={() => {
                    clearSearch();
                    clearFilters();
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  }}
                >
                  Clear search and filters
                </Button>
              ) : null}
            </Empty>
          </Card>
        )}
      </div>
      <style jsx>
        {`
          .job-suggestions-dropdown {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
            border: 1px solid #e0e0e0 !important;
          }

          .job-suggestions-dropdown .ant-select-item {
            padding: 12px 16px !important;
            border-bottom: 1px solid #f5f5f5;
          }

          .job-suggestions-dropdown .ant-select-item:last-child {
            border-bottom: none;
          }

          .job-suggestions-dropdown .ant-select-item:hover {
            background-color: #f8f9fa !important;
          }

          .job-suggestions-dropdown .ant-select-item-option-selected {
            background-color: #fff2f4 !important;
            border-left: 3px solid #da2c46 !important;
          }
        `}
      </style>
    </>
  );
};

export default CandidateJobs;

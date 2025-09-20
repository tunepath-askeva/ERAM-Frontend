import React, { useState, useEffect, useRef } from "react";
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
  List,
  Spin,
  Input,
  Select,
  Avatar,
  Pagination,
  Result,
  Skeleton,
  Drawer,
  Progress,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  EyeOutlined,
  BankOutlined,
  CalendarOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  PoweroffOutlined,
  GroupOutlined,
  UsergroupAddOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetRecruiterJobsQuery,
  useUpdateJobStatusMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import SkeletonLoader from "../../Global/SkeletonLoader";
import { useSnackbar } from "notistack";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const RecruiterJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [currentRecruiterEmail, setCurrentRecruiterEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // 'activate' or 'deactivate'
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [description, setDescription] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const searchTimerRef = useRef(null);

  const {
    data: apiData,
    isLoading,
    error,
  } = useGetRecruiterJobsQuery({
    page: currentPage,
    limit: pageSize,
    searchText: debouncedSearch,
    status: filterStatus !== "all" ? filterStatus : undefined,
  });

  const [updateJobStatus, { isLoading: isUpdatingStatus }] =
    useUpdateJobStatusMutation();

  const primaryColor = "#da2c46";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (apiData?.jobs) {
      const transformedJobs = transformJobData(apiData.jobs);

      const sortedJobs = [...transformedJobs].sort((a, b) => {
        if (a.isActive === b.isActive) return 0;
        return a.isActive ? -1 : 1;
      });

      setFilteredJobs(sortedJobs);
    }
  }, [apiData]);

  useEffect(() => {
    const recruiterInfo = JSON.parse(
      localStorage.getItem("recruiterInfo") || "{}"
    );
    setCurrentRecruiterEmail(recruiterInfo.email || "");
  }, []);

  const transformJobData = (jobs) => {
    if (!jobs || !Array.isArray(jobs)) return [];

    return jobs.map((job) => ({
      _id: job._id || "",
      title: job.title || "No title",
      company: job.project?.name || "Company Name",
      location: job.officeLocation || job.workplace || "Location not specified",
      workType:
        job.workplace === "on-site"
          ? "On-site"
          : job.workplace === "remote"
          ? "Remote"
          : "Hybrid",
      employmentType: job.EmploymentType || "Full-time",
      experience: job.experienceMin
        ? `${job.experienceMin}${
            job.experienceMax ? `-${job.experienceMax}` : ""
          } years`
        : "Not specified",
      salary:
        job.salaryType === "annual"
          ? `SAR ${
              job.salaryMin ? parseInt(job.salaryMin).toLocaleString() : ""
            }${
              job.salaryMax
                ? `-${parseInt(job.salaryMax).toLocaleString()}`
                : ""
            }/year`
          : job.salaryType === "monthly"
          ? `SAR ${job.salaryMin ? job.salaryMin : ""}${
              job.salaryMax ? `-${job.salaryMax}` : ""
            }/month`
          : "Salary not disclosed",
      postedDate: job.createdAt,
      skills: job.requiredSkills || [],
      description: job.description || "No description available",
      requirements: job.jobRequirements ? [job.jobRequirements] : [],
      isActive: job.isActive === "active",
      jobCode: job.jobCode,
      applications: job.numberOfCandidate || 0,
      pipeline: job.pipeline?.[0]?.name || "No Pipeline",
      stages: job.pipeline?.[0]?.stages?.map((stage) => stage.name) || [],
      assignedRecruiters: job.assignedRecruiters || [],
      deadline: job.deadlineDate,
      numberOfCandidate: job.numberOfCandidate || 0,
      numberOfEmployees: job.numberOfEmployees || 0,
      requisitionNo: job.requisitionNo || null,
      referenceNo: job.referenceNo || null,
    }));
  };

  const handleJobClick = (job) => {
    navigate(`/recruiter-jobs/${job._id}`);
  };

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const handleDeactivateJob = (job, e) => {
    e.stopPropagation();
    setSelectedJobForModal(job);
    setModalType("deactivate");
    setDescription("");
    setModalVisible(true);
  };

  const handleActivateJob = (job, e) => {
    e.stopPropagation();
    setSelectedJobForModal(job);
    setModalType("activate");
    setDescription("");
    setModalVisible(true);
  };

  const handleModalConfirm = async () => {
    if (!description.trim()) {
      message.error("Please provide a description");
      return;
    }

    try {
      const status = modalType === "activate" ? "active" : "inactive";

      await updateJobStatus({
        jobId: selectedJobForModal._id,
        status: status,
        description: description.trim(),
      }).unwrap();

      message.success(
        `Job ${
          modalType === "activate" ? "activated" : "deactivated"
        } successfully`
      );

      // Close modal and reset state
      setModalVisible(false);
      setDescription("");
      setSelectedJobForModal(null);
      setModalType("");
    } catch (error) {
      console.error("Error updating job status:", error);
      message.error(
        error?.data?.message || `Failed to ${modalType} job. Please try again.`
      );
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setDescription("");
    setSelectedJobForModal(null);
    setModalType("");
  };

  // Updated function to only check assignedRecruiters array
  const isRecruiterAssigned = (assignedRecruiters) => {
    return assignedRecruiters.some(
      (recruiter) =>
        recruiter.email.toLowerCase() === currentRecruiterEmail.toLowerCase()
    );
  };

  const handleEditJob = (job, e) => {
    e.stopPropagation();
    navigate(`/recruiter-jobs/edit/${job._id}`, { state: { jobData: job } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "today";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // remove slice from getCurrentPageJobs
  const getCurrentPageJobs = () => {
    return filteredJobs; // no slicing, API already paginates
  };

  if (isLoading) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <Result
          status="404"
          title="No Jobs assigned yet for you."
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
          My Job Assignments
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
          Manage your assigned recruitment pipelines and candidates
        </Text>
      </div>

      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={16} md={16} lg={16} xl={16}>
            <Input
              allowClear
              placeholder="Search jobs by title, company or location"
              size="large"
              prefix={<SearchOutlined style={{ color: primaryColor }} />}
              value={searchText}
              onChange={handleSearchChange}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: "16px" }}>
        <Text
          style={{
            fontSize: "clamp(14px, 2.5vw, 16px)",
            fontWeight: 500,
            color: "#374151",
          }}
        >
          {
            filteredJobs.filter((job) => {
              const matchesSearch =
                searchText === "" ||
                job.title.toLowerCase().includes(searchText.toLowerCase()) ||
                job.company.toLowerCase().includes(searchText.toLowerCase()) ||
                job.location.toLowerCase().includes(searchText.toLowerCase());

              const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "active" && job.isActive) ||
                (filterStatus === "inactive" && !job.isActive);

              return matchesSearch && matchesStatus;
            }).length
          }{" "}
          jobs found
          {filterStatus !== "all" && ` (${filterStatus})`}
        </Text>
      </div>

      {getCurrentPageJobs().length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {getCurrentPageJobs().map((job) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={job._id}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    if (!job.isActive) {
                      enqueueSnackbar(
                        "Your deadline is up. Please contact your admin.",
                        {
                          variant: "warning",
                        }
                      );
                      return;
                    }
                    handleJobClick(job);
                  }}
                  actions={[
                    ...(isRecruiterAssigned(job.assignedRecruiters)
                      ? [
                          hasPermission("edit-job") && (
                            <Tooltip title="Edit Job" key="edit">
                              <EditOutlined
                                onClick={(e) => handleEditJob(job, e)}
                                style={{ fontSize: "16px" }}
                              />
                            </Tooltip>
                          ),
                          hasPermission("deactivate-job") &&
                            (job.isActive ? (
                              <Tooltip title="Deactivate Job" key="deactivate">
                                <PoweroffOutlined
                                  onClick={(e) => handleDeactivateJob(job, e)}
                                  style={{ fontSize: "16px", color: "#ff4d4f" }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Activate Job" key="activate">
                                <CheckCircleOutlined
                                  onClick={(e) => handleActivateJob(job, e)}
                                  style={{ fontSize: "16px", color: "#52c41a" }}
                                />
                              </Tooltip>
                            )),
                        ].filter(Boolean)
                      : []),
                    <Tooltip title="View Details" key="view">
                      <EyeOutlined
                        onClick={(e) => {
                          console.log("Card clicked:", job.isActive);
                          e.stopPropagation();
                          if (!job.isActive) {
                            enqueueSnackbar(
                              "Your deadline is up. Please contact your admin.",
                              {
                                variant: "warning",
                              }
                            );
                            return;
                          }
                          handleJobClick(job);
                        }}
                        style={{ fontSize: "16px", color: primaryColor }}
                      />
                    </Tooltip>,
                  ].filter(Boolean)}
                >
                  <div style={{ position: "relative" }}>
                    <Tag
                      color={job.isActive ? "green" : "red"}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        fontSize: "10px",
                        textTransform: "uppercase",
                        fontWeight: 500,
                        zIndex: 1,
                      }}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </Tag>

                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          lineHeight: "1.3",
                          color: "#1a1a1a",
                          height: "40px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        title={job.title}
                      >
                        {job.title}
                      </Title>
                      <Text
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          display: "block",
                        }}
                      >
                        {job.company}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "16px", // spacing between items
                        marginBottom: "8px",
                      }}
                    >
                      {job.jobCode && (
                        <Text style={{ fontSize: "10px" }}>
                          Job Code: {job.jobCode}
                        </Text>
                      )}

                      {job.requisitionNo && (
                        <Text style={{ fontSize: "10px" }}>
                          Requisition No: {job.requisitionNo}
                        </Text>
                      )}

                      {job.referenceNo && (
                        <Text style={{ fontSize: "10px" }}>
                          Reference No: {job.referenceNo}
                        </Text>
                      )}
                    </div>

                    {/* Key Details */}
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginBottom: "6px",
                        }}
                      >
                        <EnvironmentOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          style={{ fontSize: "11px", color: "#666" }}
                          title={`${job.location} • ${job.workType}`}
                        >
                          {job.location.length > 15
                            ? `${job.location.substring(0, 15)}...`
                            : job.location}{" "}
                          • {job.workType}
                        </Text>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginBottom: "6px",
                        }}
                      >
                        <DollarOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          style={{ fontSize: "11px", color: "#666" }}
                          title={job.salary}
                        >
                          {job.salary.length > 20
                            ? `${job.salary.substring(0, 20)}...`
                            : job.salary}
                        </Text>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginBottom: "6px",
                        }}
                      >
                        <CalendarOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text style={{ fontSize: "11px", color: "#666" }}>
                          Deadline:{" "}
                          {new Date(job.deadline).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>

                    {/* Employee Progress */}
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginBottom: "4px",
                        }}
                      >
                        <UsergroupAddOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: "10px",
                            color:
                              job.numberOfEmployees > job.numberOfCandidate
                                ? "red"
                                : "#444",
                          }}
                        >
                          Employees: {job.numberOfEmployees}/
                          {job.numberOfCandidate}
                          {job.numberOfEmployees > job.numberOfCandidate && (
                            <WarningOutlined
                              style={{ color: "red", marginLeft: 4 }}
                            />
                          )}
                        </Text>
                      </div>
                      <Progress
                        percent={Math.min(
                          (job.numberOfEmployees / job.numberOfCandidate) * 100,
                          100
                        )}
                        size="small"
                        showInfo={false}
                        strokeColor={
                          job.numberOfEmployees > job.numberOfCandidate
                            ? "red"
                            : "#52c41a"
                        }
                      />
                    </div>

                    {/* Pipeline & Stages */}
                    <div style={{ marginBottom: "12px" }}>
                      <Tag
                        color="blue"
                        style={{ fontSize: "9px", marginBottom: "4px" }}
                      >
                        {job.pipeline}
                      </Tag>
                      <div>
                        {job.stages.slice(0, 2).map((stage, index) => (
                          <Tag
                            key={index}
                            style={{
                              fontSize: "9px",
                              padding: "0 4px",
                              borderRadius: "4px",
                              marginBottom: "2px",
                            }}
                          >
                            {stage.length > 8
                              ? `${stage.substring(0, 8)}...`
                              : stage}
                          </Tag>
                        ))}
                        {job.stages.length > 2 && (
                          <Tooltip
                            title={job.stages.slice(2).join(", ")}
                            placement="top"
                          >
                            <Tag style={{ fontSize: "9px", padding: "0 4px" }}>
                              +{job.stages.length - 2}
                            </Tag>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {/* Posted Date */}
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        justifyContent: "center",
                      }}
                    >
                      <CalendarOutlined />
                      Posted {formatDate(job.postedDate)}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
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
              total={apiData?.totalCount || 0} // ✅ Use totalCount from transformResponse
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger={true}
              pageSizeOptions={["5", "10", "20", "50", "100", "150"]}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`
              } // Optional: show total info
              itemRender={(current, type, originalElement) => {
                if (type === "prev") {
                  return <Button>Previous</Button>;
                }
                if (type === "next") {
                  return <Button>Next</Button>;
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
                {searchText || filterStatus !== "all"
                  ? "No jobs match your search criteria"
                  : "No jobs assigned to you yet"}
              </Text>
            }
          >
            {searchText || filterStatus !== "all" ? (
              <Button
                type="primary"
                onClick={() => {
                  setSearchText("");
                  setFilterStatus("all");
                }}
                style={{
                  background: primaryColor,
                  border: "none",
                }}
              >
                Clear search and filters
              </Button>
            ) : null}
          </Empty>
        </Card>
      )}

      <Modal
        title={`${modalType === "activate" ? "Activate" : "Deactivate"} Job`}
        open={modalVisible}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
        okText={modalType === "activate" ? "Activate" : "Deactivate"}
        okType={modalType === "activate" ? "primary" : "danger"}
        cancelText="Cancel"
        confirmLoading={isUpdatingStatus}
        okButtonProps={{
          style: {
            backgroundColor: "#da2c46",
            borderColor: "#da2c46",
            color: "white",
            marginTop: "15px",
          },
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text strong>
            Are you sure you want to {modalType} "{selectedJobForModal?.title}"?
          </Text>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Please provide a reason: <span style={{ color: "red" }}>*</span>
          </Text>
          <Input.TextArea
            placeholder={`Enter reason for ${
              modalType === "activate" ? "activating" : "deactivating"
            } this job...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
            style={{ resize: "none" }}
          />
        </div>
      </Modal>

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default RecruiterJobs;

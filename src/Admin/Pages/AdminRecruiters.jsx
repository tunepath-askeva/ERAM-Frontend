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
  Pagination,
  Result,
} from "antd";
import {
  PlusOutlined,
  StopOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BankOutlined,
  GlobalOutlined,
  DeleteOutlined,
  LockOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
} from "@ant-design/icons";
import RecruiterForm from "../Components/RecruiterForm";
import { useSnackbar } from "notistack";

import {
  useGetRecruitersQuery,
  useDisableRecruiterStatusMutation,
  useGetRecruiterByIdQuery,
  useDeleteRecruiterMutation,
} from "../../Slices/Admin/AdminApis.js";
import SkeletonLoader from "../../Global/SkeletonLoader.jsx";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const permissionGroups = [
  {
    title: "Side Navigation Tabs",
    icon: <DashboardOutlined />,
    permissions: [
      { key: "dashboard", label: "Dashboard" },
      { key: "requisition", label: "Requisition" },
      { key: "jobs", label: "Jobs" },
      { key: "jobs-timeline", label: "Jobs Timeline" },
      { key: "all-candidates", label: "All Candidates" },
      { key: "all-cvs", label: "All CVs" },
      { key: "candidates", label: "Interview Candidates" },
      { key: "interviews", label: "Assigned Interviews" },
      { key: "staged-candidates", label: "Staged Candidates" },
      { key: "completed-candidates", label: "Completed Candidates" },
      { key: "approvals", label: "Approvals" },
      { key: "employees", label: "Employees" },
      { key: "notifications", label: "Notifications" },
    ],
  },
  {
    title: "Dashbaord Management",
    icon: <DashboardOutlined />,
    permissions: [
      { key: "view-get-details-button", label: "View Get More Details Button" },
    ],
  },
  {
    title: "Requisition Management",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "edit-requisitions", label: "Edit Requisition" },
      { key: "add-requisitions", label: "Add Requisition" },
      { key: "delete-requisitions", label: "Delete Requisition" },
    ],
  },
  {
    title: "Job Management",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "edit-job", label: "Edit Job" },
      { key: "deactivate-job", label: "Deactivate/Activate Job" },
      { key: "view-job-status", label: "View Work Order Status Tab" },
      { key: "view-job-sourced", label: "View Sourced Candidates Tab" },
      { key: "view-job-sourced-cv", label: "View Sourced CVs Tab" },
      { key: "view-job-selected", label: "View Selected Candidates Tab" },
      // { key: "view-job-selected", label: "View Selected Candidates Tab" },
      { key: "view-job-applied", label: "View Applied Candidates Tab" },
      { key: "view-job-applied-cv", label: "View Applied CVs Tab" },
      { key: "view-job-declined", label: "View Declined Candidates Tab" },
      { key: "view-job-pending", label: "View Pending Candidates Tab" },
      { key: "view-job-screening", label: "View Screening Candidates Tab" },
    ],
  },
  {
    title: "Candidate Management",
    icon: <TeamOutlined />,
    permissions: [
      { key: "view-all-candidates", label: "View All Candidates" },
      { key: "view-candidates", label: "View Candidates Icon" },
      { key: "add-candidate", label: "Add Candidate" },
      { key: "bulk-upload", label: "Bulk Upload Candidates" },
      { key: "edit-candidate-details", label: "Edit Candidate" },
      { key: "export-candidate-details", label: "Export Candidate" },
      {
        key: "notify-candidates-button",
        label: "View Notify Candidates Button",
      },
    ],
  },
  {
    title: "CVs Management",
    icon: <TeamOutlined />,
    permissions: [
      { key: "view-cv", label: "View CV" },
      { key: "convert-candidate", label: "Convert CV to Candidate" },
      { key: "download-cv", label: "Download CV" },
      { key: "add-cv-remarks", label: "Add Remarks" },
      { key: "delete-cv", label: "Delete CV" },
      { key: "import-cvs", label: "Import CV" },
      { key: "export-cvs", label: "Export CV" },
    ],
  },

  {
    title: "Interview Candidate Actions",
    icon: <TeamOutlined />,
    permissions: [
      // { key: "download-documents", label: "Download Documents" },
      // { key: "send-messages", label: "Send Messages" },
      { key: "view-profile", label: "View Candidate Profile" },
      // { key: "move-to-interview", label: "Move to Interview" },
      { key: "make-offer", label: "Make Offer" },
      { key: "move-to-offer", label: "Move to Offer" },
      { key: "move-to-pipeline", label: "Move to Pipeline" },
      { key: "reject-candidate", label: "Reject Candidate" },
      { key: "schedule-interview", label: "Schedule Interview" },
      { key: "reschedule-interview", label: "Reschedule Interview" },
      {
        key: "view-interviews",
        label: "View Interviews tab (in candidate profile drawer)",
      },
      {
        key: "view-pipeline",
        label: "View Pipeline tab (in candidate profile drawer)",
      },
      {
        key: "view-offer-details",
        label: "View Offer details tab (in candidate profile drawer)",
      },
      { key: "change-interview-status", label: "Change Interview Status" },
    ],
  },

  {
    title: "Staged Candidate Actions",
    icon: <SettingOutlined />,
    permissions: [
      {
        key: "notify-candidate",
        label: "Notify Candidate",
      },
      {
        key: "export-to-excel",
        label: "Export Button visible",
      },
    ],
  },
  {
    title: "Completed Candidate Actions",
    icon: <SettingOutlined />,
    permissions: [
      { key: "convert-to-employee", label: "Convert to Employee" },
      {
        key: "view-candidate-details-tab",
        label: "View Candidate Details Tab(in profile drawer)",
      },
      {
        key: "view-timeline-tab",
        label: "View Timeline tab (in profile drawer)",
      },
      {
        key: "view-documents-tab",
        label: "View Documents Tab (in profile drawer)",
      },
      {
        key: "view-download-icon",
        label: "View Downlaod icon (in documents tab in drawer)",
      },
    ],
  },
  {
    title: "Notifications Management",
    icon: <BellOutlined />,
    permissions: [
      { key: "delete-notify", label: "Delete Notification Button" },
      { key: "clear-all-notify", label: "Clear All notification Button" },
    ],
  },
  {
    title: "Tab Views for Interview candidates",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "view-interview-tab", label: "View Interview Tab" },

      { key: "view-offer_pending-tab", label: "View Offer Pending Tab" },
      { key: "view-offer_revised-tab", label: "View Offer Revised Tab" },
      { key: "view-offer-tab", label: "View Offer Tab" },
      { key: "view-rejected-tab", label: "View Rejected Tab" },
      // { key: "view-overview-tab", label: "View Overview Tab" },
      // { key: "view-activity-tab", label: "View Activity Tab" },
      // { key: "view-documents-tab", label: "View Documents Tab" },
    ],
  },
];

const getViewPermissionGroups = (recruiterType) => {
  // EMPLOYEE ADMIN PERMISSIONS
  if (recruiterType === "Employee Admin") {
    return [
      {
        title: "Side Navigation Tabs",
        icon: <DashboardOutlined />,
        permissions: [
          { key: "dashboard", label: "Dashboard" },
          { key: "all-employee", label: "All Employee" },
          { key: "leave-request", label: "Leave Request" },
          { key: "other-request", label: "Other Request" },
          { key: "payroll", label: "Payroll" },
          { key: "employee-documents", label: "Employee Documents" },
          { key: "expiring-documents", label: "Expiring Documents" },
          { key: "company-policies", label: "Company Policies" },
          { key: "news", label: "News" },
          { key: "feedback-suggestion", label: "Feedback/Suggestion" },
          { key: "notifications", label: "Notifications" },
        ],
      },
      {
        title: "Employee Management",
        icon: <TeamOutlined />,
        permissions: [
          { key: "add-employee", label: "Add Employee" },
          { key: "import-employee-csv", label: "Import CSV" },
          { key: "export-employee-csv", label: "Export CSV" },
          { key: "edit-employee", label: "Edit Employee" },
          { key: "delete-employee", label: "Delete Employee" },
        ],
      },
      {
        title: "Leave Request Management",
        icon: <CalendarOutlined />,
        permissions: [
          { key: "approve-leave-request", label: "Approve Leave Request" },
          { key: "reject-leave-request", label: "Reject Leave Request" },
        ],
      },
      {
        title: "Other Request Management",
        icon: <FileTextOutlined />,
        permissions: [
          { key: "approve-other-request", label: "Approve Other Request" },
          { key: "reject-other-request", label: "Reject Other Request" },
          { key: "add-travel-ticket", label: "Add Travel Ticket" },
          { key: "approve-travel-ticket", label: "Approve Travel Ticket" },
        ],
      },
      {
        title: "Payroll Management",
        icon: <BankOutlined />,
        permissions: [{ key: "edit-payroll", label: "Edit Payroll" }],
      },
      {
        title: "Employee Documents Management",
        icon: <FileTextOutlined />,
        permissions: [
          { key: "view-employee-documents", label: "View Employee Documents" },
          {
            key: "download-employee-documents",
            label: "Download Employee Documents",
          },
          { key: "notify-employee-documents", label: "Notify Employee" },
        ],
      },
      {
        title: "Expiring Documents Management",
        icon: <FileTextOutlined />,
        permissions: [
          {
            key: "notify-selected-expiring-docs",
            label: "Notify Selected Employees",
          },
        ],
      },
      {
        title: "News Management",
        icon: <BellOutlined />,
        permissions: [
          { key: "create-news", label: "Create News" },
          { key: "edit-news", label: "Edit News" },
          { key: "publish-news", label: "Publish News" },
          { key: "delete-news", label: "Delete News" },
        ],
      },
    ];
  }

  // NORMAL RECRUITER PERMISSIONS (your existing ones)
  return permissionGroups; // keep your original list here
};

const AdminRecruiter = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [recruiterModalVisible, setRecruiterModalVisible] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [recruiterToToggle, setRecruiterToToggle] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recruiterToDelete, setRecruiterToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: recruitersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRecruitersQuery({
    searchTerm: debouncedSearchTerm,
    page: currentPage,
    pageSize: pageSize,
  });

  const [toggleRecruiterStatus, { isLoading: isToggling }] =
    useDisableRecruiterStatusMutation();

  const [deleteRecruiter, { isLoading: isDeleting }] =
    useDeleteRecruiterMutation();

  const {
    data: selectedRecruiterResponse,
    isLoading: isLoadingRecruiterDetails,
    isError: isRecruiterDetailsError,
    error: recruiterDetailsError,
  } = useGetRecruiterByIdQuery(selectedRecruiterId, {
    skip: !selectedRecruiterId || !viewModalVisible,
  });

  const recruiters = recruitersResponse?.recruiters || [];
  const totalCount = recruitersResponse?.totalCount || 0;
  const totalPages = recruitersResponse?.totalPages || 0;
  const selectedRecruiterData =
    selectedRecruiterResponse?.recruiter || selectedRecruiterResponse;

  useEffect(() => {
    if (isError) {
      message.error(
        `Failed to load members: ${
          error?.data?.message || error?.message || "Unknown error"
        }`
      );
    }
  }, [isError, error]);

  const filteredRecruiters = recruiters.filter((recruiter) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      recruiter.fullName?.toLowerCase().includes(searchLower) ||
      recruiter.companyName?.toLowerCase().includes(searchLower) ||
      recruiter.email?.toLowerCase().includes(searchLower) ||
      recruiter.phone?.toLowerCase().includes(searchLower) ||
      recruiter.specialization?.toLowerCase().includes(searchLower)
    );
  });

  // Handle recruiter details error
  useEffect(() => {
    if (isRecruiterDetailsError && viewModalVisible) {
      message.error(
        `Failed to load member details: ${
          recruiterDetailsError?.data?.message ||
          recruiterDetailsError?.message ||
          "Unknown error"
        }`
      );
    }
  }, [isRecruiterDetailsError, recruiterDetailsError, viewModalVisible]);

  const showDisableModal = (recruiter) => {
    setRecruiterToToggle(recruiter);
    setDisableModalVisible(true);
  };

  const handleDisableCancel = () => {
    setDisableModalVisible(false);
    setRecruiterToToggle(null);
  };

  const handleToggleStatus = async () => {
    if (!recruiterToToggle) return;

    try {
      const newStatus =
        recruiterToToggle.accountStatus === "active" ? "inActive" : "active";

      await toggleRecruiterStatus({
        recruiterId: recruiterToToggle._id,
        accountStatus: newStatus,
      }).unwrap();

      const action = newStatus === "active" ? "enabled" : "disabled";
      enqueueSnackbar(
        `Member "${getRecruiterDisplayName(
          recruiterToToggle
        )}" ${action} successfully`,
        {
          variant: "success",
        }
      );

      setDisableModalVisible(false);
      setRecruiterToToggle(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message ||
          `Failed to ${
            recruiterToToggle.accountStatus === "active" ? "disable" : "enable"
          } member`,
        {
          variant: "error",
        }
      );
      console.error("Toggle status error:", error);
    }
  };

  // Delete functionality
  const showDeleteModal = (recruiter) => {
    setRecruiterToDelete(recruiter);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setRecruiterToDelete(null);
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDeleteRecruiter = async () => {
    if (!recruiterToDelete) return;

    try {
      await deleteRecruiter(recruiterToDelete._id).unwrap();

      enqueueSnackbar(
        `Member "${getRecruiterDisplayName(
          recruiterToDelete
        )}" deleted successfully`,
        {
          variant: "success",
        }
      );

      setDeleteModalVisible(false);
      setRecruiterToDelete(null);
      refetch();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to delete recruiter", {
        variant: "error",
      });
      console.error("Delete recruiter error:", error);
    }
  };

  const showCreateModal = () => {
    setEditingRecruiter(null);
    setRecruiterModalVisible(true);
  };

  const showEditModal = (recruiter) => {
    setEditingRecruiter(recruiter);
    setRecruiterModalVisible(true);
  };

  const handleRecruiterModalClose = () => {
    setRecruiterModalVisible(false);
    setEditingRecruiter(null);
  };

  const handleRecruiterSuccess = (newRecruiter) => {
    refetch();
    const action = editingRecruiter ? "updated" : "created";
    message.success(`Member ${action} successfully!`);
  };

  const handleViewRecruiter = (recruiterId) => {
    setSelectedRecruiterId(recruiterId);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedRecruiterId(null);
  };

  // Helper function to get recruiter display name
  const getRecruiterDisplayName = (recruiter) => {
    return recruiter?.fullName || recruiter?.companyName || "Unknown Member";
  };

  const getRecruiterLocation = (recruiter) => {
    return recruiter?.specialization || recruiter?.location || "Not specified";
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
          "@media (min-width: 576px)": {
            padding: "24px",
          },
          "@media (min-width: 768px)": {
            padding: "32px",
          },
        }}
      >
        <div className="recruiter-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Title Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "200px",
              }}
            >
              <UserOutlined
                size={24}
                style={{ marginRight: "8px", color: "#2c3e50" }}
              />
              <Title
                level={2}
                className="recruiter-title"
                style={{ margin: 0, color: "#2c3e50", fontSize: "22px" }}
              >
                Recruitment Team Management
              </Title>
            </div>

            {/* Search and Button Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flex: 1,
                justifyContent: "flex-end",
                minWidth: "300px",
              }}
            >
              <Input.Search
                placeholder="Search Members"
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  borderRadius: "8px",
                  height: "35px",
                }}
                size="large"
                className="custom-search-input"
              />

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
                className="recruiter-button"
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  height: "48px",
                  minWidth: "180px",
                }}
              >
                Add New Member
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader />
        ) : recruiters?.length > 0 ? (
          <>
            <Row
              gutter={[16, 16]}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              {recruiters.map((recruiter) => (
                <div key={recruiter._id}>
                  <Card
                    style={{
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    title={
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
                          style={{
                            display: "flex",
                            alignItems: "center",
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <UserOutlined
                            style={{
                              color: "#da2c46",
                              marginRight: 8,
                              fontSize: "16px",
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            strong
                            style={{
                              fontSize: "14px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={getRecruiterDisplayName(recruiter)}
                          >
                            {getRecruiterDisplayName(recruiter)}
                          </Text>
                        </div>
                        <Tag
                          color={
                            recruiter.accountStatus === "active"
                              ? "green"
                              : "red"
                          }
                        >
                          {recruiter.accountStatus}
                        </Tag>
                      </div>
                    }
                    extra={
                      <Space size="small">
                        <Tooltip title="View Details">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewRecruiter(recruiter._id)}
                          />
                        </Tooltip>
                        <Tooltip title="Edit Member">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(recruiter)}
                          />
                        </Tooltip>
                        <Tooltip
                          title={
                            recruiter.accountStatus === "active"
                              ? "Disable Member"
                              : "Enable Member"
                          }
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={
                              recruiter.accountStatus === "active" ? (
                                <StopOutlined />
                              ) : (
                                <CheckCircleOutlined />
                              )
                            }
                            onClick={() => showDisableModal(recruiter)}
                            style={{
                              color:
                                recruiter.accountStatus === "active"
                                  ? "#ff4d4f"
                                  : "#52c41a",
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Delete Member">
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteModal(recruiter)}
                            style={{
                              color: "#ff4d4f",
                            }}
                          />
                        </Tooltip>
                      </Space>
                    }
                    bodyStyle={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <MailOutlined
                            style={{ marginRight: 8, color: "#666" }}
                          />
                          <Text>{recruiter.email}</Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <PhoneOutlined
                            style={{ marginRight: 8, color: "#666" }}
                          />
                          <Text>{recruiter.phone}</Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <TeamOutlined
                            style={{ marginRight: 8, color: "#666" }}
                          />
                          <Text>{recruiter?.recruiterType}</Text>
                        </div>
                        {recruiter.experienceYears && (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Badge
                              count={`${recruiter.experienceYears}y exp`}
                              style={{ backgroundColor: "#52c41a" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </Row>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "24px",
                padding: "16px",
              }}
            >
              <Pagination
                current={currentPage}
                total={totalCount}
                pageSize={pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} members`
                }
                pageSizeOptions={["12", "24", "36", "64", "128"]}
              />
            </div>
          </>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              marginTop: "16px",
            }}
          >
            {isError ? (
              <Result
                status="500"
                title="Failed to Load Recruiters"
                subTitle="Please try refreshing the page."
              />
            ) : searchTerm ? (
              <Result
                status="404"
                title="No Recruiters Found"
                subTitle="Try adjusting your search criteria."
              />
            ) : (
              <Result
                status="404"
                title="No Recruiters Added Yet"
                subTitle="Add your first recruiter to get started."
              />
            )}
          </Card>
        )}
      </div>

      {/* Recruiter Form Modal - Used for both Create and Edit */}
      <RecruiterForm
        open={recruiterModalVisible}
        onCancel={handleRecruiterModalClose}
        onSuccess={handleRecruiterSuccess}
        mode={editingRecruiter ? "edit" : "add"}
        title={editingRecruiter ? "Edit Member" : "Add New Member"}
        initialValues={editingRecruiter}
        recruiterId={editingRecruiter?._id}
      />

      {/* View Recruiter Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined
              style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
            />
            <span style={{ fontSize: "16px", fontWeight: 600 }}>
              Member Details
            </span>
          </div>
        }
        open={viewModalVisible}
        onCancel={handleViewModalClose}
        width="90%"
        style={{ maxWidth: 800 }}
        centered
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={handleViewModalClose}
            size="medium"
            style={{
              background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
            }}
          >
            Close
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          {isLoadingRecruiterDetails ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Loading member details...</Text>
              </div>
            </div>
          ) : isRecruiterDetailsError ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type="danger" style={{ fontSize: "16px" }}>
                Failed to load member details
              </Text>
              <div style={{ marginTop: 16 }}>
                <Button type="link" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : selectedRecruiterData ? (
            <div>
              <Descriptions
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {getRecruiterDisplayName(selectedRecruiterData)}
                    </span>
                    <Tag
                      color={
                        selectedRecruiterData.accountStatus === "active"
                          ? "green"
                          : "red"
                      }
                      icon={
                        selectedRecruiterData.accountStatus === "active" ? (
                          <CheckCircleOutlined />
                        ) : (
                          <StopOutlined />
                        )
                      }
                    >
                      {selectedRecruiterData.accountStatus?.toUpperCase()}
                    </Tag>
                  </div>
                }
                bordered
                column={1}
                size="middle"
                style={{ marginBottom: 24 }}
              >
                <Descriptions.Item
                  label={
                    <span>
                      <UserOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Full Name
                    </span>
                  }
                >
                  {selectedRecruiterData.fullName || "Not specified"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span>
                      <MailOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Email
                    </span>
                  }
                >
                  {selectedRecruiterData.email}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span>
                      <PhoneOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Phone
                    </span>
                  }
                >
                  {selectedRecruiterData.phone}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span>
                      <TeamOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Specialization
                    </span>
                  }
                >
                  {selectedRecruiterData.specialization || "Not specified"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span>
                      <CalendarOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Experience
                    </span>
                  }
                >
                  {selectedRecruiterData.totalExperienceYears
                    ? `${selectedRecruiterData.totalExperienceYears}`
                    : "Not specified"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span>
                      <CalendarOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Member Type
                    </span>
                  }
                >
                  {selectedRecruiterData.recruiterType
                    ? `${selectedRecruiterData.recruiterType} `
                    : "Not specified"}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span>
                      <LockOutlined
                        style={{ marginRight: 8, color: "#da2c46" }}
                      />
                      Permissions
                    </span>
                  }
                >
                  {selectedRecruiterData.permissions?.length ? (
                    <div
                      style={{
                        maxHeight: 300,
                        overflowY: "auto",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      {selectedRecruiterData.permissions.includes(
                        "full-access-given"
                      ) && (
                        <div
                          style={{
                            background: "#fffbe6",
                            border: "1px solid #ffe58f",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            marginBottom: "10px",
                            fontSize: "13px",
                            color: "#ad8b00",
                            fontWeight: 500,
                          }}
                        >
                          🔒 Full Access Granted — user has full permission
                          access to all modules.
                        </div>
                      )}

                      {getViewPermissionGroups(
                        selectedRecruiterData.recruiterType
                      ).map((group) => {
                        const allowed = group.permissions.filter((p) =>
                          selectedRecruiterData.permissions.includes(p.key)
                        );
                        if (allowed.length === 0) return null;

                        return (
                          <div
                            key={group.title}
                            style={{
                              marginBottom: "12px",
                              paddingBottom: "8px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  marginRight: 8,
                                  color: "#da2c46",
                                  fontSize: "16px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {group.icon}
                              </span>
                              <strong
                                style={{ fontSize: "13px", color: "#212529" }}
                              >
                                {group.title}
                              </strong>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                marginLeft: "24px",
                              }}
                            >
                              {allowed.map((perm) => (
                                <Tag
                                  key={perm.key}
                                  color="red"
                                  style={{
                                    background: "#fff2f0",
                                    borderColor: "#ffa39e",
                                    color: "#a8071a",
                                    fontSize: "12px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {perm.label}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Text type="secondary">No permissions assigned</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>

              {selectedRecruiterData.bio && (
                <div>
                  <Divider orientation="left">
                    <Text strong style={{ color: "#da2c46" }}>
                      Biography
                    </Text>
                  </Divider>
                  <Paragraph
                    style={{
                      background: "#f9f9f9",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: 0,
                    }}
                  >
                    {selectedRecruiterData.bio}
                  </Paragraph>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text>No recruiter data available</Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Disable/Enable Confirmation Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color:
                recruiterToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>
              {recruiterToToggle?.accountStatus === "active"
                ? "Disable"
                : "Enable"}{" "}
              Member
            </span>
          </div>
        }
        open={disableModalVisible}
        onCancel={handleDisableCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDisableCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger={recruiterToToggle?.accountStatus === "active"}
            onClick={handleToggleStatus}
            loading={isToggling}
            size="large"
            style={{
              background:
                recruiterToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
              borderColor:
                recruiterToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            {recruiterToToggle?.accountStatus === "active"
              ? "Disable"
              : "Enable"}
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>
            Are you sure you want to{" "}
            {recruiterToToggle?.accountStatus === "active"
              ? "disable"
              : "enable"}{" "}
            the recruiter{" "}
            <Text strong>{getRecruiterDisplayName(recruiterToToggle)}</Text>?
          </Text>
          {recruiterToToggle?.accountStatus === "active" && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Disabling will prevent this recruiter from accessing the system.
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ff4d4f",
            }}
          >
            <DeleteOutlined style={{ marginRight: 8, fontSize: 18 }} />
            <span style={{ fontSize: "16px" }}>Delete Member</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleDeleteRecruiter}
            loading={isDeleting}
            size="large"
            style={{
              background: "#ff4d4f",
              borderColor: "#ff4d4f",
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <WarningOutlined
              style={{
                color: "#ff4d4f",
                fontSize: 20,
                marginRight: 12,
                marginTop: 2,
              }}
            />
            <div>
              <Text strong style={{ fontSize: "16px", color: "#ff4d4f" }}>
                This action cannot be undone!
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text>
                  Are you sure you want to permanently delete the recruiter{" "}
                  <Text strong>
                    {getRecruiterDisplayName(recruiterToDelete)}
                  </Text>
                  ?
                </Text>
              </div>
            </div>
          </div>
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: "6px",
              padding: "12px",
              marginTop: 16,
            }}
          >
            <Text type="secondary" style={{ fontSize: "13px" }}>
              • All recruiter data will be permanently removed
              <br />
              • Associated job postings may be affected
              <br />• This recruiter will no longer be able to access the system
            </Text>
          </div>
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
    </>
  );
};

export default AdminRecruiter;

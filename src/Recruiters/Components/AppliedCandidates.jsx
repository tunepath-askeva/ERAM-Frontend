import React, { useState } from "react";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import {
  Card,
  Spin,
  Alert,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Empty,
  Button,
  Space,
  Modal,
  Dropdown,
  Menu,
  message,
  Descriptions,
  Divider,
  Skeleton,
  Pagination,
  Checkbox,
  Tabs,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ToolOutlined,
  BookOutlined,
  GlobalOutlined,
  IdcardOutlined,
  HomeOutlined,
  LinkedinOutlined,
  GithubOutlined,
  TwitterOutlined,
  FacebookOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import { phoneUtils } from "../../utils/countryMobileLimits";
import dayjs from "dayjs";

const { TabPane } = Tabs;

const { Title, Text, Paragraph } = Typography;

const AppliedCandidates = ({ jobId, candidateType = "applied" }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, error, isLoading, refetch } = useGetJobApplicationsQuery(jobId);
  console.log(data, "jobs");
  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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
      <div style={{ padding: "16px" }}>
        <Alert
          message="Failed to load applications"
          description="Unable to fetch candidate applications for this job."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const { workOrder, formResponses } = data || {};

  if (!formResponses || formResponses.length === 0) {
    return (
      <div style={{ padding: "16px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: "14px", color: "#999" }}>
              No applications found for this job
            </span>
          }
        />
      </div>
    );
  }

  // Filter candidates based on type
  const filteredCandidates = formResponses.filter((app) => {
    if (candidateType === "declined") {
      return app.status === "declined" || app.status === "rejected";
    } else {
      return (
        !app.status || app.status === "applied" || app.status === "pending"
      );
    }
  });

  const handleViewResume = (resumeUrl, fileName) => {
    if (!resumeUrl) {
      enqueueSnackbar("No file available", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }
    setSelectedResume({ url: resumeUrl, name: fileName });
    setResumeModalVisible(true);
  };

  const handleDownloadResume = (resumeUrl, fileName) => {
    if (!resumeUrl) {
      enqueueSnackbar("No file available", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return;
    }

    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = fileName || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    enqueueSnackbar("Download started", {
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const handleStatusChange = (applicationId, newStatus) => {
    console.log("Updating status:", applicationId, newStatus);
    message.success(`Candidate status updated to ${newStatus}`);
  };

  const handleCandidateSelect = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const currentPageIds = filteredCandidates
      .slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
      .map((app) => app?.user?._id).filter(Boolean);

    setSelectedCandidates((prev) =>
      checked
        ? [...new Set([...prev, ...currentPageIds])]
        : prev.filter((id) => !currentPageIds.includes(id))
    );
  };

  const handleMoveToScreening = async (candidateId) => {
    try {
      await updateCandidateStatus({
        Id: candidateId,
        status: "screening",
        jobId: jobId,
      }).unwrap();

      enqueueSnackbar("Candidate moved to screening successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      setDetailsModalVisible(false);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Failed to move candidate to screening:", error);
      enqueueSnackbar(
        error.data?.message || "Failed to move candidate to screening",
        { variant: "error", autoHideDuration: 3000 }
      );
    }
  };

  const handleBulkMoveToScreening = async () => {
    if (selectedCandidates.length === 0) return;

    try {
      const updatePromises = selectedCandidates.map((candidateId) => {
        return updateCandidateStatus({
          Id: candidateId,
          status: "screening",
          jobId: jobId,
        }).unwrap();
      });

      await Promise.all(updatePromises);

      enqueueSnackbar(
        `Successfully moved ${selectedCandidates.length} candidates to screening`,
        { variant: "success", autoHideDuration: 3000 }
      );

      setSelectedCandidates([]);
      setSelectAll(false);
      refetch();
    } catch (error) {
      console.error("Failed to move candidates:", error);
      enqueueSnackbar("Failed to move some candidates to screening", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const getStatusMenuItems = (application, currentStatus) => {
    const items = [
      {
        key: "applied",
        label: "Mark as Applied",
        icon: <CheckCircleOutlined />,
        disabled: currentStatus === "applied",
      },
      {
        key: "declined",
        label: "Decline Candidate",
        icon: <CloseCircleOutlined />,
        disabled: currentStatus === "declined",
        danger: true,
      },
    ];

    return (
      <Menu
        onClick={({ key }) => handleStatusChange(application?._id, key)}
        items={items}
      />
    );
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailsModalVisible(true);
  };

  const checkDocumentsUploaded = (application) => {
    const { workOrder, workOrderuploadedDocuments } = application;

    // Get required documents from work order
    const requiredDocuments = workOrder?.documents || [];

    // If no required documents, return true
    if (requiredDocuments.length === 0) {
      return true;
    }

    // Get mandatory documents
    const mandatoryDocuments = requiredDocuments.filter(
      (doc) => doc.isMandatory === true
    );

    // If no mandatory documents, return true
    if (mandatoryDocuments.length === 0) {
      return true;
    }

    // Check if all mandatory documents are uploaded
    const uploadedDocuments = workOrderuploadedDocuments || [];
    const uploadedDocNames = uploadedDocuments.map((doc) =>
      (doc.documentName || doc.fileName || "").toLowerCase().trim()
    );

    // Check if all mandatory documents are present
    const allMandatoryUploaded = mandatoryDocuments.every((mandatoryDoc) => {
      const docName = (mandatoryDoc.name || "").toLowerCase().trim();
      return uploadedDocNames.some(
        (uploadedName) =>
          uploadedName === docName ||
          uploadedName.includes(docName) ||
          docName.includes(uploadedName)
      );
    });

    return allMandatoryUploaded;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderUploadedDocuments = (documents) => {
    if (!documents || documents.length === 0) {
      return <Text type="secondary">No documents uploaded</Text>;
    }

    return (
      <Space direction="vertical" size={4}>
        {documents.map((doc, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FileTextOutlined style={{ fontSize: "12px", color: "#666" }} />
            <Space size={4}>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewResume(doc.fileUrl, doc.fileName)}
                style={{ padding: "0", fontSize: "12px", height: "auto" }}
              >
                {doc.fileName}
              </Button>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadResume(doc.fileUrl, doc.fileName)}
                style={{ padding: "0", fontSize: "12px", height: "auto" }}
              >
                Download
              </Button>
            </Space>
          </div>
        ))}
      </Space>
    );
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;

    const { user, responses, workOrderuploadedDocuments } = selectedApplication;
    const workOrder = data?.workOrder || selectedApplication.workOrder;

    const resumeField = responses?.find(
      (response) =>
        response.fieldType === "file" ||
        (response.label && response.label.toLowerCase().includes("resume"))
    );
    const resumeUrl = user?.resume || user?.resumeUrl || resumeField?.value;
    const candidateName = user?.fullName || "Candidate";

    // Get application form responses (including file fields for display)
    const applicationFormFields = responses?.filter(
      (response) =>
        response.value &&
        !(
          response.label &&
          response.label.toLowerCase().includes("resume")
        )
    ) || [];

    // Document verification
    const requiredDocs = workOrder?.documents || [];
    const mandatoryDocs = requiredDocs.filter((doc) => doc.isMandatory === true);
    const uploadedDocs = workOrderuploadedDocuments || [];
    const uploadedDocNames = uploadedDocs.map((doc) =>
      (doc.documentName || doc.fileName || "").toLowerCase().trim()
    );

    const missingMandatoryDocs = mandatoryDocs.filter((mandatoryDoc) => {
      const docName = (mandatoryDoc.name || "").toLowerCase().trim();
      return !uploadedDocNames.some(
        (uploadedName) =>
          uploadedName === docName ||
          uploadedName.includes(docName) ||
          docName.includes(uploadedName)
      );
    });

    const allDocsUploaded = checkDocumentsUploaded(selectedApplication);

    return (
      <div>
        <Row gutter={[24, 24]}>
          {/* Left Column - Profile Overview */}
          <Col xs={24} md={8}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                size={150}
                src={user?.image}
                icon={<UserOutlined />}
                style={{ marginBottom: "16px" }}
              />
              <Title level={3} style={{ textAlign: "center" }}>
                {user?.fullName || candidateName}
              </Title>
              <Text strong style={{ fontSize: "16px", marginBottom: "8px" }}>
                {user?.title || "Candidate"}
              </Text>
              <Tag color="blue">Applied</Tag>

              {user?.age && (
                <Text type="secondary" style={{ marginTop: "8px" }}>
                  Age: {user.age} years
                </Text>
              )}

              <Divider />

              {/* Contact Information */}
              <div style={{ width: "100%" }}>
                <Title level={5}>Contact Information</Title>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <MailOutlined style={{ marginRight: "8px" }} />
                    <Text>{user?.email || "N/A"}</Text>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: "8px" }} />
                    <Text>
                      {user?.phoneCountryCode && user?.phone
                        ? phoneUtils.formatWithCountryCode(
                            user.phoneCountryCode,
                            user.phone
                          )
                        : user?.phone || "N/A"}
                    </Text>
                  </div>
                  <div>
                    <EnvironmentOutlined style={{ marginRight: "8px" }} />
                    <Text>{user?.location || "N/A"}</Text>
                  </div>
                  {user?.emergencyContactNo && (
                    <div>
                      <PhoneOutlined
                        style={{ marginRight: "8px", color: "red" }}
                      />
                      <Text>
                        Emergency:{" "}
                        {user?.emergencyContactNoCountryCode &&
                        user?.emergencyContactNo
                          ? phoneUtils.formatWithCountryCode(
                              user.emergencyContactNoCountryCode,
                              user.emergencyContactNo
                            )
                          : user?.emergencyContactNo}
                        {user?.contactPersonName &&
                          ` (${user.contactPersonName})`}
                      </Text>
                    </div>
                  )}
                </Space>
              </div>

              {/* Social Links */}
              {user?.socialLinks && (
                <div style={{ marginTop: "16px", width: "100%" }}>
                  <Title level={5}>Social Links</Title>
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {user.socialLinks.linkedin && (
                      <div>
                        <LinkedinOutlined
                          style={{ marginRight: "8px", color: "#0077B5" }}
                        />
                        <a
                          href={
                            user.socialLinks.linkedin.startsWith("http")
                              ? user.socialLinks.linkedin
                              : `https://${user.socialLinks.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {user.socialLinks.github && (
                      <div>
                        <GithubOutlined style={{ marginRight: "8px" }} />
                        <a
                          href={
                            user.socialLinks.github.startsWith("http")
                              ? user.socialLinks.github
                              : `https://${user.socialLinks.github}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          GitHub
                        </a>
                      </div>
                    )}
                  </Space>
                </div>
              )}
            </div>
          </Col>

          {/* Right Column - Detailed Information */}
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab={
                  <span>
                    <UserOutlined /> Overview
                  </span>
                }
                key="1"
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Current Status">
                    <Tag color="blue">Applied</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Company">
                    {user?.currentCompany ||
                      user?.workExperience?.[0]?.company ||
                      "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Experience">
                    {user?.totalExperienceYears || 0} years
                  </Descriptions.Item>
                  <Descriptions.Item label="Notice Period">
                    {user?.noticePeriod || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Salary">
                    {user?.currentSalary || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expected Salary">
                    {user?.expectedSalary || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Industry">
                    {user?.industry?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Languages">
                    {user?.languages?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nationality">
                    {user?.nationality || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Visa Status">
                    {user?.visaStatus?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                </Descriptions>

                {user?.profileSummary && (
                  <>
                    <Divider />
                    <Title level={5}>Summary</Title>
                    <div style={{ marginBottom: "24px" }}>
                      {user.profileSummary}
                    </div>
                  </>
                )}

                <Divider />
                <Title level={5}>Skills</Title>
                <div style={{ marginBottom: "24px" }}>
                  {user?.skills?.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <Tag key={index} style={{ marginBottom: "8px" }}>
                        {skill}
                      </Tag>
                    ))
                  ) : (
                    <Text>No skills listed</Text>
                  )}
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined /> Experience
                  </span>
                }
                key="2"
              >
                {user?.workExperience?.length > 0 ? (
                  user.workExperience.map((exp, index) => (
                    <Card key={index} style={{ marginBottom: "16px" }}>
                      <Title level={5}>{exp.company}</Title>
                      <Text strong>{exp.title}</Text>
                      <div style={{ margin: "8px 0" }}>
                        <Text type="secondary">
                          {formatDate(exp.startDate)} -{" "}
                          {exp.endDate === "Present"
                            ? "Present"
                            : formatDate(exp.endDate)}
                        </Text>
                      </div>
                      {exp.description && <Text>{exp.description}</Text>}
                    </Card>
                  ))
                ) : (
                  <Text>No work experience added</Text>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined /> Education
                  </span>
                }
                key="3"
              >
                {user?.education?.length > 0 ? (
                  user.education.map((edu, index) => (
                    <Card key={index} style={{ marginBottom: "16px" }}>
                      <Title level={5}>{edu.institution}</Title>
                      <Text strong>
                        {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                      </Text>
                      <div style={{ margin: "8px 0" }}>
                        <Text type="secondary">Graduated: {edu.year}</Text>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Text>No education information added</Text>
                )}

                {user?.qualifications?.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>Additional Qualifications</Title>
                    {user.qualifications.map((qual, index) => (
                      <Tag key={index} style={{ marginBottom: "8px" }}>
                        {qual}
                      </Tag>
                    ))}
                  </>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Application Form
                  </span>
                }
                key="4"
              >
                {applicationFormFields.length > 0 ? (
                  <Descriptions bordered column={1}>
                    {applicationFormFields.map((response, index) => {
                      // Detect if value is a file URL (even if fieldType is not set)
                      const isFileUrl = response.value && 
                        typeof response.value === 'string' && 
                        (response.value.startsWith('http://') || 
                         response.value.startsWith('https://') ||
                         response.fieldType === "file");
                      
                      return (
                      <Descriptions.Item
                        key={`field-${index}`}
                        label={response.label || `Field ${index + 1}`}
                      >
                        {isFileUrl ? (
                          // File field - show view and download buttons with proper filename
                          (() => {
                            const fileUrl = response.value;
                            if (!fileUrl) {
                              return <Text type="secondary">No file uploaded</Text>;
                            }

                            // Extract filename from URL with better handling
                            let fileName = response.label || "Document";
                            let fileExtension = "";
                            
                            try {
                              const url = new URL(fileUrl);
                              const pathParts = url.pathname.split('/').filter(Boolean);
                              const lastPart = pathParts[pathParts.length - 1] || "";
                              
                              // Extract extension
                              const extMatch = lastPart.match(/\.[^.]+$/);
                              fileExtension = extMatch ? extMatch[0] : "";
                              
                              // Get filename from URL path
                              let urlFileName = lastPart.split('?')[0]; // Remove query params
                              urlFileName = decodeURIComponent(urlFileName);
                              
                              // If the URL filename is meaningful (not generic like "files-1.pdf")
                              // and not too long, use it; otherwise use the field label
                              const isGenericName = urlFileName.includes('files-') || 
                                                   urlFileName.match(/^[a-z0-9-]+-\d+\./i) || // Pattern like "b2-c7-files-1.pdf"
                                                   urlFileName.length < 5;
                              
                              if (!isGenericName && urlFileName.length <= 60) {
                                fileName = urlFileName;
                              } else {
                                // Use field label with extension
                                fileName = response.label || response.fieldName || "Document";
                                if (fileExtension && !fileName.toLowerCase().endsWith(fileExtension.toLowerCase())) {
                                  fileName += fileExtension;
                                }
                              }
                            } catch (e) {
                              // If URL parsing fails, try simple string extraction
                              try {
                                const urlParts = fileUrl.split('/');
                                const lastPart = urlParts[urlParts.length - 1] || "";
                                const extractedName = lastPart.split('?')[0];
                                
                                if (extractedName && extractedName.length > 0 && !extractedName.includes('files-')) {
                                  fileName = decodeURIComponent(extractedName);
                                } else {
                                  fileName = response.label || "Document";
                                  // Try to get extension from URL
                                  const extMatch = fileUrl.match(/\.[^.]+(?:\?|$)/);
                                  if (extMatch) {
                                    fileExtension = extMatch[0].split('?')[0];
                                    if (!fileName.includes('.')) {
                                      fileName += fileExtension;
                                    }
                                  }
                                }
                              } catch (err) {
                                // Final fallback
                                fileName = response.label || "Document";
                              }
                            }
                            
                            // Ensure filename is not empty
                            if (!fileName || fileName.trim() === "") {
                              fileName = "Document" + (fileExtension || ".pdf");
                            }

                            // Get file extension for icon
                            const fileExt = fileName.split('.').pop()?.toLowerCase();
                            const isPdf = fileExt === 'pdf';
                            const FileIcon = isPdf ? FilePdfOutlined : FileTextOutlined;

                            return (
                              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                <Space>
                                  <FileIcon style={{ color: "#da2c46", fontSize: "16px" }} />
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#1890ff",
                                      textDecoration: "none",
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      maxWidth: "300px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "inline-block",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.textDecoration = "underline";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.textDecoration = "none";
                                    }}
                                  >
                                    {fileName}
                                  </a>
                                </Space>
                                <Space size="small">
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewResume(fileUrl, fileName)}
                                    style={{ padding: "0 4px", fontSize: "12px", height: "auto" }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownloadResume(fileUrl, fileName)}
                                    style={{ padding: "0 4px", fontSize: "12px", height: "auto" }}
                                  >
                                    Download
                                  </Button>
                                </Space>
                              </Space>
                            );
                          })()
                        ) : (
                          // Non-file field - display value normally
                          Array.isArray(response.value)
                            ? response.value.join(", ")
                            : String(response.value)
                        )}
                      </Descriptions.Item>
                      );
                    })}
                  </Descriptions>
                ) : (
                  <Text>No application form data available</Text>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <IdcardOutlined /> Personal Details
                  </span>
                }
                key="5"
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Full Name">
                    {user?.fullName ||
                      `${user?.firstName || ""} ${
                        user?.middleName ? user.middleName + " " : ""
                      }${user?.lastName || ""}`.trim() ||
                      "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {user?.gender || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {user?.age || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Marital Status">
                    {user?.maritalStatus || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Blood Group">
                    {user?.bloodGroup || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Religion">
                    {user?.religion || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Country of Birth">
                    {user?.countryOfBirth || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {[
                      user?.streetName,
                      user?.region,
                      user?.city,
                      user?.state,
                      user?.country,
                      user?.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Documents
                  </span>
                }
                key="6"
              >
                {!allDocsUploaded && (
                  <Alert
                    message="Required Documents Missing"
                    description={
                      missingMandatoryDocs.length > 0
                        ? `Missing mandatory documents: ${missingMandatoryDocs
                            .map((doc) => doc.name)
                            .join(", ")}`
                        : "This candidate must upload all required documents before they can be moved to screening."
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Title level={5} style={{ marginBottom: 16 }}>
                  Required Documents
                  {requiredDocs.length > 0 && (
                    <Tag
                      color={allDocsUploaded ? "success" : "warning"}
                      style={{ marginLeft: 8 }}
                    >
                      {uploadedDocs.length} / {requiredDocs.length} Uploaded
                    </Tag>
                  )}
                </Title>

                {requiredDocs.length > 0 ? (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Required:</Text>
                    <div style={{ marginTop: 8 }}>
                      {requiredDocs.map((doc, index) => {
                        const isUploaded = uploadedDocNames.some(
                          (uploadedName) => {
                            const docName = (doc.name || "").toLowerCase().trim();
                            return (
                              uploadedName === docName ||
                              uploadedName.includes(docName) ||
                              docName.includes(uploadedName)
                            );
                          }
                        );
                        return (
                          <Tag
                            key={index}
                            color={isUploaded ? "green" : "blue"}
                            style={{ margin: "4px" }}
                          >
                            {doc.name}
                            {doc.isMandatory && (
                              <span style={{ color: "#ff4d4f" }}> *</span>
                            )}
                            {isUploaded && (
                              <CheckCircleOutlined
                                style={{ marginLeft: "4px", color: "#52c41a" }}
                              />
                            )}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">No required documents specified</Text>
                )}

                <Divider />
                <Title level={5}>Uploaded Documents</Title>
                {renderUploadedDocuments(uploadedDocs)}

                {resumeUrl && (
                  <>
                    <Divider orientation="left">Resume</Divider>
                    <Space>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResume(resumeUrl, candidateName)}
                      >
                        View Resume
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          handleDownloadResume(resumeUrl, candidateName)
                        }
                      >
                        Download Resume
                      </Button>
                    </Space>
                  </>
                )}
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </div>
    );
  };

  const renderCandidateCard = (application, index) => {
    // Skip if application or user is null
    if (!application || !application.user) {
      return null;
    }

    const {
      user,
      responses,
      createdAt,
      status = "applied",
      workOrderuploadedDocuments,
    } = application;
    const resumeUrl =
      user?.resume || responses?.find((r) => r.fieldType === "file")?.value;

    return (
      <Card
        key={application?._id || index}
        size="small"
        style={{
          marginBottom: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        hoverable
      >
        <Row gutter={[16, 12]} align="middle">
          <Col flex="none">
            <Avatar
              size={48}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#da2c46" }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Col>

          <Col flex="auto">
            <div>
              <Title
                level={5}
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {user?.fullName || "Unknown Candidate"}
              </Title>

              <Space direction="vertical" size={2}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <MailOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {user?.email || "No email provided"}
                  </Text>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CalendarOutlined
                    style={{ fontSize: "12px", color: "#666" }}
                  />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    Applied on {formatDate(createdAt)}
                  </Text>
                </div>

                {resumeUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: "12px", color: "#666" }}
                    />
                    <Space size={4}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          handleViewResume(resumeUrl, user?.fullName)
                        }
                        style={{
                          padding: "0",
                          fontSize: "12px",
                          height: "auto",
                        }}
                      >
                        View Resume
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          handleDownloadResume(resumeUrl, user?.fullName)
                        }
                        style={{
                          padding: "0",
                          fontSize: "12px",
                          height: "auto",
                        }}
                      >
                        Download
                      </Button>
                    </Space>
                  </div>
                )}

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FileTextOutlined
                    style={{ fontSize: "12px", color: "#666" }}
                  />
                  <Text style={{ fontSize: "12px", color: "#666" }}>
                    Work Documents:
                  </Text>
                  {renderUploadedDocuments(workOrderuploadedDocuments)}
                </div>
              </Space>
            </div>
          </Col>

          <Col flex="none">
            <Space direction="vertical" size={4} align="end">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Tag
                  color={candidateType === "declined" ? "red" : "green"}
                  style={{ fontSize: "11px" }}
                >
                  {candidateType === "declined" ? "Declined" : "Applied"}
                </Tag>

                {candidateType === "applied" && (
                  <Dropdown
                    overlay={getStatusMenuItems(application, status)}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      style={{ fontSize: "12px" }}
                    />
                  </Dropdown>
                )}
              </div>

              <Button
                type="primary"
                size="small"
                style={{ fontSize: "12px", background: "#da2c46" }}
                onClick={() => handleViewDetails(application)}
              >
                View Details
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  if (filteredCandidates.length === 0) {
    return (
      <div style={{ padding: "16px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: "14px", color: "#999" }}>
              {candidateType === "declined"
                ? "No declined candidates found"
                : "No applications found for this job"}
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "0", fontSize: "14px" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "16px" }}>
        <Title
          level={4}
          style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#da2c46",
          }}
        >
          {candidateType === "declined"
            ? `Declined Candidates (${filteredCandidates.length})`
            : `Applied Candidates (${filteredCandidates.length})`}
        </Title>

        {workOrder && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Tag color="blue" style={{ fontSize: "12px" }}>
              {workOrder.jobCode}
            </Tag>
            <Tag color="green" style={{ fontSize: "12px" }}>
              {workOrder.workplace}
            </Tag>
            {workOrder.officeLocation && (
              <Tag style={{ fontSize: "12px" }}>{workOrder.officeLocation}</Tag>
            )}
          </div>
        )}

        <Text style={{ fontSize: "13px", color: "#666" }}>
          {candidateType === "declined"
            ? "Candidates that have been declined for this position"
            : "Applications received for this position"}
        </Text>
      </div>
      {/* Candidates List */}

      {candidateType === "applied" && (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "20px" }}
        >
          <Col>
            <Space>
              <Checkbox
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select all on page
              </Checkbox>
              <Text type="secondary">
                {selectedCandidates.length} selected of{" "}
                {filteredCandidates.length} candidates
              </Text>
            </Space>
          </Col>
          <Col>
            {selectedCandidates.length > 0 && (
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: "#da2c46" }}
                onClick={handleBulkMoveToScreening}
                loading={isUpdatingStatus}
                icon={<ArrowRightOutlined />}
              >
                Move Selected to Screening ({selectedCandidates.length})
              </Button>
            )}
          </Col>
        </Row>
      )}

      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {filteredCandidates.length > 0 ? (
          <>
            {filteredCandidates
              .slice(
                (pagination.current - 1) * pagination.pageSize,
                pagination.current * pagination.pageSize
              )
              .map((application) => {
                // Skip if user is null
                if (!application?.user) {
                  return null;
                }

                const candidate = {
                  ...application.user,
                  _id: application.user?._id,
                  applicationId: application?._id,
                  status: application?.status,
                  appliedDate: application?.createdAt,
                  isApplied: true,
                  responses: application?.responses,
                  workOrderuploadedDocuments:
                    application?.workOrderuploadedDocuments,
                };

                return (
                  <CandidateCard
                    key={application?._id || Math.random()}
                    candidate={candidate}
                    onViewProfile={() => handleViewDetails(application)}
                    showExperience={false}
                    showSkills={false}
                    onSelectCandidate={handleCandidateSelect}
                    isSelected={selectedCandidates.includes(
                      application.user?._id
                    )}
                    isSelectable={candidateType === "applied"}
                    customActions={
                      candidateType === "applied" && (
                        <Space direction="vertical" size={4} align="end">
                          <Tag color="green" style={{ fontSize: "11px" }}>
                            Applied
                          </Tag>
                          <Button
                            type="primary"
                            size="small"
                            style={{ fontSize: "12px", background: "#da2c46" }}
                            onClick={() => handleViewDetails(application)}
                          >
                            View Details
                          </Button>
                        </Space>
                      )
                    }
                  />
                );
              })}
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={filteredCandidates.length}
                onChange={(page, pageSize) => {
                  setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                  }));
                }}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                {candidateType === "declined"
                  ? "No declined candidates found"
                  : "No applications found for this job"}
              </span>
            }
          />
        )}
      </div>

      {/* Resume Modal */}
      <Modal
        title={`Resume - ${selectedResume?.name || "Candidate"}`}
        open={resumeModalVisible}
        onCancel={() => setResumeModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() =>
              handleDownloadResume(selectedResume?.url, selectedResume?.name)
            }
          >
            Download
          </Button>,
          <Button key="close" onClick={() => setResumeModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: "70vh", padding: 0 }}
      >
        {selectedResume?.url && (
          <iframe
            src={
              selectedResume.url.endsWith(".pdf")
                ? `https://docs.google.com/viewer?url=${encodeURIComponent(selectedResume.url)}&embedded=true`
                : selectedResume.url
            }
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Resume Preview"
            onError={() => {
              // Fallback: open in new tab if iframe fails
              window.open(selectedResume.url, "_blank");
            }}
          />
        )}
      </Modal>

      <Modal
        title="Application Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          candidateType === "applied" && selectedApplication?.user?._id && (
            <Button
              key="move-to-screening"
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() =>
                handleMoveToScreening(selectedApplication?.user?._id)
              }
              loading={isUpdatingStatus}
              disabled={!checkDocumentsUploaded(selectedApplication)}
              style={{
                backgroundColor: checkDocumentsUploaded(selectedApplication)
                  ? "#da2c46"
                  : "#d9d9d9",
                borderColor: checkDocumentsUploaded(selectedApplication)
                  ? "#da2c46"
                  : "#d9d9d9",
              }}
            >
              Move to Screening
            </Button>
          ),
        ]}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px",
        }}
        responsive={true}
      >
        <div style={{ maxWidth: "100%", overflowX: "auto" }}>
          {renderApplicationDetails()}
        </div>
      </Modal>
    </div>
  );
};

export default AppliedCandidates;

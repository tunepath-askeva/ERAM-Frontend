import React from "react";
import {
  Card,
  Typography,
  Tag,
  Space,
  List,
  Avatar,
  Button,
  Divider,
  Row,
  Col,
  Tooltip,
  Select,
  DatePicker,
  Collapse,
  Empty,
  Grid,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  CommentOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const CandidateStageView = ({
  processedJobData,
  activeStage,
  getCandidatesInStage,
  getStageName,
  getStageDates,
  getReviewerIdForStage,
  primaryColor,
  hasPermission,
  handleMoveCandidate,
  handleEditRecruitersClick,
  isEditingDates,
  setIsEditingDates,
  tempStartDate,
  setTempStartDate,
  tempEndDate,
  setTempEndDate,
  setIsDateConfirmModalVisible,
  isEditingRecruiters,
  setIsEditingRecruiters,
  tempRecruiters,
  setTempRecruiters,
  setIsRecruiterConfirmModalVisible,
  activeRecruiters,
  isMoving,
  setIsDocumentModalVisible,
  setActiveStage,
  refreshData,
  setIsDeleteDocumentModalVisible,
  setDocumentToDelete,
}) => {
  const screens = useBreakpoint();

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

  const renderApprovalSection = (candidate, stageId = null) => {
    const targetStageId = stageId || candidate.currentStageId;
    const currentStageProgress = candidate.stageProgress.find(
      (progress) => progress.stageId === targetStageId
    );

    if (!currentStageProgress) return null;

    const hasApprovalLevels =
      currentStageProgress?.approvalDetails?.levels?.length > 0;
    const isStageApproved = hasApprovalLevels
      ? currentStageProgress.approval.isApproved === true
      : true;

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

    const checkApprovalCompleted = () => {
      const approval = currentStageProgress?.approval;
      const approvalLevels = currentStageProgress?.approvalDetails?.levels;
      if (!approvalLevels || approvalLevels.length === 0) return true;
      if (approval && approval.isApproved === true) return true;
      return false;
    };

    const checkDocumentsUploaded = () => {
      // Get base required documents from fullStage
      const baseRequiredDocuments =
        currentStageProgress?.fullStage?.requiredDocuments || [];

      // Get additional documents that have been added to this stage
      const additionalDocs =
        currentStageProgress?.additionalDocuments?.map(
          (doc) => doc.documentName
        ) || [];

      // Combine both arrays and remove duplicates
      const allRequiredDocuments = [
        ...new Set([...baseRequiredDocuments, ...additionalDocs]),
      ];

      // If there are no required documents at all, return true
      if (allRequiredDocuments.length === 0) return true;

      // Get uploaded documents
      const uploadedDocuments = currentStageProgress?.uploadedDocuments || [];

      // Get the names/titles of uploaded documents
      const uploadedDocNames = uploadedDocuments.map(
        (doc) => doc.documentName || doc.fileName
      );

      // Check if ALL required documents (base + additional) have been uploaded
      const allDocumentsUploaded = allRequiredDocuments.every((requiredDoc) =>
        uploadedDocNames.includes(requiredDoc)
      );

      return allDocumentsUploaded;
    };

    const areDocumentsUploaded = checkDocumentsUploaded();
    const shouldHideButton = hasAnyRecruiterApproved || !isCurrentStage;

    const canMoveCandidate = () => {
      if (hasAnyRecruiterApproved) return false;
      if (!isCurrentStage) return false;
      const approvalCompleted = checkApprovalCompleted();
      const documentsUploaded = areDocumentsUploaded;
      return approvalCompleted && documentsUploaded;
    };

    const renderApprovalDetails = (approvalDetails) => {
      if (!approvalDetails || !approvalDetails.levels) return null;

      return (
        <div style={{ marginTop: "16px" }}>
          <Title level={5} style={{ marginBottom: "12px" }}>
            <CheckCircleOutlined
              style={{ marginRight: "8px", color: "#52c41a" }}
            />
            Approval Workflow
          </Title>

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <Collapse
              ghost
              defaultActiveKey={approvalDetails.levels.map(
                (level, index) => index
              )}
            >
              {approvalDetails.levels.map((level, index) => (
                <Panel
                  header={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: screens.xs ? "column" : "row",
                        alignItems: screens.xs ? "flex-start" : "center",
                        gap: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{ fontSize: screens.xs ? "13px" : "14px" }}
                      >
                        Level {level.levelOrder}: {level.levelName}
                      </Text>
                      <Tag
                        color={
                          level.assignedRecruiters.every(
                            (r) => r.status === "approved"
                          )
                            ? "success"
                            : "processing"
                        }
                      >
                        {level.assignedRecruiters.every(
                          (r) => r.status === "approved"
                        )
                          ? "Approved"
                          : `${
                              level.assignedRecruiters.filter(
                                (r) => r.status === "approved"
                              ).length
                            }/${level.assignedRecruiters.length} Approved`}
                      </Tag>
                    </div>
                  }
                  key={index}
                >
                  <div style={{ padding: "8px 0" }}>
                    {level.assignedRecruiters.map((recruiter, idx) => (
                      <Card
                        key={idx}
                        size="small"
                        style={{
                          marginBottom: "8px",
                          borderLeft: `4px solid ${
                            recruiter.status === "approved"
                              ? "#52c41a"
                              : "#faad14"
                          }`,
                          backgroundColor:
                            recruiter.status === "approved"
                              ? "#f6ffed"
                              : "#fff7e6",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: screens.xs ? "column" : "row",
                            justifyContent: "space-between",
                            alignItems: screens.xs
                              ? "flex-start"
                              : "flex-start",
                            gap: screens.xs ? "8px" : "0",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <Text
                              strong
                              style={{ fontSize: screens.xs ? "13px" : "14px" }}
                            >
                              <UserOutlined style={{ marginRight: "8px" }} />
                              {recruiter.recruiterInfo?.fullName ||
                                "Unknown Recruiter"}
                            </Text>
                            <br />
                            <Text
                              type="secondary"
                              style={{ fontSize: screens.xs ? "13px" : "14px" }}
                            >
                              {recruiter.recruiterInfo?.email}
                            </Text>
                            {recruiter.comments && (
                              <>
                                <br />
                                <Text
                                  style={{
                                    fontSize: screens.xs ? "11px" : "12px",
                                    marginTop: "4px",
                                    display: "block",
                                  }}
                                >
                                  <CommentOutlined
                                    style={{ marginRight: "4px" }}
                                  />
                                  {recruiter.comments}
                                </Text>
                              </>
                            )}
                          </div>
                          <div
                            style={{
                              minWidth: screens.xs ? "100%" : "auto",
                              textAlign: screens.xs ? "left" : "right",
                            }}
                          >
                            <Tag
                              color={
                                recruiter.status === "approved"
                                  ? "success"
                                  : "warning"
                              }
                              icon={
                                recruiter.status === "approved" ? (
                                  <CheckCircleOutlined />
                                ) : (
                                  <ClockCircleOutlined />
                                )
                              }
                              style={{
                                fontSize: screens.xs ? "11px" : "12px",
                                padding: screens.xs ? "2px 8px" : "4px 12px",
                              }}
                            >
                              {recruiter.status === "approved"
                                ? "Approved"
                                : "Pending"}
                            </Tag>
                            {recruiter.reviewedAt &&
                              recruiter.status === "approved" && (
                                <div style={{ marginTop: "4px" }}>
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: screens.xs ? "10px" : "11px",
                                    }}
                                  >
                                    {formatIST(recruiter.reviewedAt)}
                                  </Text>
                                </div>
                              )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      );
    };

    const getStageStatusTag = () => {
      if (!hasApprovalLevels) return null;
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
      const currentStageProgress = candidate.stageProgress?.find(
        (progress) => progress.stageId === (stageId || candidate.currentStageId)
      );

      if (currentStageProgress?.stageStatus === "approved") {
        const currentStageIndex = candidate.stageProgress.findIndex(
          (sp) => sp.stageId === currentStageProgress.stageId
        );
        const nextStageInProgress =
          candidate.stageProgress[currentStageIndex + 1];

        if (nextStageInProgress) {
          return `✅ This stage has been completed and moved to: ${nextStageInProgress.stageName}`;
        }
        return "✅ This stage has been completed and approved. No further action needed.";
      }

      if (!isCurrentStage && currentStageProgress?.stageStatus === "approved") {
        return "✅ This stage has been completed.";
      }

      if (!isCurrentStage) {
        return "ℹ️ This stage is not currently active for this candidate.";
      }

      if (hasAnyRecruiterApproved) {
        return "✅ A recruiter has already reviewed and approved this candidate. They are ready for the next stage.";
      }

      const approvalCompleted = checkApprovalCompleted();
      const documentsUploaded = areDocumentsUploaded;

      // Updated logic to check for additional documents
      const baseRequiredDocs =
        (currentStageProgress?.fullStage?.requiredDocuments || []).length > 0;
      const additionalDocs =
        (currentStageProgress?.additionalDocuments || []).length > 0;
      const hasRequiredDocs = baseRequiredDocs || additionalDocs;

      const hasApproval = currentStageProgress?.approval?.approvalId
        ? true
        : false;

      if (hasApproval && hasRequiredDocs) {
        if (!approvalCompleted && !documentsUploaded) {
          return "⚠️ This stage requires approval AND document upload. Both are pending.";
        } else if (!approvalCompleted) {
          return "⚠️ Approval is required before moving this candidate to the next stage.";
        } else if (!documentsUploaded) {
          // More specific message about which documents are missing
          const baseRequiredDocuments =
            currentStageProgress?.fullStage?.requiredDocuments || [];
          const additionalDocNames =
            currentStageProgress?.additionalDocuments?.map(
              (doc) => doc.documentName
            ) || [];
          const allRequiredDocuments = [
            ...new Set([...baseRequiredDocuments, ...additionalDocNames]),
          ];

          const uploadedDocuments =
            currentStageProgress?.uploadedDocuments || [];
          const uploadedDocNames = uploadedDocuments.map(
            (doc) => doc.documentName || doc.fileName
          );

          const missingDocs = allRequiredDocuments.filter(
            (doc) => !uploadedDocNames.includes(doc)
          );

          if (missingDocs.length > 0) {
            return `⚠️ Required documents must be uploaded before moving this candidate. Missing: ${missingDocs.join(
              ", "
            )}`;
          }
          return "⚠️ Required documents must be uploaded before moving this candidate.";
        } else {
          return "✅ Approval completed and documents uploaded. You can move this candidate to the next stage.";
        }
      } else if (hasApproval) {
        if (!approvalCompleted) {
          return "⚠️ Approval is required before moving this candidate to the next stage.";
        } else {
          return "✅ Approval completed. You can move this candidate to the next stage.";
        }
      } else if (hasRequiredDocs) {
        if (!documentsUploaded) {
          // More specific message about which documents are missing
          const baseRequiredDocuments =
            currentStageProgress?.fullStage?.requiredDocuments || [];
          const additionalDocNames =
            currentStageProgress?.additionalDocuments?.map(
              (doc) => doc.documentName
            ) || [];
          const allRequiredDocuments = [
            ...new Set([...baseRequiredDocuments, ...additionalDocNames]),
          ];

          const uploadedDocuments =
            currentStageProgress?.uploadedDocuments || [];
          const uploadedDocNames = uploadedDocuments.map(
            (doc) => doc.documentName || doc.fileName
          );

          const missingDocs = allRequiredDocuments.filter(
            (doc) => !uploadedDocNames.includes(doc)
          );

          if (missingDocs.length > 0) {
            return `⚠️ Required documents must be uploaded before moving this candidate. Missing: ${missingDocs.join(
              ", "
            )}`;
          }
          return "⚠️ Required documents must be uploaded before moving this candidate.";
        } else {
          return "✅ Documents uploaded. You can move this candidate to the next stage.";
        }
      } else {
        return "✅ No requirements for this stage. You can move this candidate to the next stage.";
      }
    };

    return (
      <div
        style={{
          marginBottom: "20px",
          padding: screens.xs ? "12px" : "16px",
          borderRadius: "8px",
          border: `1px solid ${isCurrentStage ? "#e6f7ff" : "#f0f0f0"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: screens.xs ? "column" : "row",
            justifyContent: "space-between",
            alignItems: screens.xs ? "flex-start" : "center",
            gap: screens.xs ? "12px" : "0",
            paddingBottom: "12px",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: screens.xs ? "13px" : "14px" }}>
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

              {currentStageProgress?.stageStatus === "approved" &&
                (() => {
                  const currentIdx = candidate.stageProgress.findIndex(
                    (sp) => sp.stageId === targetStageId
                  );
                  const nextStage = candidate.stageProgress[currentIdx + 1];

                  if (nextStage) {
                    return (
                      <Tag icon={<ArrowRightOutlined />} color="purple">
                        Moved to: {nextStage.stageName}
                      </Tag>
                    );
                  }
                })()}
            </div>
          </div>

          {!shouldHideButton && (
            <Space
              direction={screens.xs ? "vertical" : "horizontal"}
              style={{ width: screens.xs ? "100%" : "auto" }}
            >
              <Tooltip
                title={
                  !canMoveCandidate()
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
                  disabled={!canMoveCandidate()}
                  onClick={(e) => handleMoveCandidate(candidate, e)}
                  loading={isMoving}
                  style={{
                    backgroundColor: canMoveCandidate()
                      ? primaryColor
                      : "#d9d9d9",
                    borderColor: canMoveCandidate() ? primaryColor : "#d9d9d9",
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

        <div>
          <Text
            type={canMoveCandidate() ? "success" : "secondary"}
            style={{ fontSize: screens.xs ? "12px" : "13px" }}
          >
            {getStatusMessage()}
          </Text>

          {hasApprovalLevels && (
            <div style={{ marginTop: "16px" }}>
              {renderApprovalDetails(currentStageProgress.approvalDetails)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDocuments = (candidate, stageId) => {
    if (!processedJobData) return null;

    const stageProgress = candidate.stageProgress.find(
      (sp) => sp.stageId === stageId
    );

    const uploadedDocs = stageProgress?.uploadedDocuments || [];
    const baseRequiredDocuments =
      stageProgress?.fullStage?.requiredDocuments || [];
    const additionalDocs = stageProgress?.additionalDocuments || [];
    const additionalDocNames = additionalDocs.map((doc) => doc.documentName);
    const allRequiredDocuments = [
      ...new Set([...baseRequiredDocuments, ...additionalDocNames]),
    ];

    const handleViewDocument = (fileUrl, fileName) => {
      window.open(fileUrl, "_blank");
    };

    // Get these props from the parent component (RecruiterJobPipeline)
    // You'll need to pass them down to CandidateStageView
    const handleDeleteAdditionalDoc = (doc) => {
      if (setDocumentToDelete && setIsDeleteDocumentModalVisible) {
        setDocumentToDelete(doc);
        setIsDeleteDocumentModalVisible(true);
      }
    };

    return (
      <div style={{ marginTop: "16px" }}>
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <Title level={5} style={{ marginBottom: "12px", color: "#1890ff" }}>
              <FileOutlined style={{ marginRight: "8px" }} />
              Required Documents for this Stage
            </Title>

            <Button
              type="primary"
              icon={<FileOutlined />}
              onClick={() => setIsDocumentModalVisible(true)}
              style={{ background: primaryColor, borderColor: primaryColor }}
              disabled={
                candidate.stageProgress?.find(
                  (sp) => sp.stageId === activeStage
                )?.stageStatus === "approved"
              }
            >
              Add Document
            </Button>
          </div>

          {/* Show base required documents separately */}
          {baseRequiredDocuments.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Standard Documents:
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {baseRequiredDocuments.map((doc, index) => (
                  <Tag
                    key={`base-${index}`}
                    color="blue"
                    style={{
                      fontSize: "14px",
                      padding: "4px 12px",
                      border: "1px solid #1890ff",
                    }}
                  >
                    {doc}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Show additional documents separately with delete option */}
          {additionalDocs.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#fa8c16",
                }}
              >
                Additional Documents:
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {additionalDocs.map((doc, index) => (
                  <Tag
                    key={`additional-${doc._id || index}`}
                    color="orange"
                    onClose={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const isStageCompleted =
                        candidate.stageProgress?.find(
                          (sp) => sp.stageId === activeStage
                        )?.stageStatus === "approved";

                      if (isStageCompleted) {
                        message.warning(
                          "Cannot delete documents from a completed stage"
                        );
                        return;
                      }
                      handleDeleteAdditionalDoc(doc);
                    }}
                    closeIcon={
                      <CloseOutlined
                        style={{
                          fontSize: "12px",
                          marginLeft: "4px",
                          color: "red",
                        }}
                      />
                    }
                    style={{
                      fontSize: "14px",
                      padding: "4px 12px 4px 8px",
                      border: "1px dashed #fa8c16",
                      backgroundColor: "#fff7e6",
                      cursor: "default",
                    }}
                  >
                    {doc.documentName}
                  </Tag>
                ))}
              </div>
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: "8px" }}
              >
                Click the × icon to remove additional documents
              </Text>
            </div>
          )}

          {/* Fallback for no documents */}
          {allRequiredDocuments.length === 0 && (
            <Text type="secondary">No documents required for this stage</Text>
          )}

          {/* Upload status summary */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px dashed #d9d9d9",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {uploadedDocs.length > 0
                ? `✅ ${uploadedDocs.length} document(s) uploaded`
                : "⚠️ No documents uploaded yet"}
            </Text>
            {allRequiredDocuments.length > 0 && (
              <div style={{ marginTop: "4px" }}>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Required: {allRequiredDocuments.length} document(s)
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded documents section - REMAINS UNCHANGED */}
        <Title level={5} style={{ marginBottom: "12px" }}>
          <FileOutlined style={{ marginRight: "8px" }} />
          Uploaded Documents ({uploadedDocs.length})
        </Title>

        {uploadedDocs.length === 0 ? (
          <Empty
            description="No documents uploaded yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: "20px 0" }}
          />
        ) : (
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
        )}
      </div>
    );
  };

  return (
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
                        {hasPermission("edit-stage-date") && (
                          <>
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
                                disabled={
                                  candidate.stageProgress?.find(
                                    (sp) => sp.stageId === activeStage
                                  )?.stageStatus === "approved"
                                }
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
                          </>
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
                                    tempStartDate ? dayjs(tempStartDate) : null
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
                                    ? dayjs(startDate).format("MMM DD, YYYY")
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
                                    if (tempStartDate) {
                                      return (
                                        current &&
                                        current <
                                          dayjs(tempStartDate).startOf("day")
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

                      <div style={{ marginTop: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <Text strong style={{ fontSize: "14px" }}>
                            Reviews:
                          </Text>

                          {hasPermission("edit-stage-rec") && (
                            <>
                              {!isEditingRecruiters && (
                                <Button
                                  type="link"
                                  icon={<EditOutlined />}
                                  onClick={handleEditRecruitersClick}
                                  style={{ padding: 0, fontSize: "12px" }}
                                  disabled={
                                    candidate.stageProgress?.find(
                                      (sp) => sp.stageId === activeStage
                                    )?.stageStatus === "approved"
                                  }
                                >
                                  Edit Recruiters
                                </Button>
                              )}
                            </>
                          )}
                        </div>

                        {isEditingRecruiters ? (
                          <div style={{ marginBottom: "16px" }}>
                            <Select
                              mode="multiple"
                              style={{ width: "100%" }}
                              placeholder="Select recruiters to review"
                              value={tempRecruiters}
                              onChange={setTempRecruiters}
                              options={activeRecruiters.map((rec) => ({
                                value: rec._id,
                                label: rec.fullName,
                              }))}
                            />
                            <Space style={{ marginTop: "8px" }}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setIsEditingRecruiters(false);
                                  setTempRecruiters([]);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() =>
                                  setIsRecruiterConfirmModalVisible(true)
                                }
                                disabled={tempRecruiters.length === 0}
                                style={{
                                  background: primaryColor,
                                  borderColor: primaryColor,
                                }}
                              >
                                Save Recruiters
                              </Button>
                            </Space>
                          </div>
                        ) : null}

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
                                <br />
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
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            No reviews yet
                          </Text>
                        )}

                        {candidate.stageProgress?.find(
                          (sp) => sp.stageId === activeStage
                        )?.stageStatus === "approved" && (
                          <Card
                            size="small"
                            style={{
                              marginTop: "12px",
                              borderRadius: "8px",
                              background: "#f0f5ff",
                              borderLeft: "4px solid #1890ff",
                            }}
                          >
                            <Text strong style={{ color: "#1890ff" }}>
                              <ArrowRightOutlined /> Stage Movement
                            </Text>
                            <br />
                            {(() => {
                              const currentIdx =
                                candidate.stageProgress.findIndex(
                                  (sp) => sp.stageId === activeStage
                                );
                              const nextStage =
                                candidate.stageProgress[currentIdx + 1];

                              if (nextStage) {
                                return (
                                  <>
                                    <Text
                                      style={{
                                        fontSize: "13px",
                                        marginTop: "8px",
                                        display: "block",
                                      }}
                                    >
                                      This candidate was moved from{" "}
                                      <Tag color="blue">
                                        {getStageName(activeStage)}
                                      </Tag>
                                      to{" "}
                                      <Tag color="green">
                                        {nextStage.stageName}
                                      </Tag>
                                    </Text>
                                    {nextStage.recruiterReviews?.[0]
                                      ?.reviewedAt && (
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: "12px",
                                          display: "block",
                                          marginTop: "4px",
                                        }}
                                      >
                                        Moved on:{" "}
                                        {formatIST(
                                          nextStage.recruiterReviews[0]
                                            .reviewedAt
                                        )}
                                      </Text>
                                    )}
                                  </>
                                );
                              }
                              return (
                                <Text
                                  style={{
                                    fontSize: "13px",
                                    marginTop: "8px",
                                    display: "block",
                                  }}
                                >
                                  This stage has been completed (final stage)
                                </Text>
                              );
                            })()}
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                }
              />

              <Divider />

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
  );
};

export default CandidateStageView;

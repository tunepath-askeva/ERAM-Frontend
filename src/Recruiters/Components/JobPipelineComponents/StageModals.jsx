import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Tag,
  Button,
  Upload,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { NotificationModal } from "../../../Components/NotificationModal";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const StageModals = ({
  isMoveModalVisible,
  setIsMoveModalVisible,
  selectedCandidate,
  getStageName,
  getNextStageId,
  availableNextStages,
  primaryColor,
  isMoving,
  moveToNextStage,
  refetch,
  isNotifyModalVisible,
  setIsNotifyModalVisible,
  handleSendNotification,
  apiData,
  isDateConfirmModalVisible,
  setIsDateConfirmModalVisible,
  updateStageDates,
  id,
  activeStage,
  tempStartDate,
  tempEndDate,
  isUpdatingDates,
  isRecruiterConfirmModalVisible,
  setIsRecruiterConfirmModalVisible,
  updateStageRecruiters,
  tempRecruiters,
  activeRecruiters,
  isUpdatingRecruiters,
  isDocumentModalVisible,
  setIsDocumentModalVisible,
  addStageDocument,
  newDocumentName,
  setNewDocumentName,
  isAddingDocument,
  processedJobData,
  getReviewerIdForStage,
  reviewerComments,
  setReviewerComments,
  selectedNextStage,
  setSelectedNextStage,
  targetStage,
  setActiveStage,
  refreshData,
  setTempRecruiters,
  setIsEditingRecruiters,
  setSelectedCandidate,
  setAvailableNextStages,
  setTempStartDate,
  setTempEndDate,
  setIsEditingDates,
  isDeleteDocumentModalVisible,
  setIsDeleteDocumentModalVisible,
  documentToDelete,
  setDocumentToDelete,
  deleteStageDocument,
  isDeletingDocument,
  isUndoModalVisible,
  setIsUndoModalVisible,
  stageToUndo,
  setStageToUndo,
  undoStage,
  isUndoingStage,
  handleUndoStage,
  uploadedDocumentFile,
  setUploadedDocumentFile,
  isRejectModalVisible,
  setIsRejectModalVisible,
  rejectionReason,
  setRejectionReason,
  handleRejectCandidate,
  isRejecting,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // const [uploadedDocumentFile, setUploadedDocumentFile] = useState(null);

  const isActualLastStage = (stageId) => {
    if (!processedJobData || !stageId || !selectedCandidate) return false;

    const isTagged = !!selectedCandidate.tagPipelineId;

    if (isTagged) {
      // **TAGGED PIPELINE - Check remaining stages in fullPipeline**
      const allPipelineStages = processedJobData.pipeline?.stages || [];

      const completedStageIds = new Set(
        (selectedCandidate.completedStages || []).map((cs) => cs.stageId)
      );

      const stageProgressIds = new Set(
        (selectedCandidate.stageProgress || []).map((sp) => sp.stageId)
      );

      // Find uncompleted stages (excluding selected stage)
      const remainingStages = allPipelineStages.filter((stage) => {
        const isCompleted = completedStageIds.has(stage._id);
        const isInProgress = stageProgressIds.has(stage._id);
        const isCurrent = stage._id === stageId;

        return !isCompleted && !isCurrent && !isInProgress;
      });

      return remainingStages.length === 0;
    } else {
      // **WORK ORDER PIPELINE - Check remaining stages in pipelineStageTimeline**
      const allPipelineStages =
        processedJobData.workOrder?.pipelineStageTimeline || [];

      if (allPipelineStages.length === 0) return false;

      const completedStageIds = new Set(
        (apiData?.data?.completedStages || []).map((cs) => cs.stageId)
      );

      const stageProgressIds = new Set(
        (selectedCandidate.stageProgress || []).map((sp) => sp.stageId)
      );

      const remainingStages = allPipelineStages.filter((stage) => {
        const isCompleted = completedStageIds.has(stage.stageId);
        const isInProgress = stageProgressIds.has(stage.stageId);
        const isCurrent = stage.stageId === stageId;

        return !isCompleted && !isCurrent && !isInProgress;
      });

      return remainingStages.length === 0;
    }
  };

  const confirmMoveCandidate = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedCandidate) {
        enqueueSnackbar("No candidate selected", { variant: "error" });
        return;
      }

      const currentStageId =
        selectedCandidate.currentStageId || selectedCandidate.currentStage;

      if (!currentStageId) {
        enqueueSnackbar("Cannot determine current stage for candidate", {
          variant: "error",
        });
        return;
      }

      const isTagged = !!selectedCandidate.tagPipelineId;
      const selectedNextStageId = values.nextStageId;

      // **FIX: Check if we're actually finishing (no next stages available) vs moving to last stage**
      const isFinishing = availableNextStages.length === 0;

      // Check if the selected next stage is the last stage in the pipeline
      const isMovingToLastStage =
        selectedNextStageId && isActualLastStage(selectedNextStageId);

      let isStageOrderChanged = false;
      if (!isFinishing && selectedNextStageId) {
        const currentStageData =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (s) => s.stageId === currentStageId
          );
        const currentStageOrder = currentStageData?.stageOrder ?? -1;

        const selectedStageData =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (s) => s.stageId === selectedNextStageId
          );
        const selectedStageOrder = selectedStageData?.stageOrder ?? -1;

        const immediateNextStageOrder = currentStageOrder + 1;
        isStageOrderChanged = selectedStageOrder !== immediateNextStageOrder;
      }

      const currentStageProgress = selectedCandidate.stageProgress.find(
        (stage) => stage.stageId === currentStageId
      );

      if (!currentStageProgress) {
        enqueueSnackbar("Cannot find stage progress for current stage", {
          variant: "error",
        });
        return;
      }

      const hasApprovalLevels =
        currentStageProgress?.approvalDetails?.levels?.length > 0;

      if (hasApprovalLevels) {
        const isStageApproved =
          currentStageProgress.approval?.isApproved === true;
        if (!isStageApproved) {
          enqueueSnackbar(
            "Cannot move candidate until current stage is approved",
            { variant: "warning" }
          );
          return;
        }
      }

      const reviewerComments = currentStageProgress?.recruiterReviews || [];
      const hasAnyRecruiterApproved = reviewerComments.some(
        (review) => review.status === "approved"
      );

      if (hasAnyRecruiterApproved) {
        enqueueSnackbar(
          "This candidate has already been approved by a recruiter",
          { variant: "warning" }
        );
        return;
      }

      if (!hasApprovalLevels) {
        const currentStage = processedJobData.pipeline?.stages?.find(
          (stage) => stage._id === currentStageId
        );

        const stageTimeline =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (timeline) => timeline.stageId === currentStageId
          );

        const baseRequiredDocuments = [
          ...(currentStage?.requiredDocuments || []),
          ...(stageTimeline?.requiredDocuments?.map((doc) => doc.title) || []),
        ];

        const uniqueRequiredDocuments = [...new Set(baseRequiredDocuments)];

        if (uniqueRequiredDocuments.length > 0) {
          const uploadedDocuments =
            currentStageProgress?.uploadedDocuments || [];
          const uploadedDocNames = uploadedDocuments.map(
            (doc) => doc.documentName || doc.fileName
          );

          const allDocsUploaded = uniqueRequiredDocuments.every((requiredDoc) =>
            uploadedDocNames.includes(requiredDoc)
          );

          if (!allDocsUploaded) {
            const missingDocs = uniqueRequiredDocuments.filter(
              (doc) => !uploadedDocNames.includes(doc)
            );
            enqueueSnackbar(
              `Cannot move candidate until all required documents are uploaded. Missing: ${missingDocs.join(
                ", "
              )}`,
              { variant: "warning" }
            );
            return;
          }
        }
      }

      const currentStageRecruiterId = getReviewerIdForStage(currentStageId);

      if (!currentStageRecruiterId) {
        enqueueSnackbar("No recruiter assigned to the current stage", {
          variant: "error",
        });
        return;
      }

      // **FIX: Build the payload with correct isFinished flag**
      const payload = {
        userId: selectedCandidate.userId,
        workOrderId: selectedCandidate.workOrderId,
        stageId: currentStageId,
        reviewerId: currentStageRecruiterId,
        reviewerComments:
          values.reviewerComments ||
          (isFinishing ? "Process completed" : "Moved to next stage"),
        isStageOrderChange: isStageOrderChanged,
        isFinished: isFinishing, // **ONLY true when no next stages available**
      };

      // **FIX: Always add nextStageId when not finishing**
      if (!isFinishing && selectedNextStageId) {
        payload.nextStageId = selectedNextStageId;
      }

      if (!isTagged && !isFinishing && selectedNextStageId) {
        const selectedStage =
          processedJobData.workOrder?.pipelineStageTimeline?.find(
            (stage) => stage.stageId === selectedNextStageId
          );

        if (selectedStage && selectedStage.stageOrder !== undefined) {
          payload.stageOrder = selectedStage.stageOrder;
        }
      } else if (isTagged) {
        payload.tagPipelineId = selectedCandidate.tagPipelineId;
        payload.pipelineCandidateId =
          selectedCandidate.pipelineCandidateId || selectedCandidate._id;
      }

      await moveToNextStage(payload).unwrap();

      enqueueSnackbar(
        isFinishing
          ? "Candidate process completed successfully"
          : isMovingToLastStage
          ? "Candidate moved to final stage successfully"
          : "Candidate moved to next stage successfully",
        { variant: "success" }
      );

      // Close modal immediately
      setIsMoveModalVisible(false);
      form.resetFields();

      // **FIX: Only navigate away if actually finishing**
      if (isFinishing) {
        navigate("/recruiter/completed-candidates");
        return;
      }

      // Update active stage immediately before refresh
      if (setActiveStage && selectedNextStageId) {
        setActiveStage(selectedNextStageId);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      await Promise.all([refetch(), refreshData?.()]);

      // Additional refetch after state settles
      await new Promise((resolve) => setTimeout(resolve, 300));
      await Promise.all([refetch(), refreshData?.()]);

      // Reset state after successful refresh
      setSelectedCandidate(null);
      setReviewerComments("");
      setSelectedNextStage(null);
      setAvailableNextStages([]);
    } catch (error) {
      if (error.errorFields) {
        return;
      }

      let errorMessage = "Failed to move candidate to next stage";

      if (error?.data) {
        if (error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    }
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

      enqueueSnackbar("Stage dates updated successfully", {
        variant: "success",
      });
      setIsDateConfirmModalVisible(false);

      // REFRESH FIRST
      await refetch();
      if (refreshData) {
        await refreshData();
      }

      // THEN RESET STATE
      setIsEditingDates(false);
      setTempStartDate(null);
      setTempEndDate(null);
    } catch (error) {
      console.error("Error updating stage dates:", error);
      enqueueSnackbar(error?.data?.message || "Failed to update stage dates", {
        variant: "error",
      });
    }
  };

  const handleUpdateStageRecruiters = async () => {
    try {
      if (!activeStage) {
        message.error("No active stage selected");
        return;
      }

      if (tempRecruiters.length === 0) {
        enqueueSnackbar("Please select at least one recruiter", {
          variant: "warning",
        });
        return;
      }

      const payload = {
        stageId: activeStage,
        recruiterIds: tempRecruiters,
      };

      await updateStageRecruiters({
        id,
        ...payload,
      }).unwrap();

      setIsRecruiterConfirmModalVisible(false);
      setIsEditingRecruiters(false); // This closes the dropdown in CandidateStageView
      setTempRecruiters([]);

      enqueueSnackbar("Recruiters updated successfully", {
        variant: "success",
      });

      // Force a complete refetch with cache invalidation
      await refetch();

      // Add a small delay to ensure backend has processed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refetch again to ensure we get the latest data
      await refetch();

      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error updating stage recruiters:", error);
      enqueueSnackbar(error?.data?.message || "Failed to update recruiters", {
        variant: "error",
      });
    }
  };

  const handleAddDocument = async () => {
    try {
      if (!activeStage) {
        message.error("No active stage selected");
        return;
      }

      if (!newDocumentName.trim()) {
        enqueueSnackbar("Please enter document name", { variant: "error" });
        return;
      }

      const payload = {
        id,
        stageId: activeStage,
        documentName: newDocumentName.trim(),
      };

      if (uploadedDocumentFile) {
        payload.file = uploadedDocumentFile;
      }

      await addStageDocument(payload).unwrap();

      enqueueSnackbar("Document added successfully", { variant: "success" });
      setNewDocumentName("");
      setUploadedDocumentFile(null);
      setIsDocumentModalVisible(false);

      // THEN REFRESH - Force immediate refetch
      await refetch();

      // Small delay to ensure backend has processed
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Refetch again to ensure latest data
      await refetch();

      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error adding document:", error);
      enqueueSnackbar(error?.data?.message || "Failed to add document", {
        variant: "error",
      });
    }
  };

  const handleDeleteDocument = async () => {
    try {
      if (!activeStage || !documentToDelete) {
        enqueueSnackbar("No document selected for deletion", {
          variant: "error",
        });
        return;
      }

      const payload = {
        id, // candidate/pipeline ID from params
        stageId: activeStage,
        documentId: documentToDelete._id,
      };

      await deleteStageDocument(payload).unwrap();

      enqueueSnackbar("Document deleted successfully", { variant: "success" });
      setIsDeleteDocumentModalVisible(false);
      setDocumentToDelete(null);

      // Refresh data
      await refetch();
      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      enqueueSnackbar(error?.data?.message || "Failed to delete document", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Modal
        title={
          availableNextStages.length === 0
            ? "Finish Candidate Process"
            : selectedNextStage && isActualLastStage(selectedNextStage)
            ? "Move to Final Stage"
            : "Move Candidate to Next Stage"
        }
        visible={isMoveModalVisible}
        onOk={confirmMoveCandidate}
        onCancel={() => {
          setIsMoveModalVisible(false);
          form.resetFields();
          setSelectedNextStage(null);
          setAvailableNextStages([]);
        }}
        okText={
          availableNextStages.length === 0
            ? "Confirm Finish"
            : selectedNextStage && isActualLastStage(selectedNextStage)
            ? "Move to Final Stage"
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
            initialValues={{
              reviewerComments,
              nextStageId: selectedNextStage,
            }}
          >
            <Form.Item label="Candidate">
              <Input value={selectedCandidate.name} disabled />
            </Form.Item>
            <Form.Item label="Current Stage">
              <Input
                value={getStageName(
                  selectedCandidate.currentStageId ||
                    selectedCandidate.currentStage
                )}
                disabled
              />
            </Form.Item>

            {availableNextStages.length === 0 ? (
              <Form.Item label="Action">
                <Input value="Finish Process" disabled />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  label="Select Next Stage"
                  name="nextStageId"
                  rules={[
                    {
                      required: true,
                      message: "Please select next stage",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select stage to move to"
                    value={selectedNextStage}
                    onChange={(value) => setSelectedNextStage(value)}
                  >
                    {(() => {
                      if (!availableNextStages?.length) return null;

                      // 1️⃣ Get pipeline order from workOrder (source of truth)
                      const pipelineOrder = [
                        ...new Set(
                          processedJobData?.workOrder?.pipelineStageTimeline?.map(
                            (s) => s.pipelineId
                          )
                        ),
                      ];

                      // 2️⃣ Group stages by pipelineId
                      const pipelineGroups = {};

                      availableNextStages.forEach((stage) => {
                        const pipelineStage =
                          processedJobData?.workOrder?.pipelineStageTimeline?.find(
                            (s) => s.stageId === stage.stageId
                          );

                        const pipelineId = pipelineStage?.pipelineId;
                        if (!pipelineId) return;

                        if (!pipelineGroups[pipelineId]) {
                          pipelineGroups[pipelineId] = [];
                        }

                        pipelineGroups[pipelineId].push({
                          ...stage,
                          stageOrder: pipelineStage.stageOrder,
                        });
                      });

                      // 3️⃣ Render pipelines in correct order
                      return pipelineOrder.map((pipelineId, pipelineIndex) => {
                        const stages = pipelineGroups[pipelineId];
                        if (!stages?.length) return null;

                        // Sort stages inside pipeline
                        stages.sort((a, b) => a.stageOrder - b.stageOrder);

                        return (
                          <React.Fragment key={pipelineId}>
                            {/* Pipeline Header */}
                            <Option
                              disabled
                              value={`pipeline-header-${pipelineId}`}
                            >
                              <div
                                style={{
                                  fontWeight: "bold",
                                  color: primaryColor,
                                  padding: "4px 0",
                                  borderBottom: `2px solid ${primaryColor}`,
                                  marginBottom: "4px",
                                }}
                              >
                                Pipeline {pipelineIndex + 1}
                              </div>
                            </Option>

                            {/* Pipeline Stages */}
                            {stages.map((stage, stageIndex) => (
                              <Option key={stage.stageId} value={stage.stageId}>
                                <Text style={{ marginRight: 8 }}>
                                  {pipelineIndex + 1}.{stageIndex + 1}
                                </Text>
                                {stage.stageName}
                                {isActualLastStage(stage.stageId) &&
                                  " (Final Stage)"}
                              </Option>
                            ))}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </Select>
                </Form.Item>
              </>
            )}

            <Form.Item
              label={
                availableNextStages.length === 0
                  ? "Completion Comments"
                  : selectedNextStage && isActualLastStage(selectedNextStage)
                  ? "Move Comments (Moving to Final Stage)"
                  : "Move Comments"
              }
              name="reviewerComments"
              rules={[
                {
                  required: true,
                  message:
                    availableNextStages.length === 0
                      ? "Please enter completion comments"
                      : "Please enter comments for the move",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={
                  availableNextStages.length === 0
                    ? "Enter any final comments about this candidate"
                    : selectedNextStage && isActualLastStage(selectedNextStage)
                    ? "Enter comments for moving to the final stage"
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

      <Modal
        title="Confirm Recruiter Update"
        visible={isRecruiterConfirmModalVisible}
        onOk={handleUpdateStageRecruiters}
        onCancel={() => {
          setIsRecruiterConfirmModalVisible(false);
          setIsEditingRecruiters(false);
          setTempRecruiters([]);
        }}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: primaryColor, borderColor: primaryColor },
          loading: isUpdatingRecruiters,
        }}
      >
        <p>Are you sure you want to update the recruiters for this stage?</p>

        <div style={{ marginTop: "16px" }}>
          <Text strong>Stage: </Text>
          <Text>{getStageName(activeStage)}</Text>
        </div>

        <div style={{ marginTop: "12px" }}>
          <Text strong>Selected Recruiters ({tempRecruiters.length}):</Text>
          <div style={{ marginTop: "8px" }}>
            {tempRecruiters.length > 0 ? (
              tempRecruiters.map((recruiterId) => {
                const recruiter = activeRecruiters.find(
                  (r) => r._id === recruiterId
                );
                return (
                  <Tag key={recruiterId} color="blue" style={{ margin: "4px" }}>
                    <UserOutlined />{" "}
                    {recruiter?.fullName || "Unknown Recruiter"}
                  </Tag>
                );
              })
            ) : (
              <Text
                type="secondary"
                style={{ display: "block", marginTop: "4px" }}
              >
                No recruiters selected
              </Text>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title="Add Reference Document"
        visible={isDocumentModalVisible}
        onOk={handleAddDocument}
        onCancel={() => {
          setIsDocumentModalVisible(false);
          setNewDocumentName("");
          setUploadedDocumentFile(null);
        }}
        okText="Add Document"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: primaryColor, borderColor: primaryColor },
          loading: isAddingDocument,
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Form layout="vertical">
            <Form.Item label="Document Name" required>
              <Input
                placeholder="Enter document name"
                value={newDocumentName}
                onChange={(e) => setNewDocumentName(e.target.value)}
                autoFocus
              />
            </Form.Item>

            <Form.Item label="Upload Document File (Optional)">
              <Upload
                beforeUpload={(file) => {
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    enqueueSnackbar("File must be smaller than 5MB!", {
                      variant: "error",
                    });
                    return Upload.LIST_IGNORE;
                  }

                  // Store the file
                  setUploadedDocumentFile(file);
                  enqueueSnackbar(`${file.name} selected`, {
                    variant: "success",
                  });

                  // Prevent automatic upload
                  return false;
                }}
                onRemove={() => {
                  setUploadedDocumentFile(null);
                  message.info("File removed");
                }}
                maxCount={1}
                fileList={
                  uploadedDocumentFile
                    ? [
                        {
                          uid: "-1",
                          name: uploadedDocumentFile.name,
                          status: "done",
                        },
                      ]
                    : []
                }
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              >
                <Button icon={<UploadOutlined />}>
                  {uploadedDocumentFile ? "Change File" : "Select File"}
                </Button>
              </Upload>
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block", marginTop: "4px" }}
              >
                Upload a reference document for the candidate to view (Max 5MB)
              </Text>
            </Form.Item>

            <Form.Item label="Current Stage">
              <Input
                value={getStageName(activeStage)}
                disabled
                style={{ color: primaryColor, fontWeight: "bold" }}
              />
            </Form.Item>

            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#f0f5ff",
                borderRadius: "6px",
              }}
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                ℹ️ This will add a reference document for the candidate to view.
                <strong> The candidate does NOT need to upload this</strong> -
                it's for their reference only.
              </Text>
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        title="Delete Document"
        visible={isDeleteDocumentModalVisible}
        onOk={handleDeleteDocument}
        onCancel={() => {
          setIsDeleteDocumentModalVisible(false);
          setDocumentToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okType="primary"
        okButtonProps={{
          loading: isDeletingDocument,
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text strong>Are you sure you want to delete this document?</Text>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fff2f0",
              borderRadius: "6px",
            }}
          >
            <Text strong style={{ color: "#cf1322" }}>
              {documentToDelete?.documentName || "Document"}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              This action cannot be undone. This will remove the document
              requirement from the "{getStageName(activeStage)}" stage.
            </Text>
          </div>
        </div>
      </Modal>

      <Modal
        title="Undo Stage Move"
        visible={isUndoModalVisible}
        onOk={() => {
          handleUndoStage();
        }}
        onCancel={() => {
          setIsUndoModalVisible(false);
          setStageToUndo(null);
        }}
        okText="Confirm Undo"
        cancelText="Cancel"
        okType="danger"
        okButtonProps={{
          loading: isUndoingStage,
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text strong>Are you sure you want to undo this stage move?</Text>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fff7e6",
              borderRadius: "6px",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              This will move the candidate back to the previous stage. All
              progress in the current stage will be reverted.
            </Text>
          </div>
        </div>
      </Modal>

      <Modal
        title="Reject Candidate"
        visible={isRejectModalVisible}
        onOk={handleRejectCandidate}
        onCancel={() => {
          setIsRejectModalVisible(false);
          setRejectionReason("");
        }}
        okText="Confirm Rejection"
        cancelText="Cancel"
        okType="danger"
        okButtonProps={{
          loading: isRejecting,
          disabled: !rejectionReason.trim(),
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text strong style={{ fontSize: "16px" }}>
            Are you sure you want to reject this candidate?
          </Text>

          {selectedCandidate && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
              }}
            >
              <Text strong>Candidate: </Text>
              <Text>{selectedCandidate.name}</Text>
              <br />
              <Text strong>Current Stage: </Text>
              <Text>{getStageName(activeStage)}</Text>
            </div>
          )}

          <Form.Item
            label="Rejection Reason"
            required
            style={{ marginTop: "16px", marginBottom: "8px" }}
          >
            <TextArea
              rows={4}
              placeholder="Please provide a detailed reason for rejection (minimum 10 characters)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fff2f0",
              borderRadius: "6px",
              border: "1px solid #ffccc7",
            }}
          >
            <Text strong style={{ color: "#cf1322" }}>
              ⚠️ Warning
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              This action will:
              <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                <li>Move the candidate to "rejected" status</li>
                <li>Record rejection details in the system</li>
                <li>Notify the candidate and relevant recruiters</li>
                <li>This action cannot be undone</li>
              </ul>
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StageModals;

import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Button,
  Upload,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { NotificationModal } from "../../../Components/NotificationModal";
import { useNavigate } from "react-router-dom";

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
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // const [uploadedDocumentFile, setUploadedDocumentFile] = useState(null);
  const confirmMoveCandidate = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedCandidate) {
        message.error("No candidate selected");
        return;
      }

      const currentStageId =
        selectedCandidate.currentStageId || selectedCandidate.currentStage;

      if (!currentStageId) {
        message.error("Cannot determine current stage for candidate");
        return;
      }

      const isTagged = !!selectedCandidate.tagPipelineId;
      const selectedNextStageId = values.nextStageId;
      const isLastStage = !selectedNextStageId;

      let isStageOrderChanged = false;
      if (!isLastStage) {
        const defaultNextStageId = getNextStageId(currentStageId);
        isStageOrderChanged = selectedNextStageId !== defaultNextStageId;
      }

      const currentStageProgress = selectedCandidate.stageProgress.find(
        (stage) => stage.stageId === currentStageId
      );

      if (!currentStageProgress) {
        message.error("Cannot find stage progress for current stage");
        return;
      }

      const hasApprovalLevels =
        currentStageProgress?.approvalDetails?.levels?.length > 0;

      if (hasApprovalLevels) {
        const isStageApproved =
          currentStageProgress.approval?.isApproved === true;
        if (!isStageApproved) {
          message.warning(
            "Cannot move candidate until current stage is approved"
          );
          return;
        }
      }

      const reviewerComments = currentStageProgress?.recruiterReviews || [];
      const hasAnyRecruiterApproved = reviewerComments.some(
        (review) => review.status === "approved"
      );

      if (hasAnyRecruiterApproved) {
        message.warning(
          "This candidate has already been approved by a recruiter"
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

          // Check if ALL base required documents have been uploaded
          const allDocsUploaded = uniqueRequiredDocuments.every((requiredDoc) =>
            uploadedDocNames.includes(requiredDoc)
          );

          if (!allDocsUploaded) {
            const missingDocs = uniqueRequiredDocuments.filter(
              (doc) => !uploadedDocNames.includes(doc)
            );
            message.warning(
              `Cannot move candidate until all required documents are uploaded. Missing: ${missingDocs.join(
                ", "
              )}`
            );
            return;
          }
        }
      }

      const currentStageRecruiterId = getReviewerIdForStage(currentStageId);

      if (!currentStageRecruiterId) {
        message.error("No recruiter assigned to the current stage");
        return;
      }

      const payload = {
        userId: selectedCandidate.userId,
        workOrderId: selectedCandidate.workOrderId,
        stageId: currentStageId,
        reviewerId: currentStageRecruiterId,
        reviewerComments:
          values.reviewerComments ||
          (isLastStage ? "Process completed" : "Moved to next stage"),
        isStageOrderChange: isStageOrderChanged,
        isFinished: isLastStage,
      };

      if (!isLastStage) {
        payload.nextStageId = selectedNextStageId;
      }

      if (!isTagged && !isLastStage) {
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

      const result = await moveToNextStage(payload).unwrap();

      message.success(
        isLastStage
          ? "Candidate process completed successfully"
          : "Candidate moved to next stage successfully"
      );

      if (isLastStage) {
        navigate("/recruiter/completed-candidates");
      }

      setIsMoveModalVisible(false);
      form.resetFields();

      // THEN REFRESH - Add await here
      await refetch();
      if (refreshData) {
        await refreshData();
      }

      // RESET STATE AFTER REFRESH
      setSelectedCandidate(null);
      setReviewerComments("");
      setSelectedNextStage(null);
      setAvailableNextStages([]);

      // Update active stage if needed
      if (setActiveStage && !isLastStage) {
        setActiveStage(selectedNextStageId);
      }
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

      message.error(errorMessage);
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

      message.success("Stage dates updated successfully");
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
      message.error(error?.data?.message || "Failed to update stage dates");
    }
  };

  const handleUpdateStageRecruiters = async () => {
    try {
      if (!activeStage) {
        message.error("No active stage selected");
        return;
      }

      if (tempRecruiters.length === 0) {
        message.warning("Please select at least one recruiter");
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

      message.success("Recruiters updated successfully");

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
      message.error(error?.data?.message || "Failed to update recruiters");
    }
  };

  const handleAddDocument = async () => {
    try {
      if (!activeStage) {
        message.error("No active stage selected");
        return;
      }

      if (!newDocumentName.trim()) {
        message.error("Please enter document name");
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

      message.success("Document added successfully");
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
      message.error(error?.data?.message || "Failed to add document");
    }
  };

  const handleDeleteDocument = async () => {
    try {
      if (!activeStage || !documentToDelete) {
        message.error("No document selected for deletion");
        return;
      }

      const payload = {
        id, // candidate/pipeline ID from params
        stageId: activeStage,
        documentId: documentToDelete._id,
      };

      await deleteStageDocument(payload).unwrap();

      message.success("Document deleted successfully");
      setIsDeleteDocumentModalVisible(false);
      setDocumentToDelete(null);

      // Refresh data
      await refetch();
      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      message.error(error?.data?.message || "Failed to delete document");
    }
  };

  return (
    <>
      <Modal
        title={
          !getNextStageId(selectedCandidate?.currentStage)
            ? "Finish Candidate Process"
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
          !getNextStageId(selectedCandidate?.currentStage)
            ? "Confirm Finish"
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
            initialValues={{ reviewerComments }}
          >
            <Form.Item label="Candidate">
              <Input value={selectedCandidate.name} disabled />
            </Form.Item>
            <Form.Item label="Current Stage">
              <Input
                value={getStageName(selectedCandidate.currentStage)}
                disabled
              />
            </Form.Item>

            {!getNextStageId(selectedCandidate?.currentStage) ? (
              <Form.Item label="Action">
                <Input value="Finish Process" disabled />
              </Form.Item>
            ) : availableNextStages.length > 0 ? ( // ADD THIS CHECK
              <Form.Item label="Next Stage">
                <Input value={getStageName(targetStage)} disabled />
              </Form.Item>
            ) : (
              <Form.Item label="Action">
                <Input value="Finish Process" disabled />
              </Form.Item>
            )}

            {availableNextStages.length > 0 && ( // ADD LENGTH CHECK HERE TOO
              <Form.Item
                label="Select Next Stage"
                name="nextStageId"
                initialValue={getNextStageId(selectedCandidate.currentStage)}
                rules={[
                  {
                    required: availableNextStages.length > 0,
                    message: "Please select next stage",
                  },
                ]}
              >
                <Select
                  placeholder="Select stage to move to"
                  onChange={(value) => setSelectedNextStage(value)}
                >
                  {availableNextStages.map((stage) => (
                    <Option key={stage.stageId} value={stage.stageId}>
                      {stage.stageName}
                      {stage.stageOrder !== undefined &&
                        ` (Order: ${stage.stageOrder})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              label={
                !getNextStageId(selectedCandidate.currentStage)
                  ? "Completion Comments"
                  : "Move Comments"
              }
              name="reviewerComments"
              rules={[
                {
                  required: true,
                  message: !getNextStageId(selectedCandidate.currentStage)
                    ? "Please enter completion comments"
                    : "Please enter comments for the move",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={
                  !getNextStageId(selectedCandidate.currentStage)
                    ? "Enter any final comments about this candidate"
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
                    message.error("File must be smaller than 5MB!");
                    return Upload.LIST_IGNORE;
                  }

                  // Store the file
                  setUploadedDocumentFile(file);
                  message.success(`${file.name} selected`);

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
    </>
  );
};

export default StageModals;

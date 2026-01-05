import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Checkbox,
  Modal,
  Pagination,
  Empty,
  Skeleton,
  Alert,
  message,
  Tabs,
  List,
  Tag,
  Descriptions,
  Form,
  Select,
} from "antd";
import {
  CheckOutlined,
  FileDoneOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  useMoveCandidateStatusMutation,
  useGetSelectedCandidatesQuery,
  useGetPipelinesQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import CandidateProfilePage from "./CandidateProfilePage";
import { useSnackbar } from "notistack";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SelectedCandidates = ({ jobId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("profile");
  const [missingMandatoryDocuments, setMissingMandatoryDocuments] = useState(
    []
  );
  const [missingOptionalDocuments, setMissingOptionalDocuments] = useState([]);
  const [allMandatoryUploaded, setAllMandatoryUploaded] = useState(false);
  const [isPipelineModalVisible, setIsPipelineModalVisible] = useState(false);
  const [selectedPipelineForUpdate, setSelectedPipelineForUpdate] =
    useState(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const {
    data: responseData,
    isLoading,
    error,
    refetch,
  } = useGetSelectedCandidatesQuery({
    jobId,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const { data: pipelineData } = useGetPipelinesQuery();
  const activePipelines = pipelineData?.pipelines || [];

  const [moveCandidateStatus, { isLoading: isUpdatingStatus }] =
    useMoveCandidateStatusMutation();

  const candidates =
    responseData?.customFieldResponses?.map((response) => ({
      ...response.user,
      applicationId: response._id,
      status: response.status,
      isSourced: response.isSourced,
      isApplied: true,
      responses: response.responses,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      workOrderDocuments: response.workOrder?.documents || [],
      uploadedDocuments: response.workOrderuploadedDocuments || [],
      tagPipelineId: response.tagPipelineId || "",
    })) || [];

  useEffect(() => {
    if (responseData) {
      setPagination((prev) => ({
        ...prev,
        total: responseData.totalItems || 0,
      }));
    }
  }, [responseData]);

  const handleCandidateSelect = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const currentPageIds = candidates.map((c) => c._id);
    setSelectedCandidates((prev) =>
      checked
        ? [...new Set([...prev, ...currentPageIds])]
        : prev.filter((id) => !currentPageIds.includes(id))
    );
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);

    // Check for missing documents when opening modal
    const requiredDocs = candidate.workOrderDocuments || [];
    const uploadedDocs = candidate.uploadedDocuments || [];

    const mandatoryMissing = requiredDocs.filter(
      (doc) =>
        doc.isMandatory &&
        !uploadedDocs.some((uploaded) => uploaded.documentName === doc.name)
    );

    const optionalMissing = requiredDocs.filter(
      (doc) =>
        !doc.isMandatory &&
        !uploadedDocs.some((uploaded) => uploaded.documentName === doc.name)
    );

    setMissingMandatoryDocuments(mandatoryMissing);
    setMissingOptionalDocuments(optionalMissing);
    setAllMandatoryUploaded(mandatoryMissing.length === 0);
    setIsModalVisible(true);
    setActiveTabKey("profile");
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedCandidates.length === 0) return;

    // Check for mandatory documents when moving to "screening" from "selected" or "in-pending"
    if (newStatus === "screening") {
      const candidatesToCheck = selectedCandidates
        .map((candidateId) => candidates.find((c) => c._id === candidateId))
        .filter((c) => c !== undefined);

      // Check each candidate for missing mandatory documents
      const candidatesWithMissingDocs = [];
      for (const candidate of candidatesToCheck) {
        const workOrderDocs = candidate.workOrderDocuments || [];
        const uploadedDocs = candidate.uploadedDocuments || [];
        
        const mandatoryDocs = workOrderDocs.filter((doc) => doc.isMandatory === true);
        if (mandatoryDocs.length > 0) {
          const uploadedDocNames = uploadedDocs.map((doc) =>
            doc.documentName?.toLowerCase()
          );
          const missingMandatoryDocs = mandatoryDocs.filter(
            (doc) => !uploadedDocNames.includes(doc.name?.toLowerCase())
          );
          
          if (missingMandatoryDocs.length > 0) {
            candidatesWithMissingDocs.push({
              candidate,
              missingDocs: missingMandatoryDocs,
            });
          }
        }
      }

      // If any candidates have missing mandatory documents, prevent the move
      if (candidatesWithMissingDocs.length > 0) {
        const missingDocNames = candidatesWithMissingDocs[0].missingDocs
          .map((doc) => doc.name)
          .join(", ");
        enqueueSnackbar(
          `Cannot move to screening. ${candidatesWithMissingDocs.length} candidate(s) are missing mandatory documents: ${missingDocNames}`,
          { variant: "error", autoHideDuration: 5000 }
        );
        return;
      }
    }

    try {
      const updatePromises = selectedCandidates.map((candidateId) => {
        const candidate = candidates.find((c) => c._id === candidateId);
        if (!candidate) return Promise.resolve();

        return moveCandidateStatus({
          id: candidate.applicationId, // Changed from _id to applicationId
          status: newStatus,
          jobId: jobId,
        }).unwrap();
      });

      await Promise.all(updatePromises);

      enqueueSnackbar(
        `Successfully moved ${selectedCandidates.length} candidates to ${newStatus}`,
        { variant: "success", autoHideDuration: 3000 }
      );

      setSelectedCandidates([]);
      setSelectAll(false);
      refetch();
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      enqueueSnackbar(
        error.data?.message || "Failed to update some candidate statuses",
        { variant: "error", autoHideDuration: 3000 }
      );
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedCandidate) return;

    // Show pipeline selection modal for screening or in-pending status
    if (newStatus === "screening" || newStatus === "in-pending") {
      setPendingStatusUpdate(newStatus);
      setSelectedPipelineForUpdate(selectedCandidate.tagPipelineId || null);
      setIsPipelineModalVisible(true);
      return;
    }

    await updateStatusWithPipeline(selectedCandidate, newStatus, null);
  };

  // Add new function to handle pipeline update confirmation
  const handlePipelineUpdateConfirm = async () => {
    if (!selectedCandidate || !pendingStatusUpdate) return;

    setIsPipelineModalVisible(false);
    await updateStatusWithPipeline(
      selectedCandidate,
      pendingStatusUpdate,
      selectedPipelineForUpdate
    );
    setPendingStatusUpdate(null);
    setSelectedPipelineForUpdate(null);
  };

  // Add new function to update status with pipeline
  const updateStatusWithPipeline = async (
    candidate,
    newStatus,
    selectedPipelineId
  ) => {
    // Check for mandatory documents when moving to "screening" from "selected" or "in-pending"
    if (newStatus === "screening") {
      const workOrderDocs = candidate.workOrderDocuments || [];
      const uploadedDocs = candidate.uploadedDocuments || [];
      
      const mandatoryDocs = workOrderDocs.filter((doc) => doc.isMandatory === true);
      if (mandatoryDocs.length > 0) {
        const uploadedDocNames = uploadedDocs.map((doc) =>
          doc.documentName?.toLowerCase()
        );
        const missingMandatoryDocs = mandatoryDocs.filter(
          (doc) => !uploadedDocNames.includes(doc.name?.toLowerCase())
        );
        
        if (missingMandatoryDocs.length > 0) {
          const missingDocNames = missingMandatoryDocs.map((doc) => doc.name).join(", ");
          enqueueSnackbar(
            `Cannot move to screening. Missing mandatory documents: ${missingDocNames}`,
            { variant: "error", autoHideDuration: 5000 }
          );
          return;
        }
      }
    }
    
    try {
      const pipelineToSend =
        selectedPipelineId === null || selectedPipelineId === undefined
          ? "" // Send empty string to remove pipeline
          : selectedPipelineId;

      await moveCandidateStatus({
        id: candidate.applicationId,
        status: newStatus,
        jobId,
        pipelineId: pipelineToSend,
      }).unwrap();

      enqueueSnackbar(`Candidate moved to ${newStatus} successfully`, {
        variant: "success",
        autoHideDuration: 3000,
      });
      refetch();
      setIsModalVisible(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      enqueueSnackbar(
        error.data?.message || "Failed to update candidate status",
        { variant: "error", autoHideDuration: 3000 }
      );
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

  const renderDocumentsTab = () => {
    const requiredDocs = selectedCandidate?.workOrderDocuments || [];
    const uploadedDocs = selectedCandidate?.uploadedDocuments || [];

    return (
      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          Required Documents
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            (Mandatory documents are marked with *)
          </Text>
        </Title>

        <List
          itemLayout="horizontal"
          dataSource={requiredDocs}
          renderItem={(doc) => {
            const uploadedDoc = uploadedDocs.find(
              (d) => d.documentName === doc.name
            );
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    uploadedDoc ? (
                      <FileDoneOutlined
                        style={{ color: "#52c41a", fontSize: 20 }}
                      />
                    ) : (
                      <FileOutlined
                        style={{
                          color: doc.isMandatory ? "#ff4d4f" : "#faad14",
                          fontSize: 20,
                        }}
                      />
                    )
                  }
                  title={
                    <Space>
                      <Text>
                        {doc.name}
                        {doc.isMandatory && <Text type="danger">*</Text>}
                      </Text>
                      {uploadedDoc ? (
                        <Tag color="green">Uploaded</Tag>
                      ) : (
                        <Tag color={doc.isMandatory ? "red" : "orange"}>
                          {doc.isMandatory
                            ? "Missing (Required)"
                            : "Missing (Optional)"}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Description">
                        {doc.description || "No description provided"}
                      </Descriptions.Item>
                      {uploadedDoc && (
                        <>
                          <Descriptions.Item label="File Name">
                            {uploadedDoc.fileName}
                          </Descriptions.Item>
                          <Descriptions.Item label="Uploaded At">
                            {new Date(uploadedDoc.uploadedAt).toLocaleString()}
                          </Descriptions.Item>
                        </>
                      )}
                    </Descriptions>
                  }
                />
                {uploadedDoc && (
                  <Button
                    type="link"
                    href={uploadedDoc.fileUrl}
                    target="_blank"
                    icon={<FileOutlined />}
                  >
                    View
                  </Button>
                )}
              </List.Item>
            );
          }}
        />

        <Divider />

        <Title level={5} style={{ marginBottom: 16 }}>
          Resume
        </Title>
        {selectedCandidate?.resumeUrl ? (
          <Button
            type="link"
            href={selectedCandidate.resumeUrl}
            target="_blank"
            icon={<FileOutlined />}
          >
            View Resume
          </Button>
        ) : (
          <Text type="secondary">No resume uploaded</Text>
        )}
      </div>
    );
  };

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

  return (
    <div
      style={{
        padding: window.innerWidth < 768 ? "8px" : "0",
        fontSize: "14px",
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <Title level={4} style={{ margin: 0, color: "#da2c46" }}>
            Selected Candidates ({candidates.length})
          </Title>
        </Col>
        <Col>
          {selectedCandidates.length > 0 && (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: "#da2c46" }}
              onClick={() => handleBulkStatusUpdate("screening")}
            >
              Move to Screening ({selectedCandidates.length})
            </Button>
          )}
        </Col>
      </Row>

      {candidates.length > 0 && (
        <Card size="small" style={{ marginBottom: "16px" }}>
          <Checkbox
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            Select all candidates on this page
          </Checkbox>
        </Card>
      )}

      <Divider
        style={{ margin: window.innerWidth < 768 ? "8px 0" : "12px 0" }}
      />

      <div>
        {candidates.length > 0 ? (
          <>
            {candidates.map((candidate) => (
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
                No selected candidates yet
              </span>
            }
          />
        )}
      </div>

      <Modal
        title={`Candidate Profile - ${selectedCandidate?.fullName || ""}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          allMandatoryUploaded ? (
            <>
              <Button
                type="primary"
                key="pending"
                style={{ backgroundColor: "#da2c46" }}
                onClick={() => handleStatusUpdate("in-pending")}
              >
                Move to Pending
              </Button>
              <Button
                key="screening"
                type="primary"
                loading={isUpdatingStatus}
                onClick={() => handleStatusUpdate("screening")}
                style={{ backgroundColor: "#da2c46" }}
              >
                Move to Screening
              </Button>
            </>
          ) : (
            <Button
              key="pending"
              type="default"
              danger
              onClick={() => handleStatusUpdate("in-pending")}
            >
              Move to Pending (Missing {missingMandatoryDocuments.length}{" "}
              Mandatory Documents)
            </Button>
          ),
        ]}
      >
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="Profile" key="profile">
            {selectedCandidate && (
              <CandidateProfilePage candidate={selectedCandidate} />
            )}
          </TabPane>
          <TabPane tab="Documents" key="documents">
            {selectedCandidate && renderDocumentsTab()}
          </TabPane>
          {selectedCandidate?.tagPipelineId && (
            <TabPane tab="Tagged Pipeline" key="taggedPipeline">
              <div style={{ padding: "16px" }}>
                {(() => {
                  const pipeline = activePipelines.find(
                    (p) => p._id === selectedCandidate.tagPipelineId
                  );

                  if (!pipeline) {
                    return (
                      <Text type="secondary">No pipeline details found.</Text>
                    );
                  }

                  return (
                    <>
                      <Title level={5} style={{ marginBottom: 12 }}>
                        {pipeline.name}
                      </Title>

                      {pipeline.stages && pipeline.stages.length > 0 ? (
                        <List
                          itemLayout="vertical"
                          dataSource={pipeline.stages}
                          renderItem={(stage) => (
                            <List.Item key={stage._id}>
                              <List.Item.Meta
                                title={
                                  <Space>
                                    <FileDoneOutlined
                                      style={{ color: "#1890ff" }}
                                    />
                                    <Text strong>{stage.name}</Text>
                                  </Space>
                                }
                                description={
                                  <>
                                    <p style={{ margin: "4px 0" }}>
                                      <Text type="secondary">
                                        {stage.description ||
                                          "No description provided"}
                                      </Text>
                                    </p>
                                    <p>
                                      <b>Dependency Type:</b>{" "}
                                      <Tag color="geekblue">
                                        {stage.dependencyType}
                                      </Tag>
                                    </p>
                                    {stage.requiredDocuments?.length > 0 ? (
                                      <div>
                                        <b>Required Documents:</b>
                                        <ul style={{ marginTop: 4 }}>
                                          {stage.requiredDocuments.map(
                                            (doc, i) => (
                                              <li key={i}>
                                                <FileOutlined /> {doc}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    ) : (
                                      <Text type="secondary">
                                        No required documents.
                                      </Text>
                                    )}
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text type="secondary">
                          No stages found in this pipeline.
                        </Text>
                      )}
                    </>
                  );
                })()}
              </div>
            </TabPane>
          )}
        </Tabs>

        {(missingMandatoryDocuments.length > 0 ||
          missingOptionalDocuments.length > 0) && (
          <Alert
            message={
              missingMandatoryDocuments.length > 0
                ? `Missing ${missingMandatoryDocuments.length} mandatory document(s)`
                : `Missing ${missingOptionalDocuments.length} optional document(s)`
            }
            description={
              <div>
                {missingMandatoryDocuments.length > 0 && (
                  <div>
                    <Text strong>Mandatory Documents:</Text>
                    <ul>
                      {missingMandatoryDocuments.map((doc, index) => (
                        <li key={`mandatory-${index}`}>
                          {doc.name} <Text type="danger">(Required)</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {missingOptionalDocuments.length > 0 && (
                  <div>
                    <Text strong>Optional Documents:</Text>
                    <ul>
                      {missingOptionalDocuments.map((doc, index) => (
                        <li key={`optional-${index}`}>{doc.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            }
            type={missingMandatoryDocuments.length > 0 ? "error" : "warning"}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>

      <Modal
        title="Select or Update Pipeline"
        open={isPipelineModalVisible}
        onCancel={() => {
          setIsPipelineModalVisible(false);
          setPendingStatusUpdate(null);
          setSelectedPipelineForUpdate(null);
        }}
        onOk={handlePipelineUpdateConfirm}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
      >
        <Form layout="vertical">
          <Form.Item label="Pipeline">
            <Select
              placeholder="Select a pipeline"
              value={selectedPipelineForUpdate}
              onChange={setSelectedPipelineForUpdate}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString()?.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
            >
              {activePipelines.map((pipeline) => (
                <Option key={pipeline._id} value={pipeline._id}>
                  {pipeline.name}
                </Option>
              ))}
            </Select>
            {selectedCandidate?.tagPipelineId && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Current pipeline:{" "}
                {selectedCandidate.tagPipelineId.name ||
                  selectedCandidate.tagPipelineId}
              </Text>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SelectedCandidates;

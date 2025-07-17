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
} from "antd";
import {
  CheckOutlined,
  FileDoneOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  useMoveCandidateStatusMutation,
  useGetSelectedCandidatesQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import CandidateProfilePage from "./CandidateProfilePage";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SelectedCandidates = ({ jobId }) => {
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

      message.success(
        `Successfully moved ${selectedCandidates.length} candidates to ${newStatus}`
      );
      

      setSelectedCandidates([]);
      setSelectAll(false);
      refetch();
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error("Failed to update some candidate statuses");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedCandidate) return;

    try {
      await moveCandidateStatus({
        id: selectedCandidate.applicationId,
        status: newStatus,
        jobId: jobId,
      }).unwrap();

      message.success(`Candidate moved to ${newStatus} successfully`);
      refetch();
      setIsModalVisible(false);
      setSelectedCandidate(null);

      if (newStatus === "screening") {
        setSelectedCandidates((prev) =>
          prev.filter((id) => id !== selectedCandidate._id)
        );
      }
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error(error.data?.message || "Failed to update candidate status");
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
    </div>
  );
};

export default SelectedCandidates;

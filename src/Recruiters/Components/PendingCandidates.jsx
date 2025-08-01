import { useState, useMemo, useEffect } from "react";
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
  Modal,
  Descriptions,
  Tag,
  message,
  Pagination,
  Avatar,
  Checkbox,
  Tabs,
  List,
  Skeleton,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  FileDoneOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  useMoveCandidateStatusMutation,
  useGetPendingCandidatesQuery,
  useNotifyCandidateMutation,
} from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const PendingCandidates = ({ jobId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("profile");
  const [missingMandatoryDocuments, setMissingMandatoryDocuments] = useState(
    []
  );
  const [missingOptionalDocuments, setMissingOptionalDocuments] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [moveCandidateStatus, { isLoading: isUpdatingStatus }] =
    useMoveCandidateStatusMutation();
  const [notifyCandidate, { isLoading: isNotifying }] =
    useNotifyCandidateMutation();

  const {
    data: pendingData,
    isLoading,
    error,
    refetch,
  } = useGetPendingCandidatesQuery({
    jobId,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  useEffect(() => {
    if (pendingData) {
      setPagination((prev) => ({
        ...prev,
        total: pendingData.totalItems || 0,
      }));
    }
  }, [pendingData]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize,
      total: pagination.total,
    });
  };

  const allCandidates = useMemo(() => {
    return (
      pendingData?.customFieldResponses?.map((response) => ({
        ...response.user,
        _id: response.user._id,
        candidateStatus: response.status,
        applicationId: response._id,
        responses: response.responses,
        image: response.user?.image,
        workOrder: response.workOrder,
        workOrderDocuments: response.workOrder?.documents || [],
        uploadedDocuments: response.workOrderuploadedDocuments || [],
        interviewDetails: response.interviewDetails,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      })) || []
    );
  }, [pendingData]);

  const pendingCount = useMemo(() => {
    return allCandidates.length;
  }, [allCandidates]);

  const filteredCandidates = useMemo(() => {
    let candidates = allCandidates;

    if (searchTerm) {
      candidates = candidates.filter(
        (candidate) =>
          candidate.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.phone?.includes(searchTerm)
      );
    }

    return candidates;
  }, [allCandidates, searchTerm]);

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
    setIsModalVisible(true);
    setActiveTabKey("profile");
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (!selectedCandidate) return;

      await moveCandidateStatus({
        id: selectedCandidate.applicationId, // Use applicationId instead of _id
        status: newStatus,
        jobId: jobId,
      }).unwrap();

      message.success(`Candidate moved to ${newStatus} successfully`);
      refetch();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error(error.data?.message || "Failed to update candidate status");
    }
  };

  const handleSelectCandidate = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (e) => {
    const currentPageCandidates = filteredCandidates
      .slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
      .map((candidate) => candidate._id);

    if (e.target.checked) {
      setSelectedCandidates((prev) => [
        ...new Set([...prev, ...currentPageCandidates]),
      ]);
    } else {
      setSelectedCandidates((prev) =>
        prev.filter((id) => !currentPageCandidates.includes(id))
      );
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedCandidates.length === 0) {
      message.warning("Please select at least one candidate");
      return;
    }

    setIsBulkMoving(true);
    try {
      const promises = selectedCandidates.map((candidateId) => {
        const candidate = allCandidates.find((c) => c._id === candidateId);
        return moveCandidateStatus({
          id: candidate.applicationId, // Use applicationId instead of _id
          status: newStatus,
          jobId: jobId,
        }).unwrap();
      });

      await Promise.all(promises);
      message.success(
        `Moved ${selectedCandidates.length} candidates to ${newStatus} successfully`
      );
      setSelectedCandidates([]);
      refetch();
    } catch (error) {
      console.error("Failed to update candidates status:", error);
      message.error(
        error.data?.message || "Failed to update candidates status"
      );
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleNotifyCandidate = async () => {
    if (!selectedCandidate) return;

    try {
      await notifyCandidate({
        userId: selectedCandidate._id,
        workOrderId: selectedCandidate.workOrder?._id,
        customFieldId: selectedCandidate.applicationId,
      }).unwrap();

      message.success("Notification sent successfully");
    } catch (error) {
      console.error("Failed to send notification:", error);
      message.error(error.data?.message || "Failed to send notification");
    }
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

        {requiredDocs.length > 0 ? (
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
                              {new Date(
                                uploadedDoc.uploadedAt
                              ).toLocaleString()}
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
        ) : (
          <Text type="secondary">No documents required for this position</Text>
        )}

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

  const getStatusColor = (status) => {
    const colors = {
      "in-pending": "orange",
      screening: "blue",
      selected: "green",
      rejected: "red",
    };
    return colors[status] || "default";
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
    <div style={{ padding: "0", fontSize: "14px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={4}
              style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#da2c46",
              }}
            >
              Pending Candidates ({pendingCount})
            </Title>
          </Col>
          <Col>
            {selectedCandidates.length > 0 && (
              <Button
                type="primary"
                onClick={() => handleBulkStatusUpdate("screening")}
                loading={isBulkMoving}
                style={{ background: "#da2c46" }}
              >
                Move to Screening ({selectedCandidates.length})
              </Button>
            )}
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div>
        {filteredCandidates.length > 0 ? (
          <>
            <Card size="small" style={{ marginBottom: "16px" }}>
              <Checkbox
                onChange={handleSelectAll}
                checked={filteredCandidates
                  .slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                  )
                  .every((candidate) =>
                    selectedCandidates.includes(candidate._id)
                  )}
                indeterminate={
                  filteredCandidates
                    .slice(
                      (pagination.current - 1) * pagination.pageSize,
                      pagination.current * pagination.pageSize
                    )
                    .some((candidate) =>
                      selectedCandidates.includes(candidate._id)
                    ) &&
                  !filteredCandidates
                    .slice(
                      (pagination.current - 1) * pagination.pageSize,
                      pagination.current * pagination.pageSize
                    )
                    .every((candidate) =>
                      selectedCandidates.includes(candidate._id)
                    )
                }
              >
                Select all candidates on this page
              </Checkbox>
            </Card>

            {filteredCandidates
              .slice(
                (pagination.current - 1) * pagination.pageSize,
                pagination.current * pagination.pageSize
              )
              .map((candidate, index) => (
                <div
                  key={candidate._id || index}
                  style={{ marginBottom: "clamp(12px, 2vw, 16px)" }}
                >
                  <Card
                    hoverable
                    style={{
                      padding: "clamp(16px, 3vw, 24px)",
                      borderRadius: "12px",
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <Row align="middle" gutter={[16, 16]}>
                      {/* Left side - Candidate Details */}
                      <Col xs={24} md={18}>
                        <Row align="top" gutter={[16, 12]}>
                          {/* Checkbox Column */}
                          <Col xs={2}>
                            <Checkbox
                              checked={selectedCandidates.includes(
                                candidate._id
                              )}
                              onChange={(e) =>
                                handleSelectCandidate(
                                  candidate._id,
                                  e.target.checked
                                )
                              }
                            />
                          </Col>

                          {/* Main Details Column */}
                          <Col xs={22}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "clamp(8px, 1.5vw, 12px)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                  gap: "8px 12px",
                                }}
                              >
                                <Text
                                  strong
                                  style={{
                                    fontSize: "clamp(16px, 1.8vw, 18px)",
                                    lineHeight: 1.3,
                                    marginRight: "8px",
                                  }}
                                >
                                  {candidate.fullName}
                                </Text>
                                <Tag color="blue" style={{ margin: 0 }}>
                                  {candidate.title}
                                </Tag>
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "clamp(13px, 1.5vw, 14px)",
                                  }}
                                >
                                  {candidate.totalExperienceYears || 0} years
                                  exp
                                </Text>
                              </div>
                            </div>

                            {/* Company/Location Row */}
                            <div
                              style={{
                                marginBottom: "clamp(8px, 1.5vw, 12px)",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px 12px",
                                alignItems: "center",
                              }}
                            >
                              <Space size={4}>
                                <BankOutlined
                                  style={{ color: "#666", fontSize: "14px" }}
                                />
                                <Text
                                  style={{
                                    fontSize: "clamp(13px, 1.5vw, 14px)",
                                  }}
                                  ellipsis
                                >
                                  {candidate.currentCompany ||
                                    candidate.workExperience?.[0]?.company ||
                                    "Not specified"}
                                </Text>
                              </Space>

                              <Divider
                                type="vertical"
                                style={{ margin: 0, height: "auto" }}
                              />

                              <Space size={4}>
                                <EnvironmentOutlined
                                  style={{ color: "#666", fontSize: "14px" }}
                                />
                                <Text
                                  style={{
                                    fontSize: "clamp(13px, 1.5vw, 14px)",
                                  }}
                                >
                                  {candidate.location}
                                </Text>
                              </Space>

                              <Divider
                                type="vertical"
                                style={{ margin: 0, height: "auto" }}
                              />

                              <Tag
                                color={getStatusColor(
                                  candidate.candidateStatus
                                )}
                              >
                                {candidate.candidateStatus?.toUpperCase() ||
                                  "IN-PENDING"}
                              </Tag>
                            </div>

                            {/* Skills Section */}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px 8px",
                                alignItems: "center",
                              }}
                            >
                              <ToolOutlined
                                style={{ color: "#666", fontSize: "14px" }}
                              />
                              <Text
                                type="secondary"
                                style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                              >
                                Skills:
                              </Text>
                              {candidate.skills
                                ?.slice(0, 5)
                                .map((skill, index) => (
                                  <Tag
                                    key={index}
                                    style={{
                                      margin: 0,
                                      fontSize: "clamp(12px, 1.3vw, 13px)",
                                      padding: "2px 8px",
                                    }}
                                  >
                                    {skill}
                                  </Tag>
                                ))}
                              {candidate.skills?.length > 5 && (
                                <Tag
                                  style={{
                                    margin: 0,
                                    fontSize: "clamp(12px, 1.3vw, 13px)",
                                  }}
                                >
                                  +{candidate.skills.length - 5} more
                                </Tag>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Col>

                      {/* Right side - Avatar and View Button */}
                      <Col xs={24} md={6}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "clamp(8px, 1.5vw, 12px)",
                          }}
                        >
                          <div
                            style={{
                              width: "clamp(80px, 20vw, 100px)",
                              height: "clamp(80px, 20vw, 100px)",
                              borderRadius: "12px",
                              backgroundColor: "#da2c46",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            {candidate.image ? (
                              <img
                                src={candidate.image}
                                alt={candidate.fullName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <UserOutlined
                                style={{
                                  fontSize: "clamp(32px, 8vw, 40px)",
                                  color: "#fff",
                                }}
                              />
                            )}
                          </div>

                          <Button
                            type="primary"
                            style={{
                              backgroundColor: "#da2c46",
                              width: "100%",
                              maxWidth: "100px",
                              fontSize: "clamp(13px, 1.5vw, 14px)",
                              padding: "6px 12px",
                            }}
                            icon={<EyeOutlined />}
                            onClick={() => handleViewProfile(candidate)}
                          >
                            View
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </div>
              ))}
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePaginationChange}
                showSizeChanger
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                {searchTerm
                  ? "No candidates match your search criteria"
                  : "No pending candidates found"}
              </span>
            }
          />
        )}
      </div>

      {/* Candidate Details Modal */}
      <Modal
        title={`Candidate Details - ${selectedCandidate?.fullName || ""}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        {selectedCandidate && (
          <>
            <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
              <TabPane tab="Profile" key="profile">
                <Descriptions
                  bordered
                  column={window.innerWidth < 768 ? 1 : 2}
                  size="small"
                >
                  <Descriptions.Item label="Full Name" span={2}>
                    {selectedCandidate.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedCandidate.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedCandidate.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={getStatusColor(selectedCandidate.candidateStatus)}
                    >
                      {selectedCandidate.candidateStatus?.toUpperCase() ||
                        "IN-PENDING"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {selectedCandidate.location}
                  </Descriptions.Item>
                  <Descriptions.Item label="Title">
                    {selectedCandidate.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Work Order">
                    {selectedCandidate.workOrder?.title || "N/A"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Skills" span={2}>
                    <Space wrap>
                      {selectedCandidate.skills?.map((skill, index) => (
                        <Tag key={index}>{skill}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="Education" span={2}>
                    {selectedCandidate.education?.length > 0 ? (
                      selectedCandidate.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: 8 }}>
                          <Text strong>
                            {edu.degree} in {edu.field}
                          </Text>
                          <br />
                          <Text type="secondary">
                            {edu.institution} ({edu.year})
                          </Text>
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">No education information</Text>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Work Experience" span={2}>
                    {selectedCandidate.workExperience?.length > 0 ? (
                      selectedCandidate.workExperience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: 8 }}>
                          <Text strong>
                            {exp.title} at {exp.company}
                          </Text>
                          <br />
                          <Text type="secondary">{exp.duration}</Text>
                          <br />
                          <Text>{exp.description}</Text>
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">No work experience</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
              <TabPane tab="Documents" key="documents">
                {renderDocumentsTab()}
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
                type={
                  missingMandatoryDocuments.length > 0 ? "error" : "warning"
                }
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            <Divider />

            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth < 768 ? "column" : "row",
                gap: "8px",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <Button onClick={() => setIsModalVisible(false)}>Close</Button>
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: "8px",
                }}
              >
                {(missingMandatoryDocuments.length > 0 ||
                  missingOptionalDocuments.length > 0 ||
                  (selectedCandidate?.workOrderDocuments?.length > 0 &&
                    selectedCandidate?.uploadedDocuments?.length === 0)) && (
                  <Button
                    type="primary"
                    style={{ backgroundColor: "#da2c46" }}
                    onClick={handleNotifyCandidate}
                    loading={isNotifying}
                  >
                    Notify Candidate
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => handleStatusUpdate("screening")}
                  style={{ backgroundColor: "#da2c46" }}
                >
                  Move to Screening
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PendingCandidates;

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
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  useUpdateCandidateStatusMutation,
  useGetSelectedCandidatesQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import CandidateProfilePage from "./CandidateProfilePage";

const { Title, Text } = Typography;

const SelectedCandidates = ({ jobId }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  // Extract candidates from the response
  const candidates =
    responseData?.customFieldResponses?.map((response) => ({
      ...response.user,
      applicationId: response._id,
      status: response.status,
      isSourced: response.isSourced,
      isApplied: true, // Since these are selected candidates, they must have applied
      responses: response.responses,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    })) || [];

  useEffect(() => {
    if (responseData) {
      setPagination((prev) => ({
        ...prev,
        total: responseData.customFieldResponses?.length || 0,
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
    setIsModalVisible(true);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedCandidates.length === 0) return;

    try {
      const updatePromises = selectedCandidates.map((candidateId) => {
        const candidate = candidates.find((c) => c._id === candidateId);
        if (!candidate) return Promise.resolve();

        return updateCandidateStatus({
          applicationId: candidate.applicationId,
          Id: candidate._id,
          status: newStatus,
          jobId: jobId,
          isSourced: true,
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
      await updateCandidateStatus({
        applicationId: selectedCandidate.applicationId,
        Id: selectedCandidate._id,
        status: newStatus,
        jobId: jobId,
        isSourced: selectedCandidate.isSourced,
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
        title="Candidate Profile"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="status"
            type="primary"
            loading={isUpdatingStatus}
            onClick={() => handleStatusUpdate("screening")}
            style={{ backgroundColor: "#da2c46" }}
          >
            Move to Screening
          </Button>,
        ]}
      >
        {selectedCandidate && (
          <CandidateProfilePage candidate={selectedCandidate} />
        )}
      </Modal>
    </div>
  );
};

export default SelectedCandidates;

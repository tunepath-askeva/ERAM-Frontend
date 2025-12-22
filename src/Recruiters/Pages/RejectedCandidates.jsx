import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Tooltip,
  Empty,
  Modal,
  Descriptions,
  Timeline,
  Spin,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  useGetRejectedCandidatesQuery,
  useGetRejectedCandidateByIdQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const RejectedCandidates = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const primaryColor = "#da2c46";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to page 1 when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const {
    data: rejectedData,
    isLoading,
    isFetching,
    refetch,
  } = useGetRejectedCandidatesQuery({
    page,
    limit,
    search,
  });

  const {
    data: candidateDetailData,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
  } = useGetRejectedCandidateByIdQuery(selectedCandidateId, {
    skip: !selectedCandidateId, // Only fetch when ID is set
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidateId(candidate._id); // Set ID to trigger API call
    setIsDetailModalVisible(true);
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidate",
      key: "candidate",
      width: 250,
      render: (candidate) => (
        <div>
          <Text strong style={{ display: "block" }}>
            <UserOutlined style={{ marginRight: 8 }} />
            {candidate.name}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {candidate.email}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {candidate.phone}
          </Text>
        </div>
      ),
    },
    {
      title: "Work Order",
      dataIndex: "workOrder",
      key: "workOrder",
      width: 200,
      render: (workOrder) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {workOrder.title}
          </Text>
          {workOrder.jobCode && (
            <Tag color="blue" style={{ marginTop: 4 }}>
              {workOrder.jobCode}
            </Tag>
          )}
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {workOrder.location}
          </Text>
        </div>
      ),
    },
    {
      title: "Rejected At Stage",
      dataIndex: "latestRejection",
      key: "rejectedStage",
      width: 150,
      render: (rejection) =>
        rejection?.stageName ? (
          <Tag color="orange">{rejection.stageName}</Tag>
        ) : (
          <Tag color="default">Not in Pipeline</Tag>
        ),
    },
    {
      title: "Rejected By",
      dataIndex: "latestRejection",
      key: "rejectedBy",
      width: 150,
      render: (rejection) => {
        // FIX: Handle the nested object structure
        const rejectedByName =
          rejection?.rejectedBy?.name ||
          rejection?.rejectedBy?.id?.fullName ||
          "N/A";
        const rejectedByEmail =
          rejection?.rejectedBy?.email ||
          rejection?.rejectedBy?.id?.email ||
          "";

        return (
          <div>
            <Text strong style={{ fontSize: "12px" }}>
              {rejectedByName}
            </Text>
            {rejectedByEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  {rejectedByEmail}
                </Text>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Rejection Reason",
      dataIndex: "latestRejection",
      key: "rejectionReason",
      width: 250,
      render: (rejection) =>
        rejection?.rejectionReason ? (
          <Tooltip title={rejection.rejectionReason}>
            <Text
              ellipsis
              style={{
                display: "block",
                maxWidth: "250px",
                fontSize: "12px",
              }}
            >
              {rejection.rejectionReason}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Rejected before pipeline
          </Text>
        ),
    },
    {
      title: "Rejected Date",
      dataIndex: "latestRejection",
      key: "rejectedDate",
      width: 150,
      render: (rejection, record) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {rejection?.rejectedAt
            ? formatDate(rejection.rejectedAt)
            : formatDate(record.lastUpdated)}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
          style={{
            backgroundColor: primaryColor,
            borderColor: primaryColor,
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Rejected Candidates
          {rejectedData?.pagination?.totalCount && (
            <Tag color="red" style={{ marginLeft: "12px", fontSize: "14px" }}>
              {rejectedData.pagination.totalCount} Total
            </Tag>
          )}
        </Title>

        <Space size="middle">
          <Input.Search
            placeholder="Search by name, email, or work order"
            allowClear
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={handleSearch}
            st
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            loading={isFetching && search !== ""}
          />
          <Button onClick={() => refetch()}>Refresh</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={rejectedData?.data || []}
        rowKey="_id"
        loading={isLoading || (isFetching && search !== "")}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: rejectedData?.pagination?.totalCount || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} candidates`,
          onChange: (newPage, newLimit) => {
            setPage(newPage);
            setLimit(newLimit);
          },
        }}
        locale={{
          emptyText: (
            <Empty
              description={
                search
                  ? `No results found for "${search}"`
                  : "No rejected candidates found"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />

      {/* Detail Modal */}
      <Modal
        title={<Title level={4}>Rejected Candidate Details</Title>}
        visible={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedCandidateId(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsDetailModalVisible(false);
              setSelectedCandidateId(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={800}
      >
        {isLoadingDetail || isFetchingDetail ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" tip="Loading candidate details..." />
          </div>
        ) : candidateDetailData?.data ? (
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {/* Candidate Info */}
            <Card
              size="small"
              title="Candidate Information"
              style={{ marginBottom: "16px" }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  <Text strong>{candidateDetailData.data.candidate.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {candidateDetailData.data.candidate.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {candidateDetailData.data.candidate.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Skills">
                  {candidateDetailData.data.candidate.skills?.length > 0 ? (
                    <Space wrap>
                      {candidateDetailData.data.candidate.skills.map(
                        (skill, idx) => (
                          <Tag key={idx} color="blue">
                            {skill}
                          </Tag>
                        )
                      )}
                    </Space>
                  ) : (
                    <Text type="secondary">No skills listed</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Applied Date">
                  {formatDate(candidateDetailData.data.appliedDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="red">
                    {candidateDetailData.data.status.toUpperCase()}
                  </Tag>
                  {candidateDetailData.data.isSourced && (
                    <Tag color="orange">Sourced</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Work Order Info */}
            <Card
              size="small"
              title="Work Order Information"
              style={{ marginBottom: "16px" }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Title">
                  <Text strong>{candidateDetailData.data.workOrder.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Job Code">
                  <Tag color="blue">
                    {candidateDetailData.data.workOrder.jobCode}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Company">
                  {candidateDetailData.data.workOrder.company}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {candidateDetailData.data.workOrder.location}
                </Descriptions.Item>
                {candidateDetailData.data.workOrder.description && (
                  <Descriptions.Item label="Description">
                    {candidateDetailData.data.workOrder.description}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Rejection History */}
            <Card
              size="small"
              title="Rejection History"
              style={{ marginBottom: "16px" }}
            >
              {candidateDetailData.data.rejectionHistory?.length > 0 ? (
                <Timeline>
                  {candidateDetailData.data.rejectionHistory.map(
                    (rejection, idx) => {
                      // Handle nested rejectedBy structure
                      const rejectorName =
                        rejection.rejectedBy?.name ||
                        rejection.rejectedBy?.id?.fullName ||
                        "Unknown";
                      const rejectorEmail =
                        rejection.rejectedBy?.email ||
                        rejection.rejectedBy?.id?.email ||
                        "";

                      return (
                        <Timeline.Item
                          key={idx}
                          color="red"
                          dot={<ClockCircleOutlined />}
                        >
                          <div
                            style={{
                              padding: "12px",
                              backgroundColor: "#fff2f0",
                              borderRadius: "8px",
                              border: "1px solid #ffccc7",
                            }}
                          >
                            <Text strong style={{ display: "block" }}>
                              Stage: {rejection.stageName}
                            </Text>
                            <Text
                              type="secondary"
                              style={{ display: "block", fontSize: "12px" }}
                            >
                              Rejected by: {rejectorName}
                            </Text>
                            {rejectorEmail && (
                              <Text
                                type="secondary"
                                style={{ display: "block", fontSize: "12px" }}
                              >
                                Email: {rejectorEmail}
                              </Text>
                            )}
                            <Text
                              type="secondary"
                              style={{ display: "block", fontSize: "12px" }}
                            >
                              Date: {formatDate(rejection.rejectedAt)}
                            </Text>
                            <div
                              style={{
                                marginTop: "8px",
                                padding: "8px",
                                backgroundColor: "#fff",
                                borderRadius: "4px",
                              }}
                            >
                              <Text strong style={{ fontSize: "12px" }}>
                                Reason:
                              </Text>
                              <br />
                              <Text style={{ fontSize: "12px" }}>
                                {rejection.rejectionReason}
                              </Text>
                            </div>
                          </div>
                        </Timeline.Item>
                      );
                    }
                  )}
                </Timeline>
              ) : (
                <Empty
                  description="No rejection history available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>

            {/* Stage Progress */}
            {candidateDetailData.data.stageProgress?.length > 0 && (
              <Card size="small" title="Pipeline Progress">
                <Timeline>
                  {candidateDetailData.data.stageProgress.map((stage, idx) => (
                    <Timeline.Item
                      key={idx}
                      color={
                        stage.stageStatus === "approved"
                          ? "green"
                          : stage.stageStatus === "rejected"
                          ? "red"
                          : "blue"
                      }
                    >
                      <div>
                        <Text strong>{stage.stageName}</Text>
                        <Tag
                          color={
                            stage.stageStatus === "approved"
                              ? "green"
                              : stage.stageStatus === "rejected"
                              ? "red"
                              : "orange"
                          }
                          style={{ marginLeft: "8px" }}
                        >
                          {stage.stageStatus}
                        </Tag>
                        <br />
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Start: {formatDate(stage.startDate)} | End:{" "}
                          {formatDate(stage.endDate)}
                        </Text>
                        {stage.recruiter && (
                          <>
                            <br />
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              Recruiter: {stage.recruiter.name}
                            </Text>
                          </>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {/* Status History if available */}
            {candidateDetailData.data.statusHistory?.length > 0 && (
              <Card
                size="small"
                title="Status History"
                style={{ marginTop: "16px" }}
              >
                <Timeline>
                  {candidateDetailData.data.statusHistory.map(
                    (history, idx) => (
                      <Timeline.Item key={idx} color="blue">
                        <div>
                          <Tag color="blue">{history.status}</Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            Changed by: {history.changedBy?.name || "System"}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            {formatDate(history.changedAt)}
                          </Text>
                        </div>
                      </Timeline.Item>
                    )
                  )}
                </Timeline>
              </Card>
            )}
          </div>
        ) : (
          <Empty description="No candidate details available" />
        )}
      </Modal>
    </div>
  );
};

export default RejectedCandidates;

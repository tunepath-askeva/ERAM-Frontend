import React, { useState, useCallback, useMemo } from "react";
import {
  Table,
  Input,
  Space,
  Typography,
  Card,
  Spin,
  Tag,
  Avatar,
  Button,
  Tooltip,
  Empty,
  Drawer,
  Tabs,
  Divider,
  Timeline,
  List,
  Row,
  Col,
  Badge,
  Rate,
  Descriptions,
  Modal,
  Form,
  message,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  useGetPipelineCompletedCandidatesQuery,
  useConvertEmployeeMutation,
} from "../../Slices/Recruiter/RecruiterApis"; // Update this path
import { debounce } from "lodash";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const CompletedCandidates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total} candidates`,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [convertForm] = Form.useForm();
  const [candidateToConvert, setCandidateToConvert] = useState(null);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
    }, 500),
    []
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const {
    data: apiData,
    isLoading,
    refetch,
    error,
  } = useGetPipelineCompletedCandidatesQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
    status: "completed",
  });

  const [convertEmployee, { isLoading: isConverting }] =
    useConvertEmployeeMutation();

  React.useEffect(() => {
    if (apiData?.total) {
      setPagination((prev) => ({
        ...prev,
        total: apiData.total,
      }));
    }
  }, [apiData]);

  const handleTableChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setDrawerVisible(true);
  };

  const handleDownloadDocument = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    if (extension === "pdf")
      return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
    if (["jpg", "jpeg", "png", "gif"].includes(extension))
      return <FileImageOutlined style={{ color: "#1890ff" }} />;
    return <FileOutlined style={{ color: "#52c41a" }} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const renderCandidateDetails = () => {
    if (!selectedCandidate) return null;

    return (
      <div style={{ padding: "16px 0" }}>
        <Card size="small" style={{ marginBottom: "16px" }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space size="large">
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#da2c46" }}
                />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedCandidate.user?.fullName}
                  </Title>
                  <Text type="secondary">{selectedCandidate.user?.email}</Text>
                  <br />
                  <Tag color="success" style={{ marginTop: "8px" }}>
                    {selectedCandidate.workOrder?.title}
                  </Tag>
                  <Tag color="blue">{selectedCandidate.workOrder?.jobCode}</Tag>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Work Order Details */}
        <Card
          size="small"
          title="Work Order Details"
          style={{ marginBottom: "16px" }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Job Code">
              {selectedCandidate.workOrder?.jobCode}
            </Descriptions.Item>
            <Descriptions.Item label="Pipeline">
              {selectedCandidate.workOrder?.pipelineName}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedCandidate.status)}>
                {selectedCandidate.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sourced">
              <Tag
                color={
                  selectedCandidate.isSourced === "true" ? "success" : "default"
                }
              >
                {selectedCandidate.isSourced === "true" ? "YES" : "NO"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Stages Progress */}
        <Card size="small" title="Stages Progress">
          {selectedCandidate.stageProgress?.map((stage, index) => (
            <Card
              key={stage._id}
              size="small"
              type="inner"
              title={
                <Space>
                  <Badge
                    status={getStatusColor(stage.stageStatus)}
                    text={stage.stageName}
                  />
                  <Tag color={getStatusColor(stage.stageStatus)}>
                    {stage.stageStatus?.toUpperCase()}
                  </Tag>
                </Space>
              }
              style={{
                marginBottom:
                  index < selectedCandidate.stageProgress.length - 1
                    ? "12px"
                    : 0,
              }}
            >
              {/* Recruiter Reviews */}
              {stage.recruiterReviews?.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <Text strong>Recruiter Reviews:</Text>
                  {stage.recruiterReviews.map((review, idx) => (
                    <div
                      key={review._id}
                      style={{ marginLeft: "16px", marginTop: "8px" }}
                    >
                      <Space direction="vertical" size="small">
                        <div>
                          <Text strong>{review.reviewerName}</Text>
                          <Tag
                            color={getStatusColor(review.status)}
                            style={{ marginLeft: "8px" }}
                          >
                            {review.status?.toUpperCase()}
                          </Tag>
                        </div>
                        {review.reviewComments && (
                          <Text italic>"{review.reviewComments}"</Text>
                        )}
                        {review.reviewedAt && (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Reviewed at: {formatDate(review.reviewedAt)}
                          </Text>
                        )}
                      </Space>
                    </div>
                  ))}
                </div>
              )}

              {/* Stage Completion */}
              {stage.stageCompletedAt && (
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <ClockCircleOutlined /> Completed at:{" "}
                  {formatDate(stage.stageCompletedAt)}
                </Text>
              )}
            </Card>
          ))}
        </Card>

        {/* Interview Details */}
        {selectedCandidate.interviewDetails?.length > 0 && (
          <Card
            size="small"
            title="Interview Details"
            style={{ marginTop: "16px" }}
          >
            {selectedCandidate.interviewDetails.map((interview, index) => (
              <Card
                key={interview._id}
                size="small"
                type="inner"
                style={{ marginBottom: "8px" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>{interview.title}</Text>
                  </Col>
                  <Col span={12}>
                    <Tag color={getStatusColor(interview.status)}>
                      {interview.status?.replace("_", " ").toUpperCase()}
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">
                      <CalendarOutlined /> {formatDate(interview.date)}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Mode: {interview.mode}</Text>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card>
        )}
      </div>
    );
  };

  // Render timeline tab
  const renderTimeline = () => {
    if (!selectedCandidate?.stageProgress) return null;

    const timelineItems = [];

    // Add stage progress items
    selectedCandidate.stageProgress.forEach((stage) => {
      // Stage completion
      if (stage.stageCompletedAt) {
        timelineItems.push({
          dot: <CheckCircleOutlined style={{ color: "#da2c46" }} />,
          color: "green",
          children: (
            <div>
              <Text strong>Stage Completed: {stage.stageName}</Text>
              <br />
              <Text type="secondary">{formatDate(stage.stageCompletedAt)}</Text>
              <br />
              <Tag color={getStatusColor(stage.stageStatus)} size="small">
                {stage.stageStatus?.toUpperCase()}
              </Tag>
            </div>
          ),
          time: stage.stageCompletedAt,
        });
      }

      // Recruiter reviews
      stage.recruiterReviews?.forEach((review) => {
        if (review.reviewedAt) {
          timelineItems.push({
            dot: <CommentOutlined style={{ color: "#1890ff" }} />,
            children: (
              <div>
                <Text strong>
                  {review.reviewerName} reviewed {stage.stageName}
                </Text>
                <br />
                <Text type="secondary">{formatDate(review.reviewedAt)}</Text>
                <br />
                {review.reviewComments && (
                  <>
                    <Text italic>"{review.reviewComments}"</Text>
                    <br />
                  </>
                )}
                <Tag color={getStatusColor(review.status)} size="small">
                  {review.status?.toUpperCase()}
                </Tag>
              </div>
            ),
            time: review.reviewedAt,
          });
        }
      });
    });

    // Add interview items
    selectedCandidate.interviewDetails?.forEach((interview) => {
      timelineItems.push({
        dot: <CalendarOutlined style={{ color: "#722ed1" }} />,
        children: (
          <div>
            <Text strong>Interview: {interview.title}</Text>
            <br />
            <Text type="secondary">{formatDate(interview.date)}</Text>
            <br />
            <Text>Mode: {interview.mode}</Text>
            <br />
            <Tag color={getStatusColor(interview.status)} size="small">
              {interview.status?.replace("_", " ").toUpperCase()}
            </Tag>
          </div>
        ),
        time: interview.date,
      });
    });

    // Sort by time (most recent first)
    timelineItems.sort((a, b) => new Date(b.time) - new Date(a.time));

    return (
      <div style={{ padding: "16px 0" }}>
        <Timeline mode="left">
          {timelineItems.map((item, index) => (
            <Timeline.Item key={index} dot={item.dot} color={item.color}>
              {item.children}
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  // Render documents tab
  const renderDocuments = () => {
    if (!selectedCandidate?.stageProgress) return null;

    const allDocuments = [];
    selectedCandidate.stageProgress.forEach((stage) => {
      stage.uploadedDocuments?.forEach((doc) => {
        allDocuments.push({
          ...doc,
          stageName: stage.stageName,
          stageId: stage._id,
        });
      });
    });

    return (
      <div style={{ padding: "16px 0" }}>
        <List
          itemLayout="horizontal"
          dataSource={allDocuments}
          renderItem={(document) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    handleDownloadDocument(document.fileUrl, document.fileName)
                  }
                  style={{ color: "#da2c46" }}
                >
                  Download
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={getFileIcon(document.fileName)}
                title={
                  <Space>
                    <Text strong>{document.documentName}</Text>
                    <Tag size="small" color="blue">
                      {document.stageName}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{document.fileName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Uploaded: {formatDate(document.uploadedAt)}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {allDocuments.length === 0 && (
          <Empty description="No documents uploaded" />
        )}
      </div>
    );
  };

  // Table columns configuration
  const columns = [
    {
      title: "Candidate",
      dataIndex: ["user", "fullName"],
      key: "fullName",
      width: 250,
      render: (text, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#da2c46" }}
          />
          <div>
            <div style={{ fontWeight: 500, color: "#262626" }}>
              {record.user?.fullName}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.user?.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: true,
    },
    {
      title: "Work Order",
      dataIndex: ["workOrder", "title"],
      key: "workOrder",
      width: 200,
      render: (text, record) => (
        <div>
          <Text strong style={{ color: "#da2c46" }}>
            {record.workOrder?.title}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.workOrder?.jobCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Pipeline",
      dataIndex: ["workOrder", "pipelineName"],
      key: "pipeline",
      width: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
          style={{
            borderColor: "#32da2cff",
            color: "#32da2cff",
          }}
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Stages Completed",
      dataIndex: "stageProgress",
      key: "stagesCompleted",
      width: 150,
      render: (stageProgress) => {
        const completed =
          stageProgress?.filter((stage) => stage.stageStatus === "approved")
            .length || 0;
        const total = stageProgress?.length || 0;
        return (
          <div>
            <Text strong>
              {completed}/{total}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              stages
            </Text>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleViewCandidate(record)}
            style={{
              borderColor: "#da2c46",
              color: "#da2c46",
            }}
          >
            View
          </Button>

          <Button
            type="default"
            onClick={() => {
              setCandidateToConvert(record);
              convertForm.setFieldsValue({
                fullName: record.user?.fullName || "",
                dateOfJoining: null,
                category: "",
                assignedJobTitle: "",
                eramId: "",
                badgeNo: "",
                gatePassId: "",
                aramcoId: "",
                otherId: "",
                plantId: "",
                officialEmail: "",
                basicAssets: "",
              });
              setConvertModalVisible(true);
            }}
            style={{
              borderColor: "#da2c46",
              color: "#da2c46",
            }}
          >
            Convert
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: "#262626" }}>
              Completed Candidates
            </Title>
            <Text type="secondary">
              View all candidates who have completed the pipeline process
            </Text>
          </div>
          <Button
            type="primary"
            onClick={refetch}
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
          >
            Refresh
          </Button>
        </Space>

        {/* Search Bar */}
        <Search
          placeholder="Search by name, email, work order..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
          enterButton={
            <Button
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              icon={<SearchOutlined />}
            />
          }
        />
      </div>

      {/* Table */}
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={apiData?.data || []}
          rowKey="_id"
          pagination={{
            ...pagination,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
            pageSizeOptions: ["10", "20", "50", "100"],
            style: { marginTop: "16px" },
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    {debouncedSearchTerm
                      ? `No candidates found for "${debouncedSearchTerm}"`
                      : "No completed candidates found"}
                  </span>
                }
              />
            ),
          }}
        />
      </Spin>

      {/* Candidate Details Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#da2c46" }}
            />
            <span>{selectedCandidate?.user?.fullName}</span>
          </Space>
        }
        width={800}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closeIcon={<CloseOutlined />}
        extra={
          <Button
            type="primary"
            ghost
            onClick={() => setDrawerVisible(false)}
            style={{ borderColor: "#da2c46", color: "#da2c46" }}
          >
            Close
          </Button>
        }
      >
        <Tabs defaultActiveKey="details" type="card">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Candidate Details
              </span>
            }
            key="details"
          >
            {renderCandidateDetails()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                Timeline
              </span>
            }
            key="timeline"
          >
            {renderTimeline()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Documents
              </span>
            }
            key="documents"
          >
            {renderDocuments()}
          </TabPane>
        </Tabs>
      </Drawer>

      <Modal
        title={`Convert ${
          candidateToConvert?.user?.fullName || ""
        } to Employee`}
        open={convertModalVisible}
        onCancel={() => {
          setConvertModalVisible(false);
          convertForm.resetFields();
          setCandidateToConvert(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={convertForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!candidateToConvert) throw new Error("No candidate selected");
              if (!candidateToConvert.user?._id)
                throw new Error("Candidate user info is incomplete");

              const payload = {
                ...values,
                candidateId: candidateToConvert.user._id,
                customFieldId: candidateToConvert._id,
              };

              await convertEmployee(payload).unwrap();
              message.success("Candidate successfully converted to employee!");
              setConvertModalVisible(false);
              convertForm.resetFields();
              setCandidateToConvert(null);
            } catch (error) {
              console.error("Conversion failed:", error);
              message.error(error.message || "Failed to convert candidate.");
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date of Join"
                name="dateOfJoining"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Assigned Job Title"
                name="assignedJobTitle"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ERAMID"
                name="eramId"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Badge No"
                name="badgeNo"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Gate Pass ID" name="gatePassId">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Aramco ID" name="aramcoId">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Other ID" name="otherId">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Plant ID" name="plantId">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Official E-Mail Account" name="officialEmail">
            <Input />
          </Form.Item>

          <Form.Item
            label="Basic Asset MGT: Laptop, Vehicle, etc (Reporting and Documentation)"
            name="basicAssets"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setConvertModalVisible(false);
                convertForm.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#da2c46" }}
              htmlType="submit"
              loading={isConverting}
            >
              Convert to Employee
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
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
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default CompletedCandidates;

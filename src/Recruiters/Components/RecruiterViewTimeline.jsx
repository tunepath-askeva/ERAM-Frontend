import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetRecruiterJobTimelineIdQuery } from "../../Slices/Recruiter/RecruiterApis";
import {
  Timeline,
  Card,
  Tag,
  List,
  Avatar,
  Space,
  Typography,
  Result,
  Button,
  Row,
  Col,
  Spin,
  Divider
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilePdfOutlined,
  UserOutlined,
  ScheduleOutlined,
  EnvironmentOutlined,
  FrownOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const RecruiterViewTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [allTimelineData, setAllTimelineData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, refetch, isFetching } =
    useGetRecruiterJobTimelineIdQuery({
      id,
      page: currentPage,
      limit: pageSize,
    });

  useEffect(() => {
    if (data?.data) {
      setAllTimelineData(data.data);
      setHasMore(data?.hasMore);
    }
  }, [data]);

  const handleNext = () => {
    if (hasMore) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green" icon={<CheckCircleOutlined />}>Approved</Tag>;
      case "pending":
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Pending</Tag>;
      case "rejected":
      case "interview_rejected":
        return <Tag color="red" icon={<CloseCircleOutlined />}>Rejected</Tag>;
      case "pipeline":
        return <Tag color="processing">Pipeline</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderUploadedDocs = (docs) => (
    <Card size="small" title="Uploaded Documents">
      <List
        itemLayout="horizontal"
        dataSource={docs}
        renderItem={(doc) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<FilePdfOutlined />} />}
              title={doc.documentName}
              description={
                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  {doc.fileName}
                </a>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderStageProgress = (stage) => (
    <Card size="small" title={`Stage: ${stage.stageName}`} style={{ marginBottom: 10 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* Stage Status */}
        <Text><strong>Status:</strong> {getStatusTag(stage.stageStatus)}</Text>

        {/* Stage Completed At */}
        {stage.stageCompletedAt && (
          <Text>
            <strong>Completed At:</strong>{" "}
            {dayjs(stage.stageCompletedAt).format("DD MMM YYYY, hh:mm A")}
          </Text>
        )}

        {/* Recruiter Reviews */}
        {stage.recruiterReviews?.length > 0 && (
          <Card size="small" title="Recruiter Reviews">
            <List
              dataSource={stage.recruiterReviews}
              renderItem={(rev) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <>
                        <strong>{rev.recruiterId?.fullName}</strong> • {rev.status}
                      </>
                    }
                    description={
                      <>
                        <Text type="secondary">{rev.recruiterId?.email}</Text><br />
                        <Text>{rev.reviewComments}</Text><br />
                        <Text type="secondary">
                          {dayjs(rev.reviewedAt).format("DD MMM YYYY, hh:mm A")}
                        </Text>
                      </>
                    }
                  ></List.Item.Meta>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Uploaded Documents */}
        {stage.uploadedDocuments?.length > 0 && renderUploadedDocs(stage.uploadedDocuments)}
      </Space>
    </Card>
  );

  const renderTimelineItem = (item) => {
    const user = item.user;
    const workOrder = item.workOrder;

    return (
      <Timeline.Item key={item._id}>
        <Card
          title={
            <Space direction="vertical">
              <Text strong style={{ fontSize: 18 }}>{user.fullName}</Text>
              <Text type="secondary">{user.email} • {user.phone}</Text>
            </Space>
          }
          extra={getStatusTag(item.status)}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">

            {/* Candidate Details */}
            <Card size="small" title="Candidate Details">
              <Text><strong>Nationality:</strong> {user.nationality || "N/A"}</Text><br />
              <Text><strong>Experience:</strong> {user.totalExperienceYears}</Text><br />
              <Text><strong>Skills:</strong> {user.skills?.join(", ") || "N/A"}</Text>
            </Card>

            {/* Work Order Details */}
            <Card size="small" title="Work Order Details">
              <Text><strong>Title:</strong> {workOrder.title}</Text><br />
              <Text><strong>Job Code:</strong> {workOrder.jobCode}</Text><br />
              <Text><strong>Location:</strong> {workOrder.officeLocation}</Text><br />
              <Text><strong>Industry:</strong> {workOrder.companyIndustry}</Text>
            </Card>

            {/* Work Order Uploaded Docs */}
            {item.workOrderuploadedDocuments?.length > 0 &&
              renderUploadedDocs(item.workOrderuploadedDocuments)}

            {/* Stage Progress */}
            {item.stageProgress?.length > 0 && (
              <Card size="small" title="Stage Progress">
                {item.stageProgress.map(renderStageProgress)}
              </Card>
            )}

            {/* Interview Details */}
            {item.interviewDetails?.length > 0 && (
              <Card size="small" title="Interview Details">
                interviewDetails UI you want?
              </Card>
            )}

            {/* Offer Details */}
            {item.offerDetails?.length > 0 && (
              <Card size="small" title="Offer Details">
                offerDetails UI you want?
              </Card>
            )}

          </Space>
        </Card>
      </Timeline.Item>
    );
  };

  if (isLoading)
    return <Spin size="large" style={{ margin: 50 }} />;

  if (!isLoading && allTimelineData.length === 0) {
    return (
      <Result
        icon={<FrownOutlined />}
        title="No Timeline Data"
        subTitle="No records found for this Work Order."
        extra={<Button onClick={() => refetch()}>Refresh</Button>}
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Work Order Timeline</Title>

      <Timeline mode="left">
        {allTimelineData.map(renderTimelineItem)}
      </Timeline>

      {/* Pagination */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Space>
          <Button
            onClick={handlePrev}
            disabled={currentPage === 1 || isFetching}
          >
            Previous
          </Button>

          <Text>Page {currentPage}</Text>

          <Button
            type="primary"
            onClick={handleNext}
            disabled={!hasMore || isFetching}
          >
            Next
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default RecruiterViewTimeline;

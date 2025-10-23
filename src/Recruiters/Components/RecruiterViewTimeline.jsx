import { useState, useEffect, useRef, useCallback } from "react";
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
  const [pageSize, setPageSize] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allTimelineData, setAllTimelineData] = useState([]);

  const loadMoreRef = useRef();

  const { data, isLoading, refetch } = useGetRecruiterJobTimelineIdQuery({
    id,
    page: currentPage,
    limit: pageSize,
  });

  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreData();
        }
      },
      {
        rootMargin: "200px", // Increased to trigger earlier
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, loadMoreData]);

  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        setAllTimelineData(data.data);
      } else {
        setAllTimelineData((prev) => [...prev, ...data.data]);
      }

      // Check if there's more data
      const totalItems = data.totalCount || 0;
      const loadedItems = currentPage * pageSize;
      setHasMore(loadedItems < totalItems);

      setIsLoadingMore(false);
    }
  }, [data, currentPage, pageSize]);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Approved
          </Tag>
        );
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Pending
          </Tag>
        );
      case "rejected":
      case "interview_rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Rejected
          </Tag>
        );
      case "selected":
        return <Tag color="green">Selected</Tag>;
      case "interview":
        return <Tag color="blue">Interview</Tag>;
      case "pipeline":
        return <Tag color="orange">Pipeline</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderStageProgress = (stage) => {
    return (
      <Card size="small" title={`Stage: ${stage.stageName}`}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Status: </Text>
            {getStatusTag(stage.stageStatus)}
          </div>

          {stage.stageCompletedAt && (
            <div>
              <Text strong>Completed at: </Text>
              <Text>
                {dayjs(stage.stageCompletedAt).format("DD MMM YYYY, hh:mm A")}
              </Text>
            </div>
          )}

          {stage.recruiterReviews?.length > 0 && (
            <div>
              <Text strong>Reviews:</Text>
              <List
                size="small"
                dataSource={stage.recruiterReviews}
                renderItem={(review) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={`Status: ${review.status}`}
                      description={review.reviewComments || "No comments"}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {stage.uploadedDocuments?.length > 0 && (
            <div>
              <Text strong>Documents:</Text>
              <List
                size="small"
                dataSource={stage.uploadedDocuments}
                renderItem={(doc) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<FilePdfOutlined />} />}
                      title={doc.documentName}
                      description={
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {doc.fileName}
                        </a>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Space>
      </Card>
    );
  };

  const renderInterviewDetails = (interview) => {
    return (
      <Card size="small" title={`Interview: ${interview.title}`}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Status: </Text>
            {getStatusTag(interview.status)}
          </div>

          <div>
            <Space>
              <ScheduleOutlined />
              <Text>
                {dayjs(interview.date).format("DD MMM YYYY, hh:mm A")}
              </Text>
            </Space>
          </div>

          <div>
            <Space>
              <EnvironmentOutlined />
              <Text>{interview.location}</Text>
            </Space>
          </div>

          <div>
            <Text strong>Mode: </Text>
            <Text>{interview.mode}</Text>
          </div>
        </Space>
      </Card>
    );
  };

  const renderTimelineItem = (item) => {
    return (
      <Timeline.Item key={item._id}>
        <Card
          title={
            <Space>
              <Text strong>{item.user.fullName}</Text>
              <Text type="secondary">{item.user.email}</Text>
            </Space>
          }
          extra={getStatusTag(item.status)}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong>Work Order: </Text>
              <Text>{item.workOrder.title}</Text>
            </div>

            {item.selectedMovingComment && (
              <div>
                <Text strong>Comment: </Text>
                <Text>{item.selectedMovingComment}</Text>
              </div>
            )}

            {item.stageProgress?.length > 0 && (
              <div>
                <Text strong>Stage Progress:</Text>
                {item.stageProgress.map(renderStageProgress)}
              </div>
            )}

            {item.interviewDetails?.length > 0 && (
              <div>
                <Text strong>Interview Details:</Text>
                {item.interviewDetails.map(renderInterviewDetails)}
              </div>
            )}
          </Space>
        </Card>
      </Timeline.Item>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isLoading && allTimelineData.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Result
          icon={<FrownOutlined />}
          title="No Timeline Data Available"
          subTitle="There are no timeline records for this work order yet."
          extra={
            <Button type="primary" onClick={() => refetch()}>
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
          >
            Back
          </Button>
        </Col>
        <Col flex="auto">
          <Title level={2} style={{ margin: 0 }}>
            Work Order Timeline
          </Title>
        </Col>
      </Row>

      <Timeline
        mode="left"
        style={{ marginTop: "20px"}}
      >
        {allTimelineData.map(renderTimelineItem)}
      </Timeline>

      {/* Add load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          style={{ height: "20px", margin: "20px 0" }}
        ></div>
      )}

      {/* Add loading indicator */}
      {(isLoadingMore || isLoading) && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
          <Text style={{ display: "block", marginTop: "8px" }}>
            Loading more timeline items...
          </Text>
        </div>
      )}

      {/* Add end of list message */}
      {!hasMore && allTimelineData.length > 0 && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">You've reached the end of the timeline</Text>
        </div>
      )}
    </div>
  );
};

export default RecruiterViewTimeline;

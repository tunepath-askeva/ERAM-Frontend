import React from "react";
import { Card, Typography, Tag, Space, Badge, Tabs , Grid} from "antd";
import { CalendarOutlined } from "@ant-design/icons";


const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const PipelineHeader = ({
  processedJobData,
  activeStage,
  setActiveStage,
  getCandidatesInStage,
  getStageName,
  primaryColor,
  apiData,
  hasPermission,
  handleNotify,
}) => {
  const screens = useBreakpoint();

  const renderPipelineTabs = () => {
    if (!processedJobData) return null;

    const currentCandidate = processedJobData.candidates[0];
    const isTaggedPipeline = !!currentCandidate.tagPipelineId;

    let stagesToShow = [];

    if (isTaggedPipeline) {
      const allStagesMap = new Map();

      if (currentCandidate?.stageProgress?.[0]?.pipelineId?.stages) {
        currentCandidate.stageProgress[0].pipelineId.stages.forEach((stage) => {
          if (stage._id) {
            allStagesMap.set(stage._id, {
              stageId: stage._id,
              stageName: stage.name || "Unknown Stage",
              source: "pipelineStages",
            });
          }
        });
      }

      if (processedJobData.pipeline?.stages) {
        processedJobData.pipeline.stages.forEach((stage) => {
          if (stage._id && !allStagesMap.has(stage._id)) {
            allStagesMap.set(stage._id, {
              stageId: stage._id,
              stageName: stage.name || stage.stageName || "Unknown Stage",
              source: "fullPipeline",
            });
          }
        });
      }

      const stageProgressStages = currentCandidate.stageProgress || [];
      stageProgressStages.forEach((progress, index) => {
        if (progress.stageId && !allStagesMap.has(progress.stageId)) {
          allStagesMap.set(progress.stageId, {
            stageId: progress.stageId,
            stageName:
              progress.stageName || progress.fullStage?.name || "Unknown Stage",
            source: "stageProgressItem",
            order: index,
          });
        }
      });

      if (processedJobData.workOrder?.pipelineStageTimeline) {
        processedJobData.workOrder.pipelineStageTimeline.forEach(
          (stage, index) => {
            if (stage.stageId && !allStagesMap.has(stage.stageId)) {
              allStagesMap.set(stage.stageId, {
                stageId: stage.stageId,
                stageName: stage.stageName || "Unknown Stage",
                source: "workOrder",
                order: index,
              });
            }
          }
        );
      }

      if (currentCandidate.pendingPipelineStages) {
        currentCandidate.pendingPipelineStages.forEach((stage, index) => {
          if (stage.stageId && !allStagesMap.has(stage.stageId)) {
            allStagesMap.set(stage.stageId, {
              stageId: stage.stageId,
              stageName: stage.stageName || "Unknown Stage",
              source: "pendingStages",
              order: index,
            });
          }
        });
      }

      let allStagesArray = Array.from(allStagesMap.values());

      stagesToShow = allStagesArray.sort((a, b) => {
        const progressIndexA = stageProgressStages.findIndex(
          (sp) => sp.stageId === a.stageId
        );
        const progressIndexB = stageProgressStages.findIndex(
          (sp) => sp.stageId === b.stageId
        );

        if (progressIndexA !== -1 && progressIndexB !== -1) {
          return progressIndexA - progressIndexB;
        }
        if (progressIndexA !== -1) return -1;
        if (progressIndexB !== -1) return 1;

        const woIndexA =
          processedJobData.workOrder?.pipelineStageTimeline?.findIndex(
            (s) => s.stageId === a.stageId
          );
        const woIndexB =
          processedJobData.workOrder?.pipelineStageTimeline?.findIndex(
            (s) => s.stageId === b.stageId
          );

        if (woIndexA !== -1 && woIndexB !== -1) {
          return woIndexA - woIndexB;
        }
        if (woIndexA !== -1) return -1;
        if (woIndexB !== -1) return 1;

        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }

        return a.stageId.localeCompare(b.stageId);
      });

      stagesToShow = stagesToShow.map(({ source, order, ...stage }) => stage);
    } else {
      stagesToShow =
        processedJobData.workOrder?.pipelineStageTimeline?.map((stage) => ({
          stageId: stage.stageId,
          stageName: stage.stageName,
        })) || [];
    }

    return (
      <Tabs
        activeKey={activeStage}
        onChange={setActiveStage}
        tabPosition="top"
        type={screens.xs ? "line" : "card"}
        style={{
          minWidth: screens.xs ? "100%" : "max-content",
          width: screens.xs ? "100%" : "auto",
        }}
      >
        {stagesToShow.map((stage) => {
          const stageId = stage.stageId;
          const stageName = stage.stageName;
          const isCurrentStage =
            currentCandidate.currentStage === stageId ||
            currentCandidate.currentStageId === stageId ||
            currentCandidate.stageProgress?.some(
              (sp) => sp.stageId === stageId
            ) ||
            currentCandidate.pendingPipelineStages?.some(
              (pps) => pps.stageId === stageId
            );

          return (
            <TabPane
              key={stageId}
              tab={
                <Badge
                  count={getCandidatesInStage(stageId).length}
                  offset={[8, -3]}
                  style={{
                    backgroundColor: isCurrentStage ? primaryColor : "#d9d9d9",
                  }}
                >
                  <span
                    style={{
                      padding: screens.xs ? "0 4px" : "0 8px",
                      fontSize: screens.xs ? "12px" : "14px",
                      fontWeight: isCurrentStage ? "bold" : "normal",
                      color: isCurrentStage ? primaryColor : undefined,
                    }}
                  >
                    {stageName}
                  </span>
                </Badge>
              }
            />
          );
        })}
      </Tabs>
    );
  };

  return (
    <>
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: screens.xs ? "column" : "row",
              justifyContent: "space-between",
              alignItems: screens.xs ? "flex-start" : "flex-start",
              gap: screens.xs ? "8px" : "0",
            }}
          >
            <div>
              <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
                {processedJobData.title}
              </Title>
              <Text strong style={{ display: "block", marginTop: "4px" }}>
                {processedJobData.company} • {processedJobData.location}
              </Text>
              {processedJobData.jobCode && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: "2px" }}
                >
                  Code: {processedJobData.jobCode}
                </Text>
              )}
              {processedJobData.description && (
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    marginTop: "4px",
                    fontSize: screens.xs ? "12px" : "14px",
                  }}
                >
                  {processedJobData.description}
                </Text>
              )}
            </div>
            <Tag
              color={processedJobData.isActive ? "green" : "red"}
              style={{ marginTop: screens.xs ? "8px" : "0" }}
            >
              {processedJobData.isActive ? "Active" : "Inactive"}
            </Tag>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {processedJobData.startDate && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: screens.xs ? "12px" : "14px",
                }}
              >
                <CalendarOutlined /> Start:{" "}
                {new Date(processedJobData.startDate).toLocaleDateString()}
              </Text>
            )}
            {processedJobData.endDate && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: screens.xs ? "12px" : "14px",
                }}
              >
                <CalendarOutlined /> End:{" "}
                {new Date(processedJobData.endDate).toLocaleDateString()}
              </Text>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Pipeline:</Text>
            <Tag color="blue">
              {apiData?.data?.pipelineName || processedJobData.pipeline.name}
            </Tag>
          </div>
        </div>
      </Card>
      <div
        style={{
          overflowX: "auto",
          marginBottom: "16px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {renderPipelineTabs()}
      </div>
    </>
  );
};

export default PipelineHeader;
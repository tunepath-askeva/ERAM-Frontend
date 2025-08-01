import { useParams } from "react-router-dom";
import { useGetWorkOrderByIdQuery } from "../../Slices/Admin/AdminApis.js";
import {
  Card,
  Spin,
  Alert,
  Tag,
  Tabs,
  Typography,
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  Radio,
} from "antd";

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ViewWorkOrder = () => {
  const { id } = useParams();
  const { data, error, isLoading } = useGetWorkOrderByIdQuery(id);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert message="Failed to load work order" type="error" />
      </div>
    );
  }

  const workOrder = data?.workOrder;

  const renderJobOverview = () => (
    <div style={{ padding: "0", fontSize: "14px", lineHeight: "1.4" }}>
      <div
        style={{
          padding: "16px",

          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px 0",
            color: " #da2c46",
            fontSize: "18px",
            fontWeight: "600",
            wordBreak: "break-word",
            lineHeight: "1.3",
          }}
        >
          {workOrder.title}
        </h3>

        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <Tag color="blue" style={{ fontSize: "12px", padding: "4px 8px" }}>
            {workOrder.EmploymentType}
          </Tag>
          <Tag color="green" style={{ fontSize: "12px", padding: "4px 8px" }}>
            {workOrder.workplace}
          </Tag>
          {workOrder.officeLocation && (
            <Tag style={{ fontSize: "12px", padding: "4px 8px" }}>
              {workOrder.officeLocation}
            </Tag>
          )}
          <Tag color="orange" style={{ fontSize: "12px", padding: "4px 8px" }}>
            {workOrder.workOrderStatus}
          </Tag>
        </div>

        <Row gutter={[16, 12]} style={{ marginBottom: "16px" }}>
          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Project
              </Text>
              <Text style={{ fontSize: "12px", wordBreak: "break-word" }}>
                {workOrder.project?.name || "Not specified"}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Job Code
              </Text>
              <Text
                copyable
                style={{ fontSize: "12px", wordBreak: "break-all" }}
              >
                {workOrder.jobCode}
              </Text>
            </div>
          </Col>

          {workOrder.assignedRecruiters?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text
                strong
                style={{
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Assigned Recruiters
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {workOrder.assignedRecruiters.map((recruiter, index) => (
                  <Tag
                    key={index}
                    color="blue"
                    style={{
                      fontSize: "11px",
                      margin: "0",
                      padding: "4px 8px",
                    }}
                  >
                    {recruiter.fullName}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Experience
              </Text>
              <Text style={{ fontSize: "12px" }}>
                {workOrder.experienceMin} - {workOrder.experienceMax} years
              </Text>
            </div>
          </Col>

          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Education
              </Text>
              <Text style={{ fontSize: "12px" }}>
                {workOrder.Education || "Not specified"}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Job Function
              </Text>
              <Text style={{ fontSize: "12px", wordBreak: "break-word" }}>
                {workOrder.jobFunction}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Industry
              </Text>
              <Text style={{ fontSize: "12px", wordBreak: "break-word" }}>
                {workOrder.companyIndustry}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={8}>
            <div>
              <Text strong style={{ fontSize: "13px", display: "block" }}>
                Candidates Needed
              </Text>
              <Text style={{ fontSize: "12px" }}>
                {workOrder.numberOfCandidate}
              </Text>
            </div>
          </Col>
        </Row>

        {workOrder.salaryMin && workOrder.salaryMax && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Salary Range ({workOrder.salaryType})
            </Text>
            <Text
              style={{ fontSize: "14px", fontWeight: "600", color: "#52c41a" }}
            >
              ${parseInt(workOrder.salaryMin).toLocaleString()} - $
              {parseInt(workOrder.salaryMax).toLocaleString()}
            </Text>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <Text
            strong
            style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}
          >
            Job Description
          </Text>
          <Paragraph
            style={{
              whiteSpace: "pre-wrap",
              margin: "0",
              fontSize: "13px",
              wordBreak: "break-word",
              lineHeight: "1.5",
              backgroundColor: "#fff",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #f0f0f0",
            }}
          >
            {workOrder.description}
          </Paragraph>
        </div>

        {workOrder.keyResponsibilities && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Key Responsibilities
            </Text>
            <Paragraph
              style={{
                whiteSpace: "pre-wrap",
                margin: "0",
                fontSize: "13px",
                wordBreak: "break-word",
                lineHeight: "1.5",
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #f0f0f0",
              }}
            >
              {workOrder.keyResponsibilities}
            </Paragraph>
          </div>
        )}

        {workOrder.requiredSkills?.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Required Skills
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {workOrder.requiredSkills.map((skill, index) => (
                <Tag
                  key={index}
                  color="purple"
                  style={{ fontSize: "11px", margin: "0", padding: "4px 8px" }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {workOrder.documents?.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Required Documents
            </Text>
            <div
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #f0f0f0",
              }}
            >
              {workOrder.documents.map((doc, index) => (
                <div
                  key={doc._id}
                  style={{
                    marginBottom:
                      index < workOrder.documents.length - 1 ? "8px" : "0",
                  }}
                >
                  <Text strong style={{ fontSize: "12px", display: "block" }}>
                    {doc.name}
                  </Text>
                  {doc.description && (
                    <Text style={{ fontSize: "12px", color: "#666" }}>
                      {doc.description}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {workOrder.languagesRequired?.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Languages Required
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {workOrder.languagesRequired.map((lang, index) => (
                <Tag
                  key={index}
                  color="green"
                  style={{ fontSize: "11px", margin: "0", padding: "4px 8px" }}
                >
                  {lang}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {workOrder.jobRequirements && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Requirements
            </Text>
            <Paragraph
              style={{
                whiteSpace: "pre-wrap",
                margin: "0",
                fontSize: "13px",
                wordBreak: "break-word",
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #f0f0f0",
              }}
            >
              {workOrder.jobRequirements}
            </Paragraph>
          </div>
        )}

        {workOrder.qualification && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Qualification
            </Text>
            <Paragraph
              style={{
                whiteSpace: "pre-wrap",
                margin: "0",
                fontSize: "13px",
                wordBreak: "break-word",
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #f0f0f0",
              }}
            >
              {workOrder.qualification}
            </Paragraph>
          </div>
        )}

        {workOrder.benefits?.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <Text
              strong
              style={{
                fontSize: "13px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Benefits
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {workOrder.benefits.map((benefit, index) => (
                <Paragraph
                  style={{
                    whiteSpace: "pre-wrap",
                    margin: "0",
                    fontSize: "13px",
                    wordBreak: "break-word",
                    backgroundColor: "#fff",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {benefit}
                </Paragraph>
              ))}
            </div>
          </div>
        )}

        {/* Dates Section */}
        <Row gutter={[12, 8]} style={{ marginTop: "16px" }}>
          <Col xs={12} sm={6}>
            <div>
              <Text strong style={{ fontSize: "12px", display: "block" }}>
                Start Date
              </Text>
              <Text style={{ fontSize: "11px" }}>
                {new Date(workOrder.startDate).toLocaleDateString()}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div>
              <Text strong style={{ fontSize: "12px", display: "block" }}>
                End Date
              </Text>
              <Text style={{ fontSize: "11px" }}>
                {new Date(workOrder.endDate).toLocaleDateString()}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div>
              <Text strong style={{ fontSize: "12px", display: "block" }}>
                Deadline
              </Text>
              <Text style={{ fontSize: "11px" }}>
                {new Date(workOrder.deadlineDate).toLocaleDateString()}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div>
              <Text strong style={{ fontSize: "12px", display: "block" }}>
                Alert Date
              </Text>
              <Text style={{ fontSize: "11px" }}>
                {new Date(workOrder.alertDate).toLocaleDateString()}
              </Text>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );

  const renderApplicationField = (field) => {
    const commonProps = {
      placeholder: `Enter ${field.label.toLowerCase()}`,
      style: { width: "100%" },
      size: "small",
      disabled: true, // Make fields non-interactive in view mode
    };

    switch (field.type) {
      case "textarea":
        return <TextArea rows={2} {...commonProps} />;
      case "select":
        return (
          <Select
            {...commonProps}
            placeholder={`Select ${field.label.toLowerCase()}`}
          >
            {field.options?.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox.Group style={{ fontSize: "12px" }} disabled>
            {field.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: "4px" }}>
                <Checkbox value={option} style={{ fontSize: "12px" }}>
                  <span style={{ fontSize: "12px" }}>{option}</span>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group style={{ fontSize: "12px" }} disabled>
            {field.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: "4px" }}>
                <Radio value={option} style={{ fontSize: "12px" }}>
                  <span style={{ fontSize: "12px" }}>{option}</span>
                </Radio>
              </div>
            ))}
          </Radio.Group>
        );
      case "number":
        return <InputNumber {...commonProps} />;
      case "email":
        return <Input type="email" {...commonProps} />;
      case "phone":
        return <Input type="tel" {...commonProps} />;
      case "date":
        return <DatePicker {...commonProps} />;
      case "file":
        return <Input type="file" {...commonProps} />;
      default:
        return <Input {...commonProps} />;
    }
  };

  const renderApplicationForm = () => (
    <div style={{ padding: "0", fontSize: "12px" }}>
      <Text
        style={{
          fontSize: "14px",
          fontWeight: "600",
          display: "block",
          marginBottom: "16px",
        }}
      >
        Application Form Preview
      </Text>
      <Form layout="vertical" size="small">
        {workOrder.customFields && workOrder.customFields.length > 0 ? (
          workOrder.customFields.map((field) => (
            <Form.Item
              key={field._id || field.id}
              label={
                <span style={{ fontSize: "12px", fontWeight: "500" }}>
                  {field.label}
                  {field.required && <span style={{ color: "red" }}> *</span>}
                </span>
              }
              required={field.required}
              style={{ marginBottom: "16px" }}
            >
              {renderApplicationField(field)}
              <div
                style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}
              >
                Type: {field.type} | Required: {field.required ? "Yes" : "No"}
              </div>
            </Form.Item>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#999",
              padding: "40px 16px",
              fontSize: "13px",
              backgroundColor: "#fafafa",
              borderRadius: "6px",
              border: "1px dashed #d9d9d9",
            }}
          >
            No custom application fields configured for this work order.
          </div>
        )}
      </Form>
    </div>
  );

  const renderPipelineStages = () => {
    // Group stages by pipeline
    const pipelines = {};
    workOrder.pipelineStageTimeline?.forEach((stage) => {
      const pipelineId = stage.pipelineId._id;
      if (!pipelines[pipelineId]) {
        pipelines[pipelineId] = {
          name: stage.pipelineId.name,
          stages: [],
        };
      }
      pipelines[pipelineId].stages.push(stage);
    });

    return (
      <div style={{ padding: "0", fontSize: "14px", lineHeight: "1.4" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            color: " #da2c46",
            fontSize: "18px",
            fontWeight: "600",
            wordBreak: "break-word",
            lineHeight: "1.3",
          }}
        >
          Pipeline Stages Timeline
        </h3>

        {workOrder.pipelineStageTimeline?.length > 0 ? (
          <div style={{ marginTop: "16px" }}>
            {Object.values(pipelines).map((pipeline, pipelineIndex) => (
              <div key={pipelineIndex} style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <Text strong style={{ fontSize: "14px", marginRight: "8px" }}>
                    {pipeline.name}
                  </Text>
                  <Tag color="blue" style={{ fontSize: "12px" }}>
                    {pipeline.stages.length}{" "}
                    {pipeline.stages.length === 1 ? "stage" : "stages"}
                  </Tag>
                </div>

                {pipeline.stages.map((stage, stageIndex) => (
                  <Card
                    key={stage._id}
                    size="small"
                    style={{
                      marginBottom: "12px",
                      borderLeft: "4px solid #1890ff",
                      borderRadius: "6px",
                    }}
                  >
                    <Row gutter={[16, 8]}>
                      <Col xs={24} sm={8}>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "12px", display: "block" }}
                          >
                            Stage {stageIndex + 1}
                          </Text>
                          <Text style={{ fontSize: "12px", display: "block" }}>
                            Stage Name: {stage.stageName}
                          </Text>
                          <Text style={{ fontSize: "12px" }}>
                            Approval Group:{" "}
                            {stage.approvalId?.groupName || "None"}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "12px", display: "block" }}
                          >
                            Recruiters
                          </Text>
                          <div style={{ marginTop: "4px" }}>
                            {stage.recruiterIds?.map((recruiter, idx) => (
                              <Tag
                                key={idx}
                                color="blue"
                                style={{
                                  fontSize: "10px",
                                  marginBottom: "4px",
                                }}
                              >
                                {recruiter.fullName}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={8}>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "12px", display: "block" }}
                          >
                            Staff
                          </Text>
                          <div style={{ marginTop: "4px" }}>
                            {stage.staffIds?.map((staff, idx) => (
                              <Tag
                                key={idx}
                                color="green"
                                style={{
                                  fontSize: "10px",
                                  marginBottom: "4px",
                                }}
                              >
                                {staff.fullName}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "12px", display: "block" }}
                          >
                            Start Date
                          </Text>
                          <Text style={{ fontSize: "12px" }}>
                            {stage.startDate
                              ? new Date(stage.startDate).toLocaleDateString()
                              : "Not set"}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: "12px", display: "block" }}
                          >
                            End Date
                          </Text>
                          <Text style={{ fontSize: "12px" }}>
                            {stage.endDate
                              ? new Date(stage.endDate).toLocaleDateString()
                              : "Not set"}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "#999",
              padding: "40px 16px",
              fontSize: "13px",
              backgroundColor: "#fafafa",
              borderRadius: "6px",
              border: "1px dashed #d9d9d9",
            }}
          >
            No pipeline stages timeline configured for this work order.
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Mobile-like Container */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title
            level={4}
            style={{ margin: "0", fontSize: "16px", color: " #da2c46" }}
          >
            Work Order Details
          </Title>
        </div>

        {/* Content with Tabs */}
        <div style={{ padding: "16px" }}>
          <Tabs
            defaultActiveKey="overview"
            size="small"
            style={{
              "& .ant-tabs-content-holder": {
                padding: "8px 0",
              },
            }}
          >
            <TabPane
              tab={
                <span style={{ fontSize: "13px", color: " #da2c46" }}>
                  Overview
                </span>
              }
              key="overview"
            >
              {renderJobOverview()}
            </TabPane>
            <TabPane
              tab={
                <span style={{ fontSize: "13px", color: " #da2c46" }}>
                  Application Form
                </span>
              }
              key="application"
            >
              {renderApplicationForm()}
            </TabPane>
            <TabPane
              tab={
                <span style={{ fontSize: "13px", color: " #da2c46" }}>
                  Pipeline Stages
                </span>
              }
              key="pipeline"
            >
              {renderPipelineStages()}
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ViewWorkOrder;

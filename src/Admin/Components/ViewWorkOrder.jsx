import { useParams } from "react-router-dom";
import { useGetWorkOrderByIdQuery } from "../../Slices/Admin/AdminApis";
import {
  Card,
  Spin,
  Alert,
  Descriptions,
  Tag,
  List,
  Collapse,
  Typography,
  Divider,
  Space,
  Row,
  Col,
} from "antd";

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

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

  // Responsive descriptions configuration
  const getDescriptionsConfig = () => {
    if (window.innerWidth < 576) return { column: 1, size: "small" };
    if (window.innerWidth < 768) return { column: 1, size: "middle" };
    if (window.innerWidth < 992) return { column: 2, size: "middle" };
    return { column: 2, size: "middle" };
  };

  const descriptionsConfig = getDescriptionsConfig();

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      <Card
        title={
          <div
            style={{
              wordBreak: "break-word",
              fontSize: window.innerWidth < 576 ? "16px" : "18px",
            }}
          >
            Work Order: {workOrder.title}
          </div>
        }
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "8px",
        }}
        bodyStyle={{
          padding: window.innerWidth < 576 ? "12px" : "24px",
        }}
      >
        {/* Basic Information */}
        <Descriptions
          bordered
          column={descriptionsConfig.column}
          size={descriptionsConfig.size}
          style={{ marginBottom: "24px" }}
          labelStyle={{
            fontWeight: "bold",
            width: window.innerWidth < 576 ? "120px" : "auto",
          }}
        >
          <Descriptions.Item label="Job Code">
            <Text copyable style={{ wordBreak: "break-all" }}>
              {workOrder.jobCode}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="blue">{workOrder.workOrderStatus}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Workplace">
            {workOrder.workplace}
          </Descriptions.Item>
          <Descriptions.Item label="Office Location">
            {workOrder.officeLocation}
          </Descriptions.Item>
          <Descriptions.Item label="Job Function">
            <Text style={{ wordBreak: "break-word" }}>
              {workOrder.jobFunction}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Industry">
            <Text style={{ wordBreak: "break-word" }}>
              {workOrder.companyIndustry}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Employment Type">
            {workOrder.EmploymentType}
          </Descriptions.Item>
          <Descriptions.Item label="Experience">
            {workOrder.Experience} years
          </Descriptions.Item>
          <Descriptions.Item label="Education">
            {workOrder.Education}
          </Descriptions.Item>
          <Descriptions.Item label="Salary">
            ${parseInt(workOrder.annualSalary).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {new Date(workOrder.startDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {new Date(workOrder.endDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {new Date(workOrder.deadlineDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Alert Date">
            {new Date(workOrder.alertDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Candidates Needed">
            {workOrder.numberOfCandidate}
          </Descriptions.Item>
          <Descriptions.Item label="Is Common">
            {workOrder.isCommon ? "Yes" : "No"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Description Section */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "12px" }}>
            Description
          </Title>
          <Paragraph
            style={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              fontSize: window.innerWidth < 576 ? "14px" : "16px",
            }}
          >
            {workOrder.description}
          </Paragraph>
        </div>

        {/* Job Requirements Section */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "12px" }}>
            Job Requirements
          </Title>
          <Paragraph
            style={{
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              fontSize: window.innerWidth < 576 ? "14px" : "16px",
            }}
          >
            {workOrder.jobRequirements}
          </Paragraph>
        </div>

        <Divider />

        {/* Skills, Languages, and Benefits in responsive grid */}
        <Row gutter={[16, 24]}>
          {/* Required Skills */}
          <Col xs={24} md={12} lg={8}>
            <Title level={4} style={{ marginBottom: "12px" }}>
              Required Skills
            </Title>
            <Space wrap size="small">
              {workOrder.requiredSkills.map((skill, index) => (
                <Tag key={index} color="purple" style={{ marginBottom: "4px" }}>
                  {skill}
                </Tag>
              ))}
            </Space>
          </Col>

          {/* Languages Required */}
          <Col xs={24} md={12} lg={8}>
            <Title level={4} style={{ marginBottom: "12px" }}>
              Languages Required
            </Title>
            <Space wrap size="small">
              {workOrder.languagesRequired.length > 0 ? (
                workOrder.languagesRequired.map((lang, index) => (
                  <Tag
                    key={index}
                    color="green"
                    style={{ marginBottom: "4px" }}
                  >
                    {lang}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">No specific languages required</Text>
              )}
            </Space>
          </Col>

          {/* Benefits */}
          <Col xs={24} md={24} lg={8}>
            <Title level={4} style={{ marginBottom: "12px" }}>
              Benefits
            </Title>
            <Space wrap size="small">
              {workOrder.benefits.map((benefit, index) => (
                <Tag
                  key={index}
                  color="magenta"
                  style={{
                    marginBottom: "4px",
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    height: "auto",
                    padding: "4px 8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {benefit}
                  </Text>
                </Tag>
              ))}
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* Custom Fields */}
        <Collapse
          defaultActiveKey={["1"]}
          style={{ marginTop: "24px" }}
          size={window.innerWidth < 576 ? "small" : "middle"}
        >
          <Panel header="Custom Fields" key="1">
            <List
              itemLayout="horizontal"
              dataSource={workOrder.customFields}
              renderItem={(field) => (
                <List.Item
                  style={{
                    padding: window.innerWidth < 576 ? "8px 0" : "12px 0",
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Text
                        strong
                        style={{
                          fontSize: window.innerWidth < 576 ? "14px" : "16px",
                          wordBreak: "break-word",
                        }}
                      >
                        {field.label}
                      </Text>
                    }
                    description={
                      <Text
                        style={{
                          fontSize: window.innerWidth < 576 ? "12px" : "14px",
                          wordBreak: "break-word",
                        }}
                      >
                        Type: {field.type} | Required:{" "}
                        {field.required ? "Yes" : "No"}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
       
      </Card>
    </div>
  );
};

export default ViewWorkOrder;

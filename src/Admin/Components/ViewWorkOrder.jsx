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
} from "antd";

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const ViewWorkOrder = () => {
  const { id } = useParams();
  const { data, error, isLoading } = useGetWorkOrderByIdQuery(id);

  if (isLoading) return <Spin size="large" />;
  if (error) return <Alert message="Failed to load work order" type="error" />;

  const workOrder = data?.workOrder;

  return (
    <Card
      title={`Work Order: ${workOrder.title}`}
      style={{
        maxWidth: 1000,
        margin: "auto",
        marginTop: 32,
        borderRadius: 16,
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Job Code">
          {workOrder.jobCode}
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
          {workOrder.jobFunction}
        </Descriptions.Item>
        <Descriptions.Item label="Industry">
          {workOrder.companyIndustry}
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
          ${workOrder.annualSalary}
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

      <Title level={4}>Description</Title>
      <Paragraph>{workOrder.description}</Paragraph>

      <Title level={4}>Job Requirements</Title>
      <Paragraph>{workOrder.jobRequirements}</Paragraph>

      <Divider />

      <Title level={4}>Required Skills</Title>
      {workOrder.requiredSkills.map((skill, index) => (
        <Tag key={index} color="purple">
          {skill}
        </Tag>
      ))}

      <Title level={4} style={{ marginTop: 24 }}>
        Languages Required
      </Title>
      {workOrder.languagesRequired.map((lang, index) => (
        <Tag key={index} color="green">
          {lang}
        </Tag>
      ))}

      <Title level={4} style={{ marginTop: 24 }}>
        Benefits
      </Title>
      {workOrder.benefits.map((benefit, index) => (
        <Tag key={index} color="magenta">
          {benefit}
        </Tag>
      ))}

      <Divider />

      <Collapse defaultActiveKey={["1"]} style={{ marginTop: 24 }}>
        <Panel header="Custom Fields" key="1">
          <List
            itemLayout="horizontal"
            dataSource={workOrder.customFields}
            renderItem={(field) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{field.label}</Text>}
                  description={`Type: ${field.type} | Required: ${
                    field.required ? "Yes" : "No"
                  }`}
                />
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>

      <Divider />

      <Text type="secondary">
        Created at: {new Date(workOrder.createdAt).toLocaleString()} <br />
        Last updated: {new Date(workOrder.updatedAt).toLocaleString()}
      </Text>
    </Card>
  );
};

export default ViewWorkOrder;

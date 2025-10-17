import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  InputNumber,
  Space,
  Divider,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetClientsQuery,
  useEditRequisitionMutation,
  useGetRequisitionsByIdQuery,
  useGetProjectsQuery,
  useGetAllRecruitersQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate, useParams } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const EditRequisition = () => {
  const navigate = useNavigate();
  const { id: requisitionId } = useParams();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clientData } = useGetClientsQuery();
  const { data: projectData } = useGetProjectsQuery();
  const { data: recruiterData } = useGetAllRecruitersQuery();
  const {
    data: requisitionData,
    isLoading,
    refetch,
  } = useGetRequisitionsByIdQuery(requisitionId, {
    skip: !requisitionId,
  });
  const [updateRequisition] = useEditRequisitionMutation();

  const projects =
    projectData?.projects?.map((proj) => ({
      id: proj._id,
      name: proj.projectName || proj.name,
    })) || [];

  const clients =
    clientData?.clients?.map((client) => ({
      id: client._id,
      name: client.fullName,
      email: client.email,
    })) || [];

  const recruiters = recruiterData?.otherRecruiters || [];

  useEffect(() => {
    refetch(); // triggers fresh data whenever component mounts
  }, [requisitionId, refetch]);

  useEffect(() => {
    if (requisitionData?.requisition) {
      const req = requisitionData.requisition;

      // Set form fields
      form.setFieldsValue({
        ...req,
        startDate: req.startDate ? dayjs(req.startDate) : null,
        endDate: req.endDate ? dayjs(req.endDate) : null,
        deadlineDate: req.deadlineDate ? dayjs(req.deadlineDate) : null,
        alertDate: req.alertDate ? dayjs(req.alertDate) : null,
        assignedRecruiters: Array.isArray(req.assignedRecruiters)
          ? req.assignedRecruiters
          : req.assignedRecruiters
          ? [req.assignedRecruiters]
          : [],
        approvalRecruiter: Array.isArray(req.approvalRecruiter)
          ? req.approvalRecruiter
          : req.approvalRecruiter
          ? [req.approvalRecruiter]
          : [],
      });
    }
  }, [requisitionData, form]);

  const handleNavigateBack = () => {
    navigate("/recruiter/requisition");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      const requisitionData = {
        ...values,
        startDate: values.startDate
          ? dayjs(values.startDate).toISOString()
          : null,
        endDate: values.endDate ? dayjs(values.endDate).toISOString() : null,
        deadlineDate: values.deadlineDate
          ? dayjs(values.deadlineDate).toISOString()
          : null,
        alertDate: values.alertDate
          ? dayjs(values.alertDate).toISOString()
          : null,
      };

      await updateRequisition({
        id: requisitionId,
        ...requisitionData,
      }).unwrap();

      message.success("Requisition updated successfully");
      handleNavigateBack();
    } catch (error) {
      console.error("Error updating requisition:", error);
      if (error.status === 401) {
        message.error("Authentication failed. Please log in again.");
      } else if (error.status === 403) {
        message.error("You don't have permission to update requisitions.");
      } else if (error.data?.message) {
        message.error(`Update failed: ${error.data.message}`);
      } else {
        message.error("Failed to update requisition. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientChange = (value) => {
    const selectedClient = clients.find((c) => c.id === value);
    form.setFieldsValue({ client: value });

    if (selectedClient) {
      // Generate prefix from first 5 letters of client name (uppercase)
      const prefix = selectedClient.name
        .replace(/\s+/g, "") // remove spaces
        .substring(0, 5)
        .toUpperCase();

      // Generate random 5 digits
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const newReqNo = `${prefix}${randomDigits}`;

      form.setFieldsValue({ requisitionNo: newReqNo });
    }
  };

  const handleProjectChange = (value) => {
    const clientValue = form.getFieldValue("client");

    // Only generate requisition number if a client is already selected
    if (clientValue) {
      const selectedClient = clients.find((c) => c.id === clientValue);
      const prefix =
        selectedClient?.name
          ?.replace(/\s+/g, "")
          ?.substring(0, 5)
          ?.toUpperCase() || "GEN";

      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const newReqNo = `${prefix}${randomDigits}`;

      form.setFieldsValue({
        project: value,
        requisitionNo: newReqNo,
      });
    } else {
      form.setFieldsValue({ project: value });
    }
  };

  const customStyles = `
    .ant-btn-primary {
      background-color: #da2c46 !important;
      border-color: #da2c46 !important;
    }
    .ant-btn-primary:hover {
      background-color: #c2253d !important;
      border-color: #c2253d !important;
    }
  `;

  if (isLoading) {
    return (
      <div style={{ padding: "8px 16px" }}>
        <Card loading={true} />
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ padding: "8px 16px" }}>
        <Card
          title={
            <Space>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={handleNavigateBack}
              >
                Back
              </Button>
              Edit Requisition
            </Space>
          }
        >
          <Form form={form} layout="vertical">
            {/* Common Fields Section */}
            <Card title="Common Information" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Client"
                    name="client"
                    rules={[
                      { required: true, message: "Please select a client" },
                    ]}
                  >
                    <Select placeholder="Select Client" onChange={handleClientChange}>
                      {clients.map((client) => (
                        <Option key={client.id} value={client.id}>
                          {client.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Project" name="project">
                    <Select
                      placeholder="Select Project"
                      onChange={(value) => handleProjectChange(value)}
                    >
                      {projects.map((project) => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Requisition Number"
                    name="requisitionNo"
                    rules={[
                      {
                        required: true,
                        message: "Please enter requisition number",
                      },
                    ]}
                  >
                    <Input placeholder="Auto Generated" readOnly />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Reference Number"
                    name="referenceNo"
                    rules={[
                      {
                        required: true,
                        message: "Please enter reference number",
                      },
                    ]}
                  >
                    <Input placeholder="Enter Reference Number" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Recruiter Assignment Section */}
            <Card
              type="inner"
              title="Recruitment Team Assignment"
              style={{ marginBottom: "16px" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Assigned Members"
                    name="assignedRecruiters"
                    rules={[
                      { required: true, message: "Please select a member" },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select member for this requisition"
                    >
                      {recruiters.map((recruiter) => (
                        <Option key={recruiter._id} value={recruiter._id}>
                          {`${recruiter.fullName} - (${recruiter.email})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Approval Members"
                    name="approvalRecruiter"
                    rules={[
                      {
                        required: true,
                        message: "Please select an approval member",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select member for approval"
                    >
                      {recruiters.map((recruiter) => (
                        <Option key={recruiter._id} value={recruiter._id}>
                          {`${recruiter.fullName} - (${recruiter.email})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Notify Members"
                    name="notifyRecruiter"
                    rules={[
                      {
                        required: true,
                        message: "Please select an approval member",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select member for approval"
                    >
                      {recruiters.map((recruiter) => (
                        <Option key={recruiter._id} value={recruiter._id}>
                          {`${recruiter.fullName} - (${recruiter.email})`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider />

            {/* Requisition Details Section */}
            <Card
              title="Requisition Details"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Job Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter job title" },
                    ]}
                  >
                    <Input placeholder="Enter Job Title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Employment Type"
                    name="EmploymentType"
                    rules={[
                      {
                        required: true,
                        message: "Please select employment type",
                      },
                    ]}
                    initialValue="full-time"
                  >
                    <Select
                      placeholder="Select Employment Type"
                      defaultValue="full-time"
                    >
                      <Option value="full-time">Full Time</Option>
                      <Option value="part-time">Part Time</Option>
                      <Option value="contract">Contract</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Workplace"
                    name="workplace"
                    initialValue="on-site"
                  >
                    <Select
                      placeholder="Select Workplace"
                      defaultValue="on-site"
                    >
                      <Option value="on-site">Onsite</Option>
                      <Option value="offshore">Offshore</Option>
                      <Option value="remote">Remote</Option>
                      <Option value="hybrid">Hybrid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Office Location" name="officeLocation">
                    <Input placeholder="Enter Office Location" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Job Function" name="jobFunction">
                    <Input placeholder="Enter Job Function" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Industry" name="companyIndustry">
                    <Input placeholder="Enter Industry" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Min Experience (Years)"
                    name="experienceMin"
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="Max Experience (Years)"
                    name="experienceMax"
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="Education" label="Education Requirement">
                    <Select placeholder="Select education level">
                      <Option value="high-school">High School</Option>
                      <Option value="associate">Associate Degree</Option>
                      <Option value="bachelor">Bachelor's Degree</Option>
                      <Option value="master">Master's Degree</Option>
                      <Option value="phd">PhD</Option>
                      <Option value="none">None</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Salary Type"
                    name="salaryType"
                    initialValue="monthly"
                  >
                    <Select
                      placeholder="Select Salary Type"
                      defaultValue="monthly"
                    >
                      <Option value="hourly">Hourly</Option>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="annual">Annual</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Min Salary" name="salaryMin">
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Max Salary" name="salaryMax">
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Number of Candidates"
                    name="numberOfCandidate"
                  >
                    <InputNumber
                      min={1}
                      placeholder="1"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Start Date" name="startDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="End Date" name="endDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Application Deadline" name="deadlineDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Alert Date" name="alertDate">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Required Skills" name="requiredSkills">
                    <Select mode="tags" placeholder="Enter Skills"></Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Languages Required"
                    name="languagesRequired"
                  >
                    <Select mode="tags" placeholder="Enter Languages"></Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Nationality"
                    name="nationality"
                    rules={[
                      { required: true, message: "Please enter nationality" },
                    ]}
                  >
                    <Input placeholder="Enter Nationality" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="visacategory" label="Visa Category">
                    <Input placeholder="Enter Visa Category" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="visacategorytype"
                    label="Visa Category Type"
                    rules={[
                      {
                        required: true,
                        message: "Please select visa category type",
                      },
                    ]}
                    initialValue="any"
                  >
                    <Select
                      placeholder="Select visa category type"
                      defaultValue="any"
                    >
                      <Option value="any">Any</Option>
                      <Option value="relative">Relative</Option>
                      <Option value="same">Same</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Job Description" name="description">
                    <TextArea rows={3} placeholder="Enter Job Description" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Key Responsibilities"
                    name="keyResponsibilities"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Enter Key Responsibilities"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Qualifications" name="qualification">
                    <TextArea rows={3} placeholder="Enter Qualifications" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Job Requirements" name="jobRequirements">
                    <TextArea rows={3} placeholder="Enter Job Requirements" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Benefits" name="benefits">
                    <TextArea rows={2} placeholder="Enter Benefits" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Status" name="isActive">
                    <Select placeholder="Select Status">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="draft">Draft</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
                icon={<SaveOutlined />}
                size="large"
              >
                Update Requisition
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default EditRequisition;

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Typography,
  message,
  Select,
  Tabs,
  Table,
  Tag,
  Modal,
  Switch,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  useGetWhatsappConfigQuery,
  useSubmitWhatsappApiMutation,
  useUpdateTemplateStatusMutation,
  useDeleteWhatsappTemplateMutation,
} from "../../Slices/Admin/AdminApis";
import { enqueueSnackbar } from "notistack";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Paragraph } = Typography;

const WhatsAppConfig = () => {
  const [form] = Form.useForm();
  const [apiKeyDisabled, setApiKeyDisabled] = useState(false);
  const [templateBodies, setTemplateBodies] = useState({});
  const [templateVariables, setTemplateVariables] = useState({});
  const [approvedTemplates, setApprovedTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [submitConfiguration] = useSubmitWhatsappApiMutation();
  const [updateTemplateStatus] = useUpdateTemplateStatusMutation();
  const [deleteTemplate] = useDeleteWhatsappTemplateMutation();
  const {
    data: WhatsAppConfigData,
    isLoading,
    isError,
    refetch,
  } = useGetWhatsappConfigQuery();

  useEffect(() => {
    const existingConfig = WhatsAppConfigData?.whatsapp?.[0];
    if (existingConfig?.apiToken) {
      form.setFieldsValue({
        apiKey: existingConfig.apiToken,
        templates: [], // Initialize with empty array to allow multiple templates
      });
      // setApiKeyDisabled(true);
    } else {
      // Initialize form with empty templates array if no config exists
      form.setFieldsValue({
        templates: [],
      });
    }
  }, [WhatsAppConfigData, form]);

  const variableOptions = [
    { label: "Username", value: "username" },
    { label: "Work Order Name", value: "workordername" },
    { label: "Status", value: "status" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    // Interview-specific variables
    { label: "Interview Title", value: "interviewtitle" },
    { label: "Interview Type", value: "interviewtype" },
    { label: "Interview Date", value: "interviewdate" },
    { label: "Interview Time", value: "interviewtime" },
    { label: "Interview Date & Time", value: "interviewdatetime" },
    { label: "Interview Location", value: "interviewlocation" },
    { label: "Meeting Link", value: "meetinglink" },
    { label: "Interview Notes", value: "interviewnotes" },
    // Offer-specific variables
    { label: "Offer Description", value: "offerdescription" },
    { label: "Offer Document URL", value: "offerdocumenturl" },
    { label: "Additional Documents Count", value: "additionaldocumentscount" },
    // Stage-specific variables
    { label: "Stage Name", value: "stagename" },
    { label: "Required Documents", value: "requireddocuments" },
    // Pipeline completion variables
    { label: "Completed Stage Name", value: "completedstagename" },
    // Stage movement variables
    { label: "Next Stage Name", value: "nextstagename" },
    // Employee conversion variables
    { label: "ERAM ID", value: "eramid" },
    { label: "Assigned Job Title", value: "assignedjobtitle" },
    { label: "Date of Joining", value: "dateofjoining" },
    // Request/Ticket variables
    { label: "Request Type", value: "requesttype" },
    { label: "Request Status", value: "requeststatus" },
    { label: "Request Note", value: "requestnote" },
    { label: "Ticket Count", value: "ticketcount" },
    // Attrition variables
    { label: "Attrition Type", value: "attritiontype" },
    { label: "Last Working Date", value: "lastworkingdate" },
    { label: "Attrition Reason", value: "attritionreason" },
    { label: "Project Name", value: "projectname" },
    // Employee to candidate variables
    { label: "Previous ERAM ID", value: "previouseramid" },
    // Document expiry variables
    { label: "Document Name", value: "documentname" },
    { label: "Expiry Date", value: "expirydate" },
    { label: "Is Expired", value: "isexpired" },
    // Requesting for document variables
    { label: "Custom Message", value: "custommessage" },
  ];

  const fetchApprovedTemplates = async () => {
    const apiKey = form.getFieldValue("apiKey");
    if (!apiKey) {
      message.error("Please enter the API Key first.");
      return;
    }

    try {
      const response = await axios.get(
        `https://backend.askeva.io/v1/templates?token=${apiKey}`
      );

      const templates = response.data.data || [];
      const approved = templates.filter((t) => t.status === "APPROVED");
      setApprovedTemplates(approved);

      if (approved.length === 0) {
        message.warning("No approved templates found.");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch templates.");
    }
  };

  const handleTemplateSelect = (index, templateName) => {
    const templateObj = approvedTemplates.find((t) => t.name === templateName);
    setSelectedTemplates((prev) => ({
      ...prev,
      [index]: templateObj,
    }));

    if (templateObj) {
      const bodyText =
        templateObj.components.find((c) => c.type === "BODY")?.text || "";

      setTemplateBodies((prev) => ({
        ...prev,
        [index]: bodyText,
      }));

      const matches = [...bodyText.matchAll(/{{(\d+)}}/g)];
      const uniqueVars = [...new Set(matches.map((m) => m[1]))];
      const initialInputs = {};
      uniqueVars.forEach((v) => {
        initialInputs[v] = "";
      });

      setTemplateVariables((prev) => ({
        ...prev,
        [index]: initialInputs,
      }));
    }
  };

  const handleVariableChange = (index, variableKey, value) => {
    setTemplateVariables((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [variableKey]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { apiKey, templates } = values;

      if (!templates || templates.length === 0) {
        message.warning("Please add at least one template.");
        return;
      }

      const formattedTemplates = templates.map((template, index) => ({
        name: template.name,
        triggerEvent: template.triggerEvent,
        body: templateBodies[index] || "",
        variables: templateVariables[index] || {},
      }));

      const payload = {
        apiKey,
        templates: formattedTemplates,
      };

      await submitConfiguration(payload).unwrap();
      
      // Only reset form fields after successful submission
      form.resetFields(["templates"]);
      setTemplateBodies({});
      setTemplateVariables({});
      setSelectedTemplates({});
      
      // Refetch immediately to get updated data
      await refetch();
      
      enqueueSnackbar("Configured successfully...!", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to submit configuration.");
    }
  };

  const handleStatusToggle = (templateId, currentStatus, templateName) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    setSelectedTemplate({
      id: templateId,
      name: templateName,
      currentStatus: currentStatus,
      newStatus: newStatus,
      action: newStatus === "active" ? "activate" : "deactivate",
    });
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      await updateTemplateStatus({
        templateId: selectedTemplate.id,
        parentId: existingConfig._id,
        body: {
          status: selectedTemplate.newStatus,
        },
      }).unwrap();

      setIsModalOpen(false);
      setSelectedTemplate(null);

      // Refetch immediately to get updated data
      await refetch();

      enqueueSnackbar(`Template ${selectedTemplate.action}d successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error(error);
      message.error(`Failed to ${selectedTemplate.action} template.`);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId, templateName) => {
    setSelectedTemplate({
      id: templateId,
      name: templateName,
      action: "delete",
    });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTemplate({
        templateId: selectedTemplate.id,
        parentId: existingConfig._id,
      }).unwrap();

      enqueueSnackbar("Template deleted successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      setIsModalOpen(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete template.");
    }
  };

  const existingConfig = WhatsAppConfigData?.whatsapp?.[0];
  const columns = [
    {
      title: "Template Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Trigger Event",
      dataIndex: "triggerEvent",
      key: "triggerEvent",
      width: 120,
      render: (event) => <Tag color="red">{event}</Tag>,
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      width: 500,
      render: (text) => (
        <div
          style={{
            whiteSpace: "pre-wrap", // allow line breaks
            wordBreak: "break-word", // wrap long words
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status || "inactive"}
        </Tag>
      ),
    },
    {
      title: "Variables",
      key: "variables",
      width: 200,
      render: (_, record) =>
        record.variables?.length
          ? record.variables.map((v) => (
              <Tag key={v.key} color="purple">
                {v.label}
              </Tag>
            ))
          : "—",
    },
    {
      title: "Status",
      key: "statusAction",
      width: 120,
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          onChange={() =>
            handleStatusToggle(record._id, record.status, record.name)
          }
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          size="small"
        />
      ),
    },
    {
      title: "Action",
      key: "deleteAction",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          onClick={() => handleDeleteTemplate(record._id, record.name)}
        >
          Delete
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Configure API",
            children: (
              <Card
                title="WhatsApp API Configuration"
                style={{ maxWidth: 700, margin: "0 auto" }}
              >
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="API Key"
                    name="apiKey"
                    rules={[
                      { required: true, message: "Please enter the API Key!" },
                    ]}
                  >
                    <Input
                      placeholder="Enter your WhatsApp API Key"
                      disabled={apiKeyDisabled}
                      onBlur={fetchApprovedTemplates}
                    />
                  </Form.Item>

                  <Form.List name="templates">
                    {(fields, { add, remove }) => (
                      <>
                        <Title level={5}>Templates</Title>
                        {fields.map((field, index) => (
                          <Space
                            key={field.key}
                            direction="vertical"
                            style={{ width: "100%", marginBottom: 1 }}
                          >
                            <Space style={{ width: "100%" }} align="baseline">
                              <Form.Item
                                {...field}
                                name={[field.name, "name"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select template",
                                  },
                                ]}
                                style={{ flex: 1 }}
                              >
                                <Select
                                  placeholder="Select Template"
                                  options={approvedTemplates.map((t) => ({
                                    label: t.name,
                                    value: t.name,
                                  }))}
                                  onChange={(value) =>
                                    handleTemplateSelect(index, value)
                                  }
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                style={{ color: "red" }}
                                onClick={() => remove(field.name)}
                              />
                              <Form.Item>
                                <Button onClick={fetchApprovedTemplates}>
                                  Fetch Approved Templates
                                </Button>
                              </Form.Item>
                            </Space>

                            <Form.Item
                              label="Trigger Event"
                              name={[field.name, "triggerEvent"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Please select an event",
                                },
                              ]}
                            >
                              <Select
                                placeholder="Select Event"
                                options={[
                                  { label: "Sourcing", value: "sourcing" },
                                  { label: "Screening", value: "screening" },
                                  { label: "Pipeline", value: "pipeline" },
                                  { label: "Stage Notify", value: "stage-notify" },
                                  { label: "Stage Moved", value: "stage-moved" },
                                  { label: "Pipeline Completed", value: "pipeline-completed" },
                                  { label: "Interview", value: "interview" },
                                  { label: "Interview Scheduled", value: "interview-scheduled" },
                                  { label: "Offer", value: "offer" },
                                  { label: "Rejected", value: "rejected" },
                                  { label: "Converted to Employee", value: "converted-to-employee" },
                                  { label: "Request Approved", value: "request-approved" },
                                  { label: "Request Rejected", value: "request-rejected" },
                                  { label: "Ticket Info Sent", value: "ticket-info-sent" },
                                  { label: "Attrition Initiated", value: "attrition-initiated" },
                                  { label: "Employee to Candidate", value: "employee-to-candidate" },
                                  { label: "Document Expiring", value: "document-expiring" },
                                  { label: "Requesting for Document", value: "requesting-for-document" },
                                ]}
                              />
                            </Form.Item>

                            {templateBodies[index] && (
                              <>
                                <Paragraph style={{ marginLeft: 8 }}>
                                  <strong>Body:</strong> {templateBodies[index]}
                                </Paragraph>
                                {templateVariables[index] &&
                                  Object.keys(templateVariables[index]).map(
                                    (varKey) => (
                                      <Form.Item
                                        key={`${index}-var-${varKey}`}
                                        label={`Variable {{${varKey}}}`}
                                      >
                                        <Select
                                          placeholder="Select variable"
                                          value={
                                            templateVariables[index][varKey]
                                          }
                                          onChange={(value) =>
                                            handleVariableChange(
                                              index,
                                              varKey,
                                              value
                                            )
                                          }
                                          options={variableOptions}
                                          allowClear
                                        />
                                      </Form.Item>
                                    )
                                  )}
                              </>
                            )}
                          </Space>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add Template
                        </Button>
                      </>
                    )}
                  </Form.List>

                  <Form.Item>
                    <Button
                      onClick={handleSubmit}
                      type="primary"
                      style={{
                        background:
                          "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                        marginTop: "10px",
                        height: "38px",
                        minWidth: "80px",
                      }}
                      block
                    >
                      Save Configuration
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: "2",
            label: "Configured Templates",
            children: (
              <Card title="Your Saved Templates">
                {existingConfig ? (
                  <>
                    <Table
                      dataSource={existingConfig.templates}
                      columns={columns}
                      rowKey="_id"
                      scroll={{ x: 1200 }}
                    />
                  </>
                ) : (
                  <p>No configuration found.</p>
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={`${
          selectedTemplate?.action === "delete"
            ? "Delete"
            : selectedTemplate?.action?.charAt(0).toUpperCase() +
              selectedTemplate?.action?.slice(1)
        } Template`}
        open={isModalOpen}
        onOk={
          selectedTemplate?.action === "delete"
            ? handleDeleteConfirm
            : handleModalOk
        }
        onCancel={handleModalCancel}
        okText="Yes"
        cancelText="No"
        okType={
          selectedTemplate?.action === "delete" ||
          selectedTemplate?.newStatus === "inactive"
            ? "danger"
            : "primary"
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ExclamationCircleOutlined
            style={{ color: "#faad14", fontSize: "22px" }}
          />
          <span>
            Are you sure you want to {selectedTemplate?.action} the template "
            {selectedTemplate?.name}"?
          </span>
        </div>
      </Modal>
    </>
  );
};

export default WhatsAppConfig;

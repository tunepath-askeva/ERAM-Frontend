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
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  useGetWhatsappConfigQuery,
  useSubmitWhatsappApiMutation,
} from "../../Slices/Admin/AdminApis";
import { enqueueSnackbar } from "notistack";

const { Title, Paragraph } = Typography;

const WhatsAppConfig = () => {
  const [form] = Form.useForm();
  const [apiKeyDisabled, setApiKeyDisabled] = useState(false);
  const [templateBodies, setTemplateBodies] = useState({});
  const [templateVariables, setTemplateVariables] = useState({});
  const [approvedTemplates, setApprovedTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState({});

  const [submitConfiguration] = useSubmitWhatsappApiMutation();
  const { data: WhatsAppConfigData } = useGetWhatsappConfigQuery();

  useEffect(() => {
    const existingConfig = WhatsAppConfigData?.whatsapp?.[0];
    if (existingConfig?.apiToken) {
      form.setFieldsValue({
        apiKey: existingConfig.apiToken,
      });
      // setApiKeyDisabled(true);
    }
  }, [WhatsAppConfigData, form]);

  const variableOptions = [
    { label: "Username", value: "username" },
    { label: "Work Order Name", value: "workordername" },
    { label: "Status", value: "status" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
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
      enqueueSnackbar("Configured successfully...!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      form.resetFields(["templates"]);
      setTemplateBodies({});
      setTemplateVariables({});
      setSelectedTemplates({});
    } catch (error) {
      console.error(error);
      message.error("Failed to submit configuration.");
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
      render: (event) => <Tag color="red">{event}</Tag>,
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
  ];

  return (
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
                                { label: "Interview", value: "interview" },
                                { label: "Rejected", value: "rejected" },
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
                                        value={templateVariables[index][varKey]}
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
  );
};

export default WhatsAppConfig;

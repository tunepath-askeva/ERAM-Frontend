import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Typography,
  message,
  Select,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSubmitWhatsappApiMutation } from "../../Slices/SuperAdmin/SuperAdminApis";

const { Title, Paragraph } = Typography;

const SuperAdminWhatsappApi = () => {
  const [form] = Form.useForm();
  const [apiKeyDisabled, setApiKeyDisabled] = useState(false);
  const [templateBodies, setTemplateBodies] = useState({});
  const [templateVariables, setTemplateVariables] = useState({});

  const [submitConfiguration] = useSubmitWhatsappApiMutation()
  const fetchTemplateBody = async (templateName, index) => {
    const apiKey = form.getFieldValue("apiKey");

    if (!apiKey) {
      message.error("Please enter and save the API Key first.");
      return;
    }

    try {
      const response = await axios.get(
        `https://backend.askeva.io/v1/templates?token=${apiKey}`
      );

      const templates = response.data.data || [];
      const matchedTemplate = templates.find(
        (t) => t.name.toLowerCase() === templateName.toLowerCase()
      );

      if (!matchedTemplate) {
        message.warning(`No template found with name "${templateName}".`);
        return;
      }

      const bodyComponent = matchedTemplate.components.find(
        (c) => c.type === "BODY"
      );

      const bodyText = bodyComponent?.text || "No body found.";
      setTemplateBodies((prev) => ({ ...prev, [index]: bodyText }));

      const matches = [...bodyText.matchAll(/{{(\d+)}}/g)];
      const uniqueVars = [...new Set(matches.map((m) => m[1]))];

      const initialInputs = {};
      uniqueVars.forEach((v) => {
        initialInputs[v] = "";
      });

      setTemplateVariables((prev) => ({ ...prev, [index]: initialInputs }));
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch template. Check API key or network.");
    }
  };

  const variableOptions = [
    { label: "Username", value: "username" },
    { label: "Work Order Name", value: "workordername" },
    { label: "Status", value: "status" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
  ];

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
      body: templateBodies[index] || "",
      variables: templateVariables[index] || {},
    }));

    const payload = {
      apiKey,
      templates: formattedTemplates,
    };

    console.log("Submitting Payload:", payload); 

    const res = await submitConfiguration(payload).unwrap();
    message.success("Configuration submitted successfully!");
  } catch (error) {
    console.error(error);
    message.error("Failed to submit configuration.");
  }
};


  return (
    <Card
      title="WhatsApp API Configuration"
      style={{ maxWidth: 700, margin: "0 auto" }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: "Please enter the API Key!" }]}
        >
          <Input
            placeholder="Enter your WhatsApp API Key"
            disabled={apiKeyDisabled}
          />
        </Form.Item>

        {/* Templates */}
        <Form.List name="templates">
          {(fields, { add, remove }) => (
            <>
              <Title level={5}>Templates</Title>
              {fields.map((field, index) => (
                <Space
                  key={field.key}
                  direction="vertical"
                  style={{ width: "100%", marginBottom: 16 }}
                >
                  <Space style={{ width: "100%" }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]}
                      rules={[
                        { required: true, message: "Enter template name" },
                      ]}
                      style={{ flex: 1 }}
                    >
                      <Input placeholder={`Template ${index + 1} Name`} />
                    </Form.Item>

                    <Button
                      type="default"
                      onClick={() => {
                        const templateName = form.getFieldValue([
                          "templates",
                          index,
                          "name",
                        ]);
                        if (!templateName) {
                          message.warning("Please enter template name.");
                          return;
                        }
                        fetchTemplateBody(templateName, index);
                      }}
                    >
                      Get Template
                    </Button>

                    <MinusCircleOutlined
                      style={{ color: "red" }}
                      onClick={() => remove(field.name)}
                    />
                  </Space>

                  {/* Show Template Body */}
                  {templateBodies[index] && (
                    <>
                      <Paragraph style={{ marginLeft: 8 }}>
                        <strong>Body:</strong> {templateBodies[index]}
                      </Paragraph>

                      {templateVariables[index] &&
                        Object.keys(templateVariables[index]).map((varKey) => (
                          <Form.Item
                            key={`${index}-var-${varKey}`}
                            label={`Variable {{${varKey}}}`}
                          >
                            <Select
                              placeholder="Select variable"
                              value={templateVariables[index][varKey]}
                              onChange={(value) =>
                                handleVariableChange(index, varKey, value)
                              }
                              options={variableOptions}
                              allowClear
                            />
                          </Form.Item>
                        ))}
                    </>
                  )}
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Template
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button
          onClick={()=>handleSubmit()}
            type="primary"
            htmlType="submit"
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
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
  );
};

export default SuperAdminWhatsappApi;

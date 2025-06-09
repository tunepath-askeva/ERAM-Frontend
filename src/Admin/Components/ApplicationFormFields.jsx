import React from "react";
import {
  Form,
  Input,
  Button,
  Radio,
  Divider,
  Typography,
  Tag,
  Badge,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined, LockOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

const fieldStatusColors = {
  mandatory: "red",
  optional: "blue",
  off: "gray",
};

const ApplicationFormFields = ({ form }) => {
  const formValues = Form.useWatch([], form) || {};
  const mandatoryFields = formValues.mandatoryFields || {};

  return (
    <div>
      {/* Personal Information Section */}
      <Divider orientation="left">
        <Space>
          Personal Information
          <Badge
            count={
              Object.keys(mandatoryFields).filter(
                (k) =>
                  ["fullName", "email", "phone", "address", "photo"].includes(
                    k
                  ) && mandatoryFields[k] !== "off"
              ).length
            }
          />
        </Space>
      </Divider>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {["fullName", "email", "phone", "address", "photo"].map((field) => (
          <Form.Item
            key={field}
            name={["mandatoryFields", field]}
            initialValue={
              field === "fullName" || field === "email"
                ? "mandatory"
                : "optional"
            }
            style={{ margin: 0 }}
          >
            <Radio.Group buttonStyle="solid" size="small">
              <Badge
                dot
                color={
                  fieldStatusColors[
                    mandatoryFields[field] ||
                      (field === "fullName" || field === "email"
                        ? "mandatory"
                        : "optional")
                  ]
                }
              >
                <Tag
                  color={
                    mandatoryFields[field] === "off"
                      ? "default"
                      : fieldStatusColors[mandatoryFields[field]]
                  }
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const currentValue = form.getFieldValue([
                      "mandatoryFields",
                      field,
                    ]);
                    let newValue;
                    if (field === "fullName" || field === "email") {
                      return; // These are always mandatory
                    }
                    if (currentValue === "mandatory") {
                      newValue = "optional";
                    } else if (currentValue === "optional") {
                      newValue = "off";
                    } else {
                      newValue = "mandatory";
                    }
                    form.setFieldsValue({
                      mandatoryFields: {
                        ...mandatoryFields,
                        [field]: newValue,
                      },
                    });
                  }}
                >
                  {field === "fullName" && "Name"}
                  {field === "email" && "Email"}
                  {field === "phone" && "Phone"}
                  {field === "address" && "Address"}
                  {field === "photo" && "Photo"}
                  {(field === "fullName" || field === "email") && (
                    <LockOutlined style={{ marginLeft: 5 }} />
                  )}
                </Tag>
              </Badge>
            </Radio.Group>
          </Form.Item>
        ))}
      </div>

      {/* Profile Section */}
      <Divider orientation="left">
        <Space>
          Profile
          <Badge
            count={
              Object.keys(mandatoryFields).filter(
                (k) =>
                  ["education", "experience", "resume"].includes(k) &&
                  mandatoryFields[k] !== "off"
              ).length
            }
          />
        </Space>
      </Divider>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {["education", "experience", "resume"].map((field) => (
          <Form.Item
            key={field}
            name={["mandatoryFields", field]}
            initialValue="optional"
            style={{ margin: 0 }}
          >
            <Badge
              dot
              color={fieldStatusColors[mandatoryFields?.[field] || "optional"]}
            >
              <Tag
                color={
                  mandatoryFields?.[field] === "off"
                    ? "default"
                    : fieldStatusColors[mandatoryFields?.[field]]
                }
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const currentValue = form.getFieldValue([
                    "mandatoryFields",
                    field,
                  ]);
                  let newValue;
                  if (currentValue === "mandatory") newValue = "optional";
                  else if (currentValue === "optional") newValue = "off";
                  else newValue = "mandatory";

                  form.setFieldsValue({
                    mandatoryFields: {
                      ...form.getFieldValue("mandatoryFields"),
                      [field]: newValue,
                    },
                  });
                }}
              >
                {field === "education" && "Education"}
                {field === "experience" && "Experience"}
                {field === "resume" && "Resume"}
              </Tag>
            </Badge>
          </Form.Item>
        ))}
      </div>

      {/* Details Section */}
      <Divider orientation="left">
        <Space>
          Details
          <Badge
            count={
              Object.keys(mandatoryFields).filter(
                (k) =>
                  [
                    "coverLetter",
                    "portfolio",
                    "linkedinProfile",
                    "githubProfile",
                  ].includes(k) && mandatoryFields[k] !== "off"
              ).length
            }
          />
        </Space>
      </Divider>

      {["coverLetter", "portfolio", "linkedinProfile", "githubProfile"].map(
        (field) => (
          <Form.Item
            key={field}
            name={["mandatoryFields", field]}
            initialValue="optional"
            style={{ margin: 0 }}
          >
            <Badge
              dot
              color={fieldStatusColors[mandatoryFields?.[field] || "optional"]}
            >
              <Tag
                color={
                  mandatoryFields?.[field] === "off"
                    ? "default"
                    : fieldStatusColors[mandatoryFields?.[field]]
                }
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const currentValue = form.getFieldValue([
                    "mandatoryFields",
                    field,
                  ]);
                  let newValue;
                  if (currentValue === "mandatory") newValue = "optional";
                  else if (currentValue === "optional") newValue = "off";
                  else newValue = "mandatory";

                  form.setFieldsValue({
                    mandatoryFields: {
                      ...form.getFieldValue("mandatoryFields"),
                      [field]: newValue,
                    },
                  });
                }}
              >
                {field === "coverLetter" && "Cover Letter"}
                {field === "portfolio" && "Portfolio"}
                {field === "linkedinProfile" && "LinkedIn"}
                {field === "githubProfile" && "GitHub"}
              </Tag>
            </Badge>
          </Form.Item>
        )
      )}

      {/* Questions Section */}
      <Divider orientation="left">Questions</Divider>
      <Form.List name="customApplicationQuestions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} style={{ marginBottom: "16px" }}>
                <Form.Item
                  {...restField}
                  name={[name]}
                  rules={[{ required: true, message: "Question is required" }]}
                >
                  <TextArea placeholder="Enter question" rows={2} />
                </Form.Item>
                <Button
                  type="link"
                  danger
                  onClick={() => remove(name)}
                  icon={<DeleteOutlined />}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add("")}
                block
                icon={<PlusOutlined />}
              >
                Add Question
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        label="Application Instructions"
        name="applicationInstructions"
        style={{ marginTop: "24px" }}
      >
        <TextArea rows={3} placeholder="Enter any special instructions..." />
      </Form.Item>
    </div>
  );
};

export default ApplicationFormFields;

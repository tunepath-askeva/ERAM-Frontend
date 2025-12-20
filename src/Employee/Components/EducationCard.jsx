import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import {
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";

const { Text } = Typography;
const { Option } = Select;

const degreeOptions = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Diploma",
  "Certificate",
  "Professional Degree",
];

const EducationCard = ({ employeeData, loading, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [editMode, setEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [education, setEducation] = useState(employeeData?.education || []);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item._id);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    const newEducation = education.filter((edu) => (edu.id || edu._id) !== id);
    setEducation(newEducation);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newItem = {
        ...values,
        id: editingId || Math.random().toString(36).substr(2, 9),
      };

      let newEducation;
      if (editingId) {
        newEducation = education.map((edu) =>
          (edu.id || edu._id) === editingId ? newItem : edu
        );
      } else {
        newEducation = [...education, newItem];
      }

      setEducation(newEducation);
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.log("Validation error:", err);
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate({ education });
      enqueueSnackbar("Education details updated successfully!", {
        variant: "success",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update education", error);
      enqueueSnackbar(error?.data?.message || "Failed to update education", {
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    setEducation(employeeData?.education || []);
    setEditMode(false);
  };

  return (
    <>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <BookOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Education
            </span>
            {!editMode ? (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setEditMode(true)}
              >
                Edit
              </Button>
            ) : (
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  style={{ background: "#da2c46", border: "none" }}
                >
                  Add
                </Button>
              </Space>
            )}
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        {education.length === 0 ? (
          <div style={{ textAlign: "center", padding: 16 }}>
            <Text type="secondary">No education added yet</Text>
          </div>
        ) : (
          <List
            dataSource={education}
            renderItem={(item) => (
              <List.Item
                actions={
                  editMode
                    ? [
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(item)}
                        />,
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(item.id || item._id)}
                        />,
                      ]
                    : null
                }
              >
                <List.Item.Meta
                  title={
                    <Text strong>
                      {item.degree} in {item.field}
                    </Text>
                  }
                  description={
                    <div>
                      <Text>{item.institution}</Text>
                      <br />
                      <Text type="secondary">{item.year}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {editMode && (
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={loading}
                style={{ background: "#da2c46", border: "none" }}
              >
                Save Education
              </Button>
            </Space>
          </div>
        )}
      </Card>

      <Modal
        title={`${editingId ? "Edit" : "Add"} Education`}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="degree"
            label="Degree"
            rules={[{ required: true, message: "Please select degree" }]}
          >
            <Select placeholder="Select degree">
              {degreeOptions.map((degree) => (
                <Option key={degree} value={degree}>
                  {degree}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="field"
            label="Field of Study"
            rules={[{ required: true, message: "Please enter field" }]}
          >
            <Input placeholder="e.g. Computer Science" />
          </Form.Item>

          <Form.Item
            name="institution"
            label="Institution"
            rules={[{ required: true, message: "Please enter institution" }]}
          >
            <Input placeholder="e.g. Harvard University" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: "Please enter year" }]}
          >
            <Input placeholder="e.g. 2020" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EducationCard;

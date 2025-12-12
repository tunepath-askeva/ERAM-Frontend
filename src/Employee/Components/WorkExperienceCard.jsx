import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Space,
  Typography,
  Radio,
} from "antd";
import {
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const WorkExperienceCard = ({ employeeData, loading, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [workExperience, setWorkExperience] = useState(
    employeeData?.workExperience || []
  );
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsCurrentJob(false);
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    const isCurrent =
      item.endDate === "Present" ||
      (item.duration && item.duration.includes("present"));
    
    setEditingId(item.id || item._id);
    setIsCurrentJob(isCurrent);
    
    form.setFieldsValue({
      title: item.title || item.jobTitle,
      company: item.company,
      startDate: item.startDate ? dayjs(item.startDate) : null,
      endDate: isCurrent ? null : item.endDate ? dayjs(item.endDate) : null,
      description: item.description,
      workMode: item.workMode,
    });
    
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    const newWork = workExperience.filter((work) => (work.id || work._id) !== id);
    setWorkExperience(newWork);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const newItem = {
        ...values,
        title: values.title || values.jobTitle,
        startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
        endDate: isCurrentJob ? "Present" : values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        id: editingId || Math.random().toString(36).substr(2, 9),
      };

      let newWork;
      if (editingId) {
        newWork = workExperience.map((work) =>
          (work.id || work._id) === editingId ? newItem : work
        );
      } else {
        newWork = [...workExperience, newItem];
      }

      setWorkExperience(newWork);
      setIsModalVisible(false);
      setIsCurrentJob(false);
      form.resetFields();
    } catch (err) {
      console.log("Validation error:", err);
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate({ workExperience });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update work experience", error);
    }
  };

  const handleCancel = () => {
    setWorkExperience(employeeData?.workExperience || []);
    setEditMode(false);
  };

  return (
    <>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <TrophyOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Work Experience
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
        {workExperience.length === 0 ? (
          <div style={{ textAlign: "center", padding: 16 }}>
            <Text type="secondary">No work experience added yet</Text>
          </div>
        ) : (
          <List
            dataSource={workExperience}
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
                  title={<Text strong>{item.title || item.jobTitle}</Text>}
                  description={
                    <div>
                      <Text>{item.company}</Text>
                      <br />
                      <Text type="secondary">
                        {item.startDate ? dayjs(item.startDate).format("MMM YYYY") : ""} 
                        {" - "}
                        {item.endDate === "Present" ? "Present" : item.endDate ? dayjs(item.endDate).format("MMM YYYY") : ""}
                      </Text>
                      {item.workMode && (
                        <>
                          <br />
                          <Text type="secondary">Mode: {item.workMode}</Text>
                        </>
                      )}
                      {item.description && (
                        <>
                          <br />
                          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                            {item.description}
                          </Paragraph>
                        </>
                      )}
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
                Save Work Experience
              </Button>
            </Space>
          </div>
        )}
      </Card>

      <Modal
        title={`${editingId ? "Edit" : "Add"} Work Experience`}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setIsCurrentJob(false);
        }}
        okText="Save"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: "Please enter job title" }]}
          >
            <Input placeholder="e.g. Software Engineer" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company"
            rules={[{ required: true, message: "Please enter company" }]}
          >
            <Input placeholder="e.g. Google" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="endDate" label="End Date">
            <DatePicker style={{ width: "100%" }} disabled={isCurrentJob} />
          </Form.Item>

          <Form.Item>
            <Checkbox
              checked={isCurrentJob}
              onChange={(e) => {
                setIsCurrentJob(e.target.checked);
                if (e.target.checked) {
                  form.setFieldsValue({ endDate: null });
                }
              }}
            >
              I currently work here
            </Checkbox>
          </Form.Item>

          <Form.Item name="workMode" label="Work Mode">
            <Radio.Group>
              <Radio value="WFH">Work From Home</Radio>
              <Radio value="WFO">Work From Office</Radio>
              <Radio value="Hybrid">Hybrid</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="description" label="Job Description">
            <TextArea rows={4} placeholder="Describe your responsibilities" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WorkExperienceCard;
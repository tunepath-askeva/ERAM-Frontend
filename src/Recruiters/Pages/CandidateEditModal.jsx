import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Upload,
  Button,
  message,
  Tag,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  LockOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const CandidateEditModal = ({ visible, onCancel, onSubmit, candidate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (candidate && visible) {
      form.setFieldsValue({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        title: candidate.title,
        location: candidate.location,
        totalExperienceYears: candidate.totalExperienceYears,
        candidateType: candidate.candidateType,
        accountStatus: candidate.accountStatus,
        noticePeriod: candidate.noticePeriod,
        industry: candidate.industry,
      });
      setSkills(candidate.skills || []);
    }
  }, [candidate, visible, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { password, confirmPassword, ...restValues } = values;

      const updatedData = {
        ...values,
        skills,
        _id: candidate._id,
      };

      if (password) {
        updatedData.password = password;
      }
      await onSubmit(updatedData);
      form.resetFields();
      setSkills([]);
    } catch (error) {
      message.error("Failed to update candidate");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleCancel = () => {
    form.resetFields();
    setSkills([]);
    setNewSkill("");
    onCancel();
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");

    // If password is empty, confirm password can also be empty
    if (!password) {
      return Promise.resolve();
    }

    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match!"));
  };

  return (
    <Modal
      title="Edit Candidate"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
        },
      }}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="title" label="Job Title">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="location" label="Location">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="totalExperienceYears" label="Experience (Years)">
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="candidateType" label="Candidate Type">
              <Select>
                <Option value="Khafalath">Khafalath</Option>
                <Option value="External">External</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="accountStatus" label="Account Status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="noticePeriod" label="Notice Period">
              <Select>
                <Option value="Immediate">Immediate</Option>
                <Option value="1 Month">1 Month</Option>
                <Option value="2 Months">2 Months</Option>
                <Option value="3 Months">3 Months</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Skills">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <Input
                placeholder="Add new skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onPressEnter={addSkill}
              />
              <Button
                type="primary"
                style={{ background: "#da2c46" }}
                icon={<PlusOutlined />}
                onClick={addSkill}
              >
                Add
              </Button>
            </Space>
            <div>
              {skills.map((skill) => (
                <Tag
                  key={skill}
                  closable
                  onClose={() => removeSkill(skill)}
                  style={{ marginBottom: 4 }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </Space>
        </Form.Item>

        <Form.Item name="industry" label="Industry">
          <Select mode="multiple" placeholder="Select industries">
            <Option value="Technology">Technology</Option>
            <Option value="Healthcare">Healthcare</Option>
            <Option value="Finance">Finance</Option>
            <Option value="Education">Education</Option>
            <Option value="Manufacturing">Manufacturing</Option>
            <Option value="Retail">Retail</Option>
            <Option value="Consulting">Consulting</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[{ validator: validateConfirmPassword }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CandidateEditModal;

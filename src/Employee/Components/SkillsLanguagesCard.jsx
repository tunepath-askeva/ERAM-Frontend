import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tag,
  Select,
} from "antd";
import {
  EditOutlined,
  TagOutlined,
  GlobalOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";

const { Text } = Typography;
const { Option } = Select;

const SkillsLanguagesCard = ({ employeeData, loading, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [skills, setSkills] = useState(employeeData?.skills || []);
  const [languages, setLanguages] = useState(employeeData?.languages || []);

  // ✅ ADD: Update state when employeeData changes
  useEffect(() => {
    if (employeeData) {
      setSkills(employeeData.skills || []);
      setLanguages(employeeData.languages || []);
    }
  }, [employeeData]);

  const handleSubmit = async () => {
    try {
      await onUpdate({
        skills: skills.filter((skill) => skill && skill.trim() !== ""),
        languages: languages.filter((lang) => lang && lang.trim() !== ""),
      });
      enqueueSnackbar("Skills and languages updated successfully!", {
        variant: "success",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update skills/languages", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to update skills and languages",
        {
          variant: "error",
        }
      );
    }
  };

  // ✅ ADD: Cancel handler to reset changes
  const handleCancel = () => {
    setSkills(employeeData?.skills || []);
    setLanguages(employeeData?.languages || []);
    setEditMode(false);
  };

  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const removeSkill = (index) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
  };

  const updateSkill = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const addLanguage = () => {
    setLanguages([...languages, ""]);
  };

  const removeLanguage = (index) => {
    const newLanguages = [...languages];
    newLanguages.splice(index, 1);
    setLanguages(newLanguages);
  };

  const updateLanguage = (index, value) => {
    const newLanguages = [...languages];
    newLanguages[index] = value;
    setLanguages(newLanguages);
  };

  const commonLanguages = [
    "English",
    "Arabic",
    "Hindi",
    "Urdu",
    "Malayalam",
    "Tamil",
    "Bengali",
    "French",
    "Spanish",
    "German",
  ];

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            <TagOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Skills & Languages
          </span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit"}
          </Button>
        </div>
      }
      style={{ marginBottom: 24, borderRadius: "12px" }}
    >
      <Row gutter={24}>
        {/* Skills Section */}
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ marginBottom: 16, display: "block" }}>
              <TagOutlined style={{ marginRight: 8 }} />
              Skills
            </Text>

            {!editMode ? (
              <div>
                {skills.length > 0 ? (
                  <div>
                    {skills.map(
                      (skill, index) =>
                        skill && (
                          <Tag
                            key={index}
                            color="blue"
                            style={{ margin: "4px" }}
                          >
                            {skill}
                          </Tag>
                        )
                    )}
                  </div>
                ) : (
                  <Text type="secondary">No skills added</Text>
                )}
              </div>
            ) : (
              <div>
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: 8, display: "flex", gap: 8 }}
                  >
                    <Input
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      placeholder="Enter skill"
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSkill(index)}
                      disabled={skills.length === 1}
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={addSkill}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Add Skill
                </Button>
              </div>
            )}
          </div>
        </Col>

        {/* Languages Section */}
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ marginBottom: 16, display: "block" }}>
              <GlobalOutlined style={{ marginRight: 8 }} />
              Languages
            </Text>

            {!editMode ? (
              <div>
                {languages.filter((lang) => lang).length > 0 ? (
                  <div>
                    {languages.map(
                      (language, index) =>
                        language && (
                          <Tag
                            key={index}
                            color="green"
                            style={{ margin: "4px" }}
                          >
                            {language}
                          </Tag>
                        )
                    )}
                  </div>
                ) : (
                  <Text type="secondary">No languages added</Text>
                )}
              </div>
            ) : (
              <div>
                {languages.map((language, index) => (
                  <div
                    key={index}
                    style={{ marginBottom: 8, display: "flex", gap: 8 }}
                  >
                    <Select
                      value={language}
                      onChange={(value) => updateLanguage(index, value)}
                      style={{ flex: 1 }}
                      placeholder="Select language"
                    >
                      {commonLanguages.map((lang) => (
                        <Option key={lang} value={lang}>
                          {lang}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeLanguage(index)}
                      disabled={languages.length === 1}
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={addLanguage}
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Add Language
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {editMode && (
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              style={{ background: "#da2c46", border: "none" }}
            >
              Save Skills & Languages
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default SkillsLanguagesCard;

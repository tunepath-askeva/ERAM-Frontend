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
  Table,
  Space,
  Tag,
  message,
  Divider,
  InputNumber,
  Modal,
  Steps,
  Checkbox,
  Spin,
} from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  FormOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetClientsQuery,
  useSubmitRequisitionMutation,
  useGetProjectsQuery,
  useGetPipelinesQuery,
  useGetAllRecruitersQuery,
  useGetAllLevelsQuery,
  useGetAllStaffsQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const { TextArea } = Input;
const { Option } = Select;

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "file", label: "File Upload" },
];

const AddRequisition = ({ onNavigateBack }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [requisitions, setRequisitions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPipelines, setSelectedPipelines] = useState([]);
  const [pipelineDatesModalVisible, setPipelineDatesModalVisible] =
    useState(false);
  const [currentPipelineForDates, setCurrentPipelineForDates] = useState(null);
  const [pipelineStageDates, setPipelineStageDates] = useState({});
  const [customStages, setCustomStages] = useState({});
  const [stageApprovers, setStageApprovers] = useState({});
  const [stageCustomFields, setStageCustomFields] = useState({});
  const [stageRequiredDocuments, setStageRequiredDocuments] = useState({});
  const [stageStaffAssignments, setStageStaffAssignments] = useState({});
  const [stageRecruiterAssignments, setStageRecruiterAssignments] = useState(
    {}
  );
  const [draggedStage, setDraggedStage] = useState(null);
  const [defaultRecruiters, setDefaultRecruiters] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error", // "success" | "error" | "warning" | "info"
  });

  const [commonFields, setCommonFields] = useState({
    client: null,
    project: null,
    requisitionNo: "",
    referenceNo: "",
  });

  const { data: clientData } = useGetClientsQuery();
  const { data: projectData } = useGetProjectsQuery();
  const { data: pipelineData } = useGetPipelinesQuery();
  const { data: recruiterData } = useGetAllRecruitersQuery();
  const { data: staffData } = useGetAllStaffsQuery();
  const { data: levelData } = useGetAllLevelsQuery();

  const [createRequisition] = useSubmitRequisitionMutation();

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

  const activePipelines = pipelineData?.pipelines || [];
  const recruiters = recruiterData?.otherRecruiters || [];
  const staffs = staffData?.otherRecruiters || [];
  const levelGroups = levelData?.otherRecruiters || [];

  useEffect(() => {
    form.setFieldsValue(commonFields);
  }, [commonFields, form]);

  const handleCommonFieldChange = (field, value) => {
    setCommonFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Pipeline Functions
  const handlePipelineChange = (selectedPipelineIds) => {
    setSelectedPipelines(selectedPipelineIds);

    const newStageDates = { ...pipelineStageDates };
    selectedPipelineIds.forEach((pipeId) => {
      if (!newStageDates[pipeId]) {
        const pipeline = activePipelines.find((p) => p._id === pipeId);
        if (pipeline) {
          newStageDates[pipeId] = pipeline.stages.map((stage) => ({
            stageId: stage._id,
            startDate: null,
            endDate: null,
            dependencyType: "independent",
          }));
        }
      }
    });

    Object.keys(newStageDates).forEach((pipeId) => {
      if (!selectedPipelineIds.includes(pipeId)) {
        delete newStageDates[pipeId];
      }
    });

    setPipelineStageDates(newStageDates);
  };

  const showPipelineDatesModal = (pipelineId) => {
    const pipeline = activePipelines.find((p) => p._id === pipelineId);
    if (pipeline) {
      setCurrentPipelineForDates(pipeline);
      setPipelineDatesModalVisible(true);
    }
  };

  const handleStageDateChange = (pipelineId, stageId, field, value) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };

      if (!newDates[pipelineId]) {
        newDates[pipelineId] = [];
      }

      let stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );

      if (stageIndex === -1) {
        stageIndex = newDates[pipelineId].length;
        newDates[pipelineId].push({
          stageId,
          startDate: null,
          endDate: null,
          dependencyType: "independent",
        });
      }

      newDates[pipelineId][stageIndex] = {
        ...newDates[pipelineId][stageIndex],
        [field]: value ? value.format("YYYY-MM-DD") : null,
      };

      return newDates;
    });
  };

  const handleDependencyTypeChange = (pipelineId, stageId, value) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };

      if (!newDates[pipelineId]) {
        newDates[pipelineId] = [];
      }

      let stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );

      if (stageIndex === -1) {
        stageIndex = newDates[pipelineId].length;
        newDates[pipelineId].push({
          stageId,
          startDate: null,
          endDate: null,
          dependencyType: value,
        });
      } else {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          dependencyType: value,
        };
      }

      return newDates;
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const addCustomStage = (pipelineId) => {
    const newStage = {
      id: `temp-${Date.now()}`,
      name: `New Stage`,
      description: "",
      isCustom: true,
    };

    setCustomStages((prev) => ({
      ...prev,
      [pipelineId]: [...(prev[pipelineId] || []), newStage],
    }));

    setPipelineStageDates((prev) => ({
      ...prev,
      [pipelineId]: [
        ...(prev[pipelineId] || []),
        {
          stageId: newStage.id,
          startDate: null,
          endDate: null,
          dependencyType: "independent",
        },
      ],
    }));
  };

  const updateCustomStage = (pipelineId, stageId, updates) => {
    setCustomStages((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId].map((stage) =>
        (stage._id || stage.id) === stageId ? { ...stage, ...updates } : stage
      ),
    }));
  };

  const removeCustomStage = (pipelineId, stageId) => {
    setCustomStages((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId].filter(
        (stage) => (stage._id || stage.id) !== stageId
      ),
    }));

    setPipelineStageDates((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId].filter(
        (stage) => stage.stageId !== stageId
      ),
    }));
  };

  const addStageCustomField = (pipelineId, stageId) => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
    };

    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: [...(prev[pipelineId]?.[stageId] || []), newField],
      },
    }));
  };

  const addStageRequiredDocument = (pipelineId, stageId) => {
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: "New Document",
    };

    setStageRequiredDocuments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: [...(prev[pipelineId]?.[stageId] || []), newDoc],
      },
    }));
  };

  const updateStageCustomField = (pipelineId, stageId, fieldId, updates) => {
    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      },
    }));
  };

  const removeStageCustomField = (pipelineId, stageId, fieldId) => {
    setStageCustomFields((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).filter(
          (field) => field.id !== fieldId
        ),
      },
    }));
  };

  const updateStageRequiredDocument = (pipelineId, stageId, docId, updates) => {
    setStageRequiredDocuments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).map((doc) =>
          doc.id === docId ? { ...doc, ...updates } : doc
        ),
      },
    }));
  };

  const removeStageRequiredDocument = (pipelineId, stageId, docId) => {
    setStageRequiredDocuments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: (prev[pipelineId]?.[stageId] || []).filter(
          (doc) => doc.id !== docId
        ),
      },
    }));
  };

  const handleDefaultRecruitersChange = (recruiterIds) => {
    setDefaultRecruiters(recruiterIds);

    if (currentPipelineForDates && recruiterIds.length > 0) {
      const pipelineId = currentPipelineForDates._id;
      const allStages = [
        ...(currentPipelineForDates.stages || []),
        ...(customStages[pipelineId] || []),
      ];

      allStages.forEach((stage) => {
        const stageId = stage._id || stage.id;
        handleRecruiterAssignmentChange(pipelineId, stageId, recruiterIds);
      });
    }
  };

  const handleDragStart = (e, stage) => {
    setDraggedStage(stage);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetStage, pipelineId) => {
    e.preventDefault();
    if (!draggedStage) return;
    const allStages = [
      ...(customStages[pipelineId] || []),
      ...(currentPipelineForDates?.stages || []),
    ];

    const draggedIndex = allStages.findIndex(
      (s) => (s._id || s.id) === (draggedStage._id || draggedStage.id)
    );
    const targetIndex = allStages.findIndex(
      (s) => (s._id || s.id) === (targetStage._id || targetStage.id)
    );

    if (draggedIndex !== targetIndex) {
      const newStages = [...allStages];
      const [draggedItem] = newStages.splice(draggedIndex, 1);
      newStages.splice(targetIndex, 0, draggedItem);

      const newCustomStages = newStages.filter((s) => s.isCustom);
      const newExistingStages = newStages.filter((s) => !s.isCustom);

      setCustomStages((prev) => ({
        ...prev,
        [pipelineId]: newCustomStages,
      }));

      const dates = pipelineStageDates[pipelineId] || [];
      const newDates = newStages.map(
        (stage) =>
          dates.find((d) => d.stageId === (stage._id || stage.id)) || {
            stageId: stage._id || stage.id,
            startDate: null,
            endDate: null,
            dependencyType: "independent",
          }
      );

      setPipelineStageDates((prev) => ({
        ...prev,
        [pipelineId]: newDates,
      }));
    }

    setDraggedStage(null);
  };

  const handleApproverChange = (pipelineId, stageId, approvers) => {
    setStageApprovers((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: approvers,
      },
    }));
  };

  const handleLevelChange = (pipelineId, stageId, levelId) => {
    setPipelineStageDates((prev) => {
      const newDates = { ...prev };

      if (!newDates[pipelineId]) {
        newDates[pipelineId] = [];
      }

      const stageIndex = newDates[pipelineId].findIndex(
        (s) => s.stageId === stageId
      );

      if (stageIndex === -1) {
        newDates[pipelineId].push({
          stageId,
          approvalId: levelId,
          startDate: null,
          endDate: null,
          dependencyType: "independent",
        });
      } else {
        newDates[pipelineId][stageIndex] = {
          ...newDates[pipelineId][stageIndex],
          approvalId: levelId,
        };
      }

      return newDates;
    });
  };

  const handleStaffAssignmentChange = (pipelineId, stageId, staffIds) => {
    setStageStaffAssignments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: staffIds,
      },
    }));
  };

  const handleRecruiterAssignmentChange = (
    pipelineId,
    stageId,
    recruiterIds
  ) => {
    setStageRecruiterAssignments((prev) => ({
      ...prev,
      [pipelineId]: {
        ...prev[pipelineId],
        [stageId]: recruiterIds,
      },
    }));
  };

  const renderFieldTypeControls = (field, pipelineId, stageId) => {
    const updateOptions = (options) => {
      updateStageCustomField(pipelineId, stageId, field.id, { options });
    };

    const addOption = () => {
      const newOptions = [...(field.options || []), ""];
      updateOptions(newOptions);
    };

    const updateOption = (index, value) => {
      const newOptions = [...(field.options || [])];
      newOptions[index] = value;
      updateOptions(newOptions);
    };

    const removeOption = (index) => {
      const newOptions = (field.options || []).filter((_, i) => i !== index);
      updateOptions(newOptions);
    };

    switch (field.type) {
      case "text":
      case "textarea":
        return (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Input
                placeholder="Min Length"
                type="number"
                value={field.minLength || ""}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    minLength: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="Max Length"
                type="number"
                value={field.maxLength || ""}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    maxLength: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </Col>
          </Row>
        );

      case "number":
        return (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Input
                placeholder="Min Value"
                type="number"
                value={field.minValue || ""}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    minValue: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="Max Value"
                type="number"
                value={field.maxValue || ""}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    maxValue: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </Col>
          </Row>
        );

      case "file":
        return (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Input
                placeholder="Max File Size (MB)"
                type="number"
                value={field.maxFileSize || ""}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    maxFileSize: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="Accepted Formats (comma-separated)"
                value={field.acceptedFormats || ""}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    acceptedFormats: e.target.value,
                  })
                }
              />
            </Col>
          </Row>
        );

      case "date":
        return (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Checkbox
                checked={field.allowPastDates}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    allowPastDates: e.target.checked,
                  })
                }
              >
                Allow Past Dates
              </Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox
                checked={field.allowFutureDates}
                onChange={(e) =>
                  updateStageCustomField(pipelineId, stageId, field.id, {
                    allowFutureDates: e.target.checked,
                  })
                }
              >
                Allow Future Dates
              </Checkbox>
            </Col>
          </Row>
        );

      case "select":
      case "radio":
      case "checkbox":
        return (
          <div style={{ marginTop: 8 }}>
            <h4 style={{ fontSize: "12px", fontWeight: "600" }}>Options</h4>
            {(field.options || []).map((option, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: 6 }}>
                <Col span={20}>
                  <Input
                    value={option}
                    placeholder={`Option ${index + 1}`}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    type="text"
                    danger
                    onClick={() => removeOption(index)}
                    icon={<DeleteOutlined />}
                  />
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addOption} size="small">
              Add Option
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPipelineDatesModal = () => {
    if (!currentPipelineForDates) return null;

    const pipelineId = currentPipelineForDates._id;
    const pipelineStages = currentPipelineForDates.stages || [];
    const pipelineCustomStages = customStages[pipelineId] || [];
    const allStages = [
      ...pipelineStages.map((stage) => ({ ...stage, isCustom: false })),
      ...pipelineCustomStages.map((stage) => ({ ...stage, isCustom: true })),
    ];

    const sortedStages = allStages.sort((a, b) => {
      const aIndex = pipelineStageDates[pipelineId]?.findIndex(
        (d) => d.stageId === (a._id || a.id)
      );
      const bIndex = pipelineStageDates[pipelineId]?.findIndex(
        (d) => d.stageId === (b._id || b.id)
      );
      return (aIndex || 0) - (bIndex || 0);
    });

    return (
      <Modal
        title={`Set Stage Dates & Approvals for ${
          currentPipelineForDates?.name || "Pipeline"
        }`}
        visible={pipelineDatesModalVisible}
        onCancel={() => setPipelineDatesModalVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setPipelineDatesModalVisible(false)}
          >
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => setPipelineDatesModalVisible(false)}
          >
            Save Dates & Approvals
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px 24px",
        }}
      >
        <Form.Item label="Default Recruiters">
          <Select
            mode="multiple"
            value={defaultRecruiters}
            onChange={handleDefaultRecruitersChange}
            style={{ width: "100%" }}
            placeholder="Select default recruiters for all stages"
          >
            {recruiters.map((rec) => (
              <Option key={rec._id} value={rec._id}>
                {rec.fullName} ({rec.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {sortedStages.map((stage) => {
          const stageId = stage._id || stage.id;
          const dateEntry = pipelineStageDates[pipelineId]?.find(
            (d) => d.stageId === stageId
          );

          const stageFields = stageCustomFields[pipelineId]?.[stageId] || [];
          const stageDocs = stageRequiredDocuments[pipelineId]?.[stageId] || [];
          const assignedStaff =
            stageStaffAssignments[pipelineId]?.[stageId] || [];
          const assignedRecruitersForStage =
            stageRecruiterAssignments[pipelineId]?.[stageId] || [];

          return (
            <>
              <Card
                key={stageId}
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ cursor: "grab" }}>⋮⋮</span>
                      {stage.isCustom ? (
                        <Input
                          value={stage.name}
                          onChange={(e) =>
                            updateCustomStage(pipelineId, stageId, {
                              name: e.target.value,
                            })
                          }
                          style={{ maxWidth: "200px" }}
                          size="small"
                        />
                      ) : (
                        <span>{stage.name}</span>
                      )}
                      {stage.isCustom && (
                        <Tag color="orange" size="small">
                          Custom
                        </Tag>
                      )}
                      {dateEntry?.dependencyType && (
                        <Tag color="green" size="small">
                          {dateEntry.dependencyType}
                        </Tag>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {stage.isCustom && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeCustomStage(pipelineId, stageId)}
                        />
                      )}
                    </div>
                  </div>
                }
                style={{
                  marginBottom: 16,
                  cursor: stage.isCustom ? "move" : "default",
                }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, stage)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage, pipelineId)}
              >
                <Row gutter={[16, 16]} align="bottom">
                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item label="Start Date" style={{ marginBottom: 0 }}>
                      <DatePicker
                        style={{ width: "100%" }}
                        size="small"
                        value={
                          dateEntry?.startDate
                            ? dayjs(dateEntry.startDate)
                            : null
                        }
                        onChange={(date) =>
                          handleStageDateChange(
                            pipelineId,
                            stageId,
                            "startDate",
                            date
                          )
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item label="End Date" style={{ marginBottom: 0 }}>
                      <DatePicker
                        style={{ width: "100%" }}
                        size="small"
                        value={
                          dateEntry?.endDate ? dayjs(dateEntry.endDate) : null
                        }
                        onChange={(date) =>
                          handleStageDateChange(
                            pipelineId,
                            stageId,
                            "endDate",
                            date
                          )
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Dependency Type"
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        value={dateEntry?.dependencyType || "independent"}
                        onChange={(value) =>
                          handleDependencyTypeChange(pipelineId, stageId, value)
                        }
                        style={{ width: "100%" }}
                        size="small"
                      >
                        <Option value="independent">Independent</Option>
                        <Option value="dependent">Dependent</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Assigned Recruiters"
                      style={{ marginBottom: 0 }}
                      rules={[
                        { required: true, message: "Please assign recruiters" },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        value={assignedRecruitersForStage}
                        onChange={(value) =>
                          handleRecruiterAssignmentChange(
                            pipelineId,
                            stageId,
                            value
                          )
                        }
                        style={{ width: "100%" }}
                        size="small"
                        placeholder="Select recruiters"
                      >
                        {recruiters.map((recruiter) => (
                          <Option key={recruiter._id} value={recruiter._id}>
                            {`${recruiter.fullName} - (${recruiter.email})`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Assigned Staff"
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        mode="multiple"
                        value={assignedStaff}
                        onChange={(value) =>
                          handleStaffAssignmentChange(
                            pipelineId,
                            stageId,
                            value
                          )
                        }
                        style={{ width: "100%" }}
                        size="small"
                        placeholder="Select staff"
                      >
                        {staffs.map((staff) => (
                          <Option key={staff._id} value={staff._id}>
                            {staff.fullName || staff.email}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={12} lg={8}>
                    <Form.Item
                      label="Approval Level"
                      style={{ marginBottom: 0 }}
                      rules={[
                        {
                          required: true,
                          message: "Please select approval level",
                        },
                      ]}
                    >
                      <Select
                        style={{ width: "100%" }}
                        size="small"
                        placeholder="Select approval level"
                        value={dateEntry?.approvalId || undefined}
                        onChange={(value) =>
                          handleLevelChange(pipelineId, stageId, value)
                        }
                      >
                        {levelGroups.map((group) => (
                          <Option key={group._id} value={group._id}>
                            {group.groupName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left" plain style={{ margin: "16px 0" }}>
                  Stage Requirements
                </Divider>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      block
                      onClick={() => addStageCustomField(pipelineId, stageId)}
                    >
                      Add Custom Field
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      block
                      onClick={() =>
                        addStageRequiredDocument(pipelineId, stageId)
                      }
                    >
                      Add Required Document
                    </Button>
                  </Col>
                </Row>

                {stageFields.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4>Custom Fields:</h4>
                    {stageFields.map((field) => (
                      <Card
                        key={field.id}
                        size="small"
                        style={{ marginBottom: 8 }}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() =>
                              removeStageCustomField(
                                pipelineId,
                                stageId,
                                field.id
                              )
                            }
                          />
                        }
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateStageCustomField(
                                  pipelineId,
                                  stageId,
                                  field.id,
                                  { label: e.target.value }
                                )
                              }
                              placeholder="Field Label"
                            />
                          </Col>
                          <Col span={12}>
                            <Select
                              value={field.type}
                              onChange={(value) =>
                                updateStageCustomField(
                                  pipelineId,
                                  stageId,
                                  field.id,
                                  { type: value }
                                )
                              }
                              style={{ width: "100%" }}
                            >
                              {fieldTypes.map((type) => (
                                <Option key={type.value} value={type.value}>
                                  {type.label}
                                </Option>
                              ))}
                            </Select>
                          </Col>
                        </Row>
                        <Checkbox
                          checked={field.required}
                          onChange={(e) =>
                            updateStageCustomField(
                              pipelineId,
                              stageId,
                              field.id,
                              { required: e.target.checked }
                            )
                          }
                          style={{ marginTop: 8 }}
                        >
                          Required
                        </Checkbox>
                        {renderFieldTypeControls(field, pipelineId, stageId)}
                      </Card>
                    ))}
                  </div>
                )}

                {stageDocs.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4>Required Documents:</h4>
                    {stageDocs.map((doc) => (
                      <Card
                        key={doc.id}
                        size="small"
                        style={{ marginBottom: 8 }}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() =>
                              removeStageRequiredDocument(
                                pipelineId,
                                stageId,
                                doc.id
                              )
                            }
                          />
                        }
                      >
                        <Input
                          value={doc.title}
                          onChange={(e) =>
                            updateStageRequiredDocument(
                              pipelineId,
                              stageId,
                              doc.id,
                              { title: e.target.value }
                            )
                          }
                          placeholder="Document Title"
                        />
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </>
          );
        })}
      </Modal>
    );
  };

  const renderSelectedPipelines = () => (
    <div style={{ marginBottom: "16px" }}>
      <h4 style={{ marginBottom: "8px" }}>Selected Pipelines</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {selectedPipelines.map((pipelineId) => {
          const pipeline = activePipelines.find((p) => p._id === pipelineId);
          if (!pipeline) return null;

          return (
            <Tag
              key={pipelineId}
              color="blue"
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              onClick={() => showPipelineDatesModal(pipelineId)}
            >
              {pipeline.name}
              <CalendarOutlined />
            </Tag>
          );
        })}
      </div>
    </div>
  );

  const handleAddRequisition = async () => {
    try {
      const values = await form.validateFields();

      // Validate pipeline stage requirements before proceeding
      const validationErrors = [];

      selectedPipelines.forEach((pipeId) => {
        const pipeline = activePipelines.find((p) => p._id === pipeId);
        const stages = [
          ...(customStages[pipeId] || []),
          ...(pipeline?.stages || []),
        ];

        stages.forEach((stage) => {
          const stageId = stage._id || stage.id;
          const recruiterIds =
            stageRecruiterAssignments[pipeId]?.[stageId] || [];
          const dateEntry = pipelineStageDates[pipeId]?.find(
            (d) => d.stageId === stageId
          );

          if (!recruiterIds.length) {
            validationErrors.push(
              `Please assign recruiters for all stages`
            );
          }
        });
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      const pipelineStageTimeline = selectedPipelines.flatMap((pipeId) => {
        const pipeline = activePipelines.find((p) => p._id === pipeId);
        const stages = [
          ...(customStages[pipeId] || []),
          ...(pipeline?.stages || []),
        ];

        return (
          pipelineStageDates[pipeId]?.map((dateEntry, index) => {
            const stage = stages.find(
              (s) => (s._id || s.id) === dateEntry.stageId
            );
            const isCustom = !pipeline?.stages?.some(
              (s) => s._id === dateEntry.stageId
            );
            const customFields =
              stageCustomFields[pipeId]?.[dateEntry.stageId] || [];
            const requiredDocuments =
              stageRequiredDocuments[pipeId]?.[dateEntry.stageId] || [];
            const staffIds =
              stageStaffAssignments[pipeId]?.[dateEntry.stageId] || [];
            const recruiterIds =
              stageRecruiterAssignments[pipeId]?.[dateEntry.stageId] || [];

            return {
              pipelineId: pipeId,
              stageId: dateEntry.stageId,
              stageName: stage?.name,
              stageOrder: index,
              startDate: dateEntry.startDate,
              endDate: dateEntry.endDate,
              dependencyType: dateEntry.dependencyType || "independent",
              isCustomStage: isCustom,
              recruiterIds: recruiterIds.map((id) => ({ _id: id })),
              staffIds: staffIds.map((id) => ({ _id: id })),
              approvalId: dateEntry.approvalId || null,
              customFields: customFields.map((field) => ({
                label: field.label,
                type: field.type,
                required: field.required,
                options: field.options || [],
              })),
              requiredDocuments: requiredDocuments.map((doc) => ({
                title: doc.title,
              })),
            };
          }) || []
        );
      });

      const newRequisition = {
        ...values,
        pipelineStageTimeline,
        key: editingIndex !== null ? editingIndex : Date.now(),
        id: editingIndex !== null ? requisitions[editingIndex].id : Date.now(),
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

      if (editingIndex !== null) {
        const updatedRequisitions = [...requisitions];
        updatedRequisitions[editingIndex] = newRequisition;
        setRequisitions(updatedRequisitions);
        setEditingIndex(null);
        message.success("Requisition updated successfully");
      } else {
        setRequisitions((prev) => [...prev, newRequisition]);
        message.success("Requisition added to batch");
      }

      form.resetFields();
      form.setFieldsValue(commonFields);
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Please fill all required fields before adding",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const handleNavigateBack = () => {
    navigate("/recruiter/requisition");
  };

  const handleEditRequisition = (index) => {
    const requisition = requisitions[index];
    form.setFieldsValue({
      ...requisition,
      startDate: requisition.startDate ? dayjs(requisition.startDate) : null,
      endDate: requisition.endDate ? dayjs(requisition.endDate) : null,
      deadlineDate: requisition.deadlineDate
        ? dayjs(requisition.deadlineDate)
        : null,
      alertDate: requisition.alertDate ? dayjs(requisition.alertDate) : null,
    });
    setEditingIndex(index);
  };

  const handleDeleteRequisition = (index) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you want to remove this requisition from the batch?",
      onOk() {
        const updatedRequisitions = requisitions.filter((_, i) => i !== index);
        setRequisitions(updatedRequisitions);
        message.success("Requisition removed from batch");

        if (editingIndex === index) {
          form.resetFields();
          form.setFieldsValue(commonFields);
          setEditingIndex(null);
        }
      },
    });
  };

  const handleFinalSubmit = async () => {
    if (requisitions.length === 0) {
      message.error("Please add at least one requisition before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const requisitionsData = requisitions.map((req) => ({
        ...req,
        startDate: req.startDate ? dayjs(req.startDate).toISOString() : null,
        endDate: req.endDate ? dayjs(req.endDate).toISOString() : null,
        deadlineDate: req.deadlineDate
          ? dayjs(req.deadlineDate).toISOString()
          : null,
        alertDate: req.alertDate ? dayjs(req.alertDate).toISOString() : null,
      }));

      await createRequisition({ requisition: requisitionsData }).unwrap();

      message.success(
        `${requisitions.length} requisitions created successfully`
      );
      handleNavigateBack();
    } catch (error) {
      console.error("Error creating requisitions:", error);
      message.error("Failed to create requisitions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Employment Type",
      dataIndex: "EmploymentType",
      key: "EmploymentType",
      width: 120,
      render: (type) => (
        <Tag
          color={
            type === "full-time"
              ? "green"
              : type === "part-time"
              ? "blue"
              : "orange"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Experience",
      key: "experience",
      render: (_, record) =>
        `${record.experienceMin || 0} - ${record.experienceMax || 0} years`,
      width: 120,
    },
    {
      title: "Salary",
      key: "salary",
      render: (_, record) => {
        if (!record.salaryMin && !record.salaryMax) return "N/A";
        const currency = record.salaryType === "annual" ? "SAR " : "";
        const suffix =
          {
            hourly: "/hr",
            daily: "/day",
            weekly: "/wk",
            monthly: "/mo",
            annual: "/yr",
          }[record.salaryType] || "";
        return `${currency}${record.salaryMin || 0} - ${
          record.salaryMax || 0
        }${suffix}`;
      },
      width: 150,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleEditRequisition(index)}
            icon={<EditOutlined />}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteRequisition(index)}
            icon={<DeleteOutlined />}
            size="small"
          />
        </Space>
      ),
      width: 120,
      fixed: "right",
    },
  ];

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
              Add New Requisitions
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
                    <Select
                      placeholder="Select Client"
                      onChange={(value) =>
                        handleCommonFieldChange("client", value)
                      }
                    >
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
                      onChange={(value) =>
                        handleCommonFieldChange("project", value)
                      }
                      value={commonFields.project}
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
                    <Input
                      placeholder="Enter Requisition Number"
                      onChange={(e) =>
                        handleCommonFieldChange("requisitionNo", e.target.value)
                      }
                    />
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
                    <Input
                      placeholder="Enter Reference Number"
                      onChange={(e) =>
                        handleCommonFieldChange("referenceNo", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Pipeline Section */}
            <Card
              type="inner"
              title="Hiring Pipeline"
              style={{ marginBottom: "16px" }}
            >
              <Form.Item
                name="pipeline"
                label="Pipeline"
                rules={[
                  { required: true, message: "Please select a pipeline" },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select hiring pipelines"
                  onChange={handlePipelineChange}
                  value={selectedPipelines}
                  optionFilterProp="label"
                  showSearch
                >
                  {activePipelines.map((pipeline) => (
                    <Option
                      key={pipeline._id}
                      value={pipeline._id}
                      label={pipeline.name}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{pipeline.name}</span>
                        <Button
                          type="link"
                          size="small"
                          icon={<FormOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showPipelineDatesModal(pipeline._id);
                          }}
                        />
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedPipelines.length > 0 && renderSelectedPipelines()}
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
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Nationality"
                    name="nationality"
                    rules={[
                      { required: true, message: "Please enter job title" },
                    ]}
                  >
                    <Input placeholder="Enter Job Title" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="visacategory" label="Visa Category">
                    <Input />
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
                  >
                    <Select
                      placeholder="Select visa category type"
                      defaultValue="any"
                    >
                      <Option value="any">Any</Option>
                      <Option value="relative">Relative</Option>
                      <Option value="all">All</Option>
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
                onClick={handleAddRequisition}
                icon={<PlusOutlined />}
                size="large"
              >
                {editingIndex !== null ? "Update Requisition" : "Add to Batch"}
              </Button>
            </div>
          </Form>

          {/* Requisitions Table */}
          {requisitions.length > 0 && (
            <Card
              title={`Added Requisitions (${requisitions.length})`}
              size="small"
              style={{ marginTop: 16 }}
            >
              <Table
                columns={columns}
                dataSource={requisitions}
                rowKey="key"
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
              />

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button
                  type="primary"
                  onClick={handleFinalSubmit}
                  loading={isSubmitting}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Submit All Requisitions ({requisitions.length})
                </Button>
              </div>
            </Card>
          )}
        </Card>
        {renderPipelineDatesModal()}
      </div>
    </>
  );
};

export default AddRequisition;

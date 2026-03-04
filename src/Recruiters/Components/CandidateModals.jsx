import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Upload,
  message,
  Card,
  Row,
  Col,
  List,
  Tag,
  Checkbox,
  Divider,
  Typography,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title,  Text } = Typography;

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

const CandidateModals = ({
  // Message Modal
  messageModalVisible,
  setMessageModalVisible,
  messageForm,
  buttonStyle,
  selectedCandidate,

  // Schedule Interview Modal
  scheduleInterviewModalVisible,
  setScheduleInterviewModalVisible,
  interviewForm,
  interviewToReschedule,
  setInterviewToReschedule,
  handleScheduleInterviewSubmit,
  isSchedulingInterview,
  allRecruiters,
  selectedCandidateForInterview,

  // Pipeline Modal
  pipelineModalVisible,
  setPipelineModalVisible,
  selectedPipeline,
  setSelectedPipeline,
  enqueueSnackbar,
  universalRecruiterIds,
  setUniversalRecruiterIds,
  universalStartDate,
  setUniversalStartDate,
  universalEndDate,
  setUniversalEndDate,
  applyDatesToAllStages,
  setApplyDatesToAllStages,
  handleUniversalRecruiterChange,
  handleApplyUniversalRecruiters,
  handleApplyUniversalDates,
  customStages,
  pipelineStageDates,
  stageApprovers,
  stageCustomFields,
  stageRequiredDocuments,
  stageStaffAssignments,
  stageRecruiterAssignments,
  allRecruitersForPipeline,
  levelGroups,
  staffs,
  addCustomStage,
  removeCustomStage,
  updateCustomStage,
  handleStageDateChange,
  handleDependencyTypeChange,
  handleRecruiterAssignmentChange,
  handleStaffAssignmentChange,
  handleLevelChange,
  addStageCustomField,
  removeStageCustomField,
  updateStageCustomField,
  addStageRequiredDocument,
  removeStageRequiredDocument,
  updateStageRequiredDocument,
  addFieldOption,
  updateFieldOption,
  removeFieldOption,
  handleDragStart,
  handleDragOver,
  handleDrop,

  // Offer Modal
  offerModalVisible,
  setOfferModalVisible,
  offerAction,
  offerForm,
  handleOfferSubmit,
  handleReviseOffer,
  isSubmittingOffer,

  // Accept Offer Modal
  acceptOfferModalVisible,
  setAcceptOfferModalVisible,
  acceptOfferForm,
  handleAcceptOfferOnBehalf,
  isAcceptingOffer,
  candidate,

  // Change Pipeline Modal
  changePipelineModalVisible,
  setChangePipelineModalVisible,
  selectedNewPipeline,
  setSelectedNewPipeline,
  handleUpdatePipeline,
  isUpdatingPipeline,
  activePipelines,
}) => {
  return (
    <>
      {/* Message Modal */}
      <Modal
        title={`Message ${selectedCandidate?.name}`}
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={messageForm}
          layout="vertical"
          initialValues={{
            subject: `Regarding your application for ${selectedCandidate?.position}`,
          }}
        >
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter a subject" }]}
          >
            <Input placeholder="Enter subject" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <TextArea rows={6} placeholder="Type your message here" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setMessageModalVisible(false);
                  messageForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={buttonStyle}
                onClick={() => {
                  messageForm
                    .validateFields()
                    .then((values) => {
                      message.success("Message sent successfully!");
                      setMessageModalVisible(false);
                      messageForm.resetFields();
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
              >
                Send Message
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        title={`${
          interviewToReschedule ? "Reschedule" : "Schedule New"
        } Interview`}
        open={scheduleInterviewModalVisible}
        onCancel={() => {
          setScheduleInterviewModalVisible(false);
          interviewForm.resetFields();
          setInterviewToReschedule(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setScheduleInterviewModalVisible(false);
              interviewForm.resetFields();
              setInterviewToReschedule(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={buttonStyle}
            onClick={() => interviewForm.submit()}
            loading={isSchedulingInterview}
          >
            {interviewToReschedule ? "Reschedule" : "Schedule"} Interview
          </Button>,
        ]}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={interviewForm}
          layout="vertical"
          initialValues={{
            type: "online",
          }}
          onFinish={async (values) => {
            await handleScheduleInterviewSubmit(values, selectedCandidateForInterview?._id);
          }}
        >
          <Form.Item
            label="Interview Title"
            name="title"
            rules={[
              { required: true, message: "Please enter interview title" },
            ]}
          >
            <Input placeholder="e.g. Technical Interview, HR Round, etc." />
          </Form.Item>
          <Form.Item
            label="Interview Type"
            name="type"
            rules={[
              { required: true, message: "Please select interview type" },
            ]}
          >
            <Select placeholder="Select interview type">
              <Option value="online">Online (Video Call)</Option>
              <Option value="telephonic">Telephonic</Option>
              <Option value="in-person">In Person</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "online" ? (
                <Form.Item
                  label="Meeting Link"
                  name="meetingLink"
                  rules={[
                    {
                      type: "url",
                      message: "Please enter a valid URL",
                    },
                  ]}
                >
                  <Input placeholder="Enter Google Meet or Zoom link" />
                </Form.Item>
              ) : getFieldValue("type") === "in-person" ? (
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[
                    {
                      required: true,
                      message: "Please enter interview location",
                    },
                  ]}
                >
                  <Input placeholder="Enter office address or location" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            label="Interview Date & Time"
            name="datetime"
            rules={[{ required: true, message: "Please select date and time" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            label="Interviewers"
            name="interviewers"
            rules={[
              {
                required: true,
                message: "Please select at least one interviewer",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select interviewers"
              loading={!allRecruiters}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {allRecruiters?.otherRecruiters?.map((recruiter) => (
                <Option
                  key={recruiter._id}
                  value={recruiter._id}
                  label={`${recruiter.fullName || ""} (${
                    recruiter.specialization || ""
                  })`}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>
                      <Text strong>{recruiter.fullName || "Unknown"}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {recruiter.specialization || "No specialization"} •{" "}
                        {recruiter.email || "No email"}
                      </Text>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Additional Notes" name="notes">
            <TextArea
              rows={4}
              placeholder="Add any additional notes or instructions"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Pipeline Modal */}
      <Modal
        title={`Pipeline Details - ${selectedPipeline?.name || ""}`}
        open={pipelineModalVisible}
        onCancel={() => {
          setPipelineModalVisible(false);
          setSelectedPipeline(null);
          setUniversalRecruiterIds([]);
          setApplyDatesToAllStages(false);
          setUniversalStartDate(null);
          setUniversalEndDate(null);
          setApplyDatesToAllStages(false);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setPipelineModalVisible(false);
              setSelectedPipeline(null);
            }}
          >
            Close
          </Button>,
          <Button
            key="setStages"
            type="primary"
            style={{ background: "#da2c46" }}
            onClick={() => {
              enqueueSnackbar("Pipeline details saved successfully", {
                variant: "success",
              });
              setPipelineModalVisible(false);
              setSelectedPipeline(null);
            }}
          >
            Save Changes
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
        <Card
          size="small"
          style={{ marginBottom: 16, background: "#f9f9f9" }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SettingOutlined />
              <Text strong>Universal Settings</Text>
            </div>
          }
        >
          <div
            style={{
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Recruiter Assignment
            </Text>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16}>
                <Form.Item
                  label="Assign Recruiters to All Stages"
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    mode="multiple"
                    value={universalRecruiterIds}
                    onChange={handleUniversalRecruiterChange}
                    style={{ width: "100%" }}
                    size="small"
                    placeholder="Select recruiters for all stages"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {allRecruitersForPipeline?.otherRecruiters?.map((recruiter) => (
                      <Option key={recruiter._id} value={recruiter._id}>
                        {recruiter.fullName || recruiter.email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                {universalRecruiterIds.length > 0 && (
                  <Button
                    type="link"
                    size="small"
                    onClick={handleApplyUniversalRecruiters}
                    style={{ marginLeft: 8 }}
                  >
                    Apply Now
                  </Button>
                )}
              </Col>
            </Row>
            {universalRecruiterIds.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Selected: {universalRecruiterIds.length} recruiter(s)
                </Text>
              </div>
            )}
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Date Assignment
            </Text>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Universal Start Date"
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="small"
                    value={universalStartDate}
                    onChange={setUniversalStartDate}
                    placeholder="Select start date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Universal End Date"
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="small"
                    value={universalEndDate}
                    onChange={setUniversalEndDate}
                    placeholder="Select end date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                {(universalStartDate || universalEndDate) && (
                  <Button
                    type="link"
                    size="small"
                    onClick={handleApplyUniversalDates}
                    style={{ marginLeft: 8 }}
                  >
                    Apply Now
                  </Button>
                )}
              </Col>
            </Row>
            {(universalStartDate || universalEndDate) && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {universalStartDate &&
                    `Start: ${universalStartDate.format("YYYY-MM-DD")}`}
                  {universalStartDate && universalEndDate && " | "}
                  {universalEndDate &&
                    `End: ${universalEndDate.format("YYYY-MM-DD")}`}
                </Text>
              </div>
            )}
          </div>
        </Card>

        {selectedPipeline && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Title level={4}>{selectedPipeline.name}</Title>
              <Tag
                color={
                  selectedPipeline.pipelineStatus === "active" ? "green" : "red"
                }
              >
                {selectedPipeline.pipelineStatus}
              </Tag>
            </div>

            <List
              dataSource={[
                ...(selectedPipeline.stages || []).map((s) => ({
                  ...s,
                  isCustom: false,
                })),
                ...(customStages[selectedPipeline._id] || []).map((s) => ({
                  ...s,
                  isCustom: true,
                })),
              ]}
              renderItem={(stage, index) => {
                const stageId = stage._id || stage.id;
                const dateEntry = pipelineStageDates[
                  selectedPipeline._id
                ]?.find((d) => d.stageId === stageId);

                return (
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
                                updateCustomStage(
                                  selectedPipeline._id,
                                  stageId,
                                  {
                                    name: e.target.value,
                                  }
                                )
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
                        {stage.isCustom && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              removeCustomStage(selectedPipeline._id, stageId)
                            }
                          />
                        )}
                      </div>
                    }
                    style={{
                      marginBottom: 16,
                      cursor: stage.isCustom ? "move" : "default",
                    }}
                    draggable={stage.isCustom}
                    onDragStart={(e) =>
                      stage.isCustom && handleDragStart(e, stage)
                    }
                    onDragOver={handleDragOver}
                    onDrop={(e) =>
                      stage.isCustom &&
                      handleDrop(e, stage, selectedPipeline._id)
                    }
                  >
                    <Row gutter={[16, 16]} align="bottom">
                      <Col xs={24} sm={12} md={12} lg={8}>
                        <Form.Item
                          label="Start Date"
                          style={{ marginBottom: 0 }}
                        >
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
                                selectedPipeline._id,
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
                              dateEntry?.endDate
                                ? dayjs(dateEntry.endDate)
                                : null
                            }
                            onChange={(date) =>
                              handleStageDateChange(
                                selectedPipeline._id,
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
                              handleDependencyTypeChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
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
                        >
                          <Select
                            mode="multiple"
                            value={
                              stageRecruiterAssignments[selectedPipeline._id]?.[
                                stageId
                              ] || []
                            }
                            onChange={(value) =>
                              handleRecruiterAssignmentChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
                            }
                            style={{ width: "100%" }}
                            size="small"
                            placeholder="Select recruiters"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {allRecruitersForPipeline?.otherRecruiters?.map(
                              (recruiter) => (
                                <Option
                                  key={recruiter._id}
                                  value={recruiter._id}
                                >
                                  {recruiter.fullName || recruiter.email}
                                </Option>
                              )
                            )}
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
                            value={
                              stageStaffAssignments[selectedPipeline._id]?.[
                                stageId
                              ] || []
                            }
                            onChange={(value) =>
                              handleStaffAssignmentChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
                            }
                            style={{ width: "100%" }}
                            size="small"
                            placeholder="Select staff"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
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
                        >
                          <Select
                            style={{ width: "100%" }}
                            size="small"
                            allowClear
                            placeholder="Select approval level"
                            value={dateEntry?.approvalId || undefined}
                            onChange={(value) =>
                              handleLevelChange(
                                selectedPipeline._id,
                                stageId,
                                value
                              )
                            }
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
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

                    <Divider
                      orientation="left"
                      plain
                      style={{ margin: "16px 0" }}
                    >
                      Stage Requirements
                    </Divider>

                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={12}>
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          block
                          onClick={() =>
                            addStageCustomField(selectedPipeline._id, stageId)
                          }
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
                            addStageRequiredDocument(
                              selectedPipeline._id,
                              stageId
                            )
                          }
                        >
                          Add Required Document
                        </Button>
                      </Col>
                    </Row>

                    {stageCustomFields[selectedPipeline._id]?.[stageId]
                      ?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h4>Custom Fields:</h4>
                        {stageCustomFields[selectedPipeline._id][stageId].map(
                          (field) => (
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
                                      selectedPipeline._id,
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
                                        selectedPipeline._id,
                                        stageId,
                                        field.id,
                                        {
                                          label: e.target.value,
                                        }
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
                                        selectedPipeline._id,
                                        stageId,
                                        field.id,
                                        {
                                          type: value,
                                          options: [
                                            "select",
                                            "checkbox",
                                            "radio",
                                          ].includes(value)
                                            ? field.options || [""]
                                            : [],
                                        }
                                      )
                                    }
                                    style={{ width: "100%" }}
                                  >
                                    {fieldTypes.map((type) => (
                                      <Option
                                        key={type.value}
                                        value={type.value}
                                      >
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
                                    selectedPipeline._id,
                                    stageId,
                                    field.id,
                                    {
                                      required: e.target.checked,
                                    }
                                  )
                                }
                                style={{ marginTop: 8 }}
                              >
                                Required
                              </Checkbox>

                              {["select", "checkbox", "radio"].includes(
                                field.type
                              ) && (
                                <div style={{ marginTop: 12 }}>
                                  <strong>Options:</strong>
                                  {field.options?.map((option, index) => (
                                    <Space
                                      key={index}
                                      style={{
                                        display: "flex",
                                        marginBottom: 8,
                                      }}
                                      align="start"
                                    >
                                      <Input
                                        size="small"
                                        value={option}
                                        onChange={(e) =>
                                          updateFieldOption(
                                            selectedPipeline._id,
                                            stageId,
                                            field.id,
                                            index,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Option ${index + 1}`}
                                      />
                                      <Button
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                          removeFieldOption(
                                            selectedPipeline._id,
                                            stageId,
                                            field.id,
                                            index
                                          )
                                        }
                                      />
                                    </Space>
                                  ))}

                                  <Button
                                    size="small"
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                      addFieldOption(
                                        selectedPipeline._id,
                                        stageId,
                                        field.id
                                      )
                                    }
                                  >
                                    Add Option
                                  </Button>
                                </div>
                              )}
                            </Card>
                          )
                        )}
                      </div>
                    )}

                    {stageRequiredDocuments[selectedPipeline._id]?.[stageId]
                      ?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h4>Required Documents:</h4>
                        {stageRequiredDocuments[selectedPipeline._id][
                          stageId
                        ].map((doc) => (
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
                                    selectedPipeline._id,
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
                                  selectedPipeline._id,
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
                );
              }}
            />

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => addCustomStage(selectedPipeline._id)}
              style={{ marginBottom: 16 }}
            >
              Add Custom Stage
            </Button>
          </div>
        )}
      </Modal>

      {/* Offer Modal */}
      <Modal
        title={`${offerAction === "revise" ? "Revise" : "Make"} Offer for ${
          selectedCandidate?.name
        }`}
        open={offerModalVisible}
        onCancel={() => {
          setOfferModalVisible(false);
          offerForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setOfferModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmittingOffer}
            onClick={() => offerForm.submit()}
          >
            {offerAction === "revise" ? "Revise Offer" : "Send Offer"}
          </Button>,
        ]}
      >
        <Form
          form={offerForm}
          layout="vertical"
          onFinish={
            offerAction === "revise" ? handleReviseOffer : handleOfferSubmit
          }
        >
          <Form.Item
            name="description"
            label="Offer Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter offer details" />
          </Form.Item>
          <Form.Item
            label="Offer Letter"
            name="file"
            rules={
              offerAction === "new"
                ? [{ required: true, message: "Please upload offer letter" }]
                : []
            }
          >
            <Upload
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                if (!isPDF) {
                  message.error("You can only upload PDF files!");
                }
                return false;
              }}
              accept=".pdf"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Click to Upload PDF</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Additional Supporting Documents (Optional)"
            name="additionalDocuments"
            tooltip="Upload any additional supporting documents related to the offer (e.g., benefits package, company policies, etc.)"
          >
            <Upload
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                if (!isPDF) {
                  message.error("You can only upload PDF files!");
                }
                return false;
              }}
              accept=".pdf"
              multiple
            >
              <Button icon={<UploadOutlined />}>Upload Additional Documents</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Accept Offer on Behalf Modal */}
      <Modal
        title={`Accept Offer on Behalf of ${selectedCandidate?.name}`}
        open={acceptOfferModalVisible}
        onCancel={() => {
          setAcceptOfferModalVisible(false);
          acceptOfferForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setAcceptOfferModalVisible(false);
              acceptOfferForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isAcceptingOffer}
            onClick={() => acceptOfferForm.submit()}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            Accept Offer
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={acceptOfferForm}
          layout="vertical"
          onFinish={handleAcceptOfferOnBehalf}
        >
          <Form.Item
            name="description"
            label="Remarks (Optional)"
            tooltip="Add any remarks about accepting this offer on behalf of the candidate"
          >
            <TextArea
              rows={3}
              placeholder="Enter remarks (optional)"
            />
          </Form.Item>

          <Form.Item
            name="signedOffer"
            label="Signed Offer (PDF)"
            valuePropName="file"
            getValueFromEvent={(e) => e?.fileList?.[0] || null}
            rules={[
              {
                required: true,
                message: "Please upload the signed offer PDF!",
              },
            ]}
          >
            <Upload
              beforeUpload={(file) => {
                const isPdf = file.type === "application/pdf";
                if (!isPdf) {
                  message.error("You can only upload PDF files!");
                }
                return isPdf || Upload.LIST_IGNORE;
              }}
              maxCount={1}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />}>Click to Upload PDF</Button>
            </Upload>
          </Form.Item>

          {/* Signed Additional Documents */}
          {candidate?.offerDetails?.[0]?.additionalDocuments &&
            candidate.offerDetails[0].additionalDocuments.length > 0 && (
              <Form.Item
                name="signedAdditionalDocuments"
                label="Signed Additional Documents (PDF)"
                tooltip="Please upload signed copies of all additional supporting documents"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  // Handle both single file and fileList
                  if (Array.isArray(e)) {
                    return e;
                  }
                  // Return the fileList from the event
                  const fileList = e?.fileList || [];
                  console.log("📎 Upload getValueFromEvent - fileList:", fileList.length, "files");
                  return fileList;
                }}
                initialValue={[]}
              >
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.signedAdditionalDocuments !== curr.signedAdditionalDocuments}>
                  {({ getFieldValue }) => {
                    const fileList = getFieldValue("signedAdditionalDocuments") || [];
                    return (
                      <Upload
                        beforeUpload={(file) => {
                          const isPdf = file.type === "application/pdf";
                          if (!isPdf) {
                            message.error("You can only upload PDF files!");
                            return Upload.LIST_IGNORE; // Don't add non-PDF files to the list
                          }
                          // Return false to prevent auto-upload but keep file in the list
                          console.log("📎 File selected for upload:", file.name, file.type);
                          return false;
                        }}
                        multiple
                        accept=".pdf"
                        fileList={fileList}
                        onChange={(info) => {
                          console.log("📎 Upload onChange triggered:", info.fileList.length, "files");
                          acceptOfferForm.setFieldsValue({ signedAdditionalDocuments: info.fileList });
                        }}
                      >
                        <Button icon={<UploadOutlined />}>
                          Upload Signed Additional Documents
                        </Button>
                      </Upload>
                    );
                  }}
                </Form.Item>
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  {candidate.offerDetails[0].additionalDocuments.map(
                    (doc, index) => (
                      <div key={index}>
                        • {doc.documentName || doc.fileName || `Document ${index + 1}`}
                      </div>
                    )
                  )}
                </div>
              </Form.Item>
            )}
        </Form>
      </Modal>

      {/* Change Tagged Pipeline Modal */}
      <Modal
        title="Change Tagged Pipeline"
        open={changePipelineModalVisible}
        onCancel={() => {
          setChangePipelineModalVisible(false);
          setSelectedNewPipeline(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setChangePipelineModalVisible(false);
              setSelectedNewPipeline(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={buttonStyle}
            loading={isUpdatingPipeline}
            onClick={handleUpdatePipeline}
          >
            Update Pipeline
          </Button>,
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Select a new pipeline to tag for {selectedCandidate?.name}
          </Text>
        </div>

        <Form layout="vertical">
          <Form.Item label="Select Pipeline" required>
            <Select
              value={selectedNewPipeline}
              onChange={setSelectedNewPipeline}
              placeholder="Select a pipeline"
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {activePipelines
                .filter((pipeline) => pipeline.pipelineStatus === "active")
                .map((pipeline) => (
                  <Option key={pipeline._id} value={pipeline._id}>
                    <div>
                      <Text strong>{pipeline.name}</Text>
                      {pipeline.description && (
                        <>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {pipeline.description}
                          </Text>
                        </>
                      )}
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {selectedNewPipeline && (
            <Card size="small" style={{ background: "#f9f9f9" }}>
              <Text strong>Pipeline Stages:</Text>
              <List
                size="small"
                dataSource={
                  activePipelines.find((p) => p._id === selectedNewPipeline)
                    ?.stages || []
                }
                renderItem={(stage, index) => (
                  <List.Item>
                    <Text>
                      {index + 1}. {stage.name}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default CandidateModals;


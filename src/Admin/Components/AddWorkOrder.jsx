import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  message,
  Divider,
  Typography,
  Space,
  Tabs,
} from "antd";
import { SaveOutlined, FormOutlined } from "@ant-design/icons";
import {
  useCreateWorkOrderMutation,
  useGetPipelinesQuery,
  useGetRecruitersQuery,
  useGetProjectsQuery,
} from "../../Slices/Admin/AdminApis";
import { useNavigate } from "react-router-dom";
import MobileJobPreview from "./MobileJobPreview";
import JobDetailsForm from "./JobDetailsForm";
import ApplicationFormFields from "./ApplicationFormFields";

const { Title, Text } = Typography;

const AddWorkOrder = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [selectedProject, setSelectedProject] = useState(null);
  const [jobCodePrefix, setJobCodePrefix] = useState("");
  const [createWorkOrder, { isLoading }] = useCreateWorkOrderMutation();

  const {
    data: pipelines,
    isLoading: isPipelinesLoading,
    error: pipelinesError,
  } = useGetPipelinesQuery();

  const {
    data: recruiters,
    isLoading: isRecruitersLoading,
    error: recruitersError,
  } = useGetRecruitersQuery();

  const {
    data: projects,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useGetProjectsQuery();

  const activeProjects = projects?.allProjects?.filter(project => project.status === "active") || [];

  useEffect(() => {
    const formValues = form.getFieldsValue();
  }, [form]);

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    const project = projects?.allProjects?.find((p) => p._id === projectId);
    if (project) {
      const prefix = project.prefix;
      setJobCodePrefix(prefix);

      const currentJobCode = form.getFieldValue("jobCode") || "";
      const jobCodeNumber = currentJobCode.replace(/^[A-Z]*-?/, ""); 
      form.setFieldsValue({
        jobCode: `${prefix}-${jobCodeNumber}`,
        project: projectId,
      });
    }
  };

  const handleJobCodeChange = (e) => {
    const value = e.target.value;
    if (jobCodePrefix && !value.startsWith(jobCodePrefix)) {
      const numberPart = value.replace(/[^0-9]/g, "");
      if (numberPart) {
        form.setFieldsValue({
          jobCode: `${jobCodePrefix}-${numberPart}`,
        });
      }
    }
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate?.format("YYYY-MM-DD"),
        pipelineId: values.pipeline,
        projectId: values.project,
      };

      const result = await createWorkOrder(formattedValues).unwrap();

      message.success("Work order created successfully!");
      form.resetFields();
      navigate("/admin/workorder");
    } catch (error) {
      console.error("Error creating work order:", error);
      message.error(error?.data?.message || "Failed to create work order");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please check all required fields");
  };

  useEffect(() => {
    if (pipelinesError) {
      message.error("Failed to load pipelines. Please refresh the page.");
    }
    if (recruitersError) {
      message.error("Failed to load recruiters. Please refresh the page.");
    }
    if (projectsError) {
      message.error("Failed to load projects. Please refresh the page.");
    }
  }, [pipelinesError, recruitersError, projectsError]);

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <FormOutlined />
          Work Order Details
        </span>
      ),
      children: (
        <JobDetailsForm
          form={form}
          pipelines={pipelines}
          recruiters={recruiters}
           projects={{ ...projects, allProjects: activeProjects }}
          isPipelinesLoading={isPipelinesLoading}
          isRecruitersLoading={isRecruitersLoading}
          isProjectsLoading={isProjectsLoading}
          selectedProject={selectedProject}
          jobCodePrefix={jobCodePrefix}
          handleProjectChange={handleProjectChange}
          handleJobCodeChange={handleJobCodeChange}
        />
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <FormOutlined />
          Application Form
        </span>
      ),
      children: (
        <div style={{ display: "flex", gap: "24px" }}>
          {/* Left side - Form Fields */}
          <div style={{ flex: 1 }}>
            <ApplicationFormFields form={form} />
          </div>

          {/* Right side - Mobile Preview */}
          <div style={{ width: "360px", flexShrink: 0 }}>
            <Divider orientation="left">Mobile Preview</Divider>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Text strong>Mobile Application Preview</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Preview how your job posting will appear to candidates
              </Text>
            </div>

            <MobileJobPreview
              formData={form.getFieldsValue()}
              mandatoryFields={form.getFieldsValue().mandatoryFields || {}}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div >

      <Form
        form={form}
        name="addWorkOrder"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        size="large"
      >
        
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            tabBarStyle={{
              marginBottom: 24,
              borderBottom: "1px solid #f0f0f0",
            }}
          />
        

        <div style={{ textAlign: "center", paddingTop: "24px" }}>
          <Space size="large">
            <Button
              size="large"
              onClick={() => navigate("/admin/workorder")}
              disabled={isLoading}
              style={{ width: "120px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              icon={<SaveOutlined />}
              style={{ width: "180px" }}
            >
              Save Work Order
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default AddWorkOrder;

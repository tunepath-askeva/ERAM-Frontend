import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Select,
  Input,
  DatePicker,
  Button,
  Divider,
  Typography,
  Space,
  InputNumber,
  Card,
} from "antd";
import {
  FilterOutlined,
  ClearOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const AdvancedFiltersModal = ({
  visible,
  onCancel,
  onApplyFilters,
  initialFilters = {},
  filterOptions = {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with default values
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        // Basic filters (keep existing ones)
        search: initialFilters.search || "",
        skills: initialFilters.skills || [],
        location: initialFilters.location || "",
        experience: initialFilters.experience || "",
        industry: initialFilters.industry || [],

        // Personal Information filters
        nationality: initialFilters.nationality || "",
        countryOfBirth: initialFilters.countryOfBirth || "",
        maritalStatus: initialFilters.maritalStatus || "",
        gender: initialFilters.gender || "",
        bloodGroup: initialFilters.bloodGroup || "",
        religion: initialFilters.religion || "",
        minAge: initialFilters.minAge || undefined,
        maxAge: initialFilters.maxAge || undefined,

        // Address filters
        country: initialFilters.country || "",
        state: initialFilters.state || "",
        city: initialFilters.city || "",

        // Professional filters
        minCurrentSalary: initialFilters.minCurrentSalary || undefined,
        maxCurrentSalary: initialFilters.maxCurrentSalary || undefined,
        minExpectedSalary: initialFilters.minExpectedSalary || undefined,
        maxExpectedSalary: initialFilters.maxExpectedSalary || undefined,
        noticePeriod: initialFilters.noticePeriod || "any",
        agency: initialFilters.agency || "",
        candidateType: initialFilters.candidateType || "",
        accountStatus: initialFilters.accountStatus || "",

        // Visa and Documentation
        visaStatus: initialFilters.visaStatus || [],
        hasPassport: initialFilters.hasPassport || "",
        hasIqama: initialFilters.hasIqama || "",

        // Experience and Education
        minExperience: initialFilters.minExperience || undefined,
        maxExperience: initialFilters.maxExperience || undefined,

        hasCertificates: initialFilters.hasCertificates || "",

        // Profile completion and activity

        lastUpdated: initialFilters.lastUpdated || "any_time",
        hasResume: initialFilters.hasResume || "",

        // Contact information
        languages: initialFilters.languages || [],
      });
    }
  }, [visible, initialFilters, form]);

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Clean up empty values and format the filters
      const cleanedFilters = Object.entries(values).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            if (Array.isArray(value) && value.length > 0) {
              acc[key] = value;
            } else if (!Array.isArray(value)) {
              acc[key] = value;
            }
          }
          return acc;
        },
        {}
      );

      // Format date ranges and special filters
      if (
        cleanedFilters.lastUpdated &&
        cleanedFilters.lastUpdated !== "any_time"
      ) {
        const now = dayjs();
        switch (cleanedFilters.lastUpdated) {
          case "last_week":
            cleanedFilters.updatedAfter = now.subtract(7, "days").toISOString();
            break;
          case "last_month":
            cleanedFilters.updatedAfter = now
              .subtract(1, "month")
              .toISOString();
            break;
          case "last_3_months":
            cleanedFilters.updatedAfter = now
              .subtract(3, "months")
              .toISOString();
            break;
          case "last_6_months":
            cleanedFilters.updatedAfter = now
              .subtract(6, "months")
              .toISOString();
            break;
        }
        delete cleanedFilters.lastUpdated;
      }

      await onApplyFilters(cleanedFilters);
      onCancel();
    } catch (error) {
      console.error("Filter validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    // Set default values for notice period and last updated
    form.setFieldsValue({
      noticePeriod: "any",
      lastUpdated: "any_time",
    });
  };

  const noticePeriodOptions = [
    { value: "any", label: "Any Notice Period" },
    { value: "immediate", label: "Immediate" },
    { value: "15 days", label: "15 Days" },
    { value: "1 month", label: "1 Month" },
    { value: "2 months", label: "2 Months" },
    { value: "3 months", label: "3+ Months" },
  ];

  const lastUpdatedOptions = [
    { value: "any_time", label: "Any Time" },
    { value: "last_week", label: "Last Week" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "last_6_months", label: "Last 6 Months" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const maritalStatusOptions = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];

  const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  const candidateTypeOptions = [
    { value: "General", label: "General" },
    { value: "Own", label: "Own" },
    { value: "SponserTransfer", label: "SponserTransfer" },
    { value: "Khafalath", label: "Khafalath" },
    { value: "External", label: "External" },
    { value: "Others", label: "Others" },
  ];

  const accountStatusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const booleanOptions = [
    { value: "", label: "Any" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Modal
      title={
        <Space>
          <FilterOutlined />
          <span>Filters</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="reset" icon={<ClearOutlined />} onClick={handleReset}>
          Reset All
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="apply"
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleApplyFilters}
          loading={loading}
          style={{
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          Apply Filters
        </Button>,
      ]}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <Form form={form} layout="vertical" size="small">
        {/* Basic Search and Skills */}
        <Card title="Basic Filters" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Location" name="location">
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Skills" name="skills">
                <Select
                  mode="tags"
                  placeholder="Select or type skills"
                  options={filterOptions.skills?.map((skill) => ({
                    value: skill,
                    label: skill,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Industry" name="industry">
                <Select
                  mode="tags"
                  placeholder="Select industries"
                  options={filterOptions.industries?.map((industry) => ({
                    value: industry,
                    label: industry,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Personal Information */}
        <Card
          title="Personal Information"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select gender" options={genderOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Marital Status" name="maritalStatus">
                <Select
                  placeholder="Select marital status"
                  options={maritalStatusOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Blood Group" name="bloodGroup">
                <Select
                  placeholder="Select blood group"
                  options={bloodGroupOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Nationality" name="nationality">
                <Input placeholder="Enter nationality" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Country of Birth" name="countryOfBirth">
                <Input placeholder="Enter country of birth" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Religion" name="religion">
                <Input placeholder="Enter religion" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Min Age" name="minAge">
                <InputNumber
                  placeholder="Minimum age"
                  style={{ width: "100%" }}
                  min={18}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Max Age" name="maxAge">
                <InputNumber
                  placeholder="Maximum age"
                  style={{ width: "100%" }}
                  min={18}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24}>
              <Form.Item label="Languages" name="languages">
                <Select mode="tags" placeholder="Select or type languages" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Address Information */}
        <Card
          title="Address Information"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Country" name="country">
                <Input placeholder="Enter country" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="State/Province" name="state">
                <Input placeholder="Enter state/province" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="City" name="city">
                <Input placeholder="Enter city" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Professional Information */}
        <Card
          title="Professional Information"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Min Experience (Years)" name="minExperience">
                <InputNumber
                  placeholder="Minimum years"
                  style={{ width: "100%" }}
                  min={0}
                  max={50}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Max Experience (Years)" name="maxExperience">
                <InputNumber
                  placeholder="Maximum years"
                  style={{ width: "100%" }}
                  min={0}
                  max={50}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Notice Period" name="noticePeriod">
                <Select options={noticePeriodOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Agency" name="agency">
                <Input placeholder="Enter agency name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Min Current Salary" name="minCurrentSalary">
                <InputNumber
                  placeholder="Minimum salary"
                  style={{ width: "100%" }}
                  min={0}
                  type="number"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value.replace(/\SAR\s?-\s?|\s?SAR\s?|(,*)/g, "")
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Max Current Salary" name="maxCurrentSalary">
                <InputNumber
                  placeholder="Maximum salary"
                  style={{ width: "100%" }}
                  min={0}
                  type="number"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value.replace(/\SAR\s?-\s?|\s?SAR\s?|(,*)/g, "")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Min Expected Salary" name="minExpectedSalary">
                <InputNumber
                  placeholder="Minimum salary"
                  style={{ width: "100%" }}
                  min={0}
                  type="number"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value.replace(/\SAR\s?-\s?|\s?SAR\s?|(,*)/g, "")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Max Expected Salary" name="maxExpectedSalary">
                <InputNumber
                  placeholder="Maximum salary"
                  style={{ width: "100%" }}
                  min={0}
                  type="number"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value.replace(/\SAR\s?-\s?|\s?SAR\s?|(,*)/g, "")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Candidate Type" name="candidateType">
                <Select
                  placeholder="Select candidate type"
                  options={candidateTypeOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Account Status" name="accountStatus">
                <Select
                  placeholder="Select account status"
                  options={accountStatusOptions}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Documentation and Visa */}
        <Card
          title="Documentation & Visa Status"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Visa Status" name="visaStatus">
                <Select
                  mode="tags"
                  placeholder="Select or type visa status"
                  options={filterOptions.visaStatus?.map((visa) => ({
                    value: visa,
                    label: visa,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Has Passport" name="hasPassport">
                <Select placeholder="Select option" options={booleanOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Has Iqama" name="hasIqama">
                <Select placeholder="Select option" options={booleanOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Profile Completion and Activity */}
        <Card
          title="Profile Status & Activity"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Last Updated" name="lastUpdated">
                <Select options={lastUpdatedOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Has Resume" name="hasResume">
                <Select placeholder="Select option" options={booleanOptions} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item label="Has Certificates" name="hasCertificates">
                <Select placeholder="Select option" options={booleanOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default AdvancedFiltersModal;

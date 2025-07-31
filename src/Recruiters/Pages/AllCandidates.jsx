import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Typography,
  Input,
  Select,
  Space,
  Button,
  Badge,
  Tooltip,
  Empty,
  Spin,
  Table,
  Pagination,
  message,
  Form,
  Modal,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkedinOutlined,
DownloadOutlined ,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  useGetAllBranchedCandidateQuery,
  useUpdateBranchedCandidateMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateDetailsDrawer from "./CandidateDetailsDrawer";
import CandidateEditModal from "./CandidateEditModal";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function AllCandidates() {
  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [addCandidateModalVisible, setAddCandidateModalVisible] =
    useState(false);
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [addCandidateForm] = Form.useForm();

  const debouncedSearchTerm = useDebounce(searchTerm, 700);

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }

    if (selectedSkills.length > 0) {
      params.skills = selectedSkills.join(",");
    }

    if (selectedLocation) {
      params.location = selectedLocation;
    }

    if (selectedExperience) {
      params.experience = selectedExperience;
    }

    if (selectedIndustry) {
      params.industry = selectedIndustry;
    }

    return params;
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedSkills,
    selectedLocation,
    selectedExperience,
    selectedIndustry,
  ]);

  const {
    data: candidatesResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllBranchedCandidateQuery(queryParams);

  const [updateCandidate, { isLoading: isUpdating }] =
    useUpdateBranchedCandidateMutation();

  const candidates = candidatesResponse?.users || [];
  const totalCandidates = candidatesResponse?.total || 0;
  const filterOptions = candidatesResponse?.filterOptions || {
    skills: [],
    locations: [],
    industries: [],
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearchTerm,
    selectedSkills,
    selectedLocation,
    selectedExperience,
    selectedIndustry,
  ]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSkills([]);
    setSelectedLocation("");
    setSelectedExperience("");
    setSelectedIndustry("");
    setCurrentPage(1);
  }, []);

  const showCandidateDetails = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setDrawerVisible(true);
  }, []);

  const handleEditCandidate = useCallback((candidate) => {
    setCandidateToEdit(candidate);
    setEditModalVisible(true);
  }, []);

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      await updateCandidate({
        id: candidateToEdit._id,
        ...updatedData,
      }).unwrap();
      message.success("Candidate updated successfully");
      setEditModalVisible(false);
      setCandidateToEdit(null);
      refetch();
    } catch (error) {
      message.error("Failed to update candidate");
      console.error("Update error:", error);
    }
  };

  const handlePageChange = useCallback(
    (page, size) => {
      setCurrentPage(page);
      if (size !== pageSize) {
        setPageSize(size);
        setCurrentPage(1);
      }
    },
    [pageSize]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.image} icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <Text type="secondary">{record.title || "No title"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary">{record.phone || "No phone"}</Text>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      render: (text) => text || "Not specified",
    },
    {
      title: "Experience",
      dataIndex: "totalExperienceYears",
      render: (text) => (text ? `${text} years` : "Not specified"),
    },
    {
      title: "Skills",
      dataIndex: "skills",
      render: (skills) => (
        <div style={{ maxWidth: 200 }}>
          {skills && skills.length > 0 ? (
            <Space wrap size={[4, 4]}>
              {skills.slice(0, 3).map((skill) => (
                <Tag
                  key={skill}
                  color="blue"
                  style={{ fontSize: 10, margin: 0 }}
                >
                  {skill.length > 10 ? `${skill.substring(0, 10)}...` : skill}
                </Tag>
              ))}
              {skills.length > 3 && (
                <Tag style={{ fontSize: 10, margin: 0 }}>
                  +{skills.length - 3}
                </Tag>
              )}
            </Space>
          ) : (
            <Text type="secondary">No skills</Text>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "accountStatus",
      render: (status, record) => (
        <Space>
          <Badge status={status === "active" ? "success" : "error"} />
          <Tag color={record.candidateType === "Khafalath" ? "gold" : "green"}>
            {record.candidateType}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showCandidateDetails(record)}
          />
          {hasPermission("edit-candidate-details") && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditCandidate(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  if (isLoading && currentPage === 1) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading candidates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4} type="danger">
          Error loading candidates
        </Title>
        <Text>Please try again later.</Text>
        <Button onClick={refetch} style={{ marginLeft: 8 }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Title
              level={2}
              style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}
            >
              All Candidates
            </Title>
            <Text type="secondary">
              Manage and track your candidates in branch
            </Text>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Space
              size="small"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              {hasPermission("bulk-upload") && (
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  onClick={() => setBulkUploadModalVisible(true)}
                >
                  Bulk Upload
                </Button>
              )}
              {hasPermission("add-candidate") && (
                <Button
                  style={buttonStyle}
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => setAddCandidateModalVisible(true)}
                >
                  Add Candidate
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search candidates, skills, email, title..."
              value={searchTerm}
              onChange={handleSearchChange}
              prefix={<SearchOutlined />}
              allowClear
              loading={isLoading && searchTerm !== debouncedSearchTerm}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              mode="multiple"
              placeholder="Select skills"
              value={selectedSkills}
              onChange={setSelectedSkills}
              style={{ width: "100%" }}
              maxTagCount={2}
              loading={isLoading}
            >
              {filterOptions.skills.map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select location"
              value={selectedLocation}
              onChange={setSelectedLocation}
              style={{ width: "100%" }}
              allowClear
              loading={isLoading}
            >
              {filterOptions.locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Experience"
              value={selectedExperience}
              onChange={setSelectedExperience}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="0-1">0-1 years</Option>
              <Option value="1-2">1-2 years</Option>
              <Option value="2-5">2-5 years</Option>
              <Option value="5+">5+ years</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Industry"
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              style={{ width: "100%" }}
              allowClear
              loading={isLoading}
            >
              {filterOptions.industries.map((industry) => (
                <Option key={industry} value={industry}>
                  {industry}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button onClick={clearFilters} icon={<FilterOutlined />}>
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {candidates.length === 0 && !isLoading ? (
        <Empty
          description={
            debouncedSearchTerm ||
            selectedSkills.length > 0 ||
            selectedLocation ||
            selectedExperience ||
            selectedIndustry
              ? "No candidates found matching your criteria"
              : "No candidates found"
          }
          style={{ marginTop: "50px" }}
        />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={candidates}
            rowKey="_id"
            pagination={false}
            scroll={{ x: true }}
            bordered
            loading={isLoading}
          />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCandidates}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} candidates`
              }
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        </>
      )}

      <CandidateDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        candidate={selectedCandidate}
      />

      <CandidateEditModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCandidateToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        candidate={candidateToEdit}
      />

      {/* Add Candidate Modal */}
      <Modal
        title="Add New Candidate"
        open={addCandidateModalVisible}
        onCancel={() => {
          setAddCandidateModalVisible(false);
          addCandidateForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={addCandidateForm}
          layout="vertical"
          initialValues={{
            status: "new",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter candidate's name" },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter phone number",
                  },
                  {
                    pattern: /^[0-9+\- ]+$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Position"
                name="position"
                rules={[
                  {
                    required: true,
                    message: "Please select a position",
                  },
                ]}
              >
                <Select placeholder="Select position">
                  <Option value="frontend">Frontend Developer</Option>
                  <Option value="backend">Backend Developer</Option>
                  <Option value="fullstack">Full Stack Developer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={4} placeholder="Add any additional notes" />
          </Form.Item>

          <Form.Item
            label="Resume"
            name="resume"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload.Dragger
              name="resume"
              multiple={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                const isDOC =
                  file.type === "application/msword" ||
                  file.type ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

                if (!isPDF && !isDOC) {
                  message.error("You can only upload PDF/DOC files!");
                  return Upload.LIST_IGNORE;
                }

                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("File must smaller than 2MB!");
                  return Upload.LIST_IGNORE;
                }

                return isPDF || isDOC;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single PDF or DOC file upload (max 2MB)
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => {
                  setAddCandidateModalVisible(false);
                  addCandidateForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                style={buttonStyle}
                onClick={() => {
                  addCandidateForm
                    .validateFields()
                    .then((values) => {
                      // Handle form submission
                      message.success("Candidate added successfully!");
                      setAddCandidateModalVisible(false);
                      addCandidateForm.resetFields();
                      refetch(); // Refresh the candidate list
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
              >
                Add Candidate
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Candidates"
        open={bulkUploadModalVisible}
        onCancel={() => setBulkUploadModalVisible(false)}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <div style={{ marginBottom: 24 }}>
          <Text>
            Upload an Excel file with candidate details. Download our template
            file to ensure proper formatting.
          </Text>
        </div>

        <Dragger
          name="file"
          multiple={false}
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          accept=".xlsx,.xls"
          beforeUpload={(file) => {
            const isExcel =
              file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
              file.type === "application/vnd.ms-excel";

            if (!isExcel) {
              message.error("You can only upload Excel files!");
              return Upload.LIST_IGNORE;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error("File must smaller than 5MB!");
              return Upload.LIST_IGNORE;
            }

            return isExcel;
          }}
          onChange={(info) => {
            const { status } = info.file;
            if (status === "done") {
              message.success(`${info.file.name} file uploaded successfully.`);
              setBulkUploadModalVisible(false);
              refetch(); // Refresh the candidate list
            } else if (status === "error") {
              message.error(`${info.file.name} file upload failed.`);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single Excel file upload (max 5MB)
          </p>
        </Dragger>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => {
              // Handle template download
              message.info("Downloading template file...");
            }}
          >
            Download Template File
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AllCandidates;

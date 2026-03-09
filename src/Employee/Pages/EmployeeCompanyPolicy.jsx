import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Layout,
  Result,
  Timeline,
  Affix,
  Anchor,
  BackTop,
  Tooltip,
  notification,
  Breadcrumb,
  Table,
  Input,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  GlobalOutlined,
  HomeOutlined,
  LaptopOutlined,
  SyncOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ScheduleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useGetEmployeePoliciesQuery } from "../../Slices/Employee/EmployeeApis";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { Search } = Input;

const EmployeeCompanyPolicy = () => {
  const { data, isLoading } = useGetEmployeePoliciesQuery();

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const policiesData = data;

  React.useEffect(() => {
    if (searchText) {
      const filtered = policiesData.filter(
        (policy) =>
          policy.title.toLowerCase().includes(searchText.toLowerCase()) ||
          policy.content.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(policiesData);
    }
  }, [searchText, policiesData]);

  const getPolicyIcon = (section) => {
    const icons = {
      introduction: UserOutlined,
      "code of conduct": SafetyOutlined,
      attendance: ClockCircleOutlined,
      "leave policy": ScheduleOutlined,
      "dress code": TeamOutlined,
      confidentiality: SafetyOutlined,
      internet: GlobalOutlined,
      harassment: ExclamationCircleOutlined,
      health: SafetyOutlined,
      disciplinary: ExclamationCircleOutlined,
      "remote work": HomeOutlined,
      "company property": LaptopOutlined,
      "policy updates": SyncOutlined,
    };

    const sectionLower = section.toLowerCase();
    for (const [key, Icon] of Object.entries(icons)) {
      if (sectionLower.includes(key)) return Icon;
    }
    return FileTextOutlined;
  };

  const parsePolicyContent = (content) => {
    const sections = content.split(/\n(?=\d+\.)/);
    return sections.map((section, index) => {
      const lines = section.trim().split("\n");
      const title = lines[0];
      const body = lines.slice(1).join("\n").trim();
      return {
        title,
        body,
        id: `section-${index}`,
        anchor: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      };
    });
  };

  const columns = [
    {
      title: "Policy Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <Space>
          <FileTextOutlined style={{ color: "#da2c46" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      defaultSortOrder: "descend",
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => (
        record.fileUrl ? (
          <Tag color="green" icon={<FileTextOutlined />}>
            File Available
          </Tag>
        ) : record.content ? (
          <Tag color="blue" icon={<FileTextOutlined />}>
            Text Content
          </Tag>
        ) : (
          <Tag color="default">No Content</Tag>
        )
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          {record.fileUrl && (
            <Tooltip title="Download Policy File">
              <Button
                type="default"
                icon={<DownloadOutlined />}
                size="small"
                onClick={() => {
                  window.open(record.fileUrl, "_blank");
                }}
              >
                Download
              </Button>
            </Tooltip>
          )}
          <Tooltip title="View Policy">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              style={{ backgroundColor: "#da2c46" }}
              onClick={() => {
                setSelectedPolicy(record);
                setViewMode("detail");
              }}
            >
              View
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!policiesData || policiesData.length === 0) {
    return (
      <Layout >
        <Content
          style={{
            padding: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <Result
            status="404"
            title="No Policies Available"
            subTitle="Company policies will appear here when available."
          />
        </Content>
      </Layout>
    );
  }

  if (viewMode === "detail" && selectedPolicy) {
    const sections = selectedPolicy.content 
      ? parsePolicyContent(selectedPolicy.content) 
      : [];

    return (
      <Layout style={{ minHeight: "100vh" }}>
        <div
          style={{
            background: "#fff",
            padding: "16px 50px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size={0}>
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <Button
                      type="link"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => setViewMode("list")}
                      style={{ padding: 0, color: "#da2c46" }}
                    >
                      Back to Policies
                    </Button>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>{selectedPolicy.title}</Breadcrumb.Item>
                </Breadcrumb>
                <Space align="center">
                  <Title level={2} style={{ margin: 0 }}>
                    {selectedPolicy.title}
                  </Title>
                  <Tag
                    color={
                      selectedPolicy.status === "active" ? "green" : "default"
                    }
                  >
                    {selectedPolicy.status.toUpperCase()}
                  </Tag>
                </Space>
                <Text type="secondary">
                  Last updated:{" "}
                  {new Date(selectedPolicy.updatedAt).toLocaleDateString()}
                </Text>
              </Space>
            </Col>
            {selectedPolicy.fileUrl && (
              <Col>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(selectedPolicy.fileUrl, "_blank")}
                  style={{ backgroundColor: "#da2c46" }}
                >
                  Download Policy File
                </Button>
              </Col>
            )}
          </Row>
        </div>

        <Content style={{ padding: "0 50px 50px", background: "#fff" }}>
          <Row gutter={[24, 24]}>
            {selectedPolicy.content && sections.length > 0 && (
              <Col xs={24} lg={6}>
                <Affix offsetTop={20}>
                  <Card
                    title="Navigation"
                    size="small"
                    style={{ marginBottom: 24 }}
                  >
                    <Anchor
                      affix={false}
                      offsetTop={80}
                      items={sections.map((section) => ({
                        key: section.anchor,
                        href: `#${section.anchor}`,
                        title: section.title,
                      }))}
                    />
                  </Card>
                </Affix>
              </Col>
            )}

            <Col xs={24} lg={selectedPolicy.content && sections.length > 0 ? 18 : 24}>
              <Card>
                <div style={{ marginBottom: 32 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <CalendarOutlined
                          style={{
                            fontSize: 24,
                            color: "#da2c46",
                            marginBottom: 8,
                          }}
                        />
                        <div>
                          <Text strong>Effective Date</Text>
                          <br />
                          <Text type="secondary">
                            {new Date(
                              selectedPolicy.createdAt
                            ).toLocaleDateString()}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <SyncOutlined
                          style={{
                            fontSize: 24,
                            color: "#da2c46",
                            marginBottom: 8,
                          }}
                        />
                        <div>
                          <Text strong>Last Updated</Text>
                          <br />
                          <Text type="secondary">
                            {new Date(
                              selectedPolicy.updatedAt
                            ).toLocaleDateString()}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: "center" }}>
                        <EyeOutlined
                          style={{
                            fontSize: 24,
                            color: "#da2c46",
                            marginBottom: 8,
                          }}
                        />
                        <div>
                          <Text strong>Status</Text>
                          <br />
                          <Tag
                            color={
                              selectedPolicy.status === "active"
                                ? "green"
                                : "default"
                            }
                          >
                            {selectedPolicy.status.toUpperCase()}
                          </Tag>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {selectedPolicy.fileUrl ? (
                  <div>
                    <div style={{ marginBottom: 16, textAlign: "right" }}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(selectedPolicy.fileUrl, "_blank")}
                        style={{ backgroundColor: "#da2c46" }}
                      >
                        Download File
                      </Button>
                    </div>
                    <div
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "8px",
                        height: "70vh",
                        position: "relative",
                        overflow: "hidden",
                        marginBottom: 32,
                      }}
                    >
                      {selectedPolicy.fileUrl.endsWith(".pdf") ? (
                        <embed
                          src={`${selectedPolicy.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                          type="application/pdf"
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                          }}
                        />
                      ) : selectedPolicy.fileUrl.match(/\.(doc|docx)$/i) ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            padding: "40px",
                            textAlign: "center",
                          }}
                        >
                          <FileTextOutlined
                            style={{ fontSize: "64px", color: "#1890ff", marginBottom: "16px" }}
                          />
                          <Text strong style={{ fontSize: "16px", marginBottom: "8px" }}>
                            Word Document
                          </Text>
                          <Text type="secondary" style={{ marginBottom: "16px" }}>
                            Click the download button above to view this document
                          </Text>
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(selectedPolicy.fileUrl, "_blank")}
                            style={{ backgroundColor: "#da2c46" }}
                          >
                            Open in New Tab
                          </Button>
                        </div>
                      ) : (
                        <iframe
                          src={selectedPolicy.fileUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                          }}
                          title="Policy Document"
                        />
                      )}
                    </div>
                  </div>
                ) : selectedPolicy.content && sections.length > 0 ? (
                  sections.map((section, index) => {
                  const IconComponent = getPolicyIcon(section.title);
                  return (
                    <div
                      key={index}
                      id={section.anchor}
                      style={{ marginBottom: 40 }}
                    >
                      <Title
                        level={3}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <IconComponent
                          style={{ marginRight: 12, color: "#da2c46" }}
                        />
                        {section.title}
                      </Title>

                      <div style={{ paddingLeft: 36 }}>
                        {section.body.split("\n").map((paragraph, pIndex) => {
                          if (paragraph.trim().startsWith("-")) {
                            return (
                              <div key={pIndex} style={{ marginBottom: 8 }}>
                                <Text>
                                  • {paragraph.trim().substring(1).trim()}
                                </Text>
                              </div>
                            );
                          } else if (paragraph.trim()) {
                            return (
                              <Paragraph
                                key={pIndex}
                                style={{ marginBottom: 16 }}
                              >
                                {paragraph.trim()}
                              </Paragraph>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {index < sections.length - 1 && <Divider />}
                    </div>
                  );
                })
                ) : (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Text type="secondary">No file or content available for this policy.</Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Content>

        <BackTop />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          padding: "24px 50px",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
              <FileTextOutlined style={{ marginRight: 12 }} />
              Company Policies
            </Title>
            <Text type="secondary">Review company policies and procedures</Text>
          </Col>
          <Col>
            <Space align="center">
              <Space direction="vertical" size={0} align="center">
                <Text strong style={{ fontSize: "20px" }}>
                  {policiesData.length}
                </Text>
                <Text type="secondary">
                  {policiesData.length === 1 ? "Policy" : "Policies"}
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      <Content style={{ padding: "24px 50px 50px", background: "#fff" }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col flex="auto">
                <Search
                  placeholder="Search policies by title or content..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={setSearchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{
              total: filteredData?.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} policies`,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            scroll={{ x: 1200 }}
            bordered
            size="middle"
          />
        </Card>
      </Content>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </Layout>
  );
};

export default EmployeeCompanyPolicy;

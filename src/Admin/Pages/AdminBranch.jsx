import React, { useState } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Avatar,
  Divider,
  Row,
  Col,
  Badge,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useGetAdminBranchQuery, useUpdateAdminBranchAboutUsMutation } from "../../Slices/Admin/AdminApis.js";
import SkeletonLoader from "../../Global/SkeletonLoader.jsx";
import { useSnackbar } from "notistack";

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminBranch = () => {
  const { data, isLoading, refetch } = useGetAdminBranchQuery();
  const [updateAboutUs, { isLoading: isUpdating }] = useUpdateAdminBranchAboutUsMutation();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  const branch = data?.branch;

  if (!branch) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          "@media (min-width: 576px)": {
            padding: "24px",
          },
          "@media (min-width: 768px)": {
            padding: "32px",
          },
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            "@media (min-width: 768px)": {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Text type="secondary">No branch data available</Text>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditAboutUs = () => {
    form.setFieldsValue({
      aboutUs: branch.aboutUs || "",
    });
    setIsEditModalVisible(true);
  };

  const handleSaveAboutUs = async (values) => {
    try {
      await updateAboutUs(values.aboutUs).unwrap();
      message.success("About Us updated successfully!");
      enqueueSnackbar("About Us updated successfully!", {
        variant: "success",
      });
      setIsEditModalVisible(false);
      refetch();
    } catch (error) {
      console.error("Error updating About Us:", error);
      message.error(
        error?.data?.message || "Failed to update About Us. Please try again."
      );
      enqueueSnackbar(
        error?.data?.message || "Failed to update About Us. Please try again.",
        { variant: "error" }
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  return (
    <div
      style={{
        padding: "16px",
        minHeight: "100vh",
        "@media (min-width: 576px)": {
          padding: "24px",
        },
        "@media (min-width: 768px)": {
          padding: "32px",
        },
      }}
    >
      {/* Header Section */}
      <div className="branch-header" style={{ marginBottom: "16px" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            "@media (min-width: 768px)": {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0,
                flex: 1,
              }}
            >
              <Avatar
                size={32}
                icon={<BankOutlined />}
                style={{
                  color: "#2c3e50",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: "#2c3e50",
                    fontSize: "16px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    "@media (min-width: 576px)": {
                      fontSize: "18px",
                    },
                    "@media (min-width: 768px)": {
                      fontSize: "20px",
                    },
                  }}
                >
                  Admin Assigned To -
                  <span style={{ color: "rgb(218, 44, 70)" }}>
                    {" "}
                    {branch.name}
                  </span>
                </Title>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Space wrap style={{ marginTop: "4px" }}>
                  <Tag
                    color="blue"
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      "@media (min-width: 576px)": {
                        fontSize: "12px",
                        padding: "2px 8px",
                      },
                    }}
                  >
                    {branch.branchCode}
                  </Tag>
                  <Badge
                    status={branch.isActive ? "success" : "error"}
                    text={branch.isActive ? "Active" : "Inactive"}
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      "@media (min-width: 576px)": {
                        fontSize: "12px",
                      },
                    }}
                  />
                </Space>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Section */}
      <Row
        gutter={[
          { xs: 12, sm: 16, md: 16, lg: 20, xl: 24 },
          { xs: 12, sm: 16, md: 16, lg: 20, xl: 24 },
        ]}
      >
        {/* Branch Information - Stack Format */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BankOutlined style={{ color: "rgb(218, 44, 70)" }} />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    "@media (min-width: 576px)": {
                      fontSize: "16px",
                    },
                  }}
                >
                  Branch Information
                </span>
              </Space>
            }
            style={{
              borderRadius: "12px",
              height: "100%",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              "@media (min-width: 768px)": {
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              },
            }}
            headStyle={{
              borderBottom: "1px solid #f0f0f0",
              fontSize: "14px",
              fontWeight: 600,
              "@media (min-width: 576px)": {
                fontSize: "16px",
              },
            }}
            bodyStyle={{
              padding: "16px",
              "@media (min-width: 576px)": {
                padding: "20px",
              },
              "@media (min-width: 768px)": {
                padding: "24px",
              },
            }}
          >
            {/* Stack Format - Clean Layout */}
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* Branch Name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <BankOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Branch Name
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#262626",
                    "@media (min-width: 576px)": {
                      fontSize: "16px",
                    },
                  }}
                >
                  {branch.name}
                </Text>
              </div>

              {/* Branch Code */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Code
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <Tag
                  color="geekblue"
                  style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    margin: 0,
                    "@media (min-width: 576px)": {
                      fontSize: "14px",
                      padding: "4px 12px",
                    },
                  }}
                >
                  {branch.branchCode}
                </Tag>
              </div>

              {/* Address */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <EnvironmentOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Address
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <div
                  style={{
                    lineHeight: "1.6",
                    fontSize: "12px",
                    color: "#262626",
                    flex: 1,
                    minWidth: "200px",
                    "@media (min-width: 576px)": {
                      fontSize: "14px",
                    },
                  }}
                >
                  <div>{branch.location.street}</div>
                  <div>
                    {branch.location.city}, {branch.location.state}
                  </div>
                  <div>
                    {branch.location.country} - {branch.location.postalCode}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <PhoneOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Phone
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <a
                  href={`tel:${branch.location.branch_phoneno}`}
                  style={{
                    color: "rgb(218, 44, 70)",
                    fontSize: "12px",
                    textDecoration: "none",
                    "@media (min-width: 576px)": {
                      fontSize: "14px",
                    },
                  }}
                >
                  {branch.location.branch_phoneno}
                </a>
              </div>

              {/* Email */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <MailOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Email
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <a
                  href={`mailto:${branch.location.branch_email}`}
                  style={{
                    color: "rgb(218, 44, 70)",
                    fontSize: "12px",
                    wordBreak: "break-all",
                    textDecoration: "none",
                    "@media (min-width: 576px)": {
                      fontSize: "14px",
                    },
                  }}
                >
                  {branch.location.branch_email}
                </a>
              </div>

              {/* Description */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <FileTextOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Description
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#262626",
                    lineHeight: "1.6",
                    flex: 1,
                    minWidth: "200px",
                    "@media (min-width: 576px)": {
                      fontSize: "14px",
                    },
                  }}
                >
                  {branch.description}
                </Text>
              </div>

              {/* About Us */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    minWidth: "fit-content",
                  }}
                >
                  <InfoCircleOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "14px" }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    About Us
                  </Text>
                </div>
                <span style={{ color: "#d9d9d9", fontSize: "14px" }}>-</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    flex: 1,
                    minWidth: "200px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#262626",
                      lineHeight: "1.6",
                      flex: 1,
                      whiteSpace: "pre-wrap",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    {branch.aboutUs || (
                      <span style={{ fontStyle: "italic", color: "#8c8c8c" }}>
                        No About Us content set. Click Edit to add.
                      </span>
                    )}
                  </Text>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={handleEditAboutUs}
                    style={{
                      padding: "0 4px",
                      height: "auto",
                      color: "rgb(218, 44, 70)",
                      flexShrink: 0,
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Status & Timeline */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Status Card */}
            <Card
              title={
                <Space>
                  <CheckCircleOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      "@media (min-width: 576px)": {
                        fontSize: "16px",
                      },
                    }}
                  >
                    Status
                  </span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                "@media (min-width: 768px)": {
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                },
              }}
              headStyle={{
                borderBottom: "1px solid #f0f0f0",
                fontSize: "14px",
                fontWeight: 600,
                "@media (min-width: 576px)": {
                  fontSize: "16px",
                },
              }}
              bodyStyle={{
                padding: "12px",
                "@media (min-width: 576px)": {
                  padding: "16px",
                },
              }}
              size="small"
            >
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <Badge
                  status={branch.isActive ? "success" : "error"}
                  style={{ fontSize: "14px" }}
                />
                <Title
                  level={4}
                  style={{
                    margin: "8px 0 0 0",
                    color: branch.isActive ? "#52c41a" : "#ff4d4f",
                    fontSize: "14px",
                    "@media (min-width: 576px)": {
                      fontSize: "16px",
                    },
                  }}
                >
                  {branch.isActive ? "Active" : "Inactive"}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "11px",
                    "@media (min-width: 576px)": {
                      fontSize: "12px",
                    },
                  }}
                >
                  Branch Status
                </Text>
              </div>
            </Card>

            {/* Timeline Card */}
            <Card
              title={
                <Space>
                  <CalendarOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      "@media (min-width: 576px)": {
                        fontSize: "16px",
                      },
                    }}
                  >
                    Timeline
                  </span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                "@media (min-width: 768px)": {
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                },
              }}
              headStyle={{
                borderBottom: "1px solid #f0f0f0",
                fontSize: "14px",
                fontWeight: 600,
                "@media (min-width: 576px)": {
                  fontSize: "16px",
                },
              }}
              bodyStyle={{
                padding: "12px",
                "@media (min-width: 576px)": {
                  padding: "16px",
                },
              }}
              size="small"
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "11px",
                      "@media (min-width: 576px)": {
                        fontSize: "12px",
                      },
                    }}
                  >
                    Created:
                  </Text>
                  <br />
                  <Text
                    style={{
                      fontSize: "12px",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    {formatDate(branch.createdAt)}
                  </Text>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Text
                    strong
                    style={{
                      color: "#595959",
                      fontSize: "11px",
                      "@media (min-width: 576px)": {
                        fontSize: "12px",
                      },
                    }}
                  >
                    Last Updated:
                  </Text>
                  <br />
                  <Text
                    style={{
                      fontSize: "12px",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    {formatDate(branch.updatedAt)}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Services Card */}
            <Card
              title={
                <Space>
                  <SettingOutlined
                    style={{ color: "rgb(218, 44, 70)", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      "@media (min-width: 576px)": {
                        fontSize: "16px",
                      },
                    }}
                  >
                    Services
                  </span>
                </Space>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                "@media (min-width: 768px)": {
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                },
              }}
              headStyle={{
                borderBottom: "1px solid #f0f0f0",
                fontSize: "14px",
                fontWeight: 600,
                "@media (min-width: 576px)": {
                  fontSize: "16px",
                },
              }}
              bodyStyle={{
                padding: "12px",
                "@media (min-width: 576px)": {
                  padding: "16px",
                },
              }}
              size="small"
            >
              {branch.services && branch.services.length > 0 ? (
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  <Space wrap>
                    {branch.services.map((service, index) => (
                      <Tag
                        key={index}
                        color="purple"
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          marginBottom: 4,
                          borderRadius: 6,
                          display: "inline-block",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          "@media (min-width: 576px)": {
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: 8,
                          },
                        }}
                      >
                        {service}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ) : (
                <Text
                  type="secondary"
                  style={{
                    fontStyle: "italic",
                    fontSize: "11px",
                    "@media (min-width: 576px)": {
                      fontSize: "12px",
                    },
                  }}
                >
                  No services configured
                </Text>
              )}
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Edit About Us Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Edit About Us</span>
          </Space>
        }
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={isUpdating}
            onClick={() => form.submit()}
            style={{
              background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
              border: "none",
            }}
          >
            Save
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAboutUs}
        >
          <Form.Item
            name="aboutUs"
            label="About Us (for Work Orders)"
            tooltip="This content will be automatically populated in work order creation forms. You can edit it when creating work orders."
          >
            <TextArea
              rows={8}
              placeholder="Enter About Us content that will be used in work orders. This helps provide consistent information about your branch in job postings."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBranch;

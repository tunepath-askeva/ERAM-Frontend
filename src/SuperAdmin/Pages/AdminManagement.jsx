// AdminManagement.jsx
import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Avatar,
  Typography,
  Row,
  Col,
  Flex,
  message,
  Popconfirm,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  StopOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import AdminFormModal from "../Modal/AdminFormModal";
import AdminViewModal from "../Modal/AdminViewModal";
import {
  useGetBranchesQuery,
  useCreateAdminMutation,
  useGetAdminsQuery,
  useGetSingleAdminQuery,
} from "../../Slices/SuperAdmin/SuperADminAPis";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewingAdminId, setViewingAdminId] = useState(null);
  const {
    data: branchesData,
    isLoading: branchesLoading,
    error: branchesError,
  } = useGetBranchesQuery();

  const {
    data: adminData,
    isLoading: adminLoading,
    error: adminError,
    refetch: refetchAdmins,
  } = useGetAdminsQuery();

  const { data: singleAdminData, isLoading: singleAdminLoading } =
    useGetSingleAdminQuery(viewingAdminId, {
      skip: !viewingAdminId,
    });

  const [createAdmin, { isLoading: createAdminLoading }] =
    useCreateAdminMutation();

  const branches = branchesData?.branch || [];
  const admins = adminData?.allAdmins || [];
  const skeletonRows = 5;

  const transformedAdmins = useMemo(() => {
    return admins.map((admin) => {
      const assignedBranch = branches.find(
        (branch) => branch._id === admin.branch
      );

      return {
        key: admin._id,
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        name: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role.charAt(0).toUpperCase() + admin.role.slice(1), // Capitalize role
        status: admin.accountStatus === "active" ? "active" : "inactive",
        branchId: admin.branch,
        assignedBranches: assignedBranch
          ? [
              {
                id: assignedBranch._id,
                name: assignedBranch.name,
                code: assignedBranch.branchCode,
                location: assignedBranch.location
                  ? `${assignedBranch.location.city}, ${assignedBranch.location.state}`
                  : "N/A",
              },
            ]
          : [],
        createdDate: admin.createdAt
          ? new Date(admin.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        // lastLogin: admin.lastLogin
        //   ? new Date(admin.lastLogin).toISOString().split("T")[0]
        //   : "Never",
        region: assignedBranch?.location?.state || "N/A",
        isActive: admin.isActive,
        skills: admin.skills || [],
        qualifications: admin.qualifications || [],
      };
    });
  }, [admins, branches]);

  // Filter admins based on search and status
  const filteredAdmins = transformedAdmins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || admin.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle Add Admin
  const handleAddAdmin = async (payload) => {
    try {
      const result = await createAdmin(payload).unwrap();
      message.success("Admin created successfully!");
      setIsAddModalOpen(false);

      // Refetch the admins data to get the updated list
      refetchAdmins();
    } catch (error) {
      console.error("Failed to create admin:", error);
      message.error(
        error?.data?.message || "Failed to create admin. Please try again."
      );
    }
  };

  const handleEditAdmin = (values) => {
    // Your existing edit logic
    // You might want to create an updateAdmin mutation for this
    console.log("Edit admin:", values);
  };

  const handleDeleteAdmin = (adminId) => {
    // Your existing delete logic
    // You might want to create a deleteAdmin mutation for this
    console.log("Delete admin:", adminId);
    message.success("Admin deleted successfully!");
  };

  const handleViewAdmin = (admin) => {
    setViewingAdminId(admin.id);
    setIsViewModalOpen(true);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  // Show error messages
  React.useEffect(() => {
    if (branchesError) {
      message.error("Failed to load branches. Please refresh the page.");
    }
    if (adminError) {
      message.error("Failed to load admins. Please refresh the page.");
    }
  }, [branchesError, adminError]);

  // Table columns
  const columns = [
    {
      title: "Admin",
      key: "admin",
      align: "center",
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#722ed1" }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </Flex>
      ),
    },
    {
      title: "Role & Status",
      key: "roleStatus",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag color="purple" icon={<CheckCircleOutlined />}>
            {record.role}
          </Tag>
          <Tag color={record.status === "active" ? "green" : "default"}>
            {record.status.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Text style={{ fontSize: "13px" }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.phone}
          </Text>
          <Text style={{ fontSize: "13px" }}>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {record.region || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Assigned Branches",
      key: "branches",
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {record.assignedBranches?.length > 0 ? (
            record.assignedBranches.slice(0, 2).map((branch) => (
              <Tag
                key={branch.id || branch._id}
                color="blue"
                style={{ fontSize: "11px" }}
              >
                <BankOutlined style={{ marginRight: 2 }} />
                {branch.code || branch.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              No branches assigned
            </Text>
          )}
          {record.assignedBranches?.length > 2 && (
            <Text type="secondary" style={{ fontSize: "11px" }}>
              +{record.assignedBranches.length - 2} more
            </Text>
          )}
        </Space>
      ),
    },
    // {
    //   title: "Last Login",
    //   key: "lastLogin",
    //   render: (_, record) => (
    //     <Text style={{ fontSize: "13px" }}>
    //       <CalendarOutlined style={{ marginRight: 4 }} />
    //       {record.lastLogin === "Never"
    //         ? "Never"
    //         : new Date(record.lastLogin).toLocaleDateString("en-IN")
    //       }
    //     </Text>
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewAdmin(record)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            title="Edit Admin"
          />
          <Popconfirm
            title="Delete Admin"
            description="Are you sure you want to delete this admin?"
            onConfirm={() => handleDeleteAdmin(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<StopOutlined />} title="Delete Admin" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Avatar
                size={48}
                icon={<UserAddOutlined />}
                style={{
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                }}
              />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Admin Management
                </Title>
                <Text type="secondary">
                  Manage administrators and their branch assignments (
                  {filteredAdmins.length} admins)
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
              }}
            >
              Add New Admin
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Search by name, email or role..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col>
            <Flex align="center" gap={8}>
              <FilterOutlined />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 160 }}
                size="large"
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Flex>
          </Col>
        </Row>
      </Card>

      {/* Admins Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAdmins}
          loading={{
            spinning: adminLoading || branchesLoading,
            indicator: <SkeletonLoader rowCount={skeletonRows} />,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} admins`,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modals */}
      <AdminFormModal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAdmin}
        branches={branches}
        loading={createAdminLoading}
        mode="add"
        title="Add New Administrator"
      />

      <AdminFormModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleEditAdmin}
        branches={branches}
        loading={false}
        mode="edit"
        title="Edit Administrator"
        initialValues={selectedAdmin}
      />

      <AdminViewModal
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingAdminId(null); // Reset ID on close
        }}
        admin={singleAdminData?.admin}
        loading={singleAdminLoading}
      />
    </div>
  );
};

export default AdminManagement;

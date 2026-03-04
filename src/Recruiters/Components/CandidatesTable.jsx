import React from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Tabs,
  Badge,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EyeOutlined,
  MoreOutlined,
  MessageOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CandidatesTable = ({
  candidates,
  filteredCandidates,
  isLoading,
  tablePagination,
  searchTerm,
  handleSearch,
  selectedStatus,
  handleStatusChange,
  filterCounts,
  hasPermission,
  statusConfig,
  iconTextStyle,
  columns,
  tabItems,
  getAvailableActions,
  handleViewProfile,
  handleSendMessage,
  handleDownloadResume,
  CandidateCard,
}) => {
  return (
    <>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Title
              level={2}
              style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}
            >
              Interview Candidates
            </Title>
            <Text type="secondary">
              Manage and track your interview candidates in pipeline
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Input
              placeholder="Search candidates, positions, or job codes..."
              prefix={<SearchOutlined style={iconTextStyle} />}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
              allowClear
              onPressEnter={(e) => handleSearch(e.target.value)}
            />
          </Col>
        </Row>

        {/* Status Filter Tabs */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Tabs
            activeKey={selectedStatus}
            onChange={handleStatusChange}
            items={tabItems}
            size="small"
            tabBarStyle={{ margin: 0 }}
          />
        </div>
      </Card>

      <Card>
        <div
          className="desktop-view"
          style={{ display: window.innerWidth >= 768 ? "block" : "none" }}
        >
          <Table
            columns={columns}
            dataSource={candidates}
            rowKey="id"
            loading={isLoading}
            pagination={tablePagination}
            scroll={{ x: 1400 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <UserOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <Title level={4} type="secondary">
                    No candidates found
                  </Title>
                  <Text type="secondary">
                    Try adjusting your search or filters to find candidates.
                  </Text>
                </div>
              ),
            }}
          />
        </div>

        {/* Mobile Card View */}
        <div
          className="mobile-view"
          style={{ display: window.innerWidth < 768 ? "block" : "none" }}
        >
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <UserOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} type="secondary">
                No candidates found
              </Title>
              <Text type="secondary">
                Try adjusting your search or filters to find candidates.
              </Text>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default CandidatesTable;


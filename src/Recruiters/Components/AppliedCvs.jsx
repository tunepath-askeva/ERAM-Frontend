import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Pagination,
  Typography,
  Button,
  Space,
  Skeleton
} from "antd";
import {
  FilePdfOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useGetLowLevelAppliedCandidatesByJobQuery } from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;

const AppliedCvs = ({ jobId }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // debounce search (1.3s delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 1300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError } =
    useGetLowLevelAppliedCandidatesByJobQuery({
      jobId,
      page,
      limit,
      search,
    });

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  if (isError) return <p>Error fetching applied candidates.</p>;

  const candidates = data?.appliedLowLevelCandidates || [];

  return (
    <div style={{ padding: 20 }}>
      <Title level={3} style={{ color: "#da2c46", marginBottom: 20 }}>
        Applied CVs
      </Title>

      <Search
        placeholder="Search applied candidates..."
        allowClear
        enterButton={
          <Button
            icon={<SearchOutlined />}
            style={{
              background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
              border: "none",
              color: "white",
            }}
          >
            Search
          </Button>
        }
        size="large"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        style={{ maxWidth: 650, marginBottom: 20 }}
      />

      <Row gutter={[16, 16]}>
        {candidates.map((candidate) => (
          <Col key={candidate._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                height: "100%",
              }}
              title={
                <Space align="center">
                  <UserOutlined style={{ color: "#da2c46" }} />
                  <Text strong>{candidate.applicantName}</Text>
                </Space>
              }
            >
              <div style={{ marginBottom: 10 }}>
                <MailOutlined style={{ marginRight: 6, color: "#da2c46" }} />
                <Text>{candidate.email}</Text>
              </div>

              {candidate.Resume?.length > 0 && (
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  href={candidate.Resume[0].fileUrl}
                  target="_blank"
                  style={{
                    width: "100%",
                    background: "#da2c46",
                    borderColor: "#da2c46",
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  View Resume
                </Button>
              )}

              <Button
                type="default"
                style={{
                  width: "100%",
                  borderRadius: 6,
                  marginTop: 5,
                  color: "#da2c46",
                  borderColor: "#da2c46",
                }}
                onClick={() => navigate("/recruiter/all-cvs")}
              >
                Convert to Candidate
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Pagination
          current={page}
          pageSize={limit}
          total={data?.total || candidates.length * 5}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default AppliedCvs;

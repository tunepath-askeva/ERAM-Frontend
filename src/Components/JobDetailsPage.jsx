import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Tag,
  Space,
  Avatar,
  Divider,
  Breadcrumb,
  Row,
  Col,
  Card,
  Descriptions,
  Spin
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BulbOutlined,
  TeamOutlined,
  BankOutlined,
  CalendarOutlined,
  GlobalOutlined,
  BookOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// Mock data - same as in CandidateJobs.jsx
const mockJobs = [
  {
    _id: "1",
    title: "Backend Developer",
    company: "Seekho",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "On-site",
    employmentType: "Full-time",
    experience: "2-5 years",
    salary: "₹8-15 LPA",
    postedDate: "2025-06-10",
    skills: ["Node.js", "MongoDB", "Express.js", "JavaScript"],
    description: "We are looking for a skilled Backend Developer to join our growing team. You will be responsible for developing server-side logic, maintaining the central database, and ensuring high performance and responsiveness to requests from the front-end.",
    requirements: ["2+ years of experience in backend development", "Strong knowledge of Node.js", "Experience with databases"],
    category: "Technology",
    isRemote: false,
    isSaved: false,
  },
  {
    _id: "2",
    title: "Sr Data Engineer",
    company: "Reveal Health Tech",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "Hybrid",
    employmentType: "Full-time",
    experience: "5-8 years",
    salary: "₹15-25 LPA",
    postedDate: "2025-06-10",
    skills: ["Python", "SQL", "AWS", "Data Engineering"],
    description: "Join our data team to build scalable data pipelines and analytics solutions. You will work with cutting-edge technologies to process and analyze large datasets.",
    requirements: ["5+ years in data engineering", "Strong Python skills", "Cloud experience preferred"],
    category: "Engineering",
    isRemote: false,
    isSaved: true,
  },
  {
    _id: "3",
    title: "Graphic Designer",
    company: "Astrome Technologies",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "On-site",
    employmentType: "Full-time",
    experience: "2-4 years",
    salary: "₹6-12 LPA",
    postedDate: "2025-06-10",
    skills: ["Adobe Creative Suite", "UI/UX", "Figma", "Branding"],
    description: "Astrome Technologies is seeking a talented and creative Graphic Designer with 2+ years of experience to join our design team and create compelling visual content.",
    requirements: ["2+ years of graphic design experience", "Proficiency in Adobe Creative Suite", "Strong portfolio"],
    category: "Design",
    isRemote: false,
    isSaved: false,
  },
  {
    _id: "4",
    title: "Sales Engineer, India",
    company: "Genetec",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "On-site",
    employmentType: "Full-time",
    experience: "3-6 years",
    salary: "₹10-18 LPA",
    postedDate: "2025-03-10",
    skills: ["Sales", "Engineering", "B2B", "Technical Sales"],
    description: "We are looking for a Sales Engineer to drive business growth in the Indian market. You will combine technical expertise with sales skills to help customers understand our solutions.",
    requirements: ["3+ years in technical sales", "Engineering background", "Strong communication skills"],
    category: "Sales",
    isRemote: false,
    isSaved: false,
  },
];

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = React.useState(new Set(["2"]));
  const [loading, setLoading] = React.useState(false); // Changed to false since we're not fetching

  // Find the job in mock data
  const job = mockJobs.find(job => job._id === id);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "today";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const handleSaveJob = () => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(job._id)) {
      newSavedJobs.delete(job._id);
    } else {
      newSavedJobs.add(job._id);
    }
    setSavedJobs(newSavedJobs);
  };

  if (!job) return <div>Job not found</div>;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: "24px" }}>
        <Breadcrumb.Item>
          <a href="/candidate-jobs">Jobs</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{job.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: "16px" }}
      >
        Back to Jobs
      </Button>

      {/* Main Job Card */}
      <Card
        style={{ 
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* Job Header */}
        <div style={{ display: "flex", marginBottom: "24px" }}>
          <Avatar
            src={job.companyLogo}
            size={80}
            style={{ 
              backgroundColor: "#f0f0f0",
              marginRight: "24px",
              flexShrink: 0
            }}
            icon={<BankOutlined />}
          />
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ margin: 0 }}>
              {job.title}
            </Title>
            <Text style={{ 
              fontSize: "18px", 
              color: "#666", 
              display: "block",
              margin: "8px 0 16px"
            }}>
              {job.company}
            </Text>
            
            <Space wrap size="middle">
              <Tag 
                icon={<EnvironmentOutlined />} 
                color="blue"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {job.location}
              </Tag>
              <Tag 
                icon={job.workType === "Remote" ? <HomeOutlined /> : <BankOutlined />} 
                color="green"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {job.workType}
              </Tag>
              <Tag 
                color="orange"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {job.employmentType}
              </Tag>
              <Tag 
                color="purple"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                {job.experience}
              </Tag>
            </Space>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              icon={savedJobs.has(job._id) ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleSaveJob}
              style={{
                color: savedJobs.has(job._id) ? "#da2c46" : undefined,
                height: "40px",
                width: "40px"
              }}
            />
            <Button
              icon={<ShareAltOutlined />}
              style={{ height: "40px", width: "40px" }}
            />
          </div>
        </div>

        {/* Salary and Posted Date */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "16px",
          background: "#f8f9fa",
          borderRadius: "8px"
        }}>
          {job.salary && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <DollarOutlined style={{ 
                color: "#da2c46", 
                fontSize: "20px",
                marginRight: "12px"
              }} />
              <div>
                <Text strong style={{ display: "block", color: "#666" }}>Salary</Text>
                <Text strong style={{ color: "#da2c46", fontSize: "16px" }}>
                  {job.salary}
                </Text>
              </div>
            </div>
          )}
          
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ 
              color: "#666", 
              fontSize: "20px",
              marginRight: "12px"
            }} />
            <div>
              <Text strong style={{ display: "block", color: "#666" }}>Posted</Text>
              <Text style={{ color: "#333", fontSize: "16px" }}>
                {formatDate(job.postedDate)}
              </Text>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center" }}>
            <BookOutlined style={{ 
              color: "#666", 
              fontSize: "20px",
              marginRight: "12px"
            }} />
            <div>
              <Text strong style={{ display: "block", color: "#666" }}>Category</Text>
              <Text style={{ color: "#333", fontSize: "16px" }}>
                {job.category}
              </Text>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>Job Description</Title>
          <Paragraph style={{ 
            fontSize: "16px", 
            lineHeight: "1.7",
            color: "#444"
          }}>
            {job.description}
          </Paragraph>
        </div>

        {/* Requirements */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>Requirements</Title>
          <ul style={{ 
            paddingLeft: "24px",
            fontSize: "16px",
            lineHeight: "1.7",
            color: "#444"
          }}>
            {job.requirements.map((item, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                <CheckCircleOutlined style={{ 
                  color: "#52c41a",
                  marginRight: "8px"
                }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>Required Skills</Title>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {job.skills.map((skill, index) => (
              <Tag
                key={index}
                style={{
                  fontSize: "14px",
                  padding: "6px 12px",
                  border: "1px solid #da2c46",
                  color: "#da2c46",
                  background: "#fff",
                  borderRadius: "20px"
                }}
              >
                {skill}
              </Tag>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Button
            type="primary"
            size="large"
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              border: "none",
              padding: "0 48px",
              height: "48px",
              fontWeight: 600,
              fontSize: "16px"
            }}
          >
            Apply Now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default JobDetailsPage;
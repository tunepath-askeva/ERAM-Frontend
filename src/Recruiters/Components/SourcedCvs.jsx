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
  Skeleton,
} from "antd";
import {
  FilePdfOutlined,
  MailOutlined,
  UserOutlined,
  SearchOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { useGetLowLevelCandidatesByJobQuery } from "../../Slices/Recruiter/RecruiterApis";
import { useSnackbar } from "notistack";
import axios from "axios";
import ConvertToCandidateModal from "./ConvertToCandidatModal";

const { Title, Text } = Typography;
const { Search } = Input;

const SourcedCvs = ({ jobId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 1300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useGetLowLevelCandidatesByJobQuery({
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
  if (isError) return <p>Error fetching candidates.</p>;

  const candidates = data?.lowlevelCandidates || [];

  const handleConvertCandidate = (candidate) => {
    setCandidateToConvert({
      id: candidate._id,
      firstName: candidate.firstName || candidate.applicantName?.split(" ")[0] || "",
      lastName: candidate.lastName || candidate.applicantName?.split(" ").slice(1).join(" ") || "",
      email: candidate.email || "",
      designation: candidate.designation || "",
      specialization: candidate.designation || "",
      fileUrl: candidate.resume?.[0]?.fileUrl || "",
      fileName: candidate.resume?.[0]?.fileName || "resume.pdf",
    });
    setConvertModalVisible(true);
  };

  const handleConvertSubmit = async (values, documentFiles, existingCvUrl) => {
    setIsConverting(true);
    try {
      // Extract phone number and country code properly
      const phoneNumber = values.phoneNumber || "";
      const phoneCountryCode = values.phoneNumberCountryCode || "91";
      
      // Clean phone number - remove country code if present
      let cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.startsWith(phoneCountryCode)) {
        cleanPhone = cleanPhone.slice(phoneCountryCode.length);
      }

      // Use designation for specialization if specialization is not provided
      const specialization = values.specialization || values.designation || candidateToConvert.designation || "";

      const { phoneNumber: _, phoneNumberCountryCode: __, ...rest } = values;
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add existing CV URL if available (the CV is already uploaded)
      if (existingCvUrl) {
        formData.append("existingCvUrl", existingCvUrl);
      }
      
      // Add document files if provided
      if (documentFiles && documentFiles.length > 0) {
        documentFiles.forEach((file) => {
          formData.append("documents", file);
        });
      }
      
      // Add all other form data
      const payload = {
        ...rest,
        phone: cleanPhone, // Phone WITHOUT country code
        phoneCountryCode: phoneCountryCode, // Country code separately
        specialization: specialization, // Use designation for specialization
      };
      
      // Append all payload fields to FormData
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key]);
        }
      });
      
      const baseUrl = window.location.hostname === "localhost"
        ? "http://localhost:5000/api/recruiter"
        : `https://${window.location.hostname}/api/recruiter`;
      
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      await axios.post(`${baseUrl}/converts/${candidateToConvert.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      enqueueSnackbar(
        `${values.firstName} ${values.lastName} converted to candidate successfully!`,
        { variant: "success" }
      );
      setConvertModalVisible(false);
      setCandidateToConvert(null);
      // Refetch the data to update the list
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error("Conversion error:", error);
      enqueueSnackbar(
        error?.response?.data?.message || error?.data?.message || "Failed to convert candidate!",
        { variant: "error" }
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={3} style={{ color: "#da2c46", marginBottom: 20 }}>
        Candidate CVs
      </Title>

      <Search
        placeholder="Search candidates..."
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
                  <Text strong>{candidate.applicantName || "N/A"}</Text>
                </Space>
              }
            >
              <div style={{ marginBottom: 10 }}>
                <MailOutlined style={{ marginRight: 6, color: "#da2c46" }} />
                <Text>{candidate.email || "N/A" }</Text>
              </div>

               <div style={{ marginBottom: 10 }}>
                <CodeOutlined style={{ marginRight: 6, color: "#da2c46" }} />
                <Text>{candidate.uniqueCode || "N/A" }</Text>
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: "#da2c46" }}>
                  {candidate.jobId
                    ? `Applied for ${candidate.jobId.title} (${candidate.jobId.jobCode})`
                    : "Common Apply"}
                </Text>
              </div>

              {candidate.resume?.length > 0 && (
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  href={candidate.resume[0].fileUrl}
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
                onClick={() => handleConvertCandidate(candidate)}
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

      {convertModalVisible && (
        <ConvertToCandidateModal
          visible={convertModalVisible}
          onCancel={() => {
            setConvertModalVisible(false);
            setCandidateToConvert(null);
          }}
          initialValues={candidateToConvert}
          handleSubmit={handleConvertSubmit}
          isSubmitting={isConverting}
          existingCvUrl={candidateToConvert?.fileUrl}
          existingCvFileName={candidateToConvert?.fileName}
        />
      )}
    </div>
  );
};

export default SourcedCvs;

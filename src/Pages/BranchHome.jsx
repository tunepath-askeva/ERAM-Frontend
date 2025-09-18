import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Spin,
  Alert,
  Button,
  Typography,
  Space,
  Avatar,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
} from "../Slices/Users/UserApis.js";
import BranchHeader from "../Global/BranchHeader.jsx";
import BranchFooter from "../Global/BranchFooter.jsx";
import JobsSection from "./JobsSection.jsx";
import SkeletonLoader from "../Global/SkeletonLoader.jsx";
import { useBranch } from "../utils/useBranch.js";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BranchHome = () => {
  // const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // const {
  //   data: branches,
  //   isLoading: branchesLoading,
  //   error: branchesError,
  // } = useGetBranchesQuery();

  // const [currentBranchId, setCurrentBranchId] = useState(null);
  // const [foundByDomain, setFoundByDomain] = useState(false);

  // const {
  //   data: branchData,
  //   isLoading: branchLoading,
  //   error: branchError,
  //   skip: skipBranchQuery,
  // } = useGetBranchByIdQuery(currentBranchId, {
  //   skip: !currentBranchId,
  // });

  const {
    currentBranch,
    isLoading,
    error,
    branchId: currentBranchId,
    foundByDomain,
  } = useBranch();

  const findBranchByDomain = (branchesData) => {
    const currentHost = window.location.hostname;

    const matchedBranch = branchesData.find((branch) => {
      if (!branch.url) return false;

      let branchDomain = String(branch.url)
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      console.log(`Comparing: ${currentHost} with ${branchDomain}`);

      return (
        (currentHost && currentHost.includes(branchDomain)) ||
        (branchDomain && branchDomain.includes(currentHost))
      );
    });

    return matchedBranch;
  };

  // useEffect(() => {
  //   if (branches?.branch && Array.isArray(branches.branch)) {
  //     console.log("Branches loaded:", branches.branch);

  //     const branchByDomain = findBranchByDomain(branches.branch);

  //     if (branchByDomain) {
  //       console.log("Branch found by domain:", branchByDomain);
  //       setCurrentBranchId(branchByDomain._id);
  //       setFoundByDomain(true);
  //     } else {
  //       const branchId = searchParams.get("branchId");
  //       if (branchId) {
  //         console.log("Branch ID from URL params:", branchId);
  //         setCurrentBranchId(branchId);
  //         setFoundByDomain(false);
  //       } else {
  //         setCurrentBranchId(null);
  //         setFoundByDomain(false);
  //       }
  //     }
  //   }
  // }, [branches, searchParams]);

  // const isLoading = branchesLoading || branchLoading;

  // const error = branchesError || branchError;

  // const currentBranch = foundByDomain
  //   ? branches?.branch?.find((b) => b._id === currentBranchId)
  //   : branchData?.branch;

  useEffect(() => {
    if (currentBranch) {
      console.log("Updating metadata for branch:", currentBranch);
      updateBranchMetadata(currentBranch);
    }
  }, [currentBranch]);

  const updateBranchMetadata = (branch) => {
    document.title = `${branch.name}`;

    if (branch.brand_logo) {
      updateFavicon(branch.brand_logo);
    }

    updateMetaTags(branch);

    console.log("Metadata updated for:", branch.name);
  };

  const updateFavicon = (logoUrl) => {
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((favicon) => favicon.remove());

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = logoUrl;
    document.head.appendChild(link);

    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = logoUrl;
    document.head.appendChild(appleLink);
  };

  const updateMetaTags = (branch) => {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content =
      branch.description ||
      `Welcome to ${branch.name} - Professional services in ${
        branch.location?.city || "your area"
      }`;

    const ogTags = [
      { property: "og:title", content: `${branch.name}` },
      {
        property: "og:description",
        content: branch.description || `${branch.name} services`,
      },
      { property: "og:image", content: branch.brand_logo },
      { property: "og:url", content: window.location.href },
    ];

    ogTags.forEach((tag) => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = tag.content || "";
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <BranchHeader />
        <div>
          <SkeletonLoader />
        </div>
        <BranchFooter />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <BranchHeader />
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            padding: "50px 20px",
          }}
        >
          <Alert
            message="Error Loading Branch Data"
            description="There was an error loading the branch information. Please try again."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          />
        </div>
        <BranchFooter />
      </Layout>
    );
  }

  // No branch found state
  if (!isLoading && !currentBranch) {
    return (
      <Layout>
        <BranchHeader />
        <Content
          style={{
            padding: "50px 20px",
            background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
          }}
        >
          <div
            style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          >
            <Alert
              message="Branch Not Found"
              description={`No branch is configured for this domain: ${window.location.hostname}`}
              type="warning"
              showIcon
              action={
                <Button size="small" onClick={() => navigate("/branches")}>
                  View All Branches
                </Button>
              }
            />
          </div>
        </Content>
        <BranchFooter />
      </Layout>
    );
  }

  // Success state - render branch page
  return (
    <Layout>
      <BranchHeader currentBranch={currentBranch} />

      {/* Main Content */}
      <Content
        style={{
          backgroundColor: "#f8fafc",
          padding: "0",
        }}
      >
        <div>
          {/* Main Column - Jobs */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "40px 30px",
              borderLeft: "1px solid #e2e8f0",
              borderRight: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <JobsSection
              currentBranch={currentBranch}
              branchId={currentBranchId}
            />
          </div>
        </div>
      </Content>

      <BranchFooter currentBranch={currentBranch} />
    </Layout>
  );
};

export default BranchHome;

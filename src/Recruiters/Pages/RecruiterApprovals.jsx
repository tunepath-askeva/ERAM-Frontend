import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Tabs, Grid } from "antd";
import {
  useGetApprovalInfoQuery,
  useApproveCandidateDocumentsMutation,
  useGetSeperateApprovalsQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import WorkOrderApprovals from "../Components/WorkOrderApprovals";
import SeparateApprovals from "../Components/SeparateApprovals";
import RequisitionApprovals from "../Components/RequisitionApprovals";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const RecruiterApprovals = () => {
  const [activeTab, setActiveTab] = useState("workOrder");
  const [hasLoadedWorkOrders, setHasLoadedWorkOrders] = useState(false);
  const [hasLoadedSeparateApprovals, setHasLoadedSeparateApprovals] = useState(false);

  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const isTablet = screens.sm || screens.md;

  const {
    data: workOrders = [],
    isLoading: loadingWorkOrders,
    refetch: refetchWorkOrders,
  } = useGetApprovalInfoQuery(undefined, {
    skip: activeTab !== "workOrder",
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const {
    data: separateApprovals = [],
    isLoading: loadingSeparateApprovals,
    refetch: refetchSeparateApprovals,
  } = useGetSeperateApprovalsQuery(undefined, {
    skip: activeTab !== "separate",
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [approveCandidateDocuments, { isLoading: isApproving }] =
    useApproveCandidateDocumentsMutation();

  useEffect(() => {
    if (activeTab === "workOrder" && !hasLoadedWorkOrders) {
      refetchWorkOrders().then(() => setHasLoadedWorkOrders(true));
    } else if (activeTab === "separate" && !hasLoadedSeparateApprovals) {
      refetchSeparateApprovals().then(() => setHasLoadedSeparateApprovals(true));
    }
  }, [activeTab]);

  const handleWorkOrderApprove = async (payload) => {
    try {
      await approveCandidateDocuments(payload).unwrap();
      
      // Refetch work order approvals
      setHasLoadedWorkOrders(false);
      await refetchWorkOrders();
      setHasLoadedWorkOrders(true);
    } catch (error) {
      throw new Error(error.data?.message || "Failed to approve documents");
    }
  };

  const handleSeparateApprove = async (payload) => {
    try {
      await approveCandidateDocuments(payload).unwrap();
      
      // Refetch separate approvals
      setHasLoadedSeparateApprovals(false);
      await refetchSeparateApprovals();
      setHasLoadedSeparateApprovals(true);
    } catch (error) {
      throw new Error(error.data?.message || "Failed to approve documents");
    }
  };

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "16px" }}>
        <Col span={24}>
          <Title
            level={isMobile ? 4 : isTablet ? 3 : 2}
            style={{ margin: 0, color: "#262626" }}
          >
            Document Approvals
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? "12px" : "14px",
              display: "block",
              marginTop: "4px",
            }}
          >
            Review and approve candidate document submissions
          </Text>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ marginBottom: 16 }}
        destroyInactiveTabPane={true}
      >
        <TabPane tab="Work Order Approvals" key="workOrder">
          <WorkOrderApprovals
            workOrders={hasLoadedWorkOrders ? workOrders : []}
            loading={loadingWorkOrders}
            onApprove={handleWorkOrderApprove}
            isApproving={isApproving}
          />
        </TabPane>
        
        <TabPane tab="Separate Approvals" key="separate">
          <SeparateApprovals
            separateApprovals={hasLoadedSeparateApprovals ? separateApprovals : []}
            loading={loadingSeparateApprovals}
            onApprove={handleSeparateApprove}
            isApproving={isApproving}
          />
        </TabPane>
        
        <TabPane tab="Requisition Approvals" key="requisition">
          <RequisitionApprovals isActive={activeTab === "requisition"} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RecruiterApprovals;
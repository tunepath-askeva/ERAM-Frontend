import React, { useState, useEffect, useMemo } from "react";
import {
  useGetEmployeeProfileQuery,
  useGetEmployeeNotificationQuery,
  useGetRequestHistoryQuery,
  useGetEmployeeLeaveHistoryQuery,
  useGetCompanyNewsQuery,
  useGetEmployeeDocumentsQuery,
} from "../../Slices/Employee/EmployeeApis";
import SkeletonLoader from "../../Global/SkeletonLoader";
import {
  calculateProfileCompletion,
  calculateDocumentStatus,
  calculateCompliancePercentage,
  getPublishedNewsOnly,
  getPublishedEvents,
} from "../Components/Dashboard/utils";
import ProfileCard from "../Components/Dashboard/ProfileCard";
import PersonalInfoCard from "../Components/Dashboard/PersonalInfoCard";
import EmploymentCard from "../Components/Dashboard/EmploymentCard";
import DocumentsCard from "../Components/Dashboard/DocumentsCard";
import NewsCard from "../Components/Dashboard/NewsCard";
import EventsCard from "../Components/Dashboard/EventsCard";
import NotificationsCard from "../Components/Dashboard/NotificationsCard";
import RequestsCard from "../Components/Dashboard/RequestsCard";
import CompanyPoliciesCard from "../Components/Dashboard/CompanyPoliciesCard";

/* ─────────────────────────────────────────────
   Breakpoints
   xs  : < 480   (small phone)
   sm  : 480–767 (large phone)
   md  : 768–1023 (tablet)
   lg  : 1024–1279 (small desktop)
   xl  : ≥ 1280 (large desktop)
───────────────────────────────────────────── */
const getBreakpoint = (w) => {
  if (w < 480) return "xs";
  if (w < 768) return "sm";
  if (w < 1024) return "md";
  if (w < 1280) return "lg";
  return "xl";
};

const isMobileBp = (bp) => bp === "xs" || bp === "sm";
const isTabletBp = (bp) => bp === "md";
const isDesktopBp = (bp) => bp === "lg" || bp === "xl";

const NAVBAR_HEIGHT = 64; // px – adjust if your navbar differs

const EmployeeDashboard = () => {
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [bp, setBp] = useState(getBreakpoint(window.innerWidth));

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: profileData, isLoading: profileLoading } = useGetEmployeeProfileQuery();
  const { data: notificationsData, isLoading: notificationsLoading } =
    useGetEmployeeNotificationQuery({ page: 1, limit: 5 });
  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
  } = useGetRequestHistoryQuery({ page: 1, pageSize: 10 }, { skip: false });
  const {
    data: leaveRequestsData,
    isLoading: leaveRequestsLoading,
    error: leaveRequestsError,
  } = useGetEmployeeLeaveHistoryQuery({ page: 1, limit: 10 });
  const { data: newsData, isLoading: newsLoading } = useGetCompanyNewsQuery();
  const { data: documentsData, isLoading: documentsLoading } = useGetEmployeeDocumentsQuery();

  const employee = profileData?.employee;
  const notifications = notificationsData?.notifications || [];
  const regularRequests = requestsData?.requests || [];
  const leaveRequests = leaveRequestsData?.leaves || [];
  const publishedNewsOnly = getPublishedNewsOnly(newsData);
  const publishedEvents = getPublishedEvents(newsData);

  // ── Combine and sort requests ──────────────────────────────────────────────
  const combinedRequests = useMemo(() => {
    // Transform leave requests to match regular request format
    const transformedLeaveRequests = leaveRequests.map((leave) => ({
      _id: leave._id,
      requestType: "Leave Request",
      description: `${leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1) || "Leave"} Leave${leave.isHalfDay ? " (Half Day)" : ""} - ${leave.reason || "No reason provided"}`,
      subject: `${leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1) || "Leave"} Leave Request`,
      status: leave.status?.toLowerCase() || "pending",
      createdAt: leave.appliedDate || leave.createdAt || new Date().toISOString(),
      isLeaveRequest: true, // Flag to identify leave requests
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
    }));

    // Transform regular requests to ensure consistent format
    const transformedRegularRequests = regularRequests.map((request) => ({
      ...request,
      isLeaveRequest: false,
    }));

    // Combine both arrays
    const allRequests = [...transformedRegularRequests, ...transformedLeaveRequests];

    // Sort by createdAt (latest first) and take top 5
    return allRequests
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (latest first)
      })
      .slice(0, 5);
  }, [regularRequests, leaveRequests]);

  // Combined loading and error states
  const isRequestsLoading = requestsLoading || leaveRequestsLoading;
  const hasRequestsError = requestsError || leaveRequestsError;

  const documentStatus = React.useMemo(
    () => calculateDocumentStatus(documentsData),
    [documentsData]
  );

  useEffect(() => {
    if (employee) setProfileCompletion(calculateProfileCompletion(employee));
  }, [employee]);

  const compliancePercentage = calculateCompliancePercentage(documentStatus);

  if (profileLoading) return <SkeletonLoader />;

  // ── Derived flags ──────────────────────────────────────────────────────────
  const isMobile = isMobileBp(bp);
  const isTablet = isTabletBp(bp);
  const isDesktop = isDesktopBp(bp);

  // screenSize object kept for backwards-compat with child components
  const screenSize = {
    width: window.innerWidth,
    isMobile,
    isTablet,
    isDesktop,
  };

  // ── Shared card props ──────────────────────────────────────────────────────
  const GAP = isMobile ? 10 : isTablet ? 10 : isDesktop ? 10 : 8; // px gap between cards - reduced for better space usage

  // ── Layout constants ───────────────────────────────────────────────────────
  //   Desktop  : LEFT(profile 22%) | CENTER(flex) | RIGHT(news 21%)
  //   Tablet   : LEFT(profile 260px) | RIGHT(rest full width, wraps)
  //   Mobile   : single column, all cards stacked

  const dashboardHeight = `calc(100vh - ${NAVBAR_HEIGHT}px)`;

  /* ══════════════════════════════════════════════════════════════════════════
     MOBILE  (<768px) — single column, naturally scrolling
  ══════════════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{ width: "100%", background: "#f5f5f5", padding: isMobile ? GAP : GAP, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>

          {/* Profile card — full width, compact */}
          <ProfileCard employee={employee} profileCompletion={profileCompletion} screenSize={screenSize} />

          {/* Info trio — 2 per row on xs, 3 on sm */}
          <div style={{
            display: "grid",
            gridTemplateColumns: bp === "xs" ? "1fr 1fr" : "1fr 1fr 1fr",
            gap: GAP,
          }}>
            <PersonalInfoCard employee={employee} screenSize={screenSize} />
            <EmploymentCard employee={employee} screenSize={screenSize} />
            <DocumentsCard
              documentStatus={documentStatus}
              compliancePercentage={compliancePercentage}
              documentsLoading={documentsLoading}
              screenSize={screenSize}
            />
          </div>

          {/* Notifications + Requests — stacked */}
          <NotificationsCard notifications={notifications} notificationsLoading={notificationsLoading} screenSize={screenSize} />
          <RequestsCard requests={combinedRequests} requestsLoading={isRequestsLoading} requestsError={hasRequestsError} screenSize={screenSize} />

          {/* News, Events, Policies — stacked */}
          <NewsCard publishedNews={publishedNewsOnly} newsLoading={newsLoading} screenSize={screenSize} isRightSidebar={true} />
          <EventsCard publishedEvents={publishedEvents} eventsLoading={newsLoading} screenSize={screenSize} />
          <CompanyPoliciesCard screenSize={screenSize} />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TABLET  (768–1023px) — 2-column: profile left | content right
  ══════════════════════════════════════════════════════════════════════════ */
  if (isTablet) {
    return (
      <div style={{
        width: "100%",
        background: "#f5f5f5",
        padding: GAP,
        boxSizing: "border-box",
        minHeight: dashboardHeight,
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", gap: GAP, alignItems: "flex-start", width: "100%" }}>

          {/* LEFT — Profile (fixed 220px) */}
          <div style={{ width: 220, flexShrink: 0 }}>
            <ProfileCard employee={employee} profileCompletion={profileCompletion} screenSize={screenSize} />
          </div>

          {/* RIGHT — everything else */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: GAP }}>

            {/* Row 1 — info cards (3 equal columns) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: GAP }}>
              <PersonalInfoCard employee={employee} screenSize={screenSize} />
              <EmploymentCard employee={employee} screenSize={screenSize} />
              <DocumentsCard
                documentStatus={documentStatus}
                compliancePercentage={compliancePercentage}
                documentsLoading={documentsLoading}
                screenSize={screenSize}
              />
            </div>

            {/* Row 2 — notifications + requests side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: GAP }}>
              <NotificationsCard notifications={notifications} notificationsLoading={notificationsLoading} screenSize={screenSize} />
              <RequestsCard requests={combinedRequests} requestsLoading={isRequestsLoading} requestsError={hasRequestsError} screenSize={screenSize} />
            </div>

            {/* Row 3 — news, events, policies (3 equal columns) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: GAP }}>
              <NewsCard publishedNews={publishedNewsOnly} newsLoading={newsLoading} screenSize={screenSize} isRightSidebar={true} />
              <EventsCard publishedEvents={publishedEvents} eventsLoading={newsLoading} screenSize={screenSize} />
              <CompanyPoliciesCard screenSize={screenSize} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     DESKTOP  (≥1024px) — 3-column fixed-height layout, no page scroll
     LEFT: profile sidebar | CENTER: info+notifications+requests | RIGHT: news+events+policies
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      width: "100%",
      height: dashboardHeight,
      background: "#f5f5f5",
      display: "flex",
      flexDirection: "row",
      gap: GAP,
      padding: isDesktop ? "8px" : GAP,
      boxSizing: "border-box",
      overflow: "hidden",
    }}>

      {/* ── LEFT SIDEBAR — Profile ─────────────────────────────────────────── */}
      <div style={{
        width: bp === "xl" ? "20%" : "21%",
        minWidth: 200,
        maxWidth: 260,
        height: "100%",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        <ProfileCard employee={employee} profileCompletion={profileCompletion} screenSize={screenSize} />
      </div>

      {/* ── CENTER — Info cards + Notifications/Requests ──────────────────── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: GAP,
        overflow: "hidden",
      }}>

        {/* Top row — Personal Info | Employment | Documents (equal thirds, ~48% height) */}
        <div style={{
          flex: "0 0 calc(48% - 5px)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: GAP,
          minHeight: 0,
          overflow: "hidden",
        }}>
          <div style={{ height: "100%", overflow: "hidden" }}>
            <PersonalInfoCard employee={employee} screenSize={screenSize} />
          </div>
          <div style={{ height: "100%", overflow: "hidden" }}>
            <EmploymentCard employee={employee} screenSize={screenSize} />
          </div>
          <div style={{ height: "100%", overflow: "hidden" }}>
            <DocumentsCard
              documentStatus={documentStatus}
              compliancePercentage={compliancePercentage}
              documentsLoading={documentsLoading}
              screenSize={screenSize}
            />
          </div>
        </div>

        {/* Bottom row — Notifications | Requests (equal halves, remaining height) */}
        <div style={{
          flex: "1 1 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: GAP,
          minHeight: 0,
          overflow: "hidden",
        }}>
          <div style={{ height: "100%", overflow: "hidden" }}>
            <NotificationsCard
              notifications={notifications}
              notificationsLoading={notificationsLoading}
              screenSize={screenSize}
            />
          </div>
          <div style={{ height: "100%", overflow: "hidden" }}>
            <RequestsCard
              requests={combinedRequests}
              requestsLoading={isRequestsLoading}
              requestsError={hasRequestsError}
              screenSize={screenSize}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR — News / Events / Policies ──────────────────────── */}
      <div style={{
        width: bp === "xl" ? "20%" : "21%",
        minWidth: 190,
        maxWidth: 260,
        height: "100%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: GAP,
        overflow: "hidden",
      }}>
        {/* News — 44% */}
        <div style={{ flex: "0 0 calc(44% - 5px)", minHeight: 0, overflow: "hidden" }}>
          <NewsCard
            publishedNews={publishedNewsOnly}
            newsLoading={newsLoading}
            screenSize={screenSize}
            isRightSidebar={true}
          />
        </div>

        {/* Events — 44% */}
        <div style={{ flex: "0 0 calc(44% - 5px)", minHeight: 0, overflow: "hidden" }}>
          <EventsCard
            publishedEvents={publishedEvents}
            eventsLoading={newsLoading}
            screenSize={screenSize}
          />
        </div>

        {/* Policies — remaining */}
        <div style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>
          <CompanyPoliciesCard screenSize={screenSize} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
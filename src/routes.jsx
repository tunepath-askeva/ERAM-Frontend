import { Routes, Route } from "react-router-dom";
import Login from "./Auth/Login";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Branches from "./Pages/Branches";
import Services from "./Pages/Services";
import Contacts from "./Pages/Contacts";
import SuperDashboard from "./SuperAdmin/Pages/SuperDashboard";
import SuperMainLayout from "./SuperAdmin/Global/SuperMainLayout";
import BranchManagement from "./SuperAdmin/Pages/BranchManagement";
import AddBranch from "./SuperAdmin/Components/AddBranch";
import ViewBranch from "./SuperAdmin/Components/ViewBranch";
import EditBranch from "./SuperAdmin/Components/EditBranch";
import AdminManagement from "./SuperAdmin/Pages/AdminManagement";
import SuperAdminLogin from "./SuperAdmin/Auth/SuperAdminLogin";
import ProtectedSuperAdmin from "./SuperAdmin/Auth/ProtectedSuperAdmin";
import SuperAdminSettings from "./SuperAdmin/Pages/SuperAdminSetting";
import AdminLayout from "./Admin/Global/AdminLayout";
import AdminDashboard from "./Admin/Pages/AdminDashboard";
import ProtectedAdmin from "./Admin/Auth/ProtectedAdmin";
import AdminBranch from "./Admin/Pages/AdminBranch";
import WorkOrder from "./Admin/Pages/WorkOrder";
import Pipeline from "./Admin/Pages/Pipeline";
import AddWorkOrder from "./Admin/Components/AddWorkOrder";
import ViewWorkOrder from "./Admin/Components/ViewWorkOrder";
import EditWorkOrder from "./Admin/Components/EditWorkOrder";
import AdminRecuiter from "./Admin/Pages/AdminRecruiters";
import Master from "./Admin/Pages/Master";
import CandidateLayout from "./Global/CandidateLayout";
import CandidateJobs from "./Pages/CandidateJobs";
import CandidateAppliedJobs from "./Pages/CandidateAppliedJobs";
import CandidateSettings from "./Pages/CandidateSettings";
import JobDetailsPage from "./Components/JobDetailsPage";
import AdminCandidates from "./Admin/Pages/AdminCandidates";
import ProtectedRecruiter from "./Recruiters/Auth/ProtectedRecruiter";
import RecruiterDashboard from "./Recruiters/Pages/RecruiterDashboard";
import RecruiterCandidates from "./Recruiters/Pages/RecruiterCandidates";
import RecruiterJobs from "./Recruiters/Pages/RecruiterJobs";
import RecruiterEmployee from "./Recruiters/Pages/RecruiterEmployee";
import RecruiterLayout from "./Recruiters/Global/RecruiterLayout";
import RecruiterEditJob from "./Recruiters/Components/RecruiterEditJob";
import RecruiterViewJob from "./Recruiters/Components/RecruiterViewJob";
import EmployeeLayout from "./Employee/Global/EmployeeLayout";
import EmployeeProfileSettings from "./Employee/Pages/EmployeeProfileSettings";
import EmployeeLeaveRequest from "./Employee/Pages/EmployeeLeaveRequest";
import EmployeeRaiseRequest from "./Employee/Pages/EmployeeRaiseRequest";
import Levels from "./Admin/Pages/Levels";
import RecruiterStagedCandidates from "./Recruiters/Pages/RecruiterStagedCandidates";
import RecruiterJobPipeline from "./Recruiters/Components/RecruiterJobPipeline";
import SourcedJobDetails from "./Components/SourcedJobDetails";
import RecruiterApprovals from "./Recruiters/Pages/RecruiterApprovals";
import AppliedJobDetails from "./Components/AppliedJobDetails";
import HrDashboard from "./HR/Pages/HrDashboard";
import HrPayroll from "./HR/Pages/HrPayroll";
import HrEmployees from "./HR/Pages/HrEmployees";
import ProtectedCandidate from "./Auth/ProtectedCandidate";
import Notifications from "./Pages/Notifications";
import AdminRequisition from "./Admin/Pages/AdminRequisition";
import RecruiterRequisition from "./Recruiters/Pages/RecruiterRequisition";
import CandidateDocuments from "./Pages/CandidateDocuments";
import AddRequisition from "./Recruiters/Components/AddRequisition";
import EditRequisition from "./Recruiters/Components/EditRequisition";
import AllCandidates from "./Recruiters/Pages/AllCandidates";
import RecruiterJobsTimeline from "./Recruiters/Pages/RecruiterJobsTimeline";
import RecruiterViewTimeline from "./Recruiters/Components/RecruiterViewTimeline";
import ProtectedEmployee from "./Employee/Auth/ProtectedEmployee";
import EmployeeAdminLayout from "./EmployeeAdmin/Global/EmployeeAdminLayout";
import EmployeeAdminDashboard from "./EmployeeAdmin/Pages/EmployeeAdminDashboard";
import ProtectedEmployeeAdmin from "./EmployeeAdmin/Auth/ProtectedEmployeeAdmin";
import EmployeeAdminLeaveRequest from "./EmployeeAdmin/Pages/EmployeeAdminLeaveRequest";
import EmployeeCompanyPolicy from "./Employee/Pages/EmployeeCompanyPolicy";
import EmployeeAdminCompanyPolicy from "./EmployeeAdmin/Pages/EmployeeAdminCompanyPolicy";
import EmployeeAdminPayroll from "./EmployeeAdmin/Pages/EmployeeAdminPayroll";
import EmployeeAdminAllEmployees from "./EmployeeAdmin/Pages/EmployeeAdminAllEmployees";
import EmployeePayroll from "./Employee/Pages/EmployeePayroll";
import CompletedCandidates from "./Recruiters/Pages/CompletedCandidates";
import WhatsAppConfigPanel from "./Admin/Pages/WhatsappapiIntegration";
import SuperAdminWhatsappApi from "./SuperAdmin/Pages/SuperAdminWhatsappApi";
import EmployeeNotifications from "./Employee/Pages/EmployeeNotifications";
import EmployeeAdminOtherRequest from "./EmployeeAdmin/Pages/EmployeeAdminOtherRequest";
import EmployeeAdminNews from "./EmployeeAdmin/Pages/EmployeeAdminNews";
import EmployeeCompanyNews from "./Employee/Pages/EmployeeCompanyNews";
import NewsDetailView from "./EmployeeAdmin/Components/NewsDetailView";
import EditNews from "./EmployeeAdmin/Components/EditNews";
import EmployeeFeedback from "./Employee/Pages/EmployeeFeedback";
import EmployeeAdminFeedback from "./EmployeeAdmin/Pages/EmployeeAdminFeedback";
import EmployeeDocuments from "./Employee/Pages/EmployeeDocuments";
import EmployeeAdminDocuments from "./EmployeeAdmin/Pages/EmployeeAdminDocuments";
import EmployeeDocumentDetail from "./EmployeeAdmin/Components/EmployeeDocumentDetails";
import EmployeeAdminExpiredDocuments from "./EmployeeAdmin/Pages/EmployeeAdminExpiredDocuments";
import AdminNotifications from "./Admin/Pages/AdminNotifications";
import SuperAdminNotifications from "./SuperAdmin/Pages/SuperAdminNotifications";
import EmployeeAdminNotifications from "./EmployeeAdmin/Pages/EmployeeAdminNotifications";
import RecruiterNotifications from "./Recruiters/Pages/RecruiterNotifications";
import RecruiterAssignedInterviews from "./Recruiters/Pages/RecruiterAssignedInterviews";
import NotFound from "./Pages/NotFound";
import CandidateEditPage from "./Recruiters/Components/CandidateEditPage";
import RecruiterMoreJobDetails from "./Recruiters/Pages/RecruiterMoreJobDetails";
import BranchHome from "./Pages/BranchHome";
import BranchLogin from "./Pages/BranchLogin";
import BranchRegister from "./Pages/BranchRegister";
import BranchNotFound from "./Pages/BranchNotFound";
import { Navigate } from "react-router-dom";
import LowLevelCandidates from "./Recruiters/Pages/LowLevelCandidates";
import RecruiterPipelines from "./Recruiters/Pages/RecruiterPipelines";
import RecruiterLevels from "./Recruiters/Pages/RecruiterLevels";
import RecruiterMasters from "./Recruiters/Pages/RecruiterMasters";
import AdminDashboardDetails from "./Admin/Pages/AdminDashboardDetail";
import AdminEmployees from "./Admin/Pages/AdminEmployees";

const AppRoutes = () => {
  const host = window.location.hostname;

  const isMainDomain =
    host === "eramworkforce.com" ||
    host === "www.eramworkforce.com" ||
    host === "localhost" ||
    host === "127.0.0.1";

  return (
    <Routes>
      {isMainDomain ? (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/home" element={<BranchHome />} />
          <Route path="/branch-login" element={<BranchLogin />} />
          <Route path="/branch-register" element={<BranchRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<BranchHome />} />
          <Route path="/branch-login" element={<BranchLogin />} />
          <Route path="/branch-register" element={<BranchRegister />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
          <Route path="/404" element={<BranchNotFound />} />
        </>
      )}
      {/* Super Admin */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route element={<SuperMainLayout />}>
        <Route
          path="/superadmin"
          element={<ProtectedSuperAdmin element={<SuperDashboard />} />}
        />
        {/* <Route
          path="/superadmin/whatsapp"
          element={<ProtectedSuperAdmin element={<SuperAdminWhatsappApi />} />}
        /> */}
        <Route
          path="/superadmin/branches"
          element={<ProtectedSuperAdmin element={<BranchManagement />} />}
        />
        <Route
          path="/superadmin/notifications"
          element={
            <ProtectedSuperAdmin element={<SuperAdminNotifications />} />
          }
        />
        <Route
          path="/superadmin/add"
          element={<ProtectedSuperAdmin element={<AddBranch />} />}
        />
        <Route
          path="/superadmin/view/:id"
          element={<ProtectedSuperAdmin element={<ViewBranch />} />}
        />
        <Route
          path="/superadmin/edit/:id"
          element={<ProtectedSuperAdmin element={<EditBranch />} />}
        />
        <Route
          path="/superadmin/admins"
          element={<ProtectedSuperAdmin element={<AdminManagement />} />}
        />
        <Route
          path="/superadmin/settings"
          element={<ProtectedSuperAdmin element={<SuperAdminSettings />} />}
        />
      </Route>

      {/* Admin */}

      <Route element={<AdminLayout />}>
        <Route
          path="/admin/dashboard"
          element={<ProtectedAdmin element={<AdminDashboard />} />}
        />
        <Route
          path="/admin/branches"
          element={<ProtectedAdmin element={<AdminBranch />} />}
        />
        <Route
          path="/admin/recruiters"
          element={<ProtectedAdmin element={<AdminRecuiter />} />}
        />
        <Route
          path="/admin/requisitions"
          element={<ProtectedAdmin element={<AdminRequisition />} />}
        />
        <Route
          path="/admin/notifications"
          element={<ProtectedAdmin element={<AdminNotifications />} />}
        />

        <Route
          path="/admin/candidates"
          element={<ProtectedAdmin element={<AdminCandidates />} />}
        />
        <Route
          path="/admin/employees"
          element={<ProtectedAdmin element={<AdminEmployees />} />}
        />
        <Route
          path="/admin/workorder"
          element={<ProtectedAdmin element={<WorkOrder />} />}
        />
        <Route
          path="/admin/add-workorder"
          element={<ProtectedAdmin element={<AddWorkOrder />} />}
        />
        <Route
          path="/admin/view-workorder/:id"
          element={<ProtectedAdmin element={<ViewWorkOrder />} />}
        />
        <Route
          path="/admin/edit-workorder/:id"
          element={<ProtectedAdmin element={<EditWorkOrder />} />}
        />
        <Route
          path="/admin/pipeline"
          element={<ProtectedAdmin element={<Pipeline />} />}
        />
        <Route
          path="/admin/levels"
          element={<ProtectedAdmin element={<Levels />} />}
        />
        <Route
          path="/admin/masters"
          element={<ProtectedAdmin element={<Master />} />}
        />
        <Route
          path="/admin/whatsapp"
          element={<ProtectedAdmin element={<WhatsAppConfigPanel />} />}
        />
        <Route
          path="/admin/dashboard/details"
          element={<ProtectedAdmin element={<AdminDashboardDetails />} />}
        />
      </Route>

      {/* Candidate */}

      <Route element={<CandidateLayout />}>
        <Route
          path="/candidate-jobs"
          element={<ProtectedCandidate element={<CandidateJobs />} />}
        />
        <Route
          path="/candidate-jobs/:jobId"
          element={<ProtectedCandidate element={<JobDetailsPage />} />}
        />
        <Route
          path="/candidate-applied-jobs"
          element={<ProtectedCandidate element={<CandidateAppliedJobs />} />}
        />
        <Route
          path="/candidate-applied-jobs/sourced-jobs/:id"
          element={<ProtectedCandidate element={<SourcedJobDetails />} />}
        />
        <Route
          path="/candidate-applied-jobs/applied-jobs/:id"
          element={<ProtectedCandidate element={<AppliedJobDetails />} />}
        />
        <Route
          path="/candidate-settings"
          element={<ProtectedCandidate element={<CandidateSettings />} />}
        />
        <Route
          path="/candidate-documents"
          element={<ProtectedCandidate element={<CandidateDocuments />} />}
        />
        <Route
          path="/notifications"
          element={<ProtectedCandidate element={<Notifications />} />}
        />
      </Route>

      {/* Recruiter */}
      <Route element={<RecruiterLayout />}>
        <Route
          path="/recruiter/dashboard"
          element={<ProtectedRecruiter element={<RecruiterDashboard />} />}
        />
        <Route
          path="/recruiter/dashboard/details"
          element={<ProtectedRecruiter element={<RecruiterMoreJobDetails />} />}
        />
        <Route
          path="/recruiter/notifications"
          element={<ProtectedRecruiter element={<RecruiterNotifications />} />}
        />
        <Route
          path="/recruiter/jobs"
          element={<ProtectedRecruiter element={<RecruiterJobs />} />}
        />
        <Route
          path="/recruiter/jobs/create"
          element={<ProtectedRecruiter element={<AddWorkOrder />} />}
        />
        <Route
          path="/recruiter/jobs-timeline"
          element={<ProtectedRecruiter element={<RecruiterJobsTimeline />} />}
        />
        <Route
          path="/recruiter/requisition"
          element={<ProtectedRecruiter element={<RecruiterRequisition />} />}
        />
        <Route
          path="/recruiter/interviews"
          element={
            <ProtectedRecruiter element={<RecruiterAssignedInterviews />} />
          }
        />
        <Route
          path="/recruiter/requisition/add"
          element={<ProtectedRecruiter element={<AddRequisition />} />}
        />
        <Route
          path="/recruiter/requisition/edit/:id"
          element={<ProtectedRecruiter element={<EditRequisition />} />}
        />
        <Route
          path="/recruiter-jobs/:id"
          element={<ProtectedRecruiter element={<RecruiterViewJob />} />}
        />
        <Route
          path="/recruiter-jobs-timeline/:id"
          element={<ProtectedRecruiter element={<RecruiterViewTimeline />} />}
        />
        <Route
          path="/recruiter-jobs/edit/:id"
          element={<ProtectedRecruiter element={<RecruiterEditJob />} />}
        />
        <Route
          path="/recruiter/employees"
          element={<ProtectedRecruiter element={<RecruiterEmployee />} />}
        />

        <Route
          path="/recruiter/candidates"
          element={<ProtectedRecruiter element={<RecruiterCandidates />} />}
        />
        <Route
          path="/recruiter/completed-candidates"
          element={<ProtectedRecruiter element={<CompletedCandidates />} />}
        />
        <Route
          path="/recruiter/allcandidates"
          element={<ProtectedRecruiter element={<AllCandidates />} />}
        />
        <Route
          path="/recruiter/all-cvs"
          element={<ProtectedRecruiter element={<LowLevelCandidates />} />}
        />
        <Route
          path="/recruiter/allcandidates/:id"
          element={<ProtectedRecruiter element={<CandidateEditPage />} />}
        />
        <Route
          path="/recruiter/staged-candidates"
          element={
            <ProtectedRecruiter element={<RecruiterStagedCandidates />} />
          }
        />
        <Route
          path="/recruiter/pipeline/:id"
          element={<ProtectedRecruiter element={<RecruiterJobPipeline />} />}
        />
        <Route
          path="/recruiter/approvals"
          element={<ProtectedRecruiter element={<RecruiterApprovals />} />}
        />
        <Route
          path="/recruiter/pipelines"
          element={<ProtectedRecruiter element={<RecruiterPipelines />} />}
        />
        <Route
          path="/recruiter/levels"
          element={<ProtectedRecruiter element={<RecruiterLevels />} />}
        />
        <Route
          path="/recruiter/masters"
          element={<ProtectedRecruiter element={<RecruiterMasters />} />}
        />
      </Route>

      {/* Employee */}

      <Route element={<EmployeeLayout />}>
        <Route
          path="/employee/raise-request"
          element={<ProtectedEmployee element={<EmployeeRaiseRequest />} />}
        />
        <Route
          path="/employee/leave-request"
          element={<ProtectedEmployee element={<EmployeeLeaveRequest />} />}
        />
        <Route
          path="/employee/payroll"
          element={<ProtectedEmployee element={<EmployeePayroll />} />}
        />
        <Route
          path="/employee/company-policy"
          element={<ProtectedEmployee element={<EmployeeCompanyPolicy />} />}
        />

        <Route
          path="/employee/company-news"
          element={<ProtectedEmployee element={<EmployeeCompanyNews />} />}
        />
        <Route
          path="/employee/feedback"
          element={<ProtectedEmployee element={<EmployeeFeedback />} />}
        />
        <Route
          path="/employee/notifications"
          element={<ProtectedEmployee element={<EmployeeNotifications />} />}
        />
        <Route
          path="/employee/profile-settings"
          element={<ProtectedEmployee element={<EmployeeProfileSettings />} />}
        />
        <Route
          path="/employee/documents"
          element={<ProtectedEmployee element={<EmployeeDocuments />} />}
        />

        <Route
          path="/employee/feedback"
          element={<ProtectedEmployee element={<EmployeeFeedback />} />}
        />
      </Route>

      <Route element={<EmployeeAdminLayout />}>
        <Route
          path="/employee-admin/dashboard"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminDashboard />} />
          }
        />
        <Route
          path="/employee-admin/all-employees"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminAllEmployees />} />
          }
        />
        <Route
          path="/employee-admin/leave-request"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminLeaveRequest />} />
          }
        />
        <Route
          path="/employee-admin/other-request"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminOtherRequest />} />
          }
        />
        <Route
          path="/employee-admin/company-policy"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminCompanyPolicy />} />
          }
        />
        <Route
          path="/employee-admin/documents"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminDocuments />} />
          }
        />
        <Route
          path="/employee-admin/exp-documents"
          element={
            <ProtectedEmployeeAdmin
              element={<EmployeeAdminExpiredDocuments />}
            />
          }
        />
        <Route
          path="/employee-admin/documents/:id"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeDocumentDetail />} />
          }
        />
        <Route
          path="/employee-admin/news"
          element={<ProtectedEmployeeAdmin element={<EmployeeAdminNews />} />}
        />
        <Route
          path="/employee-admin/notifications"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminNotifications />} />
          }
        />

        <Route
          path="/employee-admin/news/edit/:id"
          element={<ProtectedEmployeeAdmin element={<EditNews />} />}
        />
        <Route
          path="/employee-admin/news/view/:id"
          element={<ProtectedEmployeeAdmin element={<NewsDetailView />} />}
        />
        <Route
          path="/employee-admin/feedback"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminFeedback />} />
          }
        />
        <Route
          path="/employee-admin/payroll"
          element={
            <ProtectedEmployeeAdmin element={<EmployeeAdminPayroll />} />
          }
        />
      </Route>

      {/* Hr */}
      <Route path="/hr/dashboard" element={<HrDashboard />} />
      <Route path="/hr/pay-roll" element={<HrPayroll />} />
      <Route path="/hr/employees" element={<HrEmployees />} />
    </Routes>
  );
};

export default AppRoutes;

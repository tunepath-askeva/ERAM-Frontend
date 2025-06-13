import { Routes, Route } from "react-router-dom";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
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
import RecruiterPayroll from "./Recruiters/Pages/RecruiterPayroll";
import RecruiterLayout from "./Recruiters/Global/RecruiterLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/branches" element={<Branches />} />

      {/* Super Admin */}
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route element={<SuperMainLayout />}>
        <Route
          path="/superadmin"
          element={<ProtectedSuperAdmin element={<SuperDashboard />} />}
        />
        <Route
          path="/superadmin/branches"
          element={<ProtectedSuperAdmin element={<BranchManagement />} />}
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
          path="/admin/candidates"
          element={<ProtectedAdmin element={<AdminCandidates />} />}
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
          path="/admin/masters"
          element={<ProtectedAdmin element={<Master />} />}
        />
      </Route>

      {/* Candidate */}

      <Route element={<CandidateLayout />}>
        <Route path="/candidate-jobs" element={<CandidateJobs />} />
        <Route path="/candidate-applied-jobs/:jobId" element={<JobDetailsPage />} />-
        <Route
          path="/candidate-applied-jobs"
          element={<CandidateAppliedJobs />}
        />
        <Route path="/candidate-settings" element={<CandidateSettings />} />-
      </Route>

      <Route element={<RecruiterLayout />}>
        <Route
          path="/recruiter/dashboard"
          element={<ProtectedRecruiter element={<RecruiterDashboard />} />}
        />
        <Route
          path="/recruiter/jobs"
          element={<ProtectedRecruiter element={<RecruiterJobs />} />}
        />
        <Route
          path="/recruiter/employees"
          element={<ProtectedRecruiter element={<RecruiterEmployee />} />}
        />
        <Route
          path="/recruiter/payroll"
          element={<ProtectedRecruiter element={<RecruiterPayroll />} />}
        />
        <Route
          path="/recruiter/candidates"
          element={<ProtectedRecruiter element={<RecruiterCandidates />} />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

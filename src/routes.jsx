import { Routes, Route } from "react-router-dom";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Home from "./Pages/Home";
import About from "./Pages/About";
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

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
          path="/admin/workorder"
          element={<ProtectedAdmin element={<WorkOrder />} />}
        />
        <Route
          path="/admin/pipeline"
          element={<ProtectedAdmin element={<Pipeline />} />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

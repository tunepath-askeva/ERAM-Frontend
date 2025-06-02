import { Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<SuperMainLayout />}>
        <Route path="/superadmin" element={<SuperDashboard />} />
        <Route path="/superadmin/branches" element={<BranchManagement />} />
        <Route path="/superadmin/add" element={<AddBranch />} />
        <Route path="/superadmin/view/:id" element={<ViewBranch />} />
        <Route path="/superadmin/edit/:id" element={<EditBranch />} />
        <Route path="/superadmin/admins" element={<AdminManagement />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

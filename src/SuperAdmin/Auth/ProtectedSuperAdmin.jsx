import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedSuperAdmin = ({ element }) => {
  const { superAdminInfo } = useSelector((state) => state.superAdminAuth);
  if (!superAdminInfo) {
    return <Navigate to="/superadmin/login" />;
  }
  return element;
};

export default ProtectedSuperAdmin;

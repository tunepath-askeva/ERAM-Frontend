import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedAdmin = ({ element }) => {
  const { adminInfo } = useSelector((state) => state.userAuth);
  if (!adminInfo) {
    return <Navigate to="/login" />;
  }
  return element;
};

export default ProtectedAdmin;
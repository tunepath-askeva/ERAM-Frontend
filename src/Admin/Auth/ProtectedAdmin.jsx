import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdmin = ({ element }) => {
  const adminInfo = useSelector((state) => state.userAuth.adminInfo);

  if (!adminInfo) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedAdmin;

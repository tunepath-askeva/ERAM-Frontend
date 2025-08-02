import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedEmployeeAdmin = ({ element }) => {
  const employeeInfo = useSelector((state) => state.userAuth.recruiterInfo);

  if (!employeeInfo) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedEmployeeAdmin;

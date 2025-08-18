import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedEmployee = ({ element }) => {
  const employeeInfo = useSelector((state) => state.userAuth.employeeInfo);

  if (!employeeInfo) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedEmployee;

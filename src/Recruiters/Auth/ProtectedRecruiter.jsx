import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRecruiter = ({ element }) => {
  const recruiterInfo = useSelector((state) => state.userAuth.recruiterInfo);

  if (!recruiterInfo) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRecruiter;

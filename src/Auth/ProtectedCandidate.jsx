import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedCandidate = ({ element }) => {
  const candidateInfo = useSelector((state) => state.userAuth.candidateInfo);

  if (!candidateInfo) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedCandidate;

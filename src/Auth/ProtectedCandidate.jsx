import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedCandidate = ({ element }) => {
  const candidateInfo = useSelector((state) => state.userAuth.candidateInfo);

  if (!candidateInfo) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedCandidate;

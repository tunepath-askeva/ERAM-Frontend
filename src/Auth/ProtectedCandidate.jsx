import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { useValidateUserTokenQuery } from "../Slices/Users/UserApis";
import { useLogoutSuperAdminMutation } from "../Slices/SuperAdmin/SuperAdminApis";
import { userLogout } from "../Slices/Users/UserSlice";

const ProtectedCandidate = ({ element }) => {
  const dispatch = useDispatch();
  const candidateInfo = useSelector((state) => state.userAuth.candidateInfo);
  const hasLoggedOut = useRef(false);

  const { isLoading, isError } = useValidateUserTokenQuery(undefined, {
    skip: !candidateInfo,
  });

  const [logoutCandidate] = useLogoutSuperAdminMutation(); 

  useEffect(() => {
    // Handle token validation error
    if (isError && candidateInfo && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      dispatch(userLogout({ role: "candidate" })); 
      return;
    }

    // Handle missing candidateInfo
    if (!candidateInfo && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      logoutCandidate(); 
    }
  }, [isError, candidateInfo, dispatch, logoutCandidate]);

  // Reset the flag when candidateInfo becomes available again
  useEffect(() => {
    if (candidateInfo) {
      hasLoggedOut.current = false;
    }
  }, [candidateInfo]);

  if (!candidateInfo || isError) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedCandidate;
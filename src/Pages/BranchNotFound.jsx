import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAllUserData, userLogout } from "../Slices/Users/UserSlice";
import { SuperAdminlogout } from "../Slices/SuperAdmin/SuperAdminSlice";
import { useEffect } from "react";

const BranchNotFound = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminInfo = useSelector((state) => state.userAuth.adminInfo);
  const candidateInfo = useSelector((state) => state.userAuth.candidateInfo);
  const employeeInfo = useSelector((state) => state.userAuth.employeeInfo);
  const recruiterInfo = useSelector((state) => state.userAuth.recruiterInfo);
  const superAdminInfo = useSelector(
    (state) => state.superAdminAuth.superAdminInfo
  );

  const getUserRole = () => {
    if (superAdminInfo) return "super_admin";
    if (adminInfo) return "admin";
    if (recruiterInfo) return "recruiter";
    if (employeeInfo) return "employee";
    if (candidateInfo) return "candidate";
    return null;
  };

  const handleGoHome = () => {
    const role = getUserRole();

    if (role) {
      if (role === "super_admin") {
        dispatch(SuperAdminlogout());
      } else {
        dispatch(userLogout({ role }));
      }
    }

    navigate("/home");
  };

  useEffect(() => {
    document.body.classList.add("page-404");
    return () => {
      document.body.classList.remove("page-404");
    };
  }, []);

  return (
    <>
      <div className="not-found-container">
        <div className="content-wrapper">
          <div className="error-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>

          <h1 className="error-code">404</h1>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-description">
            The page you're looking for doesn't exist or you don't have
            permission to access it.
          </p>

          <button className="btn-home" onClick={handleGoHome}>
            Return to Login
          </button>
        </div>
      </div>

      <style jsx>
        {`
          .page-404 {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              sans-serif;
            background: #fafafa;
          }

          .not-found-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .content-wrapper {
            text-align: center;
            max-width: 500px;
          }

          .error-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            color: #da2c46;
            opacity: 0.8;
          }

          .error-icon svg {
            width: 100%;
            height: 100%;
          }

          .error-code {
            font-size: 8rem;
            font-weight: 700;
            color: #da2c46;
            margin: 0 0 1rem;
            line-height: 1;
            letter-spacing: -0.05em;
          }

          .error-title {
            font-size: 2rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 1rem;
          }

          .error-description {
            font-size: 1.1rem;
            color: #718096;
            margin: 0 0 3rem;
            line-height: 1.6;
          }

          .btn-home {
            background: #da2c46;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 1rem 2rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(218, 44, 70, 0.2);
          }

          .btn-home:hover {
            background: #c02540;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(218, 44, 70, 0.3);
          }

          .btn-home:active {
            transform: translateY(0);
          }

          @media (max-width: 768px) {
            .error-code {
              font-size: 6rem;
            }

            .error-title {
              font-size: 1.5rem;
            }

            .error-description {
              font-size: 1rem;
            }

            .content-wrapper {
              padding: 1rem;
            }
          }
        `}
      </style>
    </>
  );
};

export default BranchNotFound;

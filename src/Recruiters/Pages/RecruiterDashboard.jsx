import { useGetDashboardDataQuery } from "../../Slices/Recruiter/RecruiterApis";
const RecruiterDashboard = () => {
  const { data } = useGetDashboardDataQuery();
  return <h1>Recruiter Dashboard</h1>;
};

export default RecruiterDashboard;

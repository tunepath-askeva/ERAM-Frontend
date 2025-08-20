import { useGetEmployeeAdminDashboardQuery } from "../../Slices/Employee/EmployeeApis";

const EmployeeAdminDashboard = () => {
  const { data } = useGetEmployeeAdminDashboardQuery();

  return <h1>Employee Admin Dashboard</h1>;
};

export default EmployeeAdminDashboard;

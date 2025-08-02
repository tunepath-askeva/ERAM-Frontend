import { useGetEmployeeAdminLeaveHistoryQuery } from "../../Slices/Employee/EmployeeApis";

const EmployeeAdminLeaveRequest = () => {
  const { data } = useGetEmployeeAdminLeaveHistoryQuery();
  return <h1>Employee Admin Leave Request</h1>;
};

export default EmployeeAdminLeaveRequest;

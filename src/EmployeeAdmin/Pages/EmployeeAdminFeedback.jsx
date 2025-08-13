import { useGetFeedbacksQuery } from "../../Slices/Employee/EmployeeApis";

const EmployeeAdminFeedback = () => {
  const { data } = useGetFeedbacksQuery();
  return <h1>Employee Admin Feedback/Suggestion</h1>;
};

export default EmployeeAdminFeedback;

import { useGetExpiredDocumentsQuery } from "../../Slices/Employee/EmployeeApis";

const EmployeeAdminExpiredDocuments = () => {
  const { data } = useGetExpiredDocumentsQuery();
  console.log(data, "sadasd")
  return <h1>Employee Admin Expired Documents</h1>;
};

export default EmployeeAdminExpiredDocuments;

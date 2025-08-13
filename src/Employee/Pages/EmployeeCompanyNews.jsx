import { useGetCompanyNewsQuery } from "../../Slices/Employee/EmployeeApis";

const EmployeeCompanyNews = () => {
  const { data: companyNews } = useGetCompanyNewsQuery();

  return <h1>Employee Company news</h1>;
};

export default EmployeeCompanyNews;

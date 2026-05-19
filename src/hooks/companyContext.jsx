import  {createContext, useContext, useEffect, useState} from 'react';
import axiosInstance from "../utils/axiosInstance";

const CompanyProfileContext = createContext();

export const CompanyProfileProvider = ({children}) => {
  const [company, setCompany] = useState(
      null);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/companies/me`);
      console.log(response.data);
      setCompany(response.data.data);
    } catch (e) {
      console.error("Company API Error:", e);
    }
  };

  useEffect(() => {
      fetchData();
  }, []);
  return (
      <CompanyProfileContext.Provider value={{company, setCompany}}>
        {children}
      </CompanyProfileContext.Provider>
  );
};

export const useCompanyProfile = () => useContext(CompanyProfileContext);
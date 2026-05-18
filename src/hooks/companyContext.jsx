import  {createContext, useContext, useEffect, useState} from 'react';
import axiosInstance from "../utils/axiosInstance";
import {getCompany, hasCompany} from "../utils/auth";

// 1. Context 생성
const CompanyProfileContext = createContext();

// 2. Provider 컴포넌트
export const CompanyProfileProvider = ({children}) => {
  const [company, setCompany] = useState(
      null);

  const fetchAllData = async () => {
    const companyId = getCompany();
    try {
      const response = await axiosInstance.get(`/companies/${companyId}`);
      console.log(response.data);
      setCompany(response.data.data);
    } catch (e) {
      console.error("Company API Error:", e);
    }
  };

  useEffect(() => {
    if (hasCompany()) {
      fetchAllData();
    }
  }, []);
  return (
      <CompanyProfileContext.Provider value={{company, setCompany}}>
        {children}
      </CompanyProfileContext.Provider>
  );
};

export const useCompanyProfile = () => useContext(CompanyProfileContext);
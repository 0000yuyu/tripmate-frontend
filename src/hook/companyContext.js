import React, {createContext, useContext, useEffect, useState} from 'react';
import axiosInstance from "../util/axiosInstance";
import {getCompany, hasCompany} from "../util/auth";

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

  // 프로필 수정을 위한 함수도 Context에 담을 수 있습니다.
  const updateName = (newName) => {
    setUser(prev => ({...prev, name: newName}));
  };

  return (
      <CompanyProfileContext.Provider value={{company, setCompany}}>
        {children}
      </CompanyProfileContext.Provider>
  );
};

export const useCompanyProfile = () => useContext(CompanyProfileContext);
import  {createContext, useContext, useEffect, useState} from 'react';
import axiosInstance from "../utils/axiosInstance";
import {isLoggedIn} from "../utils/auth";

// 1. Context 생성
const ProfileContext = createContext();

// 2. Provider 컴포넌트
export const ProfileProvider = ({children}) => {
  const [user, setUser] = useState({
    name: "홍길동",
    email: "hong@example.com",
  });

  const fetchAllData = async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      console.log(response.data);
      setUser(response.data.data);
    } catch (e) {
      console.error("Profile API Error:", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn()) {
      fetchAllData();
    }
  }, []);

  // 프로필 수정을 위한 함수도 Context에 담을 수 있습니다.
  const updateName = (newName) => {
    setUser(prev => ({...prev, name: newName}));
  };

  return (
      <ProfileContext.Provider value={{user, setUser, updateName}}>
        {children}
      </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
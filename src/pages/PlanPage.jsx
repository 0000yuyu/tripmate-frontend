import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { message } from 'antd';
import {PlanFormView} from "@components/PostDetailView/PlanFormView.jsx";

const PlanCreatePage = () => {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    try {
      await axiosInstance.post(`/plans`, payload);
      message.success("✈️ 투어 패키지 일정이 성공적으로 플랫폼에 게시되었습니다!");
      navigate('/plans');
    } catch (e) {
      message.error("일정 게시 중 서버 통신 에러가 발생했습니다.");
      throw e;
    }
  };

  return (
      <div className="w-full bg-[#F9FAFB]">
        <PlanFormView mode="create" onSave={handleCreate} />
      </div>
  );
};

export default PlanCreatePage;
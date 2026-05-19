import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { Mail, Lock } from 'lucide-react';
import axios from "../utils/axiosInstance";
import axiosInstance from "../utils/axiosInstance";
import { requestForToken } from "../hooks/usePushManager";
import LogoImg from '@/assets/images/logo.png';
import CustomModal from "@components/CustomModal.jsx";
import { setTokens } from "@utils/auth.js";

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 모달 제어를 위한 제반 상태 정의
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState('SUCCESS'); // SUCCESS 또는 ERROR 분류

  // 로그인 처리 핸들러
  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);

    try {
      // 로그인 API 호출
      const accessToken = await login(email, password);

      if (accessToken) {
        // 로그인 성공 시 모달 상태 세팅
        setModalType('SUCCESS');
        setModalTitle('로그인 성공');
        setModalContent('로그인에 성공하였습니다. 메인 페이지로 이동하시겠습니까?');
        setIsModalOpen(true);
      } else {
        // 로그인 실패 시 모달 알림
        setModalType('ERROR');
        setModalTitle('로그인 실패');
        setModalContent('아이디 또는 비밀번호를 다시 확인해주세요.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      setModalType('ERROR');
      setModalTitle('로그인 에러');
      setModalContent(error.message || '로그인 중 예기치 못한 에러가 발생했습니다.');
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 버튼 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
      <div className='flex absolute top-0 left-0 right-0 bg-white z-[100] justify-center items-center h-full w-full p-4 overflow-y-auto'>
        <div className='flex flex-col gap-2 w-full max-w-[400px] items-center my-8'>

          {/* 로고 영역 */}
          <div className="flex items-center justify-center gap-2 w-full py-[20px]">
            <img className="h-[70px] object-contain" src={LogoImg} alt="Logo" />
          </div>

          {/* Ant Design Form */}
          <Form
              form={form}
              name="login_form"
              layout="vertical"
              onFinish={handleLogin}
              className="w-full"
              requiredMark={false}
          >
            <Form.Item
                name="email"
                rules={[
                  { required: true, message: '이메일을 입력해주세요.' },
                  { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
                ]}
            >
              <Input
                  prefix={<Mail size={18} className="text-gray-400 mr-1" />}
                  placeholder="이메일을 입력하세요"
                  className="py-[10px] rounded-[12px]"
              />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
            >
              <Input.Password
                  prefix={<Lock size={18} className="text-gray-400 mr-1" />}
                  placeholder="비밀번호를 입력하세요"
                  className="py-[10px] rounded-[12px]"
              />
            </Form.Item>

            <Form.Item className="mt-6">
              <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-[48px] bg-blue-600 hover:bg-blue-500 rounded-[12px] font-bold text-base border-none shadow-md"
              >
                로그인
              </Button>
            </Form.Item>
          </Form>

          {/* 하단 푸터 링크 */}
          <div className='mt-2 w-full flex flex-row justify-between text-sm text-gray-500 px-1'>
            <Link to='/membership' className='hover:underline text-gray-600'>
              회원가입
            </Link>
            <div className='flex gap-5'>
              <Link to='/find-id' className='hover:underline text-gray-600'>
                아이디 찾기
              </Link>
              <Link to='/find-password' className='hover:underline text-gray-600'>
                비밀번호 찾기
              </Link>
            </div>
          </div>

        </div>

        {/* 4. 공통 모달 마운트 (buttons 매개변수 구조로 전면 교체) */}
        <CustomModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            title={modalTitle}
            buttons={
              modalType === 'SUCCESS' ? (
                  <div className="flex gap-2 w-full">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-[14px] text-xs font-bold hover:bg-gray-200 transition-colors"
                    >
                      머무르기
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate('/');
                        }}
                        className="flex-[2] py-3 bg-blue-600 text-white rounded-[14px] text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm"
                    >
                      이동하기
                    </button>
                  </div>
              ) : (
                  // 실패했을 때 띄울 가로 100% 꽉 차는 단일 확인 버튼 (시안 스타일 가이드 일치)
                  <button
                      type="button"
                      onClick={handleModalClose}
                      className="w-full py-3 bg-[#FF4D4D] hover:bg-red-600 text-white rounded-[14px] text-xs font-black transition-colors shadow-md"
                  >
                    확인
                  </button>
              )
            }
        >
          <p className="text-gray-700 font-medium text-center py-2">{modalContent}</p>
        </CustomModal>
      </div>
  );
}

export async function login(user_id, password) {
  try {
    const response = await axios.post('/auth/login', {
      email: user_id,
      password,
    });
    const data = await response.data;
    if (data && (data.success || data.accessToken)) {
      const accessToken = data.data?.accessToken || data.accessToken;
      const refreshToken = data.data?.refreshToken || data.refreshToken;
      setTokens(accessToken, refreshToken);
      return accessToken;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
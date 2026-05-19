import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Button, message } from 'antd';
import { Mail, Lock, User, Calendar, ShieldAlert } from 'lucide-react';
import axiosInstance from "../utils/axiosInstance";
import { requestForToken } from "../hooks/usePushManager";
import LogoImg from '../assets/images/logo.png';

export default function MembershipPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 회원가입 제출 핸들러
  const handleSignUp = async (values) => {
    setLoading(true);
    try {
      // antd DatePicker 객체를 백엔드 전송용 문자열(YYYY-MM-DD)로 변환
      const payload = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
      };

      // 1. 회원가입 API 호출
      const response = await axiosInstance.post("/users/signup", payload);

      // 토큰 위치는 백엔드 응답 구조에 맞게 수정이 필요할 수 있습니다 (예: response.data.accessToken)
      const accessToken = response?.data?.accessToken || response?.data;

      if (accessToken) {
        // 2. 푸시 알림 토큰 등록 (기존 로직 유지)
        try {
          const deviceData = await requestForToken();
          if (deviceData) {
            await axiosInstance.post(
                "/notifications/tokens/me",
                { ...deviceData, channelType: "PUSH" },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            console.log("FCM 토큰 갱신 성공");
          }
        } catch (pushError) {
          console.error("푸시 토큰 등록 실패:", pushError);
        }

        message.success('회원가입이 완료되었습니다!');
        navigate('/');
      } else {
        message.error('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || '회원가입 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className='flex absolute top-0 left-0 right-0 bg-white z-[100] justify-center items-center h-full w-full p-4 overflow-y-auto'>
        <div className='flex flex-col gap-2 w-full max-w-[400px] items-center my-8'>

          {/* 로고 영역 */}
          <div className="flex items-center justify-center gap-2 w-full py-[20px]">
            <img className="h-[70px] object-contain" src={LogoImg} alt="Logo" />
          </div>

          {/* Ant Design Form 시작 */}
          <Form
              form={form}
              name="membership_form"
              layout="vertical"
              onFinish={handleSignUp}
              className="w-full"
              requiredMark={false}
          >
            {/* 이메일 (아이디) */}
            <Form.Item
                name="email"
                rules={[
                  { required: true, message: '이메일을 입력해주세요.' },
                  { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
                ]}
            >
              <Input
                  prefix={<Mail size={18} className="text-gray-400 mr-1" />}
                  placeholder="이메일(아이디)을 입력하세요"
                  className="py-[10px] rounded-[12px]"
              />
            </Form.Item>

            {/* 비밀번호 */}
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

            {/* 이름 */}
            <Form.Item
                name="name"
                rules={[{ required: true, message: '이름을 입력해주세요.' }]}
            >
              <Input
                  prefix={<User size={18} className="text-gray-400 mr-1" />}
                  placeholder="이름을 입력하세요"
                  className="py-[10px] rounded-[12px]"
              />
            </Form.Item>

            {/* 성별 (드롭다운) */}
            <Form.Item
                name="gender"
                rules={[{ required: true, message: '성별을 선택해주세요.' }]}
            >
              <Select
                  placeholder="성별 선택"
                  className="h-[44px] rounded-[12px]"
                  options={[
                    { value: 'MALE', label: '남성' },
                    { value: 'FEMALE', label: '여성' }
                  ]}
              />
            </Form.Item>

            {/* 생년월일 (날짜 선택) */}
            <Form.Item
                name="birthDate"
                rules={[{ required: true, message: '생년월일을 선택해주세요.' }]}
            >
              <DatePicker
                  placeholder="생년월일 선택"
                  suffixIcon={<Calendar size={18} className="text-gray-400" />}
                  className="w-full h-[44px] rounded-[12px]"
              />
            </Form.Item>

            {/* 역할 (드롭다운) */}
            <Form.Item
                name="role"
                rules={[{ required: true, message: '역할을 선택해주세요.' }]}
            >
              <Select
                  placeholder="사용자 역할 선택"
                  suffixIcon={<ShieldAlert size={18} className="text-gray-400" />}
                  className="h-[44px] rounded-[12px]"
                  options={[
                    { value: 'USER', label: '일반 회원' },
                    { value: 'ADMIN', label: '관리자' }
                  ]}
              />
            </Form.Item>

            {/* 제출 버튼 */}
            <Form.Item className="mt-6">
              <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-[48px] bg-blue-600 hover:bg-blue-500 rounded-[12px] font-bold text-base border-none shadow-md"
              >
                회원가입 완료
              </Button>
            </Form.Item>
          </Form>

          {/* 하단 푸터 링크 */}
          <div className="mt-2 w-full flex flex-row justify-between text-sm text-gray-500 px-1">
            <Link to='/login' className='hover:underline'>
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>

        </div>
      </div>
  );
}
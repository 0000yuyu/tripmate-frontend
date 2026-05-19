import React, {useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import LogoImg from '@/src/assets/images/logo.png'
import {notificationService, userService} from "@/src/services/index.js";
import {requestForToken} from "@/src/hooks/usePushManager.jsx";
import axiosInstance from "@/src/services/axiosInstance.js";

function Form({children}) {
  return (
      <div
          className='flex max-md:gap-3 max-md:flex-col max-md:items-center gap-10 text-transparent3 items-start justify-center w-full'>
        {children}
      </div>
  );
}

function FormContent({children}) {
  return <div
      className='my-5 flex flex-col gap-2 w-[350px] items-end'>{children}</div>;
}

function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  inputRef,
  message,
}) {
  return (
      <div className='flex gap-4 w-full'>
        <div className='relative w-full'>
          <input
              ref={inputRef}
              className={`shadow appearance-none border ${
                  message?.type === 'error' && 'border-error'
              } rounded-[12px] py-[12px] px-2 w-full leading-tight focus:outline-none focus:shadow-outline`}
              id={id}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
          />
        </div>
      </div>
  );
}

function FormFooter({children}) {
  return (
      <div
          className='mt-4 w-full flex-row flex gap-2 justify-between'>
        {children}
      </div>
  );
}

function SubmitButton({onClick, disabled, children}) {
  return (
      <div className='flex items-center justify-between max-md:w-full w-full'>
        <button
            className='bg-blue-600 w-full py-[12px] rounded-[12px] disabled:bg-transparent1 disabled:pointer-events-none hover:opacity-55 text-white font-bold px-20 focus:outline-none focus:shadow-outline'
            type='button'
            disabled={disabled}
            onClick={onClick}
        >
          {children}
        </button>
      </div>
  );
}

export default function LoginView() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  // const { setUserProfile } = userDataStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState({id: '', password: ''});
  const idRef = useRef(null);
  const passwordRef = useRef(null);

  // 모달 관련 상태
  const [modal_open, set_modal_open] = useState(false);
  const [modal_message, set_modal_message] = useState('');

  const handleLogin = async () => {
    console.log(messages);
    const newMessages = {id: '', password: ''};
    let hasError = false;

    if (id === '') {
      newMessages.id = {type: 'error', text: '아이디를 입력해주세요.'};
      hasError = true;
    }

    if (password === '') {
      newMessages.password = {
        type: 'error',
        text: '비밀번호를 입력해주세요.',
      };
      hasError = true;
    }

    setMessages(newMessages);

    if (hasError) {
      if (newMessages.id) {
        idRef.current?.focus();
      } else if (newMessages.password) {
        passwordRef.current?.focus();
      }
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/login",{email:id,password});
      console.log(response)
      // if (accessToken) {
      //   // try {
      //   //   const deviceData = await requestForToken();
      //   //   if (deviceData) {
      //   //     const response = await notificationService.registerToken(deviceData);
      //   //     console.log("토큰 갱신 성공 : ", response);
      //   //   }
      //   // } catch (e) {
      //   //
      //   // }
        const userData = await userService.getMe();
      console.log(userData)
      //   setUserProfile(userData);
      //
      //   // 로그인 성공 -> 모달 띄움
      //   // set_modal_message('로그인에 성공했습니다!');
      //   alert('로그인에 성공하였습니다.');
      //   navigate('/');
      //   // set_modal_open(true);
      // } else {
      //   // 로그인 실패 -> 모달 띄움
      //   alert('아이디 또는 비밀번호를 확인해주세요.');
      //   // set_modal_open(true);
      // }
    } catch (error) {
      alert('로그인 중 에러가 발생했습니다: ' + error.message);
      // set_modal_open(true);
    }
  };

  const handleModalClose = () => {
    set_modal_open(false);
    // 로그인 성공했을 때는 메인으로 이동
    if (modal_message === '로그인에 성공했습니다!') {
      navigate('/');
    }
  };

  return (
      <div
          className='inset-0 fixed top-0 w-screen h-screen z-50 bg-white bottom-0 flex left-0 right-0 justify-center items-center'>
        <Form>
          <FormContent>
            <div
                className="flex items-center justify-center gap-2 w-full py-[20px]">
              <img className={"h-[70px]"} src={LogoImg}/>

            </div>
            <Input
                inputRef={idRef}
                id='id'
                label='아이디'
                type='text'
                placeholder='아이디를 입력하세요'
                value={id}
                message={messages.id}
                onChange={(e) => {
                  setId(e.target.value);
                  setMessages((prev) => ({...prev, id: null}));
                }}
            />
            <Input
                inputRef={passwordRef}
                id='password'
                label='비밀번호'
                type='password'
                placeholder='비밀번호를 입력하세요'
                value={password}
                message={messages.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMessages((prev) => ({...prev, password: null}));
                }}
            />

            <SubmitButton onClick={handleLogin}>로그인</SubmitButton>
            <FormFooter>
              <Link
                  to='/membership'
                  className='text-sm text-gray-600 hover:underline'
              >
                회원가입
              </Link>
              <div className='flex gap-5'>
                <Link
                    to='/find-id'
                    className='text-sm text-gray-600 hover:underline'
                >
                  아이디 찾기
                </Link>
                <Link
                    to='/find-password'
                    className='text-sm text-gray-600 hover:underline'
                >
                  비밀번호 찾기
                </Link>
              </div>
            </FormFooter>
          </FormContent>
        </Form>

        {modal_open && (
            <Modal title='로그인 성공' onClose={handleModalClose}>
              <span>메인 페이지로 이동하시겠습니까?</span>
              <button
                  onClick={handleModalClose}
                  className='bg-base1 hover:opacity-75 text-white font-bold py-2 px-6 rounded'
              >
                확인
              </button>
            </Modal>
        )}
      </div>
  );
}
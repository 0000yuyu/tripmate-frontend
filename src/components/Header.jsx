import {useState} from "react";
import {useNavigate} from "react-router-dom";
import LogoRowImg from "../assets/logo_row.png";
import {CiUser} from "react-icons/ci";
import {IoIosNotificationsOutline} from "react-icons/io";

const TABS = ["홈", "일정", "상품", "매칭"];
const tapMap = {
  "홈": "/",
  "일정": "/plans",
  "상품": "/products",
  "매칭": "/matching",
}

export default function Header({activeTab, onTabChange}) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
      <header className="bg-white h-[60px] sticky top-0 z-40 shadow-sm">
        <div
            className="h-full px-4 py-[5px] flex items-center justify-between">
          {/* Logo */}
          <div className="h-full flex justify-center items-center px-[30px] gap-2">
            <img className={"w-[100px] h-full py-[10px]"}
                 src={LogoRowImg}/>
          </div>

          <div className="flex-1 h-full gap-[10px] items-center px-[10px] py-[20px] flex">
            {TABS.map((t) => (
                <button
                    key={t}
                    onClick={() => {
                      onTabChange(t)
                      navigate(tapMap[t])
                    }}
                    className={`tab-btn flex px-[15px] py-[10px] text-sm font-medium text-gray-500 transition-all ${
                        activeTab === t ? "active" : ""
                    }`}
                >
                  {t}
                </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex h-full px-[30px] items-center gap-1">
            <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-600 hover:text-blue-500"
            >
            </button>
            <button className="text-gray-600 hover:text-blue-500"
                    onClick={() => navigate("/notifications")}>
              <CiUser color={"black"}  strokeWidth={0.5} size={25}/>
            </button>
            {/* 알림 */}
            <button className="text-gray-600 hover:text-blue-500"
                    onClick={() => navigate("/notifications")}>
              <IoIosNotificationsOutline strokeWidth={2} color={"black"} size={25}/>
            </button>
          </div>
        </div>


      </header>
  );
}

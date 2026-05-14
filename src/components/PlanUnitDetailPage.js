import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosInstance from "../util/axiosInstance";

export default function PlanUnitDetailCard() {
  const {plan_id, unit_id} = useParams();
  const [planData, setPlanData] = useState([]);
  console.log(plan_id);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const response = await axiosInstance.get(`/feeds/${unit_id}`);
    console.log(response)
    setPlanData(response.data.data.responses)
    console.log(response.data.data.responses)
  }
  return <div>
    {
      planData.map((unit) =>
          <div>
            <img src={unit.imageUrls[0]} alt={"여행 이미지"}/>
          </div>
      )
    }
  </div>
}
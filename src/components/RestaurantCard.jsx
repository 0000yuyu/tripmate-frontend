import {Badge, HeartButton, StarRating} from "./UI";
import {Link} from "react-router-dom"

/* ─── Grid Card ─── */
export function RestaurantCard({restaurant, onClick}) {
  return (
      <div
          className="restaurant-card bg-white rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => onClick(restaurant)}
      >
        <div className="relative">
          <img
              src={restaurant.img}
              alt={restaurant.name}
              className="w-full h-48 object-cover"
          />
          <HeartButton liked={restaurant.liked}/>
          {restaurant.badge && (
              <div className="absolute top-3 left-3">
                <Badge type={restaurant.badge}/>
              </div>
          )}
          <div
              className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            📍 {restaurant.location}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
            <span className="text-xs text-gray-500 font-medium">
              {restaurant.category}
            </span>
              <h3 className="font-bold text-gray-900 text-base leading-tight mt-0.5">
                {restaurant.name}
              </h3>
            </div>
            <StarRating rating={restaurant.rating}/>
          </div>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {restaurant.desc}
          </p>

          <div
              className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-700">
            ₩ {restaurant.price}
          </span>
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    restaurant.wait === "예약 가능"
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-600"
                }`}
            >
            {restaurant.wait}
          </span>
          </div>

          {restaurant.seats.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {restaurant.seats.slice(0, 3).map((t) => (
                    <span
                        key={t}
                        className="text-xs border border-red-200 text-red-500 px-2 py-0.5 rounded-full font-medium"
                    >
                {t}
              </span>
                ))}
                {restaurant.seats.length > 3 && (
                    <span className="text-xs text-gray-400">
                +{restaurant.seats.length - 3}
              </span>
                )}
              </div>
          )}
        </div>
      </div>
  );
}

/* ─── List Row Card (맛집 탭) ─── */
export function RestaurantRow({plan}) {

  return (
      <Link to={`/plans/${plan.PlanId}`}>
        <div
            className="restaurant-card bg-white rounded-2xl overflow-hidden flex cursor-pointer"
        >
          <div className="p-3 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              {/*<span className="text-xs text-gray-400">{plan.category}</span>*/}
              {plan.recruitStatus && <Badge type={plan.recruitStatus}/>}
            </div>
            <h3 className="font-bold text-gray-900 text-sm">{plan.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {plan.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <StarRating startDate={plan.startDate} endDate={plan.endDate}/>
              <span
                  className={`text-xs font-bold ${
                      plan.recruitStatus === "OPEN"
                          ? "text-green-500"
                          : "text-orange-500"
                  }`}
              >
            {plan.PlanId}
          </span>
            </div>
          </div>
        </div>
      </Link>
  );
}

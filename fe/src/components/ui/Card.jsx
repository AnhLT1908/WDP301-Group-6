import React from "react";

const Card = ({
  title,
  img,
  children,
  actions,
  showIcon,
  icon,
  className = "bg-white border border-gray-200 rounded-lg shadow-sm",
  cardImgClassName = "w-full h-64 object-cover rounded-t-lg",
  contentClassName = "p-6",
}) => {
  return (
    <div
      className={`${className} hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300`}
    >
      {img && <img src={img} className={cardImgClassName} alt={title} />}
      <div className={contentClassName}>
        {showIcon && (
          <div className="relative flex justify-center items-center ml-[-30px]">
            <div className="absolute w-[100px] h-[100px] bg-green-500 rounded-[10px]"></div>
            {icon}
          </div>
        )}
        <div className="flex flex-col justify-between h-full">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
            {title}
          </h3>
          <div className="text-gray-700 mb-4">{children}</div>
          {actions && <div>{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default Card;

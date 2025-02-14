import React from "react";

const Card = ({ title, children, actions, showIcon, icon = false }) => {
  return (
    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="grid grid-cols-2 items-center gap-4">
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

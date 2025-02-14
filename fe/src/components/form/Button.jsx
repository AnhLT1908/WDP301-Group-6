import React from "react";
import { ArrowRight } from "lucide-react";

const Button = ({
  onClick,
  children,
  className = "px-4 py-2 bg-green-500 text-white rounded",
  showIcon = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${className} hover:bg-green-700 transition duration-300`}
    >
      <div className="flex items-center">
        {children}
        {showIcon && <ArrowRight className="pl-[5px] pt-[3px]" size={25} />}
      </div>
    </button>
  );
};

export default Button;

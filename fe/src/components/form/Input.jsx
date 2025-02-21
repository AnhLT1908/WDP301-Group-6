// src/components/form/Input.js
import React from "react";

const Input = ({ type, value, onChange, placeholder, className }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} w-full sm:w-2/3 p-3 mb-4 border border-gray-300 rounded-md`}
    />
  );
};

export default Input;

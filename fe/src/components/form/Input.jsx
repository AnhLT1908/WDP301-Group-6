// src/components/form/Input.js
import React from "react";

const Input = ({ type, value, onChange, placeholder, className }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className}`}
    />
  );
};

export default Input;

import React from "react";

function Select({ options = [], onChange, className = "", defaultValue = "" }) {
  return (
    <select
      onChange={onChange}
      className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      defaultValue={defaultValue}
    >
      <option value="" disabled>
        Selecciona una opción
      </option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;

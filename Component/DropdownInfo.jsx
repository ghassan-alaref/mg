import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const DropdownInfo = ({
  label,
  required,
  labelKey,
  onChange,
  value,
  endpoint,
  headers,
}) => {
  const [options, setOptions] = useState([]);
  const fetched = useRef(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (fetched.current) return;
      try {
        const response = await axios.get(endpoint, { headers });
        if (response.data.status === "Success") {
          setOptions(response.data.results);
          fetched.current = true;
        } else {
          alert(`Failed to fetch data from ${endpoint}`);
        }
      } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
      }
    };

    fetchOptions();
  }, [endpoint, headers]);

  return (
    <div className="flex flex-col space-y-1 mt-5">
      <label className="text-sm mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
        onChange={onChange}
        value={value}
      >
        <option value="" disabled hidden>
          {required ? "Select an option" : "None"}
        </option>
        {options.map((option, index) => (
          <>
            {console.log(option?.branchCode, "branchCode")}
            <option
              key={option.branchCode ? option.branchCode : option.groupCode}
              value={option.branchCode ? option.branchCode : option.groupCode}
            >
              {option[labelKey]}
            </option>
          </>
        ))}
      </select>
    </div>
  );
};

export default DropdownInfo;

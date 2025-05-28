import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const DropdownField = ({
  label,
  required,
  labelKey,
  valueKey,
  onChange,
  value,
  endpoint,
  headers,
}) => {
  const [options, setOptions] = useState([]);
  const [internalValue, setInternalValue] = useState(""); // For tracking mapped value
  const fetched = useRef(false);

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      if (fetched.current) return;
      try {
        const response = await axios.get(endpoint, { headers });
        if (response.data.status === "Success") {
          setOptions(response.data.results);
          fetched.current = true;

          // Handle the case where the value is a name instead of a code
          const matchedOption = response.data.results.find(
            (option) => option[labelKey] === value
          );
          if (matchedOption) {
            setInternalValue(matchedOption[valueKey]);
          } else {
            setInternalValue(value); // Default to the original value if no match
          }
        } else {
          alert(`Failed to fetch data from ${endpoint}`);
        }
      } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
      }
    };

    fetchOptions();
  }, [endpoint, headers, labelKey, value]);

  // Update internal value when `value` changes
  useEffect(() => {
    const matchedOption = options.find((option) => option[labelKey] === value);
    if (matchedOption) {
      setInternalValue(matchedOption[valueKey]);
    } else {
      setInternalValue(value); // Default to the original value
    }
  }, [value, options, labelKey, valueKey]);

  return (
    <div className="flex flex-col space-y-1 mt-5">
      <label className="text-sm mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
        onChange={onChange}
        value={internalValue} // Use internal value here
      >
        <option value="" disabled hidden>
          {required ? "Select an option" : "None"}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownField;
import React from "react";
import { useAppContext } from "../Context/NewCustomerContext";
import { t } from "i18next";

const PropertyGrid = ({ maxCount, offset }) => {
  const { properties, setProperties } = useAppContext();

  // Slice the properties based on maxCount and offset
  const displayedProperties = properties.slice(offset, offset + maxCount);

  const handleCheckboxChange = (index) => {
    const actualIndex = offset + index;
    setProperties((prevProperties) =>
      prevProperties.map((prop, i) =>
        i === actualIndex
          ? { ...prop, status: prop.status === "Y" ? "N" : "Y" }
          : prop
      )
    );
  };

  return (
    <table style={{ borderCollapse: "collapse", width: "30%" }}>
      <thead>
        <tr>
          <th style={headerStyle}></th>
          <th style={headerStyle}>{t("Properties")}</th>
        </tr>
      </thead>
      <tbody>
        {displayedProperties.map((property, index) => (
          <tr key={index}>
            <td style={cellStyle}>
              <input
                type="checkbox"
                checked={property.status === "Y"}
                onChange={() => handleCheckboxChange(index)}
              />
            </td>
            <td style={cellStyle}>
              {property.name[0].toUpperCase() +
                property.name.slice(1).replace(/([A-Z])/g, " $1")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const headerStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f2f2f2",
  textAlign: "left",
  fontWeight: "bold",
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
};

export default PropertyGrid;
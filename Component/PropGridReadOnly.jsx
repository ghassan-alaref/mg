import React, { useState } from "react";
import { useAppContext } from "../Context/NewCustomerContext";
import { t } from "i18next";

const PropGridReadOnly = ({ status, name }) => {
  // Initial state with properties and their statuses

  return (
    <tbody>
      <tr>
        <td style={cellStyle}>{name}</td>

        <td style={cellStyle}>
          <input type="checkbox" checked={status === "Y"} readOnly />
        </td>
      </tr>
    </tbody>
  );
};

// Table styles
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

export default PropGridReadOnly;

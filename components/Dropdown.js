import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";

const Dropdown = ({ currencies, currency, setCurrency }) => {
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="dropdown">
      <div
        className="dropdown-btn"
        onClick={() => setIsActive(!isActive)}
      >
        <span className="ml-2">{currency}</span>{" "}
        <DownOutlined style={{ fontSize: "10px" }} />
      </div>
      {isActive && (
        <div className="dropdown-content">
          {currencies.map((item, i) => (
            <div
              className="dropdown-item"
              key={i}
              onClick={(e) => {
                setCurrency(e.target.textContent);
                setIsActive(false);
              }}
            >
              {item.code}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

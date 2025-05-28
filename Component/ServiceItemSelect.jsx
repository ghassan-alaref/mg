import { useState } from "react";

const ServiceItemSelect = ({ serviceItems, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState(serviceItems);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilteredItems(
      serviceItems.filter((item) =>
        item.itemName.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <div>
      <input
        type="text"
        className="p-4 w-full"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Type to filter service items..."
      />
      <select
        className="p-4 w-full mt-2"
        value=""
        onChange={(e) => {
          onChange(e.target.value);
          setSearchTerm(""); // Reset the search term
          setFilteredItems(serviceItems); // Reset the filtered items
        }}
      >
        <option value="">Select Service Item</option>
        {filteredItems.map((item) => (
          <option key={item.itemCode} value={item.itemCode}>
            {item.itemName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ServiceItemSelect;

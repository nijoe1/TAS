import React, { useState } from "react";

const DynamicForm = ({ schema }) => {
  const [formData, setFormData] = useState([]);

  const handleInputChange = (e, attributeName, attributeType) => {
    const newValue = e.target.value;
    const updatedData = formData.slice();
    const existingAttribute = updatedData.find((item) => item.name === attributeName);

    if (existingAttribute) {
      existingAttribute.value = newValue;
    } else {
      updatedData.push({ name: attributeName, value: newValue, type: attributeType });
    }

    setFormData(updatedData);
  };

  const handleSubmit = () => {
    // Output the formData array here or perform any desired actions
    console.log("Form data:", formData);
  };

  return (
    <div>
      <form>
        {schema.map((attribute, index) => (
          <div key={index}>
            <label htmlFor={attribute.name}>{attribute.name} ({attribute.type})</label>
            {attribute.type === "string" ? (
              <input
                type="text"
                id={attribute.name}
                onChange={(e) => handleInputChange(e, attribute.name, attribute.type)}
              />
            ) : attribute.type === "uint256" ? (
              <input
                type="number"
                id={attribute.name}
                onChange={(e) => handleInputChange(e, attribute.name, attribute.type)}
              />
            ) : attribute.type === "uint8" ? (
              <input
                type="number"
                id={attribute.name}
                onChange={(e) => handleInputChange(e, attribute.name, attribute.type)}
              />
            ) : null}
          </div>
        ))}
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;
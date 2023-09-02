import React, { useState } from "react";

const AttributeFormComponent = () => {
  const [attributes, setAttributes] = useState([{ type: "", name: "" }]);

  const handleAttributeChange = (index, key, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][key] = value;
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { type: "", name: "" }]);
  };

  const removeAttribute = (index) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };

  const generateAttributeString = () => {
    return attributes
      .map((attr) => `${attr.type} ${attr.name}`)
      .join(", ");
  };

  return (
    <div>
      <form>
        {attributes.map((attr, index) => (
          <div key={index} className="attribute-row">
            <select
              value={attr.type}
              onChange={(e) =>
                handleAttributeChange(index, "type", e.target.value)
              }
              className="attribute-select"
            >
              <option value="">Select Type</option>
              <option value="uint256">uint256</option>
              <option value="string">string</option>
              <option value="int256">int256</option>
              <option value="uint8">uint8</option>
              <option value="int8">int8</option>
              {/* Add more types here */}
            </select>
            <input
              type="text"
              value={attr.name}
              onChange={(e) =>
                handleAttributeChange(index, "name", e.target.value)
              }
              placeholder="Attribute Name"
              className="attribute-input"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="remove-button"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addAttribute} className="add-button">
          Add Attribute
        </button>
      </form>
      <div>
        <h3>Generated Attribute String:</h3>
        <p>{generateAttributeString()}</p>
      </div>
    </div>
  );
};

export default AttributeFormComponent;
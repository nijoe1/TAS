import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";

const AttributeFormComponent = () => {
  const [attributes, setAttributes] = useState([
    { type: "Select Type", name: "" },
  ]);

  const handleAttributeChange = (index, key, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][key] = value;
    if (value === "imageCID") {
      updatedAttributes[index]["type"] = "string";
      updatedAttributes[index]["name"] = "imageCID";
    } else if (value === "VideoCID") {
      updatedAttributes[index]["type"] = "string";
      updatedAttributes[index]["name"] = "VideoCID";
    } else if (value === "JSONCID") {
      updatedAttributes[index]["type"] = "string";
      updatedAttributes[index]["name"] = "JSONCID";
    }
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { type: "Select Type", name: "" }]);
  };

  const removeAttribute = (index) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };

  const generateAttributeString = () => {
    return attributes
      .map((attr) => {
        let autoName = "";
        if (attr.type === "imageCID") {
          autoName = "imageCID";
        } else if (attr.type === "VideoCID") {
          autoName = "VideoCID";
        } else if (attr.type === "JSONCID") {
          autoName = "JSONCID";
        }
        return `${attr.type} ${attr.name || autoName}`;
      })
      .join(", ");
  };

  return (
    <Card color="transparent" shadow={false}>
      <Typography variant="h4" color="blue-gray">
        Attribute Form
      </Typography>
      <form className="mt-4">
        {attributes.map((attr, index) => (
          <div key={index} className="mb-4">
            <select
              value={attr.type}
              onChange={(e) =>
                handleAttributeChange(index, "type", e.target.value)
              }
              className="attribute-select"
            >
              <option value="Select Type">Select Type</option>
              <option value="imageCID">imageCID</option>
              <option value="VideoCID">VideoCID</option>
              <option value="JSONCID">JSONCID</option>
              <option value="uint256">uint256</option>
              <option value="string">string</option>
              <option value="int256">int256</option>
              <option value="uint8">uint8</option>
              <option value="int8">int8</option>
              {/* Add more types here */}
            </select>
            <Input
              type="text"
              value={attr.name}
              onChange={(e) =>
                handleAttributeChange(index, "name", e.target.value)
              }
              placeholder={`Attribute Name (auto: ${
                attr.type === "imageCID"
                  ? "imageCID"
                  : attr.type === "VideoCID"
                  ? "VideoCID"
                  : attr.type === "JSONCID"
                  ? "JSONCID"
                  : ""
              })`}
              fullWidth
            />
            {index > 0 && (
              <Button
                color="red"
                size="sm"
                onClick={() => removeAttribute(index)}
                className="mt-2"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button color="blue" size="sm" onClick={addAttribute}>
          Add Attribute
        </Button>
      </form>
      <div className="mt-4">
        <Typography variant="h6" color="blue-gray">
          Generated Attribute String:
        </Typography>
        <Typography color="gray">{generateAttributeString()}</Typography>
      </div>
    </Card>
  );
};


export default AttributeFormComponent;
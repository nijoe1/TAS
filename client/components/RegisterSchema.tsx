import React, { useState } from "react";
import {
  Card,
  Input,
  Typography,
  Checkbox,
} from "@material-tailwind/react";
import { BsTrash3Fill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { CgAddR } from "react-icons/cg";

const RegisterSchema = () => {
  const [attributes, setAttributes] = useState([
    { type: "Select Type", name: "", isArray: false },
  ]);

  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [isRevocable, setIsRevocable] = useState(false);
  const [resolver, setResolver] = useState(
    "0x0000000000000000000000000000000000000000"
  );

  const solidityTypes = [
    "string",
    "address",
    "bool",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "uint128",
    "uint256",
    "int8",
    "int16",
    "int32",
    "int64",
    "int128",
    "int256",
    "bytes",
    "bytes32",
  ];

  const handleAttributeChange = (index, key, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][key] = value;

    if (value === "videoCID" || value === "imageCID" || value === "jsonCID") {
      updatedAttributes[index]["type"] = "string";
      updatedAttributes[index]["name"] = value;
      updatedAttributes[index]["readonly"] = true;
    } else {
      updatedAttributes[index]["type"] = value;
      updatedAttributes[index]["readonly"] = false;
    }

    setAttributes(updatedAttributes);
  };

  const handleAttributeNameChange = (index, key, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][key] = value;
    setAttributes(updatedAttributes);
  };

  const handleCheckboxChange = (index) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index]["isArray"] = !updatedAttributes[index]["isArray"];
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { type: "Select Type", name: "", isArray: false },
    ]);
  };

  const removeAttribute = (index) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };

  const generateAttributeString = () => {
    return attributes
      .map((attr) => {
        const type = attr.isArray ? `${attr.type}[]` : attr.type;
        return `${type} ${attr.name}`;
      })
      .join(", ");
  };

  const handleSubmit = () => {
    const schemaData = {
      schemaName,
      schemaDescription,
      isRevocable,
      resolver,
      attributes: attributes.map((attr) => ({
        type: attr.type,
        name: attr.name,
        isArray: attr.isArray,
      })),
    };

    console.log(JSON.stringify(schemaData, null, 2));
  };

  return (
    <Card
      color="white"
      shadow={false}
      className="mb-4 p-4 border border-black rounded-xl"
    >
      <div className="mb-4">
        <Typography variant="h4" color="black">
          Register Schema
        </Typography>
      </div>
      <form className="mt-4">
        <div className="mb-4">
          <label className="text-black font-medium">Schema Name</label>
          <Input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            fullWidth
            className="rounded-full px-4 py-2 border border-black"
          />
        </div>
        <div className="mb-4">
          <label className="text-black font-medium">Schema Description</label>
          <Input
            type="text"
            value={schemaDescription}
            onChange={(e) => setSchemaDescription(e.target.value)}
            fullWidth
            className="rounded-full px-4 py-2 border border-black"
          />
        </div>
        <div className="ml-4 mb-4">
          <input
            type="checkbox"
            checked={isRevocable}
            onChange={() => setIsRevocable(!isRevocable)}
            className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label className="ml-2 text-sm text-gray-900">isRevocable</label>
        </div>
        <div className="mb-4">
          <label className="text-black font-medium">Resolver Address</label>
          <Input
            type="text"
            value={resolver}
            onChange={(e) => setResolver(e.target.value)}
            placeholder="Resolver Address"
            fullWidth
            className="rounded-full px-4 py-2 border border-black"
          />
        </div>
        {attributes.map((attr, index) => (
          <div
            key={index}
            className="mb-4 border border-black p-4 rounded-xl flex items-center mx-2 gap-7"
          >
            <div className="w-1/4">
              <div className="flex-shrink-0">
                <SlOptionsVertical className="text-gray-500" />
              </div>
            </div>
            <div className="w-1/4">
              <select
                value={attr.type}
                onChange={(e) =>
                  handleAttributeChange(index, "type", e.target.value)
                }
                className="attribute-select rounded-full px-4 py-2 border border-black mr-20"
              >
                <option value="Select Type">Select Type</option>
                <option value="imageCID">imageCID</option>
                <option value="videoCID">VideoCID</option>
                <option value="jsonCID">JSONCID</option>
                {solidityTypes.map((type, typeIndex) => (
                  <option key={typeIndex} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/4">
              <input
                type="checkbox"
                checked={attr.isArray}
                onChange={() => handleCheckboxChange(index)}
                className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ml-2"
              />
              <label className=" text-sm text-gray-900">Array</label>
            </div>
            <div className="w-full">
              <Input
                type="text"
                value={attr.name}
                onChange={(e) =>
                  handleAttributeNameChange(index, "name", e.target.value)
                }
                placeholder={`Attribute Name (${attr.type})`}
                fullWidth
                readOnly={attr.readonly}
                className="rounded-full px-4 py-2 border border-black"
              />
            </div>
            <div className="w-1/4 text-right">
              {index > 0 && (
                <BsTrash3Fill
                  onClick={() => removeAttribute(index)}
                  className="cursor-pointer text-gray-600 hover:text-black"
                />
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-4">
          <CgAddR
            onClick={addAttribute}
            className="cursor-pointer text-gray-600 hover:text-black"
          />
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
          >
            Submit
          </button>
        </div>
      </form>
      <div className="mt-4">
        <Typography variant="h6" color="black">
          Generated Attribute String:
        </Typography>
        <Typography color="black">{generateAttributeString()}</Typography>
      </div>
    </Card>
  );
};

export default RegisterSchema;
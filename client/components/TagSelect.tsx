import React, { useState } from "react";
import { Input, Typography } from "@material-tailwind/react";

interface TagSelectProps {
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  tags: (string | number)[];
  formErrors: any;
  setFormErrors: (errors: any) => void;
  attributeType: string;
  setTags: (tags: (string | number)[]) => void;
}

function TagSelect({
  name,
  onChange,
  tags,
  attributeType,
  setTags,
  formErrors,
  setFormErrors,
}) {
  const [textInput, setTextInput] = useState("");

  const addTag = () => {
    // Validate the tag based on the attributeType
    const tagError = validateInput(textInput, attributeType.replace("[]", ""));
    if (tagError) {
      setFormErrors({ ...formErrors, [name]: tagError });
      return;
    }

    if (!tags.includes(textInput)) {
      setTextInput("");
      const newTags = [...tags, textInput];
      setTags(newTags);
      onChange(newTags); // Pass the array of tags directly
    } else {
      setFormErrors({ ...formErrors, [name]: "Tag already exists." });
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    onChange(updatedTags); // Pass the array of tags directly
  };

  const validateInput = (value, attributeType) => {
    if (attributeType === "address" && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return "Invalid Ethereum address";
      } else if (attributeType === "string" && value.length < 1) {
        return "Field cannot be empty";
      } else if (attributeType === "bytes" && !/^0x[a-fA-F0-9]*$/.test(value)) {
        return "Invalid bytes value";
      } else if (attributeType === "bytes32" && !/^0x[a-fA-F0-9]{64}$/.test(value)) {
        return "Invalid bytes32 value";
      } else if (attributeType === "bool" && !/^(true|false)$/.test(value)) {
        return "Must be true or false";
      } else if (attributeType.startsWith("uint")) {
        const uintSize = parseInt(attributeType.replace("uint", ""));
        const uintMaxValue = BigInt(`0x${'ff'.repeat(uintSize / 4)}`);
        const valueStr = String(value);
        const numericValueStr = valueStr.replace(/[^0-9]/g, '');
        const numericValue = BigInt(numericValueStr);
        
    
        if (isNaN(Number(numericValueStr)) || numericValue < BigInt(0) || numericValue > uintMaxValue) {
            return `Must be a positive integer that fits into uint${uintSize}`;
          }
      }

    return null;
  };

  return (
    <div>
      <div className="mt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center bg-indigo-100 text-sm rounded mt-2 mr-1"
            style={{ minHeight: "2rem" }}
          >
            <span className="ml-2 mr-1 leading-relaxed truncate max-w-xs">
              {tag}
            </span>
            <button
              onClick={() => removeTag(tag)}
              className="w-6 h-8 inline-block align-middle text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6 fill-current mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M15.78 14.36a1 1 0 0 1-1.42 1.42l-2.82-2.83-2.83 2.83a1 1 0 1 1-1.42-1.42l2.83-2.82L7.3 8.7a1 1 0 0 1 1.42-1.42l2.83 2.83 2.82-2.83a1 1 0 0 1 1.42 1.42l-2.83 2.83 2.83 2.82z"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="relative mt-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={`Enter elements of type ${attributeType.replace(
            "[]",
            ""
          )}`}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        {formErrors[name] && (
          <Typography color="red" className="mt-1">
            {formErrors[name]}
          </Typography>
        )}
        <div
          className={textInput ? "absolute z-40 left-0 mt-2 w-full" : "hidden"}
        >
          <div className="py-1 text-sm bg-white rounded shadow-lg border border-gray-300">
            <a
              onClick={addTag}
              className="block py-1 px-5 cursor-pointer hover:bg-indigo-600 hover:text-white"
            >
              Add tag "<span className="font-semibold">{textInput}</span>"
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TagSelect;
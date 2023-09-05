import React, { useState } from "react";
import { Card, Input, Button, Typography } from "@material-tailwind/react";
import TagSelect from "@/components/TagSelect";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

type DynamicFormModalProps = {
  schema: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaData: any) => void; // Replace 'any' with the actual type of your event data
};

const DynamicForm: React.FC<DynamicFormModalProps> = ({
  schema,
  isOpen,
  onClose,
  onCreate,
}) => {
  const encoder = new SchemaEncoder(schema);
  const schemaArray = schema.split(",").map((item) => {
    const [type, name] = item.trim().split(" ");
    return { type, name };
  });

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Initialize tags for each array attribute in the schema
  const initialTags = schemaArray
    .filter((attribute) => attribute.type.endsWith("[]"))
    .reduce((tags, attribute) => {
      tags[attribute.name] = [];
      return tags;
    }, {});

  const [tags, setTags] = useState(initialTags);

  const transformFormData = (formData, schema) => {
    const transformedData = [];

    const schemaArray = schema.split(",").map((item) => {
      const [type, name] = item.trim().split(" ");
      return { type, name };
    });

    for (const [name, value] of Object.entries(formData)) {
      const type = getTypeForAttribute(name, schemaArray);
      transformedData.push({ name, value, type });
    }

    return transformedData;
  };

  const getTypeForAttribute = (attributeName, schemaArray) => {
    const schemaEntry = schemaArray.find(
      (entry) => entry.name === attributeName
    );

    return schemaEntry.type;
  };

  const validateInput = (value, attributeType) => {
    if (attributeType === "address" && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
      return "Invalid Ethereum address";
    } else if (attributeType === "string" && value?.length < 1) {
      return "Field cannot be empty";
    } else if (attributeType === "bytes" && !/^0x[a-fA-F0-9]*$/.test(value)) {
      return "Invalid bytes value";
    } else if (
      attributeType === "bytes32" &&
      !/^0x[a-fA-F0-9]{64}$/.test(value)
    ) {
      return "Invalid bytes32 value";
    } else if (attributeType === "bool" && !/^(true|false)$/.test(value)) {
      return "Must be true or false";
    } else if (attributeType.startsWith("uint")) {
      const uintSize = parseInt(attributeType.replace("uint", ""));
      const uintMaxValue = BigInt(2 ** uintSize - 1);
      let size = value?.length;
      let valueStr;
      if (size) {
        valueStr = String(value[size - 1]);
      } else {
        valueStr = String(value);
        valueStr = valueStr.replace(/[^0-9]/g, "");
      }

      const numericValue = BigInt(valueStr);

      if (numericValue < BigInt(0) || numericValue > uintMaxValue) {
        return `Must be a positive integer that fits into uint${uintSize} (max: ${uintMaxValue})`;
      }
    } else if (attributeType === "int" && !/^-?\d+$/.test(value)) {
      return "Must be an integer";
    }
    return null;
  };

  const handleInputChange = (newValue, attributeName, attributeType) => {
    let parsedValue;

    if (attributeType.endsWith("[]")) {
      // For array attributes, newValue should already be an array of tags
      parsedValue = newValue;
    } else {
      // For other types, keep the values as is
      parsedValue = newValue.target.value;
    }

    const error = validateInput(parsedValue, attributeType);

    // Check if the value is valid before updating form data
    if (!error) {
      setFormData((prevData) => ({
        ...prevData,
        [attributeName]: parsedValue,
      }));
    }

    // Always update form errors with dynamic error
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [attributeName]: error,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    schemaArray.forEach((attribute) => {
      const error = validateInput(formData[attribute.name], attribute.type);
      if (error) {
        errors[attribute.name] = error;
      }
    });

    if (Object.keys(errors).length === 0) {
      console.log("Form data:", formData); // Move the logging here
      const encodedData = encoder.encodeData(
        transformFormData(formData, schema)
      );
      const decoded = encoder.decodeData(encodedData);
      console.log("Encoded Data:", decoded);
    } else {
      console.log("Form data contains errors:", formData); // Log with errors
    }

    setFormErrors(errors); // Always update form errors
    onCreate(formData);
    onClose();
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <Card color="transparent" shadow={false}>
        <Typography color="gray" className="mt-1 font-normal">
          Enter your details to register.
        </Typography>
        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96"
        >
          <div className="mb-4 flex flex-col gap-6">
            {schemaArray.map((attribute, index) => (
              <div key={index}>
                {formErrors[attribute.name] && (
                  <Typography color="red" className="mt-1">
                    {formErrors[attribute.name]}
                  </Typography>
                )}
                {attribute.type.endsWith("[]") ? (
                  <TagSelect
                    name={attribute.name}
                    onChange={(tags) => {
                      // Handle array inputs directly with an array of tags
                      handleInputChange(tags, attribute.name, attribute.type);
                    }}
                    placeholder={`Enter ${attribute.name} tags`}
                    tags={formData[attribute.name] || []}
                    setTags={(tags) => {
                      // Update tags directly with the array
                      setFormData((prevData) => ({
                        ...prevData,
                        [attribute.name]: tags,
                      }));
                    }}
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                    attributeType={attribute.type}
                  />
                ) : (
                  <Input
                    size="lg"
                    placeholder={`${attribute.name} (${attribute.type})`}
                    name={attribute.name}
                    value={formData[attribute.name] || ""}
                    onChange={(e) =>
                      handleInputChange(e, attribute.name, attribute.type)
                    }
                    error={formErrors[attribute.name]}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
            >
              Submit
            </button>
            <button
              type="button"
              className="bg-black text-white rounded-full px-6 py-2 hover:bg-white hover:text-black border border-black"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DynamicForm;

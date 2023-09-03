import React, { useState } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

const DynamicForm = ({ schema }) => {
  const [formData, setFormData] = useState([]);

  const handleInputChange = (e, attributeName, attributeType) => {
    const newValue = e.target.value;
    const updatedData = formData.slice();
    const existingAttribute = updatedData.find(
      (item) => item.name === attributeName
    );

    if (existingAttribute) {
      existingAttribute.value = newValue;
    } else {
      updatedData.push({
        name: attributeName,
        value: newValue,
        type: attributeType,
      });
    }

    setFormData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Output the formData array here or perform any desired actions
    console.log("Form data:", formData);
  };

  return (
    <Card color="transparent" shadow={false}>
      <Typography color="gray" className="mt-1 font-normal">
        Enter your details to register.
      </Typography>
      <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-4 flex flex-col gap-6">
          {schema.map((attribute, index) => (
            <Input
              key={index}
              size="lg"
              label={`${attribute.name} (${attribute.type})`}
              name={attribute.name}
              value={
                formData.find((item) => item.name === attribute.name)?.value || ""
              }
              onChange={(e) =>
                handleInputChange(e, attribute.name, attribute.type)
              }
            />
          ))}
        </div>
        <Button className="mt-6" fullWidth type="submit">
          CreateSchema
        </Button>
      </form>
    </Card>
  );
};

export default DynamicForm;
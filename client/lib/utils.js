export const validateInput = (value, attributeType) => {
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
    if (value.type == "string") {
      return null;
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

export const transformFormData = (formData, schema) => {
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

export const transformDecodedData = (inputObject) => {
  // @ts-ignore
  const transformedArray = [];

  inputObject.forEach((item) => {
    const transformedItem = {
      type: item.type,
      name: item.name,
      value: item.value.value,
    };

    transformedArray.push(transformedItem);
  });
  // @ts-ignore
  return transformedArray;
};

export const decodeSchema = (rawSchema) => {
  if (typeof rawSchema !== "string") {
    // Handle the case where rawSchema is not a string (e.g., it's undefined or null)
    return [];
  }

  // Continue with your existing code to split and decode the schema
  const fieldStrings = rawSchema.split(",").map((field) => field.trim());
  // @ts-ignore
  const decodedSchema = [];
  fieldStrings.forEach((fieldString) => {
    const [type, name] = fieldString.split(" ");
    decodedSchema.push({ type, name });
  });
  // @ts-ignore
  console.log(decodedSchema);
  // @ts-ignore
  return decodedSchema;
};

const getTypeForAttribute = (attributeName, schemaArray) => {
  const schemaEntry = schemaArray.find((entry) => entry.name === attributeName);

  return schemaEntry.type;
};

export const parseInputString = (inputString) => {
  const fields = inputString.split(",").map((field) => {
    const [type, name] = field.trim().split(" ");
    return { type, name };
  });

  return { fields };
};

const allowedFileTypes = {
  "image/jpeg": "Image",
  "image/png": "Image",
  "image/gif": "Image",
  "video/mp4": "Video",
  "video/webm": "Video",
  "video/ogg": "Video",
  "application/pdf": "PDF",
  "text/csv": "CSV",
};

export const getFileTypeFromAccept = (acceptValue) => {
  const acceptValues = acceptValue.split(",").map((val) => val.trim());

  for (const [key, value] of Object.entries(allowedFileTypes)) {
    if (acceptValues.includes(key)) {
      return value;
    }
  }

  return undefined;
};

export const parseBlobToJson = async (blob) => {
  try {
    const response = await fetch(URL.createObjectURL(blob));
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    throw new Error("Error parsing Blob as JSON: " + error.message);
  }
};

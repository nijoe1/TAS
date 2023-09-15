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

const getTypeForAttribute = (attributeName, schemaArray) => {
  const schemaEntry = schemaArray.find((entry) => entry.name === attributeName);

  return schemaEntry.type;
};



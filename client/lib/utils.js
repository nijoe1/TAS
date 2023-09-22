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

export const getFileTypeFromAccept = (acceptValue, size) => {
  const acceptValues = acceptValue.split(",").map((val) => val.trim());

  for (const [key, value] of Object.entries(allowedFileTypes)) {
    if (acceptValues.includes(key)) {
      if (size > 1) {
        return `${value}[]`
      } else {
        return value;
      }
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


export const tables = {
  314159: {
    // SchemaRegistry
    schema: "schema_314159_347",
    categories: "schema_categories_314159_348",
    // Tableland Attestation Service
    attestation: "attestation_314159_349",
    revocation: "revocation_314159_350",
    offChainTimestamp: "offChain_timestamp_314159_351",
    offChainRevocation: "offChain_revocation_314159_352",
    // ContentSubscriptionsResolver
    content_group: "group_314159_356",
    content_admins: "creator_314159_357",
    content_subscription: "subscription_314159_358",
    group_revenue: "revenue_314159_359",
    // ACResolver
    info: "schema_info_314159_355",
    attesters: "schema_attesters_314159_353",
    revokers: "schema_revokers_314159_354",
  },
  80001: {
    // SchemaRegistry
    schema: "schema_80001_7469",
    categories: "schema_categories_80001_7470",
    // Tableland Attestation Service
    attestation: "attestation_80001_7471",
    revocation: "revocation_80001_7472",
    offChainTimestamp: "offChain_timestamp_80001_7473",
    offChainRevocation: "offChain_revocation_80001_7474",
    // ContentSubscriptionsResolver
    content_group: "group_80001_7478",
    content_admins: "creator_80001_7479",
    content_subscription: "subscription_80001_7480",
    group_revenue: "revenue_80001_7481",
    // ACResolver
    attesters: "schema_attesters_80001_7475",
    revokers: "schema_revokers_80001_7476",
    info: "schema_info_80001_7477",
  },

  420: {
    // SchemaRegistry
    schema: "schema_420_230",
    categories: "schema_categories_420_231",
    // Tableland Attestation Service
    attestation: "attestation_420_232",
    revocation: "revocation_420_233",
    offChainTimestamp: "offChain_timestamp_420_234",
    offChainRevocation: "offChain_revocation_420_235",
    // ContentSubscriptionsResolver
    content_group: "group_420_239",
    content_admins: "creator_420_240",
    content_subscription: "subscription_420_241",
    group_revenue: "revenue_420_242",
    // ACResolver
    attesters: "schema_attesters_420_236",
    revokers: "schema_revokers_420_237",
    info: "schema_info_420_238",
  },
};

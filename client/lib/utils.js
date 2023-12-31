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

  for (const attribute of schemaArray) {
    const { name, type } = attribute;
    const value = formData[name];
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
  return decodedSchema;
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
  "application/json": "JSON",
};

export const bytesToMB = (bytes) => {
  if (bytes === 0) return "0 MB";

  const megabyte = 1024 * 1024; // 1 MB = 1024 KB = 1024 * 1024 bytes
  const kilobyte = 1024; // 1 KB = 1024 bytes

  if (bytes < kilobyte) {
    return `${bytes} bytes`;
  } else if (bytes < megabyte) {
    const sizeInKB = bytes / kilobyte;
    return `${sizeInKB.toFixed(1)} KB`;
  } else {
    const sizeInMB = bytes / megabyte;
    if ((sizeInMB / megabyte) * 1024 >= 1) {
      return `${((sizeInMB / megabyte) * 1024).toFixed(1)} GB`;
    }
    const roundedSizeInMB = Math.round(sizeInMB * 10000) / 10000; // Round to 4 decimal places
    return `${roundedSizeInMB.toFixed(1)} MB`;
  }
};

export const getFileTypeFromAccept = (acceptValue, size) => {
  const acceptValues = acceptValue.split(",").map((val) => val.trim());

  for (const [key, value] of Object.entries(allowedFileTypes)) {
    if (acceptValues.includes(key)) {
      if (size > 1) {
        return `${value}[]`;
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

// Function to encode hex string to Base64
export const encodeHexToBase64 = (hexString) => {
  const cleanedHex = hexString.startsWith("0x")
    ? hexString.slice(2)
    : hexString;
  const bytes = new Uint8Array(
    cleanedHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return btoa(String.fromCharCode.apply(null, bytes));
};

// Function to decode Base64 to hex string
export const decodeBase64ToHex = (base64String) => {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const hexString = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hexString}`;
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
    content_group: "group_314159_363",
    content_admins: "creator_314159_364",
    content_subscription: "subscription_314159_365",
    group_revenue: "revenue_314159_366",
    // ACResolver
    info: "schema_info_314159_355",
    attesters: "schema_attesters_314159_353",
    revokers: "schema_revokers_314159_354",
  },
  80001: {
    // SchemaRegistry
    schema: "schema_80001_7633",
    categories: "schema_categories_80001_7634",
    // Tableland Attestation Service
    attestation: "attestation_80001_7635",
    revocation: "revocation_80001_7636",
    offChainTimestamp: "offChain_timestamp_80001_7637",
    offChainRevocation: "offChain_revocation_80001_7638",
    // ContentSubscriptionsResolver
    content_group: "group_80001_7642",
    content_admins: "creator_80001_7643",
    content_subscription: "subscription_80001_7644",
    group_revenue: "revenue_80001_7645",
    // ACResolver
    attesters: "schema_attesters_80001_7639",
    revokers: "schema_revokers_80001_7640",
    info: "schema_info_80001_7641",
  },

};

import {
  getAttestation,
  getAttestations,
  getSchemaAttestations,
  getAllSchemas,
  getSchema,
  getAllUserCreatedSchemas,
  getUserAttestations,
  getUserRecievedAttestations,
  getUserSubscriptions,
  getCreatedSchemasRevenue,
  getReferencedAttestations,
  getACSchemaAttesters,
  getSubscriptionSchemaCreators,
} from "@/lib/tableland";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import {
  getOffChainAttestation,
  getOffChainAttestations,
  transformAndSortArrays,
  getOffChainAttestationsForSchema,
  getUserOffChainAttestations,
  getUserOffChainRecievedAttestations,
  getOffChainAttestationReferences,
  getDelegatedRequestForSchema,
} from "@/lib/offchain";
import {
  transformDecodedData,
  decodeSchema,
  parseInputString,
  parseBlobToJson,
  decodeBase64ToHex,
} from "@/lib/utils";
import { decrypt, getIpfsGatewayUri, getUserDataInfo } from "./lighthouse";
import { getPrice } from "./contractReads";

interface SchemaData {
  categories: string[];
  schemaUID: string;
  name: string;
  description: string;
  created: string;
  creator: string;
  resolverContract: string;
  revocable: boolean;
  attestationCount: {
    onchain: number;
    offchain: number;
  };
  decodedSchema: Array<{ type: string; name: string }>; // Adjust the type based on the actual schema structure
  rawSchema: string;
}

export const SchemaInfo: SchemaData = {
  categories: [],
  schemaUID: "",
  name: "",
  description: "",
  created: "",
  creator: "",
  resolverContract: "",
  revocable: true,
  attestationCount: {
    onchain: 0,
    offchain: 0,
  },
  decodedSchema: [],
  rawSchema: "",
};

export const getAllAttestations = async (chainID: number) => {
  let attestations = await getAttestations(chainID);
  let offChain = await getOffChainAttestations(chainID);
  const formattedEntries = [];

  for (const inputObject of offChain) {
    const body = JSON.parse(JSON.stringify(inputObject.content.data));

    // Extracting relevant information
    const schemaUid = body.sig.message.schema || null;
    const refUID = body.sig.message.refUID || null;
    const toAddress = body.sig.message.recipient || null;
    const fromAddress = body.signer;
    const age = body.sig.message.time;
    const uid =
      inputObject.content.tags.find((tag: any) => tag.slug === "uid")?.title ||
      null;

    const entry = {
      uid: uid,
      refUID: refUID,
      schemaUid: schemaUid,
      fromAddress: fromAddress,
      toAddress: toAddress,
      age: age,
      type: "OFFCHAIN",
      // Add other properties as needed from the inputObject
    };
    formattedEntries.push(entry);
  }
  const totalOffchain = formattedEntries.length;
  // @ts-ignore
  const attestationTableInfo: any[] = [];
  attestations.forEach((inputObject: any, index: any) => {
    // Create a tableData entry
    const entry = {
      uid: inputObject.uid,
      refUID: inputObject.refUID,
      schemaUid: inputObject.schemaUID,
      fromAddress: inputObject.attester,
      toAddress: inputObject.recipient,
      age: inputObject.creationTimestamp,
      type: "ONCHAIN",
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    attestationTableInfo.push(entry);
  });
  const totalOnChain = attestationTableInfo.length;

  let tableDt = transformAndSortArrays(formattedEntries, attestationTableInfo);
  return { tableDt, onchain: totalOnChain, offChain: totalOffchain };
};

export const getAllUserAttestations = async (
  chainID: number,
  address: `0x${string}`
) => {
  let attestations = await getUserAttestations(chainID, address);
  let offChain = await getUserOffChainAttestations(chainID, address);
  const formattedEntries = [];

  for (const inputObject of offChain) {
    const body = JSON.parse(JSON.stringify(inputObject.content.data));

    // Extracting relevant information
    const schemaUid = body.sig.message.schema || null;
    const refUID = body.sig.message.refUID || null;

    const toAddress = body.sig.message.recipient || null;
    const fromAddress = body.signer;
    const age = body.sig.message.time;
    const uid =
      inputObject.content.tags.find((tag: any) => tag.slug === "uid")?.title ||
      null;

    const entry = {
      uid: uid,
      refUID: refUID,
      schemaUid: schemaUid,
      fromAddress: fromAddress,
      toAddress: toAddress,
      age: age,
      type: "OFFCHAIN",
      // Add other properties as needed from the inputObject
    };
    formattedEntries.push(entry);
  }
  // @ts-ignore
  const attestationTableInfo: any[] = [];
  attestations.forEach((inputObject: any, index: any) => {
    // Create a tableData entry
    const entry = {
      uid: inputObject.uid,
      refUID: inputObject.refUID,
      schemaUid: inputObject.schemaUID,
      fromAddress: inputObject.attester,
      toAddress: inputObject.recipient,
      age: inputObject.creationTimestamp,
      type: "ONCHAIN",
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    attestationTableInfo.push(entry);
  });

  let tableDt = transformAndSortArrays(formattedEntries, attestationTableInfo);
  return tableDt;
};

export const getAllUserRecievedAttestations = async (
  chainID: number,
  address: `0x${string}`
) => {
  let attestations = await getUserRecievedAttestations(chainID, address);
  let offChain = await getUserOffChainRecievedAttestations(chainID, address);
  const formattedEntries = [];

  for (const inputObject of offChain) {
    const body = JSON.parse(JSON.stringify(inputObject.content.data));

    // Extracting relevant information
    const schemaUid = body.sig.message.schema || null;
    const refUID = body.sig.message.refUID || null;

    const toAddress = body.sig.message.recipient || null;
    const fromAddress = body.signer;
    const age = body.sig.message.time;
    const uid =
      inputObject.content.tags.find((tag: any) => tag.slug === "uid")?.title ||
      null;

    const entry = {
      uid: uid,
      refUID: refUID,
      schemaUid: schemaUid,
      fromAddress: fromAddress,
      toAddress: toAddress,
      age: age,
      type: "OFFCHAIN",
      // Add other properties as needed from the inputObject
    };
    formattedEntries.push(entry);
  }
  // @ts-ignore
  const attestationTableInfo: any[] = [];
  attestations.forEach((inputObject: any, index: any) => {
    // Create a tableData entry
    const entry = {
      uid: inputObject.uid,
      refUID: inputObject.refUID,
      schemaUid: inputObject.schemaUID,
      fromAddress: inputObject.attester,
      toAddress: inputObject.recipient,
      age: inputObject.creationTimestamp,
      type: "ONCHAIN",
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    attestationTableInfo.push(entry);
  });

  let tableDt = transformAndSortArrays(formattedEntries, attestationTableInfo);
  return tableDt;
};

export const getAttestationData = async (
  type: string,
  chainID: number,
  uid: string
) => {
  let attestation;
  if (type === "ONCHAIN") {
    attestation = await getAttestation(chainID, uid);
    attestation = attestation[0];
  } else {
    attestation = await getOffChainAttestation(chainID, uid);
    console.log(attestation);
  }

  const encoder = new SchemaEncoder(attestation.schema);
  let data = "";
  if (attestation.data) {
    data = decodeBase64ToHex(attestation.data);
  }
  let TransformedData;
  try {
    TransformedData = transformDecodedData(encoder.decodeData(data));
  } catch {
    TransformedData = undefined;
  }
  return {
    // @ts-ignore
    attestationUID: uid,
    created: attestation.creationTimestamp,
    expiration:
      attestation.expirationTime === "0" ? "Never" : attestation.expirationTime,
    revoked:
      attestation.revoker === "0x0000000000000000000000000000000000000000"
        ? false
        : true,
    revocable: attestation.revocable == "false" ? false : true,
    resolver: attestation.resolver,
    refUID: attestation.refUID,
    schemaUID: attestation.schemaUID,
    from: attestation.attester,
    to: attestation.recipient,
    decodedData: TransformedData,
    referencedInAttestations: <any>[],
    referencingAttestation: 0,
    data: data,
    context: uid,
  };
};

export const getAttestationReferencedAttestations = async (
  chainID: number,
  uid: string
) => {
  let attestations: { uid: string; type: string }[] = [];
  let offChainReferences = await getOffChainAttestationReferences(uid);
  let onChainReferences = await getReferencedAttestations(chainID, uid);
  for (const onchain of onChainReferences) {
    attestations.push({ uid: onchain.uid, type: "OFFCHAIN" });
  }
  for (const offchain of offChainReferences) {
    const uid =
      offchain.content.tags.find((tag: any) => tag.slug === "uid")?.title ||
      null;
    attestations.push({ uid: uid, type: "OFFCHAIN" });
  }
  return attestations;
};

export const getSchemas = async (chainID: number) => {
  // @ts-ignore
  const tableData: {
    id: any; // Incrementing ID
    uid: any;
    schema: { fields: any };
    resolverAddress: any;
    attestations: any;
    creationTimestamp: any;
    schemaDetails: {
      creator: any;
      categories: string[];
      name: any;
      description: any;
    };
  }[] = [];
  let schemas = await getAllSchemas(chainID);
  schemas.forEach((inputObject: any, index: any) => {
    const schemaString = inputObject.schema;
    const schema = parseInputString(schemaString);

    // Create a tableData entry
    const entry = {
      id: index + 1, // Incrementing ID
      uid: inputObject.schemaUID,
      schema,
      resolverAddress: inputObject.resolver,
      attestations: inputObject.total,
      creationTimestamp: inputObject.creationTimestamp,
      schemaDetails: {
        categories: Array.from(
          new Set(
            inputObject.categories.map(
              (item: { category: any }) => item.category
            )
          )
        ),
        name: inputObject.name,
        description: inputObject.description,
        creator: inputObject.creator,
      },
      // Add other properties as needed from the inputObject
    };
    console.log(entry);

    // Push the entry to the tableData array
    // @ts-ignore
    tableData.push(entry);
  });
  let size = tableData.length;
  return { tableData, number: size };
};

export const getUserSchemasRevenue = async (
  chainID: number,
  user: `0x${string}`
) => {
  // @ts-ignore
  const tableData: {
    id: any; // Incrementing ID
    uid: any;
    schema: { fields: any };
    resolverAddress: any;
    attestations: any;
    creationTimestamp: any;
    revenue: any;
  }[] = [];
  let schemas = await getCreatedSchemasRevenue(chainID, user);
  console.log(schemas);
  schemas.forEach((inputObject: any, index: any) => {
    // Create a tableData entry
    const entry = {
      id: index + 1, // Incrementing ID
      uid: inputObject.schemaUID,
      schema: index,
      resolverAddress: index,
      attestations: index,
      creationTimestamp: index,
      revenue: getPrice(
        (inputObject.totalClaimed / inputObject.shares / 100).toString()
      ),
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    tableData.push(entry);
  });
  return tableData;
};

export const getSchemaAttesters = async (
  chainID: number,
  schemaUID: `0x${string}`,
  type: string
) => {
  if (type == "ACCESS_CONTROL") {
    let res = await getACSchemaAttesters(chainID, schemaUID);

    const revokers = res.filter(
      (item: { type: string }) => item.type === "revoker"
    );
    const attesters = res.filter(
      (item: { type: string }) => item.type === "attester"
    );
    let ress = { attesters: attesters, revokers: revokers }
    console.log(ress)
    return ress;
  } else if (type == "SUBSCRIPTION") {
    let res = await getSubscriptionSchemaCreators(chainID, schemaUID);
    let array = res.map((item: { attester: any }) => item.attester);

    return array;
  }
};

export const getUserCreatedSchemas = async (
  chainID: number,
  address: `0x${string}`
) => {
  // @ts-ignore
  const tableData: {
    id: any; // Incrementing ID
    uid: any;
    schema: { fields: any };
    resolverAddress: any;
    attestations: any;
    creationTimestamp: any;
    schemaDetails: {
      creator: any;
      categories: any[];
      name: any;
      description: any;
    };
  }[] = [];
  let indexer = [[]];
  let schemas = await getCreatedSchemasRevenue(chainID, address);
  schemas.forEach((inputObject: any, index: any) => {
    // @ts-ignore
    indexer[inputObject.schemaUID] = getPrice(
      (inputObject.totalClaimed / inputObject.shares / 100).toString()
    );
  });
  schemas = await getAllUserCreatedSchemas(chainID, address);
  console.log(schemas);
  schemas.forEach(async (inputObject: any, index: any) => {
    const schemaString = inputObject.schema;
    const schema = parseInputString(schemaString);

    let typeOfRole =
      inputObject?.admin_count > 0
        ? "creator"
        : inputObject?.attester_count > 0 && inputObject.revoker_count > 0
        ? "Attester&Revoker"
        : inputObject?.attester_count > 0
        ? "Attester"
        : inputObject?.revoker_count > 0
        ? "Revoker"
        : "Creator"; // Create a tableData entry
    const entry = {
      id: index + 1, // Incrementing ID
      uid: inputObject.schemaUID,
      schema,
      resolverAddress: inputObject.resolver,
      attestations: 0,
      role: typeOfRole,
      creationTimestamp: inputObject.creationTimestamp,
      revenue: indexer[inputObject.schemaUID],
      schemaDetails: {
        categories: Array.from(
          new Set(
            inputObject.categories.map(
              (item: { category: any }) => item.category
            )
          )
        ),
        name: inputObject.name,
        description: inputObject.description,
        creator: inputObject.creator,
      },
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    // @ts-ignore
    tableData.push(entry);
  });
  return tableData;
};

export const getUserSchemaSubscriptions = async (
  chainID: number,
  user: `0x${string}`
) => {
  // @ts-ignore
  const tableData: {
    id: any; // Incrementing ID
    uid: any;
    schema: { fields: any };
    resolverAddress: any;
    attestations: any;
    creationTimestamp: any;
    subscriptionEnds: any;
  }[] = [];
  let schemas = await getUserSubscriptions(chainID, user);
  console.log(schemas);
  schemas.forEach((inputObject: any, index: any) => {
    // Create a tableData entry
    const entry = {
      id: index + 1, // Incrementing ID
      uid: inputObject.schemaUID,
      schema: index,
      resolverAddress: index,
      attestations: index,
      creationTimestamp: index,
      subscriptionEnds: inputObject.subscriptionEndsAt,
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    tableData.push(entry);
  });
  return tableData;
};

export const getDelegatedRequestsForSchema = async (
  schemaUID: string,
  schema: string
) => {
  let requests = await getDelegatedRequestForSchema(schemaUID);
  console.log(requests);
  let requestsArray = [];
  const encoder = new SchemaEncoder(schema);

  for (const request of requests) {
    let temp = request.content.data;
    let TransformedData;
    try {
      TransformedData = transformDecodedData(
        encoder.decodeData(temp.AttestationRequestData.AttestationData)
      );
    } catch {
      TransformedData = undefined;
    }
    let entry = {
      schemaUID: temp.schemaUID,
      AttestationRequestData: {
        recipient: temp.AttestationRequestData.recipient,
        expirationTime: temp.AttestationRequestData.expirationTime,
        revocable: temp.AttestationRequestData.revocable,
        refUID: temp.AttestationRequestData.refUID,
        transformedData: TransformedData,
        attestationData: temp.AttestationRequestData.AttestationData,
        Base64Data: temp.AttestationRequestData.Base64Data,
        value: temp.AttestationRequestData.value,
      },
      signature: {
        v: temp.signature.v,
        r: temp.signature.r,
        s: temp.signature.s,
      },
      attester: temp.attester,
      deadline: temp.deadline,
      nonce: temp.nonce,
      createdAt: temp.createdAt,
    };
    console.log(entry);
    requestsArray.push(entry);
  }
  return requestsArray;
};

export const getSchemaData = async (
  chainID: number,
  schemaUID: `0x${string}`
) => {
  let offChain = await getOffChainAttestationsForSchema(
    chainID,
    schemaUID as string
  );

  const formattedEntries = [];
  if (offChain.length != 0) {
    for (const inputObject of offChain) {
      const body = JSON.parse(JSON.stringify(inputObject.content.data));

      // Extracting relevant information
      const toAddress = body.sig.message.recipient || null;
      const fromAddress = body.signer;
      const age = body.sig.message.time;
      const refUID = body.sig.message.refUID;
      const uid =
        inputObject.content.tags.find((tag: any) => tag.slug === "uid")
          ?.title || null;

      const entry = {
        uid: uid,
        refUID: refUID,
        fromAddress: fromAddress,
        toAddress: toAddress,
        age: age,
        data: body.sig.message.base64Data,
        type: "OFFCHAIN",
      };
      formattedEntries.push(entry);
    }
  }

  const attestationTableInfo: any[] | ((prevState: never[]) => never[]) = [];
  let attestations = await getSchemaAttestations(chainID, schemaUID);
  let schema = await getSchema(chainID, schemaUID);
  schema = schema[0];
  let schemaInfo = SchemaInfo;
  attestations.forEach((inputObject: any, index: any) => {
    // Create a tableData entry
    const entry = {
      uid: inputObject.uid,
      refUID: inputObject.refUID,
      fromAddress: inputObject.attester,
      toAddress: inputObject.recipient,
      age: inputObject.creationTimestamp,
      data: inputObject.data,
      type: "ONCHAIN",
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    attestationTableInfo.push(entry);
  });

  schemaInfo.creator = schema.creator;
  // @ts-ignore
  schemaInfo.decodedSchema = decodeSchema(schema.schema);
  // @ts-ignore

  schemaInfo.schemaUID = schemaUID;
  schemaInfo.name = schema.name;
  schemaInfo.description = schema.description;
  schemaInfo.resolverContract = schema.resolver;
  schemaInfo.rawSchema = schema.schema;
  schemaInfo.revocable = schema.revocable === "true" ? true : false;
  schemaInfo.created = schema.creationTimestamp;
  let cat = [];
  for (const category of schema.categories) {
    cat.push(category.category);
  }
  schemaInfo.categories = cat;
  let tableDt:
    | ((prevState: never[]) => never[])
    | {
        uid: any;
        refUID: any;
        fromAddress: any;
        toAddress: any;
        age: any;
        data: any;
        type: string;
      }[]
    | {
        uid: any;
        refUID: any;
        schemaUid: any; // Add other properties as needed from the inputObject
        // Add other properties as needed from the inputObject
        fromAddress: any;
        toAddress: any; // Push the entry to the tableData array
        // Push the entry to the tableData array
        age: any;
        type: any;
      }[] = [];
  if (formattedEntries.length == 0 && attestationTableInfo.length == 0) {
  } else if (attestationTableInfo.length == 0) {
    tableDt = formattedEntries;
  } else if (formattedEntries.length == 0) {
    tableDt = attestationTableInfo;
  } else {
    tableDt = transformAndSortArrays(formattedEntries, attestationTableInfo);
  }
  schemaInfo = schemaInfo ? schemaInfo : SchemaInfo;
  return { tableDt, schemaInfo };
};

export const getEncryptedFilesBlobs = async (
  decodedData: Array<{
    type: string;
    name: string;
    value: string;
    blobs?: Blob[];
    json?: any[];
    CIDs?: string[];
  }>,
  address: `0x${string}`
) => {
  let newRecords = [];
  const jwt = localStorage.getItem(`lighthouse-jwt-${address}`);
  console.log(decodedData);
  if (decodedData) {
    for (const record of decodedData) {
      record.blobs = [];

      if (
        ![
          "jsonCID",
          "jsonCIDs",
          "imageCID",
          "videoCID",
          "imageCIDs",
          "videoCIDs",
        ].includes(record.name)
      ) {
        newRecords.push(record);
      } else if (record.name === "jsonCID") {
        const blob = await decrypt(record.value, address, jwt);
        const json = await parseBlobToJson(blob);
        console.log(json);
        record.CIDs = [record.value];
        record.json = [json];
        record.blobs.push(blob);
        newRecords.push(record);
      } else if (record.name === "jsonCIDs") {
        const response = await fetch(getIpfsGatewayUri(record.value[0]));
        const data = await response.json();

        data.CIDs.map(async (CID: any) => {
          let blob = await decrypt(CID, address, jwt);
          const json = await parseBlobToJson(blob);
          record.json?.push(json);
          record.blobs?.push(blob);
        });
        record.CIDs = data.CIDs;

        newRecords.push(record);
      } else if (record.name === "imageCID" || record.name === "videoCID") {
        let blob = await decrypt(record.value, address, jwt);
        record.CIDs = [record.value];
        record.blobs.push(blob);
        newRecords.push(record);
      } else {
        try {
          const response = await fetch(getIpfsGatewayUri(record.value[0]));
          const data = await response.json();

          let cids = [];
          data.CIDs.map(async (CID: any) => {
            let blob = await decrypt(CID, address, jwt);
            record.blobs?.push(blob);
            cids.push(CID);
          });

          record.CIDs = data.CIDs;
          newRecords.push(record);
        } catch (error) {
          console.error("Error fetching and decrypting:", error);
        }
      }
    }
  }
  console.log(newRecords);

  return newRecords;
};

export const getUserDataInformation = async (address: `0x${string}`) => {
  let key = localStorage.getItem(`API_KEY_${address?.toLowerCase()}`);

  let data = await getUserDataInfo(address, key);
  return data;
};

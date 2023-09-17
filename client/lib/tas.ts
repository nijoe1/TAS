import {
  getAttestation,
  getAttestations,
  getSchemaAttestations,
  getAllSchemas,
  getSchema,
} from "@/lib/tableland";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import {
  getOffChainAttestation,
  getOffChainAttestations,
  transformAndSortArrays,
  getOffChainAttestationsForSchema,
} from "@/lib/offchain";
import {
  transformDecodedData,
  decodeSchema,
  parseInputString,
  parseBlobToJson,
} from "@/lib/utils";
import { decrypt } from "./lighthouse";

interface SchemaData {
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
    const body = JSON.parse(inputObject.content.body);

    // Extracting relevant information
    const schemaUid = body.sig.message.schema || null;
    const toAddress = body.sig.message.recipient || null;
    const fromAddress = body.signer;
    const age = body.sig.message.time;
    const uid =
      inputObject.content.tags.find((tag: any) => tag.slug === "uid")?.title ||
      null;

    const entry = {
      uid: uid,
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
  const data = transformDecodedData(encoder.decodeData(attestation.data));
  return {
    // @ts-ignore
    attestationUID: uid,
    created: attestation.creationTimestamp,
    expiration: attestation.expirationTime === "0" ? "Never" : "Somewhere",
    revoked:
      attestation.revoker === "0x0000000000000000000000000000000000000000"
        ? false
        : true,
    revocable: attestation.revocable == "false" ? false : true,
    resolver: attestation.resolver,

    schemaUID: attestation.schemaUID,
    from: attestation.attester,
    to: attestation.recipient,
    decodedData: data,
    referencedAttestation: "No reference",
    referencingAttestation: 0,
    data:attestation.data,
    context: uid
  };
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
  }[] = [];
  let schemas = await getAllSchemas(chainID);
  console.log(schemas);
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
      // Add other properties as needed from the inputObject
    };

    // Push the entry to the tableData array
    tableData.push(entry);
  });
  return tableData;
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

  for (const inputObject of offChain) {
    const body = JSON.parse(inputObject.content.body);

    // Extracting relevant information
    const toAddress = body.sig.message.recipient || null;
    const fromAddress = body.signer;
    const age = body.sig.message.time;
    const uid =
      inputObject.content.tags.find((tag: any) => tag.slug === "uid")?.title ||
      null;

    const entry = {
      uid: uid,
      fromAddress: fromAddress,
      toAddress: toAddress,
      age: age,
      data: body.sig.message.data.toLowerCase(),
      type: "OFFCHAIN",
    };
    formattedEntries.push(entry);
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
  let tableDt:
    | ((prevState: never[]) => never[])
    | {
        uid: any;
        fromAddress: any;
        toAddress: any;
        age: any;
        data: any;
        type: string;
      }[]
    | {
        uid: any;
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

export const getEncryptedJson = async (
  schema: string,
  data: `0x${string}`,
  address: `0x${string}`
) => {
  const encoder = new SchemaEncoder(schema);
  const ipfsCID = transformDecodedData(encoder.decodeData(data))[0].value;
  const jwt = localStorage.getItem(`lighthouse-jwt-${address}`);
  const blob = await decrypt(ipfsCID, address, jwt);
  const json = await parseBlobToJson(blob);
  const fileblob = await decrypt(json.file.CID, address, jwt);

  return { json, fileblob };
};



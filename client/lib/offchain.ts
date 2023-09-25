// @ts-ignore
import { Orbis } from "@orbisclub/orbis-sdk";
import { CONTRACTS } from "@/constants/contracts/index";
import { getSchemaInfo } from "./tableland";

const orbis = new Orbis();

export const getPostData = (
  schema: `0x${string}`,
  recipient: `0x${string}`,
  revocable: boolean,
  refUID: `0x${string}`,
  data: `0x${string}`,
  AttestationBase64:string,
  signatureV: BigInt,
  signatureR: string,
  signatureS: string,
  uid: `0x${string}`,
  verifyingContract: `0x${string}`,
  chainId: number,
  time: string,
  expirationTime:number,
  attester: `0x${string}`
) => {
  const message = {
    version: 1,
    schema: schema,
    recipient: recipient,
    time: time,
    expirationTime: expirationTime,
    revocable: revocable,
    refUID: refUID,
    data: data,
  } as const;

  const domain = {
    name: "TAS",
    version: "0.0.1",
    chainId: chainId,
    verifyingContract: verifyingContract,
  };

  const postData = {
    signer: attester, // Replace with your actual signer
    sig: {
      domain: domain,
      primaryType: "Attest",
      message: {
        recipient: message.recipient,
        expirationTime: message.expirationTime,
        time: message.time,
        revocable: message.revocable,
        version: message.version,
        nonce: "0",
        schema: message.schema,
        refUID: message.refUID,
        data: message.data,
        base64Data : AttestationBase64
      },
      types: {
        Attest: [
          { name: "version", type: "uint16" },
          { name: "schema", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "time", type: "uint64" },
          { name: "expirationTime", type: "uint64" },
          { name: "revocable", type: "bool" },
          { name: "refUID", type: "bytes32" },
          { name: "data", type: "bytes" },
        ],
      },
      signature: {
        v: signatureV.toString(),
        r: signatureR as `0x${string}`,
        s: signatureS as `0x${string}`,
      },
      uid: uid,
    },
  };

  return postData;
};

export const getDomain = (
  chainID: number,
  verifyingContract: `0x${string}`
) => {
  const domain = {
    name: "TAS",
    version: "0.0.1",
    chainId: chainID, // Ethereum chain ID
    verifyingContract: verifyingContract, // Contract address
  } as const;
  return domain;
};

export const primaryType = "Attest"; // Specify the primary type

export const types = {
  Attest: [
    { name: "version", type: "uint16" },
    { name: "schema", type: "bytes32" },
    { name: "recipient", type: "address" },
    { name: "time", type: "uint64" },
    { name: "expirationTime", type: "uint64" },
    { name: "revocable", type: "bool" },
    { name: "refUID", type: "bytes32" },
    { name: "data", type: "bytes" },
  ],
} as const;

export const AttestTypes = {
  Attest: [
    { name: "schema", type: "bytes32" },
    { name: "recipient", type: "address" },
    { name: "expirationTime", type: "uint64" },
    { name: "revocable", type: "bool" },
    { name: "refUID", type: "bytes32" },
    { name: "data", type: "bytes" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint64" },
  ],
} as const;

export const getTypedData = (
  schema: `0x${string}`,
  Recipient: `0x${string}`,
  revocable: boolean,
  refUID: `0x${string}`,
  data: `0x${string}`,
  time: number,
  chainID: number,
  verifyingContract: `0x${string}`
) => {
  let domain = getDomain(chainID, verifyingContract);
  let message = {
    version: 1, // Specify the version
    schema: schema,
    recipient: Recipient,
    time: time, // Unix timestamp as a string
    expirationTime: 0, // Specify the expiration time
    revocable: revocable, // Specify whether it's revocable or not
    refUID: refUID,
    data: data,
  } as const;
  const typedData = {
    domain: domain,
    message: message,
    primaryType: primaryType,
    types: types,
  };
  return typedData;
};

export const getAttestDelegateTypedData = (
  schema: `0x${string}`,
  Recipient: `0x${string}`,
  revocable: boolean,
  refUID: `0x${string}`,
  data: `0x${string}`,
  chainID: number,
  verifyingContract: `0x${string}`
) => {
  let domain = getDomain(chainID, verifyingContract);
  let message = {
    schema: schema,
    recipient: Recipient,
    expirationTime: 0, // Unix timestamp as a string
    revocable: revocable, // Specify whether it's revocable or not
    refUID: refUID,
    data: data,
    value: "0", // ETH amount as a string
    nonce: "2", // The nonce value
    deadline: "0", // The deadline value
  } as const;
  const typedData = {
    domain: domain,
    message: message,
    primaryType: primaryType,
    types: AttestTypes,
  };
  return typedData;
};

export const getOffChainAttestations = async (chainID: number) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    tag: `address:${TAS}/chainID:${chainID}`,
  });
  return data;
};

export const getOffChainAttestationReferences = async (refUID: string) => {
  // @ts-ignore
  const { data, error } = await orbis.getPosts({
    tag: `refUID/${refUID}`,
  });
  return data;
};

export const getOffChainAttestationsForSchema = async (
  chainID: number,
  schemaUID: string
) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    tag: schemaUID,
  });
  console.log(data);
  return data;
};

export const getDelegatedRequestForSchema = async(schemaUID:string) => { 
  const { data, error } = await orbis.getPosts({
    tag: `DelegatedAttestationRequest/${schemaUID}`,
  });
  console.log(data);
  return data;
}

export const getOffChainAttestationsNumberForSchema = async (
  chainID: number,
  schemaUID: string
) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    tag: schemaUID,
  });
  console.log(data);
  return data.length;
};

export const getUserOffChainAttestations = async (
  chainID: number,
  address: string
) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    tag: `attester/${address?.toLowerCase()}/${TAS}`,
  });
  console.log(data);
  return data;
};

export const getUserOffChainRecievedAttestations = async (
  chainID: number,
  address: string
) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    tag: `recipient/${address?.toLowerCase()}/${TAS}`,
  });
  console.log(data);
  return data;
};

export const getOffChainAttestation = async (chainID: number, uid: string) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    context: `${uid}`,
    tag: uid,
  });
  console.log(data);
  const body = JSON.parse(JSON.stringify(data[0].content.data));

  // Extracting relevant information
  const toAddress = body.sig.message.recipient || null;
  const fromAddress = body.signer;
  const age = body.sig.message.time;
  const revocable = body.sig.message.revocable ? "true" : "false";
  const schemaUID = body.sig.message.schema;
  const refUID = body.sig.message.refUID;
  const expirationTime = body.sig.message.expirationTime;
  let info = await getSchemaInfo(chainID, schemaUID);
  console.log(body.sig.message);
  const entry = {
    creationTimestamp: age,
    expirationTimel: "0",
    schemaUID: schemaUID,
    refUID: refUID,
    attester: fromAddress,
    recipient: toAddress,
    revocable: revocable,
    expirationTime: expirationTime.toString(),
    age: age,
    data: body.sig.message.base64Data,
    revoker: "0x0000000000000000000000000000000000000000",
    // @ts-ignore
    resolver: info.resolver,
    // @ts-ignore
    schema: info.schema,
  };
  return entry;
};

export const transformAndSortArrays = (array1: any[], array2: any[]) => {
  // Concatenate the arrays
  const combinedArray = [...array1, ...array2];

  // Sort the combined array based on age in descending order
  combinedArray.sort((a, b) => b.age - a.age);

  // Transform and format the sorted array
  const transformedArray = combinedArray.map((inputObject) => ({
    uid: inputObject.uid,
    refUID: inputObject.refUID,
    schemaUid: inputObject.schemaUid,
    fromAddress: inputObject.fromAddress,
    toAddress: inputObject.toAddress,
    age: inputObject.age,
    type: inputObject.type,
    data: inputObject.data,
  }));

  return transformedArray;
};

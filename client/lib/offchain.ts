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
  signatureV: BigInt,
  signatureR: string,
  signatureS: string,
  uid: `0x${string}`,
  verifyingContract: `0x${string}`,
  chainId: number,
  time: string,
  attester: `0x${string}`
) => {
  const message = {
    version: 1,
    schema: schema,
    recipient: recipient,
    time: time,
    expirationTime: 0,
    revocable: revocable,
    refUID: refUID,
    data: data,
  } as const;

  const domain = {
    name: "TAS",
    version: "1",
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
        r: signatureR,
        s: signatureS,
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
    version: "1",
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

export const getOffChainAttestations = async (chainID: number) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    context: `off-chain-attestation-${TAS}`,
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
    context: `off-chain-attestation-${TAS}`,
    tag: schemaUID,
  });
  console.log(data);
  return data;
};

export const getOffChainAttestation = async (chainID: number, uid: string) => {
  // @ts-ignore
  const TAS = CONTRACTS.TAS[chainID].contract as `0x${string}`;
  const { data, error } = await orbis.getPosts({
    context: `off-chain-attestation-${TAS}`,
    tag: uid,
  });
console.log(data)
  const body = JSON.parse(data[0].content.body);

  // Extracting relevant information
  const toAddress = body.sig.message.recipient || null;
  const fromAddress = body.signer;
  const age = body.sig.message.time;
  const revocable = body.sig.message.revocable ? "true" : "false";
  const schemaUID = body.sig.message.schema;
  const expirationTime = body.sig.message.expirationTime;
  let info = await getSchemaInfo(chainID, schemaUID);
  console.log(info)
  const entry = {
    creationTimestamp: age,
    expirationTimel: "0",
    schemaUID: schemaUID,
    attester: fromAddress,
    recipient: toAddress,
    revocable: revocable,
    expirationTime: expirationTime,
    age: age,
    data: body.sig.message.data.toLowerCase(),
    revoker: "0x0000000000000000000000000000000000000000",
    // @ts-ignore
    resolver: info.resolver,
    // @ts-ignore
    schema: info.schema
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
    schemaUid: inputObject.schemaUid,
    fromAddress: inputObject.fromAddress,
    toAddress: inputObject.toAddress,
    age: inputObject.age,
    type: inputObject.type,
    data: inputObject.data,
  }));

  return transformedArray;
};

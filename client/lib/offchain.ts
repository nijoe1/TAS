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
  attester:`0x${string}`
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
    domain:domain,
    message:message,
    primaryType:primaryType,
    types:types,
  };
  return typedData;
};

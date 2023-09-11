import axios from "axios";

const tables = {
  5: {
    // SchemaRegistry
    schema: "schema_5_1650",
    // Tableland Attestation Service
    attestation: "attestation_5_1651",
    revocation: "revocation_5_1652",
    // ContentSubscriptionsResolver
    content_group: "group_5_1657",
    content_admins: "creator_5_1658",
    content_subscription: "subscription_5_1659",
    group_revenue: "revenue_5_1660",
    // ACResolver
    attesters: "schema_attesters_5_1655",
    revokers: "schema_revokers_5_1656",
  },
  80001: {
    // SchemaRegistry
    schema: "schema_80001_7313",
    // Tableland Attestation Service
    attestation: "attestation_80001_7315",
    revocation: "revocation_80001_7316",
    // ContentSubscriptionsResolver
    content_group: "group_80001_7347",
    content_admins: "creator_80001_7348",
    content_subscription: "subscription_80001_7349",
    group_revenue: "revenue_80001_7350",
    // ACResolver
    attesters: "schema_attesters_80001_7251",
    revokers: "schema_revokers_80001_7252",

    offChainTimestamp : "offChain_timestamp_80001_7249",
    offChainRevocation: "offChain_revocation_80001_7250"
  },
};

const TablelandGateway =
  "https://testnets.tableland.network/api/v1/query?statement=";

export const getIpfsGatewayUri = (cidOrIpfsUri) => {
  const LIGHTHOUSE_IPFS_GATEWAY =
    "https://gateway.lighthouse.storage/ipfs/{cid}";
  // const cid = cidOrIpfsUri.replace("ipfs://", "");
  return LIGHTHOUSE_IPFS_GATEWAY.replace("{cid}", cidOrIpfsUri);
};

export const getAllSchemas = async (chainId) => {
  const getAllSchemasQuery =
    TablelandGateway + `SELECT * FROM ${tables[chainId].schema}`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestations = async (chainId) => {
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT ${tables[chainId].attestation}.uid , ${tables[chainId].attestation}.attester , ${tables[chainId].attestation}.schemaUID , ${tables[chainId].attestation}.creationTimestamp , ${tables[chainId].attestation}.data , ${tables[chainId].attestation}.recipient , ${tables[chainId].attestation}.expirationTime , ${tables[chainId].attestation}.refUID
       FROM ${tables[chainId].attestation}
       ORDER BY ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchema = async (chainId, schemaUID) => {
  const getSchemaQuery =
    TablelandGateway +
    `SELECT * FROM ${tables[chainId].schema} WHERE ${tables[chainId].schema}.schemaUID='${schemaUID}'`;
  try {
    const result = await axios.get(getSchemaQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchemaAttestations = async (chainId, schemaUID) => {
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT ${tables[chainId].attestation}.uid , ${tables[chainId].attestation}.attester , ${tables[chainId].attestation}.creationTimestamp , ${tables[chainId].attestation}.data , ${tables[chainId].attestation}.recipient , ${tables[chainId].attestation}.expirationTime , ${tables[chainId].attestation}.refUID  FROM ${tables[chainId].attestation} WHERE ${tables[chainId].attestation}.schemaUID=%27${schemaUID}%27
    ORDER BY ${tables[chainId].attestation}.creationTimestamp DESC`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestation = async (chainId, uid) => {
  const getAttestationDataQuery =
    TablelandGateway +
    `SELECT ${tables[chainId].schema}.resolver , ${tables[chainId].schema}.revocable , ${tables[chainId].schema}.schema , ${tables[chainId].schema}.schemaUID ,

    ${tables[chainId].attestation}.attester , ${tables[chainId].attestation}.creationTimestamp , ${tables[chainId].attestation}.data , ${tables[chainId].attestation}.recipient , ${tables[chainId].attestation}.expirationTime , ${tables[chainId].attestation}.refUID ,
      
    ${tables[chainId].revocation}.revocationTime , ${tables[chainId].revocation}.revoker 
    
    FROM ${tables[chainId].attestation} , ${tables[chainId].schema} , ${tables[chainId].revocation}

    WHERE ${tables[chainId].attestation}.uid=%27${uid}%27 AND 
    ${tables[chainId].attestation}.uid = ${tables[chainId].revocation}.uid AND
     ${tables[chainId].attestation}.schemaUID = ${tables[chainId].schema}.schemaUID`;
  try {
    const result = await axios.get(getAttestationDataQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

import axios from "axios";

const tables = {
  5: {
    // SchemaRegistry
    schema: "schema_5_1662",
    // Tableland Attestation Service
    attestation: "attestation_5_1663",
    revocation: "revocation_5_1664",
    // ContentSubscriptionsResolver
    content_group: "group_5_1669",
    content_admins: "creator_5_1670",
    content_subscription: "subscription_5_1671",
    group_revenue: "revenue_5_1672",
    // ACResolver
    attesters: "schema_attesters_5_1655",
    revokers: "schema_revokers_5_1656",
  },
  80001: {
    // SchemaRegistry
    schema: "schema_80001_7403",
    // Tableland Attestation Service
    attestation: "attestation_80001_7404",
    revocation: "revocation_80001_7405",
    // ContentSubscriptionsResolver
    content_group: "group_80001_7410",
    content_admins: "creator_80001_7411",
    content_subscription: "subscription_80001_7412",
    group_revenue: "revenue_80001_7413",
    // ACResolver
    attesters: "schema_attesters_80001_7408",
    revokers: "schema_revokers_80001_7409",

    offChainTimestamp: "offChain_timestamp_80001_7406",
    offChainRevocation: "offChain_revocation_80001_7407",
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
    TablelandGateway +
    `SELECT
          ${tables[chainId].schema}.resolver,
          ${tables[chainId].schema}.schema,
          ${tables[chainId].schema}.schemaUID,
          COUNT(${tables[chainId].attestation}.uid) AS total
      FROM
          ${tables[chainId].schema}
      LEFT JOIN
          ${tables[chainId].attestation}
      ON
          ${tables[chainId].schema}.schemaUID = ${tables[chainId].attestation}.schemaUID
      GROUP BY
          ${tables[chainId].schema}.schemaUID
      ORDER BY ${tables[chainId].schema}.creationTimestamp DESC`;

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

export const getTotalAttestations = async (chainId, schemaUID) => {
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT COUNT(${tables[chainId].attestation}.uid) AS total
    FROM ${tables[chainId].attestation}
    WHERE ${tables[chainId].attestation}.schemaUID='${schemaUID}'`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    return result.data[0].total;
  } catch (err) {
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

export const getAttestAccess = async (chainId, schemaUID, address) => {
  const getSchemaQuery =
    TablelandGateway +
    `SELECT COUNT(${tables[chainId].content_admins}.attester) AS NUM FROM ${
      tables[chainId].content_admins
    } WHERE
     ${tables[chainId].content_admins}.schemaUID='${schemaUID}' AND
     ${tables[chainId].content_admins}.attester='${address.toLowerCase()}'`;
  try {
    const result = await axios.get(getSchemaQuery);
    console.log(result.data);
    return result.data[0].NUM > 0;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getGroupPrice = async (chainId, schemaUID) => {
  const getSchemaQuery =
    TablelandGateway +
    `SELECT ${tables[chainId].content_group}.monthlySubscriptionPrice AS Price FROM ${tables[chainId].content_group} WHERE
     ${tables[chainId].content_group}.schemaUID='${schemaUID}'`;
  try {
    const result = await axios.get(getSchemaQuery);
    console.log(result.data);
    return result.data[0].Price;
  } catch (err) {
    console.error(err);
    return null;
  }
};

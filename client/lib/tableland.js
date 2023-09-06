import axios from "axios";

const tables = {
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
};

const TablelandGateway =
  "https://testnets.tableland.network/api/v1/query?statement=";

export const getIpfsGatewayUri = (cidOrIpfsUri) => {
  const LIGHTHOUSE_IPFS_GATEWAY =
    "https://gateway.lighthouse.storage/ipfs/{cid}";
  // const cid = cidOrIpfsUri.replace("ipfs://", "");
  return LIGHTHOUSE_IPFS_GATEWAY.replace("{cid}", cidOrIpfsUri);
};

export const getAllSchemas = async () => {
  const getAllSchemasQuery =
    TablelandGateway + `SELECT * FROM ${tables.schema}`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestations = async () => {
    const getAllSchemaAttestationsQuery =
      TablelandGateway +
      `SELECT * FROM ${tables.attestation}`;
    try {
      const result = await axios.get(getAllSchemaAttestationsQuery);
      console.log(result);
      return result.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

export const getSchema = async (schemaUID) => {
  const getSchemaQuery =
    TablelandGateway +
    `SELECT * FROM ${tables.schema} WHERE ${tables.schema}.schemaUID='${schemaUID}'`;
  try {
    const result = await axios.get(getSchemaQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchemaAttestations = async (schemaUID) => {
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT * FROM ${tables.attestation} WHERE ${tables.attestation}.schemaUID=%27${schemaUID}%27`;
  try {
    const result = await axios.get(getAllSchemaAttestationsQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAttestation = async (uid) => {
  const getAttestationDataQuery =
    TablelandGateway +
    `SELECT ${tables.schema}.resolver , ${tables.schema}.revocable , ${tables.schema}.schema , ${tables.schema}.schemaUID ,

    ${tables.attestation}.attester , ${tables.attestation}.creationTimestamp , ${tables.attestation}.data , ${tables.attestation}.recipient , ${tables.attestation}.expirationTime , ${tables.attestation}.refUID ,
      
    ${tables.revocation}.revocationTime , ${tables.revocation}.revoker 
    
    FROM ${tables.attestation} , ${tables.schema} , ${tables.revocation}

    WHERE ${tables.attestation}.uid=%27${uid}%27 AND 
    ${tables.attestation}.uid = ${tables.revocation}.uid AND
     ${tables.attestation}.schemaUID = ${tables.schema}.schemaUID`;
  try {
    const result = await axios.get(getAttestationDataQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

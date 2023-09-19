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
    schema: "schema_80001_7433",
    categories: "schema_categories_80001_7434",
    // Tableland Attestation Service
    attestation: "attestation_80001_7435",
    revocation: "revocation_80001_7436",
    info: "schema_info_80001_7441",
    // ContentSubscriptionsResolver
    content_group: "group_80001_7442",
    content_admins: "creator_80001_7443",
    content_subscription: "subscription_80001_7444",
    group_revenue: "revenue_80001_7445",
    // ACResolver
    attesters: "schema_attesters_80001_7439",
    revokers: "schema_revokers_80001_7440",

    offChainTimestamp: "offChain_timestamp_80001_7437",
    offChainRevocation: "offChain_revocation_80001_7438",
  },
};

const TablelandGateway =
  "https://testnets.tableland.network/api/v1/query?statement=";

export const getAllSchemas = async (chainId) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
          ${tables[chainId].schema}.resolver,
          ${tables[chainId].schema}.schema,
          ${tables[chainId].schema}.schemaUID,
          ${tables[chainId].schema}.creationTimestamp,
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

export const getAllUserCreatedSchemas = async (chainId, address) => {
  if (!address) {
    return null;
  }
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
          ${tables[chainId].schema}.resolver,
          ${tables[chainId].schema}.schema,
          ${tables[chainId].schema}.schemaUID,
          ${tables[chainId].schema}.creationTimestamp,
          COUNT(${tables[chainId].attestation}.uid) AS total
      FROM
          ${tables[chainId].schema}
      LEFT JOIN
          ${tables[chainId].attestation}
      ON
          ${tables[chainId].schema}.schemaUID = ${
      tables[chainId].attestation
    }.schemaUID
      WHERE ${tables[chainId].schema}.creator='${address?.toLowerCase()}'
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

export const getCreatedSchemasRevenue = async (chainId, user) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
          ${tables[chainId].group_revenue}.totalClaimed,
          ${tables[chainId].content_admins}.shares,
          ${tables[chainId].group_revenue}.schemaUID

      FROM
          ${tables[chainId].group_revenue}
      JOIN
          ${tables[chainId].content_admins}
      ON
          ${tables[chainId].group_revenue}.schemaUID = ${
      tables[chainId].content_admins
    }.schemaUID
      WHERE ${tables[chainId].content_admins}.attester = '${user.toLowerCase()}'
      GROUP BY
          ${tables[chainId].content_admins}.shares`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    console.log(result);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getUserSubscriptions = async (chainId, address) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
         *
      FROM
          ${tables[chainId].content_subscription}
      WHERE
          ${
            tables[chainId].content_subscription
          }.subscriber = '${address.toLowerCase()}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSchemaInfo = async (chainId, schemaUID) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
          ${tables[chainId].schema}.resolver,
          ${tables[chainId].schema}.schema
      FROM
          ${tables[chainId].schema}
      WHERE
          ${tables[chainId].schema}.schemaUID = '${schemaUID}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data[0];
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

export const getUserAttestations = async (chainId, address) => {
  if (!address) {
    return null;
  }
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT ${tables[chainId].attestation}.uid , ${
      tables[chainId].attestation
    }.attester , ${tables[chainId].attestation}.schemaUID , ${
      tables[chainId].attestation
    }.creationTimestamp , ${tables[chainId].attestation}.data , ${
      tables[chainId].attestation
    }.recipient , ${tables[chainId].attestation}.expirationTime , ${
      tables[chainId].attestation
    }.refUID
       FROM ${tables[chainId].attestation}
       WHERE ${tables[chainId].attestation}.attester='${address?.toLowerCase()}'
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

export const getUserRecievedAttestations = async (chainId, address) => {
  if (!address) {
    return null;
  }
  const getAllSchemaAttestationsQuery =
    TablelandGateway +
    `SELECT ${tables[chainId].attestation}.uid , ${
      tables[chainId].attestation
    }.attester , ${tables[chainId].attestation}.schemaUID , ${
      tables[chainId].attestation
    }.creationTimestamp , ${tables[chainId].attestation}.data , ${
      tables[chainId].attestation
    }.recipient , ${tables[chainId].attestation}.expirationTime , ${
      tables[chainId].attestation
    }.refUID
       FROM ${tables[chainId].attestation}
       WHERE ${
         tables[chainId].attestation
       }.recipient='${address?.toLowerCase()}'
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
    `SELECT ${tables[chainId].attestation}.uid , ${tables[chainId].attestation}.attester , ${tables[chainId].attestation}.creationTimestamp , ${tables[chainId].attestation}.data , ${tables[chainId].attestation}.recipient , ${tables[chainId].attestation}.expirationTime , ${tables[chainId].attestation}.refUID  
    FROM ${tables[chainId].attestation} 
    WHERE ${tables[chainId].attestation}.schemaUID=%27${schemaUID}%27
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
    `SELECT ${tables[chainId].schema}.resolver , ${tables[chainId].revocation}.revocable , ${tables[chainId].schema}.schema , ${tables[chainId].schema}.schemaUID ,

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
  if (address) {
    const getSchemaQuery =
      TablelandGateway +
      `SELECT COUNT(${tables[chainId].content_admins}.attester) AS NUM FROM ${
        tables[chainId].content_admins
      } WHERE
     ${tables[chainId].content_admins}.schemaUID='${schemaUID}' AND
     ${tables[chainId].content_admins}.attester='${address.toLowerCase()}'`;
    try {
      const result = await axios.get(getSchemaQuery);
      return result.data[0].NUM > 0;
    } catch (err) {
      console.error(err);
      return null;
    }
  } else {
    return null;
  }
};

export const getAttestRevokeAccess = async (chainId, address) => {
  if (address) {
    const getSchemaQuery =
      TablelandGateway +
      `SELECT COUNT(${tables[chainId].attesters}.attester) AS rev , COUNT(${
        tables[chainId].revokers
      }.revoker) AS at FROM ${tables[chainId].attesters}, ${
        tables[chainId].revokers
      } WHERE
     ${tables[chainId].attesters}.attester='${address.toLowerCase()}' AND
     ${tables[chainId].revokers}.revoker='${address.toLowerCase()}'`;
    try {
      const result = await axios.get(getSchemaQuery);
      
      return {revokeAccess: (result.data[0].rev > 0), attestAccess:(result.data[0].at > 0)};
    } catch (err) {
      console.error(err);
      return null;
    }
  } else {
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

import axios from "axios";
import lighthouse from "@lighthouse-web3/sdk";
import {
  getJWT,
  generate,
  saveShards,
  recoverShards,
  recoverKey,
} from "@lighthouse-web3/kavach";
import { CONTRACTS } from "@/constants/contracts/index";

const LighthouseChains = {
  80001: {
    name: "Mumbai",
  },
  420: {
    name: "OptimismGoerli",
  },
  314159: {
    name: "Calibration",
  },
};

const dealParams = {
  num_copies: 3,
};

export const getIpfsGatewayUri = (cidOrIpfsUri) => {
  const LIGHTHOUSE_IPFS_GATEWAY =
    "https://gateway.lighthouse.storage/ipfs/{cid}";
  // const cid = cidOrIpfsUri.replace("ipfs://", "");
  return LIGHTHOUSE_IPFS_GATEWAY.replace("{cid}", cidOrIpfsUri);
};

export const getIpfsCID = (ipfsCIDLink) => {
  const LIGHTHOUSE_IPFS_GATEWAY = "https://gateway.lighthouse.storage/ipfs/";
  // const cid = cidOrIpfsUri.replace("ipfs://", "");
  return ipfsCIDLink.replace(LIGHTHOUSE_IPFS_GATEWAY, "");
};

export const uploadFile = async (file, apiKey, setUploadProgress) => {
  const progressCallback = (progressData) => {
    const percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    setUploadProgress(percentageDone); // Update the progress state
  };
  const output = await lighthouse.upload(
    file,
    apiKey,
    false,
    null,
    progressCallback,
    dealParams
  );
  let RAAS_Response = await registerCIDtoRAAS(output.data.Hash);
  console.log(RAAS_Response);

  return output.data;
};

export const uploadFolder = async (files, type, apiKey, setUploadProgress) => {
  const progressCallback = (progressData) => {
    const percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    setUploadProgress(percentageDone); // Update the progress state
  };
  let CIDs = [];

  const output = await lighthouse.upload(
    files,
    apiKey,
    true,
    null,
    progressCallback,
    dealParams
  );
  console.log(output);
  for (const file of output.data) {
    if (file.Name != "") {
      // console.log(file);
      CIDs.push(file.Hash);
      console.log(file.Hash);
      let RAAS_Response = await registerCIDtoRAAS(file.Hash);
      // console.log(RAAS_Response);
    }
  }
  // Create JSON object
  const json = {
    type: type,
    CIDs: CIDs,
  };

  const jsonBlob = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });

  // Create a File object from the Blob
  const jsonFile = new File([jsonBlob], `type.json`, {
    type: "application/json",
  });

  const jsonCID = await lighthouse.upload(
    [jsonFile],
    apiKey,
    false,
    null,
    progressCallback,
    dealParams
  );
  console.log(jsonCID);
  return [jsonCID.data.Hash];
};

export const jsonCIDsUpload = async (apiKey, type, CIDs) => {
  // Create JSON object
  const json = {
    type: type,
    CIDs: CIDs,
  };

  const jsonBlob = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });

  // Create a File object from the Blob
  const jsonFile = new File([jsonBlob], `type.json`, {
    type: "application/json",
  });

  const jsonCID = await lighthouse.upload(
    [jsonFile],
    apiKey,
    false,
    null,
    null,
    dealParams
  );
  return [jsonCID.data.Hash];
};

/* Deploy file along with encryption */
export const uploadFileEncrypted = async (
  file,
  apiKey,
  address,
  jwt,
  setUploadProgress
) => {
  const progressCallback = (progressData) => {
    const percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    setUploadProgress(percentageDone); // Update the progress state
  };
  const output = await lighthouse.uploadEncrypted(
    file,
    apiKey,
    address,
    jwt,
    null,
    progressCallback,
    dealParams
  );

  const { masterKey, keyShards } = await generate();

  const { isSuccess } = await saveShards(
    address,
    output.data[0].cid,
    jwt,
    keyShards
  );
  console.log(isSuccess);

  let RAAS_Response = await registerCIDtoRAAS(output.data[0].cid);
  console.log(RAAS_Response);

  return output.data;
};

const registerCIDtoRAAS = async (cid) => {
  const formData = new FormData();

  const defaultEndDate = new Date();
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 12);
  const defaultReplicationTarget = 3;
  const defaultEpochs = 4;

  formData.append("cid", cid);
  formData.append("endDate", defaultEndDate);
  formData.append("replicationTarget", defaultReplicationTarget);
  formData.append("epochs", defaultEpochs);

  try {
    const response = await axios.post(
      "https://calibration.lighthouse.storage/api/register_job",
      formData
    );
    console.log("Job registered successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error registering job:", error);
  }
};

export const getDealStatusByCID = async (cid) => {
  const endpoint = `https://calibration.lighthouse.storage/api/deal_status?cid=${cid}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch deal status. Status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching deal status:", error.message);
    return null;
  }
};

export const generateLighthouseJWT = async (address, signEncryption) => {
  const response = await getJWT(address, signEncryption);
  if (response.JWT) {
    localStorage.setItem(`lighthouse-jwt-${address}`, response.JWT);
    return response.JWT;
  }

  if (response.error) {
    return null;
  }
};

export const decrypt = async (cid, address, jwt) => {
  const conditions = await lighthouse.getAccessConditions(cid);
  let decrypted;
  const { error, shards } = await recoverShards(address, cid, jwt, 3);
  try {
    const { masterKey } = await recoverKey(shards);
    const fileType = "application/json";
    decrypted = await lighthouse.decryptFile(cid, masterKey, fileType);
  } catch {
    console.log("error in decription")
  }
  /*
    Response: blob
  */
  return decrypted;
};

export const applyAccessConditions = async (
  cid,
  chainID,
  uid,
  address,
  jwt,
  resolver
) => {
  console.log(resolver, chainID, uid);
  const conditions = [
    {
      id: 1,
      chain: LighthouseChains[chainID].name,
      method: "hasAccess",
      standardContractType: "Custom",
      contractAddress: resolver,
      returnValueTest: {
        comparator: "==",
        value: "true",
      },
      parameters: [":userAddress", uid],
      inputArrayType: ["address", "bytes32"],
      outputType: "bool",
    },
  ];
  const aggregator = "([1])";

  const response = await lighthouse.applyAccessCondition(
    address,
    cid,
    jwt,
    conditions,
    aggregator
  );

  let RAAS_Response = await registerCIDtoRAAS(cid);

  const { masterKey, keyShards } = await generate();

  const { isSuccess } = await saveShards(
    address,
    response.data.cid,
    jwt,
    keyShards
  );
  console.log(isSuccess);
  return response;
};

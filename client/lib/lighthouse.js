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
  5: {
    name: "Goerli",
  },
  10: {
    name: "OptimismGoerli",
  },
  11: {
    name: "",
  },
  3124: {
    name: "Calibration",
  },
};

export const getIpfsGatewayUri = (cidOrIpfsUri) => {
  const LIGHTHOUSE_IPFS_GATEWAY =
    "https://gateway.lighthouse.storage/ipfs/{cid}";
  // const cid = cidOrIpfsUri.replace("ipfs://", "");
  return LIGHTHOUSE_IPFS_GATEWAY.replace("{cid}", cidOrIpfsUri);
};

export const getMetadata = async (cidOrIpfsUri) => {
  const LighthouseGatewayLink = getIpfsGatewayUri(cidOrIpfsUri);
  console.log(`Getting metadata ${cidOrIpfsUri} at ${LighthouseGatewayLink}`);
  const link = LighthouseGatewayLink.replace("ipfs://", "");
  try {
    const result = await axios.get(link);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getData = async (cidOrIpfsUri) => {
  let LighthouseGatewayLink = getIpfsGatewayUri(cidOrIpfsUri);

  console.log(`Getting data ${cidOrIpfsUri} at ${nftStorageGatewayLink}`);
  const link = LighthouseGatewayLink.replace("ipfs://", "");

  try {
    const result = await axios.get(link);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const progressCallback = (progressData) => {
  let percentageDone =
    100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
  return percentageDone;
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
    progressCallback
  );
  console.log("File Status:", output);
  console.log(
    "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
  );
  return output.data;
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
  const { masterKey, keyShards } = await generate();
  const output = await lighthouse.uploadEncrypted(
    file,
    apiKey,
    address,
    jwt,
    null,
    progressCallback
  );

  return output.data;
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
  const { error, shards } = await recoverShards(address, cid, jwt, 3);
  console.log(error,shards)
  const { masterKey } = await recoverKey(shards);
  // const keyObject = await lighthouse.fetchEncryptionKey(cid, address, jwt);

  const fileType = "application/json";
  const decrypted = await lighthouse.decryptFile(cid, masterKey, fileType);
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
  jwt
) => {
  const conditions = [
    {
      id: 1,
      chain: LighthouseChains[chainID].name,
      method: "hasAccess",
      standardContractType: "Custom",
      contractAddress: CONTRACTS.SubscriptionResolver[chainID].contract,
      returnValueTest: {
        comparator: "==",
        value: "1",
      },
      parameters: [":address", uid],
      inputArrayType: ["address", "bytes32"],
      outputType: "uint256",
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
  const { masterKey, keyShards } = await generate();

  const { isSuccess } = await saveShards(
    address,
    response.data.cid,
    jwt,
    keyShards
  );
  console.log(isSuccess)

  return response;
};

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { NFTStorage, Blob } from "nft.storage";
import axios from "axios";
import { ENS } from "@ensdomains/ensjs";
import { providers } from "ethers";

const tables = {
  categories: "hypercert_categories_5_1641",
  fundings: "hypercert_fundings_5_1642",
  attestations: "hypercert_attestations_5_1643",
  tasks: "hypercert_completed_tasks_5_1644",
  project_events: "hypercert_events_5_1645",
  project_splitters: "hypercert_splitters_5_1646",
  company: "company_5_1647",
  company_event: "event_5_1648",
  company_event_verifiers: "event_verifiers_5_1649",
};

export const getIpfsGatewayUri = (cidOrIpfsUri) => {
  const NFT_STORAGE_IPFS_GATEWAY = "https://nftstorage.link/ipfs/{cid}";
  // const cid = cidOrIpfsUri.replace("ipfs://", "");
  return NFT_STORAGE_IPFS_GATEWAY.replace("{cid}", cidOrIpfsUri);
};

const defaultNftStorageClient = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyYTBDMUE4NjVDYUQ2QjRkNThBMmQ3ZTczM2QxQmZlODExMGI1MTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1Mzc2MzE0NjQ2NiwibmFtZSI6Im5mdHMifQ.muYCOBPi5WGkwgsQIxNe2GOSpgVxzZf_4Dv5jiEq9Dk",
});

export const storeMetadata = async (data) => {
  console.log("Storing metadata: ", data);
  const client = defaultNftStorageClient; // Update this if you have a custom NFT storage client
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  return await client.storeBlob(blob);
};

export const getMetadata = async (cidOrIpfsUri) => {
  const nftStorageGatewayLink = getIpfsGatewayUri(cidOrIpfsUri);
  console.log(`Getting metadata ${cidOrIpfsUri} at ${nftStorageGatewayLink}`);
  const link = nftStorageGatewayLink.replace("ipfs://", "");
  try {
    const result = await axios.get(link);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getProfile = async (handle) => {
  const ens = new ENS();
  // const transactions  = {
  //    textSet: resolver.contract.methods.setText(node, "url", "https://ethereum.org/").encodeABI();
  // }
  const provider = new providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth_goerli"
  );
  await ens.setProvider(provider);
  let name = await ens.getText(handle, "name");
  let description = await ens.getText(handle, "description");
  let image = await ens.getText(handle, "image");
  let github = await ens.getText(handle, "com.github");
  github = "https://github.com/" + github;
  let twitter = await ens.getText(handle, "twitter");

  let profile = {
    name: name ? name : "Name",
    title: description ? description : "Web Developer",
    image: image
      ? image
      : "https://gateway.lighthouse.storage/ipfs/QmbWt4Fyggz6dWEvvGFW6TjSSyL4TLo2FfBKmC7MWD1r6n",
    github: github ? github : "https://github.com",
    twitter: twitter ? twitter : "https://twitter.com",
  };
  return profile;
};

export const updateProfile = async (handle) => {
  const ens = new ENS();
  // const transactions  = {
  //    textSet: resolver.contract.methods.setText(node, "url", "https://ethereum.org/").encodeABI();
  // }
  const provider = new providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth_goerli"
  );
  const resolver = await ens.getResolver(handle);
  await ens.setProvider(provider);
  let name = await ens.getText(handle, "name");
  let description = await ens.getText(handle, "description");
  let image = await ens.getText(handle, "image");
  let github = await ens.getText(handle, "com.github");
  github = "https://github.com/" + github;
  let twitter = await ens.getText(handle, "twitter");

  let profile = {
    name: name ? name : "Name",
    title: description ? description : "Web Developer",
    image: image
      ? image
      : "https://gateway.lighthouse.storage/ipfs/QmbWt4Fyggz6dWEvvGFW6TjSSyL4TLo2FfBKmC7MWD1r6n",
    github: github ? github : "https://github.com",
    twitter: twitter ? twitter : "https://twitter.com",
  };
  return profile;
};

export const storeData = async (data) => {
  const client = defaultNftStorageClient; // Update this if you have a custom NFT storage client
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  console.log("Storing blob of: ", data);
  return await client.storeBlob(blob);
};

export const storeImage = async (image) => {
  const client = defaultNftStorageClient; // Update this if you have a custom NFT storage client
  const cid = await client.storeDirectory([
    new File([image], `image.png`, { type: "image/png" }),
  ]);
  return cid;
};

export const getData = async (cidOrIpfsUri) => {
  let nftStorageGatewayLink = getIpfsGatewayUri(cidOrIpfsUri);

  console.log(`Getting data ${cidOrIpfsUri} at ${nftStorageGatewayLink}`);
  const link = nftStorageGatewayLink.replace("ipfs://", "");

  try {
    const result = await axios.get(link);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

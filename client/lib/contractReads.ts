import { BigNumber, ethers } from "ethers";
import { CONTRACTS } from "@/constants/contracts/index";

const providers = {
  314159: new ethers.providers.JsonRpcProvider(
    "https://filecoin-calibration.chainstacklabs.com/rpc/v1	"
  ),
  80001:new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/polygon_mumbai	"
  ),
};

const getProvider = async(chainID:number)=>{
  let provider
  if(chainID == 80001){
    provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/polygon_mumbai	"
    )
  }else{
    provider = new ethers.providers.JsonRpcProvider(
      "https://filecoin-calibration.chainstacklabs.com/rpc/v1	"
    )
  }
  return provider

}
const getSchemaIndexer = async (chainID: number) => {
  const schemaIndexer = new ethers.Contract(
    // @ts-ignore
    CONTRACTS.SchemaRegistry[chainID].contract,
    // @ts-ignore
    CONTRACTS.SchemaRegistry[chainID].api,
    // @ts-ignore
    providers[chainID]!
  );
  return schemaIndexer;
};

const getTAS = async (chainID: number) => {
  let provider = await getProvider(chainID)
  const tas = new ethers.Contract(
    // @ts-ignore
    CONTRACTS.TAS[chainID].contract,
    // @ts-ignore
    CONTRACTS.TAS[chainID].abi,
    // @ts-ignore
    provider
  );
  return tas;
};
// --------------------------------------------------------- DB_NFT_CONTRACT INTERACTIONS -----------------------------------------------------------------------------------------------
export const getSchemaRegistryTables = async (chainID: number) => {
  const schemaIndexer = await getSchemaIndexer(chainID);

  let totalUpdates = await schemaIndexer.tablesUpdates();
  let tables = [];
  for (let i = 0; i <= totalUpdates; i++) {
    tables.push({
      table1: await schemaIndexer.tables(0),
      table2: await schemaIndexer.tables(1),
    });
  }
};

export const getSchemaType = (resolver: string, chainID: number) => {
  if (resolver == "0x0000000000000000000000000000000000000000") {
    return "STANDARD";
  } else if (
    // @ts-ignore
    resolver == CONTRACTS.SubscriptionResolver[chainID].contract.toLowerCase()
  ) {
    return "SUBSCRIPTION";
  } else {
    return "ACCESS_CONTROL";
  }
};

export const getPrice = (wei: string) => {
  const price = wei;
  return price;
};

export const getSubscriptionTables = async (chainID: number) => {
  const schemaIndexer = await getSchemaIndexer(chainID);

  let totalUpdates = await schemaIndexer.tablesUpdates();
  let tables = [];
  for (let i = 0; i <= totalUpdates; i++) {
    tables.push({
      table1: await schemaIndexer.tables(0),
      table2: await schemaIndexer.tables(1),
    });
  }
};

export const getTime = async (chainID: number) => {
  const tas = await getTAS(chainID);
  let time = await tas.getTime();
  return time;
};

export const getACTables = async (chainID: number) => {
  const schemaIndexer = await getSchemaIndexer(chainID);

  let totalUpdates = await schemaIndexer.tablesUpdates();
  let tables = [];
  for (let i = 0; i <= totalUpdates; i++) {
    tables.push({
      table1: await schemaIndexer.tables(0),
      table2: await schemaIndexer.tables(1),
    });
  }
};

export const getTASTables = async (chainID: number) => {
  const schemaIndexer = await getSchemaIndexer(chainID);

  let totalUpdates = await schemaIndexer.tablesUpdates();
  let tables = [];
  for (let i = 0; i <= totalUpdates; i++) {
    tables.push({
      table1: await schemaIndexer.tables(0),
      table2: await schemaIndexer.tables(1),
    });
  }
};

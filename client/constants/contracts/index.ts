import { Address } from "viem";
import TAS from "../../../contracts/deployments/goerli/TAS.json";
import SubscriptionResolver from "../../../contracts/deployments/goerli/ContentSubscriptionResolver.json";
import SchemaRegistry from "../../../contracts/deployments/goerli/SchemaRegistry.json";

export const CONTRACTS = {
  TAS: {
    5: {
      contract: TAS.address as Address,
      abi: TAS.abi,
    },
  },
  SubscriptionResolver:{
    5: {
      contract: SubscriptionResolver.address as Address,
      abi: SubscriptionResolver.abi
    }
  },
  SchemaRegistry:{
    5: {
      contract: SchemaRegistry.address as Address,
      abi: SchemaRegistry.abi
    }
  },
};

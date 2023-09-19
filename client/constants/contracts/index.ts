import TAS from "./deployments/goerli/TAS.json";
import SubscriptionResolver from "./deployments/goerli/ContentSubscriptionResolver.json";
import SchemaRegistry from "./deployments/goerli/SchemaRegistry.json";

import TAS_m from "./deployments/mumbai/TAS.json";
import SubscriptionResolver_m from "./deployments/mumbai/ContentSubscriptionResolver.json";
import SchemaRegistry_m from "./deployments/mumbai/SchemaRegistry.json";
import ACResolver_m from "./deployments/mumbai/ACResolver.json";

export const CONTRACTS = {
  TAS: {
    5: {
      contract: TAS.address,
      abi: TAS.abi,
    },
    80001: {
      contract: TAS_m.address,
      abi: TAS_m.abi,
    },
  },
  SubscriptionResolver: {
    5: {
      contract: SubscriptionResolver.address,
      abi: SubscriptionResolver.abi,
    },
    80001: {
      contract: SubscriptionResolver_m.address,
      abi: SubscriptionResolver_m.abi,
    },
  },
  SchemaRegistry: {
    5: {
      contract: SchemaRegistry.address,
      abi: SchemaRegistry.abi,
    },
    80001: {
      contract: SchemaRegistry_m.address,
      abi: SchemaRegistry_m.abi,
    },
  },
  ACResolver: {
    80001: {
      contract: ACResolver_m.address,
      abi: ACResolver_m.abi,
    },
  },
};

import TAS from "./deployments/optimism_goerli/TAS.json";
import SubscriptionResolver from "./deployments/optimism_goerli/ContentSubscriptionResolver.json";
import SchemaRegistry from "./deployments/optimism_goerli/SchemaRegistry.json";
import ACResolver from "./deployments/optimism_goerli/ACResolver.json";

import TAS_m from "./deployments/mumbai/TAS.json";
import SubscriptionResolver_m from "./deployments/mumbai/ContentSubscriptionResolver.json";
import SchemaRegistry_m from "./deployments/mumbai/SchemaRegistry.json";
import ACResolver_m from "./deployments/mumbai/ACResolver.json";

import TAS_f from "./deployments/calibration/TAS.json";
import SubscriptionResolver_f from "./deployments/calibration/ContentSubscriptionResolver.json";
import SchemaRegistry_f from "./deployments/calibration/SchemaRegistry.json";
import ACResolver_f from "./deployments/calibration/ACResolver.json";

export const CONTRACTS = {
  TAS: {
    420: {
      contract: TAS.address,
      abi: TAS.abi,
    },
    80001: {
      contract: TAS_m.address,
      abi: TAS_m.abi,
    },
    314159: {
      contract: TAS_f.address,
      abi: TAS_f.abi,
    },
  },
  SubscriptionResolver: {
    420: {
      contract: SubscriptionResolver.address,
      abi: SubscriptionResolver.abi,
    },
    80001: {
      contract: SubscriptionResolver_m.address,
      abi: SubscriptionResolver_m.abi,
    },
    314159: {
      contract: SubscriptionResolver_f.address,
      abi: SubscriptionResolver_f.abi,
    },
  },
  SchemaRegistry: {
    420: {
      contract: SchemaRegistry.address,
      abi: SchemaRegistry.abi,
    },
    80001: {
      contract: SchemaRegistry_m.address,
      abi: SchemaRegistry_m.abi,
    },
    314159: {
      contract: SchemaRegistry_f.address,
      abi: SchemaRegistry_f.abi,
    },
  },
  ACResolver: {
    80001: {
      contract: ACResolver_m.address,
      abi: ACResolver_m.abi,
    },
    420: {
      contract: ACResolver.address,
      abi: ACResolver.abi,
    },
    314159: {
      contract: ACResolver_f.address,
      abi: ACResolver_f.abi,
    },
  },
};

import { Address } from "viem";
import TAS from "../../../contracts/deployments/goerli/TAS.json";

export const CONTRACTS = {
  TAS: {
    5: {
      contract: TAS.address as Address,
      abi: TAS.abi,
    },
  },
};

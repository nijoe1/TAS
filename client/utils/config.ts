import {
  polygonMumbai,
  // polygonZkEvmTestnet,
  goerli,
  optimismGoerli,
  // filecoinHyperspace,
  filecoinCalibration,
  // baseGoerli
} from "wagmi/chains";

export const ETH_CHAINS = [
  {
    ...polygonMumbai,
    rpcUrls: {
      public: {
        http: ["https://polygon-mumbai.blockpi.network/v1/rpc/public"],
      },
      default: {
        http: ["https://polygon-mumbai.blockpi.network/v1/rpc/public"],
      },
    },
  },
  // polygonZkEvmTestnet,
  {
    ...goerli,
    rpcUrls: {
      public: {
        http: [
          "https://eth-goerli.g.alchemy.com/v2/KrBcDUxkHvNjkiyMe1l6kqvoI9hOb3vd",
        ],
      },
      default: {
        http: [
          "https://eth-goerli.g.alchemy.com/v2/KrBcDUxkHvNjkiyMe1l6kqvoI9hOb3vd",
        ],
      },
    },
  },
  optimismGoerli,
  {
    ...filecoinCalibration,
    iconUrl:
      "https://gateway.lighthouse.storage/ipfs/QmXQMtADMsCqsYEvyuEA3PkFq2xtWAQetQFtkybjEXvk3Z",
  },
  // filecoinHyperspace,
  // baseGoerli,
];
export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

export const SITE_NAME = "TablelandAttestationService";
export const SITE_DESCRIPTION =
  "Unlock potential with attestations through Tableland Attestation Service (TAS) to build trust and enable on-chain use cases, such as decentralized identity. Attestations are simple yet potent building blocks.";
export const SITE_URL = "https://tas.vercel.app";

export const ironOptions = {
  cookieName: SITE_NAME,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

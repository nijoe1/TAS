import { polygonMumbai, filecoinCalibration } from "wagmi/chains";

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
  {
    ...filecoinCalibration,
    rpcUrls: {
      public: {
        http: ["https://filecoin-calibration.chainstacklabs.com/rpc/v1"],
      },
      default: {
        http: ["https://filecoin-calibration.chainstacklabs.com/rpc/v1"],
      },
    },
    iconUrl:
      "https://gateway.lighthouse.storage/ipfs/QmXQMtADMsCqsYEvyuEA3PkFq2xtWAQetQFtkybjEXvk3Z",
  },
];
export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

export const SITE_NAME = "TablelandAttestationService";
export const SITE_DESCRIPTION =
  "Unlock potential with attestations through Tableland Attestation Service (TAS) to build trust and enable on-chain use cases, such as decentralized identity. Attestations are simple yet potent building blocks.";
export const SITE_URL = "https://tas.vercel.app";

export const ironOptions = {
  cookieName: SITE_NAME,
  password:
    process.env.SESSION_PASSWORD ??
    "set_a_complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

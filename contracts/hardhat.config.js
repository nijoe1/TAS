require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
        // details: { yul: false },
      },
    },
  },
  // defaultNetwork: "calibration",
  defaultNetwork: "optimism_goerli",
  // defaultNetwork: "mumbai",

  networks: {
    goerli: {
      chainId: 5,
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [PRIVATE_KEY],
    },
    optimism_goerli: {
      chainId: 420,
      url: "https://opt-goerli.g.alchemy.com/v2/Qs0oArxRd6ljm5ELdIzJ1qHhbvbjndSu",
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      chainId: 80001,
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: [PRIVATE_KEY],
    },
    calibration: {
      chainId: 314159,
      url: "https://filecoin-calibration.chainstacklabs.com/rpc/v1",
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {

    // Mumbai
    // apiKey: "JYMKRTHHFUSX4X11I1NQRNW6X7K2FJFJUU",
    // Optimism Goerli
    apiKey: "MPZZXTM8AFBE965THC1C7JPUA4BUA348KD",
    customChains: [],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

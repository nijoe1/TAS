require("hardhat-deploy");
require("hardhat-deploy-ethers");
const {
  EAS,
  Offchain,
  SchemaEncoder,
  SchemaRegistry,
} = require("@ethereum-attestation-service/eas-sdk");

const { ethers } = require("hardhat");
const { Console } = require("console");

const private_key = network.config.accounts[0];

const wallet = new ethers.Wallet(private_key, ethers.provider);

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;
  console.log("Wallet+ Ethereum Address:", wallet.address);

  //deploy SchemaRegistry
  const SchemaRegistry = await deploy("SchemaRegistry", {
    from: wallet.address,
    args: [],
    log: true,
  });

  //deploy SchemaRegistry
  const TAS = await deploy("TAS", {
    from: wallet.address,
    args: [SchemaRegistry.address],
    log: true,
  });

  //deploy SchemaRegistry
  const Splitter = await deploy("Splitter", {
    from: wallet.address,
    args: [],
    log: true,
  });

  //deploy SchemaRegistry
  const SplitterFactory = await deploy("SplitterFactory", {
    from: wallet.address,
    args: [Splitter.address],
    log: true,
  });

  //deploy SchemaRegistry
  const ACResolver = await deploy("ACResolver", {
    from: wallet.address,
    args: [TAS.address, SplitterFactory.address, SchemaRegistry.address],
    log: true,
  });

  //deploy SchemaRegistry
  const ContentSubscriptionResolver = await deploy(
    "ContentSubscriptionResolver",
    {
      from: wallet.address,
      args: [TAS.address, SplitterFactory.address, SchemaRegistry.address],
      log: true,
    }
  );
};

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
  const SchemaTablelandIndexer = await deploy("SchemaTablelandIndexer", {
    from: wallet.address,
    args: [],
    log: true,
  });

  //deploy SchemaRegistry
  const TASIndexer = await deploy("TASIndexer", {
    from: wallet.address,
    args: [],
    log: true,
  });

  await hre.run("verify:verify", {
    address: SchemaTablelandIndexer.address,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: TASIndexer.address,
    constructorArguments: [],
  });

  //deploy SchemaRegistry
  const SchemaRegistry = await deploy("SchemaRegistry", {
    from: wallet.address,
    args: [SchemaTablelandIndexer.address],
    log: true,
  });

  await hre.run("verify:verify", {
    address: SchemaRegistry.address,
    constructorArguments: [SchemaTablelandIndexer.address],
  });

  //deploy SchemaRegistry
  const TAS = await deploy("TAS", {
    from: wallet.address,
    args: [TASIndexer.address, SchemaRegistry.address],
    log: true,
  });

  // await hre.run("verify:verify", {
  //   address: TAS.address,
  //   args: [TASIndexer.address, SchemaRegistry.address],
  // });

  //deploy SchemaRegistry
  const Splitter = await deploy("Splitter", {
    from: wallet.address,
    args: [],
    log: true,
  });

  await hre.run("verify:verify", {
    address: Splitter.address,
    constructorArguments: [],
  });

  //deploy SchemaRegistry
  const SplitterFactory = await deploy("SplitterFactory", {
    from: wallet.address,
    args: [Splitter.address],
    log: true,
  });

  await hre.run("verify:verify", {
    address: SplitterFactory.address,
    constructorArguments: [Splitter.address],
  });

  //deploy SchemaRegistry
  const ACResolverIndexer = await deploy("ACResolverIndexer", {
    from: wallet.address,
    args: [],
    log: true,
  });

    //deploy SchemaRegistry
    const ACResolver = await deploy("ACResolver", {
      from: wallet.address,
      args: [TAS.address, SplitterFactory.address, SchemaRegistry.address,ACResolverIndexer.address],
      log: true,
    });

    await hre.run("verify:verify", {
      address: ACResolverIndexer.address,
      constructorArguments: [

      ],
    });

  await hre.run("verify:verify", {
    address: ACResolver.address,
    constructorArguments: [
      TAS.address,
      SplitterFactory.address,
      SchemaRegistry.address,ACResolverIndexer.address
    ],
  });

  //deploy SchemaRegistry
  const TablelandSubscriptions = await deploy("TablelandSubscriptionsIndexer", {
    from: wallet.address,
    args: [],
    log: true,
  });

  //deploy SchemaRegistry
  const ContentSubscriptionResolver = await deploy(
    "ContentSubscriptionResolver",
    {
      from: wallet.address,
      args: [
        TAS.address,
        SplitterFactory.address,
        SchemaRegistry.address,
        TablelandSubscriptions.address,
      ],
      log: true,
    }
  );

  await hre.run("verify:verify", {
    address: TablelandSubscriptions.address,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: ContentSubscriptionResolver.address,
    constructorArguments: [
      TAS.address,
      SplitterFactory.address,
      SchemaRegistry.address,
      TablelandSubscriptions.address,
    ],
  });
};

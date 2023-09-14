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

  // //deploy SchemaRegistry
  // const SchemaTablelandIndexer = await deploy("SchemaTablelandIndexer", {
  //   from: wallet.address,
  //   args: [],
  //   log: true,
  // });

  // //deploy SchemaRegistry
  // const SchemaRegistry = await deploy("SchemaRegistry", {
  //   from: wallet.address,
  //   args: [SchemaTablelandIndexer.address],
  //   log: true,
  // });

  // const SchemaIndexerContract = await hre.ethers.getContractFactory("SchemaTablelandIndexer")
  // const SchemaIndexerContractInstance = SchemaIndexerContract.attach(SchemaTablelandIndexer.address);

  // let makeRegistryOwner = await SchemaIndexerContractInstance.transferOwnership(SchemaRegistry.address)
  // await makeRegistryOwner.wait()

  // console.log("Registry IS Schema_INDEXER OWNER")

  // //deploy SchemaRegistry
  // const TASIndexer = await deploy("TASIndexer", {
  //   from: wallet.address,
  //   args: [],
  //   log: true,
  // });

  // //deploy SchemaRegistry
  // const TAS = await deploy("TAS", {
  //   from: wallet.address,
  //   args: [TASIndexer.address, SchemaRegistry.address],
  //   log: true,
  // });

  // const TasIndexerContract = await hre.ethers.getContractFactory("TASIndexer")
  // const TasIndexerContractInstance = TasIndexerContract.attach(TASIndexer.address);

  // let makeTasOwner = await TasIndexerContractInstance.transferOwnership(TAS.address)
  // await makeTasOwner.wait()

  // console.log("TAS IS INDEXER OWNER")

  // //deploy SchemaRegistry
  // const Splitter = await deploy("Splitter", {
  //   from: wallet.address,
  //   args: [],
  //   log: true,
  // });

  // //deploy SchemaRegistry
  // const SplitterFactory = await deploy("SplitterFactory", {
  //   from: wallet.address,
  //   args: [Splitter.address],
  //   log: true,
  // });

  // //deploy SchemaRegistry
  // const ACResolver = await deploy("ACResolver", {
  //   from: wallet.address,
  //   args: [TAS.address, SplitterFactory.address, SchemaRegistry.address],
  //   log: true,
  // });

  // //deploy SchemaRegistry
  // const TablelandSubscriptions = await deploy("TablelandSubscriptionsIndexer", {
  //   from: wallet.address,
  //   args: [],
  //   log: true,
  // });

  // const ContentSubscriptionResolver = await deploy(
  //   "ContentSubscriptionResolver",
  //   {
  //     from: wallet.address,
  //     args: [
  //       TAS.address,
  //       SplitterFactory.address,
  //       SchemaRegistry.address,
  //       TablelandSubscriptions.address,
  //     ],
  //     log: true,
  //   }
  // );

  // const TablelandSubscriptionsIndexer = await hre.ethers.getContractFactory(
  //   "TablelandSubscriptionsIndexer"
  // );
  // const TablelandSubscriptionsContractInstance =
  //   TablelandSubscriptionsIndexer.attach(TablelandSubscriptions.address);

  // let SubscriptioOwner =
  //   await TablelandSubscriptionsContractInstance.transferOwnership(
  //     ContentSubscriptionResolver.address
  //   );
  // await SubscriptioOwner.wait();

  // console.log("ContentSubscriptionResolver IS INDEXER OWNER");
};

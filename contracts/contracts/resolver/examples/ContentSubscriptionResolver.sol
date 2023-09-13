// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import {ITAS, Attestation} from "../../ITAS.sol";

import {SchemaResolver} from "../SchemaResolver.sol";

import { ITablelandSubscriptionsIndexer } from "./interfaces/ITablelandSubscriptionsIndexer.sol";

import "../../ISchemaRegistry.sol";

/**
 * @title ContentSubscriptionResolver
 * @notice A schema resolver subcription to content example
 */
contract ContentSubscriptionResolver is SchemaResolver {
    using Address for address payable;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    uint256 ONE_MONTH = 30 days;

    struct SchemaInfo{
        EnumerableSet.AddressSet contentCreators;
        address multisig;
        uint256 subscriptionPrice;
        uint256 subscriptionsPool;
        uint256 totalRevenue;
        address splitterContract;
    }

    string schema = "string jsonCID";

    mapping(bytes32 => SchemaInfo) schemas;

    mapping(address => mapping(bytes32 => uint256)) public userSubscriptions;

    // The global schema registry.
    ISchemaRegistry private schemaRegistry;

    ISchemaResolver schemaResolver;

    ITablelandSubscriptionsIndexer tableland;

    bool revocable;

    address public splitterFactory;

    constructor(
        ITAS tas,
        address _splitterFactory,
        ISchemaRegistry _schemaRegistry,
        ITablelandSubscriptionsIndexer _tableland
    )SchemaResolver(tas){

        schemaResolver = ISchemaResolver(address(this));

        schemaRegistry = _schemaRegistry;

        splitterFactory = _splitterFactory;

        tableland = _tableland;

    }

    

    function registerSubscriptionSchema(
        address[] memory contentCreators,
        uint256[] memory creatorsShares,
        uint256 monthlySubscriptionPrice,
        string memory schemaName,
        string memory schemaDescription
    )external{
        // Register the schema and get its UID
        bytes32 schemaUID = registerSchema(schemaName, schemaDescription);

        SchemaInfo storage Schema = schemas[schemaUID];

        Schema.splitterContract = createSplitter(contentCreators,creatorsShares);

        Schema.subscriptionPrice = monthlySubscriptionPrice;

        for(uint256 i = 0; i < contentCreators.length; i++){
            Schema.contentCreators.add(contentCreators[i]);
        }

        Schema.multisig = msg.sender;

        tableland.SchemaInfoInserted(schemaUID,  monthlySubscriptionPrice, Schema.splitterContract);

        tableland.SchemaAdminsInserted(schemaUID, contentCreators, creatorsShares);

        tableland.SchemaRevenueRecordCreated(schemaUID);

    }

    function registerSchema(
        string memory schemaName,
        string memory schemaDescription
    )internal returns(bytes32 schemaUID){
        // Register the schema and get its UID
        schemaUID = schemaRegistry.register(
            schema,
            schemaName,
            schemaDescription,
            schemaResolver,
            revocable
        );
    }

    /**
     * @dev Mint tokens for encrypted attestations.
     * @param schemaUID The UID of the schema for which tokens are being minted.
     */
    function subscribe(bytes32 schemaUID, uint256 months) external payable {
        require(months > 0, "min 1 month subscription");
        require(
            schemas[schemaUID].subscriptionPrice * months == msg.value,
            "Incorrect value"
        );
        require(schemas[schemaUID].splitterContract != address(0), "non existed");

        uint256 subscriptionEndDate = userSubscriptions[msg.sender][schemaUID];
        
        uint256 time = ONE_MONTH * months;

        if(subscriptionEndDate == 0){
            time += block.timestamp;
            tableland.SchemaSubscriptionCreated(schemaUID, msg.sender, time);
            userSubscriptions[msg.sender][schemaUID] = time;
        }else if(subscriptionEndDate > block.timestamp){
            subscriptionEndDate += time;
            userSubscriptions[msg.sender][schemaUID] = subscriptionEndDate;
            tableland.SchemaSubscriptionUpdated(schemaUID, msg.sender, subscriptionEndDate);
        }else{
            time += block.timestamp;
            tableland.SchemaSubscriptionUpdated(schemaUID, msg.sender, time);
            userSubscriptions[msg.sender][schemaUID] = time;
        }

        schemas[schemaUID].subscriptionsPool += msg.value;

        tableland.SchemaRevenueUpdated(schemaUID, schemas[schemaUID].subscriptionsPool, schemas[schemaUID].totalRevenue);
    }

    /**
    * @dev Handles attestation by validating the attester and bond value.
    * @param attestation The attestation data.
    * @return Boolean indicating the success of the attestation.
    */
    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override view returns (bool) {
        address attester = attestation.attester;
        bytes32 schemaUID = attestation.schema;
        if (!schemas[schemaUID].contentCreators.contains(attester)) {
            return false;
        }
        return true;
    }

    /**
    * @dev Checks if an attestation can be revoked based on resolution status and time.
    * @return Boolean indicating whether the attestation can be revoked.
    */
    function onRevoke(
        Attestation calldata /*attestation*/,
        uint256 /* value */
    ) internal override pure returns (bool) {
        return false;
    }

    /** 
    * @dev Distributes minting funds among attesters using a splitter contract.
    * This function calculates the distribution of funds based on attestation counts and shares,
    * deploys a splitter contract, and sends the funds to it for distribution.
    */
    function splitSubscriptions(bytes32 schemaUID) external {

        // Send the funds to the splitter contract for distribution
        Address.sendValue(payable(schemas[schemaUID].splitterContract), schemas[schemaUID].subscriptionsPool);
        // Distribute funds to valid attestors
        Address.functionCall(schemas[schemaUID].splitterContract, abi.encodeWithSignature("distribute()"));

        schemas[schemaUID].totalRevenue += schemas[schemaUID].subscriptionsPool;

        schemas[schemaUID].subscriptionsPool = 0;

        tableland.SchemaRevenueUpdated(schemaUID, schemas[schemaUID].subscriptionsPool, schemas[schemaUID].totalRevenue);
    }


    function createSplitter(address[] memory admins, uint256[] memory shares)internal returns(address splitterInstance){
        // Deploy a splitter contract using thirdWeb factory and implementation with the calculated data
        bytes memory result = Address.functionCall(
            splitterFactory,
            abi.encodeWithSignature(
                "createSplitter(address[],uint256[])",
                admins,
                shares
            )
        );

        splitterInstance = abi.decode(result, (address));
    }

    /**
     * @notice Indicates whether the contract is designed to handle incoming payments.
     * @return True, indicating that the contract can accept payments.
     */
    function isPayable() public pure override returns (bool) {
        return true;
    }


    function hasAccess(address sender, bytes32 schemaUID) external view returns (uint256) {
        return (userSubscriptions[sender][schemaUID] > block.timestamp || schemas[schemaUID].contentCreators.contains(sender))?1:0;
    }

    function bytes32ToString(bytes32 data) public pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(data.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < data.length; i++) {
        converted[i * 2] = _base[uint8(data[i]) / _base.length];
        converted[i * 2 + 1] = _base[uint8(data[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }

}

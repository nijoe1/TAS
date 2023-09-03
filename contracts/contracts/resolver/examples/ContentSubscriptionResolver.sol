// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {ITAS, Attestation} from "../../ITAS.sol";
import {SchemaResolver} from "../SchemaResolver.sol";
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
        uint256 subscriptionPrice;
        uint256 subscriptionsPool;
        address splitterContract;
    }

    string schema = "";

    mapping(bytes32 => SchemaInfo) schemas;

    mapping(address => mapping(bytes32 => uint256)) public userSubscriptions;

    // State variables
    ISchemaRegistry private schemaRegistry;

    address public splitterFactory;

    constructor(
        ITAS tas,
        address _splitterFactory,
        ISchemaRegistry _schemaRegistry
    )SchemaResolver(tas){

        schemaRegistry = _schemaRegistry;

        splitterFactory = _splitterFactory;
    }

    function registerSubscriptionSchema(
        address[] calldata contentCreators,
        uint256[] calldata creatorsShares,
        uint256 monthlySubscriptionPrice,
        string calldata schemaName,
        string calldata schemaDescription
    )external{
        // Register the schema and get its UID
        bytes32 schemaUID = schemaRegistry.register(
            schema,
            schemaName,
            schemaDescription,
            ISchemaResolver(address(this)),
            false
        );
        SchemaInfo storage Schema = schemas[schemaUID];
        Schema.splitterContract = createSplitter(contentCreators,creatorsShares);
        Schema.subscriptionPrice = monthlySubscriptionPrice;
        for(uint256 i = 0; i < contentCreators.length; i++){
            Schema.contentCreators.add(contentCreators[i]);
        }

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

        userSubscriptions[msg.sender][schemaUID] = userSubscriptions[msg.sender][schemaUID] > block.timestamp ? userSubscriptions[msg.sender][schemaUID] + ONE_MONTH * months : block.timestamp + ONE_MONTH * months;

        schemas[schemaUID].subscriptionsPool += msg.value;
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


    function hasAccess(address sender, bytes32 schemaUID) external view returns (bool) {
        return userSubscriptions[sender][schemaUID] > block.timestamp;
    }
}

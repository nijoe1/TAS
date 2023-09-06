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
        uint256 totalRevenue;
        address splitterContract;
    }

    string schema = "string jsonCID";

    mapping(bytes32 => SchemaInfo) schemas;

    mapping(address => mapping(bytes32 => uint256)) public userSubscriptions;

    // The global schema registry.
    ISchemaRegistry private immutable schemaRegistry;

    ITablelandTables private tablelandContract;
    
    string[] createTableStatements; 

    string[] public tables;

    uint256[] tableIDs;

    uint256 tablesUpdates;

    uint256 private tablesRowsCounter;

    string private constant GROUP_TABLE_PREFIX = "group";

    string private constant GROUP_SCHEMA = "schemaUID text primary key, monthlySubscriptionPrice text, splitterContract text";

    string private constant CREATOR_TABLE_PREFIX = "creator";

    string private constant CREATOR_SCHEMA = "schemaUID text primary key, attester text, shares text";

    string private constant SUBSCRIPTION_TABLE_PREFIX = "subscription";

    string private constant SUBSCRIPTION_SCHEMA = "schemaUID text, subscriber text, subscriptionEndsAt text";

    string private constant GROUP_REVENUE_TABLE_PREFIX = "revenue";

    string private constant GROUP_REVENUE_SCHEMA = "schemaUID text primary key, totalUnclaimed text, totalClaimed text";

    address public splitterFactory;

    constructor(
        ITAS tas,
        address _splitterFactory,
        ISchemaRegistry _schemaRegistry
    )SchemaResolver(tas){

        schemaRegistry = _schemaRegistry;

        splitterFactory = _splitterFactory;

        tablelandContract = TablelandDeployments.get();        

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            GROUP_SCHEMA,
            GROUP_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            CREATOR_SCHEMA,
            CREATOR_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            SUBSCRIPTION_SCHEMA,
            SUBSCRIPTION_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            GROUP_REVENUE_SCHEMA,
            GROUP_REVENUE_TABLE_PREFIX
        ));

        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(GROUP_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(CREATOR_TABLE_PREFIX, tableIDs[1]));
        tables.push(SQLHelpers.toNameFromId(SUBSCRIPTION_TABLE_PREFIX, tableIDs[2]));
        tables.push(SQLHelpers.toNameFromId(GROUP_REVENUE_TABLE_PREFIX, tableIDs[3]));

    }

    function SchemaInfoInserted(
        bytes32 schemaUID,
        address[] calldata contentCreators,
        uint256[] calldata creatorsShares,
        uint256 monthlySubscriptionPrice,
        address splitterContract
    ) internal {
        // Managing tableland rows limitation.
        if(tablesRowsCounter == 100000){
            RenewTables();
        }
        mutate(
            tableIDs[0],
            SQLHelpers.toInsert(
                GROUP_TABLE_PREFIX,
                tableIDs[0],
                "schemaUID, monthlySubscriptionPrice, splitterContract",
                string.concat(
                SQLHelpers.quote(bytes32ToString(schemaUID)),
                ",",
                SQLHelpers.quote((Strings.toString(monthlySubscriptionPrice))),
                ",",
                SQLHelpers.quote((Strings.toHexString(splitterContract)))
                )
            )
        );
        tablesRowsCounter++;
        SchemaAdminsInserted(schemaUID, contentCreators, creatorsShares);
        SchemaRevenueRecordCreated(schemaUID);
    }

    function SchemaAdminsInserted(
        bytes32 schemaUID,
        address[] calldata contentCreators,
        uint256[] calldata creatorsShares
    ) internal {
        for(uint i =0; i < contentCreators.length; i++){
            mutate(
                tableIDs[1],
                SQLHelpers.toInsert(
                    CREATOR_TABLE_PREFIX,
                    tableIDs[1],
                    "schemaUID, attester, shares",
                    string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(contentCreators[i])),
                    ",",
                    SQLHelpers.quote(Strings.toString(creatorsShares[i]))
                    )
                )
            );
        }
    }

    function SchemaSubscriptionCreated(
        bytes32 schemaUID,
        address subscriber,
        uint256 subscriptionEndsAt
    ) internal {
        mutate(
            tableIDs[2],
            SQLHelpers.toInsert(
                SUBSCRIPTION_TABLE_PREFIX,
                tableIDs[2],
                "schemaUID, subscriber, subscriptionEndsAt",
                string.concat(
                SQLHelpers.quote(bytes32ToString(schemaUID)),
                ",",
                SQLHelpers.quote(Strings.toHexString(subscriber)),
                ",",
                SQLHelpers.quote(Strings.toString(subscriptionEndsAt))
                )
            )
        );
    }

    function SchemaSubscriptionUpdated(
        bytes32 schemaUID,
        address subscriber,
        uint256 subscriptionEndsAt
    ) internal {
        mutate(
            tableIDs[2],
            SQLHelpers.toUpdate(
                SUBSCRIPTION_TABLE_PREFIX,
                tableIDs[2],
                string.concat("subscriptionEndsAt=",SQLHelpers.quote(Strings.toString(subscriptionEndsAt))),
                string.concat("subscriber=",SQLHelpers.quote(Strings.toHexString(subscriber)),"and schemaUID=",SQLHelpers.quote(bytes32ToString(schemaUID)))
            )
        );
    }

    function SchemaRevenueRecordCreated(
        bytes32 schemaUID
    ) internal {
        uint256 ZERO = 0;
        mutate(
            tableIDs[3],
            SQLHelpers.toInsert(
                SUBSCRIPTION_TABLE_PREFIX,
                tableIDs[3],
                "schemaUID, totalUnclaimed, totalClaimed",
                string.concat(
                SQLHelpers.quote(bytes32ToString(schemaUID)),
                ",",
                SQLHelpers.quote(Strings.toString(ZERO)),
                ",",
                SQLHelpers.quote(Strings.toString(ZERO))
                )
            )
        );
    }

    function SchemaRevenueUpdated(
        bytes32 schemaUID,
        uint256 totalUnclaimed,
        uint256 totalClaimed
    ) internal {
        mutate(
            tableIDs[3],
            SQLHelpers.toUpdate(
                SUBSCRIPTION_TABLE_PREFIX,
                tableIDs[3],
                string.concat("totalUnclaimed=",SQLHelpers.quote(Strings.toString(totalUnclaimed))," , totalClaimed=",SQLHelpers.quote(Strings.toString(totalClaimed))),
                string.concat("schemaUID=",SQLHelpers.quote(bytes32ToString(schemaUID)))
            )
        );
    }

    function RenewTables()internal{
        
        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(GROUP_TABLE_PREFIX, tableIDs[0]));

        tables.push(SQLHelpers.toNameFromId(CREATOR_TABLE_PREFIX, tableIDs[1]));

        tables.push(SQLHelpers.toNameFromId(SUBSCRIPTION_TABLE_PREFIX, tableIDs[2]));

        tables.push(SQLHelpers.toNameFromId(GROUP_REVENUE_TABLE_PREFIX, tableIDs[3]));

        tablesRowsCounter = 0; 

        tablesUpdates++;
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

        SchemaInfoInserted(schemaUID, contentCreators, creatorsShares, monthlySubscriptionPrice, Schema.splitterContract);
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
            SchemaSubscriptionCreated(schemaUID, msg.sender, time);
            userSubscriptions[msg.sender][schemaUID] = time;
        }else if(subscriptionEndDate > block.timestamp){
            subscriptionEndDate += time;
            userSubscriptions[msg.sender][schemaUID] = subscriptionEndDate;
            SchemaSubscriptionUpdated(schemaUID, msg.sender, subscriptionEndDate);
        }else{
            time += block.timestamp;
            SchemaSubscriptionUpdated(schemaUID, msg.sender, time);
            userSubscriptions[msg.sender][schemaUID] = time;
        }

        schemas[schemaUID].subscriptionsPool += msg.value;

        SchemaRevenueUpdated(schemaUID, schemas[schemaUID].subscriptionsPool, schemas[schemaUID].totalRevenue);
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

        SchemaRevenueUpdated(schemaUID, schemas[schemaUID].subscriptionsPool, schemas[schemaUID].totalRevenue);
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


    /*
    * @dev Internal function to execute a mutation on a table.
    * @param {uint256} tableId - Table ID.
    * @param {string} statement - Mutation statement.
    */
    function mutate(uint256 tableId, string memory statement) internal {
        tablelandContract.mutate(address(this), tableId, statement);
    }
}

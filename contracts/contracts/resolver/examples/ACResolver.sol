// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import {ITAS, Attestation} from "../../ITAS.sol";

import {SchemaResolver} from "../SchemaResolver.sol";

import "../../ISchemaRegistry.sol";

/**
 * @title ContentSubscriptionResolver
 * @notice A schema resolver subcription to content example
 */

contract ACResolver is SchemaResolver, AccessControl {    
        // State variables
    ISchemaRegistry private schemaRegistry;

    address public splitterFactory;

    struct SchemaInfo{
        bool AllowAllToAttest;
        bool AllowAllToRevoke;
    }

    mapping(bytes32 => SchemaInfo) private schemas;

    ITablelandTables private tablelandContract;
    
    string[] createTableStatements; 

    string[] public tables;

    uint256[] tableIDs;

    uint256 tablesUpdates;

    uint256 private tablesRowsCounter;

    string private constant ATTESTER_TABLE_PREFIX = "schema_attesters";

    string private constant ATTESTER_SCHEMA = "schemaUID text, attester text";

    string private constant REVOKER_TABLE_PREFIX = "schema_revokers";

    string private constant REVOKER_SCHEMA = "schemaUID text, revoker text";

    constructor(
        ITAS tas,
        address _splitterFactory,
        ISchemaRegistry _schemaRegistry
    )SchemaResolver(tas){

        schemaRegistry = _schemaRegistry;

        splitterFactory = _splitterFactory;
        tablelandContract = TablelandDeployments.get();        

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            ATTESTER_SCHEMA,
            ATTESTER_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            REVOKER_SCHEMA,
            REVOKER_TABLE_PREFIX
        ));


        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(ATTESTER_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(REVOKER_TABLE_PREFIX, tableIDs[1]));

    }

    function insertSchemaInfo(
        bytes32 schemaUID,
        address[] calldata attesters,
        address[] calldata revokers
    ) internal {
        uint256 totalMax = attesters.length > revokers.length? attesters.length : revokers.length;
        // Managing tableland rows limitation.
        if(tablesRowsCounter + totalMax >= 100000){
            renewTables();
        }
        for(uint i =0; i < attesters.length; i++){
            mutate(
                tableIDs[0],
                SQLHelpers.toInsert(
                    ATTESTER_TABLE_PREFIX,
                    tableIDs[0],
                    "schemaUID, attester",
                    string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(attesters[i]))
                    )
                )
            );
            _grantRole(keccak256(abi.encode(schemaUID, "ATTESTER")), attesters[i]);
        }
        for(uint i =0; i < revokers.length; i++){
            mutate(
                tableIDs[1],
                SQLHelpers.toInsert(
                    REVOKER_TABLE_PREFIX,
                    tableIDs[1],
                    "schemaUID, revoker",
                    string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(revokers[i]))
                    )
                )
            );
            _grantRole(keccak256(abi.encode(schemaUID, "REVOKER")), revokers[i]);
        }
        tablesRowsCounter += totalMax;
    }


    function registerAccessControlledSchema(
        address[] calldata attesters,
        address[] calldata revokers,
        string calldata schema,
        string calldata schemaName,
        string calldata schemaDescription
    )external{
        // Register the schema and get its UID
        bytes32 schemaUID = schemaRegistry.register(
            schema,
            schemaName,
            schemaDescription,
            ISchemaResolver(address(this)),
            true
        );
        uint attestersSize = attesters.length;
        if(attestersSize == 0){
            schemas[schemaUID].AllowAllToAttest = true;
        }
        uint revokersSize = revokers.length;
        if(revokersSize == 0){
            schemas[schemaUID].AllowAllToRevoke = true;
        }

        insertSchemaInfo(schemaUID, attesters, revokers);       
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
        if(schemas[schemaUID].AllowAllToAttest){
            return true;
        }
        if (hasRole(keccak256(abi.encode(schemaUID, "ATTESTER")), attester)) {
            return true;
        }
        return false;
    }

    /**
    * @dev Checks if an attestation can be revoked based on resolution status and time.
    * @return Boolean indicating whether the attestation can be revoked.
    */
    function onRevoke(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override view returns (bool) {
        bytes32 schemaUID = attestation.schema;
        if(schemas[schemaUID].AllowAllToRevoke){
            return true;
        }
        if (hasRole(keccak256(abi.encode(schemaUID, "REVOKER")), tx.origin)) {
            return true;
        }
        return false;
    }

    /**
     * @notice Indicates whether the contract is designed to handle incoming payments.
     * @return True, indicating that the contract can accept payments.
     */
    function isPayable() public pure override returns (bool) {
        return false;
    }

    function renewTables()internal{
        
        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(ATTESTER_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(REVOKER_TABLE_PREFIX, tableIDs[1]));

        tablesRowsCounter = 0; 

        tablesUpdates++;
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

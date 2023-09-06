// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { ISchemaResolver } from "./resolver/ISchemaResolver.sol";

import { EMPTY_UID } from "./Common.sol";

import { Semver } from "./Semver.sol";

import { ISchemaRegistry, SchemaRecord } from "./ISchemaRegistry.sol";

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

/// @title SchemaRegistry
/// @notice The global schema registry.
contract SchemaRegistry is ISchemaRegistry, Semver {

    error AlreadyExists();

    // The global mapping between schema records and their IDs.
    mapping(bytes32 uid => SchemaRecord schemaRecord) private _registry;

    ITablelandTables private tablelandContract;

    string[] createTableStatements;

    string[] public tables;

    uint256[] tableIDs;

    string private constant SCHEMA_TABLE_PREFIX = "schema";

    string private constant SCHEMA_SCHEMA = "schemaUID text primary key, schema text, resolver text, revocable text, name text, description text, creator text, creationTimestamp text";

    /// @dev Creates a new SchemaRegistry instance.
    constructor() Semver(0, 0, 1) {

        tablelandContract = TablelandDeployments.get();

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(SCHEMA_SCHEMA, SCHEMA_TABLE_PREFIX)
        );

        tableIDs = tablelandContract.create(
            address(this),
            createTableStatements
        );

        tables.push(SQLHelpers.toNameFromId(SCHEMA_TABLE_PREFIX, tableIDs[0]));
    }

    function register(
        string calldata schema,
        string calldata schemaName,
        string memory schemaDescription,
        ISchemaResolver resolver,
        bool revocable
    ) external returns (bytes32) {
        SchemaRecord memory schemaRecord = SchemaRecord({
            uid: EMPTY_UID,
            schema: schema,
            resolver: resolver,
            revocable: revocable
        });

        bytes32 uid = _getUID(schemaRecord);
        if (_registry[uid].uid != EMPTY_UID) {
            revert AlreadyExists();
        }

        schemaRecord.uid = uid;
        _registry[uid] = schemaRecord;

        SchemaRegistered(
            schemaRecord.uid,
            schema,
            schemaName,
            schemaDescription,
            resolver,
            revocable
        );

        return uid;
    }

    function SchemaRegistered(
        bytes32 schemaUID,
        string memory schema,
        string memory schemaName,
        string memory schemaDescription,
        ISchemaResolver resolver,
        bool revocable
    ) internal {
        // require(attestation.data.length <= 1024, "Tableland limitation");
        mutate(
            tableIDs[0],
            SQLHelpers.toInsert(
                SCHEMA_TABLE_PREFIX,
                tableIDs[0],
                "schemaUID, schema, resolver, revocable, name, description, creator, creationTimestamp",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(schema),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(address(resolver))),
                    ",",
                    SQLHelpers.quote(revocable ? "true" : "false"),
                    ",",
                    SQLHelpers.quote(schemaName),
                    ",",
                    SQLHelpers.quote(schemaDescription),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(msg.sender)),
                    ",",
                    SQLHelpers.quote(Strings.toString(block.timestamp))
                )
            )
        );
    }

    /// @inheritdoc ISchemaRegistry
    function getSchema(
        bytes32 uid
    ) external view returns (SchemaRecord memory) {
        return _registry[uid];
    }

    /// @dev Calculates a UID for a given schema.
    /// @param schemaRecord The input schema.
    /// @return schema UID.
    function _getUID(
        SchemaRecord memory schemaRecord
    ) private view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    schemaRecord.schema,
                    schemaRecord.resolver,
                    schemaRecord.revocable,
                    block.timestamp
                )
            );
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
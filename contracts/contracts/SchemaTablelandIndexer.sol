// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SchemaTablelandIndexer
contract SchemaTablelandIndexer is Ownable {

    ITablelandTables private tablelandContract;

    string[] createTableStatements;

    string[] public tables;

    uint256[] tableIDs;

    string private constant SCHEMA_TABLE_PREFIX = "schema";

    string private constant SCHEMA_SCHEMA = "schemaUID text primary key, schema text, resolver text, revocable text, name text, description text, creator text, creationTimestamp text";

    /// @dev Creates a new SchemaRegistry instance.
    constructor() {

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


    function SchemaRegistered(
        bytes32 schemaUID,
        string memory schema,
        string memory schemaName,
        string memory schemaDescription,
        address resolver,
        bool revocable
    ) public onlyOwner {
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
                    SQLHelpers.quote(Strings.toHexString(resolver)),
                    ",",
                    SQLHelpers.quote(revocable ? "true" : "false"),
                    ",",
                    SQLHelpers.quote(schemaName),
                    ",",
                    SQLHelpers.quote(schemaDescription),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(tx.origin)),
                    ",",
                    SQLHelpers.quote(Strings.toString(block.timestamp))
                )
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
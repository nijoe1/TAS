// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { SchemaRegistrationInput } from "../ISchemaRegistry.sol";

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SchemaTablelandIndexer
contract SchemaTablelandIndexer is Ownable {

    ITablelandTables private tablelandContract;

    string[] createTableStatements;

    string[] public tables;

    uint256 tablesUpdates;

    uint256 tableRowsCounter;

    uint256[] tableIDs;

    string private constant SCHEMA_TABLE_PREFIX = "schema";

    string private constant SCHEMA_SCHEMA = "schemaUID text primary key, schema text, resolver text, revocable text, name text, description text, creator text, creationTimestamp text";

    string private constant SCHEMA_CATEGORIES_TABLE_PREFIX = "schema_categories";

    string private constant SCHEMA_CATEGORIES_SCHEMA = "schemaUID text, category text";

    /// @dev Creates a new SchemaRegistry instance.
    constructor() {

        tablelandContract = TablelandDeployments.get();

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(SCHEMA_SCHEMA, SCHEMA_TABLE_PREFIX)
        );
        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(SCHEMA_CATEGORIES_SCHEMA, SCHEMA_CATEGORIES_TABLE_PREFIX)
        );


        tableIDs = tablelandContract.create(
            address(this),
            createTableStatements
        );

        tables.push(SQLHelpers.toNameFromId(SCHEMA_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(SCHEMA_CATEGORIES_TABLE_PREFIX, tableIDs[1]));

    }


    function SchemaRegistered(
        SchemaRegistrationInput memory input,
        bytes32 schemaUID
    ) public onlyOwner {
        uint256 size = input.categories.length;
        if(tableRowsCounter + size > 100000){
            RenewTables();
        }
        mutate(
            tableIDs[0],
            SQLHelpers.toInsert(
                SCHEMA_TABLE_PREFIX,
                tableIDs[0],
                "schemaUID, schema, resolver, revocable, name, description, creator, creationTimestamp",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(input.schema),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(address(input.schemaResolver))),
                    ",",
                    SQLHelpers.quote(input.revocable ? "true" : "false"),
                    ",",
                    SQLHelpers.quote(input.schemaName),
                    ",",
                    SQLHelpers.quote(input.schemaDescription),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(tx.origin)),
                    ",",
                    SQLHelpers.quote(Strings.toString(block.timestamp))
                )
            )
        );
        for(uint i = 0; i < input.categories.length; i++){
            mutate(
            tableIDs[1],
            SQLHelpers.toInsert(
                SCHEMA_TABLE_PREFIX,
                tableIDs[1],
                "schemaUID, category",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(input.categories[i])
                )
            )
        );
        }
        tableRowsCounter += size;
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

    function RenewTables()internal{
        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(SCHEMA_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(SCHEMA_CATEGORIES_TABLE_PREFIX, tableIDs[1]));

        tableRowsCounter = 0; 
        tablesUpdates++;
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
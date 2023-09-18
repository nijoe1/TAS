// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract ACResolverIndexer is  IERC721Receiver, Ownable {

    ITablelandTables private tablelandContract;
    
    string[] createTableStatements; 

    string[] public tables;

    uint256[] tableIDs;

    uint256 tablesUpdates;

    uint256 private attesterRowsCounter;

    uint256 private revokerRowsCounter;

    string private constant ATTESTER_TABLE_PREFIX = "schema_attesters";

    string private constant ATTESTER_SCHEMA = "schemaUID text, attester text";

    string private constant REVOKER_TABLE_PREFIX = "schema_revokers";

    string private constant REVOKER_SCHEMA = "schemaUID text, revoker text";

    string private constant INFO_TABLE_PREFIX = "schema_info";

    string private constant INFO_SCHEMA = "schemaUID text, encrypted text, admin text";


    constructor() {
        
        tablelandContract = TablelandDeployments.get();        

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            ATTESTER_SCHEMA,
            ATTESTER_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            REVOKER_SCHEMA,
            REVOKER_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            INFO_SCHEMA,
            INFO_TABLE_PREFIX
        ));


        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(ATTESTER_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(REVOKER_TABLE_PREFIX, tableIDs[1]));
        tables.push(SQLHelpers.toNameFromId(INFO_TABLE_PREFIX, tableIDs[2]));
    }

    function AddSchemaAttester(bytes32 schemaUID, address attester)public onlyOwner{
        if(attesterRowsCounter + 1 >= 100000){
            RenewTables();
        }
        mutate(
                tableIDs[0],
                SQLHelpers.toInsert(
                    ATTESTER_TABLE_PREFIX,
                    tableIDs[0],
                    "schemaUID, attester",
                    string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(attester))
                    )
                )
        );
        attesterRowsCounter += 1;
    }


    function AddSchemaRevoker(bytes32 schemaUID, address revoker)public onlyOwner{
        if(revokerRowsCounter + 1 >= 100000){
            RenewTables();
        }
        mutate(
            tableIDs[1],
            SQLHelpers.toInsert(
            REVOKER_TABLE_PREFIX,
            tableIDs[1],
            "schemaUID, revoker",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(revoker))
                )
            )
        );
        revokerRowsCounter += 1;
    }

    function AddSchemaInfo(bytes32 schemaUID, bool encrypted) public onlyOwner{
        mutate(
                tableIDs[2],
                SQLHelpers.toInsert(
                    INFO_TABLE_PREFIX,
                    tableIDs[2],
                    "schemaUID, encrypted, admin",
                    string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(encrypted?"true":"false"),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(tx.origin))
                    )
                )
        );
    }

    function RenewTables()internal{
        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(ATTESTER_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(REVOKER_TABLE_PREFIX, tableIDs[1]));
        tables.push(SQLHelpers.toNameFromId(INFO_TABLE_PREFIX, tableIDs[2]));

        attesterRowsCounter = 0; 
        revokerRowsCounter = 0; 
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

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
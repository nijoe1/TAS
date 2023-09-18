// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import {
    Attestation
} from "../ITAS.sol";

/// @title TAS
/// @notice The Tableland Attestation Service protocol.
contract TASIndexer is  IERC721Receiver, Ownable {

    ITablelandTables private tablelandContract;
    
    string[] createTableStatements; 

    string[] public tables;

    uint256[] tableIDs;

    uint256 public tablesUpdates;

    uint256 private tablesRowsCounter;

    string private constant ATTESTATION_TABLE_PREFIX = "attestation";

    string private constant ATTESTATION_SCHEMA = "uid text primary key, schemaUID text, creationTimestamp text, expirationTime text, refUID text, recipient text, attester text, data text";

    string private constant REVOCATION_TABLE_PREFIX = "revocation";

    string private constant REVOCATION_SCHEMA = "uid text primary key, revocationTime text, revoker text, revocable text";

    string private constant TIMESTAMP_TABLE_PREFIX = "offChain_timestamp";

    string private constant TIMESTAMP_SCHEMA = "uid text, timestampedAt text";

    string private constant OFF_CHAIN_REVOCATIONS_TABLE_PREFIX = "offChain_revocation";

    string private constant OFF_CHAIN_REVOCATIONS_SCHEMA = "revoker text, uid text, revokedAt text";


    constructor() {
        
        tablelandContract = TablelandDeployments.get();        

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            ATTESTATION_SCHEMA,
            ATTESTATION_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            REVOCATION_SCHEMA,
            REVOCATION_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            TIMESTAMP_SCHEMA,
            TIMESTAMP_TABLE_PREFIX
        ));

        createTableStatements.push(SQLHelpers.toCreateFromSchema(
            OFF_CHAIN_REVOCATIONS_SCHEMA,
            OFF_CHAIN_REVOCATIONS_TABLE_PREFIX
        ));

        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(ATTESTATION_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(REVOCATION_TABLE_PREFIX, tableIDs[1]));
        tables.push(SQLHelpers.toNameFromId(TIMESTAMP_TABLE_PREFIX, tableIDs[2]));
        tables.push(SQLHelpers.toNameFromId(OFF_CHAIN_REVOCATIONS_TABLE_PREFIX, tableIDs[3]));
    }

    function AttestationInserted(
        Attestation memory attestation
    ) public onlyOwner {
        string memory data = bytesToString(attestation.data); 
        require(strlen(data) <= 1024, "Tableland limitation");
        // Managing tableland rows limitation.
        if(tablesRowsCounter == 100000){
            RenewTables();
        }
        mutate(
            tableIDs[0],
            SQLHelpers.toInsert(
                ATTESTATION_TABLE_PREFIX,
                tableIDs[0],
                "uid, schemaUID, creationTimestamp, expirationTime, refUID, recipient, attester, data",
                string.concat(
                SQLHelpers.quote(bytes32ToString(attestation.uid)),
                ",",
                SQLHelpers.quote(bytes32ToString(attestation.schema)),
                ",",
                SQLHelpers.quote((Strings.toString(attestation.time))),
                ",",
                SQLHelpers.quote((Strings.toString(attestation.expirationTime))),
                ",",
                SQLHelpers.quote(bytes32ToString(attestation.refUID)),
                ",",
                SQLHelpers.quote(Strings.toHexString(attestation.recipient)),
                ",",
                SQLHelpers.quote(Strings.toHexString(attestation.attester)),
                ",",
                SQLHelpers.quote(data)
                )
            )
        );
        tablesRowsCounter++;
        RevocationInfoInserted(attestation.uid, attestation.revocable);
    }

    function RevocationInfoInserted(
        bytes32 uid,
        bool revocable
    ) public onlyOwner {
        mutate(
            tableIDs[1],
            SQLHelpers.toInsert(
                REVOCATION_TABLE_PREFIX,
                tableIDs[1],
                "uid, revocationTime, revoker, revocable",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(uid)),
                    ",",
                    SQLHelpers.quote("0"),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(address(0))),
                    ",",
                    SQLHelpers.quote(revocable?"true":"false")
                )
            )
        );
    }


    function AttestationRevokedUpdate(
        bytes32 uid,
        address revoker,
        uint256 revocationTime
    ) public onlyOwner {
        mutate(
            tableIDs[1],
            SQLHelpers.toUpdate(
                REVOCATION_TABLE_PREFIX,
                tableIDs[1],
                string.concat("revoker=",SQLHelpers.quote(Strings.toHexString(revoker)),", revocationTime=",SQLHelpers.quote(Strings.toString(revocationTime))),
                string.concat("uid=",SQLHelpers.quote(bytes32ToString(uid)))
            )
        );
    }

    function Timestamped(
        bytes32 uid,
        uint256 time
    ) public onlyOwner {
        mutate(
            tableIDs[2],
            SQLHelpers.toInsert(
                TIMESTAMP_TABLE_PREFIX,
                tableIDs[2],
                "uid, timestampedAt",
                string.concat(
                SQLHelpers.quote(bytes32ToString(uid)),
                ",",
                SQLHelpers.quote(Strings.toString(time))
                )
            )
        );
    }

    function RevokedOffChain(
        address revoker,
        bytes32 uid,
        uint256 time
    ) public onlyOwner {
        mutate(
            tableIDs[3],
            SQLHelpers.toInsert(
                OFF_CHAIN_REVOCATIONS_TABLE_PREFIX,
                tableIDs[3],
                "revoker, uid, revokedAt",
                string.concat(
                SQLHelpers.quote(Strings.toHexString(revoker)),
                ",",
                SQLHelpers.quote(bytes32ToString(uid)),
                ",",
                SQLHelpers.quote(Strings.toString(time))
                )
            )
        );
    }

    function RenewTables()internal{

        tableIDs = tablelandContract.create(address(this), createTableStatements);

        tables.push(SQLHelpers.toNameFromId(ATTESTATION_TABLE_PREFIX, tableIDs[0]));

        tables.push(SQLHelpers.toNameFromId(REVOCATION_TABLE_PREFIX, tableIDs[1]));

        tables.push(SQLHelpers.toNameFromId(TIMESTAMP_TABLE_PREFIX, tableIDs[2]));

        tables.push(SQLHelpers.toNameFromId(OFF_CHAIN_REVOCATIONS_TABLE_PREFIX, tableIDs[3]));

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

    function bytesToString(bytes memory data) public pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(data.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < data.length; i++) {
        converted[i * 2] = _base[uint8(data[i]) / _base.length];
        converted[i * 2 + 1] = _base[uint8(data[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }

    /**
     * @dev Returns the length of a given string
     *
     * @param s The string to measure the length of
     * @return The length of the input string
     */
    function strlen(string memory s) internal pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;
        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
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
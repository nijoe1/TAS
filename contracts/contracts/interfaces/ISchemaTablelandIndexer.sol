// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @title ISchemaRegistry
/// @notice The interface of global attestation schemas for the Tableland Attestation Service protocol.
interface ISchemaTablelandIndexer {

    function SchemaRegistered(  
        bytes32 schemaUID,      
        string memory schema,
        string memory schemaName,
        string memory schemaDescription,
        address resolver,
        bool revocable
    ) external;
}
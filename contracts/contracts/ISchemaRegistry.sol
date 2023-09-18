// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ISchemaResolver } from "./resolver/ISchemaResolver.sol";

/// @notice A struct representing a record for a submitted schema.
struct SchemaRecord {
    bytes32 uid; // The unique identifier of the schema.
    ISchemaResolver resolver; // Optional schema resolver.
    bool revocable; // Whether the schema allows revocations explicitly.
    string schema; // Custom specification of the schema (e.g., an ABI).
}

struct SchemaRegistrationInput {
    string schema;
    string schemaName;
    string schemaDescription;
    string[] categories;
    ISchemaResolver schemaResolver;
    bool revocable;
}

/// @title ISchemaRegistry
/// @notice The interface of global attestation schemas for the Tableland Attestation Service protocol.
interface ISchemaRegistry {


    function register(        
        SchemaRegistrationInput memory input
    ) external returns (bytes32);

    /// @notice Returns an existing schema by UID
    /// @param uid The UID of the schema to retrieve.
    /// @return The schema data members.
    function getSchema(bytes32 uid) external view returns (SchemaRecord memory);
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {ISchemaRegistry, SchemaRegistrationInput} from "../ISchemaRegistry.sol";

/// @title ISchemaRegistry
/// @notice The interface of global attestation schemas for the Tableland Attestation Service protocol.
interface ISchemaTablelandIndexer {
    function SchemaRegistered(
        SchemaRegistrationInput memory input,
        bytes32 schemaUID
    ) external;
}

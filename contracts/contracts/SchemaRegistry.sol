// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {ISchemaResolver} from "./resolver/ISchemaResolver.sol";

import {EMPTY_UID} from "./Common.sol";

import {Semver} from "./Semver.sol";

import {ISchemaRegistry, SchemaRecord, SchemaRegistrationInput} from "./ISchemaRegistry.sol";

import {ISchemaTablelandIndexer} from "./interfaces/ISchemaTablelandIndexer.sol";

/// @title SchemaRegistry
/// @notice The global schema registry.
contract SchemaRegistry is ISchemaRegistry, Semver {
    ISchemaTablelandIndexer tableland;

    error AlreadyExists();

    // The global mapping between schema records and their IDs.
    mapping(bytes32 uid => SchemaRecord schemaRecord) private _registry;

    /// @dev Creates a new SchemaRegistry instance.
    constructor(ISchemaTablelandIndexer _tableland) Semver(0, 0, 1) {
        tableland = _tableland;
    }

    function register(
        SchemaRegistrationInput memory input
    ) external returns (bytes32) {
        SchemaRecord memory schemaRecord = SchemaRecord({
            uid: EMPTY_UID,
            schema: input.schema,
            resolver: input.schemaResolver,
            revocable: input.revocable
        });

        bytes32 uid = _getUID(schemaRecord);
        if (_registry[uid].uid != EMPTY_UID) {
            revert AlreadyExists();
        }

        schemaRecord.uid = uid;
        _registry[uid] = schemaRecord;

        tableland.SchemaRegistered(input, schemaRecord.uid);

        return uid;
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
}
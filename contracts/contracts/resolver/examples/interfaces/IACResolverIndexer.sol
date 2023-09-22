// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IACResolverIndexer {
    function AddSchemaAttester(bytes32 schemaUID, address attester) external;

    function AddSchemaRevoker(bytes32 schemaUID, address revoker) external;

    function AddSchemaInfo(bytes32 schemaUID, bool encrypted) external;
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import {Attestation} from "../ITAS.sol";

/// @title ISchemaRegistry
/// @notice The interface of global attestation schemas for the Tableland Attestation Service protocol.
interface ITASIndexer {
    function AttestationInserted(Attestation memory attestation) external;

    function AttestationRevokedUpdate(
        bytes32 uid,
        address revoker,
        uint256 revocationTime
    ) external;

    function Timestamped(bytes32 uid, uint256 time) external;

    function RevokedOffChain(
        address revoker,
        bytes32 uid,
        uint256 time
    ) external;
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import {ITAS, Attestation} from "../../ITAS.sol";

import {SchemaResolver} from "../SchemaResolver.sol";

import "../../ISchemaRegistry.sol";

/**
 * @title ContentSubscriptionResolver
 * @notice A schema resolver subcription to content example
 */

contract ACResolver is SchemaResolver, AccessControl {    
        // State variables
    ISchemaRegistry private schemaRegistry;

    address public splitterFactory;

    struct SchemaInfo{
        bool AllowAllToAttest;
        bool AllowAllToRevoke;
    }

    mapping(bytes32 => SchemaInfo) private schemas;

    constructor(
        ITAS tas,
        address _splitterFactory,
        ISchemaRegistry _schemaRegistry
    )SchemaResolver(tas){

        schemaRegistry = _schemaRegistry;

        splitterFactory = _splitterFactory;
    }

    function registerAccessControlledSchema(
        address[] calldata attesters,
        address[] calldata revokers,
        string calldata schema,
        string calldata schemaName,
        string calldata schemaDescription
    )external{
        // Register the schema and get its UID
        bytes32 schemaUID = schemaRegistry.register(
            schema,
            schemaName,
            schemaDescription,
            ISchemaResolver(address(this)),
            true
        );
        uint attestersSize = attesters.length;
        if(attestersSize == 0){
            schemas[schemaUID].AllowAllToAttest = true;
        }
        uint revokersSize = revokers.length;
        if(revokersSize == 0){
            schemas[schemaUID].AllowAllToRevoke = true;
        }

        for(uint256 i = 0; i < attestersSize; i++){
            _grantRole(schemaUID, attesters[i]);
        }
        for(uint256 i = 0; i < revokersSize; i++){
            _grantRole(schemaUID, revokers[i]);
        }

    }

    /**
    * @dev Handles attestation by validating the attester and bond value.
    * @param attestation The attestation data.
    * @return Boolean indicating the success of the attestation.
    */
    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override view returns (bool) {
        address attester = attestation.attester;
        bytes32 schemaUID = attestation.schema;
        if(schemas[schemaUID].AllowAllToAttest){
            return true;
        }
        if (hasRole(schemaUID, attester)) {
            return true;
        }
        return false;
    }

    /**
    * @dev Checks if an attestation can be revoked based on resolution status and time.
    * @return Boolean indicating whether the attestation can be revoked.
    */
    function onRevoke(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override view returns (bool) {
        bytes32 schemaUID = attestation.schema;
        if(schemas[schemaUID].AllowAllToRevoke){
            return true;
        }
        if (hasRole(schemaUID, tx.origin)) {
            return true;
        }
        return false;
    }

    /**
     * @notice Indicates whether the contract is designed to handle incoming payments.
     * @return True, indicating that the contract can accept payments.
     */
    function isPayable() public pure override returns (bool) {
        return false;
    }
}

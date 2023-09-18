// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import {ITAS, Attestation} from "../../ITAS.sol";

import {SchemaResolver} from "../SchemaResolver.sol";

import {IACResolverIndexer} from "./interfaces/IACResolverIndexer.sol";

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
        bool encrypted;
    }

    mapping(bytes32 => SchemaInfo) private schemas;

    ISchemaResolver resolver = ISchemaResolver(address(this));

    IACResolverIndexer tableland;

    constructor(
        ITAS tas,
        address _splitterFactory,
        ISchemaRegistry _schemaRegistry,
        IACResolverIndexer _tableland
    )SchemaResolver(tas){

        schemaRegistry = _schemaRegistry;

        splitterFactory = _splitterFactory;

        tableland = _tableland;
    }

    function ACSchemaRegistered(
        address[] memory attesters,
        address[] memory revokers,
        string[] memory categories,
        bool encrypted,
        string memory schema,
        string memory schemaName,
        string memory schemaDescription
    )external{
        // Register the schema and get its UID
        bytes32 schemaUID = schemaRegistry.register(
            SchemaRegistrationInput(
                schema,
                schemaName,
                schemaDescription,
                categories,
                resolver,
                true
            )
        );
        uint attestersSize = attesters.length;
        if(attestersSize == 0){
            schemas[schemaUID].AllowAllToAttest = true;
        }
        uint revokersSize = revokers.length;
        if(revokersSize == 0){
            schemas[schemaUID].AllowAllToRevoke = true;
        }

        SchemaInfoInserted(schemaUID, attesters, revokers, encrypted);       
    }

    function SchemaInfoInserted(
        bytes32 schemaUID,
        address[] memory attesters,
        address[] memory revokers,
        bool encrypted
    ) internal {
        
        schemas[schemaUID].encrypted = encrypted;
        _grantRole(role(schemaUID, "ADMIN"), tx.origin);
        tableland.AddSchemaInfo(schemaUID, encrypted);

        for(uint i =0; i < attesters.length; i++){
            tableland.AddSchemaAttester(schemaUID, attesters[i]);
            _grantRole(role(schemaUID, "ATTESTER"), attesters[i]);
        }
        for(uint i =0; i < revokers.length; i++){
           tableland.AddSchemaRevoker(schemaUID, revokers[i]);
            _grantRole(role(schemaUID, "REVOKER"), revokers[i]);
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
        if (hasRole(role(schemaUID, "ATTESTER"), attester)) {
            return true;
        }
        // For delegated attestations 
        if (hasRole(role(schemaUID, "ATTESTER"), tx.origin)) {
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
        if (hasRole(role(schemaUID, "REVOKER"), tx.origin)) {
            return true;
        }
        return false;
    }

    function hasAcccess(address sender, bytes32 schemaUID) external view returns(bool){
        if((hasRole(role(schemaUID, "REVOKER"), sender) || (hasRole(keccak256(abi.encode(schemaUID, "ATTESTER")), sender)))){
            return true;
        }else if(!schemas[schemaUID].encrypted){
            return true;
        }else{
            return false;
        }
    }

    function addAttester(bytes32 schemaUID, address newAttester)external onlyRole(role(schemaUID,"ADMIN")){
        tableland.AddSchemaAttester(schemaUID, newAttester);
        _grantRole(role(schemaUID, "ATTESTER"), newAttester);
    }

    function addRevoker(bytes32 schemaUID, address newRevoker)external onlyRole(role(schemaUID,"ADMIN")){
        tableland.AddSchemaRevoker(schemaUID, newRevoker);
        _grantRole(role(schemaUID, "REVOKER"), newRevoker);
    }

    function removeAttester(bytes32 schemaUID, address newAttester)external onlyRole(role(schemaUID,"ADMIN")){
        tableland.AddSchemaAttester(schemaUID, newAttester);
        _revokeRole(role(schemaUID, "ATTESTER"), newAttester);
    }

    function removeRevoker(bytes32 schemaUID, address newRevoker)external onlyRole(role(schemaUID,"ADMIN")){
        tableland.AddSchemaRevoker(schemaUID, newRevoker);
        _revokeRole(role(schemaUID, "REVOKER"), newRevoker);
    }

    /**
     * @notice Indicates whether the contract is designed to handle incoming payments.
     * @return True, indicating that the contract can accept payments.
     */
    function isPayable() public pure override returns (bool) {
        return false;
    }

    function role(bytes32 schemaUID, string memory _role)internal pure returns(bytes32){
        return keccak256(abi.encode(schemaUID, _role));
    }

}

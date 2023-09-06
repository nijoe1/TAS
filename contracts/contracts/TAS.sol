// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { EIP1271Verifier } from "./eip1271/EIP1271Verifier.sol";

import { ISchemaResolver } from "./resolver/ISchemaResolver.sol";

import { TablelandDeployments, ITablelandTables } from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import { SQLHelpers } from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


// prettier-ignore
import {
    AccessDenied,
    EMPTY_UID,
    Signature,
    InvalidLength,
    NotFound,
    NO_EXPIRATION_TIME,
    uncheckedInc
} from "./Common.sol";

// prettier-ignore
import {
    Attestation,
    AttestationRequest,
    AttestationRequestData,
    DelegatedAttestationRequest,
    DelegatedRevocationRequest,
    ITAS,
    MultiAttestationRequest,
    MultiDelegatedAttestationRequest,
    MultiDelegatedRevocationRequest,
    MultiRevocationRequest,
    RevocationRequest,
    RevocationRequestData
} from "./ITAS.sol";

import { Semver } from "./Semver.sol";

import { ISchemaRegistry, SchemaRecord } from "./ISchemaRegistry.sol";

/// @title TAS
/// @notice The Tableland Attestation Service protocol.
contract TAS is ITAS, Semver, EIP1271Verifier, IERC721Receiver {
    using Address for address payable;

    error AlreadyRevoked();
    error AlreadyRevokedOffchain();
    error AlreadyTimestamped();
    error InsufficientValue();
    error InvalidAttestation();
    error InvalidAttestations();
    error InvalidExpirationTime();
    error InvalidOffset();
    error InvalidRegistry();
    error InvalidRevocation();
    error InvalidRevocations();
    error InvalidSchema();
    error InvalidVerifier();
    error Irrevocable();
    error NotPayable();
    error WrongSchema();

    /// @notice A struct representing an internal attestation result.
    struct AttestationsResult {
        uint256 usedValue; // Total ETH amount that was sent to resolvers.
        bytes32[] uids; // UIDs of the new attestations.
    }

    // The global schema registry.
    ISchemaRegistry private immutable _schemaRegistry;

    ITablelandTables private tablelandContract;
    
    string[] createTableStatements; 

    string[] public tables;

    uint256[] tableIDs;

    uint256 tablesUpdates;

    uint256 private tablesRowsCounter;

    string private constant ATTESTATION_TABLE_PREFIX = "attestation";

    string private constant ATTESTATION_SCHEMA = "uid text primary key, schemaUID text, creationTimestamp text, expirationTime text, refUID text, recipient text, attester text, data text";

    string private constant REVOCATION_TABLE_PREFIX = "revocation";

    string private constant REVOCATION_SCHEMA = "uid text primary key, revocationTime text, revoker text, revocable text";

    string private constant TIMESTAMP_TABLE_PREFIX = "offChain_timestamp";

    string private constant TIMESTAMP_SCHEMA = "uid text, timestampedAt text";

    string private constant OFF_CHAIN_REVOCATIONS_TABLE_PREFIX = "offChain_revocation";

    string private constant OFF_CHAIN_REVOCATIONS_SCHEMA = "revoker text, uid text, revokedAt text";



    // The global mapping between attestations and their UIDs.
    mapping(bytes32 uid => Attestation attestation) private _db;

    // The global mapping between data and their timestamps.
    mapping(bytes32 data => uint64 timestamp) private _timestamps;

    // The global mapping between data and their revocation timestamps.
    mapping(address revoker => mapping(bytes32 data => uint64 timestamp) timestamps) private _revocationsOffchain;

    /// @dev Creates a new TAS instance.
    /// @param registry The address of the global schema registry.
    constructor(ISchemaRegistry registry) Semver(0, 0, 1) EIP1271Verifier("TAS", "0.0.1") {
        if (address(registry) == address(0)) {
            revert InvalidRegistry();
        }

        _schemaRegistry = registry;
        
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
    ) internal {
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
    ) internal {
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
    ) internal {
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
    ) internal {
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
    ) internal {
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

    /// @inheritdoc ITAS
    function getSchemaRegistry() external view returns (ISchemaRegistry) {
        return _schemaRegistry;
    }

    /// @inheritdoc ITAS
    function attest(AttestationRequest calldata request) external payable returns (bytes32) {
        AttestationRequestData[] memory data = new AttestationRequestData[](1);
        data[0] = request.data;

        return _attest(request.schema, data, msg.sender, msg.value, true).uids[0];
    }

    /// @inheritdoc ITAS
    function attestByDelegation(
        DelegatedAttestationRequest calldata delegatedRequest
    ) external payable returns (bytes32) {
        _verifyAttest(delegatedRequest);

        AttestationRequestData[] memory data = new AttestationRequestData[](1);
        data[0] = delegatedRequest.data;

        return _attest(delegatedRequest.schema, data, delegatedRequest.attester, msg.value, true).uids[0];
    }

    /// @inheritdoc ITAS
    function multiAttest(MultiAttestationRequest[] calldata multiRequests) external payable returns (bytes32[] memory) {
        // Since a multi-attest call is going to make multiple attestations for multiple schemas, we'd need to collect
        // all the returned UIDs into a single list.
        uint256 length = multiRequests.length;
        bytes32[][] memory totalUids = new bytes32[][](multiRequests.length);
        uint256 totalUidsCount = 0;

        // We are keeping track of the total available ETH amount that can be sent to resolvers and will keep deducting
        // from it to verify that there isn't any attempt to send too much ETH to resolvers. PlTASe note that unless
        // some ETH was stuck in the contract by accident (which shouldn't happen in normal conditions), it won't be
        // possible to send too much ETH anyway.
        uint256 availableValue = msg.value;

        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            // The last batch is handled slightly differently: if the total available ETH wasn't spent in full and there
            // is a remainder - it will be refunded back to the attester (something that we can only verify during the
            // last and final batch).
            bool last;
            unchecked {
                last = i == length - 1;
            }

            // Process the current batch of attestations.
            MultiAttestationRequest calldata multiRequest = multiRequests[i];

            // Ensure that data isn't empty.
            if (multiRequest.data.length == 0) {
                revert InvalidLength();
            }

            AttestationsResult memory res = _attest(
                multiRequest.schema,
                multiRequest.data,
                msg.sender,
                availableValue,
                last
            );

            // Ensure to deduct the ETH that was forwarded to the resolver during the processing of this batch.
            availableValue -= res.usedValue;

            // Collect UIDs (and merge them later).
            totalUids[i] = res.uids;
            unchecked {
                totalUidsCount += res.uids.length;
            }
        }

        // Merge all the collected UIDs and return them as a flatten array.
        return _mergeUIDs(totalUids, totalUidsCount);
    }

    /// @inheritdoc ITAS
    function multiAttestByDelegation(
        MultiDelegatedAttestationRequest[] calldata multiDelegatedRequests
    ) external payable returns (bytes32[] memory) {
        // Since a multi-attest call is going to make multiple attestations for multiple schemas, we'd need to collect
        // all the returned UIDs into a single list.
        uint256 length = multiDelegatedRequests.length;
        bytes32[][] memory totalUids = new bytes32[][](length);
        uint256 totalUidsCount = 0;

        // We are keeping track of the total available ETH amount that can be sent to resolvers and will keep deducting
        // from it to verify that there isn't any attempt to send too much ETH to resolvers. PlTASe note that unless
        // some ETH was stuck in the contract by accident (which shouldn't happen in normal conditions), it won't be
        // possible to send too much ETH anyway.
        uint256 availableValue = msg.value;

        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            // The last batch is handled slightly differently: if the total available ETH wasn't spent in full and there
            // is a remainder - it will be refunded back to the attester (something that we can only verify during the
            // last and final batch).
            bool last;
            unchecked {
                last = i == length - 1;
            }

            MultiDelegatedAttestationRequest calldata multiDelegatedRequest = multiDelegatedRequests[i];
            AttestationRequestData[] calldata data = multiDelegatedRequest.data;

            // Ensure that no inputs are missing.
            uint256 dataLength = data.length;
            if (dataLength == 0 || dataLength != multiDelegatedRequest.signatures.length) {
                revert InvalidLength();
            }

            // Verify signatures. PlTASe note that the signatures are assumed to be signed with incrTASing nonces.
            for (uint256 j = 0; j < dataLength; j = uncheckedInc(j)) {
                _verifyAttest(
                    DelegatedAttestationRequest({
                        schema: multiDelegatedRequest.schema,
                        data: data[j],
                        signature: multiDelegatedRequest.signatures[j],
                        attester: multiDelegatedRequest.attester,
                        deadline: multiDelegatedRequest.deadline
                    })
                );
            }

            // Process the current batch of attestations.
            AttestationsResult memory res = _attest(
                multiDelegatedRequest.schema,
                data,
                multiDelegatedRequest.attester,
                availableValue,
                last
            );

            // Ensure to deduct the ETH that was forwarded to the resolver during the processing of this batch.
            availableValue -= res.usedValue;

            // Collect UIDs (and merge them later).
            totalUids[i] = res.uids;
            unchecked {
                totalUidsCount += res.uids.length;
            }
        }

        // Merge all the collected UIDs and return them as a flatten array.
        return _mergeUIDs(totalUids, totalUidsCount);
    }

    /// @inheritdoc ITAS
    function revoke(RevocationRequest calldata request) external payable {
        RevocationRequestData[] memory data = new RevocationRequestData[](1);
        data[0] = request.data;

        _revoke(request.schema, data, msg.sender, msg.value, true);
    }

    /// @inheritdoc ITAS
    function revokeByDelegation(DelegatedRevocationRequest calldata delegatedRequest) external payable {
        _verifyRevoke(delegatedRequest);

        RevocationRequestData[] memory data = new RevocationRequestData[](1);
        data[0] = delegatedRequest.data;

        _revoke(delegatedRequest.schema, data, delegatedRequest.revoker, msg.value, true);
    }

    /// @inheritdoc ITAS
    function multiRevoke(MultiRevocationRequest[] calldata multiRequests) external payable {
        // We are keeping track of the total available ETH amount that can be sent to resolvers and will keep deducting
        // from it to verify that there isn't any attempt to send too much ETH to resolvers. PlTASe note that unless
        // some ETH was stuck in the contract by accident (which shouldn't happen in normal conditions), it won't be
        // possible to send too much ETH anyway.
        uint256 availableValue = msg.value;

        uint256 length = multiRequests.length;
        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            // The last batch is handled slightly differently: if the total available ETH wasn't spent in full and there
            // is a remainder - it will be refunded back to the attester (something that we can only verify during the
            // last and final batch).
            bool last;
            unchecked {
                last = i == length - 1;
            }

            MultiRevocationRequest calldata multiRequest = multiRequests[i];

            // Ensure to deduct the ETH that was forwarded to the resolver during the processing of this batch.
            availableValue -= _revoke(multiRequest.schema, multiRequest.data, msg.sender, availableValue, last);
        }
    }

    /// @inheritdoc ITAS
    function multiRevokeByDelegation(
        MultiDelegatedRevocationRequest[] calldata multiDelegatedRequests
    ) external payable {
        // We are keeping track of the total available ETH amount that can be sent to resolvers and will keep deducting
        // from it to verify that there isn't any attempt to send too much ETH to resolvers. PlTASe note that unless
        // some ETH was stuck in the contract by accident (which shouldn't happen in normal conditions), it won't be
        // possible to send too much ETH anyway.
        uint256 availableValue = msg.value;

        uint256 length = multiDelegatedRequests.length;
        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            // The last batch is handled slightly differently: if the total available ETH wasn't spent in full and there
            // is a remainder - it will be refunded back to the attester (something that we can only verify during the
            // last and final batch).
            bool last;
            unchecked {
                last = i == length - 1;
            }

            MultiDelegatedRevocationRequest memory multiDelegatedRequest = multiDelegatedRequests[i];
            RevocationRequestData[] memory data = multiDelegatedRequest.data;

            // Ensure that no inputs are missing.
            uint256 dataLength = data.length;
            if (dataLength == 0 || dataLength != multiDelegatedRequest.signatures.length) {
                revert InvalidLength();
            }

            // Verify signatures. PlTASe note that the signatures are assumed to be signed with incrTASing nonces.
            for (uint256 j = 0; j < dataLength; j = uncheckedInc(j)) {
                _verifyRevoke(
                    DelegatedRevocationRequest({
                        schema: multiDelegatedRequest.schema,
                        data: data[j],
                        signature: multiDelegatedRequest.signatures[j],
                        revoker: multiDelegatedRequest.revoker,
                        deadline: multiDelegatedRequest.deadline
                    })
                );
            }

            // Ensure to deduct the ETH that was forwarded to the resolver during the processing of this batch.
            availableValue -= _revoke(
                multiDelegatedRequest.schema,
                data,
                multiDelegatedRequest.revoker,
                availableValue,
                last
            );
        }
    }

    /// @inheritdoc ITAS
    function timestamp(bytes32 data) external returns (uint64) {
        uint64 time = _time();

        _timestamp(data, time);

        return time;
    }

    /// @inheritdoc ITAS
    function revokeOffchain(bytes32 data) external returns (uint64) {
        uint64 time = _time();

        _revokeOffchain(msg.sender, data, time);

        return time;
    }

    /// @inheritdoc ITAS
    function multiRevokeOffchain(bytes32[] calldata data) external returns (uint64) {
        uint64 time = _time();

        uint256 length = data.length;
        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            _revokeOffchain(msg.sender, data[i], time);
        }

        return time;
    }

    /// @inheritdoc ITAS
    function multiTimestamp(bytes32[] calldata data) external returns (uint64) {
        uint64 time = _time();

        uint256 length = data.length;
        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            _timestamp(data[i], time);
        }

        return time;
    }


    /// @inheritdoc ITAS
    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        return _db[uid];
    }

    /// @inheritdoc ITAS
    function isAttestationValid(bytes32 uid) public view returns (bool) {
        return _db[uid].uid != EMPTY_UID;
    }

    /// @dev Attests to a specific schema.
    /// @param schemaUID The unique identifier of the schema to attest to.
    /// @param data The arguments of the attestation requests.
    /// @param attester The attesting account.
    /// @param availableValue The total available ETH amount that can be sent to the resolver.
    /// @param last Whether this is the last attestations/revocations set.
    /// @return The UID of the new attestations and the total sent ETH amount.
    function _attest(
        bytes32 schemaUID,
        AttestationRequestData[] memory data,
        address attester,
        uint256 availableValue,
        bool last
    ) private returns (AttestationsResult memory) {
        uint256 length = data.length;

        AttestationsResult memory res;
        res.uids = new bytes32[](length);

        // Ensure that we aren't attempting to attest to a non-existing schema.
        SchemaRecord memory schemaRecord = _schemaRegistry.getSchema(schemaUID);
        if (schemaRecord.uid == EMPTY_UID) {
            revert InvalidSchema();
        }

        Attestation[] memory attestations = new Attestation[](length);
        uint256[] memory values = new uint256[](length);

        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            AttestationRequestData memory request = data[i];

            // Ensure that either no expiration time was set or that it was set in the future.
            if (request.expirationTime != NO_EXPIRATION_TIME && request.expirationTime <= _time()) {
                revert InvalidExpirationTime();
            }

            // Ensure that we aren't trying to make a revocable attestation for a non-revocable schema.
            if (!schemaRecord.revocable && request.revocable) {
                revert Irrevocable();
            }

            Attestation memory attestation = Attestation({
                uid: EMPTY_UID,
                schema: schemaUID,
                refUID: request.refUID,
                time: _time(),
                expirationTime: request.expirationTime,
                revocationTime: 0,
                recipient: request.recipient,
                attester: attester,
                revocable: request.revocable,
                data: request.data
            });

            // Look for the first non-existing UID (and use a bump seed/nonce in the rare case of a conflict).
            bytes32 uid;
            uint32 bump = 0;
            while (true) {
                uid = _getUID(attestation, bump);
                if (_db[uid].uid == EMPTY_UID) {
                    break;
                }

                unchecked {
                    ++bump;
                }
            }
            attestation.uid = uid;

            _db[uid] = attestation;

            if (request.refUID != EMPTY_UID) {
                // Ensure that we aren't trying to attest to a non-existing referenced UID.
                if (!isAttestationValid(request.refUID)) {
                    revert NotFound();
                }
            }

            attestations[i] = attestation;
            values[i] = request.value;

            res.uids[i] = uid;

            AttestationInserted(attestation);
        }

        res.usedValue = _resolveAttestations(schemaRecord, attestations, values, false, availableValue, last);

        return res;
    }

    /// @dev Revokes an existing attestation to a specific schema.
    /// @param schemaUID The unique identifier of the schema to attest to.
    /// @param data The arguments of the revocation requests.
    /// @param revoker The revoking account.
    /// @param availableValue The total available ETH amount that can be sent to the resolver.
    /// @param last Whether this is the last attestations/revocations set.
    /// @return Returns the total sent ETH amount.
    function _revoke(
        bytes32 schemaUID,
        RevocationRequestData[] memory data,
        address revoker,
        uint256 availableValue,
        bool last
    ) private returns (uint256) {
        // Ensure that a non-existing schema ID wasn't passed by accident.
        SchemaRecord memory schemaRecord = _schemaRegistry.getSchema(schemaUID);
        if (schemaRecord.uid == EMPTY_UID) {
            revert InvalidSchema();
        }

        uint256 length = data.length;
        Attestation[] memory attestations = new Attestation[](length);
        uint256[] memory values = new uint256[](length);

        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            RevocationRequestData memory request = data[i];

            Attestation storage attestation = _db[request.uid];

            // Ensure that we aren't attempting to revoke a non-existing attestation.
            if (attestation.uid == EMPTY_UID) {
                revert NotFound();
            }

            // Ensure that a wrong schema ID wasn't passed by accident.
            if (attestation.schema != schemaUID) {
                revert InvalidSchema();
            }

            // Allow only original attesters to revoke their attestations.
            if (attestation.attester != revoker) {
                revert AccessDenied();
            }

            // PlTASe note that also checking of the schema itself is revocable is unnecessary, since it's not possible to
            // make revocable attestations to an irrevocable schema.
            if (!attestation.revocable) {
                revert Irrevocable();
            }

            // Ensure that we aren't trying to revoke the same attestation twice.
            if (attestation.revocationTime != 0) {
                revert AlreadyRevoked();
            }
            attestation.revocationTime = _time();

            attestations[i] = attestation;
            values[i] = request.value;

            AttestationRevokedUpdate(attestation.uid, revoker, attestation.revocationTime);

        }

        return _resolveAttestations(schemaRecord, attestations, values, true, availableValue, last);
    }

    /// @dev Resolves a new attestation or a revocation of an existing attestation.
    /// @param schemaRecord The schema of the attestation.
    /// @param attestation The data of the attestation to make/revoke.
    /// @param value An explicit ETH amount to send to the resolver.
    /// @param isRevocation Whether to resolve an attestation or its revocation.
    /// @param availableValue The total available ETH amount that can be sent to the resolver.
    /// @param last Whether this is the last attestations/revocations set.
    /// @return Returns the total sent ETH amount.
    function _resolveAttestation(
        SchemaRecord memory schemaRecord,
        Attestation memory attestation,
        uint256 value,
        bool isRevocation,
        uint256 availableValue,
        bool last
    ) private returns (uint256) {
        ISchemaResolver resolver = schemaRecord.resolver;
        if (address(resolver) == address(0)) {
            // Ensure that we don't accept payments if there is no resolver.
            if (value != 0) {
                revert NotPayable();
            }

            if (last) {
                _refund(availableValue);
            }

            return 0;
        }

        // Ensure that we don't accept payments which can't be forwarded to the resolver.
        if (value != 0) {
            if (!resolver.isPayable()) {
                revert NotPayable();
            }

            // Ensure that the attester/revoker doesn't try to spend more than available.
            if (value > availableValue) {
                revert InsufficientValue();
            }

            // Ensure to deduct the sent value explicitly.
            unchecked {
                availableValue -= value;
            }
        }

        if (isRevocation) {
            if (!resolver.revoke{ value: value }(attestation)) {
                revert InvalidRevocation();
            }
        } else if (!resolver.attest{ value: value }(attestation)) {
            revert InvalidAttestation();
        }

        if (last) {
            _refund(availableValue);
        }

        return value;
    }

    /// @dev Resolves multiple attestations or revocations of existing attestations.
    /// @param schemaRecord The schema of the attestation.
    /// @param attestations The data of the attestations to make/revoke.
    /// @param values Explicit ETH amounts to send to the resolver.
    /// @param isRevocation Whether to resolve an attestation or its revocation.
    /// @param availableValue The total available ETH amount that can be sent to the resolver.
    /// @param last Whether this is the last attestations/revocations set.
    /// @return Returns the total sent ETH amount.
    function _resolveAttestations(
        SchemaRecord memory schemaRecord,
        Attestation[] memory attestations,
        uint256[] memory values,
        bool isRevocation,
        uint256 availableValue,
        bool last
    ) private returns (uint256) {
        uint256 length = attestations.length;
        if (length == 1) {
            return _resolveAttestation(schemaRecord, attestations[0], values[0], isRevocation, availableValue, last);
        }

        ISchemaResolver resolver = schemaRecord.resolver;
        if (address(resolver) == address(0)) {
            // Ensure that we don't accept payments if there is no resolver.
            for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
                if (values[i] != 0) {
                    revert NotPayable();
                }
            }

            if (last) {
                _refund(availableValue);
            }

            return 0;
        }

        uint256 totalUsedValue = 0;
        bool isResolverPayable = resolver.isPayable();

        for (uint256 i = 0; i < length; i = uncheckedInc(i)) {
            uint256 value = values[i];

            // Ensure that we don't accept payments which can't be forwarded to the resolver.
            if (value == 0) {
                continue;
            }

            if (!isResolverPayable) {
                revert NotPayable();
            }

            // Ensure that the attester/revoker doesn't try to spend more than available.
            if (value > availableValue) {
                revert InsufficientValue();
            }

            // Ensure to deduct the sent value explicitly and add it to the total used value by the batch.
            unchecked {
                availableValue -= value;
                totalUsedValue += value;
            }
        }

        if (isRevocation) {
            if (!resolver.multiRevoke{ value: totalUsedValue }(attestations, values)) {
                revert InvalidRevocations();
            }
        } else if (!resolver.multiAttest{ value: totalUsedValue }(attestations, values)) {
            revert InvalidAttestations();
        }

        if (last) {
            _refund(availableValue);
        }

        return totalUsedValue;
    }

    /// @dev Calculates a UID for a given attestation.
    /// @param attestation The input attestation.
    /// @param bump A bump value to use in case of a UID conflict.
    /// @return Attestation UID.
    function _getUID(Attestation memory attestation, uint32 bump) private pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    attestation.schema,
                    attestation.recipient,
                    attestation.attester,
                    attestation.time,
                    attestation.expirationTime,
                    attestation.revocable,
                    attestation.refUID,
                    attestation.data,
                    bump
                )
            );
    }

    function getTime()external view returns(uint256){
        return _time();
    }

    /// @dev Refunds remaining ETH amount to the attester.
    /// @param remainingValue The remaining ETH amount that was not sent to the resolver.
    function _refund(uint256 remainingValue) private {
        if (remainingValue > 0) {
            // Using a regular transfer here might revert, for some non-EOA attesters, due to exceeding of the 2300
            // gas limit which is why we're using call instead (via sendValue), which the 2300 gas limit does not
            // apply for.
            payable(msg.sender).sendValue(remainingValue);
        }
    }

    /// @dev Timestamps the specified bytes32 data.
    /// @param data The data to timestamp.
    /// @param time The timestamp.
    function _timestamp(bytes32 data, uint64 time) private {
        if (_timestamps[data] != 0) {
            revert AlreadyTimestamped();
        }

        _timestamps[data] = time;

        Timestamped(data, time);
    }

    /// @dev Revokes the specified bytes32 data.
    /// @param revoker The revoking account.
    /// @param data The data to revoke.
    /// @param time The timestamp the data was revoked with.
    function _revokeOffchain(address revoker, bytes32 data, uint64 time) private {
        mapping(bytes32 data => uint64 timestamp) storage revocations = _revocationsOffchain[revoker];

        if (revocations[data] != 0) {
            revert AlreadyRevokedOffchain();
        }

        revocations[data] = time;

        RevokedOffChain(revoker, data, time);
    }

    /// @dev Merges lists of UIDs.
    /// @param uidLists The provided lists of UIDs.
    /// @param uidsCount Total UIDs count.
    /// @return A merged and flatten list of all the UIDs.
    function _mergeUIDs(bytes32[][] memory uidLists, uint256 uidsCount) private pure returns (bytes32[] memory) {
        bytes32[] memory uids = new bytes32[](uidsCount);

        uint256 currentIndex = 0;
        uint256 uidListLength = uidLists.length;
        for (uint256 i = 0; i < uidListLength; i = uncheckedInc(i)) {
            bytes32[] memory currentUids = uidLists[i];
            uint256 currentUidsLength = currentUids.length;
            for (uint256 j = 0; j < currentUidsLength; j = uncheckedInc(j)) {
                uids[currentIndex] = currentUids[j];

                unchecked {
                    ++currentIndex;
                }
            }
        }

        return uids;
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
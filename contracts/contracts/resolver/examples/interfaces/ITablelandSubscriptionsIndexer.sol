// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


interface ITablelandSubscriptionsIndexer {

    function SchemaInfoInserted(
        bytes32 schemaUID,
        uint256 monthlySubscriptionPrice,
        address splitterContract
    ) external;

    function SchemaAdminsInserted(
        bytes32 schemaUID,
        address[] memory contentCreators,
        uint256[] memory creatorsShares
    )external;

    function SchemaSubscriptionCreated(
        bytes32 schemaUID,
        address subscriber,
        uint256 subscriptionEndsAt
    )external;

    function SchemaSubscriptionUpdated(
        bytes32 schemaUID,
        address subscriber,
        uint256 subscriptionEndsAt
    )external;

    function SchemaRevenueRecordCreated(
        bytes32 schemaUID
    )external;

    function SchemaRevenueUpdated(
        bytes32 schemaUID,
        uint256 totalClaimed
    )external;

    function SchemaPriceUpdated(
        bytes32 schemaUID,
        uint256 newPrice
    )external;
}
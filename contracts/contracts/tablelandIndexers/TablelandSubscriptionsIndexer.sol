// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {TablelandDeployments, ITablelandTables} from "@tableland/evm/contracts/utils/TablelandDeployments.sol";

import {SQLHelpers} from "@tableland/evm/contracts/utils/SQLHelpers.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @title TAS
/// @notice The Tableland Attestation Service protocol.
contract TablelandSubscriptionsIndexer is IERC721Receiver, Ownable {
    ITablelandTables private tablelandContract;

    string[] createTableStatements;

    string[] public tables;

    uint256[] tableIDs;

    uint256 tablesUpdates;

    uint256 private tablesRowsCounter;

    string private constant GROUP_TABLE_PREFIX = "group";

    string private constant GROUP_SCHEMA =
        "schemaUID text primary key, monthlySubscriptionPrice text, splitterContract text";

    string private constant CREATOR_TABLE_PREFIX = "creator";

    string private constant CREATOR_SCHEMA =
        "schemaUID text, attester text, shares text";

    string private constant SUBSCRIPTION_TABLE_PREFIX = "subscription";

    string private constant SUBSCRIPTION_SCHEMA =
        "schemaUID text, subscriber text, subscriptionEndsAt text";

    string private constant GROUP_REVENUE_TABLE_PREFIX = "revenue";

    string private constant GROUP_REVENUE_SCHEMA =
        "schemaUID text primary key, totalClaimed text";

    constructor() {
        tablelandContract = TablelandDeployments.get();

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(GROUP_SCHEMA, GROUP_TABLE_PREFIX)
        );

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(CREATOR_SCHEMA, CREATOR_TABLE_PREFIX)
        );

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(
                SUBSCRIPTION_SCHEMA,
                SUBSCRIPTION_TABLE_PREFIX
            )
        );

        createTableStatements.push(
            SQLHelpers.toCreateFromSchema(
                GROUP_REVENUE_SCHEMA,
                GROUP_REVENUE_TABLE_PREFIX
            )
        );

        tableIDs = tablelandContract.create(
            address(this),
            createTableStatements
        );

        tables.push(SQLHelpers.toNameFromId(GROUP_TABLE_PREFIX, tableIDs[0]));
        tables.push(SQLHelpers.toNameFromId(CREATOR_TABLE_PREFIX, tableIDs[1]));
        tables.push(
            SQLHelpers.toNameFromId(SUBSCRIPTION_TABLE_PREFIX, tableIDs[2])
        );
        tables.push(
            SQLHelpers.toNameFromId(GROUP_REVENUE_TABLE_PREFIX, tableIDs[3])
        );
    }

    function SchemaInfoInserted(
        bytes32 schemaUID,
        uint256 monthlySubscriptionPrice,
        address splitterContract
    ) public onlyOwner {
        // Managing tableland rows limitation.
        if (tablesRowsCounter == 100000) {
            RenewTables();
        }
        mutate(
            tableIDs[0],
            SQLHelpers.toInsert(
                GROUP_TABLE_PREFIX,
                tableIDs[0],
                "schemaUID, monthlySubscriptionPrice, splitterContract",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(
                        (Strings.toString(monthlySubscriptionPrice))
                    ),
                    ",",
                    SQLHelpers.quote((Strings.toHexString(splitterContract)))
                )
            )
        );
        tablesRowsCounter++;
    }

    function SchemaAdminsInserted(
        bytes32 schemaUID,
        address[] memory contentCreators,
        uint256[] memory creatorsShares
    ) public onlyOwner {
        for (uint i = 0; i < contentCreators.length; i++) {
            mutate(
                tableIDs[1],
                SQLHelpers.toInsert(
                    CREATOR_TABLE_PREFIX,
                    tableIDs[1],
                    "schemaUID, attester, shares",
                    string.concat(
                        SQLHelpers.quote(bytes32ToString(schemaUID)),
                        ",",
                        SQLHelpers.quote(Strings.toHexString(contentCreators[i])),
                        ",",
                        SQLHelpers.quote(Strings.toString(creatorsShares[i]))
                    )
                )
            );
        }
    }

    function SchemaSubscriptionCreated(
        bytes32 schemaUID,
        address subscriber,
        uint256 subscriptionEndsAt
    ) public onlyOwner {
        mutate(
            tableIDs[2],
            SQLHelpers.toInsert(
                SUBSCRIPTION_TABLE_PREFIX,
                tableIDs[2],
                "schemaUID, subscriber, subscriptionEndsAt",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(subscriber)),
                    ",",
                    SQLHelpers.quote(Strings.toString(subscriptionEndsAt))
                )
            )
        );
    }

    function SchemaPriceUpdated(
        bytes32 schemaUID,
        uint256 newPrice
    ) public onlyOwner {
        mutate(
            tableIDs[0],
            SQLHelpers.toUpdate(
                GROUP_TABLE_PREFIX,
                tableIDs[0],
                string.concat(
                    "monthlySubscriptionPrice=",
                    SQLHelpers.quote(Strings.toString(newPrice))
                ),
                string.concat(
                    "schemaUID=",
                    SQLHelpers.quote(bytes32ToString(schemaUID))
                )
            )
        );
    }

    function SchemaSubscriptionUpdated(
        bytes32 schemaUID,
        address subscriber,
        uint256 subscriptionEndsAt
    ) public onlyOwner {
        mutate(
            tableIDs[2],
            SQLHelpers.toUpdate(
                SUBSCRIPTION_TABLE_PREFIX,
                tableIDs[2],
                string.concat(
                    "subscriptionEndsAt=",
                    SQLHelpers.quote(Strings.toString(subscriptionEndsAt))
                ),
                string.concat(
                    "subscriber=",
                    SQLHelpers.quote(Strings.toHexString(subscriber)),
                    "and schemaUID=",
                    SQLHelpers.quote(bytes32ToString(schemaUID))
                )
            )
        );
    }

    function SchemaRevenueRecordCreated(bytes32 schemaUID) public onlyOwner {
        uint256 ZERO = 0;
        mutate(
            tableIDs[3],
            SQLHelpers.toInsert(
                GROUP_REVENUE_TABLE_PREFIX,
                tableIDs[3],
                "schemaUID, totalClaimed",
                string.concat(
                    SQLHelpers.quote(bytes32ToString(schemaUID)),
                    ",",
                    SQLHelpers.quote(Strings.toString(ZERO))
                )
            )
        );
    }

    function SchemaRevenueUpdated(
        bytes32 schemaUID,
        uint256 totalClaimed
    ) public onlyOwner {
        mutate(
            tableIDs[3],
            SQLHelpers.toUpdate(
                GROUP_REVENUE_TABLE_PREFIX,
                tableIDs[3],
                string.concat(
                    "totalClaimed=",
                    SQLHelpers.quote(Strings.toString(totalClaimed))
                ),
                string.concat(
                    "schemaUID=",
                    SQLHelpers.quote(bytes32ToString(schemaUID))
                )
            )
        );
    }

    function RenewTables() internal {
        tableIDs = tablelandContract.create(
            address(this),
            createTableStatements
        );

        tables.push(SQLHelpers.toNameFromId(GROUP_TABLE_PREFIX, tableIDs[0]));

        tables.push(SQLHelpers.toNameFromId(CREATOR_TABLE_PREFIX, tableIDs[1]));

        tables.push(
            SQLHelpers.toNameFromId(SUBSCRIPTION_TABLE_PREFIX, tableIDs[2])
        );

        tables.push(
            SQLHelpers.toNameFromId(GROUP_REVENUE_TABLE_PREFIX, tableIDs[3])
        );

        tablesRowsCounter = 0;

        tablesUpdates++;
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

    /*
     * @dev Internal function to execute a mutation on a table.
     * @param {uint256} tableId - Table ID.
     * @param {string} statement - Mutation statement.
     */
    function mutate(uint256 tableId, string memory statement) internal {
        tablelandContract.mutate(address(this), tableId, statement);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

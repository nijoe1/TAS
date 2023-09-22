// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SplitterFactory is Ownable {
    address public implementationAddress;

    // Constructor
    constructor(address _implementationAddress) {
        implementationAddress = _implementationAddress;
    }

    // Function to create a new OptimisticResolver contract and associate it with a schema
    function createSplitter(
        address[] memory payees,
        uint256[] memory shares
    ) external returns (address splitterClone) {
        // Create new resolver contract
        splitterClone = Clones.clone(implementationAddress);

        (bool success, ) = splitterClone.call(
            abi.encodeWithSignature(
                "initialize(address[],uint256[])",
                payees,
                shares
            )
        );
        require(success, "error deploying");
    }

    function changeImplementations(
        address _implementationAddress
    ) public onlyOwner {
        implementationAddress = _implementationAddress;
    }
}

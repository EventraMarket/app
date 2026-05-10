// SimpleResolver.sol — deploy this yourself in Remix
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

interface IConditionalTokens {
    function reportPayouts(bytes32 questionId, uint256[] calldata payouts) external;
}

contract SimpleResolver {
    address public owner;
    IConditionalTokens public ctf;

    constructor(address _ctf) {
        owner = msg.sender;
        ctf = IConditionalTokens(_ctf);
    }

    /// @notice Resolve a market. payouts = [0,1e18] for No wins, [1e18,0] for Yes wins
    function resolve(bytes32 questionId, uint256[] calldata payouts) external {
        require(msg.sender == owner, "not owner");
        ctf.reportPayouts(questionId, payouts);
    }
}
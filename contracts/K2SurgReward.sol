// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./K2SurgRewardNFT.sol";

contract K2SurgReward {
    uint256 public constant REWARD_THRESHOLD = 250;

    struct Performance {
        uint score;
        uint transfers;
        uint penalties;
        uint timestamp;
    }

    K2SurgRewardNFT public rewardNFT;
    mapping(address => Performance[]) public userRecords;

    event PerformanceRecorded(address user, uint score, bool minted);

    constructor(address _nftAddress) {
        rewardNFT = K2SurgRewardNFT(_nftAddress);
    }

    function recordPerformance(
        uint _score,
        uint _transfers,
        uint _penalties
    ) public {
        userRecords[msg.sender].push(
            Performance(_score, _transfers, _penalties, block.timestamp)
        );

        bool minted = false;
        if (_score > REWARD_THRESHOLD) {
            rewardNFT.mintReward(msg.sender);
            minted = true;
        }

        emit PerformanceRecorded(msg.sender, _score, minted);
    }

    function getUserRecords(
        address user
    ) public view returns (Performance[] memory) {
        return userRecords[user];
    }
}

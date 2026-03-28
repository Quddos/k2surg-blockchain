// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "/contracts/K2SurgRewardNFT.sol";

contract K2SurgReward {
    struct Performance {
        uint score;
        uint transfers;
        uint penalties;
        uint timestamp;
    }
    constructor(address _nftAddress) {
        rewardNFT = K2SurgRewardNFT(_nftAddress);
    }

    K2SurgRewardNFT public rewardNFT;

    mapping(address => Performance[]) public userRecords;

    event PerformanceRecorded(address user, uint score, uint reward);

    function recordPerformance(
        uint _score,
        uint _transfers,
        uint _penalties
    ) public {
        userRecords[msg.sender].push(
            Performance(_score, _transfers, _penalties, block.timestamp)
        );

        uint reward = calculateReward(_score);

        // 🔥 NFT MINT CONDITION
        if (_score > 200) {
            rewardNFT.mintReward(msg.sender);
        }

        emit PerformanceRecorded(msg.sender, _score, reward);
    }

    function calculateReward(uint score) internal pure returns (uint) {
        if (score > 250) return 10;
        else if (score > 200) return 5;
        else return 1;
    }

    function getUserRecords(
        address user
    ) public view returns (Performance[] memory) {
        return userRecords[user];
    }
}

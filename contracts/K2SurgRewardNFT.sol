// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract K2SurgRewardNFT is ERC721, Ownable {

    uint256 public tokenCounter;

    constructor() 
        ERC721("K2Surg Reward NFT", "K2SR") 
        Ownable(msg.sender) 
    {
        tokenCounter = 0;
    }

    function mintReward(address player) public onlyOwner returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(player, newTokenId);
        tokenCounter++;
        return newTokenId;
    }
}
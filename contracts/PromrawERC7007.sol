// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PromrawERC7007
 * @dev Implementation of the ERC7007 standard for AI-generated NFTs
 */
contract PromrawERC7007 is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to AI model version
    mapping(uint256 => string) private _aiModelVersions;
    
    // Mapping from token ID to AI prompt
    mapping(uint256 => string) private _aiPrompts;
    
    // Mapping from token ID to score
    mapping(uint256 => uint256) private _scores;

    event NFTMinted(uint256 indexed tokenId, address indexed owner, string prompt, uint256 score);

    constructor() ERC721("Promraw ERC7007", "PRAW") Ownable(msg.sender) {}

    function mint(
        string memory tokenURI,
        string memory aiModelVersion,
        string memory prompt,
        uint256 score
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _aiModelVersions[newTokenId] = aiModelVersion;
        _aiPrompts[newTokenId] = prompt;
        _scores[newTokenId] = score;

        emit NFTMinted(newTokenId, msg.sender, prompt, score);

        return newTokenId;
    }

    function getAIModelVersion(uint256 tokenId) public view returns (string memory) {
        _requireMinted(tokenId);
        return _aiModelVersions[tokenId];
    }

    function getPrompt(uint256 tokenId) public view returns (string memory) {
        _requireMinted(tokenId);
        return _aiPrompts[tokenId];
    }

    function getScore(uint256 tokenId) public view returns (uint256) {
        _requireMinted(tokenId);
        return _scores[tokenId];
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
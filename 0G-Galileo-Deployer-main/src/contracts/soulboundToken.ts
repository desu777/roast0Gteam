import { ContractTemplate } from '../types';

export const soulboundToken: ContractTemplate = {
  name: 'Soulbound Token (SBT)',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoulboundToken
 * @dev Non-transferable NFT for reputation and credentials
 */
contract SoulboundToken {
    string public name;
    string public symbol;
    address public owner;
    uint256 public totalSupply;
    
    struct TokenData {
        string credentialType;
        string metadata;
        uint256 issuedAt;
        uint256 expiresAt;
        bool active;
    }
    
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => TokenData) public tokenData;
    mapping(address => bool) public authorizedIssuers;
    
    uint256 private _currentTokenId;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event SoulboundMint(address indexed to, uint256 indexed tokenId, string credentialType);
    event TokenRevoked(uint256 indexed tokenId);
    event TokenExpired(uint256 indexed tokenId);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    error OnlyOwner();
    error OnlyAuthorizedIssuer();
    error TokenNotExists();
    error TokenExpiredError();
    error TokenRevokedError();
    error TransferNotAllowed();
    error AlreadyAuthorized();
    error NotAuthorized();
    error InvalidExpiryDate();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        if (!authorizedIssuers[msg.sender] && msg.sender != owner) revert OnlyAuthorizedIssuer();
        _;
    }
    
    modifier tokenExists(uint256 tokenId) {
        if (ownerOf[tokenId] == address(0)) revert TokenNotExists();
        _;
    }
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    function mint(
        address to,
        string calldata credentialType,
        string calldata metadata,
        uint256 expiryInDays
    ) external onlyAuthorizedIssuer returns (uint256) {
        uint256 tokenId = _currentTokenId++;
        
        uint256 expiresAt = expiryInDays > 0 ? 
            block.timestamp + (expiryInDays * 1 days) : 
            0; // 0 means never expires
        
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        totalSupply++;
        
        tokenData[tokenId] = TokenData({
            credentialType: credentialType,
            metadata: metadata,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });
        
        emit Transfer(address(0), to, tokenId);
        emit SoulboundMint(to, tokenId, credentialType);
        
        return tokenId;
    }
    
    function revoke(uint256 tokenId) external onlyAuthorizedIssuer tokenExists(tokenId) {
        tokenData[tokenId].active = false;
        emit TokenRevoked(tokenId);
    }
    
    function isValid(uint256 tokenId) external view tokenExists(tokenId) returns (bool) {
        TokenData memory data = tokenData[tokenId];
        
        if (!data.active) return false;
        if (data.expiresAt > 0 && block.timestamp > data.expiresAt) return false;
        
        return true;
    }
    
    function getTokenInfo(uint256 tokenId) external view tokenExists(tokenId) returns (
        address holder,
        string memory credentialType,
        string memory metadata,
        uint256 issuedAt,
        uint256 expiresAt,
        bool active,
        bool expired
    ) {
        TokenData memory data = tokenData[tokenId];
        bool isExpired = data.expiresAt > 0 && block.timestamp > data.expiresAt;
        
        return (
            ownerOf[tokenId],
            data.credentialType,
            data.metadata,
            data.issuedAt,
            data.expiresAt,
            data.active,
            isExpired
        );
    }
    
    function authorizeIssuer(address issuer) external onlyOwner {
        if (authorizedIssuers[issuer]) revert AlreadyAuthorized();
        
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer);
    }
    
    function revokeIssuer(address issuer) external onlyOwner {
        if (!authorizedIssuers[issuer]) revert NotAuthorized();
        
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
    
    function getTokensByOwner(address holder) external view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](balanceOf[holder]);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < _currentTokenId; i++) {
            if (ownerOf[i] == holder) {
                tokens[counter] = i;
                counter++;
            }
        }
        
        return tokens;
    }
    
    // Override transfer functions to make tokens soulbound
    function transferFrom(address, address, uint256) external pure {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256) external pure {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert TransferNotAllowed();
    }
    
    function approve(address, uint256) external pure {
        revert TransferNotAllowed();
    }
    
    function setApprovalForAll(address, bool) external pure {
        revert TransferNotAllowed();
    }
    
    function getApproved(uint256) external pure returns (address) {
        return address(0); // No approvals allowed
    }
    
    function isApprovedForAll(address, address) external pure returns (bool) {
        return false; // No approvals allowed
    }
    
    // ERC-165 support
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || // ERC-165
               interfaceId == 0x80ac58cd;   // ERC-721 (partial)
    }
    
    function tokenURI(uint256 tokenId) external view tokenExists(tokenId) returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json,{",
            '"name":"', name, ' #', _toString(tokenId), '",',
            '"description":"Soulbound token for ', tokenData[tokenId].credentialType, '",',
            '"attributes":[',
            '{"trait_type":"Credential Type","value":"', tokenData[tokenId].credentialType, '"},',
            '{"trait_type":"Issued At","value":', _toString(tokenData[tokenId].issuedAt), '},',
            '{"trait_type":"Active","value":', tokenData[tokenId].active ? 'true' : 'false', '}',
            ']}'
        ));
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
}`,
  formFields: [
    { name: 'name', type: 'string', label: 'SBT Collection Name', placeholder: 'Achievement Badges', required: true },
    { name: 'symbol', type: 'string', label: 'SBT Symbol', placeholder: 'ACHIEVE', required: true }
  ]
}; 
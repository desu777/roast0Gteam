import { ContractTemplate } from '../types';

export const nft721: ContractTemplate = {
  name: 'ERC-721 NFT',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleNFT
 * @dev ERC721 NFT implementation without external dependencies
 */
contract SimpleNFT {
    // Token name
    string private _name;
    
    // Token symbol
    string private _symbol;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    
    // Mapping owner address to token count
    mapping(address => uint256) private _balances;
    
    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;
    
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;
    
    uint256 private _nextTokenId;
    uint256 public mintPrice;
    uint256 public maxSupply;
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintPriceChanged(uint256 oldPrice, uint256 newPrice);
    
    error OnlyOwner();
    error MaxSupplyExceeded();
    error InsufficientPayment();
    error WithdrawalFailed();
    error InvalidTokenId();
    error NotOwnerOrApproved();
    error TransferToZeroAddress();
    error ApprovalToCurrentOwner();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _mintPrice,
        uint256 _maxSupply
    ) {
        _name = name_;
        _symbol = symbol_;
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
        owner = msg.sender;
        _nextTokenId = 1;
    }
    
    // ERC-721 Standard Functions
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function balanceOf(address owner_) public view returns (uint256) {
        require(owner_ != address(0), "ERC721: balance query for the zero address");
        return _balances[owner_];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "ERC721: owner query for nonexistent token");
        return tokenOwner;
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
    
    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        if (to == tokenOwner) revert ApprovalToCurrentOwner();
        
        require(msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all");
        
        _approve(to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "ERC721: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner_, address operator) public view returns (bool) {
        return _operatorApprovals[owner_][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    // Simplified safe transfer - just calls regular transfer
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        transferFrom(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory) public {
        transferFrom(from, to, tokenId);
    }
    
    // Custom Functions
    function mint(address to, string memory uri) public payable {
        if (_nextTokenId > maxSupply) revert MaxSupplyExceeded();
        if (msg.value < mintPrice) revert InsufficientPayment();
        
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(to, tokenId, uri);
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
    }
    
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceChanged(oldPrice, newPrice);
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }
    
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    // Internal Functions
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address tokenOwner = ownerOf(tokenId);
        return (spender == tokenOwner || getApproved(tokenId) == spender || isApprovedForAll(tokenOwner, spender));
    }
    
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        if (to == address(0)) revert TransferToZeroAddress();
        
        // Clear approvals from the previous owner
        _approve(address(0), tokenId);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }
    
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "ERC721: URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }
    
    // ERC165
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165 Interface ID for ERC165
            interfaceId == 0x80ac58cd || // ERC165 Interface ID for ERC721
            interfaceId == 0x5b5e139f;   // ERC165 Interface ID for ERC721Metadata
    }
}`,
  formFields: [
    { name: 'name', type: 'string', label: 'NFT Name', placeholder: 'My NFT Collection', required: true },
    { name: 'symbol', type: 'string', label: 'NFT Symbol', placeholder: 'MNC', required: true },
    { name: 'mintPrice', type: 'string', label: 'Mint Price (wei)', placeholder: '1000000000000000000', required: true },
    { name: 'maxSupply', type: 'number', label: 'Max Supply', placeholder: '10000', required: true }
  ]
}; 
import { ContractTemplate } from '../types';

export const simpleCrowdsale: ContractTemplate = {
  name: 'Simple Crowdsale',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleCrowdsale
 * @dev Accepts ETH and mints tokens in presale with supply limits
 */
contract SimpleCrowdsale {
    address public owner;
    uint256 public tokenPrice; // wei per token
    uint256 public maxSupply;
    uint256 public totalSold;
    uint256 public saleStart;
    uint256 public saleEnd;
    bool public saleFinalized;
    
    string public tokenName;
    string public tokenSymbol;
    uint8 public constant decimals = 18;
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public purchased;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event SaleFinalized();
    event RefundClaimed(address indexed buyer, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event SaleExtended(uint256 newEndTime);
    
    error OnlyOwner();
    error SaleNotActive();
    error SaleAlreadyFinalized();
    error MaxSupplyExceeded();
    error InsufficientPayment();
    error InvalidAmount();
    error NoRefundAvailable();
    error TransferFailed();
    error SaleNotEnded();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier saleActive() {
        if (block.timestamp < saleStart || block.timestamp > saleEnd) revert SaleNotActive();
        if (saleFinalized) revert SaleAlreadyFinalized();
        _;
    }
    
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _tokenPrice,
        uint256 _maxSupply,
        uint256 _saleDurationInDays
    ) {
        owner = msg.sender;
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
        tokenPrice = _tokenPrice;
        maxSupply = _maxSupply;
        saleStart = block.timestamp;
        saleEnd = block.timestamp + (_saleDurationInDays * 1 days);
    }
    
    function buyTokens() external payable saleActive {
        if (msg.value == 0) revert InvalidAmount();
        
        uint256 tokenAmount = (msg.value * 10**decimals) / tokenPrice;
        
        if (totalSold + tokenAmount > maxSupply) revert MaxSupplyExceeded();
        
        balances[msg.sender] += tokenAmount;
        purchased[msg.sender] += msg.value;
        totalSold += tokenAmount;
        
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }
    
    function finalizeSale() external onlyOwner {
        if (block.timestamp <= saleEnd) revert SaleNotEnded();
        
        saleFinalized = true;
        emit SaleFinalized();
    }
    
    function extendSale(uint256 additionalDays) external onlyOwner {
        if (saleFinalized) revert SaleAlreadyFinalized();
        
        saleEnd += (additionalDays * 1 days);
        emit SaleExtended(saleEnd);
    }
    
    function claimRefund() external {
        if (saleFinalized) revert SaleAlreadyFinalized();
        if (block.timestamp <= saleEnd) revert SaleNotEnded();
        
        uint256 refundAmount = purchased[msg.sender];
        if (refundAmount == 0) revert NoRefundAvailable();
        
        purchased[msg.sender] = 0;
        balances[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) revert TransferFailed();
        
        emit RefundClaimed(msg.sender, refundAmount);
    }
    
    function withdrawFunds() external onlyOwner {
        if (!saleFinalized) revert SaleAlreadyFinalized();
        
        uint256 balance = address(this).balance;
        
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(owner, balance);
    }
    
    // Basic ERC-20-like functions for purchased tokens
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        if (!saleFinalized) revert SaleAlreadyFinalized();
        if (balances[msg.sender] < amount) revert InsufficientPayment();
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        return true;
    }
    
    function getSaleInfo() external view returns (
        uint256 _tokenPrice,
        uint256 _maxSupply,
        uint256 _totalSold,
        uint256 _saleStart,
        uint256 _saleEnd,
        bool _saleFinalized,
        bool _saleActive,
        uint256 _timeLeft,
        uint256 _tokensRemaining
    ) {
        return (
            tokenPrice,
            maxSupply,
            totalSold,
            saleStart,
            saleEnd,
            saleFinalized,
            block.timestamp >= saleStart && block.timestamp <= saleEnd && !saleFinalized,
            block.timestamp < saleEnd ? saleEnd - block.timestamp : 0,
            maxSupply - totalSold
        );
    }
}`,
  formFields: [
    { name: 'tokenName', type: 'string', label: 'Token Name', placeholder: 'My Presale Token', required: true },
    { name: 'tokenSymbol', type: 'string', label: 'Token Symbol', placeholder: 'MPT', required: true },
    { name: 'tokenPrice', type: 'string', label: 'Token Price (wei per token)', placeholder: '1000000000000000', required: true },
    { name: 'maxSupply', type: 'string', label: 'Max Supply (with decimals)', placeholder: '1000000000000000000000000', required: true },
    { name: 'saleDurationInDays', type: 'number', label: 'Sale Duration (days)', placeholder: '30', required: true }
  ]
}; 
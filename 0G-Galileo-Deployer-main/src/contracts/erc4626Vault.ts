import { ContractTemplate } from '../types';

export const erc4626Vault: ContractTemplate = {
  name: 'ERC-4626 Mini Vault',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC4626MiniVault
 * @dev Simplified ERC-4626 vault that accepts ETH, issues shares, and tracks profits
 */
contract ERC4626MiniVault {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    
    address public owner;
    uint256 public totalShares;
    uint256 public totalAssets;
    uint256 public lastProfitUpdate;
    uint256 public profitRate; // profit per second as percentage (scaled by 1e18)
    
    mapping(address => uint256) public shares;
    mapping(address => mapping(address => uint256)) public allowances;
    
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event ProfitAdded(uint256 amount);
    event ProfitRateUpdated(uint256 newRate);
    
    error OnlyOwner();
    error InsufficientShares();
    error InsufficientAllowance();
    error TransferFailed();
    error InvalidAmount();
    error ExceedsBalance();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(string memory _name, string memory _symbol, uint256 _profitRatePerYear) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        
        // Convert annual rate to per-second rate (scaled by 1e18)
        profitRate = (_profitRatePerYear * 1e18) / (365 * 24 * 3600);
        lastProfitUpdate = block.timestamp;
    }
    
    function deposit(uint256 assets, address receiver) external payable returns (uint256 sharesAmount) {
        if (msg.value != assets) revert InvalidAmount();
        if (assets == 0) revert InvalidAmount();
        
        _updateProfit();
        
        sharesAmount = convertToShares(assets);
        
        shares[receiver] += sharesAmount;
        totalShares += sharesAmount;
        totalAssets += assets;
        
        emit Deposit(msg.sender, receiver, assets, sharesAmount);
        emit Transfer(address(0), receiver, sharesAmount);
        
        return sharesAmount;
    }
    
    function withdraw(uint256 assets, address receiver, address owner_) external returns (uint256 sharesAmount) {
        _updateProfit();
        
        sharesAmount = convertToShares(assets);
        
        if (msg.sender != owner_) {
            uint256 allowed = allowances[owner_][msg.sender];
            if (allowed < sharesAmount) revert InsufficientAllowance();
            allowances[owner_][msg.sender] = allowed - sharesAmount;
        }
        
        if (shares[owner_] < sharesAmount) revert InsufficientShares();
        if (totalAssets < assets) revert ExceedsBalance();
        
        shares[owner_] -= sharesAmount;
        totalShares -= sharesAmount;
        totalAssets -= assets;
        
        (bool success, ) = payable(receiver).call{value: assets}("");
        if (!success) revert TransferFailed();
        
        emit Withdraw(msg.sender, receiver, owner_, assets, sharesAmount);
        emit Transfer(owner_, address(0), sharesAmount);
        
        return sharesAmount;
    }
    
    function redeem(uint256 sharesAmount, address receiver, address owner_) external returns (uint256 assets) {
        _updateProfit();
        
        if (msg.sender != owner_) {
            uint256 allowed = allowances[owner_][msg.sender];
            if (allowed < sharesAmount) revert InsufficientAllowance();
            allowances[owner_][msg.sender] = allowed - sharesAmount;
        }
        
        if (shares[owner_] < sharesAmount) revert InsufficientShares();
        
        assets = convertToAssets(sharesAmount);
        
        if (totalAssets < assets) revert ExceedsBalance();
        
        shares[owner_] -= sharesAmount;
        totalShares -= sharesAmount;
        totalAssets -= assets;
        
        (bool success, ) = payable(receiver).call{value: assets}("");
        if (!success) revert TransferFailed();
        
        emit Withdraw(msg.sender, receiver, owner_, assets, sharesAmount);
        emit Transfer(owner_, address(0), sharesAmount);
        
        return assets;
    }
    
    function convertToShares(uint256 assets) public view returns (uint256) {
        if (totalAssets == 0 || totalShares == 0) {
            return assets; // 1:1 ratio for first deposit
        }
        return (assets * totalShares) / totalAssets;
    }
    
    function convertToAssets(uint256 sharesAmount) public view returns (uint256) {
        if (totalShares == 0) {
            return 0;
        }
        return (sharesAmount * totalAssets) / totalShares;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return shares[account];
    }
    
    function totalSupply() external view returns (uint256) {
        return totalShares;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        if (shares[msg.sender] < amount) revert InsufficientShares();
        
        shares[msg.sender] -= amount;
        shares[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function allowance(address owner_, address spender) external view returns (uint256) {
        return allowances[owner_][spender];
    }
    
    function _updateProfit() internal {
        if (totalAssets > 0) {
            uint256 timeElapsed = block.timestamp - lastProfitUpdate;
            uint256 profit = (totalAssets * profitRate * timeElapsed) / 1e18;
            
            if (profit > 0) {
                totalAssets += profit;
                emit ProfitAdded(profit);
            }
        }
        
        lastProfitUpdate = block.timestamp;
    }
    
    function addProfit() external payable onlyOwner {
        totalAssets += msg.value;
        emit ProfitAdded(msg.value);
    }
    
    function setProfitRate(uint256 newAnnualRate) external onlyOwner {
        _updateProfit();
        profitRate = (newAnnualRate * 1e18) / (365 * 24 * 3600);
        emit ProfitRateUpdated(newAnnualRate);
    }
    
    function getVaultInfo() external view returns (
        uint256 _totalAssets,
        uint256 _totalShares,
        uint256 _profitRate,
        uint256 _lastUpdate,
        uint256 _sharePrice
    ) {
        return (
            totalAssets,
            totalShares,
            profitRate,
            lastProfitUpdate,
            totalShares > 0 ? (totalAssets * 1e18) / totalShares : 1e18
        );
    }
    
    // Allow vault to receive ETH directly
    receive() external payable {
        totalAssets += msg.value;
        emit ProfitAdded(msg.value);
    }
}`,
  formFields: [
    { name: 'name', type: 'string', label: 'Vault Name', placeholder: 'My Yield Vault', required: true },
    { name: 'symbol', type: 'string', label: 'Vault Symbol', placeholder: 'MYV', required: true },
    { name: 'profitRatePerYear', type: 'number', label: 'Annual Profit Rate (%)', placeholder: '5', required: true }
  ]
}; 
import { ContractTemplate } from '../types';

export const timelockVault: ContractTemplate = {
  name: 'Timelock Vault',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimelockVault
 * @dev Freezes Ether until a specific date
 */
contract TimelockVault {
    address public owner;
    uint256 public unlockTime;
    uint256 public totalDeposits;
    bool public withdrawn;
    
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event UnlockTimeExtended(uint256 newUnlockTime);
    
    error OnlyOwner();
    error StillLocked();
    error AlreadyWithdrawn();
    error TransferFailed();
    error InvalidUnlockTime();
    error NoFundsToWithdraw();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier notWithdrawn() {
        if (withdrawn) revert AlreadyWithdrawn();
        _;
    }
    
    constructor(uint256 _unlockTimeInDays) payable {
        if (_unlockTimeInDays == 0) revert InvalidUnlockTime();
        
        owner = msg.sender;
        unlockTime = block.timestamp + (_unlockTimeInDays * 1 days);
        totalDeposits = msg.value;
        
        if (msg.value > 0) {
            emit FundsDeposited(msg.sender, msg.value);
        }
    }
    
    function deposit() external payable {
        totalDeposits += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    function withdraw() external onlyOwner notWithdrawn {
        if (block.timestamp < unlockTime) revert StillLocked();
        
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        withdrawn = true;
        
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(owner, balance);
    }
    
    function extendLock(uint256 additionalDays) external onlyOwner notWithdrawn {
        unlockTime += (additionalDays * 1 days);
        emit UnlockTimeExtended(unlockTime);
    }
    
    function getVaultInfo() external view returns (
        address _owner,
        uint256 _unlockTime,
        uint256 _balance,
        uint256 _totalDeposits,
        bool _isUnlocked,
        bool _withdrawn,
        uint256 _timeLeft
    ) {
        return (
            owner,
            unlockTime,
            address(this).balance,
            totalDeposits,
            block.timestamp >= unlockTime,
            withdrawn,
            block.timestamp < unlockTime ? unlockTime - block.timestamp : 0
        );
    }
    
    // Allow contract to receive funds
    receive() external payable {
        totalDeposits += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
}`,
  formFields: [
    { name: 'unlockTimeInDays', type: 'number', label: 'Lock Period (days)', placeholder: '30', required: true }
  ]
}; 
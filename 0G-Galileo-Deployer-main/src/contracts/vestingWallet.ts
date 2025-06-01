import { ContractTemplate } from '../types';

export const vestingWallet: ContractTemplate = {
  name: 'Vesting Wallet',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleVestingWallet
 * @dev Releases tokens linearly over time for employees/investors
 */
contract SimpleVestingWallet {
    address public owner;
    address public beneficiary;
    uint256 public startTime;
    uint256 public duration;
    uint256 public totalAmount;
    uint256 public releasedAmount;
    bool public revocable;
    bool public revoked;
    
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary);
    event BeneficiaryChanged(address indexed oldBeneficiary, address indexed newBeneficiary);
    
    error OnlyOwner();
    error OnlyBeneficiary();
    error VestingNotStarted();
    error VestingAlreadyRevoked();
    error VestingNotRevocable();
    error NoTokensToRelease();
    error InvalidBeneficiary();
    error TransferFailed();
    error InvalidDuration();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier onlyBeneficiary() {
        if (msg.sender != beneficiary) revert OnlyBeneficiary();
        _;
    }
    
    modifier notRevoked() {
        if (revoked) revert VestingAlreadyRevoked();
        _;
    }
    
    constructor(
        address _beneficiary,
        uint256 _durationInDays,
        bool _revocable
    ) payable {
        if (_beneficiary == address(0)) revert InvalidBeneficiary();
        if (_durationInDays == 0) revert InvalidDuration();
        
        owner = msg.sender;
        beneficiary = _beneficiary;
        startTime = block.timestamp;
        duration = _durationInDays * 1 days;
        totalAmount = msg.value;
        revocable = _revocable;
    }
    
    function release() external onlyBeneficiary notRevoked {
        uint256 releasable = getReleasableAmount();
        if (releasable == 0) revert NoTokensToRelease();
        
        releasedAmount += releasable;
        
        (bool success, ) = payable(beneficiary).call{value: releasable}("");
        if (!success) revert TransferFailed();
        
        emit TokensReleased(beneficiary, releasable);
    }
    
    function revoke() external onlyOwner notRevoked {
        if (!revocable) revert VestingNotRevocable();
        
        revoked = true;
        
        // Release any vested amount to beneficiary
        uint256 releasable = getReleasableAmount();
        if (releasable > 0) {
            releasedAmount += releasable;
            (bool success, ) = payable(beneficiary).call{value: releasable}("");
            if (!success) revert TransferFailed();
            emit TokensReleased(beneficiary, releasable);
        }
        
        // Return unvested amount to owner
        uint256 remaining = address(this).balance;
        if (remaining > 0) {
            (bool success, ) = payable(owner).call{value: remaining}("");
            if (!success) revert TransferFailed();
        }
        
        emit VestingRevoked(beneficiary);
    }
    
    function changeBeneficiary(address newBeneficiary) external {
        if (msg.sender != owner && msg.sender != beneficiary) revert OnlyOwner();
        if (newBeneficiary == address(0)) revert InvalidBeneficiary();
        
        address oldBeneficiary = beneficiary;
        beneficiary = newBeneficiary;
        
        emit BeneficiaryChanged(oldBeneficiary, newBeneficiary);
    }
    
    function getReleasableAmount() public view returns (uint256) {
        if (revoked) return 0;
        
        return getVestedAmount() - releasedAmount;
    }
    
    function getVestedAmount() public view returns (uint256) {
        if (block.timestamp < startTime) {
            return 0;
        } else if (block.timestamp >= startTime + duration || revoked) {
            return totalAmount;
        } else {
            return (totalAmount * (block.timestamp - startTime)) / duration;
        }
    }
    
    function getVestingInfo() external view returns (
        address _beneficiary,
        uint256 _startTime,
        uint256 _duration,
        uint256 _totalAmount,
        uint256 _releasedAmount,
        uint256 _releasableAmount,
        uint256 _vestedAmount,
        bool _revocable,
        bool _revoked,
        uint256 _timeLeft
    ) {
        return (
            beneficiary,
            startTime,
            duration,
            totalAmount,
            releasedAmount,
            getReleasableAmount(),
            getVestedAmount(),
            revocable,
            revoked,
            block.timestamp < startTime + duration ? 
                (startTime + duration) - block.timestamp : 0
        );
    }
    
    // Allow contract to receive additional funds
    receive() external payable {
        totalAmount += msg.value;
    }
}`,
  formFields: [
    { name: 'beneficiary', type: 'string', label: 'Beneficiary Address', placeholder: '0x742d35Cc6129C6532C89396D0EC99E8A0C98C8C7', required: true },
    { name: 'durationInDays', type: 'number', label: 'Vesting Duration (days)', placeholder: '365', required: true },
    { name: 'revocable', type: 'string', label: 'Revocable (true/false)', placeholder: 'true', required: true }
  ]
}; 
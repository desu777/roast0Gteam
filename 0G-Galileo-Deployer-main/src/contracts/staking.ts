import { ContractTemplate } from '../types';

export const staking: ContractTemplate = {
  name: 'Staking Pool',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStaking
 * @dev Basic staking pool contract with rewards
 */
contract SimpleStaking {
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public totalStaked;
    uint256 public rewardRate; // rewards per second per wei staked
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public minimumStake;
    uint256 public lockupPeriod;
    
    address public owner;
    bool public paused;
    
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateChanged(uint256 oldRate, uint256 newRate);
    event Paused();
    event Unpaused();
    
    error OnlyOwner();
    error ContractPaused();
    error InsufficientStake();
    error LockupPeriodNotMet();
    error InsufficientBalance();
    error TransferFailed();
    error NoStake();
    error InvalidAmount();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier notPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            pendingRewards[account] = earned(account);
            stakes[account].rewardDebt = rewardPerTokenStored;
        }
        _;
    }
    
    constructor(
        uint256 _rewardRate,
        uint256 _minimumStake,
        uint256 _lockupPeriod
    ) {
        owner = msg.sender;
        rewardRate = _rewardRate;
        minimumStake = _minimumStake;
        lockupPeriod = _lockupPeriod;
        lastUpdateTime = block.timestamp;
    }
    
    function stake() public payable notPaused updateReward(msg.sender) {
        if (msg.value < minimumStake) revert InsufficientStake();
        
        stakes[msg.sender].amount += msg.value;
        stakes[msg.sender].timestamp = block.timestamp;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public notPaused updateReward(msg.sender) {
        Stake storage userStake = stakes[msg.sender];
        
        if (userStake.amount == 0) revert NoStake();
        if (amount == 0 || amount > userStake.amount) revert InvalidAmount();
        if (block.timestamp < userStake.timestamp + lockupPeriod) revert LockupPeriodNotMet();
        
        userStake.amount -= amount;
        totalStaked -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function claimReward() public notPaused updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            
            // For simplicity, rewards come from contract balance
            // In production, you'd have a separate reward token or funding mechanism
            if (address(this).balance < reward) {
                reward = address(this).balance;
            }
            
            if (reward > 0) {
                (bool success, ) = payable(msg.sender).call{value: reward}("");
                if (!success) revert TransferFailed();
                
                emit RewardClaimed(msg.sender, reward);
            }
        }
    }
    
    function exit() external {
        withdraw(stakes[msg.sender].amount);
        claimReward();
    }
    
    // View functions
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + 
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }
    
    function earned(address account) public view returns (uint256) {
        return ((stakes[account].amount * 
            (rewardPerToken() - stakes[account].rewardDebt)) / 1e18) + 
            pendingRewards[account];
    }
    
    function getStakeInfo(address account) public view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 pendingReward,
        bool canWithdraw
    ) {
        Stake memory userStake = stakes[account];
        return (
            userStake.amount,
            userStake.timestamp,
            earned(account),
            block.timestamp >= userStake.timestamp + lockupPeriod
        );
    }
    
    // Admin functions
    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)) {
        uint256 oldRate = rewardRate;
        rewardRate = newRate;
        emit RewardRateChanged(oldRate, newRate);
    }
    
    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }
    
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
    }
    
    // Allow contract to receive ETH for rewards
    receive() external payable {}
}`,
  formFields: [
    { name: 'rewardRate', type: 'string', label: 'Reward Rate (wei per second per wei staked)', placeholder: '1000000', required: true },
    { name: 'minimumStake', type: 'string', label: 'Minimum Stake (wei)', placeholder: '1000000000000000000', required: true },
    { name: 'lockupPeriod', type: 'number', label: 'Lockup Period (seconds)', placeholder: '86400', required: true }
  ]
}; 
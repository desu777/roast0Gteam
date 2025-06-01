import { ContractTemplate } from '../types';

export const merkleAirdrop: ContractTemplate = {
  name: 'Merkle Airdrop',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MerkleAirdrop
 * @dev Allows one-time token claims based on Merkle proof verification
 */
contract MerkleAirdrop {
    bytes32 public merkleRoot;
    address public owner;
    uint256 public totalClaimed;
    uint256 public claimDeadline;
    bool public airdropEnded;
    
    mapping(address => bool) public hasClaimed;
    
    event Claimed(address indexed claimer, uint256 amount);
    event MerkleRootUpdated(bytes32 newRoot);
    event AirdropEnded();
    event DeadlineExtended(uint256 newDeadline);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    error OnlyOwner();
    error InvalidProof();
    error AlreadyClaimed();
    error AirdropExpired();
    error AirdropAlreadyEnded();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidDeadline();
    error InvalidAmount();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier notExpired() {
        if (block.timestamp > claimDeadline) revert AirdropExpired();
        _;
    }
    
    modifier notEnded() {
        if (airdropEnded) revert AirdropAlreadyEnded();
        _;
    }
    
    constructor(bytes32 _merkleRoot, uint256 _claimPeriodInDays) payable {
        if (_claimPeriodInDays == 0) revert InvalidDeadline();
        if (_merkleRoot == bytes32(0)) revert InvalidDeadline(); // Reusing error for invalid merkle root
        
        merkleRoot = _merkleRoot;
        owner = msg.sender;
        claimDeadline = block.timestamp + (_claimPeriodInDays * 1 days);
    }
    
    function claim(uint256 amount, bytes32[] calldata merkleProof) external notExpired notEnded {
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (amount == 0) revert InvalidAmount();
        
        // Verify the merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        if (!_verifyProof(merkleProof, merkleRoot, leaf)) revert InvalidProof();
        
        if (address(this).balance < amount) revert InsufficientBalance();
        
        hasClaimed[msg.sender] = true;
        totalClaimed += amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit Claimed(msg.sender, amount);
    }
    
    function updateMerkleRoot(bytes32 newRoot) external onlyOwner notEnded {
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }
    
    function extendDeadline(uint256 additionalDays) external onlyOwner notEnded {
        claimDeadline += (additionalDays * 1 days);
        emit DeadlineExtended(claimDeadline);
    }
    
    function endAirdrop() external onlyOwner {
        airdropEnded = true;
        emit AirdropEnded();
    }
    
    function withdrawRemaining() external onlyOwner {
        if (!airdropEnded && block.timestamp <= claimDeadline) {
            revert AirdropAlreadyEnded();
        }
        
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientBalance();
        
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(owner, balance);
    }
    
    function _verifyProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == root;
    }
    
    function getAirdropInfo() external view returns (
        bytes32 _merkleRoot,
        uint256 _claimDeadline,
        uint256 _totalClaimed,
        uint256 _remainingBalance,
        bool _airdropEnded,
        bool _expired,
        uint256 _timeLeft
    ) {
        return (
            merkleRoot,
            claimDeadline,
            totalClaimed,
            address(this).balance,
            airdropEnded,
            block.timestamp > claimDeadline,
            block.timestamp < claimDeadline ? claimDeadline - block.timestamp : 0
        );
    }
    
    // Allow contract to receive additional funds
    receive() external payable {}
}`,
  formFields: [
    { name: 'recipientsList', type: 'textarea', label: 'Recipients List (address,amount per line)', placeholder: '0x742d35Cc6634C0532925a3b8D1F9E71Ed8D9BEE0,1000000000000000000\n0x8ba1f109551bD432803012645Hac136c0532925d,500000000000000000', required: false },
    { name: 'merkleRoot', type: 'string', label: 'Merkle Root (32 bytes)', placeholder: '0x1234...', required: true },
    { name: 'claimPeriodInDays', type: 'number', label: 'Claim Period (days)', placeholder: '90', required: true }
  ]
}; 
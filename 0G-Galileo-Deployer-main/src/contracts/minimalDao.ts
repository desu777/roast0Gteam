import { ContractTemplate } from '../types';

export const minimalDao: ContractTemplate = {
  name: 'Minimal DAO Voting',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MinimalDAO
 * @dev Simple DAO with token-based voting on yes/no proposals
 */
contract MinimalDAO {
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        bool passed;
        mapping(address => bool) hasVoted;
    }
    
    address public owner;
    uint256 public proposalCount;
    uint256 public votingPeriod; // in seconds
    uint256 public quorum; // minimum votes needed
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower; // token balance = voting power
    
    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 power);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event VotingPowerUpdated(address indexed voter, uint256 power);
    event QuorumUpdated(uint256 newQuorum);
    
    error OnlyOwner();
    error ProposalNotActive();
    error AlreadyVoted();
    error ProposalNotEnded();
    error ProposalAlreadyExecuted();
    error InsufficientVotingPower();
    error QuorumNotMet();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(uint256 _votingPeriodInDays, uint256 _quorum) {
        owner = msg.sender;
        votingPeriod = _votingPeriodInDays * 1 days;
        quorum = _quorum;
        
        // Owner gets initial voting power
        votingPower[msg.sender] = 1000000; // 1M voting power
    }
    
    function setVotingPower(address voter, uint256 power) external onlyOwner {
        votingPower[voter] = power;
        emit VotingPowerUpdated(voter, power);
    }
    
    function setQuorum(uint256 newQuorum) external onlyOwner {
        quorum = newQuorum;
        emit QuorumUpdated(newQuorum);
    }
    
    function createProposal(string calldata description) external {
        if (votingPower[msg.sender] == 0) revert InsufficientVotingPower();
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.description = description;
        proposal.deadline = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalId, description, proposal.deadline);
    }
    
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        
        if (block.timestamp > proposal.deadline) revert ProposalNotActive();
        if (proposal.hasVoted[msg.sender]) revert AlreadyVoted();
        if (votingPower[msg.sender] == 0) revert InsufficientVotingPower();
        
        proposal.hasVoted[msg.sender] = true;
        uint256 power = votingPower[msg.sender];
        
        if (support) {
            proposal.yesVotes += power;
        } else {
            proposal.noVotes += power;
        }
        
        emit VoteCast(proposalId, msg.sender, support, power);
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        if (block.timestamp <= proposal.deadline) revert ProposalNotEnded();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
        if (totalVotes < quorum) revert QuorumNotMet();
        
        proposal.executed = true;
        proposal.passed = proposal.yesVotes > proposal.noVotes;
        
        emit ProposalExecuted(proposalId, proposal.passed);
    }
    
    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 deadline,
        bool executed,
        bool passed,
        bool active,
        uint256 totalVotes,
        bool quorumMet
    ) {
        Proposal storage proposal = proposals[proposalId];
        uint256 total = proposal.yesVotes + proposal.noVotes;
        
        return (
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.deadline,
            proposal.executed,
            proposal.passed,
            block.timestamp <= proposal.deadline,
            total,
            total >= quorum
        );
    }
    
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    function getDAOInfo() external view returns (
        uint256 _proposalCount,
        uint256 _votingPeriod,
        uint256 _quorum,
        address _owner,
        uint256 _totalVotingPower
    ) {
        // Note: totalVotingPower would need to be tracked separately in a real implementation
        return (
            proposalCount,
            votingPeriod,
            quorum,
            owner,
            0 // Simplified - would need proper tracking
        );
    }
}`,
  formFields: [
    { name: 'votingPeriodInDays', type: 'number', label: 'Voting Period (days)', placeholder: '7', required: true },
    { name: 'quorum', type: 'number', label: 'Minimum Votes Required (Quorum)', placeholder: '100000', required: true }
  ]
}; 
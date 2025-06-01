import { ContractTemplate } from '../types';

export const multisig: ContractTemplate = {
  name: 'MultiSig Wallet',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleMultiSig
 * @dev Basic multi-signature wallet contract
 */
contract SimpleMultiSig {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }
    
    mapping(address => bool) public isOwner;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    address[] public owners;
    uint256 public required;
    Transaction[] public transactions;
    
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);
    event Submission(uint256 indexed transactionId);
    event Confirmation(address indexed sender, uint256 indexed transactionId);
    event Revocation(address indexed sender, uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);
    event ExecutionFailure(uint256 indexed transactionId);
    event Deposit(address indexed sender, uint256 value);
    
    error OnlyOwner();
    error OwnerExists();
    error OwnerDoesNotExist();
    error TransactionExists();
    error TransactionDoesNotExist();
    error TransactionAlreadyExecuted();
    error TransactionNotConfirmed();
    error TransactionAlreadyConfirmed();
    error InvalidRequirement();
    
    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert OnlyOwner();
        _;
    }
    
    modifier ownerExists(address owner) {
        if (!isOwner[owner]) revert OwnerDoesNotExist();
        _;
    }
    
    modifier transactionExists(uint256 transactionId) {
        if (transactionId >= transactions.length) revert TransactionDoesNotExist();
        _;
    }
    
    modifier notExecuted(uint256 transactionId) {
        if (transactions[transactionId].executed) revert TransactionAlreadyExecuted();
        _;
    }
    
    modifier notConfirmed(uint256 transactionId) {
        if (confirmations[transactionId][msg.sender]) revert TransactionAlreadyConfirmed();
        _;
    }
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0 && _required > 0 && _required <= _owners.length, "Invalid parameters");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0) && !isOwner[owner], "Invalid owner");
            
            isOwner[owner] = true;
            owners.push(owner);
            emit OwnerAdded(owner);
        }
        
        required = _required;
        emit RequirementChanged(_required);
    }
    
    receive() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }
    
    function submitTransaction(address to, uint256 value, bytes memory data) public onlyOwner returns (uint256) {
        uint256 transactionId = transactions.length;
        transactions.push(Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        }));
        
        emit Submission(transactionId);
        confirmTransaction(transactionId);
        return transactionId;
    }
    
    function confirmTransaction(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
        notConfirmed(transactionId) 
    {
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].confirmations++;
        emit Confirmation(msg.sender, transactionId);
        
        executeTransaction(transactionId);
    }
    
    function revokeConfirmation(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
    {
        require(confirmations[transactionId][msg.sender], "Transaction not confirmed");
        
        confirmations[transactionId][msg.sender] = false;
        transactions[transactionId].confirmations--;
        emit Revocation(msg.sender, transactionId);
    }
    
    function executeTransaction(uint256 transactionId) 
        public 
        onlyOwner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
    {
        Transaction storage txn = transactions[transactionId];
        
        if (txn.confirmations >= required) {
            txn.executed = true;
            (bool success, ) = txn.to.call{value: txn.value}(txn.data);
            
            if (success) {
                emit Execution(transactionId);
            } else {
                emit ExecutionFailure(transactionId);
                txn.executed = false;
            }
        }
    }
    
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    function getTransaction(uint256 transactionId) 
        public 
        view 
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 confirmationCount) 
    {
        Transaction storage txn = transactions[transactionId];
        return (txn.to, txn.value, txn.data, txn.executed, txn.confirmations);
    }
    
    function getConfirmationCount(uint256 transactionId) public view returns (uint256) {
        return transactions[transactionId].confirmations;
    }
    
    function isConfirmed(uint256 transactionId) public view returns (bool) {
        return transactions[transactionId].confirmations >= required;
    }
}`,
  formFields: [
    { name: 'owners', type: 'textarea', label: 'Owner Addresses (paste 2 different address, one per line)', placeholder: '0x742d35Cc6129C6532C89396D0EC99E8A0C98C8C7\n0x8ba1f109551bD432803012645Hac136c5C3d56a', required: true },
    { name: 'required', type: 'number', label: 'Required Confirmations', placeholder: '2', required: true }
  ]
}; 
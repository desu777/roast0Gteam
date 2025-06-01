import { ContractTemplate } from '../types';

export const counter: ContractTemplate = {
  name: 'Counter',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Counter
 * @dev Simple counter contract with increment/decrement functionality
 */
contract Counter {
    uint256 private _count;
    address public owner;
    
    event CountChanged(uint256 oldCount, uint256 newCount, address indexed changer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    error OnlyOwner();
    error CounterUnderflow();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(uint256 initialCount) {
        _count = initialCount;
        owner = msg.sender;
        emit CountChanged(0, initialCount, msg.sender);
    }
    
    function count() public view returns (uint256) {
        return _count;
    }
    
    function increment() public {
        uint256 oldCount = _count;
        _count++;
        emit CountChanged(oldCount, _count, msg.sender);
    }
    
    function decrement() public {
        if (_count == 0) revert CounterUnderflow();
        uint256 oldCount = _count;
        _count--;
        emit CountChanged(oldCount, _count, msg.sender);
    }
    
    function reset() public onlyOwner {
        uint256 oldCount = _count;
        _count = 0;
        emit CountChanged(oldCount, 0, msg.sender);
    }
    
    function setCount(uint256 newCount) public onlyOwner {
        uint256 oldCount = _count;
        _count = newCount;
        emit CountChanged(oldCount, newCount, msg.sender);
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}`,
  formFields: [
    { name: 'initialCount', type: 'number', label: 'Initial Count', placeholder: '0', required: true, defaultValue: '0' }
  ]
}; 
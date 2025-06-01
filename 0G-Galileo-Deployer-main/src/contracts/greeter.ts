import { ContractTemplate } from '../types';

export const greeter: ContractTemplate = {
  name: 'Greeter',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Greeter
 * @dev Simple contract that stores and retrieves a greeting message
 */
contract Greeter {
    string private _greeting;
    address public owner;
    
    event GreetingChanged(string oldGreeting, string newGreeting, address indexed changer);
    
    error OnlyOwner();
    error EmptyGreeting();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(string memory initialGreeting) {
        if (bytes(initialGreeting).length == 0) revert EmptyGreeting();
        _greeting = initialGreeting;
        owner = msg.sender;
        emit GreetingChanged("", initialGreeting, msg.sender);
    }
    
    function greet() public view returns (string memory) {
        return _greeting;
    }
    
    function setGreeting(string memory newGreeting) public onlyOwner {
        if (bytes(newGreeting).length == 0) revert EmptyGreeting();
        string memory oldGreeting = _greeting;
        _greeting = newGreeting;
        emit GreetingChanged(oldGreeting, newGreeting, msg.sender);
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        owner = newOwner;
    }
}`,
  formFields: [
    { name: 'initialGreeting', type: 'string', label: 'Initial Greeting', placeholder: 'Hello, World!', required: true }
  ]
}; 
import { ContractTemplate } from '../types';

export const escrow: ContractTemplate = {
  name: 'Escrow',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleEscrow
 * @dev Holds funds until both parties confirm transaction or deadline expires
 */
contract SimpleEscrow {
    address public buyer;
    address public seller;
    uint256 public amount;
    uint256 public deadline;
    bool public buyerConfirmed;
    bool public sellerConfirmed;
    bool public fundsReleased;
    bool public fundsCanceled;
    
    event FundsDeposited(address indexed buyer, uint256 amount);
    event BuyerConfirmed(address indexed buyer);
    event SellerConfirmed(address indexed seller);
    event FundsReleased(address indexed seller, uint256 amount);
    event FundsCanceled(address indexed buyer, uint256 amount);
    event DeadlineExtended(uint256 newDeadline);
    
    error OnlyBuyer();
    error OnlySeller();
    error OnlyParties();
    error FundsAlreadyDeposited();
    error InsufficientFunds();
    error FundsAlreadyHandled();
    error DeadlineNotReached();
    error TransferFailed();
    error InvalidDeadline();
    
    modifier onlyBuyer() {
        if (msg.sender != buyer) revert OnlyBuyer();
        _;
    }
    
    modifier onlySeller() {
        if (msg.sender != seller) revert OnlySeller();
        _;
    }
    
    modifier onlyParties() {
        if (msg.sender != buyer && msg.sender != seller) revert OnlyParties();
        _;
    }
    
    modifier notHandled() {
        if (fundsReleased || fundsCanceled) revert FundsAlreadyHandled();
        _;
    }
    
    constructor(address _seller, uint256 _deadlineInHours) {
        if (_deadlineInHours == 0) revert InvalidDeadline();
        
        buyer = msg.sender;
        seller = _seller;
        deadline = block.timestamp + (_deadlineInHours * 1 hours);
    }
    
    function depositFunds() external payable onlyBuyer {
        if (amount > 0) revert FundsAlreadyDeposited();
        if (msg.value == 0) revert InsufficientFunds();
        
        amount = msg.value;
        emit FundsDeposited(buyer, amount);
    }
    
    function confirmByBuyer() external onlyBuyer notHandled {
        buyerConfirmed = true;
        emit BuyerConfirmed(buyer);
        
        if (sellerConfirmed) {
            _releaseFunds();
        }
    }
    
    function confirmBySeller() external onlySeller notHandled {
        sellerConfirmed = true;
        emit SellerConfirmed(seller);
        
        if (buyerConfirmed) {
            _releaseFunds();
        }
    }
    
    function cancelEscrow() external onlyParties notHandled {
        if (block.timestamp < deadline) revert DeadlineNotReached();
        
        fundsCanceled = true;
        
        if (amount > 0) {
            (bool success, ) = payable(buyer).call{value: amount}("");
            if (!success) revert TransferFailed();
        }
        
        emit FundsCanceled(buyer, amount);
    }
    
    function extendDeadline(uint256 additionalHours) external onlyParties notHandled {
        deadline += (additionalHours * 1 hours);
        emit DeadlineExtended(deadline);
    }
    
    function _releaseFunds() private {
        fundsReleased = true;
        
        if (amount > 0) {
            (bool success, ) = payable(seller).call{value: amount}("");
            if (!success) revert TransferFailed();
        }
        
        emit FundsReleased(seller, amount);
    }
    
    function getStatus() external view returns (
        uint256 _amount,
        uint256 _deadline,
        bool _buyerConfirmed,
        bool _sellerConfirmed,
        bool _fundsReleased,
        bool _fundsCanceled,
        uint256 timeLeft
    ) {
        return (
            amount,
            deadline,
            buyerConfirmed,
            sellerConfirmed,
            fundsReleased,
            fundsCanceled,
            block.timestamp < deadline ? deadline - block.timestamp : 0
        );
    }
}`,
  formFields: [
    { name: 'seller', type: 'string', label: 'Seller Address', placeholder: '0x742d35Cc6129C6532C89396D0EC99E8A0C98C8C7', required: true },
    { name: 'deadlineInHours', type: 'number', label: 'Deadline (hours)', placeholder: '72', required: true }
  ]
}; 
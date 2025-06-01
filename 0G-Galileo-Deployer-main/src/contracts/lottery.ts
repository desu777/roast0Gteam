import { ContractTemplate } from '../types';

export const lottery: ContractTemplate = {
  name: 'Lottery',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleLottery
 * @dev Basic lottery contract with entry fees and random winner selection
 */
contract SimpleLottery {
    address public owner;
    uint256 public ticketPrice;
    uint256 public lotteryEndTime;
    address[] public players;
    address public lastWinner;
    uint256 public lastWinAmount;
    uint256 public lotteryId;
    
    enum LotteryState { Open, Closed, Completed }
    LotteryState public state;
    
    event PlayerEntered(address indexed player, uint256 lotteryId);
    event WinnerSelected(address indexed winner, uint256 amount, uint256 lotteryId);
    event LotteryStarted(uint256 lotteryId, uint256 ticketPrice, uint256 endTime);
    
    error OnlyOwner();
    error LotteryNotOpen();
    error LotteryNotEnded();
    error InsufficientPayment();
    error NoPlayers();
    error TransferFailed();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(uint256 _ticketPrice, uint256 _duration) {
        owner = msg.sender;
        ticketPrice = _ticketPrice;
        lotteryEndTime = block.timestamp + _duration;
        state = LotteryState.Open;
        lotteryId = 1;
        
        emit LotteryStarted(lotteryId, ticketPrice, lotteryEndTime);
    }
    
    function enter() public payable {
        if (state != LotteryState.Open) revert LotteryNotOpen();
        if (block.timestamp >= lotteryEndTime) revert LotteryNotOpen();
        if (msg.value < ticketPrice) revert InsufficientPayment();
        
        players.push(msg.sender);
        emit PlayerEntered(msg.sender, lotteryId);
        
        // Refund excess payment
        if (msg.value > ticketPrice) {
            payable(msg.sender).transfer(msg.value - ticketPrice);
        }
    }
    
    function drawWinner() public onlyOwner {
        if (block.timestamp < lotteryEndTime) revert LotteryNotEnded();
        if (players.length == 0) revert NoPlayers();
        
        state = LotteryState.Closed;
        
        // Simple pseudo-random winner selection (not cryptographically secure)
        uint256 winnerIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            players
        ))) % players.length;
        
        address winner = players[winnerIndex];
        uint256 prize = address(this).balance * 90 / 100; // 90% to winner, 10% to owner
        uint256 ownerFee = address(this).balance - prize;
        
        lastWinner = winner;
        lastWinAmount = prize;
        state = LotteryState.Completed;
        
        // Transfer prize to winner
        (bool successWinner, ) = payable(winner).call{value: prize}("");
        if (!successWinner) revert TransferFailed();
        
        // Transfer fee to owner
        (bool successOwner, ) = payable(owner).call{value: ownerFee}("");
        if (!successOwner) revert TransferFailed();
        
        emit WinnerSelected(winner, prize, lotteryId);
    }
    
    function startNewLottery(uint256 _ticketPrice, uint256 _duration) public onlyOwner {
        require(state == LotteryState.Completed, "Previous lottery not completed");
        
        // Reset lottery
        delete players;
        lotteryId++;
        ticketPrice = _ticketPrice;
        lotteryEndTime = block.timestamp + _duration;
        state = LotteryState.Open;
        
        emit LotteryStarted(lotteryId, ticketPrice, lotteryEndTime);
    }
    
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
    
    function getPlayerCount() public view returns (uint256) {
        return players.length;
    }
    
    function getPrizePool() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getRemainingTime() public view returns (uint256) {
        if (block.timestamp >= lotteryEndTime) return 0;
        return lotteryEndTime - block.timestamp;
    }
}`,
  formFields: [
    { name: 'ticketPrice', type: 'string', label: 'Ticket Price (wei)', placeholder: '100000000000000000', required: true },
    { name: 'duration', type: 'number', label: 'Duration (seconds)', placeholder: '3600', required: true }
  ]
}; 
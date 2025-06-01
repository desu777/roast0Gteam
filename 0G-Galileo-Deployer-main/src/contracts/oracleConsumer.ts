import { ContractTemplate } from '../types';

export const oracleConsumer: ContractTemplate = {
  name: 'Oracle Consumer',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OracleConsumer
 * @dev Fetches and stores price data from external oracles
 */
contract OracleConsumer {
    address public owner;
    address public oracleAddress;
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        string symbol;
        bool isValid;
    }
    
    mapping(string => PriceData) public prices;
    mapping(address => bool) public authorizedUpdaters;
    
    string[] public trackedSymbols;
    uint256 public updateInterval; // seconds
    uint256 public maxPriceAge; // seconds
    
    event PriceUpdated(string indexed symbol, uint256 price, uint256 timestamp);
    event OracleAddressUpdated(address indexed newOracle);
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);
    event SymbolAdded(string symbol);
    event SymbolRemoved(string symbol);
    
    error OnlyOwner();
    error OnlyAuthorizedUpdater();
    error InvalidPrice();
    error PriceDataStale();
    error SymbolNotFound();
    error InvalidInterval();
    error AlreadyTracked();
    error UpdateTooFrequent();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier onlyAuthorizedUpdater() {
        if (!authorizedUpdaters[msg.sender] && msg.sender != owner) revert OnlyAuthorizedUpdater();
        _;
    }
    
    constructor(
        address _oracleAddress,
        uint256 _updateIntervalInMinutes,
        uint256 _maxPriceAgeInHours
    ) {
        owner = msg.sender;
        oracleAddress = _oracleAddress;
        updateInterval = _updateIntervalInMinutes * 60;
        maxPriceAge = _maxPriceAgeInHours * 3600;
        
        // Owner is automatically authorized
        authorizedUpdaters[msg.sender] = true;
    }
    
    function addSymbol(string calldata symbol) external onlyOwner {
        // Check if symbol already exists
        for (uint i = 0; i < trackedSymbols.length; i++) {
            if (keccak256(bytes(trackedSymbols[i])) == keccak256(bytes(symbol))) {
                revert AlreadyTracked();
            }
        }
        
        trackedSymbols.push(symbol);
        
        // Initialize with placeholder data
        prices[symbol] = PriceData({
            price: 0,
            timestamp: 0,
            symbol: symbol,
            isValid: false
        });
        
        emit SymbolAdded(symbol);
    }
    
    function removeSymbol(string calldata symbol) external onlyOwner {
        for (uint i = 0; i < trackedSymbols.length; i++) {
            if (keccak256(bytes(trackedSymbols[i])) == keccak256(bytes(symbol))) {
                // Move last element to current position and pop
                trackedSymbols[i] = trackedSymbols[trackedSymbols.length - 1];
                trackedSymbols.pop();
                
                // Clear price data
                delete prices[symbol];
                
                emit SymbolRemoved(symbol);
                return;
            }
        }
        revert SymbolNotFound();
    }
    
    function updatePrice(string calldata symbol, uint256 price) external onlyAuthorizedUpdater {
        if (price == 0) revert InvalidPrice();
        
        PriceData storage priceData = prices[symbol];
        
        // Check if enough time has passed since last update
        if (block.timestamp < priceData.timestamp + updateInterval) {
            revert UpdateTooFrequent();
        }
        
        priceData.price = price;
        priceData.timestamp = block.timestamp;
        priceData.isValid = true;
        
        emit PriceUpdated(symbol, price, block.timestamp);
    }
    
    function updateMultiplePrices(
        string[] calldata symbols,
        uint256[] calldata priceValues
    ) external onlyAuthorizedUpdater {
        require(symbols.length == priceValues.length, "Arrays length mismatch");
        
        for (uint i = 0; i < symbols.length; i++) {
            if (priceValues[i] > 0) {
                PriceData storage priceData = prices[symbols[i]];
                
                if (block.timestamp >= priceData.timestamp + updateInterval) {
                    priceData.price = priceValues[i];
                    priceData.timestamp = block.timestamp;
                    priceData.isValid = true;
                    
                    emit PriceUpdated(symbols[i], priceValues[i], block.timestamp);
                }
            }
        }
    }
    
    function getPrice(string calldata symbol) external view returns (uint256, uint256, bool) {
        PriceData memory priceData = prices[symbol];
        
        if (!priceData.isValid) {
            return (0, 0, false);
        }
        
        bool isStale = block.timestamp > priceData.timestamp + maxPriceAge;
        
        return (priceData.price, priceData.timestamp, !isStale);
    }
    
    function getLatestPrice(string calldata symbol) external view returns (uint256) {
        PriceData memory priceData = prices[symbol];
        
        if (!priceData.isValid) revert SymbolNotFound();
        if (block.timestamp > priceData.timestamp + maxPriceAge) revert PriceDataStale();
        
        return priceData.price;
    }
    
    function getAllPrices() external view returns (
        string[] memory symbols,
        uint256[] memory priceValues,
        uint256[] memory timestamps,
        bool[] memory validFlags
    ) {
        uint256 length = trackedSymbols.length;
        
        symbols = new string[](length);
        priceValues = new uint256[](length);
        timestamps = new uint256[](length);
        validFlags = new bool[](length);
        
        for (uint i = 0; i < length; i++) {
            string memory symbol = trackedSymbols[i];
            PriceData memory priceData = prices[symbol];
            
            symbols[i] = symbol;
            priceValues[i] = priceData.price;
            timestamps[i] = priceData.timestamp;
            validFlags[i] = priceData.isValid && 
                           (block.timestamp <= priceData.timestamp + maxPriceAge);
        }
        
        return (symbols, priceValues, timestamps, validFlags);
    }
    
    function setOracleAddress(address newOracle) external onlyOwner {
        oracleAddress = newOracle;
        emit OracleAddressUpdated(newOracle);
    }
    
    function setUpdateInterval(uint256 newIntervalInMinutes) external onlyOwner {
        if (newIntervalInMinutes == 0) revert InvalidInterval();
        updateInterval = newIntervalInMinutes * 60;
    }
    
    function setMaxPriceAge(uint256 newMaxAgeInHours) external onlyOwner {
        maxPriceAge = newMaxAgeInHours * 3600;
    }
    
    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }
    
    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterRevoked(updater);
    }
    
    function getTrackedSymbols() external view returns (string[] memory) {
        return trackedSymbols;
    }
    
    function getOracleInfo() external view returns (
        address _oracleAddress,
        uint256 _updateInterval,
        uint256 _maxPriceAge,
        uint256 _trackedSymbolsCount
    ) {
        return (
            oracleAddress,
            updateInterval,
            maxPriceAge,
            trackedSymbols.length
        );
    }
}`,
  formFields: [
    { name: 'oracleAddress', type: 'string', label: 'Oracle Address', placeholder: '0x742d35Cc6129C6532C89396D0EC99E8A0C98C8C7', required: true },
    { name: 'updateIntervalInMinutes', type: 'number', label: 'Update Interval (minutes)', placeholder: '5', required: true },
    { name: 'maxPriceAgeInHours', type: 'number', label: 'Max Price Age (hours)', placeholder: '24', required: true }
  ]
}; 
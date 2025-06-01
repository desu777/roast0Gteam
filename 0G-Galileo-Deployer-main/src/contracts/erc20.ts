import { ContractTemplate } from '../types';

export const erc20: ContractTemplate = {
  name: 'ERC-20 Token',
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleToken
 * @dev ERC20 token implementation without external dependencies
 */
contract SimpleToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public mintingEnabled;
    address public owner;
    
    // EIP-2612 Permit functionality
    mapping(address => uint256) public nonces;
    bytes32 public DOMAIN_SEPARATOR;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MintingEnabled();
    event MintingDisabled();
    event MintPriceChanged(uint256 oldPrice, uint256 newPrice);
    event MaxSupplyChanged(uint256 oldSupply, uint256 newSupply);
    event TokensBurned(address indexed from, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    error OnlyOwner();
    error MintingNotEnabled();
    error MaxSupplyExceeded();
    error InsufficientPayment();
    error InvalidAmount();
    error TransferFailed();
    error InsufficientBalance();
    error InsufficientAllowance();
    error TransferToZeroAddress();
    error ApprovalToZeroAddress();
    error PermitExpired();
    error InvalidSignature();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _initialSupply,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) {
        _name = name_;
        _symbol = symbol_;
        _decimals = 18;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        mintingEnabled = true;
        owner = msg.sender;
        
        require(_maxSupply >= _initialSupply, "Max supply must be >= initial supply");
        
        // Initialize EIP-712 domain separator
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(name_)),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
        
        if (_initialSupply > 0) {
            _mint(msg.sender, _initialSupply);
        }
    }
    
    // ERC-20 Standard Functions
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function decimals() public view returns (uint8) {
        return _decimals;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, allowance(msg.sender, spender) + addedValue);
        return true;
    }
    
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 currentAllowance = allowance(msg.sender, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        _approve(msg.sender, spender, currentAllowance - subtractedValue);
        return true;
    }
    
    // EIP-2612 Permit functionality
    function permit(
        address owner_,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        if (block.timestamp > deadline) revert PermitExpired();
        
        bytes32 structHash = keccak256(abi.encode(
            keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
            owner_,
            spender,
            value,
            nonces[owner_]++,
            deadline
        ));
        
        bytes32 hash = keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, structHash));
        address signer = ecrecover(hash, v, r, s);
        
        if (signer != owner_ || signer == address(0)) revert InvalidSignature();
        
        _approve(owner_, spender, value);
    }
    
    // Custom Functions
    function mint(address to, uint256 amount) public payable {
        if (!mintingEnabled) revert MintingNotEnabled();
        if (amount == 0) revert InvalidAmount();
        if (totalSupply() + amount > maxSupply) revert MaxSupplyExceeded();
        
        uint256 cost = (amount * mintPrice) / 10**decimals();
        if (msg.value < cost) revert InsufficientPayment();
        
        _mint(to, amount);
        
        // Refund excess payment
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            if (!success) revert TransferFailed();
        }
    }
    
    function burn(uint256 amount) public {
        if (amount == 0) revert InvalidAmount();
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) public {
        if (amount == 0) revert InvalidAmount();
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }
    
    // Owner functions
    function enableMinting() external onlyOwner {
        mintingEnabled = true;
        emit MintingEnabled();
    }
    
    function disableMinting() external onlyOwner {
        mintingEnabled = false;
        emit MintingDisabled();
    }
    
    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceChanged(oldPrice, newPrice);
    }
    
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply too low");
        uint256 oldMaxSupply = maxSupply;
        maxSupply = newMaxSupply;
        emit MaxSupplyChanged(oldMaxSupply, newMaxSupply);
    }
    
    function ownerMint(address to, uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (totalSupply() + amount > maxSupply) revert MaxSupplyExceeded();
        _mint(to, amount);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert TransferFailed();
    }
    
    // View functions
    function getMintCost(uint256 amount) external view returns (uint256) {
        return (amount * mintPrice) / 10**decimals();
    }
    
    function getRemainingMintableSupply() external view returns (uint256) {
        return maxSupply - totalSupply();
    }
    
    // Internal Functions
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ERC20: mint to the zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function _burn(address from, uint256 amount) internal {
        require(from != address(0), "ERC20: burn from the zero address");
        
        uint256 accountBalance = _balances[from];
        if (accountBalance < amount) revert InsufficientBalance();
        
        _balances[from] = accountBalance - amount;
        _totalSupply -= amount;
        
        emit Transfer(from, address(0), amount);
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        if (to == address(0)) revert TransferToZeroAddress();
        
        uint256 fromBalance = _balances[from];
        if (fromBalance < amount) revert InsufficientBalance();
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "ERC20: approve from the zero address");
        if (spender == address(0)) revert ApprovalToZeroAddress();
        
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }
    
    function _spendAllowance(address owner_, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner_, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) revert InsufficientAllowance();
            _approve(owner_, spender, currentAllowance - amount);
        }
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}`,
  formFields: [
    { name: 'name', type: 'string', label: 'Token Name', placeholder: 'My Token', required: true },
    { name: 'symbol', type: 'string', label: 'Token Symbol', placeholder: 'MTK', required: true },
    { name: 'initialSupply', type: 'string', label: 'Initial Supply (with decimals)', placeholder: '1000000000000000000000000', required: true },
    { name: 'maxSupply', type: 'string', label: 'Max Supply (with decimals)', placeholder: '10000000000000000000000000', required: true },
    { name: 'mintPrice', type: 'string', label: 'Mint Price (wei per token)', placeholder: '1000000000000000', required: true }
  ]
}; 
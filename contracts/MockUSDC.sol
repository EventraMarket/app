// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

/**
 * @title MockUSDC
 * @notice A mock ERC-20 token that mimics USDC (6 decimals) for testnet use.
 *         Includes a public faucet so any address can mint tokens for testing.
 */
contract MockUSDC {
    // -------------------------------------------------------------------------
    // ERC-20 State
    // -------------------------------------------------------------------------

    string public constant name     = "Mock USDC";
    string public constant symbol   = "mUSDC";
    uint8  public constant decimals = 6;

    uint256 public totalSupply;

    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // -------------------------------------------------------------------------
    // Faucet Config
    // -------------------------------------------------------------------------

    address public owner;

    /// @dev Maximum amount a single faucet call can mint: 10,000 mUSDC
    uint256 public constant FAUCET_LIMIT = 10_000 * 10 ** 6;

    // -------------------------------------------------------------------------
    // Events (ERC-20)
    // -------------------------------------------------------------------------

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner_, address indexed spender, uint256 value);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
        // Mint 1,000,000 mUSDC to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** 6);
    }

    // -------------------------------------------------------------------------
    // ERC-20 Core
    // -------------------------------------------------------------------------

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "MockUSDC: insufficient allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    // -------------------------------------------------------------------------
    // Faucet
    // -------------------------------------------------------------------------

    /**
     * @notice Mint up to FAUCET_LIMIT (10,000 mUSDC) to any address.
     *         Useful for testers who need collateral without the deployer.
     * @param to     Recipient address
     * @param amount Amount in smallest unit (6 decimals). Max 10,000 * 1e6.
     */
    function faucet(address to, uint256 amount) external {
        require(amount <= FAUCET_LIMIT, "MockUSDC: exceeds faucet limit");
        _mint(to, amount);
    }

    // -------------------------------------------------------------------------
    // Owner-only mint (for seeding exchange/liquidity)
    // -------------------------------------------------------------------------

    /**
     * @notice Owner can mint any amount — use this to seed the exchange
     *         or bootstrap liquidity pools.
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "MockUSDC: not owner");
        _mint(to, amount);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0),           "MockUSDC: transfer to zero address");
        require(balanceOf[from] >= amount,  "MockUSDC: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "MockUSDC: mint to zero address");
        totalSupply    += amount;
        balanceOf[to]  += amount;
        emit Transfer(address(0), to, amount);
    }
}

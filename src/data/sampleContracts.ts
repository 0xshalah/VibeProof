import { SampleContractPreset } from '../types';

export const SAMPLE_CONTRACTS: SampleContractPreset[] = [
  {
    id: 'reentrancy-vault',
    title: 'Vulnerable Ether Vault',
    subtitle: 'Classic DAO Reentrancy & tx.origin Flaw',
    badge: 'Critical Flaws (Demo)',
    badgeColor: 'rose',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableEtherVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // CRITICAL: Reentrancy vulnerability!
    // External call before state update allows attacker to drain funds
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");

        // State update after external call!
        balances[msg.sender] -= _amount;
    }

    // HIGH: tx.origin phishing vulnerability
    function emergencyDrain(address payable _to) public {
        require(tx.origin == owner, "Not owner via tx.origin");
        _to.transfer(address(this).balance);
    }
}`,
  },
  {
    id: 'insecure-nft',
    title: 'Insecure Token Registry',
    subtitle: 'Missing Access Control & Unchecked Return',
    badge: 'Warning (Medium Risk)',
    badgeColor: 'amber',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract InsecureTokenRegistry {
    string public name = "Community Token";
    mapping(address => uint256) public balances;
    mapping(address => bool) public isAuthorized;
    address public admin;

    constructor() {
        admin = msg.sender;
        isAuthorized[msg.sender] = true;
    }

    // WARNING: Missing access control! Anyone can authorize themselves
    function setAuthorized(address _user, bool _status) public {
        isAuthorized[_user] = _status;
    }

    function mint(address _to, uint256 _amount) public {
        require(isAuthorized[msg.sender], "Not authorized");
        balances[_to] += _amount;
    }

    // WARNING: Unchecked low-level call return value
    function notifyHook(address _target, bytes memory _data) public {
        _target.call(_data); // Return value ignored
    }
}`,
  },
  {
    id: 'secure-vault',
    title: 'Certified Safe DApp Vault',
    subtitle: 'ReentrancyGuard & Strict Ownable Pattern',
    badge: 'Safe & Verified',
    badgeColor: 'emerald',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertifiedSafeVault
 * @notice Audited smart contract following Checks-Effects-Interactions pattern
 */
contract CertifiedSafeVault {
    address public immutable owner;
    mapping(address => uint256) private _balances;
    bool private _locked;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "AccessControl: caller is not the owner");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit: zero amount");
        _balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(_balances[msg.sender] >= amount, "Withdraw: insufficient balance");

        // Checks-Effects-Interactions: Update state before external call
        _balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdraw: transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    function getBalance(address account) external view returns (uint256) {
        return _balances[account];
    }
}`,
  },
];

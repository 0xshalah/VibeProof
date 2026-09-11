export interface OwaspRule {
  id: string; // e.g. 'SC01:2026'
  code: string;
  name: string;
  severityDefault: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cwe: string;
  description: string;
  remediation: string;
}

export const OWASP_SMART_CONTRACT_TOP_10_2026: OwaspRule[] = [
  {
    id: 'SC01:2026',
    code: 'ACCESS_CONTROL',
    name: 'Access Control Flaws',
    severityDefault: 'CRITICAL',
    cwe: 'CWE-284: Improper Access Control',
    description: 'Missing or faulty authorization checks (such as using tx.origin instead of msg.sender, missing onlyOwner modifiers, or exposed setter functions) allowing arbitrary callers to invoke privileged functions.',
    remediation: 'Enforce strict access controls using OpenZeppelin AccessControl or Ownable; replace tx.origin with msg.sender and implement multi-signature governance for critical administrative state changes.'
  },
  {
    id: 'SC02:2026',
    code: 'BUSINESS_LOGIC',
    name: 'Business Logic Flaws',
    severityDefault: 'HIGH',
    cwe: 'CWE-840: Business Logic Errors',
    description: 'Flaws in the protocol state machine, reward accounting, or token distribution order that deviate from intended business invariants.',
    remediation: 'Formally specify state transition invariants and implement automated property-based testing and state fuzzing.'
  },
  {
    id: 'SC03:2026',
    code: 'ORACLE_MANIPULATION',
    name: 'Price Oracle Manipulation',
    severityDefault: 'CRITICAL',
    cwe: 'CWE-345: Insufficient Verification of Data Authenticity',
    description: 'Relying on instantaneous spot reserves from decentralized AMM liquidity pools which can be distorted within a single transaction.',
    remediation: 'Use decentralized pull/push oracles (e.g., Chainlink, Pyth) or Time-Weighted Average Prices (TWAP) with liquidity safeguards.'
  },
  {
    id: 'SC04:2026',
    code: 'FLASH_LOAN',
    name: 'Flash Loan-Facilitated Attacks',
    severityDefault: 'HIGH',
    cwe: 'CWE-841: Improper Enforcement of Behavioral Workflow',
    description: 'Exploitations utilizing massive borrowed liquidity in a single block to artificially inflate collateral values or trigger liquidation cascades.',
    remediation: 'Implement multi-block delay or TWAP checkpoints before calculating borrow limits or settling reward distributions.'
  },
  {
    id: 'SC05:2026',
    code: 'INPUT_VALIDATION',
    name: 'Lack of Input Validation',
    severityDefault: 'MEDIUM',
    cwe: 'CWE-20: Improper Input Validation',
    description: 'Missing checks for zero addresses (address(0)), zero amounts, empty strings, or mismatched array lengths in batch transfer functions.',
    remediation: 'Add explicit require/custom error guards for address(0), validate bounds, and ensure input array lengths match prior to iteration.'
  },
  {
    id: 'SC06:2026',
    code: 'UNCHECKED_CALLS',
    name: 'Unchecked External Calls',
    severityDefault: 'MEDIUM',
    cwe: 'CWE-252: Unchecked Return Value',
    description: 'Low-level calls (.call(), .delegatecall()) that return a boolean success flag without explicit verification, leading to silent transaction execution failure.',
    remediation: 'Always verify return values: (bool success, ) = target.call{value: ...}(""); require(success, "Call failed"); or use OpenZeppelin Address library.'
  },
  {
    id: 'SC07:2026',
    code: 'ARITHMETIC_PRECISION',
    name: 'Arithmetic Errors & Precision Loss',
    severityDefault: 'MEDIUM',
    cwe: 'CWE-682: Incorrect Calculation',
    description: 'Precision loss occurring when performing division before multiplication or rounding down share allocations to zero.',
    remediation: 'Always multiply before dividing, scale values using appropriate fixed-point multipliers (e.g. 1e18), and handle zero-division edge cases.'
  },
  {
    id: 'SC08:2026',
    code: 'REENTRANCY',
    name: 'Reentrancy Attacks',
    severityDefault: 'CRITICAL',
    cwe: 'CWE-841: Reentrancy Vulnerability',
    description: 'External calls made to recipient addresses prior to updating contract internal accounting variables, enabling repeated recursive withdrawals before state updates.',
    remediation: 'Adhere strictly to the Checks-Effects-Interactions pattern and apply OpenZeppelin ReentrancyGuard nonReentrant modifiers.'
  },
  {
    id: 'SC09:2026',
    code: 'OVERFLOW_UNDERFLOW',
    name: 'Integer Overflow & Underflow',
    severityDefault: 'MEDIUM',
    cwe: 'CWE-190: Integer Overflow',
    description: 'Misuse of unchecked { ... } arithmetic blocks in Solidity >=0.8.0 or lack of SafeMath in legacy Solidity (<0.8.0) contracts.',
    remediation: 'Compile with Solidity ^0.8.20 and restrict unchecked blocks only to loop counters or mathematically proven non-overflowing increments.'
  },
  {
    id: 'SC10:2026',
    code: 'PROXY_UPGRADEABILITY',
    name: 'Proxy & Upgradeability Flaws',
    severityDefault: 'HIGH',
    cwe: 'CWE-665: Improper Initialization',
    description: 'Uninitialized implementation contracts in proxy architectures (UUPS/Transparent) or storage slot collisions between proxy and logic contracts.',
    remediation: 'Call _disableInitializers() in implementation constructors, utilize OpenZeppelin ERC1967 upgradeable templates, and maintain dedicated storage gaps.'
  }
];

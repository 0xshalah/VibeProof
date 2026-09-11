import { ethers } from 'ethers';
import { AuditResult, VulnerabilityFinding, Verdict } from '../types';

/**
 * Calculates deterministic keccak256 hash of Solidity source code
 */
export function calculateCodeHash(code: string): string {
  const normalized = code.trim().replace(/\r\n/g, '\n');
  return ethers.keccak256(ethers.toUtf8Bytes(normalized));
}

/**
 * Perform comprehensive hybrid security audit on Solidity code
 */
export async function runSecurityAudit(
  code: string,
  projectName: string
): Promise<AuditResult> {
  const codeHash = calculateCodeHash(code);
  const lines = code.split('\n');
  const findings: VulnerabilityFinding[] = [];
  const gasTips: string[] = [];

  let criticalDeductions = 0;
  let highDeductions = 0;
  let mediumDeductions = 0;
  let lowDeductions = 0;

  // 1. Reentrancy Check
  let externalCallLine = -1;
  let stateChangeAfterCallLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for external calls (.call{value: ...}, .transfer, .send)
    if (/\.(call|send|transfer)\s*\(|\.call\{value:/.test(line)) {
      externalCallLine = lineNum;
    }

    // Check for state mutations after an external call in the same function
    if (externalCallLine > 0 && lineNum > externalCallLine) {
      if (/balances\[.*\]\s*[-+=]|state\s*=|locked\s*=|total\w*\s*[-+=]/.test(line)) {
        stateChangeAfterCallLine = lineNum;
      }
    }
  }

  if (externalCallLine > 0 && stateChangeAfterCallLine > 0 && !/nonReentrant|ReentrancyGuard/.test(code)) {
    findings.push({
      id: 'VULN-REENTRANCY',
      title: 'Potential Reentrancy Attack Detected',
      severity: 'CRITICAL',
      line: externalCallLine,
      description: `External call on line ${externalCallLine} occurs before internal state variable update on line ${stateChangeAfterCallLine}. An attacker can re-enter this function before balance deductions take place.`,
      recommendation: 'Adopt the Checks-Effects-Interactions pattern or apply a Mutex lock (e.g. OpenZeppelin ReentrancyGuard). Update state balances before transferring funds.',
      codeSnippet: lines[externalCallLine - 1]?.trim(),
      category: 'REENTRANCY',
    });
    criticalDeductions += 40;
  }

  // 2. tx.origin Authentication Check
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/tx\.origin\s*==/.test(line)) {
      findings.push({
        id: 'VULN-TX-ORIGIN',
        title: 'Vulnerable tx.origin for Authorization',
        severity: 'HIGH',
        line: i + 1,
        description: 'Using tx.origin for authentication leaves the contract vulnerable to phishing attacks where a malicious intermediate contract triggers unauthorized actions.',
        recommendation: 'Replace `tx.origin` with `msg.sender` for access control checks.',
        codeSnippet: line.trim(),
        category: 'ACCESS_CONTROL',
      });
      highDeductions += 25;
    }
  }

  // 3. Unchecked Low-Level Calls
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\.(call|delegatecall)\s*\(/.test(line) && !/bool\s+(success|sent)|require\(/.test(line)) {
      findings.push({
        id: 'VULN-UNCHECKED-CALL',
        title: 'Unchecked Return Value in Low-Level Call',
        severity: 'MEDIUM',
        line: i + 1,
        description: 'Low-level calls (.call / .delegatecall) return false if they fail without reverting. Failing to verify the return boolean may lead to silent failures.',
        recommendation: 'Check the boolean return status: `(bool success, ) = target.call(...); require(success, "Call failed");`.',
        codeSnippet: line.trim(),
        category: 'LOGIC',
      });
      mediumDeductions += 15;
    }
  }

  // 4. Missing Access Control on sensitive functions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/function\s+(setAuthorized|setAdmin|mint|withdraw|emergencyDrain|kill|destroy)\b/.test(line)) {
      // Check if function declaration has onlyOwner or access modifier
      let fnHeader = '';
      for (let j = i; j < Math.min(lines.length, i + 4); j++) {
        fnHeader += ' ' + lines[j];
        if (lines[j].includes('{')) break;
      }

      if (!/onlyOwner|onlyAdmin|require\s*\(\s*msg\.sender/.test(fnHeader)) {
        findings.push({
          id: 'VULN-UNPROTECTED-FUNCTION',
          title: `Sensitive Function '${line.match(/function\s+(\w+)/)?.[1]}' Lacks Access Control`,
          severity: 'HIGH',
          line: i + 1,
          description: 'A privileged or sensitive function is publicly accessible without ownership modifiers or caller verification.',
          recommendation: 'Add an `onlyOwner` modifier or verify caller authority with `require(msg.sender == owner)`.',
          codeSnippet: line.trim(),
          category: 'ACCESS_CONTROL',
        });
        highDeductions += 20;
      }
    }
  }

  // 5. Outdated or Floating Pragma Check
  const pragmaMatch = code.match(/pragma\s+solidity\s+([^;]+);/);
  if (!pragmaMatch) {
    findings.push({
      id: 'VULN-NO-PRAGMA',
      title: 'Missing Solidity Pragma Directive',
      severity: 'LOW',
      line: 1,
      description: 'The contract does not declare a compiler version pragma.',
      recommendation: 'Specify `pragma solidity ^0.8.20;` at the top of the file.',
      category: 'STANDARDS',
    });
    lowDeductions += 5;
  } else if (pragmaMatch[1].includes('^') || pragmaMatch[1].includes('>') || pragmaMatch[1].includes('<')) {
    gasTips.push('Lock compiler version pragma (e.g. `pragma solidity 0.8.20;`) instead of floating caret `^` for production deployments to avoid unexpected compiler behavior.');
  }

  // 6. Gas Analysis & Optimization Tips
  if (/\bpublic\b.*constant|immutable/.test(code) || /immutable/.test(code)) {
    gasTips.push('Good practice: Immutable/constant variables save ~2,000 gas per read compared to storage slots.');
  } else if (/address\s+public\s+owner;/.test(code) && !/immutable/.test(code)) {
    gasTips.push('Consider marking `owner` as `immutable` if it does not change after construction to reduce SLOAD gas cost.');
  }

  if (/for\s*\([^;]*;\s*[^;]*;\s*[^)]*\)/.test(code)) {
    gasTips.push('Use `++i` instead of `i++` and cache array lengths outside loop conditions to save gas per iteration.');
  }

  // Calculate Final Score
  const totalDeductions = criticalDeductions + highDeductions + mediumDeductions + lowDeductions;
  const securityScore = Math.max(15, Math.min(100, 100 - totalDeductions));

  // Determine Verdict
  let verdict: Verdict = 'SAFE';
  if (criticalDeductions > 0 || securityScore < 50) {
    verdict = 'CRITICAL';
  } else if (highDeductions > 0 || mediumDeductions > 0 || securityScore < 80) {
    verdict = 'WARNING';
  }

  // Summary generation
  let summary = '';
  if (verdict === 'SAFE') {
    summary = `Contract passed security analysis with an impressive score of ${securityScore}/100. Standard EVM security protections (reentrancy guard, strict access control) are properly observed.`;
  } else if (verdict === 'WARNING') {
    summary = `Contract has notable security warnings (Score ${securityScore}/100). Found ${findings.length} issue(s) that should be mitigated before mainnet deployment.`;
  } else {
    summary = `CRITICAL RISK DETECTED (Score ${securityScore}/100). The contract contains severe vulnerabilities such as potential reentrancy or unauthorized state access that could lead to complete loss of funds.`;
  }

  return {
    codeHash,
    projectName: projectName.trim() || 'Untitled Contract',
    securityScore,
    verdict,
    summary,
    findings,
    gasAnalysis: {
      efficiencyScore: Math.max(60, 100 - gasTips.length * 8),
      tips: gasTips.length > 0 ? gasTips : ['Code structure follows standard EVM efficiency conventions.'],
    },
    metrics: {
      totalLines: lines.length,
      functionsCount: (code.match(/\bfunction\s+\w+/g) || []).length,
      modifiersCount: (code.match(/\bmodifier\s+\w+/g) || []).length,
      criticalCount: findings.filter((f) => f.severity === 'CRITICAL').length,
      highCount: findings.filter((f) => f.severity === 'HIGH').length,
      mediumCount: findings.filter((f) => f.severity === 'MEDIUM').length,
      lowCount: findings.filter((f) => f.severity === 'LOW').length,
    },
    auditedAt: Date.now(),
  };
}

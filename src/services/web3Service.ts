import { ethers } from 'ethers';
import {
  BOT_CHAIN_TESTNET,
  BOT_CHAIN_MAINNET,
  SUPPORTED_NETWORKS,
  VIBEPROOF_ABI,
  VIBEPROOF_CONTRACT_ADDRESSES,
} from '../config/botchain';
import { AuditResult, CertifiedOnChainRecord } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Check if MetaMask or EVM wallet is installed
 */
export function hasEthereumWallet(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

/**
 * Switch or add BOT Chain network to MetaMask
 */
export async function switchToBotChain(isTestnet = true): Promise<boolean> {
  if (!hasEthereumWallet()) {
    throw new Error('No EVM wallet detected. Please install MetaMask to interact with BOT Chain.');
  }

  const target = isTestnet ? BOT_CHAIN_TESTNET : BOT_CHAIN_MAINNET;

  try {
    // Attempt switch
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target.hexChainId }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 means network has not been added yet
    if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: target.hexChainId,
              chainName: target.name,
              nativeCurrency: {
                name: target.symbol,
                symbol: target.symbol,
                decimals: 18,
              },
              rpcUrls: [target.rpcUrl],
              blockExplorerUrls: [target.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add BOT Chain to wallet:', addError);
        throw addError;
      }
    }
    throw switchError;
  }
}

/**
 * Connect wallet and get account details
 */
export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
  botBalance: string;
}> {
  if (!hasEthereumWallet()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to connect.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected.');
  }

  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);

  const balance = await provider.getBalance(accounts[0]);
  const formattedBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);

  return {
    address: accounts[0],
    chainId: currentChainId,
    botBalance: formattedBalance,
  };
}

/**
 * Send transaction to certify audit on BOT Chain
 */
export async function certifyAuditOnChain(
  audit: AuditResult,
  targetChainId = 968
): Promise<CertifiedOnChainRecord> {
  const isTestnet = targetChainId === 968;
  const network = SUPPORTED_NETWORKS[targetChainId] || BOT_CHAIN_TESTNET;

  // If wallet is connected and on BOT Chain, send real transaction
  if (hasEthereumWallet()) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const networkState = await provider.getNetwork();
      const currentChainId = Number(networkState.chainId);

      // Prompt switch if not on chosen BOT Chain
      if (currentChainId !== targetChainId) {
        await switchToBotChain(isTestnet);
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contractAddress = VIBEPROOF_CONTRACT_ADDRESSES[targetChainId];

      const contract = new ethers.Contract(contractAddress, VIBEPROOF_ABI, signer);

      // Call certifyAudit
      const tx = await contract.certifyAudit(
        audit.codeHash,
        audit.projectName,
        audit.securityScore,
        audit.verdict,
        audit.summary
      );

      // Wait for 1 confirmation
      const receipt = await tx.wait(1);

      return {
        codeHash: audit.codeHash,
        projectName: audit.projectName,
        securityScore: audit.securityScore,
        verdict: audit.verdict,
        reportSummary: audit.summary,
        auditorWallet: userAddress,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: receipt.hash || tx.hash,
        chainId: targetChainId,
        blockExplorerUrl: `${network.explorerUrl}/tx/${receipt.hash || tx.hash}`,
      };
    } catch (err: any) {
      console.warn('On-chain execution encountered:', err.message);
      // If user rejected or test contract not yet deployed, fallback gracefully
      throw new Error(err.reason || err.message || 'Transaction could not be completed on BOT Chain.');
    }
  } else {
    throw new Error('No Web3 wallet available. Please install MetaMask.');
  }
}

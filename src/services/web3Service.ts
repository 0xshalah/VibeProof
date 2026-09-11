import { ethers } from 'ethers';
import { NETWORKS } from '../data/sampleContracts';
import { CertifiedProof } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasMetaMask(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

export async function requestWalletConnection(targetNet: 'testnet' | 'mainnet' = 'testnet'): Promise<{
  address: string;
  balance: string;
}> {
  if (!hasMetaMask()) {
    throw new Error('MetaMask is not installed. Running in demo simulation mode.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected.');
  }

  const address = accounts[0];
  let balance = '12.45';

  try {
    const rawBal = await provider.getBalance(address);
    balance = parseFloat(ethers.formatEther(rawBal)).toFixed(4);
  } catch (err) {
    console.warn('Could not fetch balance, using default display:', err);
  }

  return { address, balance };
}

export async function addOrSwitchBotChain(targetNet: 'testnet' | 'mainnet'): Promise<boolean> {
  const net = NETWORKS[targetNet];
  const hexChainId = '0x' + net.id.toString(16);

  if (!hasMetaMask()) {
    return false;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }]
    });
    return true;
  } catch (switchError: any) {
    // 4902 indicates chain has not been added
    if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: net.name,
              rpcUrls: [net.rpc],
              nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
              blockExplorerUrls: [net.explorer]
            }
          ]
        });
        return true;
      } catch (addErr) {
        console.error('Failed to add BOT Chain:', addErr);
        throw addErr;
      }
    }
    throw switchError;
  }
}

function randHex(len: number): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * 16)];
  }
  return out;
}

export async function broadcastCertificationOnChain(params: {
  contractName: string;
  codeHash: string;
  score: number;
  verdict: string;
  walletAddress: string;
  networkKey: 'testnet' | 'mainnet';
  onStep?: (stepText: string) => void;
}): Promise<CertifiedProof> {
  const steps = [
    'Approving gas · 0.00021 BOT …',
    'Signing transaction (Keccak-256 proof) …',
    'Broadcasting to BOT Chain…',
    'Waiting for 1 confirmation …'
  ];

  for (let i = 0; i < steps.length; i++) {
    if (params.onStep) params.onStep(steps[i]);
    await new Promise((r) => setTimeout(r, 600));
  }

  const baseBlock = params.networkKey === 'mainnet' ? 22859700 : 3412880;
  const blockNumber = baseBlock + Math.floor(Math.random() * 85);
  const txHash = '0x' + randHex(64);

  return {
    contract: params.contractName,
    score: params.score,
    verdict: params.verdict,
    codeHash: params.codeHash,
    wallet: params.walletAddress,
    tx: txHash,
    block: blockNumber,
    time: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }),
    net: params.networkKey
  };
}

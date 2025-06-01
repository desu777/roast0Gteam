// Smart Contract Templates for Browser Compilation
// Based on OpenZeppelin Contracts v5.3.0

import { greeter } from './greeter';
import { counter } from './counter';
import { nft721 } from './nft721';
import { lottery } from './lottery';
import { multisig } from './multisig';
import { staking } from './staking';
import { erc20 } from './erc20';

// New contract imports
import { escrow } from './escrow';
import { vestingWallet } from './vestingWallet';
import { timelockVault } from './timelockVault';
import { merkleAirdrop } from './merkleAirdrop';
import { simpleCrowdsale } from './simpleCrowdsale';
import { minimalDao } from './minimalDao';
import { erc4626Vault } from './erc4626Vault';
import { soulboundToken } from './soulboundToken';
import { oracleConsumer } from './oracleConsumer';

export const CONTRACTS = {
  // COMMON CONTRACTS
  greeter,
  counter,

  // RARE CONTRACTS
  nft721,
  lottery,
  escrow,
  vestingWallet,
  timelockVault,

  // EPIC CONTRACTS
  multisig,
  staking,
  merkleAirdrop,
  simpleCrowdsale,

  // LEGENDARY CONTRACTS
  erc20,
  minimalDao,
  erc4626Vault,

  // MYTHIC CONTRACTS
  soulboundToken,
  oracleConsumer
};

// Utility function to get contract by ID
export function getContractById(id: string) {
  return CONTRACTS[id as keyof typeof CONTRACTS];
}

// Get all contract IDs
export function getContractIds() {
  return Object.keys(CONTRACTS);
}

// Validate contract exists
export function isValidContractId(id: string): boolean {
  return id in CONTRACTS;
} 
import { LucideIcon } from 'lucide-react';

export type ContractRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type DeploymentStep = 'slot' | 'configure' | 'deploying' | 'deployed';

export interface ContractType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  rarity: ContractRarity;
  chance: number;
  description: string;
}

export interface RarityColors {
  bg: string;
  border: string;
  glow: string;
  textShadow: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
}

export interface DeploymentStatus {
  success: boolean;
  txHash: string;
  contractAddress: string;
  contract: ContractType;
  timestamp: number;
  error?: string;
}

export interface GameStats {
  totalSpins: number;
  streak: number;
  deployed: DeploymentStatus[];
  comboMultiplier: number;
}

// New types for contract compilation and deployment
export interface ContractFormField {
  name: string;
  type: 'string' | 'number' | 'textarea';
  label: string;
  placeholder: string;
  required: boolean;
  defaultValue?: string;
}

export interface ContractTemplate {
  name: string;
  solidity: string;
  formFields: ContractFormField[];
}

export interface CompiledContract {
  bytecode: string;
  abi: any[];
  contractName: string;
  sources: Record<string, any>;
}

export interface CompilationResult {
  success: boolean;
  bytecode?: string;
  abi?: any[];
  contractName?: string;
  gasEstimate?: number;
  error?: string;
  warnings?: string[];
  compilationTime?: number;
}

export interface DeploymentTransaction {
  to?: string;
  data: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
} 
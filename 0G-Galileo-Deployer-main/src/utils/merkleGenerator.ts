import { log } from './index';

// Interface for airdrop recipient
export interface AirdropRecipient {
  address: string;
  amount: string; // Using string to handle big numbers properly
}

// Interface for generated Merkle Tree data
export interface MerkleTreeData {
  merkleRoot: string;
  leaves: string[];
  recipients: AirdropRecipient[];
  totalAmount: string;
}

/**
 * Simple hash function using crypto.subtle (Web Crypto API)
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encode address and amount like Solidity would: keccak256(abi.encodePacked(address, amount))
 * For browser compatibility, we'll use a simplified version with SHA-256
 */
async function encodeLeaf(address: string, amount: string): Promise<string> {
  // Normalize address (remove 0x if present, ensure lowercase)
  const normalizedAddress = address.toLowerCase().replace('0x', '').padStart(40, '0');
  
  // Convert amount to hex and pad to 64 characters (32 bytes)
  const amountBigInt = BigInt(amount);
  const amountHex = amountBigInt.toString(16).padStart(64, '0');
  
  // Concatenate and hash (mimicking Solidity's abi.encodePacked)
  const packed = normalizedAddress + amountHex;
  return await sha256(packed);
}

/**
 * Build Merkle Tree from leaves
 */
async function buildMerkleTree(leaves: string[]): Promise<string> {
  if (leaves.length === 0) {
    throw new Error('Cannot build Merkle tree from empty leaves array');
  }

  let currentLevel = [...leaves];
  
  // Build tree bottom-up
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    
    // Process pairs
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate if odd
      
      // Sort to ensure deterministic ordering (standard Merkle tree practice)
      const sortedPair = left <= right ? [left, right] : [right, left];
      const combined = sortedPair.join('');
      const parentHash = await sha256(combined);
      nextLevel.push(parentHash);
    }
    
    currentLevel = nextLevel;
  }
  
  return '0x' + currentLevel[0];
}

/**
 * Generate Merkle Root from a list of recipients
 */
export async function generateMerkleTree(recipients: AirdropRecipient[]): Promise<MerkleTreeData> {
  log.info('Generating Merkle Tree for', recipients.length, 'recipients');
  
  if (recipients.length === 0) {
    throw new Error('Recipients list cannot be empty');
  }

  // Validate recipients
  for (const recipient of recipients) {
    if (!recipient.address || !recipient.amount) {
      throw new Error('Each recipient must have address and amount');
    }
    
    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.address)) {
      throw new Error(`Invalid address format: ${recipient.address}`);
    }
    
    // Amount validation
    try {
      const amount = BigInt(recipient.amount);
      if (amount <= 0) {
        throw new Error(`Amount must be positive: ${recipient.amount}`);
      }
    } catch {
      throw new Error(`Invalid amount format: ${recipient.amount}`);
    }
  }

  // Generate leaves by encoding each recipient
  const leaves: string[] = [];
  for (const recipient of recipients) {
    const leaf = await encodeLeaf(recipient.address, recipient.amount);
    leaves.push(leaf);
  }

  // Sort leaves for deterministic tree
  leaves.sort();

  // Build Merkle Tree
  const merkleRoot = await buildMerkleTree(leaves);

  // Calculate total amount
  const totalAmount = recipients.reduce((sum, recipient) => {
    return (BigInt(sum) + BigInt(recipient.amount)).toString();
  }, '0');

  log.info('Merkle Tree generated successfully:', {
    merkleRoot,
    leavesCount: leaves.length,
    totalAmount
  });

  return {
    merkleRoot,
    leaves,
    recipients,
    totalAmount
  };
}

/**
 * Parse CSV/text input into recipients array
 */
export function parseRecipientsInput(input: string): AirdropRecipient[] {
  const lines = input.trim().split('\n');
  const recipients: AirdropRecipient[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Support CSV format: address,amount or address amount
    const parts = line.split(/[,\s]+/);
    if (parts.length !== 2) {
      throw new Error(`Invalid format on line ${i + 1}: "${line}". Expected format: "address,amount"`);
    }
    
    const [address, amount] = parts;
    recipients.push({ address: address.trim(), amount: amount.trim() });
  }
  
  return recipients;
}

/**
 * Generate example recipients for testing
 */
export function generateExampleRecipients(): AirdropRecipient[] {
  return [
    { address: '0x742d35Cc6634C0532925a3b8D1F9E71Ed8D9BEE0', amount: '1000000000000000000' }, // 1 ETH
    { address: '0x8ba1f109551bD432803012645Hac136c0532925d', amount: '500000000000000000' },  // 0.5 ETH
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', amount: '250000000000000000' },  // 0.25 ETH
    { address: '0xA0b86a33E6c2c0a3D9F45b6D8Defc3FC1b6CFE5E', amount: '100000000000000000' },  // 0.1 ETH
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', amount: '750000000000000000' }   // 0.75 ETH
  ];
} 
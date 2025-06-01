// Compilation request structure
export interface CompilationRequest {
  contractId: string;
  contractName: string;
  solidityCode: string;
  formData: Record<string, any>;
}

// Compilation result structure
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

// Contract metadata
export interface ContractMetadata {
  compiler: string;
  language: string;
  output: {
    abi: any[];
    devdoc: any;
    userdoc: any;
  };
  settings: {
    compilationTarget: Record<string, string>;
    evmVersion: string;
    libraries: Record<string, any>;
    metadata: {
      bytecodeHash: string;
    };
    optimizer: {
      enabled: boolean;
      runs: number;
    };
    remappings: string[];
  };
  sources: Record<string, any>;
  version: string;
}

// Solidity compiler output
export interface SolcOutput {
  contracts: Record<string, Record<string, {
    abi: any[];
    metadata: string;
    evm: {
      bytecode: {
        object: string;
        opcodes: string;
        sourceMap: string;
        linkReferences: Record<string, any>;
      };
      deployedBytecode: {
        object: string;
        opcodes: string;
        sourceMap: string;
        linkReferences: Record<string, any>;
      };
      gasEstimates: {
        creation: {
          codeDepositCost: string;
          executionCost: string;
          totalCost: string;
        };
        external: Record<string, string>;
        internal: Record<string, string>;
      };
    };
  }>>;
  errors?: Array<{
    severity: 'error' | 'warning';
    type: string;
    component: string;
    formattedMessage: string;
    message: string;
    sourceLocation?: {
      file: string;
      start: number;
      end: number;
    };
  }>;
  sources: Record<string, {
    id: number;
    ast: any;
  }>;
}

// API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
} 
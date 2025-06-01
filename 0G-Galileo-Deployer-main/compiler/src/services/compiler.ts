import solc from 'solc';
import { CompilationRequest, CompilationResult, SolcOutput } from '../types';
import { logger } from '../utils/logger';

export class SolidityCompiler {
  private readonly solcVersion = '0.8.20';

  /**
   * Compile Solidity contract
   */
  async compile(request: CompilationRequest): Promise<CompilationResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Starting compilation for contract: ${request.contractName}`);
      logger.debug('Compilation request:', {
        contractId: request.contractId,
        contractName: request.contractName,
        formDataKeys: Object.keys(request.formData)
      });

      // Prepare Solidity input
      const input = this.prepareSolcInput(request);
      
      // Compile using solc
      const output = this.compileSolidity(input);
      
      // Process compilation output
      const result = this.processCompilationOutput(output, request.contractName);
      
      const compilationTime = Date.now() - startTime;
      logger.success(`Compilation completed in ${compilationTime}ms`);
      
      return {
        ...result,
        compilationTime
      };

    } catch (error) {
      const compilationTime = Date.now() - startTime;
      logger.error('Compilation failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown compilation error',
        compilationTime
      };
    }
  }

  /**
   * Prepare solc input structure
   */
  private prepareSolcInput(request: CompilationRequest): any {
    return {
      language: 'Solidity',
      sources: {
        [`${request.contractName}.sol`]: {
          content: request.solidityCode
        }
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        viaIR: true,
        evmVersion: 'london',
        outputSelection: {
          '*': {
            '*': [
              'abi',
              'metadata',
              'evm.bytecode',
              'evm.bytecode.object',
              'evm.deployedBytecode',
              'evm.deployedBytecode.object',
              'evm.gasEstimates'
            ]
          }
        }
      }
    };
  }

  /**
   * Execute Solidity compilation
   */
  private compileSolidity(input: any): SolcOutput {
    logger.debug('Executing solc compilation...');
    
    const inputString = JSON.stringify(input);
    const outputString = solc.compile(inputString);
    const output: SolcOutput = JSON.parse(outputString);
    
    logger.debug('Solc compilation completed');
    
    // Log any warnings or errors
    if (output.errors) {
      output.errors.forEach(error => {
        if (error.severity === 'error') {
          logger.error('Solidity error:', error.formattedMessage);
        } else {
          logger.warn('Solidity warning:', error.formattedMessage);
        }
      });
    }
    
    return output;
  }

  /**
   * Process compilation output and extract relevant data
   */
  private processCompilationOutput(output: SolcOutput, contractName: string): CompilationResult {
    // Check for compilation errors
    const errors = output.errors?.filter(error => error.severity === 'error') || [];
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.map(error => error.formattedMessage).join('\n'),
        warnings: output.errors?.filter(error => error.severity === 'warning')
          .map(warning => warning.formattedMessage)
      };
    }

    // Find the main contract in the output
    const contracts = output.contracts;
    const contractFile = Object.keys(contracts)[0];
    
    if (!contractFile || !contracts[contractFile]) {
      return {
        success: false,
        error: 'No contracts found in compilation output'
      };
    }

    // Get the specific contract (usually the first one or by name)
    const contractData = contracts[contractFile][contractName] || 
                        Object.values(contracts[contractFile])[0];

    if (!contractData) {
      return {
        success: false,
        error: `Contract '${contractName}' not found in compilation output`
      };
    }

    // Extract bytecode and ABI
    const bytecode = contractData.evm?.bytecode?.object;
    const abi = contractData.abi;
    
    if (!bytecode) {
      return {
        success: false,
        error: 'No bytecode generated for contract'
      };
    }

    if (!abi) {
      return {
        success: false,
        error: 'No ABI generated for contract'
      };
    }

    // Extract gas estimate
    const gasEstimate = contractData.evm?.gasEstimates?.creation?.totalCost 
      ? parseInt(contractData.evm.gasEstimates.creation.totalCost)
      : undefined;

    // Extract warnings
    const warnings = output.errors?.filter(error => error.severity === 'warning')
      .map(warning => warning.formattedMessage);

    logger.success('Contract compilation successful:', {
      contractName,
      bytecodeLength: bytecode.length,
      abiLength: abi.length,
      gasEstimate,
      warningsCount: warnings?.length || 0
    });

    return {
      success: true,
      bytecode: `0x${bytecode}`,
      abi,
      contractName,
      gasEstimate,
      warnings
    };
  }

  /**
   * Get compiler version info
   */
  getVersion(): string {
    return solc.version();
  }
}

// Singleton instance
export const solidityCompiler = new SolidityCompiler(); 
import { log } from '../utils';
import { CompilationResult } from '../types';

interface CompilationRequest {
  contractId: string;
  contractName: string;
  solidityCode: string;
  formData: Record<string, any>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export class CompilerService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_COMPILER_API_URL || 'http://localhost:3001';
    log.info('Compiler service initialized:', this.baseUrl);
  }

  /**
   * Compile a smart contract
   */
  async compileContract(request: CompilationRequest): Promise<CompilationResult> {
    log.info('Sending compilation request:', {
      contractId: request.contractId,
      contractName: request.contractName
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/compile/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: ApiResponse<CompilationResult> = await response.json();

      if (!response.ok || !result.success) {
        log.error('Compilation failed:', result.error || result.message);
        return {
          success: false,
          error: result.error || result.message || 'Compilation failed'
        };
      }

      log.info('Compilation successful');
      return result.data!;
    } catch (error) {
      log.error('Network error during compilation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Check if compiler service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/compile/health`);
      const result: ApiResponse = await response.json();
      return response.ok && result.success;
    } catch (error) {
      log.warn('Compiler health check failed:', error);
      return false;
    }
  }
}

export const compilerService = new CompilerService(); 
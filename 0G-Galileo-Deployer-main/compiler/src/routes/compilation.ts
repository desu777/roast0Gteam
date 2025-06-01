import { Router, Request, Response } from 'express';
import { solidityCompiler } from '../services/compiler';
import { CompilationRequest, ApiResponse, CompilationResult } from '../types';
import { logger } from '../utils/logger';

export const compilationRouter = Router();

/**
 * GET /api/compile/health
 * Health check for compilation service
 */
compilationRouter.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      service: 'Solidity Compiler',
      version: solidityCompiler.getVersion(),
      status: 'ready'
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(response);
});

/**
 * POST /api/compile/contract
 * Compile a Solidity contract
 */
compilationRouter.post('/contract', async (req: Request, res: Response) => {
  try {
    logger.info('Received compilation request');
    
    // Validate request body
    const validationResult = validateCompilationRequest(req.body);
    if (!validationResult.isValid) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request data',
        message: validationResult.error,
        timestamp: new Date().toISOString()
      };
      
      logger.warn('Invalid compilation request:', validationResult.error);
      return res.status(400).json(response);
    }

    const compilationRequest: CompilationRequest = req.body;
    
    // Log request details (without sensitive data)
    logger.debug('Compilation request details:', {
      contractId: compilationRequest.contractId,
      contractName: compilationRequest.contractName,
      codeLength: compilationRequest.solidityCode.length,
      formDataKeys: Object.keys(compilationRequest.formData)
    });

    // Compile the contract
    const result: CompilationResult = await solidityCompiler.compile(compilationRequest);
    
    if (result.success) {
      const response: ApiResponse<CompilationResult> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
      
      logger.success('Compilation successful for contract:', compilationRequest.contractName);
      return res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: 'Compilation failed',
        message: result.error,
        data: {
          warnings: result.warnings,
          compilationTime: result.compilationTime
        },
        timestamp: new Date().toISOString()
      };
      
      logger.error('Compilation failed for contract:', compilationRequest.contractName, result.error);
      return res.status(400).json(response);
    }

  } catch (error) {
    logger.error('Unexpected error during compilation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
});

/**
 * GET /api/compile/version
 * Get compiler version information
 */
compilationRouter.get('/version', (req: Request, res: Response) => {
  try {
    const version = solidityCompiler.getVersion();
    
    const response: ApiResponse = {
      success: true,
      data: {
        solcVersion: version,
        compilerService: '0G Contract Compiler v1.0.0',
        supportedEvmVersions: ['london', 'berlin', 'istanbul'],
        optimizerEnabled: true
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Error getting version info:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get version information',
      timestamp: new Date().toISOString()
    };
    
    res.status(500).json(response);
  }
});

/**
 * Validate compilation request structure
 */
function validateCompilationRequest(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  if (!body.contractId || typeof body.contractId !== 'string') {
    return { isValid: false, error: 'contractId is required and must be a string' };
  }

  if (!body.contractName || typeof body.contractName !== 'string') {
    return { isValid: false, error: 'contractName is required and must be a string' };
  }

  if (!body.solidityCode || typeof body.solidityCode !== 'string') {
    return { isValid: false, error: 'solidityCode is required and must be a string' };
  }

  if (!body.formData || typeof body.formData !== 'object') {
    return { isValid: false, error: 'formData is required and must be an object' };
  }

  // Basic Solidity code validation
  if (!body.solidityCode.includes('pragma solidity')) {
    return { isValid: false, error: 'solidityCode must contain pragma solidity directive' };
  }

  if (!body.solidityCode.includes('contract ')) {
    return { isValid: false, error: 'solidityCode must contain at least one contract definition' };
  }

  return { isValid: true };
} 
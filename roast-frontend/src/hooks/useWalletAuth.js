import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check if user has valid authentication in localStorage
  const checkStoredAuth = useCallback((walletAddress) => {
    if (!walletAddress) return false;
    
    try {
      const storedAuth = localStorage.getItem(`roast_auth_${walletAddress.toLowerCase()}`);
      if (!storedAuth) return false;
      
      const authData = JSON.parse(storedAuth);
      const now = Date.now();
      const authAge = now - authData.timestamp;
      
      // Check if authentication is less than 23 hours old (safe margin)
      const maxAge = 23 * 60 * 60 * 1000; // 23 hours in milliseconds
      
      if (authAge < maxAge) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🔐 Valid stored authentication found');
        }
        return true;
      } else {
        // Remove expired authentication
        localStorage.removeItem(`roast_auth_${walletAddress.toLowerCase()}`);
        return false;
      }
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.warn('Failed to check stored auth:', error);
      }
      return false;
    }
  }, []);

  // Store successful authentication
  const storeAuth = useCallback((walletAddress) => {
    try {
      const authData = {
        address: walletAddress.toLowerCase(),
        timestamp: Date.now()
      };
      localStorage.setItem(`roast_auth_${walletAddress.toLowerCase()}`, JSON.stringify(authData));
    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.warn('Failed to store auth:', error);
      }
    }
  }, []);

  // Perform wallet signature authentication
  const authenticate = useCallback(async (walletAddress) => {
    if (!walletAddress || !signMessageAsync) {
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Generate authentication message
      const timestamp = Math.floor(Date.now() / 1000); // Backend expects seconds
      const message = `0G Roast Arena authentication\nAddress: ${walletAddress}\nTimestamp: ${timestamp}`;
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔐 Signing authentication message:', message);
      }

      // Sign message with wallet
      const signature = await signMessageAsync({ message });
      
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('✍️ Message signed, verifying with backend...');
      }

      // Verify signature with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/players/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
          signature,
          message,
          timestamp
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const result = await response.json();
      
      if (result.success) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('✅ Authentication successful');
        }
        
        // Store successful authentication
        storeAuth(walletAddress);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(result.message || 'Authentication failed');
      }

    } catch (error) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('❌ Authentication failed:', error);
      }
      setAuthError(error.message);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [signMessageAsync, storeAuth]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (!isConnected || !address) {
      setIsAuthenticated(false);
      setAuthError(null);
      return;
    }

    // Check if we have valid stored authentication
    if (checkStoredAuth(address)) {
      setIsAuthenticated(true);
      return;
    }

    // If no valid stored auth, authenticate automatically
    if (!isAuthenticating) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔐 No valid authentication found, signing message...');
      }
      authenticate(address);
    }
  }, [address, isConnected, authenticate, checkStoredAuth, isAuthenticating]);

  // Manual re-authentication
  const reAuthenticate = useCallback(() => {
    if (address) {
      // Clear stored auth to force re-authentication
      localStorage.removeItem(`roast_auth_${address.toLowerCase()}`);
      authenticate(address);
    }
  }, [address, authenticate]);

  return {
    isAuthenticated,
    isAuthenticating,
    authError,
    reAuthenticate
  };
}; 
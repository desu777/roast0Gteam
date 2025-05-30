import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useBalance, useSignMessage, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { playersApi, treasuryApi } from '../services/api';
import { zgGalileoTestnet } from '../config/wagmi';

// Funkcje do zarządzania sessionStorage
const AUTH_STORAGE_KEY = '0g-roast-auth';

const saveAuthToStorage = (address, token) => {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    address,
    token,
    timestamp: Date.now()
  }));
};

const getAuthFromStorage = () => {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const auth = JSON.parse(stored);
    // Sprawdź czy token nie jest za stary (np. 24h)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - auth.timestamp > maxAge) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    
    return auth;
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export const useWallet = () => {
  const { address, isConnected, chainId } = useAccount();
  const { data: balance } = useBalance({ 
    address, 
    chainId: zgGalileoTestnet.id 
  });
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  
  // Używamy ref do śledzenia czy już próbujemy autentykacji
  const authAttemptRef = useRef(false);

  // Sprawdź czy jesteśmy na właściwym chainie
  const isCorrectChain = chainId === zgGalileoTestnet.id;

  // Funkcja do tworzenia wiadomości do podpisania zgodnie z backendem
  const createAuthMessage = (address, timestamp) => {
    return `0G Roast Arena authentication\nAddress: ${address}\nTimestamp: ${timestamp}`;
  };

  // Załaduj profil użytkownika
  const loadUserProfile = useCallback(async (userAddress) => {
    try {
      const response = await playersApi.getProfile(userAddress);
      setUserProfile(response.data);
    } catch (err) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to load user profile:', err);
      }
      setError('Failed to load user profile');
    }
  }, []);

  // Uwierzytelnienie użytkownika
  const authenticate = useCallback(async () => {
    // Sprawdź czy już próbujemy autentykacji
    if (authAttemptRef.current) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('Authentication already in progress, skipping...');
      }
      return false;
    }

    if (!address || !isConnected || !isCorrectChain || isAuthenticated) {
      return false;
    }

    authAttemptRef.current = true;
    setIsAuthenticating(true);
    setIsLoading(true);
    setError(null);

    try {
      // Najpierw sprawdź sessionStorage
      const storedAuth = getAuthFromStorage();
      if (storedAuth && storedAuth.address === address) {
        setIsAuthenticated(true);
        setAuthToken(storedAuth.token);
        await loadUserProfile(address);
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('✅ Restored authentication from storage');
        }
        return true;
      }

      // Utwórz timestamp (zgodnie z wymaganiami backendu - max 5 minut)
      const timestamp = Math.floor(Date.now() / 1000);
      const message = createAuthMessage(address, timestamp);

      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('🔐 Requesting signature for authentication...');
      }
      // Podpisz wiadomość
      const signature = await signMessageAsync({ message });

      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.log('✅ Signature obtained, verifying with backend...');
      }
      // Wyślij do backendu w celu weryfikacji
      const response = await playersApi.verifySignature({
        address,
        signature,
        message,
        timestamp
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setAuthToken(signature);
        
        // Zapisz do sessionStorage
        saveAuthToStorage(address, signature);
        
        // Pobierz profil użytkownika z odpowiedzi lub załaduj osobno
        if (response.data.player) {
          setUserProfile(response.data.player);
        } else {
          await loadUserProfile(address);
        }
        
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('✅ User authenticated successfully');
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }

    } catch (err) {
      // Ignoruj błąd jeśli użytkownik anulował podpis
      if (err.message?.includes('User rejected') || err.message?.includes('User denied')) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('User cancelled signature request');
        }
      } else {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.error('❌ Authentication error:', err);
        }
        setError(err.message || 'Failed to authenticate wallet');
      }
      setIsAuthenticated(false);
      setAuthToken(null);
      return false;
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
      authAttemptRef.current = false;
    }
  }, [address, isConnected, isCorrectChain, isAuthenticated, signMessageAsync, loadUserProfile]);

  // Pobierz saldo 0G
  const getZGBalance = useCallback(async () => {
    if (!address) return null;
    
    try {
      const response = await treasuryApi.getBalance(address);
      return response.data;
    } catch (err) {
      if (import.meta.env.VITE_TEST_ENV === 'true') {
        console.error('Failed to get 0G balance:', err);
      }
      return null;
    }
  }, [address]);

  // Połącz wallet - uproszczona wersja zgodna z 0G-Galileo-Deployer
  const connectWallet = useCallback(async () => {
    if (openConnectModal) {
      openConnectModal();
    }
  }, [openConnectModal]);

  // Rozłącz wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setIsAuthenticated(false);
    setAuthToken(null);
    setUserProfile(null);
    setError(null);
    clearAuthStorage(); // Wyczyść storage
  }, [disconnect]);

  // Auto-authenticate gdy wallet się połączy
  useEffect(() => {
    if (isConnected && address && isCorrectChain && !isAuthenticated && !authAttemptRef.current) {
      // Dodaj małe opóźnienie aby upewnić się że połączenie jest stabilne
      const timer = setTimeout(() => {
        // Dodatkowe sprawdzenie czy nadal jesteśmy połączeni i nie próbujemy już autentykacji
        if (isConnected && !isAuthenticated && !authAttemptRef.current) {
          authenticate();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isCorrectChain, isAuthenticated]); // Usunięto authenticate z zależności

  // Przywróć autentykację z sessionStorage przy starcie
  useEffect(() => {
    if (isConnected && address && isCorrectChain && !isAuthenticated) {
      const storedAuth = getAuthFromStorage();
      if (storedAuth && storedAuth.address === address) {
        if (import.meta.env.VITE_TEST_ENV === 'true') {
          console.log('🔄 Restoring authentication from sessionStorage...');
        }
        setIsAuthenticated(true);
        setAuthToken(storedAuth.token);
        loadUserProfile(address);
      }
    }
  }, [isConnected, address, isCorrectChain, isAuthenticated, loadUserProfile]);

  // Reset stanu gdy wallet się rozłączy
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
      setAuthToken(null);
      setUserProfile(null);
      setError(null);
      setIsAuthenticating(false);
      authAttemptRef.current = false;
    }
  }, [isConnected]);

  // Reset authAttemptRef gdy zmieni się adres
  useEffect(() => {
    authAttemptRef.current = false;
  }, [address]);

  // Formatuj saldo
  const formatBalance = (balance) => {
    if (!balance) return '0.000';
    return parseFloat(balance.formatted).toFixed(3);
  };

  // Skróć adres
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    // Wallet state
    address,
    isConnected,
    isCorrectChain,
    chainId,
    balance: balance ? formatBalance(balance) : '0.000',
    rawBalance: balance,

    // Auth state
    isAuthenticated,
    authToken,
    userProfile,
    isLoading,
    isAuthenticating,
    error,

    // Actions
    connectWallet,
    disconnectWallet,
    authenticate,
    getZGBalance,
    loadUserProfile,

    // Utils
    formatAddress,
    formatBalance,

    // Chain info
    chainInfo: {
      name: zgGalileoTestnet.name,
      id: zgGalileoTestnet.id,
      symbol: zgGalileoTestnet.nativeCurrency.symbol,
      explorer: zgGalileoTestnet.blockExplorers.default.url,
      rpc: zgGalileoTestnet.rpcUrls.default.http[0]
    }
  };
}; 
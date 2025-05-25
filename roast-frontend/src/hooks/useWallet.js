import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useSignMessage, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { playersApi, treasuryApi } from '../services/api';
import { zgGalileoTestnet } from '../config/wagmi';

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

  // Sprawdź czy jesteśmy na właściwym chainie
  const isCorrectChain = chainId === zgGalileoTestnet.id;

  // Funkcja do tworzenia wiadomości do podpisania zgodnie z backendem
  const createAuthMessage = (address, timestamp) => {
    return `0G Roast Arena authentication\nAddress: ${address}\nTimestamp: ${timestamp}`;
  };

  // Uwierzytelnienie użytkownika - zachowuję pełną logikę komunikacji z backendem
  const authenticate = useCallback(async () => {
    if (!address || !isConnected || !isCorrectChain || isAuthenticating || isAuthenticated) {
      return false;
    }

    setIsAuthenticating(true);
    setIsLoading(true);
    setError(null);

    try {
      // Utwórz timestamp (zgodnie z wymaganiami backendu - max 5 minut)
      const timestamp = Math.floor(Date.now() / 1000);
      const message = createAuthMessage(address, timestamp);

      // Podpisz wiadomość
      const signature = await signMessageAsync({ message });

      // Wyślij do backendu w celu weryfikacji
      const response = await playersApi.verifySignature({
        address,
        signature,
        message,
        timestamp
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setAuthToken(signature); // Używamy podpisu jako tokenu
        
        // Pobierz profil użytkownika z odpowiedzi lub załaduj osobno
        if (response.data.player) {
          setUserProfile(response.data.player);
        } else {
          await loadUserProfile(address);
        }
        
        console.log('User authenticated successfully');
        return true;
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }

    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Failed to authenticate wallet');
      setIsAuthenticated(false);
      setAuthToken(null);
      return false;
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  }, [address, isConnected, isCorrectChain, isAuthenticating, isAuthenticated, signMessageAsync]);

  // Załaduj profil użytkownika
  const loadUserProfile = useCallback(async (userAddress) => {
    try {
      const response = await playersApi.getProfile(userAddress);
      setUserProfile(response.data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // Nie ustawiamy błędu, bo profil może nie istnieć dla nowego użytkownika
    }
  }, []);

  // Pobierz saldo 0G
  const getZGBalance = useCallback(async () => {
    if (!address) return null;
    
    try {
      const response = await treasuryApi.getBalance(address);
      return response.data;
    } catch (err) {
      console.error('Failed to get 0G balance:', err);
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
  }, [disconnect]);

  // Auto-authenticate gdy wallet się połączy
  useEffect(() => {
    if (isConnected && address && isCorrectChain && !isAuthenticated && !isAuthenticating) {
      // Dodaj małe opóźnienie aby upewnić się że połączenie jest stabilne
      const timer = setTimeout(() => {
        authenticate();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, isCorrectChain, isAuthenticated, isAuthenticating, authenticate]);

  // Reset stanu gdy wallet się rozłączy
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
      setAuthToken(null);
      setUserProfile(null);
      setError(null);
      setIsAuthenticating(false);
    }
  }, [isConnected]);

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
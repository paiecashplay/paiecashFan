import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';

const WalletContext = createContext(null);

export function WalletProvider({ children, userId: externalUserId }) {
  const [balance, setBalance] = useState(() => {
    try {
      const raw = localStorage.getItem('pcc_user');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.wallet && saved.wallet.balance !== undefined) {
          return parseFloat(saved.wallet.balance);
        }
        if (saved.balance !== undefined) {
          return parseFloat(saved.balance);
        }
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const getUserId = () => {
    if (externalUserId) return externalUserId;
    try {
      const raw = localStorage.getItem('pcc_user');
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return saved.id || saved.user?.id || null;
    } catch { return null; }
  };

  const fetchBalance = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setLoading(true);
      const data = await api.getBalance(userId);
      setBalance(parseFloat(data.balance || 0));
    } catch (err) {
      console.warn('Balance fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    fetchBalance();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchBalance, 15000);
  }, [fetchBalance]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const refreshBalance = useCallback(() => fetchBalance(), [fetchBalance]);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchBalance();
      startPolling();
    } else {
      stopPolling();
    }
    
    const handleManualSync = () => {
      fetchBalance();
      startPolling();
    };
    window.addEventListener('pcc_sync_wallet', handleManualSync);
    
    return () => {
      stopPolling();
      window.removeEventListener('pcc_sync_wallet', handleManualSync);
    };
  }, [externalUserId, fetchBalance, startPolling, stopPolling]);

  return (
    <WalletContext.Provider value={{ balance, loading, refreshBalance, setBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}

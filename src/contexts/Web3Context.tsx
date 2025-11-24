import React, { createContext, useContext, useState, useEffect } from "react";
import { connectWallet, initializeWeb3 } from "../lib/web3";
import { toast } from "sonner";

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    checkConnection();
    
    // Setup event listeners for account changes
    if (typeof (window as any).ethereum !== "undefined") {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);
    }
    
    return () => {
      // Cleanup event listeners
      if (typeof (window as any).ethereum !== "undefined") {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          await initializeWeb3();
          setAccount(accounts[0]);
          setIsConnected(true);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      } finally {
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnect();
    } else {
      // Account changed
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes as recommended by MetaMask
    window.location.reload();
  };

  const connect = async () => {
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      setIsConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    toast.info("Wallet disconnected");
  };

  return (
    <Web3Context.Provider value={{ account, isConnected, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
import { ethers } from "ethers";
import DeFiBankABI from "../contracts/DeFiBank.json";

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

// Contract address - update after deployment
const CONTRACT_ADDRESS = " 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Localhost default

export const initializeWeb3 = async () => {
  if (typeof (window as any).ethereum !== "undefined") {
    try {
      provider = new ethers.BrowserProvider((window as any).ethereum);
      signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, DeFiBankABI.abi, signer);
      return { provider, signer, contract };
    } catch (error) {
      console.error("Failed to initialize Web3:", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask!");
  }
};

export const connectWallet = async () => {
    if(typeof (window as any).ethereum !== 'undefined') {
        try {
            const accounts = await (window as any).ethereum.request({
                method: 'eth_requestAccounts'
            });
            await initializeWeb3();
            return accounts[0];
        } catch (error) {
            console.error("Error connecting wallet:", error);
            throw error;
        }
    } else {
        throw new Error("Please Install MetaMask!");
    }
}

export const getContract = () => {
    if(!contract) {
        throw new Error("Contract is not initialized. Please call initializeWeb3 first.");
    }
    return contract;
}

export const getProvider = () => {
    if(!provider) {
        throw new Error("Provider is not initialized. Please call initializeWeb3 first.");
    }
    return provider;
}

export const getSigner = () => {
    if(!signer) {
        throw new Error("Signer is not initialized. Please call initializeWeb3 first.");
    }
    return signer;
}

export const formEther = (value:bigint) => ethers.formatEther(value);
export const parseEther = (value:string) => ethers.parseEther(value);


export const checkAccountExists = async () => {
  try {
    const contract = getContract();
    const account = await contract.accounts(await getSigner().getAddress());
    return account.exists;
  } catch (error) {
    return false;
  }
};


// Account Operations

export const createAccount = async () => {
    const contract = getContract();
    const tx = await contract.createAccount();
    await tx.wait();
    return tx;
}

export const deposit = async (amount:string) => {
    const contract = getContract();
    const tx = await contract.deposit({ value: parseEther(amount) });
    await tx.wait();
    return tx;
}


export const withdraw = async (amount:string) => {
    const contract = getContract();
    const tx = await contract.withdraw(parseEther(amount));
    await tx.wait();
    return tx;
}

export const transfer = async(toAddress: string, amount:string) => {
    const contract = getContract();
    const tx = await contract.transfer(toAddress, parseEther(amount));
    await tx.wait();
    return tx;
}


